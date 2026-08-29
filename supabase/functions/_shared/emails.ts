// Gabarit HTML partagé + contenu des 10 emails transactionnels findr.
// Aucun web font : le logo est une image PNG hébergée sur le site publié.

export const SITE_URL = "https://findr-connection-finder.lovable.app";
export const LOGO_URL = `${SITE_URL}/logo-email.png`;
/** Nom de la pièce jointe inline : `<img src="cid:LOGO_CID">` (standard CID). */
export const LOGO_CID = "findr-logo.png";
export const CONTACT_EMAIL = "contact@findrapp.fr";
export const SENDER = { name: "Findr", email: "notifications@findrapp.fr" };
/** Expéditeur utilisé pour les emails relationnels (liste d'attente / beta). */
export const CONTACT_SENDER = { name: "Findr", email: "contact@findrapp.fr" };

const NAVY = "#0A1628";
const HEADER_NAVY = "#070E42";
const CREAM = "#F5F1E8";
const GOLD_TEXT = "#9A7A3D";
const GOLD_PILL = "#D9BB87";

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

interface Block {
  /** surtitre doré — omis pour les emails minimalistes */
  eyebrow?: string;
  /** titre serif — omis pour les emails minimalistes */
  title?: string;
  /** paragraphes de texte courant (déjà échappés par le builder) */
  paragraphs: string[];
  cta?: { label: string; url: string };
  /** encart d'information type "clé : valeur" */
  facts?: Array<{ label: string; value: string }>;
  imageUrl?: string | null;
  /** lien discret sous le CTA */
  secondary?: { label: string; url: string };
  /** titre du document HTML quand aucun titre visible n'est affiché */
  documentTitle?: string;
}


export function renderEmail(block: Block): string {
  const facts = block.facts?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:10px;margin:0 0 22px 0;">
        <tr><td style="padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${NAVY};">
        ${block.facts
          .map(
            (f) =>
              `<div style="margin:0 0 6px 0;"><span style="color:#6B7280;">${esc(
                f.label,
              )} :</span> <strong>${esc(f.value)}</strong></div>`,
          )
          .join("")}
        </td></tr></table>`
    : "";

  const image = block.imageUrl
    ? `<img src="${esc(block.imageUrl)}" alt="" width="472" style="width:100%;max-width:472px;border-radius:10px;display:block;margin:0 0 22px 0;" />`
    : "";

  const cta = block.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:6px auto 8px auto;">
        <tr><td align="center" bgcolor="${GOLD_PILL}" style="border-radius:999px;">
          <a href="${esc(block.cta.url)}" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${NAVY};text-decoration:none;border-radius:999px;">${esc(
            block.cta.label,
          )}</a>
        </td></tr></table>`
    : "";

  const secondary = block.secondary
    ? `<p style="margin:8px 0 0 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;"><a href="${esc(
        block.secondary.url,
      )}" style="color:#6B7280;text-decoration:underline;">${esc(block.secondary.label)}</a></p>`
    : "";

  const eyebrow = block.eyebrow
    ? `<p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${GOLD_TEXT};font-weight:bold;">${esc(
        block.eyebrow,
      )}</p>`
    : "";

  const heading = block.title
    ? `<h1 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:${NAVY};font-weight:normal;">${esc(
        block.title,
      )}</h1>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${esc(
    block.title ?? block.documentTitle ?? "Findr",
  )}</title></head>
<body style="margin:0;padding:0;background:${CREAM};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:28px 12px;">
<tr><td align="center">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(10,22,40,0.08);">
    <tr><td align="center" bgcolor="${HEADER_NAVY}" style="padding:26px 24px;">
      <img src="cid:${LOGO_CID}" alt="findr" width="132" style="display:block;border:0;width:132px;height:auto;" />
    </td></tr>
    <tr><td style="padding:30px 24px 26px 24px;">
      ${eyebrow}
      ${heading}
      ${image}
      ${block.paragraphs
        .map(
          (p) =>
            `<p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#374151;">${p}</p>`,
        )
        .join("")}
      ${facts}
      ${cta}
      ${secondary}
    </td></tr>
    <tr><td bgcolor="${CREAM}" style="padding:20px 24px;text-align:center;">
      <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6B7280;">Findr — L'objet que tu cherches existe quelque part.</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9CA3AF;">
        <a href="mailto:${CONTACT_EMAIL}" style="color:#9CA3AF;text-decoration:underline;">${CONTACT_EMAIL}</a>
        &nbsp;·&nbsp;
        <a href="${SITE_URL}/mon-espace" style="color:#9CA3AF;text-decoration:underline;">Se désabonner</a>
      </p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

