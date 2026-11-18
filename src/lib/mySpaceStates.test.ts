import { describe, it, expect } from "vitest";
import fr from "@/i18n/locales/fr.json";
import en from "@/i18n/locales/en.json";
import { DEBIT_REASONS, DEBIT_STATUSES } from "@/components/NegativeBalanceBanner";

describe("Mon espace — textes des états et du détail des montants", () => {
  it("raisons et statuts du détail traduits FR/EN", () => {
    for (const l of [fr, en] as any[]) {
      for (const r of DEBIT_REASONS) expect(l.mySpace.debitDetail.reasons[r]).toBeTruthy();
      for (const s of DEBIT_STATUSES) expect(l.mySpace.debitDetail.statuses[s]).toBeTruthy();
    }
    expect((fr as any).mySpace.debitDetail.reasons.chargeback).toBe("Paiement contesté par l'acheteur");
    expect((fr as any).mySpace.debitDetail.statuses.compense).toBe("Déduit d'un versement");
  });
  it("états vides et erreur FR", () => {
    const s = (fr as any).mySpace.states;
    expect(s.emptyFilter).toBe("Rien ici pour le moment.");
    expect(s.loadError).toBe("Impossible de charger tes informations.");
    expect((fr as any).todoNow.emptyTitle).toBe("Tout est à jour.");
  });
});
