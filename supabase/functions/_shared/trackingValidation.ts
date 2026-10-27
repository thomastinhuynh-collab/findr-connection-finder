export const DAY = 86_400_000;
export function normalizeTrackingNumber(value: string): string {
  return value.toUpperCase().replace(/[\s-]/g, "");
}
export function normalizeCarrier(value: string): string {
  const c = value.trim().toLowerCase().replace(/[\s_-]+/g, " ");
  if (c === "ups") return "ups";
  if (c.includes("mondial")) return "mondial relay";
  if (c.includes("colissimo") || c === "la poste") return "colissimo";
  if (c.includes("chronopost")) return "chronopost";
  return c;
}
export function isObviousTrackingSequence(value: string): boolean {
  const n = normalizeTrackingNumber(value);
  if (/^(.)\1+$/.test(n)) return true;
  // Reject whole numeric ascending/descending runs and repeated dummy runs,
  // not a genuine number that merely contains consecutive digits.
  if (/^\d+$/.test(n)) {
    if ("0123456789012345678901234567890123456789".includes(n) ||
        "9876543210987654321098765432109876543210".includes(n)) return true;
    if (/^(123456|654321|000000|111111)+$/.test(n)) return true;
  }
  return false;
}
export type TrackingError = "required" | "carrier" | "sequence" | "ups" | "mondial" | "postal" | "other" | "duplicate" | "old";
export function validateTrackingNumber(value: string, carrier: string): TrackingError | null {
  const n = normalizeTrackingNumber(value);
  if (!n) return "required";
  if (carrier.trim().length < 2 || carrier.trim().length > 60) return "carrier";
  if (isObviousTrackingSequence(n)) return "sequence";
  const c = normalizeCarrier(carrier);
  if (c === "ups") return /^1Z[A-Z0-9]{16}$/.test(n) ? null : "ups";
  if (c === "mondial relay") return /^\d{8,12}$/.test(n) ? null : "mondial";
  if (["colissimo", "chronopost"].includes(c)) return /^[A-Z0-9]{10,15}$/.test(n) ? null : "postal";
  return /^[A-Z0-9]{8,30}$/.test(n) ? null : "other";
}
export function trackingIdentity(carrier: string, number: string): string {
  return `${normalizeCarrier(carrier)}:${normalizeTrackingNumber(number)}`;
}
export function isOldTrackingEvent(first: string | null, paidAt: string | null): boolean {
  return !!first && !!paidAt && Date.parse(first) <= Date.parse(paidAt) - 3_600_000;
}
export function cancellationDays(recognized: boolean | null | undefined): number {
  return recognized === true ? 10 : 7;
}
export function blocksAutomaticTrackingPayout(r: { tracking_review_notified_at?: string | null; tracking_recognized?: boolean; shipped_at?: string | null; delivered_at?: string | null }): boolean {
  return !!r.tracking_review_notified_at || (!!r.shipped_at && !r.delivered_at && r.tracking_recognized !== true);
}
export function canAutoReleaseShipped(r: { tracking_recognized?: boolean; shipped_at?: string | null; delivered_at?: string | null; dispute_open?: boolean }, now = Date.now()): boolean {
  return r.tracking_recognized === true && !r.dispute_open && !r.delivered_at && !!r.shipped_at && now - Date.parse(r.shipped_at) >= 14 * DAY;
}
export function needsTrackingCheck(r: { tracking_recognized?: boolean; shipped_at: string | null; tracking_checked_at?: string | null; tracking_last_attempt_at?: string | null }, now = Date.now()): boolean {
  if (r.tracking_recognized || !r.shipped_at) return false;
  const shipped = Date.parse(r.shipped_at);
  const age = now - shipped;
  if (age < DAY) return false;
  const last = Date.parse(r.tracking_last_attempt_at ?? r.tracking_checked_at ?? r.shipped_at);
  if (age >= 2 * DAY && last < shipped + 2 * DAY) return true;
  if (age >= DAY && last < shipped + DAY) return true;
  return now - last >= DAY;
}