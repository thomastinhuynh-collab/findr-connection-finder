export const PARCEL_WEIGHTS = [0.25, 0.5, 1, 2, 5, 10] as const;
export type ParcelWeight = (typeof PARCEL_WEIGHTS)[number];

export interface ShippingRate {
  carrier: string;
  mode: string;
  max_weight_kg: number;
  price_eur: number;
}

/**
 * For each carrier + mode, keeps the cheapest bracket that covers the parcel
 * weight, then returns the min and max of those prices. Null when no rate applies.
 */
export function estimateShipping(
  rates: ShippingRate[],
  weightKg: number | null | undefined,
): { min: number; max: number } | null {
  if (weightKg == null || !Number.isFinite(Number(weightKg))) return null;
  const w = Number(weightKg);
  const best = new Map<string, number>();
  for (const r of rates) {
    const max = Number(r.max_weight_kg);
    const price = Number(r.price_eur);
    if (!(max >= w) || !Number.isFinite(price)) continue;
    const key = `${r.carrier.trim().toLowerCase()}|${r.mode}`;
    const prev = best.get(key);
    if (prev === undefined || price < prev) best.set(key, price);
  }
  if (best.size === 0) return null;
  const prices = [...best.values()];
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
