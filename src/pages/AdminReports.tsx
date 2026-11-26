import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface SnapshotMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  images?: string[] | null;
  created_at: string;
  hidden_at?: string | null;
}
interface ReportRow {
  id: string;
  message_id: string;
  reporter_id: string;
  reason: string;
  comment: string | null;
  created_at: string;
  context_snapshot: { message?: SnapshotMessage; messages?: SnapshotMessage[] } | null;
}

const PAGE_SIZE = 25;

const AdminReports = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const fetchReports = useCallback(async (from = 0, append = false) => {
    const { data, error } = await supabase
      .from("message_reports")
      .select("id, message_id, reporter_id, reason, comment, created_at, context_snapshot")
      .eq("status", "ouvert")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      toast({ title: t("adminReports.error"), variant: "destructive" });
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as unknown as ReportRow[];
    setReports((prev) => (append ? [...prev, ...rows] : rows));
    setHasMore(rows.length === PAGE_SIZE);
    const ids = Array.from(new Set(rows.flatMap((r) => [r.reporter_id, r.context_snapshot?.message?.sender_id].filter(Boolean) as string[])));
    if (ids.length) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
      const map: Record<string, string> = {};
      (profiles ?? []).forEach((p) => { map[p.user_id] = p.full_name ?? "—"; });
      setNames((prev) => ({ ...prev, ...map }));
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) fetchReports();
    else if (!roleLoading) setLoading(false);
  }, [isAdmin, roleLoading, fetchReports]);

  const handle = async (r: ReportRow, action: "classe" | "averti") => {
    setProcessing(r.id);
    const { error } = await supabase.rpc("handle_message_report", { _report_id: r.id, _action: action });
    setProcessing(null);
    if (error) { toast({ title: t("adminReports.error"), variant: "destructive" }); return; }
    toast({ title: t("adminReports.done") });
    setReports((prev) => prev.filter((x) => x.id !== r.id));
  };

  const hide = async (r: ReportRow) => {
    setProcessing(r.id);
    const { error } = await supabase.rpc("hide_message", {
      _message_id: r.message_id,
      _reason: t(`messageReport.reasons.${r.reason}`, { lng: "fr" }),
    });
    setProcessing(null);
    if (error) { toast({ title: t("adminReports.error"), variant: "destructive" }); return; }
    toast({ title: t("adminReports.hidden") });
    setHidden((prev) => ({ ...prev, [r.message_id]: true }));
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString(i18n.language === "en" ? "en-GB" : "fr-FR", { dateStyle: "short", timeStyle: "short" });

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
        <ShieldAlert className="w-10 h-10 text-destructive" />
        <h1 className="text-xl font-semibold text-primary">Accès refusé</h1>
        <p className="text-sm text-muted-foreground">Cette page est réservée à l'équipe findr.</p>
        <Button asChild variant="outline"><Link to="/">Retour à l'accueil</Link></Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-bold text-primary">{t("adminReports.title")}</h1>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/admin/litiges">{t("adminReports.disputesLink")}</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/admin/tarifs-port">{t("adminShipping.link")}</Link></Button>
          </div>
        </header>

        {reports.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">{t("adminReports.empty")}</CardContent></Card>
        ) : (
          <div className="space-y-6">
            {reports.map((r) => {
              const msg = r.context_snapshot?.message;
              const ctx = r.context_snapshot?.messages ?? [];
              const isHidden = hidden[r.message_id];
              return (
                <Card key={r.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-lg text-primary">{t(`messageReport.reasons.${r.reason}`)}</CardTitle>
                      <Badge variant="outline">{fmt(r.created_at)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("adminReports.reporter")} : {names[r.reporter_id] ?? "—"} · {t("adminReports.author")} : {msg ? names[msg.sender_id] ?? "—" : "—"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <section>
                      <h2 className="text-sm font-semibold text-primary mb-1">{t("adminReports.reportedMessage")}</h2>
                      <blockquote className="rounded-lg border bg-muted/40 px-3 py-2 text-sm whitespace-pre-wrap break-words">{msg?.content ?? "—"}</blockquote>
                      {isHidden && <p className="mt-1 text-xs text-muted-foreground">{t("adminReports.hidden")}</p>}
                    </section>
                    {r.comment && (
                      <section>
                        <h2 className="text-sm font-semibold text-primary mb-1">{t("adminReports.comment")}</h2>
                        <p className="text-sm whitespace-pre-wrap break-words">{r.comment}</p>
                      </section>
                    )}
                    <details className="rounded-lg border px-3 py-2">
                      <summary className="cursor-pointer text-sm font-semibold text-primary min-h-[44px] flex items-center">{t("adminReports.context")} ({ctx.length})</summary>
                      <ol className="mt-2 space-y-2">
                        {ctx.map((m) => (
                          <li key={m.id} className={`rounded-md px-3 py-2 text-sm ${m.id === r.message_id ? "border-2 border-destructive" : "bg-muted/30"}`}>
                            <p className="text-xs text-muted-foreground">{names[m.sender_id] ?? (m.sender_id === r.reporter_id ? t("adminReports.reporter") : t("adminReports.author"))} · {fmt(m.created_at)}</p>
                            <p className="whitespace-pre-wrap break-words">{m.content}</p>
                            {m.images && m.images.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-2">
                                {m.images.map((src) => <a key={src} href={src} target="_blank" rel="noreferrer" className="text-xs underline">Photo</a>)}
                              </div>
                            )}
                          </li>
                        ))}
                      </ol>
                    </details>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="min-h-[44px]" disabled={processing === r.id} onClick={() => handle(r, "classe")}>{t("adminReports.dismiss")}</Button>
                      <Button variant="outline" className="min-h-[44px]" disabled={processing === r.id} onClick={() => handle(r, "averti")}>{t("adminReports.warn")}</Button>
                      <Button variant="destructive" className="min-h-[44px]" disabled={processing === r.id || isHidden} onClick={() => hide(r)}>{t("adminReports.hide")}</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {hasMore && (
              <Button variant="outline" className="w-full min-h-[44px]" onClick={() => fetchReports(reports.length, true)}>{t("adminReports.loadMore")}</Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminReports;
