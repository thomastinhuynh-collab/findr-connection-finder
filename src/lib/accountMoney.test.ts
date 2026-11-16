import { describe, it, expect } from "vitest";
import { pendingEarnings, finalizedSales, profileCompletion } from "./accountMoney";

const b = { created_at: "2026-01-01T00:00:00Z", proposalStatus: "accepted_pending" };

describe("accountMoney", () => {
  it("argent en attente = nets enregistrés des ventes payées non finalisées", () => {
    const rows = [
      { ...b, id: "1", payment_status: "expedie", object_price: 50, findr_fee: 2 },
      { ...b, id: "2", payment_status: "paye_attente_etiquette", object_price: 10.5, findr_fee: 0.42 },
      { ...b, id: "3", payment_status: "termine", object_price: 100, findr_fee: 4 },
      { ...b, id: "4", payment_status: "annule", object_price: 100, findr_fee: 4 },
      { ...b, id: "5", object_price: 100, findr_fee: 4 },
    ];
    expect(pendingEarnings(rows)).toBe(58.08);
  });
  it("ventes finalisées : seulement terminées, montant net enregistré, plus récente d'abord", () => {
    const rows = [
      { ...b, id: "a", title: "A", reservation_id: "ra", payment_status: "termine", reservation_updated_at: "2026-02-01T00:00:00Z", object_price: 50, findr_fee: 2 },
      { ...b, id: "b", title: "B", reservation_id: "rb", payment_status: "termine", reservation_updated_at: "2026-03-01T00:00:00Z", object_price: 20, findr_fee: 0.8 },
      { ...b, id: "c", payment_status: "expedie", object_price: 20, findr_fee: 0.8 },
    ];
    expect(finalizedSales(rows).map((r) => [r.id, r.net])).toEqual([["rb", 19.2], ["ra", 48]]);
  });
  it("profil complété par quarts", () => {
    expect(profileCompletion({})).toBe(0);
    expect(profileCompletion({ full_name: "Thomas", bio: "  " })).toBe(25);
    expect(profileCompletion({ full_name: "T", city: "Paris", bio: "x", avatar_url: "u" })).toBe(100);
  });
});