export type EmailType =
  | "welcome"
  | "new_proposal"
  | "proposal_accepted"
  | "shipped"
  | "delivered"
  | "funds_released"
  | "auto_release"
  | "refund"
  | "dispute_opened"
  | "reservation_reminder"
  | "waitlist_signup"
  | "waitlist_welcome";

// deno-lint-ignore no-explicit-any
type Data = Record<string, any>;

const money = (v: unknown) => `${Number(v ?? 0).toFixed(2)} €`;

/** Construit sujet + HTML pour un type d'email donné. */
export function buildEmail(
  type: EmailType,
  data: Data,
): { subject: string; html: string } {
  const first = esc(data.firstName ?? data.name ?? "").trim();
  const hello = first ? `Salut ${first},` : "Salut,";

  switch (type) {
    case "welcome":
      return {
        subject: `Bienvenue sur Findr${first ? `, ${first}` : ""} !`,
        html: renderEmail({
          eyebrow: "Bienvenue",
          title: `Bienvenue sur Findr${first ? `, ${first}` : ""} !`,
          paragraphs: [
            `${hello} ravis de t'accueillir sur findr.`,
            "Ici, deux rôles cohabitent : en <strong>buyr</strong>, tu décris l'objet que tu cherches ; en <strong>findr</strong>, tu déniches des trouvailles pour les autres et tu es rémunéré pour ça.",
            "Chaque paiement est sécurisé jusqu'à la réception de l'objet.",
          ],
          cta: { label: "Poster ma première recherche", url: `${SITE_URL}/poster` },
          secondary: { label: "Découvrir les recherches en cours", url: `${SITE_URL}/recherches` },
        }),
      };

    case "new_proposal":
      return {
        subject: `Tu as reçu une proposition pour « ${data.searchTitle ?? "ta recherche"} »`,
        html: renderEmail({
          eyebrow: "Nouvelle proposition",
          title: `Une proposition vient d'arriver`,
          imageUrl: data.imageUrl ?? null,
          paragraphs: [
            `${hello} <strong>${esc(data.findrName ?? "un findr")}</strong> a répondu à ta recherche « ${esc(
              data.searchTitle ?? "",
            )} ».`,
          ],
          facts: [
            { label: "Objet", value: data.proposalTitle ?? "—" },
            { label: "Prix proposé", value: money(data.price) },
            { label: "Findr", value: data.findrName ?? "—" },
          ],
          cta: {
            label: "Voir la proposition",
            url: `${SITE_URL}/recherche/${esc(data.searchId ?? "")}`,
          },
        }),
      };

    case "proposal_accepted":
      return {
        subject: "Ta proposition a été acceptée !",
        html: renderEmail({
          eyebrow: "Proposition acceptée",
          title: "Ta proposition a été acceptée !",
          paragraphs: [
            `${hello} bonne nouvelle : le buyr a accepté ta proposition et le paiement est déjà sécurisé.`,
            "Il te reste à expédier l'objet et à renseigner le numéro de suivi <strong>dans les 5 jours</strong>, sinon la transaction pourra être annulée et remboursée.",
          ],
          facts: [
            { label: "Objet", value: data.itemTitle ?? "—" },
            { label: "Montant net à recevoir", value: money(data.payoutAmount) },
          ],
          cta: { label: "Marquer comme expédié", url: `${SITE_URL}/mes-propositions` },
        }),
      };

    case "shipped":
      return {
        subject: "Ton objet est en route !",
        html: renderEmail({
          eyebrow: "Expédition",
          title: "Ton objet est en route !",
          paragraphs: [
            `${hello} le findr vient d'expédier ton objet.`,
          ],
          facts: [
            { label: "Numéro de suivi", value: data.trackingNumber ?? "—" },
            ...(data.carrier ? [{ label: "Transporteur", value: data.carrier }] : []),
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
          ],
          cta: { label: "Suivre mon colis", url: `${SITE_URL}/mon-espace` },
        }),
      };

    case "delivered":
      return {
        subject: "Ton colis est arrivé — confirme la réception",
        html: renderEmail({
          eyebrow: "Livraison",
          title: "Ton colis est arrivé",
          paragraphs: [
            `${hello} le transporteur a marqué ton colis comme livré.`,
            "Confirme la réception pour libérer le paiement du findr. <strong>Sans action de ta part, les fonds seront libérés automatiquement sous 48 h.</strong>",
          ],
          cta: { label: "Confirmer la réception", url: `${SITE_URL}/mon-espace` },
          secondary: { label: "Signaler un problème", url: `${SITE_URL}/mon-espace` },
        }),
      };

    case "funds_released":
      return {
        subject: `Tu as reçu ton paiement : ${money(data.amount)}`,
        html: renderEmail({
          eyebrow: "Paiement",
          title: `Tu as reçu ${money(data.amount)}`,
          paragraphs: [
            `${hello} le paiement de ta trouvaille a été versé sur ton compte Stripe.`,
            "Selon ta banque, le virement peut prendre quelques jours ouvrés avant d'apparaître sur ton compte bancaire.",
          ],
          facts: [
            { label: "Montant net", value: money(data.amount) },
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
          ],
          cta: { label: "Voir mon portefeuille", url: `${SITE_URL}/mon-espace` },
        }),
      };

    case "auto_release": {
      const isFindr = data.role === "findr";
      return {
        subject: isFindr
          ? "Ton paiement a été libéré automatiquement"
          : "Le paiement a été libéré automatiquement",
        html: renderEmail({
          eyebrow: "Libération automatique",
          title: isFindr
            ? "Ton paiement a été libéré automatiquement"
            : "Le paiement a été libéré automatiquement",
          paragraphs: [
            `${hello} 48 h se sont écoulées depuis la livraison sans confirmation ni signalement.`,
            isFindr
              ? "Conformément aux CGV, le paiement a donc été libéré automatiquement et versé sur ton compte."
              : "Conformément aux CGV, le paiement a donc été libéré automatiquement et versé au findr.",
          ],
          facts: [
            ...(data.amount ? [{ label: "Montant", value: money(data.amount) }] : []),
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
          ],
          cta: { label: "Voir la transaction", url: `${SITE_URL}/mon-espace` },
        }),
      };
    }

    case "refund":
      return {
        subject: "Ta commande a été annulée — remboursement en cours",
        html: renderEmail({
          eyebrow: "Annulation",
          title: "Ta commande a été annulée",
          paragraphs: [
            `${hello} la transaction a été annulée${
              data.reason ? ` : ${esc(data.reason)}` : ""
            }.`,
            "Le remboursement a été demandé auprès de ta banque. Il apparaît généralement sous <strong>5 à 10 jours ouvrés</strong> selon ton établissement.",
          ],
          facts: [
            { label: "Montant remboursé (frais inclus)", value: money(data.amount) },
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
          ],
          cta: { label: "Voir mes transactions", url: `${SITE_URL}/mon-espace` },
        }),
      };

    case "dispute_opened":
      return {
        subject: "Un problème a été signalé sur ta transaction",
        html: renderEmail({
          eyebrow: "Signalement",
          title: "Un problème a été signalé",
          paragraphs: [
            `${hello} le buyr a signalé un problème concernant ta transaction. Le paiement reste bloqué le temps de l'examen.`,
            "Tu peux répondre directement via la messagerie pour apporter tes éléments. L'équipe findr examine la situation et tranchera de manière impartiale.",
          ],
          facts: [
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
            { label: "Motif du signalement", value: data.reasonLabel ?? "Non précisé" },
          ],
          cta: {
            label: "Répondre via la messagerie",
            url: data.searchId ? `${SITE_URL}/messagerie/${esc(data.searchId)}` : `${SITE_URL}/messagerie`,
          },
        }),
      };

    case "reservation_reminder":
      return {
        subject: "Ta réservation expire dans 2 jours",
        html: renderEmail({
          eyebrow: "Réservation",
          title: "Ta réservation expire dans 2 jours",
          paragraphs: [
            `${hello} ta réservation exclusive sur « ${esc(
              data.searchTitle ?? "une recherche",
            )} » arrive à échéance dans 2 jours.`,
            "Passé ce délai, la recherche redevient ouverte à tous les findrs. Fais ta proposition ou demande un renouvellement dès maintenant.",
          ],
          cta: {
            label: "Faire ma proposition",
            url: `${SITE_URL}/proposition/${esc(data.searchId ?? "")}`,
          },
          secondary: { label: "Renouveler ma réservation", url: `${SITE_URL}/mon-espace` },
        }),
      };

    case "waitlist_signup":
      return {
        subject: `Nouvelle inscription à la liste d'attente : ${esc(data.email ?? "")}`,
        html: renderEmail({
          eyebrow: "Liste d'attente",
          title: "Nouvelle inscription à la liste d'attente",
          paragraphs: [
            "Une nouvelle personne vient de rejoindre la liste d'attente findr.",
          ],
          facts: [
            { label: "Email", value: data.email ?? "—" },
            { label: "Rôle déclaré", value: data.role ?? "inconnu" },
            ...(data.count ? [{ label: "Total sur la liste", value: String(data.count) }] : []),
          ],
        }),
      };
  }
}
