import { describe, expect, it } from "vitest";
import {
  buyrLabelAction,
  buyrMustProvideLabel,
  labelCountdown,
  showConfirmAfterShipping,
  showTransactionLink,
} from "./buyrLabelAction";

const shipFrom = { street: "1 rue de la Paix", postal_code: "75002", city: "Paris" };
const deadline = "2026-11-06T12:00:00Z";

describe("encadré d'action du buyr (parcours étiquette)", () => {
  it("demande l'étiquette quand l'adresse du findr est connue", () => {
    expect(buyrLabelAction({ payment_status: "paye_attente_etiquette", ship_from: shipFrom })).toBe("provide");
  });
  it("attend l'adresse du findr quand ship_from est vide, sans action pour le buyr", () => {
    const r = { payment_status: "paye_attente_etiquette", ship_from: null, label_deadline_at: deadline };
    expect(buyrLabelAction(r)).toBe("waitingShipFrom");
    expect(buyrMustProvideLabel(r)).toBe(false);
  });
  it("affiche la reprise après une étiquette refusée", () => {
    const r = { payment_status: "etiquette_refusee", ship_from: shipFrom, label_deadline_at: deadline };
    expect(buyrLabelAction(r)).toBe("rejected");
    expect(buyrMustProvideLabel(r)).toBe(true);
  });
  it("ne montre rien hors statuts d'étiquette", () => {
    expect(buyrLabelAction({ payment_status: "paye_en_attente_reception", label_provided_at: deadline })).toBeNull();
    expect(buyrLabelAction({ payment_status: "expedie" })).toBeNull();
  });
  it("compte une action à faire pour la pastille quand l'étiquette est à fournir", () => {
    expect(buyrMustProvideLabel({ payment_status: "paye_attente_etiquette", ship_from: shipFrom, label_deadline_at: deadline })).toBe(true);
  });
});

describe("bouton « Voir la transaction »", () => {
  it("apparaît après l'envoi de l'étiquette, à l'expédition et à la livraison", () => {
    expect(showTransactionLink({ payment_status: "paye_en_attente_reception", label_provided_at: deadline })).toBe(true);
    expect(showTransactionLink({ payment_status: "expedie" })).toBe(true);
    expect(showTransactionLink({ payment_status: "livre" })).toBe(true);
  });
  it("n'apparaît pas pour l'ancien parcours à expédier ni avant l'étiquette", () => {
    expect(showTransactionLink({ payment_status: "paye_en_attente_reception", label_provided_at: null })).toBe(false);
    expect(showTransactionLink({ payment_status: "paye_attente_etiquette" })).toBe(false);
  });
});

describe("« Tu pourras confirmer la réception… » dans la fenêtre de détail", () => {
  it("n'est plus affiché pour les statuts d'étiquette", () => {
    expect(showConfirmAfterShipping({ payment_status: "paye_attente_etiquette" })).toBe(false);
    expect(showConfirmAfterShipping({ payment_status: "etiquette_refusee" })).toBe(false);
  });
  it("reste affiché quand l'étiquette est fournie et l'objet pas encore expédié", () => {
    expect(showConfirmAfterShipping({ payment_status: "paye_en_attente_reception", label_provided_at: deadline })).toBe(true);
    expect(showConfirmAfterShipping({ payment_status: "expedie" })).toBe(false);
  });
});

describe("compte à rebours de la date limite", () => {
  it("donne les jours et heures restants", () => {
    const now = new Date("2026-11-03T09:30:00Z").getTime();
    expect(labelCountdown(deadline, now)).toEqual({ expired: false, days: 3, hours: 2 });
  });
  it("signale une date dépassée", () => {
    expect(labelCountdown(deadline, new Date("2026-11-07T00:00:00Z").getTime())?.expired).toBe(true);
  });
});
