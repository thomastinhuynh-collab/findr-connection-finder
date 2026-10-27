import { normalizeTrackingNumber, normalizeCarrier } from "./trackingValidation.ts";
import { parseTrackingEvidence, type TrackingEvidence } from "./trackingEvidence.ts";

type RecordValue = Record<string, unknown>;
const record = (v: unknown): RecordValue => v && typeof v === "object" && !Array.isArray(v) ? v as RecordValue : {};
const records = (v: unknown): RecordValue[] => Array.isArray(v) ? v.map(record) : [];
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