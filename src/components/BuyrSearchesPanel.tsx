import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ContainedPhoto from "@/components/ContainedPhoto";
import { useIsMobile } from "@/hooks/use-mobile";
import { CATEGORIES } from "@/lib/categories";
import { formatPrice } from "@/lib/fees";
import {
  classifySearchTab, ongoingNeedsAction, primaryAction, searchRank, sortSearchRows,
  type BuyrSearchFlags, type SearchTab,
} from "@/lib/buyrSearchRows";

export interface BuyrSearchRow {
  id: string; title: string; category: string; image_url: string | null;
  budget_min: number | null; budget_max: number | null; created_at: string;
  unread_count?: number; transaction_id?: string | null; paid_status?: string | null;
  payment_pending?: boolean; pay_proposal_id?: string | null; recent_reservation?: boolean;
  label_pending?: boolean; receipt_pending?: boolean;
}

const TABS: SearchTab[] = ["active", "ongoing", "done", "cancelled"];
const NAVY = "#070E42";
const GOLD = "#D9BB87";

const flagsOf = (s: BuyrSearchRow): BuyrSearchFlags => ({
  created_at: s.created_at, paidStatus: s.paid_status ?? null, paymentPending: !!s.payment_pending,
  recentReservation: !!s.recent_reservation, unreadCount: s.unread_count || 0,
  labelPending: !!s.label_pending, receiptPending: !!s.receipt_pending, hasTransaction: !!s.transaction_id,
});

const FilterHelp = ({ tab }: { tab: SearchTab }) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const name = t(`mySpace.searchTabs.${tab}`);
  return (
    <Popover>
      {isMobile && (
        <PopoverPrimitive.Anchor asChild>
          <span aria-hidden="true" className="fixed bottom-2 left-2 right-2 h-0 pointer-events-none" />
        </PopoverPrimitive.Anchor>
      )}
      <PopoverTrigger
        aria-label={t("mySpace.buyrSearches.helpLabel", { name })}
        className="absolute -top-2 -right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
        style={{ outlineColor: NAVY }}
      >
        <span aria-hidden="true" className="inline-flex h-[15px] w-[15px] items-center justify-center rounded-full bg-white text-[10px] font-semibold leading-none"
          style={{ border: `1px solid ${NAVY}`, color: NAVY }}>?</span>
      </PopoverTrigger>
      <PopoverContent
        side={isMobile ? "top" : "bottom"}
        align={isMobile ? "center" : "end"}
        collisionPadding={8}
        className={isMobile ? "w-[calc(100vw-16px)] text-sm" : "w-72 text-sm"}
        style={{ color: NAVY }}
      >
        {t(`mySpace.buyrSearches.help.${tab}`)}
      </PopoverContent>
    </Popover>
  );
};

