import { describe, expect, it } from "vitest";
import { detectOffPlatformContact as d } from "./messageGuard";

describe("detectOffPlatformContact — vrais positifs", () => {
  it.each([
    ["Appelle-moi au 06 12 34 56 78", "phone"],
    ["mon numéro : 0612345678", "phone"],
    ["+33 6 12 34 56 78", "phone"],
    ["06.12.34.56.78 dispo le soir", "phone"],
    ["+44 20 7946 0958", "phone"],
    ["écris-moi à jean.dupont@gmail.com", "email"],
    ["contact : Marie@Example.FR", "email"],
    ["IBAN FR76 3000 6000 0112 3456 7890 189", "iban"],
    ["voir https://leboncoin.fr/annonce", "url"],
    ["va sur www.monsite.com", "url"],
    ["c'est sur vinted.fr", "url"],
    ["On passe sur WhatsApp ?", "keyword"],
    ["ajoute-moi sur Télégram", "keyword"],
    ["ajoute-moi sur Telegram", "keyword"],
    ["paiement par PayPal possible", "keyword"],
    ["je préfère un virement", "keyword"],
    ["Wero ou Lydia ?", "keyword"],
    ["j'ai Revolut", "keyword"],
    ["par Western   Union", "keyword"],
    ["on règle EN DÉHORS DU SITE", "keyword"],
    ["écris-moi sur Signal", "keyword"],
    ["mon snapchat c'est toto", "keyword"],
  ])("%s", (text, kind) => {
    expect(d(text)).toBe(kind);
  });
});

describe("detectOffPlatformContact — faux positifs évités", () => {
  it.each([
    "Je te le propose à 190 €",
    "Disponible le 12/11",
    "C'est un iPhone 12 en bon état",
    "Hauteur 90 cm, largeur 45 cm",
    "Réf. 2023-118, taille 42",
    "Entre 150 et 200 €, livraison 12/11/2026",
    "Je vais signaler ce problème",
    "Prix 1 250,00 €",
    "Bonjour, l'objet est toujours dispo ?",
    "Envoi le 03/12 à 14h30",
    "",
  ])("%s", (text) => {
    expect(d(text)).toBeNull();
  });
});
