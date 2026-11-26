import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export default function MessageEmailPreference({ enabled, onSaved }: { enabled: boolean; onSaved: () => void | Promise<void> }) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const save = async (next: boolean) => {
    setSaving(true);
    setError(false);
    try {
      const { error: failure } = await supabase.rpc("update_message_email_preference", { _enabled: next });
      if (failure) throw failure;
      await onSaved();
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };
  return (
    <section id="notifications" aria-labelledby="message-notifications-heading" className="scroll-mt-28 py-5 border-t border-border">
      <h2 id="message-notifications-heading" className="text-base font-semibold text-foreground mb-3">{t("mySpace.account.notificationsTitle")}</h2>
      <div className="flex items-center gap-3 min-h-11">
        <Switch id="message-email-preference" checked={enabled} onCheckedChange={save} disabled={saving} className="h-11" />
        <Label htmlFor="message-email-preference" className="flex items-center min-h-11 text-sm leading-relaxed cursor-pointer">{t("mySpace.account.messageEmails")}</Label>
      </div>
      {saving && <p role="status" className="mt-2 text-xs text-muted-foreground">{t("common.loading")}</p>}
      {error && <p role="alert" className="mt-2 text-xs text-destructive">{t("mySpace.account.messageEmailsError")}</p>}
    </section>
  );
}