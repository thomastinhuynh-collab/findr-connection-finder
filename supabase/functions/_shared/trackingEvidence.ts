type RecordValue = Record<string, unknown>;
const record = (v: unknown): RecordValue => v && typeof v === "object" && !Array.isArray(v) ? v as RecordValue : {};
const records = (v: unknown): RecordValue[] => Array.isArray(v) ? v.map(record) : [];
/** Statuts 17TRACK qui prouvent un premier scan physique (InfoReceived = étiquette créée, ne compte pas). */
export const PHYSICAL_SCAN_STATUSES = ["InTransit", "AvailableForPickup", "OutForDelivery", "Delivered"];
export const isPhysicalScanStatus = (status: unknown) => typeof status === "string" && PHYSICAL_SCAN_STATUSES.includes(status);
export interface TrackingEvidence { recognized: boolean; firstEventAt: string | null; status: string | null }
export function parseTrackingEvidence(value: unknown): TrackingEvidence {
  const info = record(record(value).track_info ?? value);
  const events = records(record(info.tracking).providers).flatMap(p => records(p.events));
  const latest = record(info.latest_event);
  if (Object.keys(latest).length) events.push(latest);
  const times = events.map(e => e.time_utc ?? e.time_iso).filter((v): v is string =>
    typeof v === "string" && /(?:Z|[+-]\d\d:\d\d)$/.test(v) && Number.isFinite(Date.parse(v)));
  return {
    // Reconnu = un premier scan physique est présent (statut courant ou étape d'un événement).
    recognized: isPhysicalScanStatus(record(info.latest_status).status) || events.some(e => isPhysicalScanStatus(e.stage)),
    firstEventAt: times.length ? new Date(Math.min(...times.map(Date.parse))).toISOString() : null,
    status: typeof record(info.latest_status).status === "string" ? record(info.latest_status).status as string : null,
  };
}