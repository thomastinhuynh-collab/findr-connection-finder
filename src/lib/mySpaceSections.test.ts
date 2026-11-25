import { describe, it, expect } from "vitest";
import { resolveMySpaceLocation as r, mySpaceHref, MY_SPACE_SECTIONS } from "./mySpaceSections";
import { todoNavCount } from "./todoActions";
import { SHIP_FROM_PATH } from "../../supabase/functions/_shared/saleMessages";

const href = (url: string) => {
  const u = new URL(url, "https://findr.test");
  const x = r(u.search, u.hash);
  if (x.external) return x.external;
  return `/mon-espace?${x.search}${x.hash ? `#${x.hash}` : ""}`;
};

describe("rubriques de Mon espace", () => {
  it("ouvre « Aujourd'hui » par défaut", () => {
    expect(href("/mon-espace")).toBe("/mon-espace?section=aujourdhui");
    expect(r("", "").redirect).toBe(true);
  });
  it("garde une rubrique valide sans redirection", () => {
    for (const s of ["aujourdhui", "recherches", "compte"]) {
      const x = r(`section=${s}`, "");
      expect(x.section).toBe(s);
      expect(x.redirect).toBe(false);
    }
  });
  it("remplace une rubrique inconnue par « Aujourd'hui »", () => {
    expect(href("/mon-espace?section=xyz")).toBe("/mon-espace?section=aujourdhui");
  });
  it("redirige ?onglet=recherches ; ?onglet=propositions et ?section=propositions vers la Messagerie « En attente »", () => {
    expect(href("/mon-espace?onglet=recherches")).toBe("/mon-espace?section=recherches");
    expect(href("/mon-espace?onglet=propositions")).toBe("/messagerie?filtre=en_attente");
    expect(href("/mon-espace?section=propositions")).toBe("/messagerie?filtre=en_attente");
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
    expect(href("/mon-espace?onglet=propositions")).toBe("/messagerie?filtre=en_attente");
    expect(href("/mon-espace")).toBe("/mon-espace?section=aujourdhui");
  });
  it("construit les liens canoniques", () => {
    expect(mySpaceHref("compte", "adresse")).toBe("/mon-espace?section=compte#adresse");
  });
  it("liens serveur et site de l'ancienne rubrique mènent à la Messagerie « En attente »", async () => {
    const fs = await import("node:fs");
    for (const f of ["supabase/functions/stripe-webhook/index.ts", "src/components/ProposalList.tsx", "src/pages/EditProposal.tsx", "src/App.tsx"]) {
      const src = fs.readFileSync(f, "utf8");
      expect(src).not.toContain("onglet=propositions");
      expect(src).not.toContain("section=propositions");
    }
    expect(fs.readFileSync("supabase/functions/stripe-webhook/index.ts", "utf8")).toContain('link: "/messagerie?filtre=en_attente"');
  });
  it("trois rubriques seulement", () => {
    expect(MY_SPACE_SECTIONS).toEqual(["aujourdhui", "recherches", "compte"]);
  });
  it("chiffre d'« Aujourd'hui » : actions hors messages + échanges non lus", () => {
    const items = [{ key: "a", kind: "label", deadline: null }, { key: "m1", kind: "message", deadline: null }, { key: "m2", kind: "message", deadline: null }] as any;
    expect(todoNavCount(items, 5)).toBe(6);
    expect(todoNavCount(items, 0)).toBe(1);
    expect(todoNavCount(null, 3)).toBe(0);
  });
});
