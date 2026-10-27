import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function TrackingRecognition({ recognized, isFindr }: { recognized?: boolean; isFindr: boolean }) {
  const { t } = useTranslation();
  if (recognized) return null;
  if (isFindr) return <p className="w-full text-xs text-muted-foreground mt-2">{t("trackingSafety.findrHint")}</p>;
  return <Tooltip><TooltipTrigger asChild>
    <span tabIndex={0} className="inline-flex"><Badge variant="outline" className="border-warning text-foreground">{t("trackingSafety.badge")}</Badge></span>
  </TooltipTrigger><TooltipContent>{t("trackingSafety.tooltip")}</TooltipContent></Tooltip>;
}