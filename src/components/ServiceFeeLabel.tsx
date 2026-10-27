import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ServiceFeeLabel = ({ iconOnly = false }: { iconOnly?: boolean }) => {
  const { t } = useTranslation();
  return (
    <span className={`${iconOnly ? "text-inherit" : "text-muted-foreground"} break-words inline-flex items-center gap-1.5 flex-wrap`}>
      {!iconOnly && <>
        <span>{t("proposal.serviceFee")}</span>
        <span className="text-xs">({t("proposal.serviceFeeDetail")})</span>
      </>}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={t("proposal.serviceFeeInfo")}
            onClick={iconOnly ? (event) => event.stopPropagation() : undefined}
            className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${iconOnly ? "border-current" : "border-muted-foreground/50"} text-[10px] font-semibold leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
          >
            ?
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs leading-relaxed">
          {t("proposal.serviceFeeInfo")}
        </TooltipContent>
      </Tooltip>
    </span>
  );
};

export default ServiceFeeLabel;
