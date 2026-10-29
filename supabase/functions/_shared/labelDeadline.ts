// Règles du délai de l'étiquette (tâche horaire) : rappels à 24 h / 48 h et annulation à l'échéance.
import { AWAITING_LABEL, LABEL_REJECTED } from "./paymentStatus.ts";

const HOUR = 3_600_000;

export type LabelDeadlineRow = {
  payment_status: string | null;
  accepted_at: string | null;
  label_deadline_at: string | null;
  label_reminder_24h_at: string | null;
  label_reminder_48h_at: string | null;
};

export type LabelDeadlineAction =
  | { kind: "expire" }
  | { kind: "reminder"; marks: ("label_reminder_24h_at" | "label_reminder_48h_at")[]; remainingMs: number }
  | null;

/** Décide l'action à mener pour une réservation en attente d'étiquette. */
export function planLabelDeadline(r: LabelDeadlineRow, now: number): LabelDeadlineAction {
  const ps = r.payment_status ?? "";
  if (ps !== AWAITING_LABEL && ps !== LABEL_REJECTED) return null;
  if (!r.label_deadline_at) return null;
  const deadline = new Date(r.label_deadline_at).getTime();
  if (now >= deadline) return { kind: "expire" };
  // Rappels : seulement pour l'étiquette initiale, à 24 h et 48 h après le paiement.
  if (ps !== AWAITING_LABEL || !r.accepted_at) return null;
  const elapsed = now - new Date(r.accepted_at).getTime();
  const marks: ("label_reminder_24h_at" | "label_reminder_48h_at")[] = [];
  if (elapsed >= 48 * HOUR && !r.label_reminder_48h_at) {
    marks.push("label_reminder_48h_at");
    if (!r.label_reminder_24h_at) marks.push("label_reminder_24h_at"); // un seul rappel si 24 h a été manqué
  } else if (elapsed >= 24 * HOUR && !r.label_reminder_24h_at) {
    marks.push("label_reminder_24h_at");
  }
  return marks.length ? { kind: "reminder", marks, remainingMs: deadline - now } : null;
}

/** Durée restante lisible : « 2 jours », « 1 jour et 3 h », « 5 h ». */
export function formatRemaining(ms: number): string {
  const totalHours = Math.max(1, Math.floor(ms / HOUR));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days === 0) return `${hours} h`;
  const d = `${days} jour${days > 1 ? "s" : ""}`;
  return hours ? `${d} et ${hours} h` : d;
}

export const LABEL_EXPIRED_MESSAGE = "Vente annulée : l'étiquette n'a pas été fournie à temps. Tu n'as rien à faire côté envoi.";

/** Le buyr peut annuler lui-même tant que l'étiquette n'est pas fournie. */
export function buyrCanCancelBeforeLabel(status: string | null): boolean {
  return status === AWAITING_LABEL || status === LABEL_REJECTED;
}
