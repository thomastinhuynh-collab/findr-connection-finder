import { describe, it, expect } from "vitest";
import { pendingProposalCount, classifyProposalTab, finalBadge, findrNeedsAction, proposalState, sortProposalRows, netAmount, remainingParts } from "./findrProposalRows";

const base = { created_at: "2026-01-01T00:00:00Z", proposalStatus: "pending" };

describe("findrProposalRows", () => {
  it("en attente : réponse du buyr ou paiement après acceptation", () => {
    expect(classifyProposalTab(base)).toBe("pending");
    expect(classifyProposalTab({ ...base, proposalStatus: "accepted_pending" })).toBe("pending");
  });
  it("ventes en cours : acceptée et payée", () => {
    expect(classifyProposalTab({ ...base, proposalStatus: "accepted_pending", payment_status: "expedie" })).toBe("ongoing");
  });
  it("finalisées avec pastille Vendue / Refusée / Annulée", () => {
    expect(finalBadge({ ...base, proposalStatus: "completed", payment_status: "termine" })).toBe("sold");
    expect(finalBadge({ ...base, proposalStatus: "rejected" })).toBe("rejected");
    expect(finalBadge({ ...base, proposalStatus: "accepted_pending", payment_status: "annule" })).toBe("cancelled");
  });
  it("étiquette reçue = action du findr", () => {
    const p = { ...base, payment_status: "paye_en_attente_reception", label_provided_at: "x" };
    expect(findrNeedsAction(p)).toBe(true);
    expect(proposalState(p)).toBe("labelReceived");
    expect(findrNeedsAction({ ...base, payment_status: "paye_attente_etiquette" })).toBe(false);
    expect(findrNeedsAction({ ...p, shipped_at: "y" })).toBe(false);
  });
  it("action d'abord, puis du plus récent au plus ancien", () => {
    const a = { ...base, id: "a", created_at: "2026-03-01T00:00:00Z", payment_status: "expedie" };
    const b = { ...base, id: "b", created_at: "2026-01-01T00:00:00Z", payment_status: "paye_en_attente_reception", label_provided_at: "x" };
    const c = { ...base, id: "c", created_at: "2026-02-01T00:00:00Z", payment_status: "livre" };
    expect(sortProposalRows([a, c, b]).map((r) => r.id)).toEqual(["b", "a", "c"]);
  });
  it("montant net = prix enregistré moins findr_fee", () => {
    expect(netAmount(50, 2)).toBe(48);
    expect(netAmount(null, 2)).toBeNull();
  });
  it("temps restant en jours et heures", () => {
    const now = Date.parse("2026-01-01T00:00:00Z");
    expect(remainingParts("2026-01-03T23:30:00Z", now)).toEqual({ d: 2, h: 23 });
    expect(remainingParts("2025-12-31T00:00:00Z", now)).toBeNull();
  });
  it("le chiffre de la navigation = lignes du filtre En attente, acceptée non payée comprise", () => {
    const rows = [base, { ...base, proposalStatus: "accepted_pending" }, { ...base, proposalStatus: "accepted_pending", payment_status: "expedie" }, { ...base, proposalStatus: "rejected" }];
    expect(pendingProposalCount(rows)).toBe(2);
  });
  it("cancelled ou expired : Finalisées avec la pastille Annulée", () => {
    for (const st of ["cancelled", "expired"]) {
      expect(classifyProposalTab({ ...base, proposalStatus: st })).toBe("done");
      expect(finalBadge({ ...base, proposalStatus: st })).toBe("cancelled");
    }
  });
});
