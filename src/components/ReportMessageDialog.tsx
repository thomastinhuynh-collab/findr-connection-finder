import { useEffect, useState } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const REPORT_REASONS = [
  "insultes_harcelement",
  "arnaque_lien_suspect",
  "paiement_hors_findr",
  "contenu_interdit",
  "autre",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
const MAX_COMMENT = 240;

interface Props {
  message: { id: string; content: string } | null;
  onClose: () => void;
  /** Élément qui reçoit le focus à la fermeture (bouton « ⋯ »). */
  returnFocusRef?: React.RefObject<HTMLElement>;
}

const ReportMessageDialog = ({ message, onClose, returnFocusRef }: Props) => {
  const restoreFocus = (e: Event) => {
    if (!returnFocusRef?.current) return;
    e.preventDefault();
    returnFocusRef.current.focus();
  };
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [reason, setReason] = useState<ReportReason | "">("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (message) { setReason(""); setComment(""); }
  }, [message]);

  const submit = async () => {
    if (!message || !reason) return;
    setSending(true);
    const { data, error } = await supabase.functions.invoke("report-message", {
      body: { messageId: message.id, reason, comment: comment.trim() || null },
    });
    setSending(false);
    const code = (data as { error?: string } | null)?.error
      ?? (error && "context" in error ? await (error as { context: Response }).context.json().then((b) => b?.error).catch(() => null) : null);
    if (error || code) {
      toast({
        title: code === "report_rate_limited" ? t("messageReport.reportRateLimited") : t("messageReport.reportError"),
        variant: "destructive",
      });
      return;
    }
    toast({ title: t("messageReport.reportThanks") });
    onClose();
  };

  const body = (
    <div className="space-y-4">
      {message && (
        <blockquote className="rounded-xl border bg-muted/40 px-4 py-3 text-sm whitespace-pre-wrap break-words" style={{ borderColor: "#ECE6DA", color: "#1F2937" }}>
          {message.content}
        </blockquote>
      )}
      <fieldset>
        <legend className="mb-2 text-sm font-medium" style={{ color: "#070E42" }}>{t("messageReport.reportReasonLegend")}</legend>
        <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)} className="gap-1">
          {REPORT_REASONS.map((r) => (
            <Label key={r} htmlFor={`report-${r}`} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg px-2 text-sm font-normal hover:bg-muted/50">
              <RadioGroupItem id={`report-${r}`} value={r} />
              {t(`messageReport.reasons.${r}`)}
            </Label>
          ))}
        </RadioGroup>
      </fieldset>
      <div className="space-y-1.5">
        <Label htmlFor="report-comment" className="text-sm">{t("messageReport.reportComment")}</Label>
        <Textarea id="report-comment" value={comment} maxLength={MAX_COMMENT} rows={3}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))} />
        <p className="text-right text-xs" style={{ color: "#6B7280" }}>{MAX_COMMENT - comment.length}</p>
      </div>
      <p className="text-xs" style={{ color: "#4B5563" }}>{t("messageReport.reportNotice")}</p>
    </div>
  );

  const actions = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="outline" className="min-h-[44px]" onClick={onClose} disabled={sending}>{t("messageReport.reportCancel")}</Button>
      <Button className="min-h-[44px]" onClick={submit} disabled={!reason || sending}>
        {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t("messageReport.reportSubmit")}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={!!message} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="bottom" onCloseAutoFocus={restoreFocus} className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>{t("messageReport.reportTitle")}</SheetTitle>
            <SheetDescription className="sr-only">{t("messageReport.reportNotice")}</SheetDescription>
          </SheetHeader>
          {body}
          <div className="mt-5 pb-[env(safe-area-inset-bottom)]">{actions}</div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={!!message} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md" onCloseAutoFocus={restoreFocus}>
        <DialogHeader>
          <DialogTitle>{t("messageReport.reportTitle")}</DialogTitle>
          <DialogDescription className="sr-only">{t("messageReport.reportNotice")}</DialogDescription>
        </DialogHeader>
        {body}
        <DialogFooter>{actions}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportMessageDialog;
