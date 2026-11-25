// Bloc « À faire maintenant » de Mon espace : ordre et découpage des actions.
// Les règles d'état viennent des helpers existants (buyrLabelAction, scanDeadline, shipFrom, stripeOnboarding).

export type TodoKind =
  | "label"
  | "receipt"
  | "pay"
  | "review"
  | "dropoff"
  | "message"
  | "shipFrom"
  | "stripe";

export interface TodoItem {
  key: string;
  kind: TodoKind;
  /** Échéance en ms (null = sans échéance). */
  deadline: number | null;
  /** Date de référence pour le contexte (livraison, expédition). */
  at?: string | null;
  status?: string | null;
  objectTitle?: string;
  name?: string;
  count?: number;
  href?: string;
}

export const TODO_VISIBLE = 4;

/** Échéance la plus proche d'abord, puis sans échéance ; à égalité « pay » passe en premier. */
export function sortTodos(items: TodoItem[]): TodoItem[] {
  return [...items].sort((a, b) => {
    const da = a.deadline ?? Infinity;
    const db = b.deadline ?? Infinity;
    if (da !== db) return da - db;
    const pa = a.kind === "pay" ? 0 : 1;
    const pb = b.kind === "pay" ? 0 : 1;
    return pa - pb;
  });
}

export function splitTodos(items: TodoItem[], expanded: boolean) {
  const sorted = sortTodos(items);
  return {
    visible: expanded ? sorted : sorted.slice(0, TODO_VISIBLE),
    hiddenCount: expanded ? 0 : Math.max(0, sorted.length - TODO_VISIBLE),
    total: sorted.length,
  };
}

/** Jours restants avant l'échéance, arrondis au jour supérieur (0 = aujourd'hui ou dépassée). */
export function daysLeft(deadline: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((deadline - now) / 86_400_000));
}

/** Jours écoulés depuis une date, en jours calendaires. */
export function daysAgo(at: string, now = Date.now()): number {
  const d = new Date(at);
  const n = new Date(now);
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  return Math.max(0, Math.round((start(n) - start(d)) / 86_400_000));
}

/**
 * Chiffre doré d'« Aujourd'hui » : les actions hors messages, plus le nombre
 * d'échanges non lus donné par unread_exchanges_count (une ligne « Réponds à… » par échange).
 */
export function todoNavCount(items: TodoItem[] | null | undefined, unreadExchanges: number): number {
  if (!items) return 0;
  return items.filter((it) => it.kind !== "message").length + Math.max(0, unreadExchanges || 0);
}
