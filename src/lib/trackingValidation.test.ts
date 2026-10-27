import { describe, expect, it } from "vitest";
import { normalizeTrackingNumber, validateTrackingNumber, isObviousTrackingSequence, trackingIdentity, isOldTrackingEvent, canAutoReleaseShipped, cancellationDays, needsTrackingCheck, DAY } from "./trackingValidation";
import { parseTrackingEvidence } from "../../supabase/functions/_shared/trackingEvidence";

describe("shipping tracking rules", () => {
  it("normalizes uppercase, spaces and hyphens", () => expect(normalizeTrackingNumber(" 1z-ab 23\t45 ")).toBe("1ZAB2345"));
  it("requires UPS 1Z plus 16 alphanumeric characters", () => {
    expect(validateTrackingNumber("1Z999AA10123456784", "UPS")).toBeNull();
    expect(validateTrackingNumber("1Z999AA1012345678", "UPS")).toBe("ups");
    expect(validateTrackingNumber("2Z999AA10123456784", "UPS")).toBe("ups");
  });
  it("requires Mondial Relay 8 to 12 digits", () => {
    for (const n of ["80472619", "804726193527"]) expect(validateTrackingNumber(n, "Mondial Relay")).toBeNull();
    for (const n of ["8047261", "8047261935271", "8047261A"]) expect(validateTrackingNumber(n, "Mondial Relay")).toBe("mondial");
  });
  it.each(["Colissimo", "Chronopost"])("requires %s 10 to 15 alphanumeric characters", carrier => {
    expect(validateTrackingNumber("6A80472619", carrier)).toBeNull();
    expect(validateTrackingNumber("6A8047261935271", carrier)).toBeNull();
    expect(validateTrackingNumber("6A8047261", carrier)).toBe("postal");
    expect(validateTrackingNumber("6A80472619352719", carrier)).toBe("postal");
  });
  it("requires other carriers 8 to 30 alphanumeric characters", () => {
    expect(validateTrackingNumber("AB804726", "GLS")).toBeNull();
    expect(validateTrackingNumber("AB804726".repeat(3) + "ABC123", "GLS")).toBeNull();
    expect(validateTrackingNumber("AB80472", "GLS")).toBe("other");
    expect(validateTrackingNumber("AB804726".repeat(4), "GLS")).toBe("other");
  });
  it("rejects obvious dummy sequences without rejecting embedded digits", () => {
    for (const n of ["123456", "000000", "111111", "AAAAAAAA", "1234567890", "9876543210", "123456123456"]) expect(isObviousTrackingSequence(n)).toBe(true);
    expect(validateTrackingNumber("6A12345678901", "Colissimo")).toBeNull();
  });
  it("identifies normalized same-carrier duplicates but distinguishes carriers", () => {
    expect(trackingIdentity("Mondial-Relay", "8047-2619")).toBe(trackingIdentity("mondial relay", "8047 2619"));
    expect(trackingIdentity("UPS", "AB804726")).not.toBe(trackingIdentity("GLS", "AB804726"));
  });
  it("rejects first events at least one hour before payment", () => {
    expect(isOldTrackingEvent("2026-10-27T16:00:00Z", "2026-10-27T17:00:00Z")).toBe(true);
    expect(isOldTrackingEvent("2026-10-27T16:00:01Z", "2026-10-27T17:00:00Z")).toBe(false);
  });
  it("never releases the 14-day fallback without recognition", () => {
    const now = Date.parse("2026-10-27T17:00:00Z");
    const shipped_at = new Date(now - 14 * DAY).toISOString();
    expect(canAutoReleaseShipped({ shipped_at, tracking_recognized: false }, now)).toBe(false);
    expect(canAutoReleaseShipped({ shipped_at, tracking_recognized: true }, now)).toBe(true);
    expect(canAutoReleaseShipped({ shipped_at: new Date(now - 14 * DAY + 1).toISOString(), tracking_recognized: true }, now)).toBe(false);
    expect(canAutoReleaseShipped({ shipped_at, tracking_recognized: true, dispute_open: true }, now)).toBe(false);
  });
  it("uses cancellation at 7 days unrecognized, 10 days recognized", () => {
    expect(cancellationDays(false)).toBe(7); expect(cancellationDays(true)).toBe(10);
  });
  it("checks at 24h, 48h and then daily", () => {
    const start = Date.parse("2026-10-01T00:00:00Z");
    const r = { shipped_at: new Date(start).toISOString(), tracking_recognized: false, tracking_checked_at: null as string | null };
    expect(needsTrackingCheck(r, start + DAY - 1)).toBe(false);
    expect(needsTrackingCheck(r, start + DAY)).toBe(true);
    r.tracking_checked_at = new Date(start + DAY + 3600000).toISOString();
    expect(needsTrackingCheck(r, start + 2 * DAY)).toBe(true);
    r.tracking_checked_at = new Date(start + 2 * DAY).toISOString();
    expect(needsTrackingCheck(r, start + 3 * DAY - 1)).toBe(false);
    expect(needsTrackingCheck(r, start + 3 * DAY)).toBe(true);
  });
  it("requires actual events, not a delivered status alone", () => {
    expect(parseTrackingEvidence({ latest_status: { status: "Delivered" } }).recognized).toBe(false);
    expect(parseTrackingEvidence({ tracking: { providers: [{ events: [{ time_utc: "2026-10-27T17:00:00Z" }, { time_iso: "2026-10-27T17:00:00+01:00" }] }] } })).toMatchObject({ recognized: true, firstEventAt: "2026-10-27T16:00:00.000Z" });
  });
});