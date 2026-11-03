import { describe, expect, it } from "vitest";
import { awaitsDeliveryChoice, isLabelFlowSale } from "./deliveryChoice";

describe("isLabelFlowSale", () => {
  it("treats a sale waiting for the label as label flow", () => {
    expect(isLabelFlowSale({ payment_status: "paye_attente_etiquette", delivery_type: null })).toBe(true);
  });
  it("treats a sale whose label was rejected as label flow", () => {
    expect(isLabelFlowSale({ payment_status: "etiquette_refusee", delivery_type: null })).toBe(true);
  });
  it("treats a sale to ship with a label provided as label flow", () => {
    expect(isLabelFlowSale({ payment_status: "paye_en_attente_reception", label_provided_at: "2026-11-01T10:00:00Z" })).toBe(true);
  });
  it("treats a sale to ship without a label as old flow", () => {
    expect(isLabelFlowSale({ payment_status: "paye_en_attente_reception", label_provided_at: null })).toBe(false);
  });
});

describe("awaitsDeliveryChoice", () => {
  it("is true for an old-flow sale to ship with no delivery chosen", () => {
    expect(awaitsDeliveryChoice({ payment_status: "paye_en_attente_reception", delivery_type: null, label_provided_at: null })).toBe(true);
  });
  it("is false once the buyr chose a delivery", () => {
    expect(awaitsDeliveryChoice({ payment_status: "paye_en_attente_reception", delivery_type: "domicile" })).toBe(false);
  });
  it("is false while waiting for the label", () => {
    expect(awaitsDeliveryChoice({ payment_status: "paye_attente_etiquette", delivery_type: null })).toBe(false);
  });
  it("is false after a label rejection", () => {
    expect(awaitsDeliveryChoice({ payment_status: "etiquette_refusee", delivery_type: null })).toBe(false);
  });
  it("is false when the label was provided, even without delivery_type", () => {
    expect(awaitsDeliveryChoice({ payment_status: "paye_en_attente_reception", delivery_type: null, label_provided_at: "2026-11-01T10:00:00Z" })).toBe(false);
  });
});
