import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EXPERIMENT_HERO } from "@/lib/abTest";
import { Card } from "@/components/ui/card";

type Row = {
  variant: "A" | "B";
  event_type: "view" | "click";
  cta: string | null;
  session_id: string;
};

type Stats = {
  variant: "A" | "B";
  uniqueViews: number;
  totalClicks: number;
  primaryClicks: number;
  secondaryClicks: number;
  ctr: number;
  primaryCtr: number;
};

const AbTestDashboard = () => {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("ab_events")
        .select("variant,event_type,cta,session_id")
        .eq("experiment", EXPERIMENT_HERO)
        .limit(10000);
      if (error) setError(error.message);
      else setRows(data as Row[]);
    })();
  }, [user]);

  if (loading) return <div className="container mx-auto py-24">Chargement…</div>;
  if (!user) return <Navigate to="/" replace />;

  const compute = (variant: "A" | "B"): Stats => {
    const r = (rows ?? []).filter((x) => x.variant === variant);
    const uniqueViews = new Set(
      r.filter((x) => x.event_type === "view").map((x) => x.session_id),
    ).size;
    const clicks = r.filter((x) => x.event_type === "click");
    const primaryClicks = clicks.filter((x) => x.cta === "hero_cta_primary").length;
    const secondaryClicks = clicks.filter((x) => x.cta === "hero_cta_secondary").length;
    const totalClicks = clicks.length;
    return {
      variant,
      uniqueViews,
      totalClicks,
      primaryClicks,
      secondaryClicks,
      ctr: uniqueViews ? (totalClicks / uniqueViews) * 100 : 0,
      primaryCtr: uniqueViews ? (primaryClicks / uniqueViews) * 100 : 0,
    };
  };

  const a = compute("A");
  const b = compute("B");
  const lift = a.ctr ? ((b.ctr - a.ctr) / a.ctr) * 100 : 0;

  return (
    <div className="container mx-auto py-24 px-4 max-w-5xl">
      <h1 className="text-3xl font-poppins font-bold mb-2">A/B test — Hero</h1>
      <p className="text-muted-foreground mb-8">
        Expérience : <code>{EXPERIMENT_HERO}</code> · Répartition 50/50
      </p>

      {error && <p className="text-destructive">{error}</p>}
      {!rows && !error && <p>Chargement des données…</p>}

      {rows && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[a, b].map((s) => (
              <Card key={s.variant} className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  Variante {s.variant}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {s.variant === "A" ? "(ancien hero)" : "(nouveau hero)"}
                  </span>
                </h2>
                <dl className="space-y-2 text-sm">
                  <Row label="Vues uniques" value={s.uniqueViews} />
                  <Row label="Clics totaux" value={s.totalClicks} />
                  <Row label="Clics CTA principal" value={s.primaryClicks} />
                  <Row label="Clics CTA secondaire" value={s.secondaryClicks} />
                  <Row
                    label="CTR global"
                    value={`${s.ctr.toFixed(2)} %`}
                    bold
                  />
                  <Row
                    label="CTR principal"
                    value={`${s.primaryCtr.toFixed(2)} %`}
                  />
                </dl>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="font-bold mb-2">Lift de la variante B vs A</h3>
            <p
              className={`text-3xl font-bold ${
                lift > 0 ? "text-green-600" : lift < 0 ? "text-destructive" : ""
              }`}
            >
              {lift > 0 ? "+" : ""}
              {lift.toFixed(1)} %
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Calculé sur le CTR global (clics / vues uniques). Significativité
              statistique non calculée — viser ≥ ~300 vues par variante avant
              de conclure.
            </p>
          </Card>

          <p className="text-xs text-muted-foreground mt-6">
            Astuce QA : ajoute <code>?ab=A</code> ou <code>?ab=B</code> à
            l'URL de la home pour forcer une variante.
          </p>
        </>
      )}
    </div>
  );
};

const Row = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string | number;
  bold?: boolean;
}) => (
  <div className="flex justify-between border-b pb-1">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className={bold ? "font-bold" : ""}>{value}</dd>
  </div>
);

export default AbTestDashboard;
