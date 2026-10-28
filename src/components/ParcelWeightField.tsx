import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { PARCEL_WEIGHTS } from "@/lib/shippingEstimate";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export const weightKey = (w: number) => String(w).replace(".", "_");

const ParcelWeightField = ({ value, onChange }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <Label id="parcel-weight-label" className="text-lg font-semibold text-primary mb-1 block">
        {t("parcelWeight.label")} *
      </Label>
      <p className="text-xs text-muted-foreground mb-4">{t("parcelWeight.help")}</p>
      <div role="radiogroup" aria-labelledby="parcel-weight-label" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PARCEL_WEIGHTS.map((w) => {
          const selected = value === String(w);
          return (
            <button
              key={w}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(String(w))}
              className={`rounded-lg px-3 py-2 text-left text-sm transition-colors border ${
                selected ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-primary border-border"
              }`}
            >
              <span className="font-medium block">{t(`parcelWeight.option.${weightKey(w)}`)}</span>
              <span className={`text-xs ${selected ? "opacity-80" : "text-muted-foreground"}`}>
                {t(`parcelWeight.hint.${weightKey(w)}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ParcelWeightField;
