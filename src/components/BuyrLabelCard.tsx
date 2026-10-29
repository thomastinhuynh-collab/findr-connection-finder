// Parcours étiquette — le buyr achète, télécharge puis envoie l'étiquette (provide-label).
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { weightKey } from "@/components/ParcelWeightField";

const NAVY = "#070E42";
const GOLD = "#D9BB87";
const CREAM = "#F5F0EA";

export interface ShipFrom {
  first_name?: string;
  last_name?: string;
  street?: string;
  postal_code?: string;
  city?: string;
  country?: string;
}

const SITES = [
  { label: "Mondial Relay", url: "https://www.mondialrelay.fr/envoi-de-colis/" },
  { label: "Colissimo", url: "https://www.laposte.fr/envoyer-colis" },
  { label: "Chronopost", url: "https://www.chronopost.fr/fr/expedier-colis" },
];
const CARRIERS = ["Mondial Relay", "Colissimo", "Chronopost"] as const;

interface Props {
  reservationId: string;
  shipFrom: ShipFrom | null;
  parcelWeightKg: number | null;
  deadlineAt: string | null;
  onSent: () => void;
}

const useCountdown = (deadline: string | null) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!deadline) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [deadline]);
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - now;
  if (ms <= 0) return { expired: true, days: 0, hours: 0, minutes: 0 };
  return {
    expired: false,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
  };
};

const BuyrLabelCard = ({ reservationId, shipFrom, parcelWeightKg, deadlineAt, onSent }: Props) => {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const countdown = useCountdown(deadlineAt);

  useEffect(() => () => clearTimeout(timer.current), []);

  const hasAddress = !!(shipFrom?.street && shipFrom.postal_code && shipFrom.city);
  const name = [shipFrom?.first_name, (shipFrom?.last_name ?? "").toUpperCase()].filter(Boolean).join(" ");
  const lines = hasAddress
    ? [
        { key: "name", value: name },
        { key: "street", value: shipFrom!.street! },
        { key: "postal", value: shipFrom!.postal_code! },
        { key: "city", value: shipFrom!.city! },
      ].filter((l) => l.value)
    : [];

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  const weight = parcelWeightKg != null ? t(`parcelWeight.option.${weightKey(Number(parcelWeightKg))}`) : t("labelFlow.weightUnknown");

  const submit = async () => {
    setError(null);
    if (!carrier || !tracking.trim() || !file) {
      setError(t("labelFlow.errors.missing"));
      return;
    }
    setSending(true);
    try {
      const form = new FormData();
      form.append("reservationId", reservationId);
      form.append("carrier", carrier);
      form.append("trackingNumber", tracking.trim());
      form.append("file", file);
      const { data, error: err } = await supabase.functions.invoke("provide-label", { body: form });
      const payload = err?.context instanceof Response ? await err.context.json().catch(() => null) : data;
      if (err || payload?.error) {
        const code = payload?.errorCode as string | undefined;
        const key = code ? `labelFlow.errors.${code}` : "";
        const translated = code && i18n.exists(key) ? t(key) : code && i18n.exists(`trackingSafety.errors.${code}`) ? t(`trackingSafety.errors.${code}`) : null;
        setError(translated ?? (typeof payload?.error === "string" ? payload.error : t("labelFlow.errors.generic")));
        return;
      }
      onSent();
    } catch {
      setError(t("labelFlow.errors.generic"));
    } finally {
      setSending(false);
    }
  };

  const deadlineText = deadlineAt
    ? new Date(deadlineAt).toLocaleString(i18n.language?.startsWith("en") ? "en-GB" : "fr-FR", { dateStyle: "long", timeStyle: "short" })
    : null;

  return (
    <section className="rounded-2xl p-5 space-y-5" style={{ border: `1px solid ${GOLD}`, backgroundColor: "#FFFFFF" }} aria-labelledby="tx-label">
      <div className="space-y-1">
        <h2 id="tx-label" className="font-display font-medium text-lg" style={{ color: NAVY }}>{t("labelFlow.title")}</h2>
        {deadlineText && countdown && (
          <p className="text-sm" style={{ color: NAVY }}>
            {countdown.expired
              ? t("labelFlow.deadlinePassed", { date: deadlineText })
              : t("labelFlow.deadline", { date: deadlineText, d: countdown.days, h: countdown.hours, m: countdown.minutes })}
          </p>
        )}
      </div>

      {!hasAddress ? (
        <p className="text-sm text-muted-foreground">{t("labelFlow.noShipFrom")}</p>
      ) : (
        <ol className="space-y-5">
          <li className="space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: NAVY }}>1. {t("labelFlow.step1")}</h3>
            <div className="flex flex-wrap gap-2">
              {SITES.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                  style={{ border: `1px solid ${NAVY}`, color: NAVY }}>
                  {s.label}<ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="sr-only">{t("labelFlow.externalLink")}</span>
                </a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{t("labelFlow.instructions", { weight })}</p>
            <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: CREAM }}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: NAVY }}>{t("labelFlow.senderTitle")}</p>
                <Button type="button" size="sm" variant="outline" onClick={() => copy("all", lines.map((l) => l.value).join("\n"))}>
                  {copied === "all" ? t("labelFlow.copied") : t("labelFlow.copyAll")}
                </Button>
              </div>
              <ul className="space-y-1">
                {lines.map((l) => (
                  <li key={l.key} className="flex items-center justify-between gap-2 text-sm" style={{ color: NAVY }}>
                    <span>{l.value}</span>
                    <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs"
                      aria-label={t("labelFlow.copyLine", { value: l.value })} onClick={() => copy(l.key, l.value)}>
                      {copied === l.key ? t("labelFlow.copied") : t("labelFlow.copy")}
                    </Button>
                  </li>
                ))}
              </ul>
              <p aria-live="polite" className="sr-only">{copied ? t("labelFlow.copied") : ""}</p>
            </div>
          </li>

          <li className="space-y-1">
            <h3 className="text-sm font-semibold" style={{ color: NAVY }}>2. {t("labelFlow.step2")}</h3>
            <p className="text-sm text-muted-foreground">{t("labelFlow.step2Help")}</p>
          </li>

          <li className="space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: NAVY }}>3. {t("labelFlow.step3")}</h3>
            <div className="space-y-1.5">
              <Label htmlFor="label-carrier">{t("labelFlow.carrier")}</Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger id="label-carrier"><SelectValue placeholder={t("labelFlow.carrierPlaceholder")} /></SelectTrigger>
                <SelectContent>
                  {CARRIERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="label-tracking">{t("labelFlow.tracking")}</Label>
              <Input id="label-tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} autoComplete="off" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="label-file">{t("labelFlow.file")}</Label>
              <Input id="label-file" type="file" accept="application/pdf,image/png,image/jpeg"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} aria-describedby="label-file-help" />
              <p id="label-file-help" className="text-xs text-muted-foreground">{t("labelFlow.fileHelp")}</p>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button onClick={submit} disabled={sending} className="w-full sm:w-auto">
              {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("labelFlow.sending")}</> : t("labelFlow.send")}
            </Button>
          </li>
        </ol>
      )}
    </section>
  );
};

export default BuyrLabelCard;
