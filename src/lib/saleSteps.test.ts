import { describe, it, expect } from "vitest";
import { computeSaleSteps, isOngoingSale } from "./saleSteps";

describe("computeSaleSteps", () => {
  it("parcours étiquette : 5 étapes, étiquette attendue = étape 2", () => {
    const s = computeSaleSteps({ payment_status: "paye_attente_etiquette" });
    expect(s.keys).toEqual(["payment", "label", "shipping", "reception", "payout"]);
    expect(s.current).toBe(1);
  });
  it("parcours étiquette : étiquette fournie = étape 3 (expédition)", () => {
    expect(computeSaleSteps({ payment_status: "paye_en_attente_reception", label_provided_at: "2026-11-01" }).current).toBe(2);
  });
  it("parcours étiquette : expédié = étape 4, livré = étape 5", () => {
    expect(computeSaleSteps({ payment_status: "expedie", label_provided_at: "x", shipped_at: "y" }).current).toBe(3);
    expect(computeSaleSteps({ payment_status: "livre", label_provided_at: "x", shipped_at: "y", delivered_at: "z" }).current).toBe(4);
  });
  it("parcours étiquette : terminé = tout coché", () => {
    expect(computeSaleSteps({ payment_status: "termine", label_provided_at: "x", shipped_at: "y" }).current).toBe(-1);
  });
  it("ancien parcours : 6 étapes, livraison à choisir = étape 2", () => {
    const s = computeSaleSteps({ payment_status: "paye_en_attente_reception", delivery_type: null });
    expect(s.keys).toHaveLength(6);
    expect(s.current).toBe(1);
  });
  it("ancien parcours : livraison choisie = étape 3", () => {
    expect(computeSaleSteps({ payment_status: "paye_en_attente_reception", delivery_type: "domicile" }).current).toBe(2);
  });
});

describe("isOngoingSale", () => {
  it("payée et non finalisée seulement", () => {
    expect(isOngoingSale({ payment_status: "expedie" })).toBe(true);
    expect(isOngoingSale({ payment_status: "termine" })).toBe(false);
    expect(isOngoingSale({ payment_status: "en_attente_paiement" })).toBe(false);
  });
});
