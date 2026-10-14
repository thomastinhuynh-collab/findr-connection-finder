import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Slider } from "@/components/ui/slider";

export const BUDGET_STEPS = [0, 10, 20, 30, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000];
export const BUDGET_MIN = 0;
export const BUDGET_MAX = 5000;
const LAST = BUDGET_STEPS.length - 1;
const TICKS = [0, 100, 500, 1000, 5000];

export const nearestStepIndex = (amount: number) => {
  let best = 0;
  BUDGET_STEPS.forEach((s, i) => {
    if (Math.abs(s - amount) < Math.abs(BUDGET_STEPS[best] - amount)) best = i;
  });
  return best;
};

export const isBudgetActive = (r: [number, number]) => !(r[0] === BUDGET_MIN && r[1] === BUDGET_MAX);

export const formatEuro = (n: number, lang: string) =>
  `${new Intl.NumberFormat(lang.startsWith("fr") ? "fr-FR" : "en-GB").format(n)} €`;

export const formatBudgetRange = (r: [number, number], lang: string, t: (k: string, o?: any) => string) =>
  r[1] >= BUDGET_MAX
    ? t("searchesPage.budgetFilter.andMore", { amount: formatEuro(r[0], lang) })
    : `${formatEuro(r[0], lang)} – ${formatEuro(r[1], lang)}`;

const clamp = (n: number) => Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, Math.round(n)));

interface Props {
  value: [number, number];
  onChange: (v: [number, number]) => void;
}

const BudgetRangeFilter = ({ value, onChange }: Props) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "fr";
  const [minText, setMinText] = useState(String(value[0]));
  const [maxText, setMaxText] = useState(String(value[1]));

  useEffect(() => { setMinText(String(value[0])); setMaxText(String(value[1])); }, [value[0], value[1]]);

  const idx: [number, number] = [nearestStepIndex(value[0]), nearestStepIndex(value[1])];
  const active = isBudgetActive(value);

  const commitMin = (raw: string) => {
    const n = raw === "" ? BUDGET_MIN : clamp(Number(raw));
    if (Number.isNaN(n)) return setMinText(String(value[0]));
    onChange([Math.min(n, value[1]), value[1]]);
  };
  const commitMax = (raw: string) => {
    const n = raw === "" ? BUDGET_MAX : clamp(Number(raw));
    if (Number.isNaN(n)) return setMaxText(String(value[1]));
    onChange([value[0], Math.max(n, value[0])]);
  };

  const pos = (amount: number) => (nearestStepIndex(amount) / LAST) * 100;

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("searchesPage.budgetFilter.title")}
        </span>
        <button
          type="button"
          onClick={() => onChange([BUDGET_MIN, BUDGET_MAX])}
          disabled={!active}
          className="text-xs underline-offset-2 hover:underline text-foreground disabled:text-muted-foreground disabled:opacity-60 disabled:no-underline"
        >
          {t("searchesPage.reset")}
        </button>
      </div>
      <p className="mt-1 text-[20px] font-semibold text-foreground" aria-live="polite">
        {formatBudgetRange(value, lang, t)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{t("searchesPage.budgetFilter.hint")}</p>

      <div className="mt-5 px-3">
        <Slider
          min={0}
          max={LAST}
          step={1}
          minStepsBetweenThumbs={0}
          value={idx}
          onValueChange={(v) => onChange([BUDGET_STEPS[v[0]], BUDGET_STEPS[v[1]]])}
          thumbLabels={[t("searchesPage.budgetFilter.minLabel"), t("searchesPage.budgetFilter.maxLabel")]}
          getThumbValueText={(v) => (v === LAST ? `${formatEuro(BUDGET_MAX, lang)}+` : formatEuro(BUDGET_STEPS[v], lang))}
          trackClassName="h-1.5 bg-gold/[0.38]"
          rangeClassName="bg-gold"
          thumbClassName="relative h-6 w-6 border-2 border-navy-primary bg-background shadow-[0_2px_6px_rgba(7,14,66,0.18)] cursor-grab active:cursor-grabbing active:bg-gold before:absolute before:-inset-[10px] before:content-[''] focus-visible:ring-navy-primary"
        />
        <div className="relative mt-2 h-4 text-[11px] text-muted-foreground" aria-hidden="true">
          {TICKS.map((tk, i) => (
            <span
              key={tk}
              className="absolute whitespace-nowrap"
              style={{
                left: `${pos(tk)}%`,
                transform: ["translateX(-25%)", "translateX(-50%)", "translateX(-75%)", "translateX(-60%)", "translateX(-85%)"][i],
              }}
            >
              {formatEuro(tk, lang)}{tk === BUDGET_MAX ? "+" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {([
          ["min", minText, setMinText, commitMin],
          ["max", maxText, setMaxText, commitMax],
        ] as const).map(([k, text, setText, commit]) => (
          <label key={k} className="block min-w-0">
            <span className="text-xs text-muted-foreground">
              {t(k === "min" ? "searchesPage.budgetFilter.minimum" : "searchesPage.budgetFilter.maximum")}
            </span>
            <div className="mt-1 flex items-center rounded-md border border-input bg-background px-2 focus-within:ring-2 focus-within:ring-ring">
              <input
                type="number"
                inputMode="numeric"
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={(e) => commit(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commit((e.target as HTMLInputElement).value); }}
                className="w-full min-w-0 bg-transparent py-2 text-sm text-foreground outline-none"
              />
              <span className="text-sm text-muted-foreground">€</span>
            </div>
          </label>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">{t("searchesPage.budgetFilter.noBudgetNote")}</p>
    </div>
  );
};

export default BudgetRangeFilter;
