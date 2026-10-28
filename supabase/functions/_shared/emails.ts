// Gabarit HTML partagé + contenu des 10 emails transactionnels findr.
// Aucun web font : le logo est une image PNG hébergée sur le site publié.

import { trackingUrl } from "./tracking.ts";

export const SITE_URL = "https://findr-connection-finder.lovable.app";
export const LOGO_URL = `${SITE_URL}/logo-email.png`;
/** Nom de la pièce jointe inline : `<img src="cid:LOGO_CID">` (standard CID). */
export const LOGO_CID = "findr-logo.png";
export const CONTACT_EMAIL = "contact@findrapp.fr";
export const SENDER = { name: "Findr", email: "notifications@findrapp.fr" };
/** Expéditeur utilisé pour les emails relationnels (liste d'attente / beta). */
export const CONTACT_SENDER = { name: "Findr", email: "contact@findrapp.fr" };

const NAVY = "#070E42";
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
  /** phrase discrète affichée sous le CTA (texte brut, échappé) */
  footnote?: string;
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
      <img src="${LOGO_URL}" alt="findr" width="132" style="display:block;border:0;width:132px;height:auto;" />
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
      ${block.footnote ? `<p style="margin:18px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6B7280;">${esc(block.footnote)}</p>` : ""}
    </td></tr>
    <tr><td bgcolor="${CREAM}" style="padding:20px 24px;text-align:center;">
      <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6B7280;">Findr — L'objet que tu cherches existe quelque part.</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9CA3AF;">
        <a href="mailto:${CONTACT_EMAIL}" style="color:#9CA3AF;text-decoration:underline;">${CONTACT_EMAIL}</a>
        &nbsp;·&nbsp;
        <a href="${SITE_URL}/mon-espace" style="color:#9CA3AF;text-decoration:underline;">Mon espace</a>
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
  | "tracking_review"
  | "label_ready"
  | "delivered"
  | "funds_released"
  | "auto_release"
  | "refund"
  | "dispute_opened"
  | "dispute_received"
  | "dispute_resolved_buyr"
  | "dispute_resolved_findr"
  | "chargeback_opened"
  | "reservation_reminder"
  | "waitlist_signup"
  | "waitlist_welcome"
  | "waitlist_confirm"
  | "waitlist_invite"
  | "waitlist_account_invite";

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
  const transactionUrl = data.reservationId
    ? `${SITE_URL}/transaction/${encodeURIComponent(String(data.reservationId))}`
    : `${SITE_URL}/mon-espace`;

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
            "Le versement au findr intervient après la confirmation de réception de l'objet.",
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
            `${hello} bonne nouvelle : le buyr a accepté ta proposition et le paiement a bien été effectué.`,
            "Il te reste à expédier l'objet et à renseigner le numéro de suivi <strong>dans les 5 jours</strong>, sinon la transaction pourra être annulée et remboursée.",
          ],
          facts: [
            { label: "Objet", value: data.itemTitle ?? "—" },
            { label: "Montant net à recevoir", value: money(data.payoutAmount) },
          ],
          cta: { label: "Expédier mon objet", url: transactionUrl },
        }),
      };

    case "shipped": {
      const trackUrl = trackingUrl(data.carrier, data.trackingNumber);
      return {
        subject: "Ton objet est en route !",
        html: renderEmail({
          eyebrow: "Expédition",
          title: "Ton objet est en route !",
          paragraphs: [
            `${hello} le findr vient d'expédier ton objet.`,
            trackUrl
              ? `Suis l'avancée de ton colis directement chez le transporteur : <a href="${esc(
                  trackUrl,
                )}" style="color:${NAVY};font-weight:bold;">${esc(data.trackingNumber ?? "")}</a>`
              : "Le numéro de suivi te sera communiqué prochainement.",
          ],
          facts: [
            { label: "Numéro de suivi", value: data.trackingNumber ?? "—" },
            ...(data.carrier ? [{ label: "Transporteur", value: data.carrier }] : []),
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
          ],
          cta: {
            label: "Suivre mon colis",
            url: transactionUrl,
          },
          secondary: { label: "Voir la transaction", url: transactionUrl },
        }),
      };
    }


    case "tracking_review":
      return {
        subject: "Suivi à vérifier — versement en revue",
        html: renderEmail({
          eyebrow: "Suivi à vérifier",
          title: "Le suivi de ton colis doit être vérifié",
          paragraphs: [
            data.role === "team" ? `La transaction ${esc(data.reservationId)} nécessite un examen du suivi.` : `${hello} le transporteur ne confirme pas encore le suivi de ce colis.`,
            data.reason === "old" ? "Ce numéro correspond à un envoi antérieur au paiement." : "Aucun événement de suivi fiable n'a été confirmé dans le délai prévu.",
            "Le versement est en revue : aucun versement automatique ne sera effectué avant l'examen par l'équipe findr.",
          ],
          cta: { label: "Voir la transaction", url: transactionUrl },
        }),
      };

    case "label_ready":
      return {
        subject: "Tu peux créer l'étiquette d'envoi",
        html: renderEmail({
          eyebrow: "Étiquette d'envoi",
          title: "L'étiquette peut être créée",
          paragraphs: [
            `${hello} le findr a renseigné son adresse d'expédition.`,
            "Tu peux maintenant créer l'étiquette d'envoi <strong>dans les 3 jours</strong> et la fournir depuis la page de la transaction.",
          ],
          facts: data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : undefined,
          cta: { label: "Voir la transaction", url: transactionUrl },
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
            "Confirme la réception pour déclencher le versement au findr. <strong>Sans action de ta part, le versement sera déclenché automatiquement sous 48 h.</strong>",
          ],
          cta: { label: "Voir la transaction", url: transactionUrl },
          secondary: { label: "Signaler un problème", url: transactionUrl },
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
          cta: { label: "Voir la transaction", url: transactionUrl },
        }),
      };

    case "auto_release": {
      const isFindr = data.role === "findr";
      return {
        subject: isFindr
          ? "Ton versement a été déclenché automatiquement"
          : "Le versement a été déclenché automatiquement",
        html: renderEmail({
          eyebrow: "Versement automatique",
          title: isFindr
            ? "Ton versement a été déclenché automatiquement"
            : "Le versement a été déclenché automatiquement",
          paragraphs: [
            `${hello} 48 h se sont écoulées depuis la livraison sans confirmation ni signalement.`,
            isFindr
              ? "Conformément aux CGV, le versement a donc été déclenché automatiquement : il est effectué par Stripe."
              : "Conformément aux CGV, le versement au findr a donc été déclenché automatiquement.",
          ],
          facts: [
            ...(data.amount ? [{ label: "Montant", value: money(data.amount) }] : []),
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
          ],
          cta: { label: "Voir la transaction", url: transactionUrl },
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
          cta: { label: "Voir la transaction", url: transactionUrl },
        }),
      };

    case "dispute_opened":
      return {
        subject: "Un problème a été signalé sur ta transaction",
        html: renderEmail({
          eyebrow: "Signalement",
          title: "Un problème a été signalé",
          paragraphs: [
            `${hello} le buyr a signalé un problème concernant ta transaction. Le versement est suspendu le temps de l'examen.`,
            "Tu peux répondre directement via la messagerie pour apporter tes éléments. L'équipe findr examine la situation et tranchera de manière impartiale.",
          ],
          facts: [
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
            { label: "Motif du signalement", value: data.reasonLabel ?? "Non précisé" },
          ],
          cta: {
            label: "Voir la transaction",
            url: transactionUrl,
          },
        }),
      };

    case "dispute_received":
      return {
        subject: "Ton signalement a bien été enregistré",
        html: renderEmail({
          eyebrow: "Signalement",
          title: "Nous avons reçu ton signalement",
          paragraphs: [
            `${hello} ton signalement a bien été enregistré. Le versement au findr est suspendu : aucune somme ne lui sera versée avant la fin de l'examen.`,
            "L'équipe findr examine ta réclamation et revient vers toi sous 48 heures ouvrées. Tu peux ajouter des éléments à tout moment via la messagerie.",
          ],
          facts: [
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
            { label: "Motif du signalement", value: data.reasonLabel ?? "Non précisé" },
          ],
          cta: {
            label: "Voir la transaction",
            url: transactionUrl,
          },
        }),
      };

    case "dispute_resolved_buyr": {
      const refunded = data.outcome === "rembourse_buyr";
      return {
        subject: refunded
          ? "Litige résolu — tu es remboursé"
          : "Litige résolu — décision de l'équipe findr",
        html: renderEmail({
          eyebrow: "Litige résolu",
          title: refunded ? "Ta réclamation a été acceptée" : "Décision sur ton signalement",
          paragraphs: [
            refunded
              ? `${hello} après examen des éléments, ta réclamation a été acceptée. La transaction est annulée et tu es intégralement remboursé, frais de service inclus.`
              : `${hello} après examen des éléments, l'équipe findr a estimé que la transaction devait être réglée au findr. Le paiement a donc été versé.`,
            refunded
              ? "Le remboursement apparaît généralement sous 5 à 10 jours ouvrés selon ta banque."
              : "Si tu penses que des éléments n'ont pas été pris en compte, réponds à cet email : nous réexaminerons le dossier.",
          ],
          facts: [
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
            ...(data.amount ? [{ label: refunded ? "Montant remboursé" : "Montant versé", value: money(data.amount) }] : []),
            ...(data.notes ? [{ label: "Motif de la décision", value: data.notes }] : []),
          ],
          cta: { label: "Voir la transaction", url: transactionUrl },
        }),
      };
    }

    case "dispute_resolved_findr": {
      const refunded = data.outcome === "rembourse_buyr";
      return {
        subject: refunded
          ? "Litige résolu — le buyr a été remboursé"
          : "Litige résolu — ton versement est déclenché",
        html: renderEmail({
          eyebrow: "Litige résolu",
          title: refunded ? "Le buyr a été remboursé" : "Ton versement est déclenché",
          paragraphs: [
            refunded
              ? `${hello} après examen des éléments, l'équipe findr a décidé de rembourser intégralement le buyr. La transaction est annulée.`
              : `${hello} après examen des éléments, l'équipe findr a tranché en ta faveur. Le versement te sera effectué par Stripe.`,
            refunded
              ? "Si tu souhaites apporter des éléments complémentaires, réponds à cet email."
              : "Le virement arrive généralement sous 1 à 3 jours ouvrés selon ta banque.",
          ],
          facts: [
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
            ...(data.amount && !refunded ? [{ label: "Montant versé", value: money(data.amount) }] : []),
            ...(data.notes ? [{ label: "Motif de la décision", value: data.notes }] : []),
          ],
          cta: { label: "Voir la transaction", url: transactionUrl },
        }),
      };
    }

    case "chargeback_opened":
      return {
        subject: "Contestation bancaire sur une transaction déjà réglée",
        html: renderEmail({
          eyebrow: "Contestation bancaire",
          title: "Une contestation bancaire a été ouverte",
          paragraphs: [
            `${hello} une contestation bancaire a été ouverte sur une transaction déjà réglée.`,
            `Conformément à l'article 12 de nos CGV, le montant de <strong>${money(
              data.amount,
            )}</strong> sera déduit de tes prochains versements. Aucune action n'est requise de ta part pour l'instant.`,
            "Si la contestation est finalement rejetée par la banque, ce montant sera automatiquement annulé.",
          ],
          facts: [
            ...(data.itemTitle ? [{ label: "Objet", value: data.itemTitle }] : []),
            { label: "Montant concerné", value: money(data.amount) },
          ],
          cta: { label: "Voir la transaction", url: transactionUrl },
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

    case "waitlist_welcome":
      return {
        subject: "Bienvenue chez les beta testeurs Findr",
        html: renderEmail({
          documentTitle: "Bienvenue chez les beta testeurs Findr",
          paragraphs: [
            `Merci${first ? ` ${first}` : ""}, c'est officiel : tu es beta testeur de Findr.`,
            "On te tient au courant de l'avancée du projet au fur et à mesure.",
            "L'équipe Findr",
          ],
        }),
      };



    case "waitlist_confirm":
      return {
        subject: "Confirme ton inscription à findr",
        html: renderEmail({
          documentTitle: "Confirme ton inscription à findr",
          paragraphs: [
            `${hello} merci de ton intérêt pour findr !`,
            "Pour rejoindre la liste d'attente, confirme ton adresse email en cliquant sur le bouton ci-dessous.",
            "Si tu n'es pas à l'origine de cette demande, ignore ce message : ton adresse sera supprimée.",
          ],
          cta: { label: "Confirmer mon inscription", url: String(data.confirmUrl ?? SITE_URL) },
        }),
      };

    case "waitlist_invite":
      return {
        subject: "Ton compte findr : veux-tu être prévenu(e) de l'ouverture ?",
        html: renderEmail({
          documentTitle: "Ton compte findr : veux-tu être prévenu(e) de l'ouverture ?",
          paragraphs: [
            `${hello} tu as créé un compte sur findr alors que l'application est encore en bêta fermée. Pour être prévenu(e) de l'ouverture, confirme ton adresse.`,
          ],
          cta: { label: "Confirmer mon inscription", url: String(data.confirmUrl ?? SITE_URL) },
          footnote:
            "Si tu ne fais rien, rien ne sera enregistré et ton adresse sera retirée de la liste sous 7 jours. Pour supprimer ton compte, réponds simplement à ce message.",
        }),
      };

    case "waitlist_account_invite":
      return {
        subject: `Nouveau compte : invitation envoyée à ${esc(data.email ?? "")}`,
        html: renderEmail({
          eyebrow: "Liste d'attente",
          title: "Nouveau compte : invitation envoyée",
          paragraphs: [`Nouveau compte : invitation envoyée à ${esc(data.email ?? "")}.`],
          facts: [{ label: "Email", value: data.email ?? "—" }],
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
            ...(data.count ? [{ label: "Total sur la liste", value: String(data.count) }] : []),
          ],
        }),
      };
  }
}
