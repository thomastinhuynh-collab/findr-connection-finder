// Page de transaction : une page par achat/vente, visible uniquement
// par le buyr et le findr de la réservation (RLS côté serveur).
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageCircle,
  Package,
  Truck,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import NotFound from "@/pages/NotFound";
import DisputeDialog from "@/components/DisputeDialog";
import DeliveryChoicePicker, {
  DeliveryAddress,
  DeliveryRelayPoint,
} from "@/components/DeliveryChoicePicker";
import ServiceFeeLabel from "@/components/ServiceFeeLabel";
import { computeFees, formatPrice } from "@/lib/fees";
import { trackingUrl } from "@/lib/tracking";

const NAVY = "#070E42";
const GOLD = "#D9BB87";
const CREAM = "#F5F0EA";

const DAY = 24 * 60 * 60 * 1000;
const PAID_STATUSES = ["paye_en_attente_reception", "expedie", "livre", "versement_en_revue", "termine"];

const LABEL_SITES = [
  { key: "mondial_relay", label: "Mondial Relay", url: "https://www.mondialrelay.fr/envoi-de-colis/" },
  { key: "colissimo", label: "Colissimo", url: "https://www.laposte.fr/envoyer-colis" },
  { key: "chronopost", label: "Chronopost", url: "https://www.chronopost.fr/fr/expedier-colis" },
];

const CARRIER_OPTIONS = ["Colissimo", "Chronopost", "Mondial Relay", "UPS", "other"] as const;

interface ReservationRow {
  id: string;
  search_id: string;
  findr_id: string;
  buyr_id: string;
  proposal_id: string | null;
  object_price: number | null;
  buyr_fee: number | null;
  findr_fee: number | null;
  total_buyr_amount: number | null;
  findr_payout_amount: number | null;
  payment_status: string | null;
  delivery_type: string | null;
  delivery_address: DeliveryAddress | null;
  delivery_relay_point: DeliveryRelayPoint | null;
  tracking_number: string | null;
  carrier: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  accepted_at: string | null;
  created_at: string;
  dispute_status: string | null;
}

interface ProposalRow {
  id: string;
  title: string;
  proposed_price: number;
  image_urls: string[] | null;
  object_size: string | null;
}

const firstName = (full: string | null | undefined) =>
  (full || "").trim().split(/\s+/)[0] || "";

