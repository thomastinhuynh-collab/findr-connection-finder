import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, Loader2, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Row {
  id: string;
  payment_status: string | null;
  status: string;
  created_at: string;
  object_price: number | null;
  proposals?: { title: string | null } | null;
}

/**
 * Action de test réservée aux admins : force une réservation en "expédiée"
 * avec un numéro de suivi factice. La sécurité réelle est côté Edge Function.
 */
const CARRIERS = [
  "Colissimo",
  "Mondial Relay",
  "Chronopost",
  "DHL",
  "UPS",
  "FedEx",
  "DPD",
  "GLS",
  "TNT",
  "Colis Privé",
];

const AdminForceShipped = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [carriers, setCarriers] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reservations")
      .select("id, payment_status, status, created_at, object_price, proposals(title)")
      .is("shipped_at", null)
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setRows((data ?? []) as unknown as Row[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const force = async (id: string) => {
    setProcessing(id);
    try {
      const { data, error } = await supabase.functions.invoke("admin-force-shipped", {
        body: { reservationId: id, trackingNumber: tracking[id]?.trim() || undefined },
      });
      if (error || (data as { error?: string })?.error) {
        throw new Error((data as { error?: string })?.error ?? error?.message);
      }
      toast({
        title: "Réservation forcée en expédiée",
        description: `Suivi factice : ${(data as { trackingNumber: string }).trackingNumber}`,
      });
      fetchRows();
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

  return (
    <Card className="mt-10 border-dashed">
      <CardHeader>
        <CardTitle className="text-lg text-primary flex items-center gap-2">
          <FlaskConical className="w-5 h-5" />
          Forcer une expédition
        </CardTitle>
        <Badge variant="outline" className="w-fit border-destructive text-destructive">
          Action de test — usage interne uniquement
        </Badge>
        <p className="text-xs text-muted-foreground">
          Marque une réservation comme expédiée avec un numéro de suivi factice, sans passer par
          le compte du findr. Ne reflète pas le vrai parcours utilisateur.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune réservation non expédiée.</p>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-primary break-words">
                  {r.proposals?.title ?? "Réservation"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {r.status} · {r.payment_status ?? "—"} ·{" "}
                  {new Date(r.created_at).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1 min-w-[200px] space-y-1">
                  <Label htmlFor={`trk-${r.id}`} className="text-xs">
                    Numéro de suivi factice (optionnel)
                  </Label>
                  <Input
                    id={`trk-${r.id}`}
                    value={tracking[r.id] ?? ""}
                    onChange={(e) =>
                      setTracking((p) => ({ ...p, [r.id]: e.target.value }))
                    }
                    placeholder="TEST-123456"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={processing === r.id}
                  onClick={() => force(r.id)}
                >
                  {processing === r.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Truck className="w-4 h-4 mr-2" />
                  )}
                  Forcer « expédiée »
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AdminForceShipped;
