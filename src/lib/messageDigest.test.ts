import { afterEach, describe, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";
import { deliverMessageDigest, groupMessageDigest, messageDigestKey, MESSAGE_DIGEST_SEND_ENABLED, type DigestMessage } from "../../supabase/functions/_shared/messageDigest";
import { buildEmail, SITE_URL } from "../../supabase/functions/_shared/emails";
import { sendEmailTo } from "../../supabase/functions/_shared/brevo";

const message = (id: string, receiver = "buyr", sender = "findr", search = "search"): DigestMessage => ({
  id, receiver_id: receiver, sender_id: sender, search_id: search,
  content: "a".repeat(100), created_at: "2026-11-26T10:00:00Z",
  partner_name: "Marc", partner_role: "findr", search_title: "Livre",
});

describe("message digest rules", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
  it("reuses a valid idempotency UUID only for the same message snapshot", async () => {
    vi.stubGlobal("crypto", webcrypto);
    const key = await messageDigestKey(["1", "2"]);
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(await messageDigestKey(["2", "1"])).toBe(key);
    expect(await messageDigestKey(["1", "3"])).not.toBe(key);
  });
  it("acknowledges only an already accepted identical send, never another provider error", async () => {
    vi.stubGlobal("Deno", { env: { get: (name: string) => name === "BREVO_API_KEY" ? "xkeysib-fake-unit-test" : undefined } });
    const request = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ code: "duplicate_parameter", message: "Email for the idempotency key has already been sent" }), { status: 400 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: "invalid_parameter", message: "invalid sender" }), { status: 400 }));
    vi.stubGlobal("fetch", request);
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await sendEmailTo("digest-test@example.invalid", "message_digest", {}, undefined, undefined, "same-snapshot")).toBe(true);
    expect(await sendEmailTo("digest-test@example.invalid", "message_digest", {}, undefined, undefined, "same-snapshot")).toBe(false);
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("groups by search and partner, counts messages and keeps only the last preview", () => {
    const last = { ...message("2"), content: "Last", created_at: "2026-11-26T10:01:00Z" };
    const digest = groupMessageDigest([message("1"), last, message("3", "buyr", "other"), message("4", "buyr", "findr", "other-search")]);
    expect(digest.count).toBe(4);
    expect(digest.exchanges).toHaveLength(3);
    expect(digest.exchanges[0]).toMatchObject({ count: 2, preview: "Last" });
  });
  it("limits to five exchanges, counts hidden exchanges and all messages", () => {
    const digest = groupMessageDigest(Array.from({ length: 7 }, (_, i) => message(`${i}`, "buyr", `findr-${i}`)));
    expect(digest.exchanges).toHaveLength(5);
    expect(digest.otherCount).toBe(2);
    expect(digest.count).toBe(7);
    expect(digest.messageIds).toHaveLength(7);
  });
  it("never includes more than 80 Unicode characters of a message", () => {
    const digest = groupMessageDigest([{ ...message("1"), content: "𐐀".repeat(100) }]);
    expect(Array.from(digest.exchanges[0].preview)).toHaveLength(80);
  });
  it("sends exactly once per recipient and marks only the successfully sent IDs", async () => {
    const send = vi.fn(async (_recipient: string, _digest: ReturnType<typeof groupMessageDigest>) => true); const mark = vi.fn(async () => {});
    await deliverMessageDigest("buyr", { snapshot: async () => [message("1"), message("2")], send, mark }, false);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toBe("buyr");
    expect(mark).toHaveBeenCalledWith(["1", "2"]);
  });
  it("keeps two recipients in separate emails", async () => {
    const send = vi.fn(async (_recipient: string, _digest: ReturnType<typeof groupMessageDigest>) => true);
    for (const recipient of ["buyr", "other-buyr"]) {
      await deliverMessageDigest(recipient, { snapshot: async () => [message(`${recipient}-1`, recipient)], send, mark: async () => {} }, false);
    }
    expect(send.mock.calls.map((call) => call[0])).toEqual(["buyr", "other-buyr"]);
    expect(send.mock.calls[0][1].messageIds).toEqual(["buyr-1"]);
    expect(send.mock.calls[1][1].messageIds).toEqual(["other-buyr-1"]);
  });
  it("does not send if messages were read or the preference was disabled in between", async () => {
    for (const reason of ["read", "preference disabled"]) {
      const snapshot = vi.fn().mockResolvedValueOnce([message("1")]).mockResolvedValueOnce([]);
      const send = vi.fn(); const mark = vi.fn();
      const result = await deliverMessageDigest(reason, { snapshot, send, mark }, false);
      expect(result.sent).toBe(false); expect(send).not.toHaveBeenCalled(); expect(mark).not.toHaveBeenCalled();
    }
  });
  it("recounts a partially read snapshot before sending", async () => {
    const snapshot = vi.fn().mockResolvedValueOnce([message("1"), message("2")]).mockResolvedValueOnce([message("2")]);
    const send = vi.fn(async (_recipient: string, _digest: ReturnType<typeof groupMessageDigest>) => true); const mark = vi.fn(async () => {});
    await deliverMessageDigest("buyr", { snapshot, send, mark }, false);
    expect(send.mock.calls[0][1].count).toBe(1);
    expect(mark).toHaveBeenCalledWith(["2"]);
  });
  it("leaves messages retryable after send failure", async () => {
    const mark = vi.fn();
    const result = await deliverMessageDigest("buyr", { snapshot: async () => [message("1")], send: async () => false, mark }, false);
    expect(result.sent).toBe(false); expect(mark).not.toHaveBeenCalled();
  });
  it("dry-run cannot contact a recipient or update data, and live sends start disabled", async () => {
    const send = vi.fn(); const mark = vi.fn();
    await deliverMessageDigest("buyr", { snapshot: async () => [message("1")], send, mark });
    expect(send).not.toHaveBeenCalled(); expect(mark).not.toHaveBeenCalled();
    expect(MESSAGE_DIGEST_SEND_ENABLED).toBe(false);
  });
  it("email reply and preference links are internal in both languages", () => {
    for (const locale of ["fr", "en"]) {
      const { html } = buildEmail("message_digest", { locale, ...groupMessageDigest([message("1")]) });
      const links = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
      expect(links).toContain(`${SITE_URL}/messagerie`);
      expect(links).toContain(`${SITE_URL}/mon-espace?section=compte#notifications`);
      expect(html).not.toContain("a".repeat(81));
    }
  });
});