const Transaction = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<ReservationRow | null>(null);
  const [proposal, setProposal] = useState<ProposalRow | null>(null);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [buyrName, setBuyrName] = useState<string>("");
  const [findrName, setFindrName] = useState<string>("");

  const [carrier, setCarrier] = useState<string>("");
  const [carrierOther, setCarrierOther] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmReceiptOpen, setConfirmReceiptOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user || !reservationId) {
      if (!authLoading) setLoading(false);
      return;
    }
    const { data: r } = await supabase
      .from("reservations")
      .select(
        "id, search_id, findr_id, buyr_id, proposal_id, object_price, buyr_fee, findr_fee, total_buyr_amount, findr_payout_amount, payment_status, delivery_type, delivery_address, delivery_relay_point, tracking_number, carrier, shipped_at, delivered_at, accepted_at, created_at, dispute_status",
      )
      .eq("id", reservationId)
      .maybeSingle();

    if (!r) {
      setReservation(null);
      setLoading(false);
      return;
    }
    const res = r as unknown as ReservationRow;
    setReservation(res);

    const [{ data: p }, { data: s }, { data: profiles }] = await Promise.all([
      res.proposal_id
        ? supabase
            .from("proposals")
            .select("id, title, proposed_price, image_urls, object_size")
            .eq("id", res.proposal_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("searches").select("title").eq("id", res.search_id).maybeSingle(),
      supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", [res.buyr_id, res.findr_id]),
    ]);
    setProposal((p as ProposalRow | null) ?? null);
    setSearchTitle(s?.title ?? "");
    (profiles || []).forEach((pr) => {
      if (pr.user_id === res.buyr_id) setBuyrName(pr.full_name || "");
      if (pr.user_id === res.findr_id) setFindrName(pr.full_name || "");
    });
    setLoading(false);
  }, [user, authLoading, reservationId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkShipped = async () => {
    if (!reservation) return;
    const finalCarrier = carrier === "other" ? carrierOther.trim() : carrier;
    if (trackingNumber.trim().length < 4 || finalCarrier.length < 2) {
      toast({
        title: t("proposal.missingInfoTitle"),
        description: t("proposal.missingInfoDesc"),
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("mark-shipped", {
        body: {
          reservationId: reservation.id,
          trackingNumber: trackingNumber.trim(),
          carrier: finalCarrier,
        },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error ?? error?.message);
      toast({ title: t("proposal.shippedTitle"), description: t("proposal.shippedDesc") });
      setTrackingNumber("");
      setCarrier("");
      setCarrierOther("");
      load();
    } catch (e: any) {
      toast({ title: t("common.error"), description: e?.message ?? t("proposal.shipError"), variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!reservation) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("release-funds-to-findr", {
        body: { reservationId: reservation.id },
      });
      if (error) {
        let detail = error.message;
        const res = (error as { context?: Response })?.context;
        if (res && typeof res.json === "function") {
          try {
            const payload = await res.json();
            if (payload?.error) detail = payload.error;
          } catch {
            /* corps non JSON */
          }
        }
        throw new Error(detail);
      }
      if (data?.error) throw new Error(data.error);
      toast({ title: t("proposal.transactionDoneTitle"), description: t("proposal.transactionDoneDesc") });
      setConfirmReceiptOpen(false);
      load();
    } catch (e: any) {
      toast({ title: t("common.error"), description: e?.message ?? t("proposal.confirmReceiptError"), variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRefund = async () => {
    if (!reservation) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-reservation-refund", {
        body: { reservationId: reservation.id },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error ?? error?.message);
      toast({ title: t("proposal.cancelConfirmedTitle"), description: t("proposal.cancelConfirmedDesc") });
      setCancelOpen(false);
      load();
    } catch (e: any) {
      toast({ title: t("common.error"), description: e?.message ?? t("proposal.cancelError"), variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" aria-label={t("common.loading")} />
      </div>
    );
  }

  // RLS : seuls le buyr et le findr de la réservation reçoivent une ligne.
  if (!user || !reservation) return <NotFound />;

  const isFindr = user.id === reservation.findr_id;
  const isBuyr = user.id === reservation.buyr_id;
  if (!isFindr && !isBuyr) return <NotFound />;

  const otherName = isFindr ? firstName(buyrName) : firstName(findrName);
  const otherId = isFindr ? reservation.buyr_id : reservation.findr_id;
  const ps = reservation.payment_status ?? "";
  const price = reservation.object_price ?? proposal?.proposed_price ?? 0;
  const fees = computeFees(price);

  // Frise d'avancement en six étapes
  const paid = PAID_STATUSES.includes(ps);
  const shipped = paid && (!!reservation.shipped_at || ["expedie", "livre", "versement_en_revue", "termine"].includes(ps));
  const deliveryChosen = paid && (!!reservation.delivery_type || shipped);
  const arrived = !!reservation.delivered_at || ["livre", "versement_en_revue", "termine"].includes(ps);
  const received = ["versement_en_revue", "termine"].includes(ps);
  const payoutDone = ps === "termine";
  const stepDone = [paid, deliveryChosen, shipped, arrived, received, payoutDone];
  const currentStep = stepDone.findIndex((d) => !d);
  const STEP_KEYS = ["paid", "deliveryChosen", "toShip", "enRoute", "received", "payout"] as const;

  // Annulation buyr : 5 jours sans expédition, 10 jours après expédition jamais livrée.
  const cancelUnlockAt = () => {
    if (!["paye_en_attente_reception", "expedie", "livre"].includes(ps)) return null;
    if (reservation.shipped_at) return new Date(reservation.shipped_at).getTime() + 10 * DAY;
    const since = new Date(reservation.accepted_at ?? reservation.created_at).getTime();
    return since + 5 * DAY;
  };
  const unlock = cancelUnlockAt();
  const canBuyrCancel = unlock !== null && Date.now() >= unlock;
  const cancelCountdown = () => {
    if (unlock === null) return null;
    const remaining = unlock - Date.now();
    if (remaining <= 0) return null;
    const days = Math.floor(remaining / DAY);
    const hours = Math.floor((remaining % DAY) / (60 * 60 * 1000));
    const delay =
      days > 0
        ? `${t("proposal.delayDays", { count: days })}${hours > 0 ? t("proposal.delayAndHours", { hours }) : ""}`
        : t("proposal.delayHours", { count: Math.max(hours, 1) });
    return reservation.shipped_at
      ? t("proposal.countdownShipped", { delay })
      : t("proposal.countdownNotShipped", { delay });
  };
  const countdown = cancelCountdown();

  const trackUrl = trackingUrl(reservation.carrier, reservation.tracking_number);
  const showShipFlow = isFindr && ps === "paye_en_attente_reception" && !reservation.shipped_at;
  const showFindrTracking = isFindr && shipped && !payoutDone;
  const showDeliveryPicker = isBuyr && ps === "paye_en_attente_reception" && !reservation.delivery_type && !reservation.shipped_at;
  const showBuyrReceipt = isBuyr && ["expedie", "livre"].includes(ps) && reservation.dispute_status !== "ouvert";

  const sizeKey = proposal?.object_size as "S" | "M" | "L" | "XL" | null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* En-tête */}
        <header className="flex gap-4 items-start">
          {proposal?.image_urls?.[0] ? (
            <img
              src={proposal.image_urls[0]}
              alt={proposal.title}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: CREAM }}
            >
              <Package className="w-7 h-7" style={{ color: "#8A8070" }} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-medium text-[22px] leading-tight" style={{ color: NAVY }}>
              {proposal?.title ?? t("transaction.title")}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#666666" }}>
              {formatPrice(price, i18n.language)}
              {otherName ? ` · ${t("transaction.with", { name: otherName })}` : ""}
            </p>
            <Link
              to={`/recherche/${reservation.search_id}`}
              className="text-sm font-medium hover:underline underline-offset-4 inline-block mt-1"
              style={{ color: NAVY }}
            >
              {t("transaction.viewSearch")} →
            </Link>
          </div>
        </header>

        {/* Frise d'avancement */}
        <ol className="grid grid-cols-3 sm:grid-cols-6 gap-y-4" aria-label={t("transaction.title")}>
          {STEP_KEYS.map((key, i) => {
            const done = stepDone[i];
            const current = i === currentStep;
            return (
              <li key={key} className="flex flex-col items-center text-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 30,
                    height: 30,
                    fontSize: 13,
                    fontWeight: 600,
                    backgroundColor: done ? NAVY : "#FFFFFF",
                    color: done ? CREAM : NAVY,
                    border: current ? `2px solid ${GOLD}` : `1.5px solid ${done ? NAVY : "#D9D2C4"}`,
                  }}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    lineHeight: 1.2,
                    fontWeight: current ? 600 : 400,
                    color: done || current ? NAVY : "#9A9284",
                  }}
                >
                  {t(`transaction.steps.${key}`)}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Carte d'action — findr : expédition en trois sous-étapes */}
        {showShipFlow && (
          <section
            className="rounded-2xl p-5 space-y-5"
            style={{ border: `1px solid ${GOLD}`, backgroundColor: "#FFFFFF" }}
            aria-labelledby="tx-ship"
          >
            <h2 id="tx-ship" className="font-display font-medium text-lg" style={{ color: NAVY }}>
              {t("transaction.shipYourItem")}
            </h2>

            {/* 1. Où l'envoyer */}
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: NAVY }}>
                1. {t("transaction.whereToSend")}
              </p>
              {reservation.delivery_type ? (
                <div className="rounded-lg p-3 text-sm space-y-1" style={{ backgroundColor: CREAM }}>
                  <p className="font-medium" style={{ color: NAVY }}>
                    {reservation.delivery_type === "domicile"
                      ? t("transaction.homeDelivery")
                      : t("transaction.relayDelivery")}
                  </p>
                  {reservation.delivery_type === "domicile" && reservation.delivery_address ? (
                    <p style={{ color: "#44403A" }}>
                      {otherName && `${otherName} — `}
                      {reservation.delivery_address.street}, {reservation.delivery_address.postal_code}{" "}
                      {reservation.delivery_address.city}
                    </p>
                  ) : null}
                  {reservation.delivery_type === "point_relais" && reservation.delivery_relay_point ? (
                    <p style={{ color: "#44403A" }}>
                      {reservation.delivery_relay_point.name} — {reservation.delivery_relay_point.address}
                      {reservation.delivery_relay_point.postal_code
                        ? `, ${reservation.delivery_relay_point.postal_code}`
                        : ""}
                    </p>
                  ) : null}
                  {sizeKey && (
                    <p className="text-xs pt-1" style={{ color: "#666666" }}>
                      {t("transaction.sizeLabel")} : {t(`transaction.size.${sizeKey}`)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "#666666" }}>
                  {t("transaction.waitingDelivery", { name: otherName || t("transaction.theBuyr") })}
                </p>
              )}
            </div>

            {/* 2. Crée ton étiquette */}
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: NAVY }}>
                2. {t("transaction.createLabel")}
              </p>
              <div className="flex flex-wrap gap-2">
                {LABEL_SITES.map((site) => (
                  <a
                    key={site.key}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                    style={{ border: `1.5px solid ${NAVY}`, color: NAVY }}
                  >
                    {site.label}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: "#666666" }}>
                {t("transaction.labelHint", { name: otherName || t("transaction.theBuyr") })}
              </p>
            </div>

            {/* 3. Numéro de suivi */}
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: NAVY }}>
                3. {t("transaction.trackingStep")}
              </p>
              {reservation.delivery_type ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-carrier">{t("transaction.carrier")}</Label>
                    <select
                      id="tx-carrier"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">{t("common.select")}</option>
                      {CARRIER_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c === "other" ? t("transaction.carrierOther") : c}
                        </option>
                      ))}
                    </select>
                  </div>
                  {carrier === "other" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="tx-carrier-other">{t("transaction.carrierOtherName")}</Label>
                      <Input
                        id="tx-carrier-other"
                        value={carrierOther}
                        onChange={(e) => setCarrierOther(e.target.value)}
                        placeholder="DPD, GLS…"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="tx-tracking">{t("transaction.trackingNumber")}</Label>
                    <Input
                      id="tx-tracking"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Ex. 6A12345678901"
                    />
                  </div>
                  <Button onClick={handleMarkShipped} disabled={isProcessing} className="w-full sm:w-auto">
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t("common.saving")}
                      </>
                    ) : (
                      <>
                        <Truck className="w-4 h-4 mr-2" />
                        {t("transaction.confirmShipment")}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-xs" style={{ color: "#9A9284" }}>
                  {t("transaction.trackingLocked")}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Findr : colis expédié → suivi */}
        {showFindrTracking && reservation.tracking_number && (
          <section
            className="rounded-2xl p-5"
            style={{ border: `1px solid ${GOLD}`, backgroundColor: "#FFFFFF" }}
            aria-labelledby="tx-tracking-section"
          >
            <h2 id="tx-tracking-section" className="font-display font-medium text-lg mb-2" style={{ color: NAVY }}>
              {t("transaction.shippedTracking")}
            </h2>
            <a
              href={trackUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2"
              style={{ color: NAVY }}
            >
              {reservation.carrier} — {reservation.tracking_number}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </section>
        )}

        {/* Buyr : choix de la livraison */}
        {showDeliveryPicker && (
          <DeliveryChoicePicker
            reservationId={reservation.id}
            value={{
              delivery_type: (reservation.delivery_type as "domicile" | "point_relais" | null) ?? null,
              delivery_address: reservation.delivery_address,
              delivery_relay_point: reservation.delivery_relay_point,
            }}
            onSaved={load}
          />
        )}

        {/* Buyr : réception */}
        {showBuyrReceipt && (
          <section
            className="rounded-2xl p-5 space-y-3"
            style={{ border: `1px solid ${GOLD}`, backgroundColor: "#FFFFFF" }}
            aria-labelledby="tx-receipt"
          >
            <h2 id="tx-receipt" className="font-display font-medium text-lg" style={{ color: NAVY }}>
              {t("transaction.receiptTitle")}
            </h2>
            {reservation.tracking_number && trackUrl && (
              <a
                href={trackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2"
                style={{ color: NAVY }}
              >
                {reservation.carrier} — {reservation.tracking_number}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                className="bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => setConfirmReceiptOpen(true)}
              >
                <Package className="w-4 h-4 mr-2" />
                {t("proposal.confirmReceipt")}
              </Button>
              <button
                type="button"
                className="text-xs underline hover:text-destructive transition-colors"
                style={{ color: "#666666" }}
                onClick={() => setDisputeOpen(true)}
              >
                {t("proposal.reportProblem")}
              </button>
            </div>
          </section>
        )}

        {/* Carte montants */}
        <section
          className="rounded-2xl p-5 space-y-2"
          style={{ border: "1px solid #E5E0D6", backgroundColor: "#FFFFFF" }}
          aria-labelledby="tx-money"
        >
          <h2 id="tx-money" className="font-display font-medium text-lg" style={{ color: NAVY }}>
            {isFindr ? t("transaction.yourPayout") : t("transaction.yourPayment")}
          </h2>
          <div className="flex justify-between text-sm gap-4">
            <span style={{ color: "#666666" }}>{t("transaction.itemPrice")}</span>
            <span style={{ color: NAVY }}>{formatPrice(fees.objectPrice, i18n.language)}</span>
          </div>
          {isFindr ? (
            <>
              <div className="flex justify-between text-sm gap-4">
                <span style={{ color: "#666666" }}>{t("transaction.feeWithheld")}</span>
                <span style={{ color: NAVY }}>
                  -{formatPrice(reservation.findr_fee ?? fees.findrFee, i18n.language)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold gap-4" style={{ borderColor: "#E5E0D6" }}>
                <span style={{ color: NAVY }}>{t("transaction.netPayout")}</span>
                <span style={{ color: NAVY }}>
                  {formatPrice(reservation.findr_payout_amount ?? fees.payout, i18n.language)}
                </span>
              </div>
              <p className="text-xs pt-1" style={{ color: "#666666" }}>
                {payoutDone ? t("transaction.payoutDone") : t("transaction.payoutAfter")}
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm gap-4">
                <ServiceFeeLabel />
                <span style={{ color: NAVY }}>
                  +{formatPrice(reservation.buyr_fee ?? fees.buyrFee, i18n.language)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold gap-4" style={{ borderColor: "#E5E0D6" }}>
                <span style={{ color: NAVY }}>{t("transaction.totalPaid")}</span>
                <span style={{ color: NAVY }}>
                  {formatPrice(reservation.total_buyr_amount ?? fees.total, i18n.language)}
                </span>
              </div>
            </>
          )}
        </section>

        {/* Actions communes */}
        <section className="space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            style={{ border: `1.5px solid ${NAVY}`, color: NAVY }}
            onClick={() => navigate(`/messagerie/${reservation.search_id}?with=${otherId}`)}
          >
            <MessageCircle className="w-4 h-4" />
            {t("transaction.sendMessage")}
          </Button>

          {isFindr && ps === "paye_en_attente_reception" && !reservation.shipped_at && (
            <button
              type="button"
              className="w-full text-center text-xs underline hover:text-destructive transition-colors"
              style={{ color: "#666666" }}
              onClick={() => setCancelOpen(true)}
            >
              {t("proposal.cannotSupply")}
            </button>
          )}

          {isBuyr && canBuyrCancel && (
            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setCancelOpen(true)}
            >
              {t("proposal.noNewsCancel")}
            </Button>
          )}
          {isBuyr && !canBuyrCancel && countdown && reservation.dispute_status !== "ouvert" && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: "#666666" }}>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {countdown}
            </p>
          )}
        </section>
      </div>

      {/* Dialogue confirmation de réception (buyr) */}
      <Dialog open={confirmReceiptOpen} onOpenChange={setConfirmReceiptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <Package className="w-5 h-5 text-success flex-shrink-0" />
              <span className="break-words">{t("proposal.confirmReceipt")}</span>
            </DialogTitle>
            <DialogDescription>{t("proposal.confirmReceiptDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">{t("proposal.irreversibleTitle")}</p>
                  <p className="text-muted-foreground mt-1">{t("proposal.irreversibleDesc")}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>{t("proposal.matchesDescription")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>{t("proposal.goodCondition")}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReceiptOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleConfirmReceipt}
              disabled={isProcessing}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.processing")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t("proposal.confirmAndRelease")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue annulation & remboursement */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("proposal.cancelRefund")}</DialogTitle>
            <DialogDescription>{t("proposal.cancelRefundDesc")}</DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">{t("proposal.cancelRefundWarning")}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              {t("proposal.back")}
            </Button>
            <Button variant="destructive" onClick={handleCancelRefund} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.processing")}
                </>
              ) : (
                t("proposal.confirmCancel")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DisputeDialog
        open={disputeOpen}
        onOpenChange={setDisputeOpen}
        reservationId={reservation.id}
        findrId={reservation.findr_id}
        searchId={reservation.search_id}
        itemTitle={proposal?.title ?? ""}
        onSubmitted={load}
      />
    </div>
  );
};

export default Transaction;
