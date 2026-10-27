import { describe, expect, it } from "vitest";
import { buildEmail, SITE_URL, type EmailType } from "../../supabase/functions/_shared/emails";

describe("transaction email destinations", () => {
  const reservationId = "f23c8b7a-e7a2-4659-942b-7ad2b284ab19";
  for (const type of ["proposal_accepted", "shipped", "delivered", "funds_released", "auto_release", "refund", "dispute_opened", "dispute_received", "dispute_resolved_buyr", "dispute_resolved_findr", "chargeback_opened"] as EmailType[]) {
    it(`${type} links to its reservation instead of a general page or carrier`, () => {
      const { html } = buildEmail(type, { reservationId, carrier: "Colissimo", trackingNumber: "AB123456" });
      const cta = html.match(/<a href="([^"]+)" style="display:inline-block/);
      expect(cta?.[1]).toBe(`${SITE_URL}/transaction/${reservationId}`);
    });
  }
});