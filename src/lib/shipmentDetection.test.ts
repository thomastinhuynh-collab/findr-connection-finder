import { describe, expect, it } from "vitest";
import { parseTrackingEvidence } from "../../supabase/functions/_shared/trackingEvidence";
import { planShipmentDetection } from "../../supabase/functions/_shared/shipmentRules";
import { receiptConfirmationError } from "../../supabase/functions/_shared/paymentStatus";

const ev = (status: string, stage = status) => ({
  ...parseTrackingEvidence({
    latest_status: { status },
    tracking: { providers: [{ events: [{ time_utc: "2026-10-29T08:00:00Z", stage }] }] },
  }),
  checkedAt: "2026-10-29T09:00:00.000Z",
});
const awaiting = { payment_status: "paye_en_attente_reception", label_provided_at: "2026-10-28T10:00:00Z", shipped_at: null };
const NOW = Date.parse("2026-10-29T09:00:00.000Z");

describe("physical scan recognition", () => {
  it("InfoReceived or NotFound alone is not a physical scan", () => {
    expect(ev("InfoReceived").recognized).toBe(false);
    expect(ev("NotFound").recognized).toBe(false);
  });
  it("InTransit, AvailableForPickup, OutForDelivery and Delivered are physical scans", () => {
    for (const s of ["InTransit", "AvailableForPickup", "OutForDelivery", "Delivered"]) expect(ev(s).recognized).toBe(true);
  });
});

describe("shipment detection (label flow)", () => {
  it("InfoReceived alone triggers nothing", () => {
    expect(planShipmentDetection(awaiting, ev("InfoReceived"), false, NOW)).toBeNull();
  });
  it("a physical scan moves the sale to expedie with shipped_at and tracking evidence", () => {
    expect(planShipmentDetection(awaiting, ev("InTransit"), false, NOW)).toEqual({
      payment_status: "expedie",
      shipped_at: "2026-10-29T09:00:00.000Z",
      tracking_recognized: true,
      tracking_first_event_at: "2026-10-29T08:00:00.000Z",
      tracking_checked_at: "2026-10-29T09:00:00.000Z",
      tracking_status: "En transit",
    });
  });
  it("ignores sales without a label, already shipped, or with an old event", () => {
    expect(planShipmentDetection({ ...awaiting, label_provided_at: null }, ev("InTransit"), false, NOW)).toBeNull();
    expect(planShipmentDetection({ ...awaiting, shipped_at: "2026-10-28T12:00:00Z" }, ev("InTransit"), false, NOW)).toBeNull();
    expect(planShipmentDetection(awaiting, ev("InTransit"), true, NOW)).toBeNull();
    expect(planShipmentDetection(awaiting, null, false, NOW)).toBeNull();
  });
});

describe("receipt confirmation", () => {
  it("is refused before expedie", () => {
    for (const s of ["paye_attente_etiquette", "etiquette_refusee", "paye_en_attente_reception"]) {
      expect(receiptConfirmationError(s)).toBe("L'objet n'a pas encore été expédié");
    }
  });
  it("is accepted from expedie or livre", () => {
    expect(receiptConfirmationError("expedie")).toBeNull();
    expect(receiptConfirmationError("livre")).toBeNull();
  });
});
