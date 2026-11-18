import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { buyrMustProvideLabel } from "@/lib/buyrLabelAction";
import { isAwaitingFirstScan, scanDeadlineAt } from "@/lib/scanDeadline";
import { hasShipFrom } from "@/lib/shipFrom";
import { needsStripeOnboarding } from "@/lib/stripeOnboarding";
import { LoadError, RowSkeletons } from "@/components/MySpaceStates";
import { splitTodos, daysLeft, daysAgo, type TodoItem } from "@/lib/todoActions";

const PAID = ["paye_attente_etiquette", "etiquette_refusee", "paye_en_attente_reception", "expedie", "livre", "versement_en_revue", "termine"];

interface Props {
  items: TodoItem[] | null;
  error?: boolean;
  onRetry?: () => void;
  onStripe: () => void;
  onShipFrom: () => void;
}

const firstName = (n?: string | null) => (n || "").trim().split(" ")[0] || "";

export async function loadTodos(userId: string, profile: any): Promise<TodoItem[]> {
  const items: TodoItem[] = [];
  const first = await Promise.all([
    supabase.from("reservations")
      .select("id, payment_status, label_deadline_at, label_provided_at, ship_from, shipped_at, delivered_at, dispute_open, proposal_id, search_id")
      .eq("buyr_id", userId).in("payment_status", ["paye_attente_etiquette", "etiquette_refusee", "expedie", "livre"]),
    supabase.from("reservations")
      .select("id, payment_status, label_provided_at, shipped_at, proposal_id, search_id")
      .eq("findr_id", userId).eq("payment_status", "paye_en_attente_reception"),
    supabase.from("searches").select("id, title").eq("user_id", userId),
    supabase.from("messages").select("search_id, sender_id, receiver_id, is_read").eq("receiver_id", userId).eq("is_read", false).limit(200),
    supabase.from("proposals").select("id", { count: "exact", head: true }).eq("findr_id", userId).in("status", ["accepted_pending", "completed"]),
  ]);
  if (first.some((r) => r.error)) throw new Error("todo_load_failed");
  const [{ data: buyRes }, { data: findRes }, { data: mySearches }, { data: msgs }, { count: findrSales }] = first;

  const searchIds = (mySearches || []).map((s: any) => s.id);
  const { data: myProps } = searchIds.length
    ? await supabase.from("proposals").select("id, title, status, search_id, findr_id").in("search_id", searchIds).in("status", ["pending", "accepted_pending"])
    : { data: [] as any[] };
  const acceptedIds = (myProps || []).filter((p: any) => p.status === "accepted_pending").map((p: any) => p.id);
  const { data: paidRows } = acceptedIds.length
    ? await supabase.from("reservations").select("proposal_id, payment_status").in("proposal_id", acceptedIds)
    : { data: [] as any[] };
  const paidIds = new Set((paidRows || []).filter((r: any) => PAID.includes(r.payment_status ?? "")).map((r: any) => r.proposal_id));

  const resRows = [...(buyRes || []), ...(findRes || [])] as any[];
  const propIds = [...new Set(resRows.map((r) => r.proposal_id).filter(Boolean))];
  const { data: resProps } = propIds.length
    ? await supabase.from("proposals").select("id, title").in("id", propIds)
    : { data: [] as any[] };
  const propTitle = new Map((resProps || []).map((p: any) => [p.id, p.title]));

  const people = [...new Set([
    ...(myProps || []).filter((p: any) => p.status === "accepted_pending").map((p: any) => p.findr_id),
    ...(msgs || []).map((m: any) => m.sender_id),
  ])];
  const { data: profs } = people.length
    ? await supabase.from("profiles").select("user_id, full_name").in("user_id", people)
    : { data: [] as any[] };
  const nameOf = new Map((profs || []).map((p: any) => [p.user_id, firstName(p.full_name)]));
  const searchTitle = new Map((mySearches || []).map((s: any) => [s.id, s.title]));

  for (const r of (buyRes || []) as any[]) {
    const title = propTitle.get(r.proposal_id) || "";
    if (buyrMustProvideLabel(r)) {
      items.push({ key: `label-${r.id}`, kind: "label", deadline: r.label_deadline_at ? new Date(r.label_deadline_at).getTime() : null, objectTitle: title, href: `/transaction/${r.id}` });
    } else if ((r.payment_status === "expedie" || r.payment_status === "livre") && !r.dispute_open) {
      items.push({ key: `receipt-${r.id}`, kind: "receipt", deadline: null, at: r.payment_status === "livre" ? r.delivered_at : r.shipped_at, status: r.payment_status, objectTitle: title, href: `/transaction/${r.id}` });
    }
  }
  for (const r of (findRes || []) as any[]) {
    if (!isAwaitingFirstScan(r)) continue;
    items.push({ key: `dropoff-${r.id}`, kind: "dropoff", deadline: scanDeadlineAt(r), objectTitle: propTitle.get(r.proposal_id) || "", href: `/transaction/${r.id}` });
  }
  const reviewSearches = new Set<string>();
  for (const p of (myProps || []) as any[]) {
    if (p.status === "accepted_pending" && !paidIds.has(p.id)) {
      items.push({ key: `pay-${p.id}`, kind: "pay", deadline: null, objectTitle: p.title, name: nameOf.get(p.findr_id) || "", href: `/recherche/${p.search_id}?payer=${p.id}` });
    } else if (p.status === "pending") reviewSearches.add(p.search_id);
  }
  for (const sid of reviewSearches) {
    items.push({ key: `review-${sid}`, kind: "review", deadline: null, objectTitle: searchTitle.get(sid) || "", href: `/recherche/${sid}` });
  }
  const convs = new Map<string, TodoItem>();
  for (const m of (msgs || []) as any[]) {
    const key = `${m.search_id}:${m.sender_id}`;
    const c = convs.get(key);
    if (c) c.count = (c.count || 0) + 1;
    else convs.set(key, { key: `msg-${key}`, kind: "message", deadline: null, count: 1, name: nameOf.get(m.sender_id) || "", href: `/messagerie/${m.search_id}?with=${m.sender_id}` });
  }
  items.push(...convs.values());

  const isSeller = (findrSales || 0) > 0;
  if (isSeller && !hasShipFrom(profile)) items.push({ key: "shipFrom", kind: "shipFrom", deadline: null });
  if (isSeller && needsStripeOnboarding(profile)) items.push({ key: "stripe", kind: "stripe", deadline: null });
  return items;
}

