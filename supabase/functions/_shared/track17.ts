import { normalizeTrackingNumber, normalizeCarrier } from "./trackingValidation.ts";

type RecordValue = Record<string, unknown>;
const record = (v: unknown): RecordValue => v && typeof v === "object" && !Array.isArray(v) ? v as RecordValue : {};
const records = (v: unknown): RecordValue[] => Array.isArray(v) ? v.map(record) : [];
export interface TrackingEvidence {
  recognized: boolean;
  firstEventAt: string | null;
  status: string | null;
}
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
// Known v2 carrier keys; unknown carriers retain 17TRACK auto-detection.
const CARRIERS: Record<string, number> = { ups: 100002, colissimo: 6051, chronopost: 100273, "mondial relay": 100304 };
export async function checkTracking(number: string, carrier: string, register = false): Promise<(TrackingEvidence & { checkedAt: string }) | null> {
  const key = Deno.env.get("TRACK17_API_KEY");
  if (!key) return null;
  const carrierId = CARRIERS[normalizeCarrier(carrier)];
  const entry = { number: normalizeTrackingNumber(number), ...(carrierId ? { carrier: carrierId } : {}) };
  const request = async (endpoint: string) => {
    const response = await fetch(`https://api.17track.net/track/v2.2/${endpoint}`, {
      method: "POST", headers: { "17token": key, "Content-Type": "application/json" },
      body: JSON.stringify([entry]), signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error(`17TRACK HTTP ${response.status}`);
    const body = record(await response.json());
    if (body.code !== 0) throw new Error("17TRACK API error");
    return record(body.data);
  };
  try {
    if (register) await request("register");
    const data = await request("gettrackinfo");
    const item = records(data.accepted).find(v => v.number === entry.number && (!carrierId || v.carrier === carrierId));
    if (!item) return null; // Rejected or unavailable is not a completed check.
    return { ...parseTrackingEvidence(item), checkedAt: new Date().toISOString() };
  } catch (error) {
    console.error("17TRACK check unavailable", error instanceof Error ? error.message : "unknown");
    return null;
  }
}