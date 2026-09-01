import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, PauseCircle, PlayCircle, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const REASON_LABELS: Record<string, string> = {
  chargeback: "Contestation bancaire",
  reversal: "Reversal Stripe",
  remboursement_tardif: "Remboursement tardif",
  ajustement_admin: "Ajustement admin",
};

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  compense: "Compensé",
  rembourse_manuellement: "Réglé manuellement",
  annule: "Annulé",
};

interface FindrRow {
  user_id: string;
  full_name: string | null;
  negative_balance: number;
  payout_hold: boolean;
}

interface DebitRow {
  id: string;
  findr_id: string;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
  admin_notes: string | null;
}

const AdminNegativeBalances = () => {
  const [findrs, setFindrs] = useState<FindrRow[]>([]);
  const [debits, setDebits] = useState<DebitRow[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, negative_balance, payout_hold")
      .gt("negative_balance", 0)
      .order("negative_balance", { ascending: false });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const rows = (profiles ?? []) as FindrRow[];
    setFindrs(rows);

    if (rows.length) {
      const { data: debitRows } = await supabase
        .from("findr_debits")
        .select("id, findr_id, amount, reason, status, created_at, admin_notes")
        .in(
          "findr_id",
          rows.map((r) => r.user_id),
        )
        .order("created_at", { ascending: false });
      setDebits((debitRows ?? []) as DebitRow[]);
    } else {
      setDebits([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const callAdmin = async (findrId: string, body: Record<string, unknown>) => {
    const note = (notes[findrId] ?? "").trim();
    if (note.length < 5) {
      toast({
        title: "Notes obligatoires",
        description: "Renseigne les notes internes avant d'agir.",
        variant: "destructive",
      });
      return;
    }
    setProcessing(findrId);
    try {
      const { data, error } = await supabase.functions.invoke("admin-findr-balances", {
        body: { ...body, findrId, notes: note },
      });
      if (error || (data as { error?: string })?.error) {
        throw new Error((data as { error?: string })?.error ?? error?.message);
      }
      toast({ title: "Action effectuée" });
      setNotes((prev) => ({ ...prev, [findrId]: "" }));
      fetchData();
    } catch (e: unknown) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Action impossible.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="mt-12">
      <header className="mb-4">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          Soldes à recouvrer
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {findrs.length} findr{findrs.length > 1 ? "s" : ""} avec un solde négatif — montants les
          plus élevés en premier.
        </p>
      </header>

      {findrs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucun solde à recouvrer.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {findrs.map((f) => {
            const history = debits.filter((d) => d.findr_id === f.user_id);
            return (
              <Card key={f.user_id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-lg text-primary break-words">
                      {f.full_name ?? "Utilisateur"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {f.payout_hold && <Badge variant="destructive">Versements en attente</Badge>}
                      <Badge variant="secondary">
                        {Number(f.negative_balance).toFixed(2)} € à recouvrer
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 min-w-0">
                  <div className="rounded-lg border divide-y">
                    {history.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">Aucun historique.</p>
                    ) : (
                      history.map((d) => (
                        <div
                          key={d.id}
                          className="p-3 text-sm flex flex-wrap items-center justify-between gap-2"
                        >
                          <span className="text-primary">
                            {REASON_LABELS[d.reason] ?? d.reason}
                          </span>
                          <span className="font-medium">{Number(d.amount).toFixed(2)} €</span>
                          <Badge variant="outline">{STATUS_LABELS[d.status] ?? d.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(d.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`bal-notes-${f.user_id}`}>Notes internes (obligatoire)</Label>
                    <Textarea
                      id={`bal-notes-${f.user_id}`}
                      rows={2}
                      value={notes[f.user_id] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [f.user_id]: e.target.value }))
                      }
                      placeholder="Motif de l'action, référence du virement reçu..."
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={processing === f.user_id}
                      onClick={() => callAdmin(f.user_id, { action: "mark_settled" })}
                    >
                      {processing === f.user_id && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Marquer comme réglé manuellement
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processing === f.user_id}
                      onClick={() =>
                        callAdmin(f.user_id, {
                          action: "set_payout_hold",
                          hold: !f.payout_hold,
                        })
                      }
                    >
                      {f.payout_hold ? (
                        <PlayCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <PauseCircle className="w-4 h-4 mr-1" />
                      )}
                      {f.payout_hold
                        ? "Réactiver les versements"
                        : "Mettre les versements en attente"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default AdminNegativeBalances;