/** Actions « À faire maintenant » ; partagé par le bloc et les chiffres de la navigation. */
export function useTodoItems(userId: string | undefined, profile: any, refreshKey = 0) {
  const [items, setItems] = useState<TodoItem[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!userId || !profile) return;
    let alive = true;
    setError(false);
    loadTodos(userId, profile)
      .then((r) => { if (alive) setItems(r); })
      .catch(() => { if (alive) { setItems(null); setError(true); } });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, !!profile, refreshKey, attempt, profile?.stripe_onboarding_complete, profile?.ship_from_updated_at]);
  return { items, error, retry: () => { setItems(null); setAttempt((n) => n + 1); } };
}

/** Actions du compte (adresse d'expédition, inscription Stripe). */
export const ACCOUNT_TODO_KINDS = ["shipFrom", "stripe"];

const TodoNowBlock = ({ items, error, onRetry, onStripe, onShipFrom }: Props) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  if (!items) {
    return (
      <section aria-labelledby="todo-now-title" className="mb-8 rounded-xl bg-white p-5 md:p-6" style={{ border: "1px solid #E5E1D8" }}>
        <h2 id="todo-now-title" className="sr-only">{t("todoNow.heading")}</h2>
        {error ? <LoadError onRetry={() => onRetry?.()} /> : <RowSkeletons count={2} />}
      </section>
    );
  }
  const { visible, hiddenCount, total } = splitTodos(items, expanded);
  const fmtDate = (ms: number) => new Date(ms).toLocaleDateString(i18n.language?.startsWith("en") ? "en-GB" : "fr-FR", { day: "numeric", month: "long" });

  const context = (it: TodoItem) => {
    const obj = it.objectTitle || t("todoNow.objectFallback");
    switch (it.kind) {
      case "label": {
        if (it.deadline === null) return obj;
        const d = daysLeft(it.deadline);
        return `${obj} · ${d === 0 ? t("todoNow.dueToday") : t("todoNow.daysLeft", { count: d })}`;
      }
      case "receipt": {
        if (!it.at) return obj;
        const d = daysAgo(it.at);
        const base = it.status === "livre" ? "delivered" : "shipped";
        const when = d === 0 ? "Today" : d === 1 ? "Yesterday" : "Ago";
        return `${obj} · ${t(`todoNow.receipt.${base}${when}`, { count: d })}`;
      }
      case "pay": return `${obj} · ${t("todoNow.pay.context", { name: it.name || t("todoNow.findrFallback") })}`;
      case "review": return obj;
      case "dropoff": return it.deadline ? `${obj} · ${t("todoNow.dropoff.context", { date: fmtDate(it.deadline) })}` : obj;
      case "message": return t("todoNow.message.context", { count: it.count || 1 });
      default: return t(`todoNow.${it.kind}.context`);
    }
  };

  const title = (it: TodoItem) =>
    it.kind === "message" ? t("todoNow.message.title", { name: it.name || t("todoNow.someoneFallback") }) : t(`todoNow.${it.kind}.title`);

  const act = (it: TodoItem) => {
    if (it.kind === "stripe") return onStripe();
    if (it.kind === "shipFrom") return onShipFrom();
    if (it.href) navigate(it.href);
  };

  const gold = "inline-flex items-center justify-center min-h-[44px] px-5 rounded-full text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const goldStyle = { backgroundColor: "#D9BB87", color: "#070E42" };

  return (
    <section aria-labelledby="todo-now-title" className="mb-8 rounded-xl bg-white p-5 md:p-6" style={{ border: "1px solid #E5E1D8" }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 id="todo-now-title" className="text-xl md:text-2xl" style={{ fontFamily: "'Playfair Display', serif", color: "#070E42" }}>
            {total === 0 ? t("todoNow.emptyTitle") : t("todoNow.count", { count: total })}
          </h2>
          {total === 0 && <p className="text-sm mt-1" style={{ color: "#4B5563" }}>{t("todoNow.emptyText")}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/poster" className={gold} style={goldStyle}>{t("todoNow.post")}</Link>
          {total === 0 && (
            <Link to="/recherches" className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-full text-sm font-semibold focus-visible:outline-none focus-visible:ring-2" style={{ border: "1.5px solid #070E42", color: "#070E42" }}>
              {t("todoNow.browse")}
            </Link>
          )}
        </div>
      </div>
      {total > 0 && (
        <>
          <ul className="divide-y" style={{ borderColor: "#E5E1D8" }}>
            {visible.map((it) => (
              <li key={it.key} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-[15px]" style={{ color: "#070E42" }}>{title(it)}</p>
                  <p className="text-[13px] break-words" style={{ color: "#4B5563" }}>{context(it)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => act(it)}
                  className="self-start sm:self-auto shrink-0 inline-flex items-center justify-center min-h-[44px] px-4 rounded-full text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: "#070E42", color: "#F5F0EA" }}
                >
                  {t(`todoNow.${it.kind}.button`)}
                </button>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <button type="button" onClick={() => setExpanded(true)} aria-expanded={false} className="mt-2 min-h-[44px] text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2" style={{ color: "#070E42" }}>
              {t("todoNow.more", { count: hiddenCount })}
            </button>
          )}
        </>
      )}
    </section>
  );
};

export default TodoNowBlock;
