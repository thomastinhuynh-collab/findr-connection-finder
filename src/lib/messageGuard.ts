/**
 * Détection locale (navigateur uniquement) d'un contact ou paiement hors findr.
 * Rien n'est envoyé ni enregistré : sert seulement à afficher un avertissement avant l'envoi.
 */
export type OffPlatformKind = "phone" | "email" | "iban" | "url" | "keyword";

const KEYWORDS = [
  "whatsapp", "telegram", "signal", "snapchat", "paypal", "virement", "wero",
  "lydia", "revolut", "western union", "en dehors du site",
];
const TLDS = "com|fr|net|org|io|be|ch|eu|co|me|ly|gl|app|shop|info|biz|de|es|it|uk|ca|us|xyz|site|store|online|link";

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
const KEYWORD_RE = new RegExp(`(^|[^a-z0-9])(${KEYWORDS.map(escapeRe).join("|")})(?=$|[^a-z0-9])`);
const EMAIL_RE = /[a-z0-9._%+-]+\s?(@|\(at\)|\[at\])\s?[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}/;
const URL_RE = new RegExp(`https?:\\/\\/|\\bwww\\.|\\b[a-z0-9][a-z0-9-]*\\.(${TLDS})\\b(\\/|$|[^a-z0-9])`);
const IBAN_RE = /\b[a-z]{2}\d{2}(?:[ ]?[a-z0-9]{4}){3,7}(?:[ ]?[a-z0-9]{1,3})?\b/;
// Suite de chiffres et séparateurs de téléphone (espace, point, tiret, parenthèses, +), sans « / ».
const PHONE_CANDIDATE_RE = /\+?\(?\d[\d\s.\-()]{6,}\d/g;

export function detectOffPlatformContact(text: string): OffPlatformKind | null {
  if (!text) return null;
  const t = normalize(text);
  if (EMAIL_RE.test(t)) return "email";
  if (IBAN_RE.test(t) && /\d{10,}/.test(t.replace(/\s/g, ""))) return "iban";
  if (URL_RE.test(t)) return "url";
  for (const m of t.matchAll(PHONE_CANDIDATE_RE)) {
    if (m[0].replace(/\D/g, "").length >= 10) return "phone";
  }
  if (KEYWORD_RE.test(t)) return "keyword";
  return null;
}
