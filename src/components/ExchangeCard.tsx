import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/fees";
import ContainedPhoto from "@/components/ContainedPhoto";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { exchangeCardState, withdrawErrorKey, type CardProposal, type CardReservation, type ExchangeCardState } from "@/lib/exchangeCard";

const NAVY = "#070E42";
const GOLD = "#D9BB87";
const MUTED = "#5C5648";

interface Props {
  searchId: string;
  searchTitle: string;
  searchImage: string | null;
  buyrId: string;
  findrId: string;
  iAmBuyr: boolean;
  partnerFirstName: string;
  /** Prévient la conversation qu'une proposition existe (suggestions et champ adaptés). */
  onState?: (s: ExchangeCardState | null) => void;
}

/** Carte épinglée en haut d'une conversation : objet, prix, situation, une seule action. */
const ExchangeCard = ({ searchId, searchTitle, searchImage, buyrId, findrId, iAmBuyr, partnerFirstName, onState }: Props) => {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<ExchangeCardState | null>(null);
  const [image, setImage] = useState<string | null>(searchImage);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawnBanner, setWithdrawnBanner] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: props }, { data: resas }] = await Promise.all([
        supabase.from("proposals").select("id, status, proposed_price, created_at, image_urls, title")
          .eq("search_id", searchId).eq("findr_id", findrId),
        supabase.from("reservations")
          .select("id, status, proposal_id, expires_at, object_price, total_buyr_amount, findr_payout_amount, dispute_open, created_at, payment_status, delivery_type, label_provided_at, shipped_at, delivered_at, tracking_review_notified_at")
          .eq("search_id", searchId).eq("findr_id", findrId).eq("buyr_id", buyrId),
      ]);
      if (!alive) return;
      const s = exchangeCardState({ iAmBuyr, searchId, proposals: (props ?? []) as CardProposal[], reservations: (resas ?? []) as CardReservation[] });
      const latest = [...((props ?? []) as CardProposal[])].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
      if (latest?.image_urls?.[0]) setImage(latest.image_urls[0]);
      setState(s);
      onState?.(s);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchId, findrId, buyrId, iAmBuyr]);

  const withdraw = async () => {
    if (!state?.withdrawableId) return;
    setWithdrawing(true);
    setWithdrawError(null);
    const { error } = await supabase.rpc("withdraw_proposal", { _proposal_id: state.withdrawableId });
    setWithdrawing(false);
    setConfirmOpen(false);
    if (error) {
      setWithdrawError(t(`exchangeCard.withdraw.${withdrawErrorKey(error.message)}`, { name: partnerFirstName }));
      return;
    }
    const next: ExchangeCardState = { ...state, action: null, withdrawn: true, withdrawableId: null };
    setState(next);
    onState?.(next);
    setWithdrawnBanner(true);
  };

  if (!state) return null;
  const fmt = (n: number) => formatPrice(n, i18n.language);

  let situation = "";
  if (state.kind === "vente" && state.step) {
    situation = t("exchangeCard.step", {
      index: state.step.index, total: state.step.total,
      name: t(`saleSteps.${state.step.labelFlow ? "label" : "legacy"}.${state.step.key}`),
    });
  } else if (state.kind === "vente") {
    situation = t("exchangeCard.saleClosed");
  } else if (state.kind === "proposition" && state.withdrawn) {
    situation = t("exchangeCard.withdrawnState");
  } else if (state.kind === "proposition") {
    situation = iAmBuyr ? t("exchangeCard.yourTurn") : t("exchangeCard.awaiting", { name: partnerFirstName });
  } else if (state.kind === "reservation" && state.reservedUntil) {
    situation = t("exchangeCard.reservedUntil", {
      date: new Date(state.reservedUntil).toLocaleDateString(i18n.language.startsWith("en") ? "en-GB" : "fr-FR", { day: "numeric", month: "long" }),
    });
  }

  return (
    <>
    <section aria-label={t("exchangeCard.aria")} className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "#ECE6DA", backgroundColor: "#FFFFFF" }}>
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "#F5F1E8" }}>
        {image && <ContainedPhoto src={image} alt={searchTitle} className="h-full w-full" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold" style={{ color: NAVY }}>{searchTitle}</p>
        {state.price != null && (
          <p className="text-sm" style={{ color: NAVY }}>
            {fmt(Number(state.price))}
            {state.payout != null && <span style={{ color: MUTED }}> · {t("exchangeCard.youWillReceive", { amount: fmt(Number(state.payout)) })}</span>}
          </p>
        )}
        {situation && <p className="text-xs" style={{ color: MUTED }}>{situation}</p>}
        {state.multipleProposals && (
          <Link to={`/recherche/${searchId}`} className="inline-flex min-h-[32px] items-center text-xs font-medium underline focus-visible:outline focus-visible:outline-2"
            style={{ color: NAVY, outlineColor: NAVY }}>{t("exchangeCard.viewProposals")}</Link>
        )}
      </div>
      {state.action && (
        <div className="flex shrink-0 flex-col items-end">
          <Link to={state.action.href}
            className="inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ backgroundColor: GOLD, color: NAVY, outlineColor: NAVY }}>
            {t(`exchangeCard.actions.${state.action.key}`)}
          </Link>
          {state.withdrawableId && (
            <button type="button" onClick={() => { setWithdrawError(null); setConfirmOpen(true); }}
              className="inline-flex min-h-[44px] items-center px-2 text-sm font-medium underline focus-visible:outline focus-visible:outline-2"
              style={{ color: NAVY, outlineColor: NAVY }}>
              {t("exchangeCard.withdraw.button")}
            </button>
          )}
        </div>
      )}
    </section>
    {withdrawError && (
      <p role="alert" className="border-b px-4 py-3 text-sm" style={{ borderColor: "#F3D3C4", backgroundColor: "#FEF1EA", color: "#7A2E14" }}>{withdrawError}</p>
    )}
    {withdrawnBanner && (
      <div role="status" className="flex items-center gap-3 border-b px-4 py-3 text-sm" style={{ borderColor: "#BFDCC8", backgroundColor: "#E6F4EA", color: "#14532D" }}>
        <span className="flex-1">{t("exchangeCard.withdraw.success", { name: partnerFirstName })}</span>
        <button type="button" onClick={() => setWithdrawnBanner(false)} aria-label={t("exchangeCard.closeBanner")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2" style={{ outlineColor: "#14532D" }}>×</button>
      </div>
    )}
    <AlertDialog open={confirmOpen} onOpenChange={(o) => { if (!withdrawing) setConfirmOpen(o); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle style={{ color: NAVY }}>{t("exchangeCard.withdraw.title")}</AlertDialogTitle>
          <AlertDialogDescription style={{ color: MUTED }}>{t("exchangeCard.withdraw.text", { name: partnerFirstName })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-[44px]" disabled={withdrawing}>{t("exchangeCard.withdraw.keep")}</AlertDialogCancel>
          <AlertDialogAction className="min-h-[44px]" style={{ backgroundColor: NAVY, color: "#FFFFFF" }} disabled={withdrawing}
            onClick={(e) => { e.preventDefault(); void withdraw(); }}>
            {t("exchangeCard.withdraw.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default ExchangeCard;
