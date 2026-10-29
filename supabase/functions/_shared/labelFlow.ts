// Règles du parcours étiquette (buyr) : fichier, transporteur et éligibilité de la réservation.
import { AWAITING_LABEL } from "./paymentStatus.ts";

/** Étiquette refusée par le findr : le buyr peut en fournir une nouvelle. */
export const LABEL_REJECTED = "etiquette_refusee";
export const LABEL_UPLOAD_STATUSES = [AWAITING_LABEL, LABEL_REJECTED];

export const LABEL_MAX_BYTES = 1.5 * 1024 * 1024;
export const LABEL_CARRIERS = ["Mondial Relay", "Colissimo", "Chronopost"] as const;

export type LabelKind = "pdf" | "png" | "jpeg";
export type LabelFileError = "empty" | "too_large" | "signature" | "pdf_active_content" | "pdf_refused";

const FORBIDDEN_PDF = /\/(JavaScript|JS|Launch|EmbeddedFile|OpenAction)(?![A-Za-z])/;
// Actions, formulaires, contenus riches, chiffrement : refusés.
const REFUSED_PDF = /\/(AA|URI|SubmitForm|GoToR|GoToE|RichMedia|XFA|Encrypt)(?![A-Za-z0-9])/;
// Nom PDF commençant par « / » contenant un échappement hexadécimal #xx (masquage de mot-clé).
const HEX_ESCAPED_NAME = /\/[^\s\/\[\]<>(){}%]*#[0-9A-Fa-f]{2}/;
const OBJECT_STREAM = /\/ObjStm(?![A-Za-z0-9])/;

export function detectLabelKind(bytes: Uint8Array): LabelKind | null {
  const s = (i: number, sig: number[]) => sig.every((b, k) => bytes[i + k] === b);
  if (s(0, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "pdf"; // %PDF-
  if (s(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (s(0, [0xff, 0xd8, 0xff])) return "jpeg";
  return null;
}

export function validateLabelFile(bytes: Uint8Array): { kind: LabelKind } | { error: LabelFileError } {
  if (bytes.length === 0) return { error: "empty" };
  if (bytes.length > LABEL_MAX_BYTES) return { error: "too_large" };
  const kind = detectLabelKind(bytes);
  if (!kind) return { error: "signature" };
  if (kind === "pdf") {
    const text = new TextDecoder("latin1").decode(bytes);
    if (FORBIDDEN_PDF.test(text)) return { error: "pdf_active_content" };
    if (REFUSED_PDF.test(text) || HEX_ESCAPED_NAME.test(text)) return { error: "pdf_refused" };
  }
  return { kind };
}

/** Une étiquette peut être jointe à l'email du findr sauf un PDF à flux d'objets compressés (/ObjStm). */
export function canAttachLabel(kind: LabelKind, bytes: Uint8Array): boolean {
  if (kind !== "pdf") return true;
  return !OBJECT_STREAM.test(new TextDecoder("latin1").decode(bytes));
}

/** Durée de validité du lien signé de téléchargement de l'étiquette (secondes). */
export const LABEL_DOWNLOAD_TTL_SECONDS = 60;

export const LABEL_EXT: Record<LabelKind, string> = { pdf: "pdf", png: "png", jpeg: "jpg" };
export const LABEL_MIME: Record<LabelKind, string> = { pdf: "application/pdf", png: "image/png", jpeg: "image/jpeg" };

export type LabelEligibilityError = "flow_disabled" | "not_found" | "forbidden" | "status";

export function checkLabelEligibility(
  flowEnabled: boolean,
  reservation: { buyr_id: string; payment_status: string | null } | null,
  callerId: string,
): LabelEligibilityError | null {
  if (!flowEnabled) return "flow_disabled";
  if (!reservation) return "not_found";
  if (reservation.buyr_id !== callerId) return "forbidden";
  if (!LABEL_UPLOAD_STATUSES.includes(reservation.payment_status ?? "")) return "status";
  return null;
}

const PURGE_DAY = 86_400_000;
export const LABEL_PURGE_ENDED_DAYS = 30;
export const LABEL_PURGE_DELIVERED_DAYS = 7;
const ENDED_STATUSES = ["termine", "annule", "rembourse"];

export interface LabelPurgeCandidate {
  label_path: string | null;
  payment_status: string | null;
  dispute_open?: boolean | null;
  dispute_status?: string | null;
  dispute_resolved_at?: string | null;
  delivered_at?: string | null;
  updated_at: string;
}

/** Le fichier d'étiquette peut être effacé : 30 j après la fin de la vente, ou 7 j après « livré » ; jamais en litige ouvert. */
export function isLabelPurgeable(r: LabelPurgeCandidate, now = Date.now()): boolean {
  if (!r.label_path) return false;
  if (r.dispute_open || r.dispute_status === "ouvert") return false;
  if (ENDED_STATUSES.includes(r.payment_status ?? "")) {
    const end = Date.parse(r.dispute_resolved_at ?? r.updated_at);
    return Number.isFinite(end) && now - end >= LABEL_PURGE_ENDED_DAYS * PURGE_DAY;
  }
  if (r.payment_status === "livre" && r.delivered_at) {
    return now - Date.parse(r.delivered_at) >= LABEL_PURGE_DELIVERED_DAYS * PURGE_DAY;
  }
  return false;
}
