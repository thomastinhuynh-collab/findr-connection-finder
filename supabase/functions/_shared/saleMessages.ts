// Textes des messages envoyés au paiement (emails et notifications), partagés
// par stripe-webhook et le gabarit d'email. Texte brut : l'appelant échappe.

export const SHIP_FROM_PATH = "/mon-espace#adresse-expedition";

export interface SaleContext {
  /** Parcours avec étiquette : réservation en paye_attente_etiquette. */
  labelFlow: boolean;
  findrFirstName?: string | null;
  buyrFirstName?: string | null;
  /** Date limite de l'étiquette (ISO), absente tant que le findr n'a pas d'adresse. */
  deadlineAt?: string | null;
  weightKg?: number | null;
  /** Le findr a une adresse d'expédition enregistrée au paiement. */
  hasShipFrom?: boolean;
  totalPaid?: number | null;
}

const clean = (v: unknown) => String(v ?? "").trim();
const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Le prénom du buyr, ou « le buyr » s'il est inconnu. */
export const buyrName = (c: SaleContext) => clean(c.buyrFirstName) || "le buyr";
/** Le prénom du findr, ou « le findr » s'il est inconnu. */
export const findrName = (c: SaleContext) => clean(c.findrFirstName) || "le findr";

/** « 5 novembre 2026 à 19:05 », heure de Paris. */
export function formatDeadlineFr(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const day = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
  return `${day} à ${time}`;
}

/** « jusqu'à 0,25 kg », ou null sans poids annoncé. */
export function weightLabelFr(kg: number | null | undefined): string | null {
  if (kg == null || !Number.isFinite(Number(kg))) return null;
  return `jusqu'à ${String(Number(kg)).replace(".", ",")} kg`;
}

export const moneyFr = (v: unknown) => `${Number(v ?? 0).toFixed(2).replace(".", ",")} €`;

/** Paragraphes du message au findr après paiement (email proposal_accepted et notification). */
export function findrAcceptedParagraphs(c: SaleContext): string[] {
  const buyr = buyrName(c);
  const first = clean(c.findrFirstName);
  const intro = `${first ? `${first}, bonne nouvelle` : "Bonne nouvelle"} : ${buyr} a accepté ta proposition et le paiement est enregistré.`;
  if (!c.labelFlow) {
    return [
      `${intro} ${capitalize(buyr)} doit maintenant choisir son mode de livraison. Nous te prévenons dès que c'est fait : tu pourras alors expédier l'objet.`,
    ];
  }
  const deadline = formatDeadlineFr(c.deadlineAt);
  const weight = weightLabelFr(c.weightKg);
  const next = deadline
    ? `Prochaine étape : ${buyr} achète l'étiquette d'expédition et te l'envoie avant le ${deadline}.`
    : `Prochaine étape : ${buyr} achète l'étiquette d'expédition et te l'envoie dans les 3 jours suivant l'enregistrement de ton adresse d'expédition.`;
  const paragraphs = [
    `${intro} ${next} Nous te prévenons dès qu'elle arrive. En attendant, prépare l'objet${weight ? ` (${weight})` : ""} et emballe-le avec soin.`,
  ];
  if (!c.hasShipFrom) {
    paragraphs.push(`Renseigne d'abord ton adresse d'expédition dans Mon espace : sans elle, ${buyr} ne peut pas créer l'étiquette.`);
  }
  return paragraphs;
}

export function findrAcceptedSubject(c: SaleContext): string {
  return c.labelFlow ? "Ta proposition a été acceptée — prépare ton colis" : "Ta proposition a été acceptée !";
}

/** Objet de l'email payment_confirmed au buyr. */
export function buyrPaymentSubject(c: SaleContext): string {
  if (!c.labelFlow) return "Paiement confirmé — choisis ta livraison";
  const deadline = formatDeadlineFr(c.deadlineAt);
  return deadline ? `Paiement confirmé — fournis l'étiquette avant le ${deadline}` : "Paiement confirmé — fournis l'étiquette d'expédition";
}

/** Texte de l'email payment_confirmed au buyr (et de sa notification). */
export function buyrPaymentText(c: SaleContext): string {
  const findr = findrName(c);
  const paid = `Ton paiement de ${moneyFr(c.totalPaid)} est confirmé.`;
  if (!c.labelFlow) {
    return `${paid} Choisis maintenant ton mode de livraison pour que ${findr} puisse expédier l'objet.`;
  }
  const deadline = formatDeadlineFr(c.deadlineAt);
  const buy = `Pour que ${findr} puisse expédier l'objet, achète l'étiquette d'expédition sur le site du transporteur de ton choix (Mondial Relay, Colissimo ou Chronopost), puis envoie-la sur findr`;
  if (deadline) {
    return `${paid} ${buy} avant le ${deadline}. Sans étiquette à cette date, la vente est annulée et tu es intégralement remboursé.`;
  }
  return `${paid} ${buy}. ${capitalize(findr)} doit d'abord renseigner son adresse d'expédition : nous te prévenons dès que c'est fait, et tu auras alors 3 jours pour fournir l'étiquette. Sans étiquette à cette date, la vente est annulée et tu es intégralement remboursé.`;
}

/** Message au findr sans adresse d'expédition au paiement (parcours avec étiquette). */
export function shipFromNeededText(c: SaleContext): string {
  return `${capitalize(buyrName(c))} a acheté ton objet, mais nous n'avons pas ton adresse d'expédition. Renseigne-la dans Mon espace pour que l'étiquette puisse être créée.`;
}
