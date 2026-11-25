import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { MySpaceSection } from "@/lib/mySpaceSections";
import { useUnreadExchanges } from "@/hooks/useUnreadExchanges";

/** Éléments de la barre du bas : « Messagerie » remplace « Propositions ». */
export type BottomBarItem = "aujourdhui" | "recherches" | "messagerie" | "compte";
export const BOTTOM_BAR_ITEMS: BottomBarItem[] = ["aujourdhui", "recherches", "messagerie", "compte"];
export const bottomBarHref = (k: BottomBarItem) => (k === "messagerie" ? "/messagerie" : `/mon-espace?section=${k}`);

const NAVY = "#070E42";
const GOLD = "#D9BB87";

// Icônes tracées, traits fins (1.5), dessinées pour la barre de Mon espace.
const Icon = ({ k }: { k: BottomBarItem }) => {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...p}>
      {k === "aujourdhui" && (<><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>)}
      {k === "recherches" && (<><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></>)}
      {k === "messagerie" && (<><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></>)}
      {k === "compte" && (<><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" /></>)}
    </svg>
  );
};

const LABEL: Record<BottomBarItem, string> = {
  aujourdhui: "mySpace.sections.today",
  recherches: "mySpace.sections.mobileSearches",
  messagerie: "messagingList.bottomLabel",
  compte: "mySpace.sections.mobileAccount",
};

interface Props {
  /** Élément actif ; une rubrique de Mon espace absente de la barre (propositions) n'en active aucun. */
  active: MySpaceSection | "messagerie";
  /** Chiffres dorés uniquement (actions à faire). */
  actionCounts: Partial<Record<MySpaceSection, number>>;
}

/** Barre fixée en bas de Mon espace, visible seulement à 640 px et moins. */
const MySpaceBottomBar = ({ active, actionCounts }: Props) => {
  const { t } = useTranslation();
  const unreadExchanges = useUnreadExchanges();
  const counts: Partial<Record<BottomBarItem, number>> = {
    aujourdhui: actionCounts.aujourdhui, compte: actionCounts.compte, messagerie: unreadExchanges,
  };
  return (
    <div className="min-[641px]:hidden">
      <Link
        to="/poster"
        aria-label={t("mySpace.sections.post")}
        className="fixed right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ bottom: "calc(72px + env(safe-area-inset-bottom) + 12px)", backgroundColor: GOLD, color: NAVY, outlineColor: NAVY }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </Link>
      <nav
        aria-label={t("mySpace.sections.bottomNav")}
        className="fixed inset-x-0 bottom-0 z-40 bg-white"
        style={{ borderTop: "1px solid #E5E1D8", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid h-[72px] grid-cols-4">
          {BOTTOM_BAR_ITEMS.map((key) => {
            const selected = active === key;
            const n = counts[key] ?? 0;
            return (
              <li key={key} className="min-w-0">
                <Link
                  to={bottomBarHref(key)}
                  aria-current={selected ? "page" : undefined}
                  className="relative flex h-full w-full flex-col items-center justify-center gap-1 px-1 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
                  style={{ color: NAVY, outlineColor: NAVY, borderTop: `2px solid ${selected ? GOLD : "transparent"}` }}
                >
                  <span className="relative">
                    <Icon k={key} />
                    {n > 0 && (
                      <span
                        className="absolute -right-3 -top-2 inline-flex min-w-[20px] items-center justify-center rounded-full px-1"
                        style={{ backgroundColor: GOLD, color: NAVY, fontSize: 12, fontWeight: 600, height: 20 }}
                      >
                        {n > 99 ? "99+" : n}
                      </span>
                    )}
                  </span>
                  <span className="w-full truncate text-center" style={{ fontSize: 12, fontWeight: selected ? 600 : 500 }}>
                    {t(LABEL[key])}
                  </span>
                  {n > 0 && <span className="sr-only">{t("mySpace.sections.actionCount", { count: n })}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default MySpaceBottomBar;
