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
export interface TrackingEventRow { occurred_at: string; status: string; description: string; location: string | null }
const text = (v: unknown, max: number) => typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "";
/** Événements du transporteur (17TRACK v2), dédoublonnés, du plus récent au plus ancien. */
export function parseTrackingEvents(value: unknown): TrackingEventRow[] {
  const info = record(record(value).track_info ?? value);
  const events = records(record(info.tracking).providers).flatMap(p => records(p.events));
  const latest = record(info.latest_event);
  if (Object.keys(latest).length) events.push(latest);
  const seen = new Set<string>();
  const rows: TrackingEventRow[] = [];
  for (const e of events) {
    const time = e.time_utc ?? e.time_iso;
    if (typeof time !== "string" || !/(?:Z|[+-]\d\d:\d\d)$/.test(time) || !Number.isFinite(Date.parse(time))) continue;
    const status = text(e.stage, 60) || text(e.sub_status, 60);
    const description = text(e.description, 500);
    if (!description && !status) continue;
    const loc = text(e.location, 200) || text(record(e.address).city, 200);
    const row = { occurred_at: new Date(Date.parse(time)).toISOString(), status, description, location: loc || null };
    const key = `${row.occurred_at}|${row.status}|${row.description}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(row);
  }
  return rows.sort((a, b) => Date.parse(b.occurred_at) - Date.parse(a.occurred_at)).slice(0, 200);
}

/** Événement simulé (outil admin « Simuler le premier scan »), marqué comme test. */
export function simulatedTrackingEvent(now: number): TrackingEventRow & { is_test: true } {
  return { occurred_at: new Date(now).toISOString(), status: "InTransit", description: "Colis pris en charge par le transporteur", location: null, is_test: true };
}
