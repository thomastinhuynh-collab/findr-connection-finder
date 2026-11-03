// Parcours étiquette, vue buyr : encadré d'action sur la carte de proposition et sa fenêtre de détail.
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { buyrLabelAction, labelCountdown, type BuyrLabelRow } from "@/lib/buyrLabelAction";

interface Props {
  reservationId: string;
  reservation: BuyrLabelRow;
  findrFirstName: string;
  onNavigate?: () => void;
}

const BuyrLabelActionBox = ({ reservationId, reservation, findrFirstName, onNavigate }: Props) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const action = buyrLabelAction(reservation);
  if (!action) return null;

  const name = findrFirstName || t("buyrLabelCard.theFindr");
  const deadline = reservation.label_deadline_at;
  const date = deadline
    ? new Date(deadline).toLocaleString(i18n.language?.startsWith("en") ? "en-GB" : "fr-FR", { dateStyle: "long", timeStyle: "short" })
    : null;
  const countdown = labelCountdown(deadline, now);

  const goToTransaction = () => {
    onNavigate?.();
    navigate(`/transaction/${reservationId}`);
  };

  return (
    <div
      className="w-full rounded-lg border border-accent bg-card p-3 space-y-2 text-left"
      role="region"
      aria-label={t("buyrLabelCard.title")}
    >
      <p className="font-display font-medium text-[15px] text-primary">{t("buyrLabelCard.title")}</p>

      {action === "waitingShipFrom" && (
        <p className="text-xs text-muted-foreground">{t("buyrLabelCard.noShipFrom", { name })}</p>
      )}

      {action === "provide" && (
        <>
          {date && countdown && (
            <p className="text-xs font-medium text-primary">
              {countdown.expired
                ? t("buyrLabelCard.deadlinePassed", { date })
                : t("buyrLabelCard.deadline", { date, d: countdown.days, h: countdown.hours })}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{t("buyrLabelCard.text")}</p>
        </>
      )}

      {action === "rejected" && (
        <>
          <p className="text-xs text-primary">
            {date ? t("buyrLabelCard.rejected", { name, date }) : t("buyrLabelCard.rejectedNoDate", { name })}
          </p>
          {countdown && (
            <p className="text-xs font-medium text-primary">
              {countdown.expired
                ? t("buyrLabelCard.deadlinePassed", { date })
                : t("buyrLabelCard.countdown", { d: countdown.days, h: countdown.hours })}
            </p>
          )}
        </>
      )}

      {action !== "waitingShipFrom" && (
        <Button size="sm" className="w-full sm:w-auto" onClick={goToTransaction}>
          {t("buyrLabelCard.cta")}
        </Button>
      )}

      <p className="text-xs text-muted-foreground">{t("buyrLabelCard.cancelInfo")}</p>
    </div>
  );
};

export default BuyrLabelActionBox;
