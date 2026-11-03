import { describe, expect, it } from "vitest";
import { buildEmail, SITE_URL, type EmailType } from "../../supabase/functions/_shared/emails";
import { findrAcceptedParagraphs, shipFromNeededText } from "../../supabase/functions/_shared/saleMessages";

describe("transaction email destinations", () => {
  const reservationId = "f23c8b7a-e7a2-4659-942b-7ad2b284ab19";
  for (const type of ["proposal_accepted", "tracking_review", "label_ready", "funds_released", "auto_release", "refund", "dispute_opened", "dispute_received", "dispute_resolved_buyr", "dispute_resolved_findr", "chargeback_opened"] as EmailType[]) {
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

describe("sale messages after payment", () => {
  const reservationId = "f23c8b7a-e7a2-4659-942b-7ad2b284ab19";
  const deadlineAt = "2026-11-05T18:05:00.000Z"; // 19:05 à Paris
  const label = { reservationId, labelFlow: true, firstName: "Marc", buyrFirstName: "Olga", findrFirstName: "Marc", deadlineAt, weightKg: 0.5, hasShipFrom: true, totalPaid: 52.5, itemTitle: "Game Boy", payoutAmount: 48 };
  const old = { ...label, labelFlow: false, deadlineAt: null };
  const cta = (html: string) => html.match(/<a href="([^"]+)" style="display:inline-block[^>]*>([^<]+)</);

  it("detail lines show amounts the French way", () => {
    const { html } = buildEmail("payment_confirmed", { ...old, firstName: "Olga" });
    expect(html).toContain("52,50 €");
    expect(html).not.toContain("52.50 €");
    expect(buildEmail("proposal_accepted", label).html).toContain("48,00 €");
  });
  it("findr, old flow: elides « que » before a vowel, keeps it otherwise", () => {
    expect(findrAcceptedParagraphs({ labelFlow: false, buyrFirstName: "Paul", findrFirstName: "Marc" }).join(" "))
      .toContain("s'ouvrira dès que Paul aura choisi sa livraison.");
    expect(findrAcceptedParagraphs({ labelFlow: false, findrFirstName: "Marc" }).join(" "))
      .toContain("s'ouvrira dès que le buyr aura choisi sa livraison.");
  });

  it("findr, label flow: prepare the parcel, deadline and announced weight", () => {
    const { subject, html } = buildEmail("proposal_accepted", label);
    expect(subject).toBe("Ta proposition a été acceptée — prépare ton colis");
    expect(html).toContain("Marc, bonne nouvelle : Olga a accepté ta proposition et le paiement est enregistré.");
    expect(html).toContain("te l'envoie avant le 5 novembre 2026 à 19:05");
    expect(html).toContain("prépare l'objet (jusqu'à 0,5 kg) et emballe-le avec soin.");
    expect(html).toContain("Montant net prévu pour le versement");
    expect(cta(html)?.[2]).toBe("Voir la transaction");
    expect(html).not.toContain("5 jours");
    expect(html).not.toContain("Expédier mon objet");
  });
  it("findr, label flow without ship-from address: asks for the address", () => {
    const { html } = buildEmail("proposal_accepted", { ...label, hasShipFrom: false, deadlineAt: null });
    expect(html).toContain("Renseigne d'abord ton adresse d'expédition dans Mon espace : sans elle, Olga ne peut pas créer l'étiquette.");
    expect(cta(html)?.[2]).toBe("Renseigner mon adresse");
    expect(cta(html)?.[1]).toBe(`${SITE_URL}/mon-espace#adresse-expedition`);
    expect(html).toContain("Voir la transaction");
  });
  it("findr, old flow: waits for the buyr's delivery choice, no 5-day rule", () => {
    const { subject, html } = buildEmail("proposal_accepted", old);
    expect(subject).toBe("Ta proposition a été acceptée !");
    expect(html).toContain("Olga doit maintenant choisir son mode de livraison. Reviens sur cette page : l'étape d'expédition s'ouvrira dès qu'Olga aura choisi sa livraison.");
    expect(html).not.toContain("5 jours");
    expect(cta(html)?.[2]).toBe("Voir la transaction");
  });
  it("findr notification uses the same text as the email variant", () => {
    expect(findrAcceptedParagraphs({ labelFlow: false, buyrFirstName: "Olga", findrFirstName: "Marc" }).join(" "))
      .toBe("Marc, bonne nouvelle : Olga a accepté ta proposition et le paiement est enregistré. Olga doit maintenant choisir son mode de livraison. Reviens sur cette page : l'étape d'expédition s'ouvrira dès qu'Olga aura choisi sa livraison.");
  });
  it("buyr, label flow: provide the label before the deadline", () => {
    const { subject, html } = buildEmail("payment_confirmed", { ...label, firstName: "Olga" });
    expect(subject).toBe("Paiement confirmé — fournis l'étiquette avant le 5 novembre 2026 à 19:05");
    expect(html).toContain("Ton paiement de 52,50 € est confirmé. Pour que Marc puisse expédier l'objet");
    expect(html).toContain("Sans étiquette à cette date, la vente est annulée et tu es intégralement remboursé.");
    expect(html).toContain("Poids annoncé");
    expect(cta(html)?.slice(1)).toEqual([`${SITE_URL}/transaction/${reservationId}`, "Fournir l'étiquette"]);
  });
  it("buyr, old flow: choose the delivery", () => {
    const { subject, html } = buildEmail("payment_confirmed", { ...old, firstName: "Olga" });
    expect(subject).toBe("Paiement confirmé — choisis ta livraison");
    expect(html).toContain("Choisis maintenant ton mode de livraison pour que Marc puisse expédier l'objet.");
    expect(cta(html)?.[2]).toBe("Choisir ma livraison");
  });
  it("findr without ship-from address gets ship_from_needed", () => {
    const { html } = buildEmail("ship_from_needed", { ...label, hasShipFrom: false });
    expect(shipFromNeededText({ labelFlow: true, buyrFirstName: "Olga" })).toBe("Olga a acheté ton objet, mais nous n'avons pas ton adresse d'expédition. Renseigne-la dans Mon espace pour que l'étiquette puisse être créée.");
    expect(cta(html)?.[2]).toBe("Renseigner mon adresse");
  });
  it("buyr first carrier scan: parcel on its way", () => {
    const { subject, html } = buildEmail("parcel_in_transit", { reservationId, carrier: "Colissimo", trackingNumber: "6A12345678901" });
    expect(subject).toBe("Ton colis est en route");
    expect(html).toContain("Le transporteur a scanné ton colis.");
    expect(html).toContain("6A12345678901");
    expect(cta(html)?.slice(1)).toEqual([`${SITE_URL}/transaction/${reservationId}`, "Suivre ma transaction"]);
  });
});

describe("parcel tracking buttons in buyr emails", () => {
  const reservationId = "f23c8b7a-e7a2-4659-942b-7ad2b284ab19";
  const tx = `${SITE_URL}/transaction/${reservationId}`;
  const links = (html: string) => [...html.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(m => [m[1], m[2]]);
  for (const type of ["parcel_in_transit", "delivered", "shipped"] as EmailType[]) {
    it(`${type}: « Suivre mon colis » opens the carrier, « Voir la transaction » is secondary`, () => {
      const { html } = buildEmail(type, { reservationId, carrier: "Colissimo", trackingNumber: "AB123456" });
      const cta = html.match(/<a href="([^"]+)" style="display:inline-block[^>]*>([^<]+)</);
      expect(cta?.[1]).toBe("https://www.laposte.fr/outils/suivre-vos-envois?code=AB123456");
      expect(cta?.[2]).toBe("Suivre mon colis");
      expect(links(html)).toContainEqual([tx, "Voir la transaction"]);
    });
    it(`${type}: without a tracking number the main button is the transaction`, () => {
      const { html } = buildEmail(type, { reservationId });
      const cta = html.match(/<a href="([^"]+)" style="display:inline-block[^>]*>([^<]+)</);
      expect(cta?.[1]).toBe(tx);
      expect(html).not.toContain("Suivre mon colis");
    });
  }
  it("delivered keeps « Signaler un problème »", () => {
    expect(buildEmail("delivered", { reservationId, carrier: "Mondial Relay", trackingNumber: "12345678" }).html).toContain("Signaler un problème");
  });
});
