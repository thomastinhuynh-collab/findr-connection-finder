import { describe, expect, it } from "vitest";
import {
  ALREADY_PAID_STATUSES,
  AWAITING_LABEL,
  CANCELLABLE_STATUSES,
  initialPaidStatus,
  loadLabelFlowEnabled,
  labelDeadlineAt,
} from "../../supabase/functions/_shared/paymentStatus";

const PAID_AT = Date.parse("2026-10-28T10:00:00.000Z");

describe("buyr label payment status", () => {
  it("is named paye_attente_etiquette", () => {
    expect(AWAITING_LABEL).toBe("paye_attente_etiquette");
  });

  it("makes a repeated Stripe confirmation idempotent", () => {
    expect(ALREADY_PAID_STATUSES).toContain("paye_attente_etiquette");
  });

  it("stays cancellable and refundable before shipping", () => {
    expect(CANCELLABLE_STATUSES).toContain("paye_attente_etiquette");
  });

  it("sets the label deadline to payment + 3 days when the findr has a ship-from address", () => {
    expect(labelDeadlineAt({ street: "1 rue X", postal_code: "75001", city: "Paris" }, PAID_AT))
      .toBe("2026-10-31T10:00:00.000Z");
  });

  it("leaves the label deadline empty without a ship-from address", () => {
    expect(labelDeadlineAt(null, PAID_AT)).toBeNull();
    expect(labelDeadlineAt({}, PAID_AT)).toBeNull();
  });
});

describe("initial paid status follows app_settings.label_flow_enabled", () => {
  it("starts in the shipping flow when the setting is off", () => {
    expect(initialPaidStatus(false)).toBe("paye_en_attente_reception");
  });
  it("starts in the label flow when the setting is on", () => {
    expect(initialPaidStatus(true)).toBe("paye_attente_etiquette");
  });
  const fake = (result: unknown) => ({
    from: () => ({ select: () => ({ maybeSingle: async () => result }) }),
  });
  it("reads true from the setting", async () => {
    expect(await loadLabelFlowEnabled(fake({ data: { label_flow_enabled: true }, error: null }))).toBe(true);
  });
  it("falls back to off on missing row or error", async () => {
    expect(await loadLabelFlowEnabled(fake({ data: null, error: null }))).toBe(false);
    expect(await loadLabelFlowEnabled(fake({ data: null, error: { message: "x" } }))).toBe(false);
  });
});

describe("etiquette_refusee", () => {
  it("is already paid (webhook idempotence) and cancellable/refundable", () => {
    expect(ALREADY_PAID_STATUSES).toContain("etiquette_refusee");
    expect(CANCELLABLE_STATUSES).toContain("etiquette_refusee");
  });
});
