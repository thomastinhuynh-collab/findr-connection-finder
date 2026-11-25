import { describe, it, expect } from "vitest";
import { exchangeCardState, proposalSentUrl, type CardReservation } from "./exchangeCard";

const prop = (o: Partial<{ id: string; status: string; proposed_price: number; created_at: string }> = {}) =>
  ({ id: "p1", status: "pending", proposed_price: 190, created_at: "2026-11-20T10:00:00Z", ...o });
const sale = (o: Partial<CardReservation> = {}): CardReservation =>
  ({ id: "r1", status: "approved", payment_status: "paye_attente_etiquette", object_price: 190, findr_payout_amount: 182.4, created_at: "2026-11-21T10:00:00Z", ...o });

describe("carte épinglée", () => {
  it("findr, proposition en attente : Modifier ma proposition", () => {
    const c = exchangeCardState({ iAmBuyr: false, searchId: "s", proposals: [prop()], reservations: [] })!;
    expect(c.kind).toBe("proposition");
    expect(c.action).toEqual({ key: "editProposal", href: "/modifier-proposition/p1" });
  });
  it("buyr, proposition reçue : Voir la proposition ; acceptée non payée : Payer", () => {
    expect(exchangeCardState({ iAmBuyr: true, searchId: "s", proposals: [prop()], reservations: [] })!.action).toEqual({ key: "viewProposal", href: "/recherche/s" });
    expect(exchangeCardState({ iAmBuyr: true, searchId: "s", proposals: [prop({ status: "accepted_pending" })], reservations: [] })!.action).toEqual({ key: "pay", href: "/recherche/s?payer=p1" });
  });
  it("vente : étape N sur 5, montant net enregistré côté findr, étiquette côté buyr", () => {
    const buyr = exchangeCardState({ iAmBuyr: true, searchId: "s", proposals: [prop({ status: "accepted_pending" })], reservations: [sale()] })!;
    expect(buyr.kind).toBe("vente");
    expect(buyr.step).toMatchObject({ index: 2, total: 5, key: "label" });
    expect(buyr.action).toEqual({ key: "provideLabel", href: "/transaction/r1" });
    expect(buyr.payout).toBeNull();
    const findr = exchangeCardState({ iAmBuyr: false, searchId: "s", proposals: [prop()], reservations: [sale()] })!;
    expect(findr.payout).toBe(182.4);
    expect(findr.action!.key).toBe("viewSale");
  });
  it("réception à confirmer, sauf litige ; étiquette disponible pour le findr", () => {
    expect(exchangeCardState({ iAmBuyr: true, searchId: "s", proposals: [], reservations: [sale({ payment_status: "expedie", label_provided_at: "x", shipped_at: "x" })] })!.action!.key).toBe("confirmReceipt");
    expect(exchangeCardState({ iAmBuyr: true, searchId: "s", proposals: [], reservations: [sale({ payment_status: "livre", dispute_open: true })] })!.action!.key).toBe("viewSale");
    expect(exchangeCardState({ iAmBuyr: false, searchId: "s", proposals: [], reservations: [sale({ payment_status: "paye_en_attente_reception", label_provided_at: "x" })] })!.action!.key).toBe("viewLabel");
  });
  it("série de propositions : la plus récente et le lien Voir les propositions", () => {
    const c = exchangeCardState({ iAmBuyr: false, searchId: "s", proposals: [prop(), prop({ id: "p2", proposed_price: 150, created_at: "2026-11-22T10:00:00Z" })], reservations: [] })!;
    expect(c.price).toBe(150);
    expect(c.multipleProposals).toBe(true);
  });
  it("nouvelle proposition après une vente annulée", () => {
    const c = exchangeCardState({ iAmBuyr: true, searchId: "s", proposals: [prop({ id: "p2", created_at: "2026-11-23T10:00:00Z" })], reservations: [sale({ payment_status: "annule" })] })!;
    expect(c.kind).toBe("proposition");
  });
  it("réservation en cours : réservée jusqu'à, sans action", () => {
    const c = exchangeCardState({ iAmBuyr: true, searchId: "s", proposals: [], now: Date.parse("2026-11-20T00:00:00Z"),
      reservations: [{ id: "r", status: "approved", payment_status: null, expires_at: "2026-11-27T00:00:00Z", created_at: "2026-11-19T00:00:00Z" }] })!;
    expect(c).toMatchObject({ kind: "reservation", reservedUntil: "2026-11-27T00:00:00Z", action: null });
  });
  it("lien après envoi d'une proposition", () => {
    expect(proposalSentUrl("s", "b")).toBe("/messagerie/s?with=b&proposition=envoyee");
  });
});
