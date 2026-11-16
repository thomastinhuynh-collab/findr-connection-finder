import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ContainedPhoto from "@/components/ContainedPhoto";
import { useIsMobile } from "@/hooks/use-mobile";
import { CATEGORIES } from "@/lib/categories";
import { formatPrice } from "@/lib/fees";
import { computeSaleSteps } from "@/lib/saleSteps";
import {
  classifyProposalTab, finalBadge, findrNeedsAction, netAmount, ongoingProposalNeedsAction, proposalState,
  remainingParts, sortProposalRows, type FindrProposalFlags, type ProposalTab,
} from "@/lib/findrProposalRows";

export interface FindrProposalRow extends FindrProposalFlags {
  id: string; title: string; image_url: string | null; category: string | null; search_id: string;
  buyr_first_name: string | null; proposed_price: number;
  reservation_id: string | null; object_price: number | null; findr_fee: number | null;
  label_deadline_at: string | null; delivered_at: string | null; tracking_review_notified_at: string | null;
}

const TABS: ProposalTab[] = ["pending", "ongoing", "done"];
const NAVY = "#070E42";
const GOLD = "#D9BB87";
const MUTED = "#5C5648";

const FilterHelp = ({ tab }: { tab: ProposalTab }) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const name = t(`mySpace.findrProposals.tabs.${tab}`);
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
      <PopoverContent side={isMobile ? "top" : "bottom"} align={isMobile ? "center" : "end"} collisionPadding={8}
        className={isMobile ? "w-[calc(100vw-16px)] text-sm" : "w-72 text-sm"} style={{ color: NAVY }}>
        {t(`mySpace.findrProposals.help.${tab}`)}
      </PopoverContent>
    </Popover>
  );
};

