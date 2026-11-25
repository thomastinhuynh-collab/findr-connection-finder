import { describe, it, expect } from "vitest";
import { exchangeCardState, withdrawErrorKey } from "./exchangeCard";
import { exchangeBadges, exchangePreview, type ExchangeRow } from "./exchangeRows";
import { excludeWithdrawn } from "./buyrSearchRows";
import { classifyProposalTab, finalBadge, pendingProposalCount } from "./findrProposalRows";

const prop = (o: Record<string, unknown> = {}) => ({ id: "p1", status: "pending", proposed_price: 190, created_at: "2026-11-20T10:00:00Z", ...o });

describe("annuler ma proposition", () => {
  it("findr, proposition en attente : Modifier + Annuler ; buyr ne peut pas annuler", () => {
    const c = exchangeCardState({ iAmBuyr: false, searchId: "s", proposals: [prop()], reservations: [] })!;
    expect(c.action!.key).toBe("editProposal");
    expect(c.withdrawableId).toBe("p1");
    expect(exchangeCardState({ iAmBuyr: true, searchId: "s", proposals: [prop()], reservations: [] })!.withdrawableId).toBeNull();
    expect(exchangeCardState({ iAmBuyr: false, searchId: "s", proposals: [prop({ status: "accepted_pending" })], reservations: [] })!.withdrawableId).toBeNull();
  });
  it("proposition annulée : carte sans action", () => {
    const c = exchangeCardState({ iAmBuyr: false, searchId: "s", proposals: [prop({ status: "withdrawn" })], reservations: [] })!;
    expect(c.withdrawn).toBe(true);
    expect(c.action).toBeNull();
  });
  it("nouvelle proposition après annulation : redevient modifiable", () => {
    const c = exchangeCardState({ iAmBuyr: false, searchId: "s", proposals: [prop({ status: "withdrawn" }), prop({ id: "p2", created_at: "2026-11-22T10:00:00Z" })], reservations: [] })!;
    expect(c.withdrawableId).toBe("p2");
  });
  it("erreurs de withdraw_proposal", () => {
    expect(withdrawErrorKey("checkout_in_progress")).toBe("errorCheckout");
    expect(withdrawErrorKey("not_pending")).toBe("errorNotPending");
    expect(withdrawErrorKey("boom")).toBe("errorGeneric");
  });
  it("Messagerie : pastille et aperçu « Proposition annulée », distincts de Vente annulée", () => {
    const row = { search_id: "s", search_title: "t", partner_id: "b", partner_name: "Léa", partner_avatar_url: null, partner_role: "buyr",
      last_message_preview: null, last_message_at: null, unread_count: 0, kind: "proposition", state: "proposition_withdrawn",
      amount: 10, expires_at: null, last_activity_at: null, needs_action: false } as ExchangeRow;
    expect(exchangeBadges(row, String)).toEqual([{ key: "proposalWithdrawn" }]);
    expect(exchangePreview(row)).toEqual({ key: "previewWithdrawn" });
  });
  it("buyr : proposition annulée exclue des comptes", () => {
    const rows = excludeWithdrawn([{ status: "pending" }, { status: "withdrawn" }, { status: "rejected" }]);
    expect(rows.length).toBe(2);
    expect(rows.filter((p) => p.status === "pending").length).toBe(1);
  });
  it("findr, Mes propositions : annulée sort de En attente", () => {
    const p = { created_at: "x", proposalStatus: "withdrawn" };
    expect(classifyProposalTab(p)).toBe("done");
    expect(finalBadge(p)).toBe("withdrawn");
    expect(pendingProposalCount([p])).toBe(0);
  });
});
