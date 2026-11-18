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
import { formatPrice } from "@/lib/fees";
import { useTranslation } from "react-i18next";

export const DEBIT_REASONS = ["chargeback", "reversal", "remboursement_tardif", "ajustement_admin"];
export const DEBIT_STATUSES = ["en_attente", "compense", "rembourse_manuellement", "annule"];

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
  const { t, i18n } = useTranslation();
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
        role="status"
        className="rounded-xl p-4 flex items-start gap-3"
        style={{ backgroundColor: "#F5F0EA", border: "1px solid #D9BB87" }}
      >
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#070E42" }} aria-hidden="true" />
        <div className="text-sm space-y-1" style={{ color: "#070E42" }}>
          <p className="font-semibold">{t("mySpace.account.debitLine1", { amount: formatPrice(negativeBalance, i18n.language) })}</p>
          <p>{t("mySpace.account.debitLine2")}</p>
          <button type="button" onClick={() => setOpen(true)} className="font-semibold underline min-h-[44px]">
            {t("mySpace.account.debitLink")}
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("mySpace.debitDetail.title")}</DialogTitle>
            <DialogDescription>
              {t("mySpace.debitDetail.description")}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : debits.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("mySpace.debitDetail.empty")}
            </p>
          ) : (
            <div className="divide-y rounded-lg border">
              {debits.map((d) => (
                <div key={d.id} className="p-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-primary">{DEBIT_REASONS.includes(d.reason) ? t(`mySpace.debitDetail.reasons.${d.reason}`) : d.reason}</span>
                  <span className="font-medium">{formatPrice(Number(d.amount), i18n.language)}</span>
                  <Badge variant="outline">{DEBIT_STATUSES.includes(d.status) ? t(`mySpace.debitDetail.statuses.${d.status}`) : d.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString(i18n.language?.startsWith("en") ? "en-GB" : "fr-FR")}
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
