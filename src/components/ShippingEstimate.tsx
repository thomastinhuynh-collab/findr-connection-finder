import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { estimateShipping, type ShippingRate } from "@/lib/shippingEstimate";
import { formatPrice } from "@/lib/fees";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

let cache: Promise<ShippingRate[]> | null = null;
const loadRates = () => {
  if (!cache) {
    cache = Promise.resolve(
      supabase.from("shipping_rates").select("carrier, mode, max_weight_kg, price_eur"),
    ).then(({ data, error }) => {
      if (error) { cache = null; return []; }
      return (data ?? []) as ShippingRate[];
    });
  }
  return cache;
};

const ShippingEstimate = ({ weightKg, className = "" }: { weightKg: number | null | undefined; className?: string }) => {
  const { t, i18n } = useTranslation();
  const { labelFlowEnabled } = useFeatureFlags();
  const [rates, setRates] = useState<ShippingRate[] | null>(null);
  useEffect(() => {
    if (!labelFlowEnabled) return;
    let alive = true;
    loadRates().then((r) => alive && setRates(r));
    return () => { alive = false; };
  }, [labelFlowEnabled]);
  const est = labelFlowEnabled && rates ? estimateShipping(rates, weightKg) : null;
  if (!est) return null;
  return (
    <p className={`text-xs leading-relaxed inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      <span>
        {t("shippingEstimate.line", {
          min: formatPrice(est.min, i18n.language),
          max: formatPrice(est.max, i18n.language),
        })}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={t("shippingEstimate.info")}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-semibold leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            ?
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs leading-relaxed">{t("shippingEstimate.info")}</TooltipContent>
      </Tooltip>
    </p>
  );
};

export default ShippingEstimate;
