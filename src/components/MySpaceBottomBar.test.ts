import { describe, it, expect } from "vitest";
import { BOTTOM_BAR_ITEMS, bottomBarHref } from "./MySpaceBottomBar";

describe("barre du bas du téléphone", () => {
  it("Aujourd'hui · Recherches · Messagerie · Compte, Messagerie vers /messagerie", () => {
    expect(BOTTOM_BAR_ITEMS).toEqual(["aujourdhui", "recherches", "messagerie", "compte"]);
    expect(bottomBarHref("messagerie")).toBe("/messagerie");
    expect(bottomBarHref("compte")).toBe("/mon-espace?section=compte");
  });
});
