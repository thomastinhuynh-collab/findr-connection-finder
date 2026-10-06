import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;
const PENDING_STATUSES = ["paye_en_attente_reception", "expedie", "livre", "versement_en_revue"] as const;

interface PaidRow { id: string; amount: number; created_at: string; title: string | null }
interface PendingRow { id: string; amount: number; status: string; search_id: string; title: string | null }

interface Props { userId: string; paymentsConfigured: boolean }

const EarningsPanel = ({ userId, paymentsConfigured }: Props) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [paid, setPaid] = useState<PaidRow[]>([]);
  const [paidTotal, setPaidTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [opening, setOpening] = useState(false);

  const fmt = (n: number) =>
    new Intl.NumberFormat(i18n.language, { style: "currency", currency: "EUR" }).format(n);

  const titlesFor = async (proposalIds: string[]) => {
    const ids = [...new Set(proposalIds.filter(Boolean))];
    if (!ids.length) return {} as Record<string, string>;
    const { data } = await supabase.from("proposals").select("id, title").in("id", ids);
    return Object.fromEntries((data || []).map((p) => [p.id, p.title]));
  };

  const fetchPaid = useCallback(async (from = 0, append = false) => {
    if (append) setLoadingMore(true);
    const { data } = await supabase
      .from("transactions")
      .select("id, amount, created_at, reservation_id")
      .eq("findr_id", userId)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    const rows = data || [];
    const resIds = rows.map((r) => r.reservation_id).filter(Boolean) as string[];
    let propByRes: Record<string, string> = {};
    if (resIds.length) {
      const { data: res } = await supabase.from("reservations").select("id, proposal_id").in("id", resIds);
      propByRes = Object.fromEntries((res || []).map((r) => [r.id, r.proposal_id as string]));
    }
    const titles = await titlesFor(Object.values(propByRes));
    const mapped = rows.map((r) => ({
      id: r.id,
      amount: Number(r.amount || 0),
      created_at: r.created_at,
      title: r.reservation_id ? titles[propByRes[r.reservation_id]] ?? null : null,
    }));
    setPaid((prev) => (append ? [...prev, ...mapped] : mapped));
    setHasMore(rows.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [userId]);

  useEffect(() => {
    (async () => {
      const [{ data: all }, { data: res }] = await Promise.all([
        supabase.from("transactions").select("amount").eq("findr_id", userId),
        supabase
          .from("reservations")
          .select("id, findr_payout_amount, payment_status, search_id, proposal_id")
          .eq("findr_id", userId)
          .in("payment_status", [...PENDING_STATUSES]),
      ]);
      setPaidTotal((all || []).reduce((s, r) => s + Number(r.amount || 0), 0));
      const titles = await titlesFor((res || []).map((r) => r.proposal_id as string));
      setPending(
        (res || []).map((r) => ({
          id: r.id,
          amount: Number(r.findr_payout_amount || 0),
          status: r.payment_status as string,
          search_id: r.search_id,
          title: r.proposal_id ? titles[r.proposal_id] ?? null : null,
        })),
      );
      await fetchPaid();
      setLoaded(true);
    })();
  }, [userId, fetchPaid]);

  const openStripe = async () => {
    const win = window.open("", "_blank");
    setOpening(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-stripe-login-link");
      if (error || !data?.url) throw error || new Error("no url");
      if (win) win.location.href = data.url; else window.open(data.url, "_blank", "noopener");
    } catch {
      win?.close();
      toast({ title: t("mySpace.earnings.stripeError"), variant: "destructive" });
    } finally {
      setOpening(false);
    }
  };

  if (!loaded) return <p className="text-sm" style={{ color: "#4B5563" }}>{t("common.loading")}</p>;

  const pendingTotal = pending.reduce((s, r) => s + r.amount, 0);
  const noSales = paid.length === 0 && pending.length === 0;

  if (noSales) {
    return (
      <div className="py-12 text-center rounded-xl" style={{ border: "1px dashed #D4CCBC", backgroundColor: "#FAF7F2" }}>
        <p className="mb-4 text-sm max-w-md mx-auto" style={{ color: "#374151" }}>{t("mySpace.earnings.empty")}</p>
        <Link to="/je-deviens-findr" className="text-sm font-semibold underline-offset-4 hover:underline" style={{ color: "#070E42" }}>
          {t("mySpace.earnings.emptyCta")} →
        </Link>
      </div>
    );
  }

  const dateFmt = (d: string) =>
    new Date(d).toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-5" style={{ border: "1px solid #E5E0D6" }} aria-labelledby="earnings-pending">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h3 id="earnings-pending" className="font-semibold" style={{ color: "#070E42" }}>{t("mySpace.earnings.pending")}</h3>
          <span className="text-lg font-semibold" style={{ color: "#070E42" }}>{fmt(pendingTotal)}</span>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm" style={{ color: "#4B5563" }}>{t("mySpace.earnings.pendingEmpty")}</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "#EEE9E0" }}>
            {pending.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <Link to={`/recherche/${r.search_id}`} className="font-medium hover:underline underline-offset-4 truncate block" style={{ color: "#070E42" }}>
                    {r.title || t("mySpace.earnings.untitled")}
                  </Link>
                  <span style={{ color: "#4B5563" }}>{t(`mySpace.earnings.step.${r.status}`)}</span>
                </div>
                <span className="font-medium shrink-0" style={{ color: "#070E42" }}>{fmt(r.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl bg-white p-5" style={{ border: "1px solid #E5E0D6" }} aria-labelledby="earnings-paid">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h3 id="earnings-paid" className="font-semibold" style={{ color: "#070E42" }}>{t("mySpace.earnings.paid")}</h3>
          <span className="text-lg font-semibold" style={{ color: "#070E42" }}>{fmt(paidTotal)}</span>
        </div>
        {paid.length === 0 ? (
          <p className="text-sm" style={{ color: "#4B5563" }}>{t("mySpace.earnings.paidEmpty")}</p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "#EEE9E0" }}>
            {paid.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate" style={{ color: "#070E42" }}>{r.title || t("mySpace.earnings.untitled")}</p>
                  <span style={{ color: "#4B5563" }}>{dateFmt(r.created_at)}</span>
                </div>
                <span className="font-medium shrink-0" style={{ color: "#1F6B47" }}>{fmt(r.amount)}</span>
              </li>
            ))}
          </ul>
        )}
        {hasMore && (
          <div className="flex justify-center mt-3">
            <Button variant="outline" size="sm" disabled={loadingMore} onClick={() => fetchPaid(paid.length, true)}>
              {loadingMore ? t("common.loading") : t("mySpace.loadMore")}
            </Button>
          </div>
        )}
      </section>

      <p className="text-sm" style={{ color: "#4B5563" }}>{t("mySpace.earnings.stripeNote")}</p>

      {paymentsConfigured && (
        <Button variant="outline" onClick={openStripe} disabled={opening}>
          {opening ? t("mySpace.earnings.opening") : t("mySpace.earnings.viewStripe")}
        </Button>
      )}
    </div>
  );
};

export default EarningsPanel;