const BuyrSearchesPanel = ({ searches, tab, onTabChange }: { searches: BuyrSearchRow[]; tab: SearchTab; onTabChange: (t: SearchTab) => void }) => {
  const { t, i18n } = useTranslation();
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [scrolled, setScrolled] = useState(false);
  const flags = searches.map(flagsOf);
  const tabOf = (s: BuyrSearchRow) => classifySearchTab(s.paid_status ?? null);
  const needsAction = ongoingNeedsAction(flags);
  const labelRow = searches.find((s) => s.label_pending && tabOf(s) === "ongoing" && s.transaction_id);

  useEffect(() => {
    if (scrolled) return;
    const el = tabRefs.current[tab];
    if (el) { el.scrollIntoView({ block: "nearest", inline: "center" }); setScrolled(true); }
  }, [tab, scrolled]);

  const rows = sortSearchRows(searches.filter((s) => tabOf(s) === tab).map((s) => ({ ...flagsOf(s), row: s })));
  const first = rows.filter((r) => searchRank(r) === 1);
  const rest = rows.filter((r) => searchRank(r) !== 1);

  const budget = (s: BuyrSearchRow) => {
    const fmt = (n: number) => formatPrice(n, i18n.language);
    if (s.budget_min != null && s.budget_max != null) return t("mySpace.buyrSearches.budgetRange", { min: fmt(s.budget_min), max: fmt(s.budget_max) });
    if (s.budget_min != null) return t("mySpace.buyrSearches.budgetFrom", { min: fmt(s.budget_min) });
    return null;
  };
  const published = (iso: string) => {
    const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
    return t("mySpace.buyrSearches.published", { when: new Intl.RelativeTimeFormat(i18n.language, { numeric: "auto" }).format(-days, "day") });
  };
  const categoryName = (slug: string) => {
    const i = CATEGORIES.findIndex((c) => c.slug === slug);
    return i >= 0 ? t(`categoryNav.categories.c${i + 1}.name`) : slug;
  };

  const actionBtn = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  const renderRow = (r: (typeof rows)[number]) => {
    const s = r.row;
    const action = primaryAction(r);
    const urgent = searchRank(r) === 1;
    const href: Record<string, string> = {
      pay: `/recherche/${s.id}?payer=${s.pay_proposal_id ?? ""}`,
      proposals: `/recherche/${s.id}`,
      label: `/transaction/${s.transaction_id}`,
      receipt: `/transaction/${s.transaction_id}`,
      transaction: `/transaction/${s.transaction_id}`,
      edit: `/modifier-recherche/${s.id}`,
    };
    const gold = action !== "edit" && action !== "transaction";
    const b = budget(s);
    const tabKind = tabOf(s);
    return (
      <li key={s.id} className="flex flex-col gap-3 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:gap-4"
        style={{ border: urgent ? `2px solid ${GOLD}` : "1px solid #E5E1D8" }}>
        <div className="h-[112px] w-full shrink-0 overflow-hidden rounded-lg sm:w-[112px]">
          {s.image_url ? <ContainedPhoto src={s.image_url} alt={s.title} /> : <div className="h-full w-full bg-photo-backdrop" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words font-semibold" style={{ color: NAVY, fontSize: 16 }}>{s.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]" style={{ color: "#5C5648" }}>
            <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#F5F1E8", color: NAVY }}>{categoryName(s.category)}</span>
            {b && <span>{b}</span>}
            <span>{published(s.created_at)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to={href[action]} className={actionBtn}
            style={gold ? { backgroundColor: GOLD, color: NAVY } : { border: `1.5px solid ${NAVY}`, color: NAVY }}>
            {t(`mySpace.buyrSearches.actions.${action}`)}
            {action === "proposals" && (s.unread_count || 0) > 0 && (
              <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: NAVY, color: "#FFFFFF" }}>
                {t("mySpace.buyrSearches.newProposals", { count: s.unread_count })}
              </span>
            )}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger aria-label={t("mySpace.buyrSearches.more", { title: s.title })}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ border: "1px solid #D4CCBC", color: NAVY }}>
              <span aria-hidden="true">⋯</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild className="min-h-[44px]"><Link to={`/recherche/${s.id}`}>{t("mySpace.buyrSearches.menu.view")}</Link></DropdownMenuItem>
              {tabKind === "active" && action !== "edit" && (
                <DropdownMenuItem asChild className="min-h-[44px]"><Link to={`/modifier-recherche/${s.id}`}>{t("mySpace.buyrSearches.actions.edit")}</Link></DropdownMenuItem>
              )}
              {s.transaction_id && action !== "transaction" && (
                <DropdownMenuItem asChild className="min-h-[44px]"><Link to={`/transaction/${s.transaction_id}`}>{t("mySpace.buyrSearches.actions.transaction")}</Link></DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </li>
    );
  };

  return (
    <div>
      {labelRow && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: "#F5F1E8", border: `1px solid ${GOLD}` }}>
          <p className="font-semibold" style={{ color: NAVY }}>{t("mySpace.buyrSearches.labelBanner")}</p>
          <Link to={`/transaction/${labelRow.transaction_id}`} className={actionBtn} style={{ backgroundColor: GOLD, color: NAVY }}>
            {t("mySpace.buyrSearches.actions.label")}
          </Link>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={t("mySpace.buyrSearches.filterGroup")}
          className="-mx-4 flex flex-nowrap gap-3 overflow-x-auto px-4 pb-1 pt-3 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {TABS.map((key) => {
            const count = searches.filter((s) => tabOf(s) === key).length;
            const active = tab === key;
            return (
              <div key={key} ref={(el) => (tabRefs.current[key] = el)} className="relative shrink-0 basis-[42%] sm:basis-auto">
                <button type="button" aria-pressed={active} onClick={() => onTabChange(key)}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full py-2 pl-4 pr-6 text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ fontWeight: active ? 600 : 500, backgroundColor: active ? NAVY : "#FFFFFF", color: active ? "#FFFFFF" : NAVY, border: `1px solid ${active ? NAVY : "rgba(7,14,66,0.2)"}`, outlineColor: NAVY }}>
                  {t(`mySpace.searchTabs.${key}`)}
                  <span style={{ color: active ? "#D4D7E3" : "#5C5648" }}>{count}</span>
                  {key === "ongoing" && needsAction && (
                    <span role="img" aria-label={t("mySpace.buyrSearches.actionDot")} className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: GOLD }} />
                  )}
                </button>
                <FilterHelp tab={key} />
              </div>
            );
          })}
        </div>
        <p className="text-xs" style={{ color: "#5C5648" }}>{t("mySpace.buyrSearches.sortNote")}</p>
      </div>

      {rows.length === 0 ? (
        <div className="py-12 text-center text-sm" style={{ color: "#5C5648" }}>{t("mySpace.ui.noSearchesInTab")}</div>
      ) : (
        <div className="space-y-5">
          {first.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: NAVY }}>{t("mySpace.buyrSearches.firstHeading")}</h3>
              <ul className="space-y-3">{first.map(renderRow)}</ul>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5C5648" }}>{t("mySpace.buyrSearches.restHeading")}</h3>
              <ul className="space-y-3">{rest.map(renderRow)}</ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default BuyrSearchesPanel;