const FindrProposalsPanel = ({ proposals, tab, onTabChange }: { proposals: FindrProposalRow[]; tab: ProposalTab; onTabChange: (t: ProposalTab) => void }) => {
  const { t, i18n } = useTranslation();
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [scrolled, setScrolled] = useState(false);
  const needsAction = ongoingProposalNeedsAction(proposals);

  useEffect(() => {
    if (scrolled) return;
    const el = tabRefs.current[tab];
    if (el) { el.scrollIntoView({ block: "nearest", inline: "center" }); setScrolled(true); }
  }, [tab, scrolled]);

  const rows = sortProposalRows(proposals.filter((p) => classifyProposalTab(p) === tab));
  const first = tab === "ongoing" ? rows.filter(findrNeedsAction) : [];
  const rest = rows.filter((r) => !first.includes(r));

  const categoryName = (slug: string | null) => {
    if (!slug) return null;
    const i = CATEGORIES.findIndex((c) => c.slug === slug);
    return i >= 0 ? t(`categoryNav.categories.c${i + 1}.name`) : slug;
  };
  const actionBtn = "inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-sm font-semibold no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const badgeStyle: Record<string, { bg: string; color: string }> = {
    sold: { bg: "#E8F1EC", color: "#1F6B47" }, rejected: { bg: "#FEF1EA", color: "#993C1D" }, cancelled: { bg: "#EDEDED", color: "#374151" },
  };

  const renderRow = (p: FindrProposalRow) => {
    const urgent = findrNeedsAction(p);
    const kind = classifyProposalTab(p);
    const net = netAmount(p.object_price, p.findr_fee);
    const state = proposalState(p);
    const fin = finalBadge(p);
    const steps = kind === "ongoing" ? computeSaleSteps(p) : null;
    const idx = steps ? (steps.current === -1 ? steps.keys.length - 1 : steps.current) : 0;
    const left = state === "awaitingLabel" ? remainingParts(p.label_deadline_at) : null;
    const href = p.reservation_id && kind !== "pending" ? `/transaction/${p.reservation_id}` : `/recherche/${p.search_id}`;
    const btnKey = urgent && p.label_provided_at ? "viewLabel" : "viewSale";
    const cat = categoryName(p.category);
    return (
      <li key={p.id} className="flex flex-col gap-3 rounded-xl bg-white p-3 sm:flex-row sm:items-center sm:gap-4"
        style={{ border: urgent ? `2px solid ${GOLD}` : "1px solid #E5E1D8" }}>
        <div className="h-[112px] w-full shrink-0 overflow-hidden rounded-lg sm:w-[112px]">
          {p.image_url ? <ContainedPhoto src={p.image_url} alt={p.title} /> : <div className="h-full w-full bg-photo-backdrop" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words font-semibold" style={{ color: NAVY, fontSize: 16 }}>{p.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]" style={{ color: MUTED }}>
            {cat && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "#F5F1E8", color: NAVY }}>{cat}</span>}
            {fin && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: badgeStyle[fin].bg, color: badgeStyle[fin].color }}>{t(`mySpace.findrProposals.final.${fin}`)}</span>}
          </div>
          {kind === "pending" && (
            <p className="mt-1 text-sm" style={{ color: NAVY }}>{t("mySpace.findrProposals.proposedPrice", { amount: formatPrice(p.proposed_price, i18n.language) })}</p>
          )}
          {kind !== "pending" && net != null && fin !== "rejected" && fin !== "cancelled" && (
            <p className="mt-1 text-sm font-semibold" style={{ color: NAVY }}>{t(fin === "sold" ? "mySpace.findrProposals.received" : "mySpace.findrProposals.willReceive", { amount: formatPrice(net, i18n.language) })}</p>
          )}
          {p.buyr_first_name && (
            <p className="mt-0.5 text-[13px]" style={{ color: MUTED }}>{t("mySpace.findrProposals.buyer", { name: p.buyr_first_name })}</p>
          )}
          {steps && (
            <div className="mt-2">
              <div className="flex gap-1" aria-hidden="true">
                {steps.done.map((d, i) => (
                  <span key={i} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: d ? NAVY : i === idx ? GOLD : "#E5E1D8" }} />
                ))}
              </div>
              <p className="mt-1 text-xs" style={{ color: MUTED }}>
                {t("mySpace.findrProposals.step", { n: idx + 1, total: steps.keys.length, name: t(`saleSteps.${steps.labelFlow ? "label" : "legacy"}.${steps.keys[idx]}`) })}
              </p>
            </div>
          )}
          {state && (
            <span className="mt-2 inline-block max-w-full whitespace-normal break-words rounded-lg px-2 py-1 text-xs font-medium"
              style={urgent ? { backgroundColor: GOLD, color: NAVY } : { backgroundColor: "#F5F1E8", color: NAVY }}>
              {state === "awaitingLabel" && left
                ? t("mySpace.findrProposals.state.awaitingLabelLeft", { d: left.d, h: left.h })
                : t(`mySpace.findrProposals.state.${state}`)}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center">
          <Link to={href} className={`${actionBtn} w-full sm:w-auto`}
            style={urgent ? { backgroundColor: GOLD, color: NAVY } : { border: `1.5px solid ${NAVY}`, color: NAVY }}>
            {t(`mySpace.findrProposals.actions.${btnKey}`)}
          </Link>
        </div>
      </li>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/recherches" className={actionBtn} style={{ backgroundColor: GOLD, color: NAVY }}>
          {t("mySpace.findrProposals.browse")}
        </Link>
      </div>
      <div role="group" aria-label={t("mySpace.findrProposals.filterGroup")}
        className="-mx-4 mb-4 flex flex-nowrap gap-3 overflow-x-auto px-4 pb-1 pt-3 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {TABS.map((key) => {
          const count = proposals.filter((p) => classifyProposalTab(p) === key).length;
          const active = tab === key;
          return (
            <div key={key} ref={(el) => (tabRefs.current[key] = el)} className="relative shrink-0 basis-[42%] sm:basis-auto">
              <button type="button" aria-pressed={active} onClick={() => onTabChange(key)}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full py-2 pl-4 pr-6 text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ fontWeight: active ? 600 : 500, backgroundColor: active ? NAVY : "#FFFFFF", color: active ? "#FFFFFF" : NAVY, border: `1px solid ${active ? NAVY : "rgba(7,14,66,0.2)"}`, outlineColor: NAVY }}>
                {t(`mySpace.findrProposals.tabs.${key}`)}
                <span style={{ color: active ? "#D4D7E3" : MUTED }}>{count}</span>
                {key === "ongoing" && needsAction && (
                  <span role="img" aria-label={t("mySpace.buyrSearches.actionDot")} className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: GOLD }} />
                )}
              </button>
              <FilterHelp tab={key} />
            </div>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="py-12 text-center text-sm" style={{ color: MUTED }}>{t("mySpace.findrProposals.empty")}</div>
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
              {first.length > 0 && <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>{t("mySpace.buyrSearches.restHeading")}</h3>}
              <ul className="space-y-3">{rest.map(renderRow)}</ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default FindrProposalsPanel;
