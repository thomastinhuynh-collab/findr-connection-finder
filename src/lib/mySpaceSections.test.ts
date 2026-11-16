import { describe, it, expect } from "vitest";
import { resolveMySpaceLocation as r, mySpaceHref } from "./mySpaceSections";
import { SHIP_FROM_PATH } from "../../supabase/functions/_shared/saleMessages";

const href = (url: string) => {
  const u = new URL(url, "https://findr.test");
  const x = r(u.search, u.hash);
  return `/mon-espace?${x.search}${x.hash ? `#${x.hash}` : ""}`;
};

describe("rubriques de Mon espace", () => {
  it("ouvre « Aujourd'hui » par défaut", () => {
    expect(href("/mon-espace")).toBe("/mon-espace?section=aujourdhui");
    expect(r("", "").redirect).toBe(true);
  });
  it("garde une rubrique valide sans redirection", () => {
    for (const s of ["aujourdhui", "recherches", "propositions", "compte"]) {
      const x = r(`section=${s}`, "");
      expect(x.section).toBe(s);
      expect(x.redirect).toBe(false);
    }
  });
  it("remplace une rubrique inconnue par « Aujourd'hui »", () => {
    expect(href("/mon-espace?section=xyz")).toBe("/mon-espace?section=aujourdhui");
  });
  it("redirige ?onglet=recherches et ?onglet=propositions", () => {
    expect(href("/mon-espace?onglet=recherches")).toBe("/mon-espace?section=recherches");
    expect(href("/mon-espace?onglet=propositions")).toBe("/mon-espace?section=propositions");
  });
  it("redirige ?onglet=favoris vers compte#favoris", () => {
    expect(href("/mon-espace?onglet=favoris")).toBe("/mon-espace?section=compte#favoris");
  });
  it("redirige ?onglet=gains vers compte#paiements, ancre existante conservée", () => {
    expect(href("/mon-espace?onglet=gains")).toBe("/mon-espace?section=compte#paiements");
    expect(href("/mon-espace?onglet=gains#paiements")).toBe("/mon-espace?section=compte#paiements");
  });
  it("redirige le lien de l'adresse d'expédition des emails vers compte#adresse", () => {
    expect(SHIP_FROM_PATH).toBe("/mon-espace#adresse-expedition");
    expect(href(SHIP_FROM_PATH)).toBe("/mon-espace?section=compte#adresse");
    expect(href("/mon-espace?onglet=gains#adresse-expedition")).toBe("/mon-espace?section=compte#adresse");
  });
  it("conserve les autres paramètres (retour Stripe) et ouvre Mon compte", () => {
    expect(href("/mon-espace?stripe=success")).toBe("/mon-espace?stripe=success&section=compte#paiements");
  });
  it("les liens des notifications serveur restent valides", () => {
    // stripe-webhook, ProposalList : /mon-espace?onglet=propositions ; auto-release, admin : /mon-espace
    expect(href("/mon-espace?onglet=propositions")).toBe("/mon-espace?section=propositions");
    expect(href("/mon-espace")).toBe("/mon-espace?section=aujourdhui");
  });
  it("construit les liens canoniques", () => {
    expect(mySpaceHref("compte", "adresse")).toBe("/mon-espace?section=compte#adresse");
  });
});
