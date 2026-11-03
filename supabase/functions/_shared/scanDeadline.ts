// Parcours étiquette : délai du premier scan du transporteur après l'envoi de l'étiquette.
// 7 jours calendaires après label_provided_at ; rappels au findr à 2 et 5 jours (alerte équipe à 5 jours),
// annulation et remboursement intégral à 7 jours ; le buyr peut annuler lui-même dès 5 jours.

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export const SCAN_DEADLINE_DAYS = 7;
export const SCAN_CANCEL_UNLOCK_DAYS = 5;

export type ScanRow = {
  payment_status: string | null;
  label_provided_at: string | null;
  shipped_at: string | null;
};

export type ScanReminderRow = ScanRow & {
  scan_reminder_2d_at: string | null;
  scan_reminder_5d_at: string | null;
};

export type ScanMark = "scan_reminder_2d_at" | "scan_reminder_5d_at";

export type ScanDeadlineAction =
  | { kind: "expire" }
  | { kind: "reminder"; marks: ScanMark[]; remainingMs: number; teamAlert: boolean }
  | null;

/** Étiquette fournie, colis pas encore scanné par le transporteur. */
export function isAwaitingFirstScan(r?: Partial<ScanRow> | null): boolean {
  return !!r && r.payment_status === "paye_en_attente_reception" && !!r.label_provided_at && !r.shipped_at;
}

const providedAt = (r: Partial<ScanRow>): number | null => {
  if (!r.label_provided_at) return null;
  const t = new Date(r.label_provided_at).getTime();
  return Number.isNaN(t) ? null : t;
};

/** Date limite du premier scan (ms), ou null hors attente du premier scan. */
export function scanDeadlineAt(r?: Partial<ScanRow> | null): number | null {
  if (!isAwaitingFirstScan(r)) return null;
  const t = providedAt(r!);
  return t === null ? null : t + SCAN_DEADLINE_DAYS * DAY;
}

/** Ouverture du droit d'annulation du buyr sans scan (ms), ou null hors attente du premier scan. */
export function scanCancelUnlockAt(r?: Partial<ScanRow> | null): number | null {
  if (!isAwaitingFirstScan(r)) return null;
  const t = providedAt(r!);
  return t === null ? null : t + SCAN_CANCEL_UNLOCK_DAYS * DAY;
}

/** Décide l'action de la tâche horaire pour une vente en attente du premier scan. */
export function planScanDeadline(r: ScanReminderRow, now: number): ScanDeadlineAction {
  const deadline = scanDeadlineAt(r);
  if (deadline === null) return null;
  if (now >= deadline) return { kind: "expire" };
  const elapsed = now - (deadline - SCAN_DEADLINE_DAYS * DAY);
  const marks: ScanMark[] = [];
  if (elapsed >= 5 * DAY && !r.scan_reminder_5d_at) {
    marks.push("scan_reminder_5d_at");
    if (!r.scan_reminder_2d_at) marks.push("scan_reminder_2d_at"); // un seul rappel si 2 jours a été manqué
  } else if (elapsed >= 2 * DAY && !r.scan_reminder_2d_at) {
    marks.push("scan_reminder_2d_at");
  }
  if (!marks.length) return null;
  return { kind: "reminder", marks, remainingMs: deadline - now, teamAlert: marks.includes("scan_reminder_5d_at") };
}

export const scanReminderTitle = (remaining: string) =>
  `Pense à déposer ton colis : il te reste ${remaining} avant l'annulation de la vente`;
export const SCAN_EXPIRED_BUYR_MESSAGE =
  "Vente annulée : le colis n'a pas été scanné par le transporteur dans le délai. Tu es intégralement remboursé.";
export const SCAN_EXPIRED_FINDR_MESSAGE = "Vente annulée : aucun scan du transporteur dans les 7 jours.";
