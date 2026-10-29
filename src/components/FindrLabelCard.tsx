// Parcours étiquette — vue findr : attente de l'étiquette, puis dépôt du colis.
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { weightKey } from "@/components/ParcelWeightField";
import { useCountdown } from "@/components/BuyrLabelCard";

const NAVY = "#070E42";
const GOLD = "#D9BB87";
const CREAM = "#F5F0EA";

const locale = (lang?: string) => (lang?.startsWith("en") ? "en-GB" : "fr-FR");

/** Le findr attend l'étiquette du buyr (paye_attente_etiquette ou etiquette_refusee). */
export const FindrAwaitingLabel = ({
  status,
  buyrFirstName,
  deadlineAt,
}: {
  status: string;
  buyrFirstName: string;
  deadlineAt: string | null;
}) => {
  const { t, i18n } = useTranslation();
  const countdown = useCountdown(deadlineAt);
  const date = deadlineAt
    ? new Date(deadlineAt).toLocaleString(locale(i18n.language), { dateStyle: "long", timeStyle: "short" })
    : null;
  const name = buyrFirstName || t("transaction.theBuyr");
  const rejected = status === "etiquette_refusee";

  return (
    <section className="rounded-2xl p-5 space-y-2" style={{ border: `1px solid ${GOLD}`, backgroundColor: "#FFFFFF" }} aria-labelledby="tx-findr-await">
      <h2 id="tx-findr-await" className="font-display font-medium text-lg" style={{ color: NAVY }}>
        {rejected ? t("findrLabel.rejectedTitle") : t("findrLabel.awaitingTitle")}
      </h2>
      <p className="text-sm" style={{ color: NAVY }}>
        {date
          ? rejected
            ? t("findrLabel.rejectedText", { name, date })
            : t("findrLabel.awaitingText", { name, date })
          : t("findrLabel.awaitingNoDate", { name })}
      </p>
      {date && countdown && (
        <p className="text-xs" style={{ color: "#666666" }}>
          {countdown.expired
            ? t("labelFlow.deadlinePassed", { date })
            : t("findrLabel.countdown", { d: countdown.days, h: countdown.hours, m: countdown.minutes })}
        </p>
      )}
    </section>
  );
};

interface DropOffProps {
  reservationId: string;
  parcelWeightKg: number | null;
  labelCarrier: string | null;
  labelTrackingNumber: string | null;
  dropoffDeclaredAt: string | null;
  onChanged: () => void;
}

