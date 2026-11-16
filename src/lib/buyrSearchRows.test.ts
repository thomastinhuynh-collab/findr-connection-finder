import { describe, it, expect } from "vitest";
import { classifySearchTab, sortSearchRows, primaryAction, ongoingNeedsAction, searchRank, type BuyrSearchFlags } from "./buyrSearchRows";

const base = (o: Partial<BuyrSearchFlags> & { id?: string } = {}): BuyrSearchFlags & { id: string } => ({
  id: "x", created_at: "2026-01-01T00:00:00Z", paidStatus: null, paymentPending: false, recentReservation: false,
  unreadCount: 0, labelPending: false, receiptPending: false, hasTransaction: false, ...o,
});

describe("classifySearchTab", () => {
  it("accepted but unpaid stays in « En recherche »", () => {
    expect(classifySearchTab(null)).toBe("active");
  });
  it.each(["paye_attente_etiquette", "etiquette_refusee", "paye_en_attente_reception", "expedie", "livre", "versement_en_revue"])(
    "%s → Achats en cours", (s) => expect(classifySearchTab(s)).toBe("ongoing"));
  it("termine → Finalisées, annule → Annulées", () => {
    expect(classifySearchTab("termine")).toBe("done");
    expect(classifySearchTab("annule")).toBe("cancelled");
  });
});

describe("sortSearchRows", () => {
  it("En recherche: payment, then recent reservation, then pending proposals, then newest", () => {
    const rows = [
      base({ id: "old", created_at: "2026-01-01T00:00:00Z" }),
      base({ id: "new", created_at: "2026-03-01T00:00:00Z" }),
      base({ id: "props", unreadCount: 2 }),
      base({ id: "resa", recentReservation: true }),
      base({ id: "pay", paymentPending: true }),
    ];
    expect(sortSearchRows(rows).map((r) => r.id)).toEqual(["pay", "resa", "props", "new", "old"]);
  });
  it("Achats en cours: label, then receipt, then newest", () => {
    const rows = [
      base({ id: "other", paidStatus: "paye_en_attente_reception", created_at: "2026-05-01T00:00:00Z" }),
      base({ id: "rec", paidStatus: "expedie", receiptPending: true }),
      base({ id: "lab", paidStatus: "paye_attente_etiquette", labelPending: true }),
    ];
    expect(sortSearchRows(rows).map((r) => r.id)).toEqual(["lab", "rec", "other"]);
  });
  it("only payment / label are rank 1", () => {
    expect(searchRank(base({ paymentPending: true }))).toBe(1);
    expect(searchRank(base({ paidStatus: "expedie", receiptPending: true }))).toBe(2);
  });
});

describe("primaryAction", () => {
  it("maps each situation to one action", () => {
    expect(primaryAction(base({ paymentPending: true }))).toBe("pay");
    expect(primaryAction(base({ unreadCount: 1 }))).toBe("proposals");
    expect(primaryAction(base())).toBe("edit");
    expect(primaryAction(base({ paidStatus: "paye_attente_etiquette", labelPending: true }))).toBe("label");
    expect(primaryAction(base({ paidStatus: "livre", receiptPending: true }))).toBe("receipt");
    expect(primaryAction(base({ paidStatus: "termine", hasTransaction: true }))).toBe("transaction");
  });
});

describe("ongoingNeedsAction", () => {
  it("is true only when an ongoing purchase awaits the buyr", () => {
    expect(ongoingNeedsAction([base({ paidStatus: "paye_en_attente_reception" })])).toBe(false);
    expect(ongoingNeedsAction([base({ paidStatus: "expedie", receiptPending: true })])).toBe(true);
  });
});
