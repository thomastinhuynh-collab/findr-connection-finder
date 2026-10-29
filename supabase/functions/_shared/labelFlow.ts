// Règles du parcours étiquette (buyr) : fichier, transporteur et éligibilité de la réservation.
import { AWAITING_LABEL } from "./paymentStatus.ts";

/** Étiquette refusée par le findr : le buyr peut en fournir une nouvelle. */
export const LABEL_REJECTED = "etiquette_refusee";
export const LABEL_UPLOAD_STATUSES = [AWAITING_LABEL, LABEL_REJECTED];

export const LABEL_MAX_BYTES = 1.5 * 1024 * 1024;
export const LABEL_CARRIERS = ["Mondial Relay", "Colissimo", "Chronopost"] as const;

export type LabelKind = "pdf" | "png" | "jpeg";
export type LabelFileError = "empty" | "too_large" | "signature" | "pdf_active_content";

const FORBIDDEN_PDF = /\/(JavaScript|JS|Launch|EmbeddedFile|OpenAction)(?![A-Za-z])/;

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
  if (kind === "pdf" && FORBIDDEN_PDF.test(new TextDecoder("latin1").decode(bytes))) {
    return { error: "pdf_active_content" };
  }
  return { kind };
}

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
