import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildEmail, SITE_URL } from "../../supabase/functions/_shared/emails";
import { resolveMySpaceLocation } from "./mySpaceSections";

describe("liens des notifications et emails serveur", () => {
  it("la notification de montant réglé (admin-findr-balances) ouvre Mon compte#paiements", () => {
    const src = readFileSync("supabase/functions/admin-findr-balances/index.ts", "utf8");
    expect(src).toContain('link: "/mon-espace?section=compte#paiements"');
    expect(src).not.toContain('link: "/mon-espace",');
    const x = resolveMySpaceLocation("?section=compte", "#paiements");
    expect([x.section, x.hash, x.redirect]).toEqual(["compte", "paiements", false]);
  });
  it("« Renouveler ma réservation » pointe vers la page de la recherche", () => {
    const { html } = buildEmail("reservation_reminder", { searchId: "s-123", searchTitle: "Vase" });
    expect(html).toContain(`${SITE_URL}/recherche/s-123`);
    expect(html).not.toMatch(new RegExp(`href="${SITE_URL}/mon-espace"[^>]*>Renouveler`));
  });
});
