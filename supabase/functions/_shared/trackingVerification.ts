import { checkTracking } from "./track17.ts";
import { DAY, isOldTrackingEvent, needsTrackingCheck } from "./trackingValidation.ts";
import { putTrackingInReview } from "./trackingReview.ts";

// The existing hourly lifecycle job invokes this; each parcel is queried at
// 24 h, 48 h, then once daily, without adding another polling job.
// deno-lint-ignore no-explicit-any
export async function recheckUnrecognizedTracking(admin: any, now = Date.now()) {
  const { data: rows, error } = await admin.from("reservations")
    .select("id, buyr_id, findr_id, tracking_number, carrier, shipped_at, accepted_at, tracking_recognized, tracking_checked_at, tracking_last_attempt_at, tracking_review_notified_at")
    .in("payment_status", ["paye_en_attente_reception", "expedie", "versement_en_revue"])
    .eq("tracking_recognized", false).not("shipped_at", "is", null);
  if (error) throw error;
  for (const row of rows ?? []) {
    let recognized = false;
    if (row.tracking_number && needsTrackingCheck(row, now)) {
      const { data: claimed, error: claimError } = await admin.from("reservations")
        .update({ tracking_last_attempt_at: new Date(now).toISOString() }).eq("id", row.id)
        .is("tracking_last_attempt_at", row.tracking_last_attempt_at).select("id").maybeSingle();
      if (claimError) throw claimError;
      if (!claimed) continue;
      const evidence = await checkTracking(row.tracking_number, row.carrier ?? "", true);
      if (evidence) {
        const old = isOldTrackingEvent(evidence.firstEventAt, row.accepted_at);
        recognized = evidence.recognized && !old;
        const { error: updateError } = await admin.from("reservations").update({
          tracking_recognized: recognized,
          tracking_first_event_at: evidence.firstEventAt,
          tracking_checked_at: evidence.checkedAt,
        }).eq("id", row.id);
        if (updateError) throw updateError;
        if (old) await putTrackingInReview(admin, row, "old");
      }
    }
    if (!recognized && now - Date.parse(row.shipped_at) >= 3 * DAY) {
      await putTrackingInReview(admin, row);
    }
  }
}