/** Étiquette reçue : préparer, imprimer, déposer (paye_en_attente_reception + label_provided_at). */
export const FindrDropOffCard = ({
  reservationId,
  parcelWeightKg,
  labelCarrier,
  labelTrackingNumber,
  dropoffDeclaredAt,
  onChanged,
}: DropOffProps) => {
  const { t, i18n } = useTranslation();
  const [downloading, setDownloading] = useState(false);
  const [declaring, setDeclaring] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const weight = parcelWeightKg != null
    ? t(`parcelWeight.option.${weightKey(Number(parcelWeightKg))}`)
    : t("labelFlow.weightUnknown");

  const errorText = async (err: unknown, data: any) => {
    const payload = (err as any)?.context instanceof Response ? await (err as any).context.json().catch(() => null) : data;
    const code = payload?.errorCode as string | undefined;
    if (code && i18n.exists(`findrLabel.errors.${code}`)) return t(`findrLabel.errors.${code}`);
    return err || payload?.error ? t("findrLabel.errors.generic") : null;
  };

  const download = async () => {
    setDownloading(true);
    // Fenêtre ouverte tout de suite pour éviter le blocage des fenêtres surgissantes.
    const win = window.open("", "_blank");
    try {
      const { data, error } = await supabase.functions.invoke("label-download", { body: { reservationId } });
      if (error || !data?.url) throw error ?? new Error("no_url");
      if (win) win.location.href = data.url;
      else window.location.href = data.url;
    } catch {
      win?.close();
      toast({ title: t("common.error"), description: t("findrLabel.errors.download"), variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const copy = async () => {
    if (!labelTrackingNumber) return;
    try {
      await navigator.clipboard.writeText(labelTrackingNumber);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  const declare = async () => {
    setDeclaring(true);
    try {
      const { data, error } = await supabase.functions.invoke("declare-dropoff", { body: { reservationId } });
      const msg = await errorText(error, data);
      if (msg) {
        toast({ title: t("common.error"), description: msg, variant: "destructive" });
        return;
      }
      toast({ title: t("findrLabel.declaredToast") });
      onChanged();
    } finally {
      setDeclaring(false);
    }
  };

  const trimmed = reason.trim();
  const reasonValid = trimmed.length >= 3 && trimmed.length <= 200;

  const reject = async () => {
    setRejectError(null);
    if (!reasonValid) {
      setRejectError(t("findrLabel.errors.reason"));
      return;
    }
    setRejecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("reject-label", { body: { reservationId, reason: trimmed } });
      const msg = await errorText(error, data);
      if (msg) {
        setRejectError(msg);
        return;
      }
      setRejectOpen(false);
      setReason("");
      toast({ title: data?.refunded ? t("findrLabel.refundedToast") : t("findrLabel.rejectedToast") });
      onChanged();
    } finally {
      setRejecting(false);
    }
  };

  const declaredDate = dropoffDeclaredAt
    ? new Date(dropoffDeclaredAt).toLocaleString(locale(i18n.language), { dateStyle: "long", timeStyle: "short" })
    : null;

  return (
    <section className="rounded-2xl p-5 space-y-5" style={{ border: `1px solid ${GOLD}`, backgroundColor: "#FFFFFF" }} aria-labelledby="tx-dropoff">
      <h2 id="tx-dropoff" className="font-display font-medium text-lg" style={{ color: NAVY }}>
        {t("findrLabel.dropTitle")}
      </h2>
      <ol className="space-y-5">
        <li className="space-y-1">
          <h3 className="text-sm font-semibold" style={{ color: NAVY }}>1. {t("findrLabel.step1")}</h3>
          <p className="text-sm" style={{ color: "#44403A" }}>{t("findrLabel.step1Text", { weight })}</p>
        </li>
        <li className="space-y-2">
          <h3 className="text-sm font-semibold" style={{ color: NAVY }}>2. {t("findrLabel.step2")}</h3>
          <Button type="button" variant="outline" onClick={download} disabled={downloading} style={{ border: `1.5px solid ${NAVY}`, color: NAVY }}>
            {downloading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("findrLabel.download")}
          </Button>
        </li>
        <li className="space-y-2">
          <h3 className="text-sm font-semibold" style={{ color: NAVY }}>3. {t("findrLabel.step3")}</h3>
          <p className="text-sm" style={{ color: "#44403A" }}>
            {t("findrLabel.step3Text", { carrier: labelCarrier ?? t("labelFlow.weightUnknown") })}
          </p>
          {labelTrackingNumber && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg p-3 text-sm" style={{ backgroundColor: CREAM }}>
              <span style={{ color: "#666666" }}>{t("findrLabel.trackingLabel")}</span>
              <span className="font-semibold" style={{ color: NAVY }}>{labelTrackingNumber}</span>
              <Button type="button" size="sm" variant="outline" onClick={copy} aria-label={t("labelFlow.copyLine", { value: labelTrackingNumber })}>
                {copied ? t("labelFlow.copied") : t("labelFlow.copy")}
              </Button>
              <span aria-live="polite" className="sr-only">{copied ? t("labelFlow.copied") : ""}</span>
            </div>
          )}
        </li>
      </ol>

      {declaredDate ? (
        <p role="status" className="text-sm font-medium" style={{ color: NAVY }}>
          {t("findrLabel.declared", { date: declaredDate })}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {!dropoffDeclaredAt && (
          <Button type="button" onClick={declare} disabled={declaring} style={{ backgroundColor: NAVY, color: CREAM }}>
            {declaring && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t("findrLabel.declare")}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => { setRejectError(null); setRejectOpen(true); }}>
          {t("findrLabel.unusable")}
        </Button>
      </div>
      {!dropoffDeclaredAt && <p className="text-xs" style={{ color: "#666666" }}>{t("findrLabel.declareHelp")}</p>}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("findrLabel.rejectTitle")}</DialogTitle>
            <DialogDescription>{t("findrLabel.rejectDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">{t("findrLabel.reason")}</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              maxLength={200}
              onChange={(e) => setReason(e.target.value)}
              aria-invalid={!!rejectError}
              aria-describedby="reject-reason-help"
            />
            <p id="reject-reason-help" className="text-xs" style={{ color: rejectError ? "hsl(var(--destructive))" : "#666666" }} role={rejectError ? "alert" : undefined}>
              {rejectError ?? t("findrLabel.reasonHelp", { count: trimmed.length })}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={reject} disabled={rejecting || !reasonValid} variant="destructive">
              {rejecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("findrLabel.rejectConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
