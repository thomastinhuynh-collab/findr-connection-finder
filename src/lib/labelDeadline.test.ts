import { describe, expect, it } from "vitest";
import { buyrCanCancelBeforeLabel, formatRemaining, planLabelDeadline } from "../../supabase/functions/_shared/labelDeadline";
import { buildEmail } from "../../supabase/functions/_shared/emails";

const H = 3_600_000;
const paid = Date.parse("2026-10-29T10:00:00Z");
const row = (o = {}) => ({
  payment_status: "paye_attente_etiquette",
  accepted_at: new Date(paid).toISOString(),
  label_deadline_at: new Date(paid + 72 * H).toISOString(),
  label_reminder_24h_at: null as string | null,
  label_reminder_48h_at: null as string | null,
  ...o,
});

describe("label deadline", () => {
  it("does nothing before 24 h", () => expect(planLabelDeadline(row(), paid + 23 * H)).toBeNull());
  it("sends the 24 h reminder once", () => {
    expect(planLabelDeadline(row(), paid + 24 * H)).toMatchObject({ kind: "reminder", marks: ["label_reminder_24h_at"] });
    expect(planLabelDeadline(row({ label_reminder_24h_at: "x" }), paid + 30 * H)).toBeNull();
  });
  it("sends the 48 h reminder with 24 h left", () => {
    const a = planLabelDeadline(row({ label_reminder_24h_at: "x" }), paid + 48 * H);
    expect(a).toMatchObject({ kind: "reminder", marks: ["label_reminder_48h_at"] });
    expect(formatRemaining((a as { remainingMs: number }).remainingMs)).toBe("1 jour");
  });
  it("sends nothing in the hour just after the deadline is opened", () => {
    const openedAt = paid + 40 * H; // délai posé 40 h après le paiement
    const r = row({ label_deadline_at: new Date(openedAt + 72 * H).toISOString() });
    expect(planLabelDeadline(r, openedAt + 30 * 60 * 1000)).toBeNull();
    expect(planLabelDeadline(r, openedAt + 24 * H)).toMatchObject({ kind: "reminder", marks: ["label_reminder_24h_at"] });
  });
  it("counts from the deadline start, not from accepted_at", () => {
    const r = row({ accepted_at: new Date(paid + 47 * H).toISOString() });
    // 1 h après le paiement seulement, mais 48 h après l'ouverture du délai : les deux rappels partent.
    expect(planLabelDeadline(r, paid + 48 * H)).toMatchObject({
      kind: "reminder",
      marks: ["label_reminder_48h_at", "label_reminder_24h_at"],
    });
  });
  it("does not need accepted_at", () => {
    expect(planLabelDeadline(row({ accepted_at: null }), paid + 24 * H)).toMatchObject({
      kind: "reminder",
      marks: ["label_reminder_24h_at"],
    });
  });
  it("cancels once the deadline has passed", () => {
    expect(planLabelDeadline(row({ label_reminder_24h_at: "x", label_reminder_48h_at: "x" }), paid + 72 * H)).toEqual({ kind: "expire" });
  });
  it("cancels a rejected label past its deadline, even after a second rejection", () => {
    const r = row({ payment_status: "etiquette_refusee", label_deadline_at: new Date(paid + 100 * H).toISOString() });
    expect(planLabelDeadline(r, paid + 99 * H)).toBeNull();
    expect(planLabelDeadline(r, paid + 100 * H)).toEqual({ kind: "expire" });
  });
  it("ignores other statuses and missing deadlines", () => {
    expect(planLabelDeadline(row({ payment_status: "annule" }), paid + 99 * H)).toBeNull();
    expect(planLabelDeadline(row({ label_deadline_at: null }), paid + 99 * H)).toBeNull();
  });
  it("formats the remaining time", () => {
    expect(formatRemaining(48 * H)).toBe("2 jours");
    expect(formatRemaining(27 * H)).toBe("1 jour et 3 h");
    expect(formatRemaining(5 * H)).toBe("5 h");
  });
  it("lets the buyr cancel before providing the label only", () => {
    expect(buyrCanCancelBeforeLabel("paye_attente_etiquette")).toBe(true);
    expect(buyrCanCancelBeforeLabel("etiquette_refusee")).toBe(true);
    expect(buyrCanCancelBeforeLabel("paye_en_attente_reception")).toBe(false);
  });
  it("builds the reminder and expiry emails", () => {
    expect(buildEmail("label_reminder", { reservationId: "r1", remaining: "2 jours" }).subject).toBe("Il te reste 2 jours pour fournir l'étiquette");
    const { html } = buildEmail("label_expired", { reservationId: "r1", audience: "findr" });
    expect(html).toContain("Tu n'as rien à faire côté envoi.");
    expect(html).toContain("Voir la transaction");
  });
});
