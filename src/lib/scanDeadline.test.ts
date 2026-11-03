import { describe, expect, it } from "vitest";
import {
  SCAN_EXPIRED_BUYR_MESSAGE,
  SCAN_EXPIRED_FINDR_MESSAGE,
  isAwaitingFirstScan,
  planScanDeadline,
  scanCancelUnlockAt,
  scanDeadlineAt,
  scanReminderTitle,
} from "../../supabase/functions/_shared/scanDeadline";
import { formatRemaining } from "../../supabase/functions/_shared/labelDeadline";
import { buildEmail } from "../../supabase/functions/_shared/emails";

const H = 3_600_000;
const D = 24 * H;
const provided = Date.parse("2026-11-01T10:00:00Z");
const row = (o = {}) => ({
  payment_status: "paye_en_attente_reception",
  label_provided_at: new Date(provided).toISOString(),
  shipped_at: null as string | null,
  scan_reminder_2d_at: null as string | null,
  scan_reminder_5d_at: null as string | null,
  ...o,
});

describe("first carrier scan deadline", () => {
  it("applies only to a provided label not yet scanned", () => {
    expect(isAwaitingFirstScan(row())).toBe(true);
    expect(isAwaitingFirstScan(row({ shipped_at: "2026-11-02T10:00:00Z" }))).toBe(false);
    expect(isAwaitingFirstScan(row({ label_provided_at: null }))).toBe(false);
    expect(isAwaitingFirstScan(row({ payment_status: "expedie" }))).toBe(false);
  });
  it("sets the deadline 7 calendar days after the label", () => {
    expect(scanDeadlineAt(row())).toBe(provided + 7 * D);
  });
  it("does nothing before 2 days", () => expect(planScanDeadline(row(), provided + 2 * D - 1)).toBeNull());
  it("sends the 2-day reminder once, with 5 days left", () => {
    const a = planScanDeadline(row(), provided + 2 * D);
    expect(a).toMatchObject({ kind: "reminder", marks: ["scan_reminder_2d_at"], teamAlert: false });
    expect(formatRemaining((a as { remainingMs: number }).remainingMs)).toBe("5 jours");
    expect(planScanDeadline(row({ scan_reminder_2d_at: "x" }), provided + 3 * D)).toBeNull();
  });
  it("sends the 5-day reminder once with the team alert, 2 days left", () => {
    const a = planScanDeadline(row({ scan_reminder_2d_at: "x" }), provided + 5 * D);
    expect(a).toMatchObject({ kind: "reminder", marks: ["scan_reminder_5d_at"], teamAlert: true });
    expect(formatRemaining((a as { remainingMs: number }).remainingMs)).toBe("2 jours");
    expect(planScanDeadline(row({ scan_reminder_2d_at: "x", scan_reminder_5d_at: "x" }), provided + 6 * D)).toBeNull();
  });
  it("sends a single reminder when the 2-day one was missed", () => {
    expect(planScanDeadline(row(), provided + 5 * D + H)).toMatchObject({
      kind: "reminder",
      marks: ["scan_reminder_5d_at", "scan_reminder_2d_at"],
      teamAlert: true,
    });
  });
  it("cancels at 7 days without a scan", () => {
    expect(planScanDeadline(row({ scan_reminder_2d_at: "x", scan_reminder_5d_at: "x" }), provided + 7 * D - 1)).toBeNull();
    expect(planScanDeadline(row({ scan_reminder_2d_at: "x", scan_reminder_5d_at: "x" }), provided + 7 * D)).toEqual({ kind: "expire" });
  });
  it("never cancels once the carrier has scanned the parcel", () => {
    expect(planScanDeadline(row({ shipped_at: new Date(provided + D).toISOString() }), provided + 30 * D)).toBeNull();
  });
  it("opens buyr cancellation 5 days after the label, not after acceptance", () => {
    expect(scanCancelUnlockAt(row())).toBe(provided + 5 * D);
    expect(scanCancelUnlockAt(row({ label_provided_at: null }))).toBeNull();
  });
  it("uses the requested texts", () => {
    expect(scanReminderTitle("2 jours")).toBe("Pense à déposer ton colis : il te reste 2 jours avant l'annulation de la vente");
    expect(SCAN_EXPIRED_BUYR_MESSAGE).toBe("Vente annulée : le colis n'a pas été scanné par le transporteur dans le délai. Tu es intégralement remboursé.");
    expect(SCAN_EXPIRED_FINDR_MESSAGE).toBe("Vente annulée : aucun scan du transporteur dans les 7 jours.");
  });
  it("builds the reminder and cancellation emails", () => {
    const reminder = buildEmail("scan_reminder", { reservationId: "r1", remaining: "5 jours" });
    expect(reminder.subject).toBe("Pense à déposer ton colis : il te reste 5 jours avant l'annulation de la vente");
    expect(reminder.html).toContain("Voir la transaction");
    expect(buildEmail("scan_expired", { reservationId: "r1", audience: "buyr", amount: 52.5 }).html).toContain("52,50 €");
    expect(buildEmail("scan_expired", { reservationId: "r1", audience: "findr" }).html).toContain("aucun scan du transporteur dans les 7 jours.");
  });
});
