import { describe, it, expect } from "vitest";
import { estimateShipping } from "./shippingEstimate";

const rates = [
  { carrier: "Mondial Relay", mode: "relais", max_weight_kg: 0.5, price_eur: 4 },
  { carrier: "Mondial Relay", mode: "relais", max_weight_kg: 1, price_eur: 5 },
  { carrier: "Mondial Relay", mode: "relais", max_weight_kg: 2, price_eur: 6 },
  { carrier: "Colissimo", mode: "domicile", max_weight_kg: 1, price_eur: 9 },
  { carrier: "Colissimo", mode: "domicile", max_weight_kg: 2, price_eur: 11 },
];

describe("estimateShipping", () => {
  it("uses the smallest covering bracket per carrier and mode", () => {
    expect(estimateShipping(rates, 1)).toEqual({ min: 5, max: 9 });
  });
  it("ignores brackets that are too light", () => {
    expect(estimateShipping(rates, 2)).toEqual({ min: 6, max: 11 });
  });
  it("returns null when the table is empty", () => {
    expect(estimateShipping([], 1)).toBeNull();
  });
  it("returns null when no rate covers the weight", () => {
    expect(estimateShipping(rates, 5)).toBeNull();
  });
  it("returns null without a weight (old proposals)", () => {
    expect(estimateShipping(rates, null)).toBeNull();
  });
});
