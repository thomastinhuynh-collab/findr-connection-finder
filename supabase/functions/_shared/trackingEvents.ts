// Enregistre les événements du transporteur, sans doublon (index unique), écriture serveur seulement.
import type { TrackingEventRow } from "./trackingEvidence.ts";

// deno-lint-ignore no-explicit-any
export async function recordTrackingEvents(admin: any, reservationId: string, events: Array<TrackingEventRow & { is_test?: boolean }> | undefined) {
  if (!events?.length) return;
  const { error } = await admin.from("tracking_events")
    .upsert(events.map(e => ({ ...e, reservation_id: reservationId })), { onConflict: "reservation_id,occurred_at,status,description", ignoreDuplicates: true });
  if (error) console.error("tracking events not recorded for", reservationId, error.message);
}
