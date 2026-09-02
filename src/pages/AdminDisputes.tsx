import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, MessageCircle, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { DISPUTE_REASONS } from "@/components/DisputeDialog";
import AdminNegativeBalances from "@/components/AdminNegativeBalances";
import AdminForceShipped from "@/components/AdminForceShipped";

interface DisputeRow {
  id: string;
  search_id: string;
  buyr_id: string;
  findr_id: string;
  proposal_id: string | null;
  object_price: number | null;
  total_buyr_amount: number | null;
  findr_payout_amount: number | null;
  dispute_reason: string | null;
  dispute_description: string | null;
  dispute_photo_url: string | null;
  dispute_opened_at: string | null;
  proposals?: { title: string | null } | null;
}

const AdminDisputes = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = useCallback(async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select(
        "id, search_id, buyr_id, findr_id, proposal_id, object_price, total_buyr_amount, findr_payout_amount, dispute_reason, dispute_description, dispute_photo_url, dispute_opened_at, proposals(title)",
      )
      .eq("dispute_status", "ouvert")
      .order("dispute_opened_at", { ascending: true });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as unknown as DisputeRow[];
    setDisputes(rows);

    const ids = Array.from(new Set(rows.flatMap((r) => [r.buyr_id, r.findr_id])));
    if (ids.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", ids);
      const map: Record<string, string> = {};
      (profiles ?? []).forEach((p) => {
        map[p.user_id] = p.full_name ?? "Utilisateur";
      });
      setNames(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (isAdmin) fetchDisputes();
    else if (!roleLoading) setLoading(false);
  }, [isAdmin, roleLoading, fetchDisputes]);

  const handleResolve = async (
    dispute: DisputeRow,
    resolution: "verse_findr" | "rembourse_buyr",
  ) => {
    const note = (notes[dispute.id] ?? "").trim();
    if (note.length < 5) {
      toast({
        title: "Notes obligatoires",
        description: "Renseigne les notes internes avant de trancher.",
        variant: "destructive",
      });
      return;
    }
    setProcessing(dispute.id);
    try {
      const { data, error } = await supabase.functions.invoke("resolve-dispute", {
        body: { reservationId: dispute.id, resolution, notes: note },
      });
      if (error || (data as { error?: string })?.error) {
        throw new Error((data as { error?: string })?.error ?? error?.message);
      }
      toast({
        title: "Litige résolu",
        description:
          resolution === "verse_findr"
            ? "Les fonds ont été versés au findr."
            : "Le buyr a été intégralement remboursé.",
      });
      fetchDisputes();
    } catch (e: unknown) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Résolution impossible.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
        <ShieldAlert className="w-10 h-10 text-destructive" />
        <h1 className="text-xl font-semibold text-primary">Accès refusé</h1>
        <p className="text-sm text-muted-foreground">
          Cette page est réservée à l'équipe findr.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-destructive" />
            Litiges en cours
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {disputes.length} litige{disputes.length > 1 ? "s" : ""} à traiter — les plus anciens
            en premier.
          </p>
        </header>

        {disputes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucun litige ouvert. 🎉
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {disputes.map((d) => (
              <Card key={d.id} className="border-destructive/30">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="text-lg text-primary break-words">
                      {d.proposals?.title ?? "Objet"}
                    </CardTitle>
                    <Badge variant="destructive">
                      {d.dispute_reason
                        ? DISPUTE_REASONS[d.dispute_reason] ?? d.dispute_reason
                        : "Litige"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ouvert le{" "}
                    {d.dispute_opened_at
                      ? new Date(d.dispute_opened_at).toLocaleString("fr-FR")
                      : "—"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 min-w-0">
                  <div className="grid gap-2 sm:grid-cols-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">buyr :</span>{" "}
                      {names[d.buyr_id] ?? d.buyr_id}
                    </p>
                    <p>
                      <span className="text-muted-foreground">findr :</span>{" "}
                      {names[d.findr_id] ?? d.findr_id}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Prix objet :</span>{" "}
                      {Number(d.object_price ?? 0).toFixed(2)} €
                    </p>
                    <p>
                      <span className="text-muted-foreground">Payé par le buyr :</span>{" "}
                      {Number(d.total_buyr_amount ?? 0).toFixed(2)} €
                    </p>
                    <p>
                      <span className="text-muted-foreground">Versement findr prévu :</span>{" "}
                      {Number(d.findr_payout_amount ?? 0).toFixed(2)} €
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary/60 p-3 text-sm break-words">
                    {d.dispute_description || "Aucune description fournie."}
                  </div>

                  {d.dispute_photo_url && (
                    <a href={d.dispute_photo_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={d.dispute_photo_url}
                        alt="Photo du problème signalé par le buyr"
                        className="max-h-56 rounded-lg border object-contain"
                      />
                    </a>
                  )}

                  <Button asChild variant="outline" size="sm">
                    <Link to={`/messagerie/${d.search_id}?with=${d.findr_id}`}>
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Voir la conversation
                    </Link>
                  </Button>

                  <div className="space-y-1.5">
                    <Label htmlFor={`notes-${d.id}`}>Notes internes (obligatoire)</Label>
                    <Textarea
                      id={`notes-${d.id}`}
                      rows={3}
                      value={notes[d.id] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [d.id]: e.target.value }))
                      }
                      placeholder="Décision et éléments pris en compte..."
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={processing === d.id}
                      onClick={() => handleResolve(d, "verse_findr")}
                    >
                      {processing === d.id && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Verser au findr
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={processing === d.id}
                      onClick={() => handleResolve(d, "rembourse_buyr")}
                    >
                      Rembourser le buyr
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AdminNegativeBalances />
      </div>

    </main>
  );
};

export default AdminDisputes;
