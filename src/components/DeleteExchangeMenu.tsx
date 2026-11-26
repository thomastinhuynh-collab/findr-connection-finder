import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteErrorKey } from "@/lib/deleteExchange";

const NAVY = "#070E42";
const MUTED = "#5C5648";

interface Props {
  searchId: string;
  partnerId: string;
  /** Prénom de l'autre personne, déjà extrait. */
  partnerFirstName: string;
  canDelete: boolean;
  onDeleted: () => void;
}

/** Bouton « ⋯ » + « Supprimer la conversation » + confirmation, appel à hide_exchange. */
const DeleteExchangeMenu = ({ searchId, partnerId, partnerFirstName, canDelete, onDeleted }: Props) => {
  const { t } = useTranslation();
  const name = partnerFirstName || t("messagingList.deleteExchange.someone");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true); setErrorKey(null);
    const { error } = await supabase.rpc("hide_exchange", { _search_id: searchId, _partner_id: partnerId });
    setBusy(false);
    if (error) { setErrorKey(deleteErrorKey(error.message)); return; }
    setOpen(false);
    onDeleted();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label={t("messagingList.deleteExchange.menuLabel", { name })}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold transition-colors hover:bg-[#F5F0E8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: NAVY, outlineColor: NAVY }}>
            <span aria-hidden="true">⋯</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-w-[280px]">
          <DropdownMenuItem disabled={!canDelete} aria-describedby={canDelete ? undefined : `del-blocked-${searchId}-${partnerId}`}
            className="min-h-[44px] flex-col items-start gap-0.5 data-[disabled]:opacity-100"
            onSelect={() => { setErrorKey(null); setOpen(true); }}>
            <span className="text-sm font-medium" style={{ color: canDelete ? NAVY : MUTED }}>{t("messagingList.deleteExchange.action")}</span>
            {!canDelete && (
              <span id={`del-blocked-${searchId}-${partnerId}`} className="text-xs" style={{ color: MUTED }}>
                {t("messagingList.deleteExchange.blocked")}
              </span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={open} onOpenChange={(o) => { if (!busy) setOpen(o); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: NAVY }}>{t("messagingList.deleteExchange.title")}</AlertDialogTitle>
            <AlertDialogDescription style={{ color: MUTED }}>{t("messagingList.deleteExchange.body", { name })}</AlertDialogDescription>
          </AlertDialogHeader>
          {errorKey && <p role="alert" className="text-sm" style={{ color: "#A1261B" }}>{t(`messagingList.deleteExchange.${errorKey}`)}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]" disabled={busy}>{t("messagingList.deleteExchange.keep")}</AlertDialogCancel>
            <button type="button" onClick={confirm} disabled={busy}
              className="inline-flex min-h-[44px] items-center justify-center rounded-md px-5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ backgroundColor: NAVY, color: "#F5F1E8", outlineColor: NAVY }}>
              {busy ? t("messagingList.deleteExchange.deleting") : t("messagingList.deleteExchange.confirm")}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteExchangeMenu;
