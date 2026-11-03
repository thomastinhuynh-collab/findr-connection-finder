// Carte « Suivi du colis » de la page de transaction (buyr et findr), dès l'expédition.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { trackingUrl } from "@/lib/tracking";

const NAVY = "#070E42";
const GOLD = "#D9BB87";

interface TrackingEvent {
  id: string;
  occurred_at: string;
  description: string;
  status: string;
  location: string | null;
  is_test: boolean;
}

interface Props {
  reservationId: string;
  carrier: string | null;
  trackingNumber: string;
  children?: ReactNode;
}

export default function ParcelTrackingCard({ reservationId, carrier, trackingNumber, children }: Props) {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<TrackingEvent[] | null>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    let active = true;
    supabase
      .from("tracking_events")
      .select("id, occurred_at, description, status, location, is_test")
      .eq("reservation_id", reservationId)
      .order("occurred_at", { ascending: false })
      .then(({ data }) => {
        if (active) setEvents((data as TrackingEvent[] | null) ?? []);
      });
    return () => {
      active = false;
    };
  }, [reservationId]);

  const url = trackingUrl(carrier, trackingNumber);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  const dateFormat = new Intl.DateTimeFormat(i18n.language?.startsWith("en") ? "en-GB" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section
      className="rounded-2xl p-5 space-y-4"
      style={{ border: `1px solid ${GOLD}`, backgroundColor: "#FFFFFF" }}
      aria-labelledby="tx-parcel-tracking"
    >
      <h2 id="tx-parcel-tracking" className="font-display font-medium text-lg" style={{ color: NAVY }}>
        {t("parcelTracking.title")}
      </h2>

      <dl className="text-sm space-y-2">
        <div className="flex flex-wrap gap-x-2">
          <dt style={{ color: "#666666" }}>{t("parcelTracking.carrier")} :</dt>
          <dd className="font-medium" style={{ color: NAVY }}>{carrier || t("parcelTracking.unknownCarrier")}</dd>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <dt style={{ color: "#666666" }}>{t("parcelTracking.number")} :</dt>
          <dd className="font-medium break-all" style={{ color: NAVY }}>{trackingNumber}</dd>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={copy}
            aria-label={t("parcelTracking.copyLabel", { value: trackingNumber })}
          >
            {copied ? t("parcelTracking.copied") : t("parcelTracking.copy")}
          </Button>
          <span className="sr-only" aria-live="polite">{copied ? t("parcelTracking.copied") : ""}</span>
        </div>
      </dl>

      {url && (
        <Button asChild variant="default">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {t("parcelTracking.openCarrier")}
            <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
          </a>
        </Button>
      )}

      {children}

      <div>
        <h3 className="text-sm font-semibold mb-2" style={{ color: NAVY }}>
          {t("parcelTracking.history")}
        </h3>
        {events === null ? null : events.length === 0 ? (
          <p className="text-sm" style={{ color: "#666666" }}>{t("parcelTracking.noEvents")}</p>
        ) : (
          <ol className="space-y-3">
            {events.map((e) => (
              <li key={e.id} className="text-sm border-l-2 pl-3" style={{ borderColor: GOLD }}>
                <p className="text-xs" style={{ color: "#666666" }}>
                  {dateFormat.format(new Date(e.occurred_at))}
                  {e.is_test ? ` — ${t("parcelTracking.testEvent")}` : ""}
                </p>
                <p style={{ color: NAVY }}>{e.description || e.status}</p>
                {e.location && <p className="text-xs" style={{ color: "#666666" }}>{e.location}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
