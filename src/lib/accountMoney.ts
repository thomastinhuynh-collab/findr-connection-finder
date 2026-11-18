// Montants et complétion affichés dans la rubrique « Mon compte ».
import { classifyProposalTab, netAmount, type FindrProposalFlags } from "./findrProposalRows";

export interface AccountSaleRow extends FindrProposalFlags {
  id: string;
  title?: string | null;
  reservation_id?: string | null;
  reservation_updated_at?: string | null;
  object_price?: number | null;
  findr_fee?: number | null;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** « Argent en attente » : somme des nets enregistrés des ventes payées non finalisées, hors litige ouvert. */
export const pendingEarnings = (rows: AccountSaleRow[]): number =>
  round(rows.filter((r) => classifyProposalTab(r) === "ongoing" && !r.dispute_open)
    .reduce((s, r) => s + (netAmount(r.object_price, r.findr_fee) ?? 0), 0));

/** « Ventes finalisées » : ventes terminées, de la plus récente à la plus ancienne. */
export const finalizedSales = (rows: AccountSaleRow[]) =>
  rows.filter((r) => r.payment_status === "termine")
    .map((r) => ({ id: r.reservation_id ?? r.id, title: r.title ?? null, finalizedAt: r.reservation_updated_at ?? null, net: netAmount(r.object_price, r.findr_fee) }))
    .sort((a, b) => new Date(b.finalizedAt ?? 0).getTime() - new Date(a.finalizedAt ?? 0).getTime());

/** Profil complété : photo, nom, ville et description comptent chacun pour un quart. */
export const profileCompletion = (p: { avatar_url?: string | null; full_name?: string | null; city?: string | null; bio?: string | null }): number => {
  const parts = [p.avatar_url, p.full_name, p.city, p.bio].map((v) => !!v && String(v).trim().length > 0);
  return Math.round((parts.filter(Boolean).length / parts.length) * 100);
};
