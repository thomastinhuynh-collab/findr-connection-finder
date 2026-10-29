import { describe, expect, it } from "vitest";
import { buildEmail, SITE_URL, type EmailType } from "../../supabase/functions/_shared/emails";

describe("transaction email destinations", () => {
  const reservationId = "f23c8b7a-e7a2-4659-942b-7ad2b284ab19";
  for (const type of ["proposal_accepted", "shipped", "tracking_review", "label_ready", "delivered", "funds_released", "auto_release", "refund", "dispute_opened", "dispute_received", "dispute_resolved_buyr", "dispute_resolved_findr", "chargeback_opened"] as EmailType[]) {
    it(`${type} links to its reservation instead of a general page or carrier`, () => {
      const { html } = buildEmail(type, { reservationId, carrier: "Colissimo", trackingNumber: "AB123456" });
      const cta = html.match(/<a href="([^"]+)" style="display:inline-block/);
      expect(cta?.[1]).toBe(`${SITE_URL}/transaction/${reservationId}`);
    });
  }
});
describe("label_ready email to the findr", () => {
  const base = { audience: "findr", reservationId: "f23c8b7a-e7a2-4659-942b-7ad2b284ab19", buyrFirstName: "Olga" };
  it("names the buyr in the subject and warns about the carrier logo", () => {
    const { subject, html } = buildEmail("label_ready", { ...base, labelAttached: true });
    expect(subject).toBe("Olga t'a envoyé l'étiquette d'expédition");
    expect(html).toContain("vérifie qu'elle porte bien le logo du transporteur avant de l'imprimer");
    expect(html).toContain("Voir la transaction");
    expect(html).not.toContain("disponible sur ta page de transaction");
  });
  it("points to the transaction page when the label is not attached", () => {
    const { html } = buildEmail("label_ready", { ...base, labelAttached: false });
    expect(html).toContain("Ton étiquette est disponible sur ta page de transaction");
  });
  it("keeps the buyr version unchanged", () => {
    expect(buildEmail("label_ready", { reservationId: base.reservationId }).subject).toBe("Tu peux créer l'étiquette d'envoi");
  });
});
describe("shipment_detected email to the findr", () => {
  const reservationId = "f23c8b7a-e7a2-4659-942b-7ad2b284ab19";
  it("names the buyr when the first name is known", () => {
    const { html } = buildEmail("shipment_detected", { reservationId, buyrFirstName: "Olga" });
    expect(html).toContain("il est en route vers Olga.");
    expect(html).not.toContain("il est en route vers le buyr.");
  });
  it("falls back to « le buyr » when the first name is unknown", () => {
    expect(buildEmail("shipment_detected", { reservationId }).html).toContain("il est en route vers le buyr.");
    expect(buildEmail("shipment_detected", { reservationId, buyrFirstName: "   " }).html).toContain("il est en route vers le buyr.");
  });
});
