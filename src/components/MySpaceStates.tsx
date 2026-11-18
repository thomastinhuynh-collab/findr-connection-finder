import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

const NAVY = "#070E42";
const MUTED = "#5C5648";

/** Cartes grises de la hauteur d'une vraie ligne, pendant le chargement. */
export const RowSkeletons = ({ count = 3 }: { count?: number }) => {
  const { t } = useTranslation();
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t("common.loading")}</span>
      <ul className="space-y-3" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="flex gap-3 rounded-xl bg-white p-3" style={{ border: "1px solid #E5E1D8", minHeight: 120 }}>
            <Skeleton className="h-24 w-24 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="mt-3 h-9 w-32 rounded-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const LoadError = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation();
  return (
    <div role="alert" className="rounded-xl bg-white px-4 py-8 text-center" style={{ border: "1px solid #E5E1D8" }}>
      <p className="text-sm" style={{ color: NAVY }}>{t("mySpace.states.loadError")}</p>
      <button type="button" onClick={onRetry}
        className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full px-5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ backgroundColor: NAVY, color: "#F5F0EA", outlineColor: NAVY }}>
        {t("mySpace.states.retry")}
      </button>
    </div>
  );
};

export const EmptySection = ({ title, text, to, cta }: { title: string; text?: string; to: string; cta: string }) => (
  <div className="rounded-xl px-4 py-10 text-center" style={{ border: "1px dashed #D4CCBC", backgroundColor: "#FAF7F2" }}>
    <h3 className="text-lg" style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}>{title}</h3>
    {text && <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "#374151" }}>{text}</p>}
    <Link to={to} className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full px-5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ backgroundColor: "#D9BB87", color: NAVY, outlineColor: NAVY }}>
      {cta}
    </Link>
  </div>
);

export const EmptyFilter = ({ filter }: { filter: string }) => {
  const { t } = useTranslation();
  return (
    <div className="py-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>{filter}</p>
      <p className="mt-1 text-sm" style={{ color: MUTED }}>{t("mySpace.states.emptyFilter")}</p>
    </div>
  );
};
