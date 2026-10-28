import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { formatPrice, parsePrice } from "@/lib/fees";

interface Row { id: string; carrier: string; mode: string; max_weight_kg: number; price_eur: number; updated_at: string }

const AdminShippingRates = () => {
  const { t, i18n } = useTranslation();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [carrier, setCarrier] = useState("");
  const [mode, setMode] = useState("relais");
  const [maxWeight, setMaxWeight] = useState("");
  const [price, setPrice] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("shipping_rates")
      .select("id, carrier, mode, max_weight_kg, price_eur, updated_at")
      .order("carrier").order("mode").order("max_weight_kg");
    if (error) toast({ title: t("adminShipping.error"), description: error.message, variant: "destructive" });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [t]);

  useEffect(() => { if (isAdmin) load(); else if (!roleLoading) setLoading(false); }, [isAdmin, roleLoading, load]);

  const add = async () => {
    const w = parsePrice(maxWeight);
    const p = parsePrice(price);
    if (carrier.trim().length < 2 || !(w > 0) || Number.isNaN(p) || p < 0) {
      toast({ title: t("adminShipping.invalid"), variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("shipping_rates").upsert(
      { carrier: carrier.trim(), mode, max_weight_kg: w, price_eur: p },
      { onConflict: "carrier,mode,max_weight_kg" },
    );
    setSaving(false);
    if (error) { toast({ title: t("adminShipping.error"), description: error.message, variant: "destructive" }); return; }
    toast({ title: t("adminShipping.saved") });
    setMaxWeight(""); setPrice("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("shipping_rates").delete().eq("id", id);
    if (error) { toast({ title: t("adminShipping.error"), description: error.message, variant: "destructive" }); return; }
    load();
  };

  if (roleLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
        <ShieldAlert className="w-10 h-10 text-destructive" />
        <h1 className="text-xl font-semibold text-primary">{t("adminShipping.accessTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("adminShipping.accessIntro")}</p>
        <Button asChild variant="outline"><Link to="/">{t("notFound.backHome")}</Link></Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-primary">{t("adminShipping.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("adminShipping.intro")}</p>
        </header>

        <Card>
          <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <label className="text-sm sm:col-span-2">{t("adminShipping.carrier")}
              <Input value={carrier} onChange={(e) => setCarrier(e.target.value)} maxLength={60} />
            </label>
            <label className="text-sm">{t("adminShipping.mode")}
              <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="relais">{t("adminShipping.relais")}</option>
                <option value="domicile">{t("adminShipping.domicile")}</option>
              </select>
            </label>
            <label className="text-sm">{t("adminShipping.maxWeight")}
              <Input inputMode="decimal" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} />
            </label>
            <label className="text-sm">{t("adminShipping.price")}
              <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </label>
            <Button onClick={add} disabled={saving} className="sm:col-span-5">{t("adminShipping.add")}</Button>
          </CardContent>
        </Card>

        {rows.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">{t("adminShipping.empty")}</CardContent></Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2">{t("adminShipping.carrier")}</th>
                  <th>{t("adminShipping.mode")}</th>
                  <th>{t("adminShipping.maxWeight")}</th>
                  <th>{t("adminShipping.price")}</th>
                  <th>{t("adminShipping.updated")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2">{r.carrier}</td>
                    <td>{t(`adminShipping.${r.mode}`)}</td>
                    <td>{Number(r.max_weight_kg).toLocaleString(i18n.language)}</td>
                    <td>{formatPrice(Number(r.price_eur), i18n.language)}</td>
                    <td>{new Date(r.updated_at).toLocaleDateString(i18n.language)}</td>
                    <td className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => remove(r.id)}>{t("adminShipping.delete")}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminShippingRates;
