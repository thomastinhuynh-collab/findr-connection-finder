import { describe, it, expect } from "vitest";
import { firstUnreadExchange, exchangeBadges, exchangePreview, formatExchangeTime, parseExchangeFilter, nextCursor, mergePages, type ExchangeRow } from "./exchangeRows";

const base: ExchangeRow = {
  search_id: "s", search_title: "Lampe", partner_id: "p", partner_name: "Olga Martin", partner_avatar_url: null,
  partner_role: "findr", last_message_preview: null, last_message_at: null, unread_count: 0, kind: "message",
  state: "message", amount: null, expires_at: null, last_activity_at: "2026-11-25T10:00:00Z", needs_action: false,
};
const fmt = (n: number) => `${n} €`;

describe("exchangeBadges", () => {
  it("proposition reçue par le buyr : à examiner en ambre", () => {
    const b = exchangeBadges({ ...base, kind: "proposition", state: "proposition_pending", amount: 190 }, fmt);
    expect(b).toEqual([{ key: "proposalReceived", params: { amount: "190 €" } }, { key: "toReview", amber: true }]);
  });
  it("proposition envoyée par le findr : en attente", () => {
    const b = exchangeBadges({ ...base, partner_role: "buyr", kind: "proposition", state: "proposition_pending", amount: 190 }, fmt);
    expect(b.map((x) => x.key)).toEqual(["proposalMine", "pending"]);
  });
  it("vente : étiquette à fournir côté buyr, colis à déposer côté findr", () => {
    expect(exchangeBadges({ ...base, kind: "vente", state: "paye_attente_etiquette" }, fmt)[1].key).toBe("actionLabel");
    expect(exchangeBadges({ ...base, partner_role: "buyr", kind: "vente", state: "paye_en_attente_reception" }, fmt)[1].key).toBe("actionDropoff");
    expect(exchangeBadges({ ...base, kind: "vente", state: "expedie" }, fmt)[1].key).toBe("actionReceipt");
  });
  it("proposition acceptée non payée : jamais « Vente en cours »", () => {
    const r = { ...base, kind: "proposition", state: "proposition_accepted_pending", amount: 190 };
    expect(exchangeBadges(r, fmt)).toEqual([{ key: "proposalAccepted", params: { amount: "190 €" } }, { key: "actionPay", amber: true }]);
    expect(exchangeBadges({ ...r, partner_role: "buyr" }, fmt)).toEqual([{ key: "proposalMine", params: { amount: "190 €" } }, { key: "acceptedAwaitingPayment" }]);
  });
  it("litige ouvert : « Litige en cours », pas de réception à confirmer", () => {
    const b = exchangeBadges({ ...base, kind: "vente", state: "litige" }, fmt);
    expect(b).toEqual([{ key: "dispute", amber: true }]);
  });
  it("ventes finalisée et annulée, proposition refusée, réservation expirée", () => {
    expect(exchangeBadges({ ...base, kind: "vente", state: "termine" }, fmt)[0].key).toBe("saleDone");
    expect(exchangeBadges({ ...base, kind: "vente", state: "annule" }, fmt)[0].key).toBe("saleCancelled");
    expect(exchangeBadges({ ...base, kind: "proposition", state: "proposition_rejected" }, fmt)[0].key).toBe("proposalRejected");
    expect(exchangeBadges({ ...base, kind: "reservation", state: "exclusivite_expiree" }, fmt)[0].key).toBe("reservationExpired");
  });
  it("réservation : jours restants et prénom", () => {
    const now = Date.parse("2026-11-25T10:00:00Z");
    const r = { ...base, kind: "reservation", state: "exclusivite_approved", expires_at: "2026-11-27T09:00:00Z" };
    expect(exchangeBadges(r, fmt, now)).toEqual([{ key: "reservedBy", params: { name: "Olga", days: 2 } }]);
    expect(exchangeBadges({ ...r, partner_role: "buyr" }, fmt, now)).toEqual([{ key: "reservedByMe", params: { days: 2 } }]);
  });
});

describe("exchangePreview", () => {
  it("photo seule, proposition sans message, réservation sans message, 80 caractères", () => {
    expect(exchangePreview({ ...base, last_message_at: "x", last_message_preview: "" })).toEqual({ key: "previewPhoto" });
    expect(exchangePreview({ ...base, kind: "proposition" })).toEqual({ key: "previewProposal" });
    expect(exchangePreview({ ...base, kind: "reservation" })).toEqual({ key: "previewReservation" });
    expect((exchangePreview({ ...base, last_message_at: "x", last_message_preview: "a".repeat(120) }) as { text: string }).text).toHaveLength(80);
  });
});

describe("formatExchangeTime", () => {
  const now = new Date(2026, 10, 25, 16, 0);
  it("heure, Hier, jour, date", () => {
    expect(formatExchangeTime(new Date(2026, 10, 25, 14, 32).toISOString(), "fr", "Hier", now)).toBe("14:32");
    expect(formatExchangeTime(new Date(2026, 10, 24, 9).toISOString(), "fr", "Hier", now)).toBe("Hier");
    expect(formatExchangeTime(new Date(2026, 10, 23, 9).toISOString(), "fr", "Hier", now)).toBe("Lun.");
    expect(formatExchangeTime(new Date(2026, 10, 8, 9).toISOString(), "fr", "Hier", now)).toBe("8 nov.");
  });
});

describe("pagination et filtre", () => {
  it("filtre inconnu → toutes ; curseur = dernier échange", () => {
    expect(parseExchangeFilter("bidule")).toBe("toutes");
    expect(parseExchangeFilter("non_lus")).toBe("non_lus");
    expect(nextCursor([{ ...base, unread_count: 2 }])).toEqual({ _before: base.last_activity_at, _before_unread: true });
    expect(mergePages([base], [base, { ...base, partner_id: "q" }])).toHaveLength(2);
  });
});

import fr from "@/i18n/locales/fr.json";
import en from "@/i18n/locales/en.json";
describe("textes Messagerie FR/EN", () => {
  it("mêmes clés et textes demandés", () => {
    const keys = (o: object): string[] => Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? keys(v).map((x) => `${k}.${x}`) : [k])).sort();
    expect(keys(en.messagingList)).toEqual(keys(fr.messagingList));
    expect(fr.messagingList.intro).toBe("Tes messages, propositions et réservations, au même endroit. Les non lus passent en premier.");
    expect(fr.messagingList.empty).toBe("Aucune conversation pour le moment.");
    expect(fr.messagingList.error).toBe("Impossible de charger ta messagerie.");
  });
});

describe("sélection à l'arrivée", () => {
  it("premier échange non lu, sinon aucun", () => {
    expect(firstUnreadExchange([base, { ...base, partner_id: "u", unread_count: 1 }])?.partner_id).toBe("u");
    expect(firstUnreadExchange([base])).toBeNull();
  });
});
