// Rubriques de Mon espace et redirection des anciens liens (?onglet=…, #adresse-expedition).
export type MySpaceSection = "aujourdhui" | "recherches" | "propositions" | "compte";
export const MY_SPACE_SECTIONS: MySpaceSection[] = ["aujourdhui", "recherches", "propositions", "compte"];
export const DEFAULT_SECTION: MySpaceSection = "aujourdhui";

const LEGACY_TABS: Record<string, { section: MySpaceSection; hash?: string }> = {
  recherches: { section: "recherches" },
  propositions: { section: "propositions" },
  favoris: { section: "compte", hash: "favoris" },
  gains: { section: "compte", hash: "paiements" },
};
const LEGACY_ADDRESS_HASHES = ["adresse-expedition", "ship-from-card"];
const LEGACY_PAYMENT_HASHES = ["payments-card"];

export interface MySpaceLocation {
  section: MySpaceSection;
  /** Query string canonique, sans « ? » initial. */
  search: string;
  /** Ancre canonique, sans « # » initial ("" si aucune). */
  hash: string;
  /** Vrai si l'adresse reçue doit être remplacée par l'adresse canonique. */
  redirect: boolean;
}

export function resolveMySpaceLocation(search: string, hash: string): MySpaceLocation {
  const params = new URLSearchParams(search.replace(/^\?/, ""));
  let h = hash.replace(/^#/, "");
  const raw = params.get("section");
  let section: MySpaceSection | null = raw && (MY_SPACE_SECTIONS as string[]).includes(raw) ? (raw as MySpaceSection) : null;

  const legacy = params.get("onglet");
  if (legacy !== null) {
    params.delete("onglet");
    const m = LEGACY_TABS[legacy];
    if (m && !section) {
      section = m.section;
      if (m.hash && !h) h = m.hash;
    }
  }
  if (LEGACY_ADDRESS_HASHES.includes(h)) { section = "compte"; h = "adresse"; }
  if (LEGACY_PAYMENT_HASHES.includes(h)) { section = "compte"; h = "paiements"; }
  if (h === "adresse" || h === "paiements" || h === "favoris") section = "compte";
  // Retour de l'inscription Stripe : la carte « Paiements » est dans « Mon compte ».
  if (!section && params.get("stripe")) { section = "compte"; if (!h) h = "paiements"; }
  if (!section) section = DEFAULT_SECTION;

  params.set("section", section);
  const canonical = params.toString();
  const redirect = canonical !== search.replace(/^\?/, "") || h !== hash.replace(/^#/, "");
  return { section, search: canonical, hash: h, redirect };
}

export const mySpaceHref = (section: MySpaceSection, hash?: string) =>
  `/mon-espace?section=${section}${hash ? `#${hash}` : ""}`;
