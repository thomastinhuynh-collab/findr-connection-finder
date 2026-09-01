import { useEffect, useState } from "react";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const REASON_LABELS: Record<string, string> = {
  chargeback: "Contestation bancaire",
  reversal: "Reversal bancaire",
  remboursement_tardif: "Remboursement tardif",
  ajustement_admin: "Ajustement",
};

const STATUS_LABELS: Record<string, string> = {
  en_attente: "À déduire",
  compense: "Déduit d'un versement",
  rembourse_manuellement: "Réglé",
  annule: "Annulé",
};

interface Debit {
  id: string;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
}

interface Props {
  userId: string;
  negativeBalance: number;
}

const NegativeBalanceBanner = ({ userId, negativeBalance }: Props) => {
  const [open, setOpen] = useState(false);
  const [debits, setDebits] = useState<Debit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    supabase
      .from("findr_debits")
      .select("id, amount, reason, status, created_at")
      .eq("findr_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setDebits((data ?? []) as Debit[]);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, userId]);

  if (!negativeBalance || negativeBalance <= 0) return null;

  return (
    <>
      <div
        className="rounded-xl p-4 flex flex-wrap items-center gap-3"
        style={{ backgroundColor: "#F5F0EA", border: "1px solid #D9BD8B" }}
      >
        <Info className="w-5 h-5 flex-shrink-0" style={{ color: "#112150" }} />
        <p className="text-sm flex-1 min-w-[220px]" style={{ color: "#112150" }}>
          <strong>Solde à régulariser : {negativeBalance.toFixed(2)} €.</strong>{" "}
          Ce montant sera automatiquement déduit de tes prochains versements.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          style={{ borderColor: "#112150", color: "#112150" }}
        >
          Voir le détail
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détail du solde à régulariser</DialogTitle>
            <DialogDescription>
              Chaque ligne correspond à un montant à déduire de tes versements.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : debits.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucun détail disponible.
            </p>
          ) : (
            <div className="divide-y rounded-lg border">
              {debits.map((d) => (
                <div key={d.id} className="p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-primary">{REASON_LABELS[d.reason] ?? d.reason}</span>
                  <span className="font-medium">{Number(d.amount).toFixed(2)} €</span>
                  <Badge variant="outline">{STATUS_LABELS[d.status] ?? d.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NegativeBalanceBanner;
