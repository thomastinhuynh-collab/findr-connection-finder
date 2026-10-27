type RecordValue = Record<string, unknown>;
const record = (v: unknown): RecordValue => v && typeof v === "object" && !Array.isArray(v) ? v as RecordValue : {};
const records = (v: unknown): RecordValue[] => Array.isArray(v) ? v.map(record) : [];
export interface TrackingEvidence { recognized: boolean; firstEventAt: string | null; status: string | null }
export function parseTrackingEvidence(value: unknown): TrackingEvidence {
  const info = record(record(value).track_info ?? value);
  const events = records(record(info.tracking).providers).flatMap(p => records(p.events));
  const latest = record(info.latest_event);
  if (Object.keys(latest).length) events.push(latest);
  const times = events.map(e => e.time_utc ?? e.time_iso).filter((v): v is string =>
    typeof v === "string" && /(?:Z|[+-]\d\d:\d\d)$/.test(v) && Number.isFinite(Date.parse(v)));
  return {
    recognized: events.length > 0,
    firstEventAt: times.length ? new Date(Math.min(...times.map(Date.parse))).toISOString() : null,
    status: typeof record(info.latest_status).status === "string" ? record(info.latest_status).status as string : null,
  };
}