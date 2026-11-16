import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { PAID_STATUSES, computeSaleSteps, isOngoingSale } from "@/lib/saleSteps";

interface Row {
  id: string; role: "buyr" | "findr"; title: string;
  payment_status: string | null; delivery_type: string | null; label_provided_at: string | null;
  shipped_at: string | null; delivered_at: string | null; tracking_review_notified_at: string | null; updated_at: string;
}

const COLS = "id, buyr_id, findr_id, payment_status, delivery_type, label_provided_at, shipped_at, delivered_at, tracking_review_notified_at, updated_at, proposal_id, searches(title)";

const OngoingSalesBlock = ({ userId }: { userId: string }) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let alive = true;
    supabase.from("reservations").select(COLS)
      .or(`buyr_id.eq.${userId},findr_id.eq.${userId}`)
      .in("payment_status", PAID_STATUSES.filter((s) => s !== "termine"))
      .order("updated_at", { ascending: false })
      .then(async ({ data }) => {
        const list = ((data as any[]) || []).filter(isOngoingSale);
        const ids = list.map((r) => r.proposal_id).filter(Boolean);
        const { data: props } = ids.length
          ? await supabase.from("proposals").select("id, title").in("id", ids)
          : { data: [] as any[] };
        if (!alive) return;
        const propTitle = new Map((props || []).map((p: any) => [p.id, p.title]));
        setRows(list.map((r) => ({
          ...r, role: r.buyr_id === userId ? "buyr" : "findr", title: propTitle.get(r.proposal_id) || r.searches?.title || "",
        })));
      });
    return () => { alive = false; };
  }, [userId]);

  if (rows.length === 0) return null;

  return (
    <section className="mb-8" aria-labelledby="ongoing-sales-title">
      <h2 id="ongoing-sales-title" className="font-display text-xl mb-3" style={{ color: "#070E42" }}>
        {t("ongoingSales.title")}
      </h2>
      <ul className="divide-y rounded-lg border" style={{ borderColor: "#E5E1D8" }}>
        {rows.map((r) => {
          const s = computeSaleSteps(r);
          const idx = s.current === -1 ? s.keys.length - 1 : s.current;
          const stepName = t(`saleSteps.${s.labelFlow ? "label" : "legacy"}.${s.keys[idx]}`);
          return (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-semibold break-words" style={{ color: "#070E42" }}>{r.title}</p>
                <p className="text-sm" style={{ color: "#5C5648" }}>
                  {t(r.role === "buyr" ? "ongoingSales.buying" : "ongoingSales.selling")}
                  {" · "}
                  {t("ongoingSales.step", { n: idx + 1, total: s.keys.length, name: stepName.toLowerCase() })}
                </p>
              </div>
              <Link to={`/transaction/${r.id}`} className="inline-flex items-center min-h-[44px] px-2 font-medium hover:underline underline-offset-4" style={{ color: "#070E42" }}>
                {t("ongoingSales.open")} →
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default OngoingSalesBlock;
