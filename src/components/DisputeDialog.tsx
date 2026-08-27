import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const DISPUTE_REASONS: Record<string, string> = {
  objet_non_conforme: "L'objet ne correspond pas à la description",
  objet_endommage: "L'objet est endommagé",
  objet_non_recu: "Je n'ai pas reçu l'objet",
  autre: "Autre",
};

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string;
  findrId: string;
  searchId: string;
  itemTitle: string;
  onSubmitted?: () => void;
}

const DisputeDialog = ({
  open,
  onOpenChange,
  reservationId,
  findrId,
  searchId,
  itemTitle,
  onSubmitted,
}: DisputeDialogProps) => {
  const [reason, setReason] = useState("objet_non_conforme");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (description.trim().length < 10) {
      toast({
        title: "Description trop courte",
        description: "Explique le problème en quelques lignes (10 caractères minimum).",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      let photoUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `disputes/${reservationId}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("search-images")
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        photoUrl = supabase.storage.from("search-images").getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase
        .from("reservations")
        .update({
          dispute_open: true,
          dispute_status: "ouvert",
          dispute_reason: reason,
          dispute_description: description.trim(),
          dispute_photo_url: photoUrl,
          dispute_opened_at: new Date().toISOString(),
        })
        .eq("id", reservationId);
      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: findrId,
        type: "dispute_opened",
        title: "⚠️ Litige ouvert sur une transaction",
        message: `Le buyr a signalé un problème sur « ${itemTitle} » : ${DISPUTE_REASONS[reason]}. Le paiement est bloqué le temps de l'examen par l'équipe findr.`,
        link: `/messagerie/${searchId}`,
      });

      toast({
        title: "Signalement envoyé",
        description: "Notre équipe examine ta réclamation. Le paiement reste bloqué.",
      });
      onOpenChange(false);
      setDescription("");
      setFile(null);
      onSubmitted?.();
    } catch (e: unknown) {
      toast({
        title: "Erreur",
        description:
          e instanceof Error ? e.message : "Impossible d'envoyer le signalement.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <span className="break-words">Signaler un problème</span>
          </DialogTitle>
          <DialogDescription>
            Décris précisément le problème rencontré avec « {itemTitle} ».
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 min-w-0">
          <div className="space-y-1.5">
            <Label>Que s'est-il passé ?</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DISPUTE_REASONS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dispute-description">Description *</Label>
            <Textarea
              id="dispute-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explique ce qui ne va pas..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dispute-photo">Photo du problème (optionnel)</Label>
            <Input
              id="dispute-photo"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <p className="text-xs text-muted-foreground bg-secondary/60 rounded-lg p-3">
            Le paiement restera bloqué le temps que notre équipe examine ta réclamation.
          </p>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Envoyer le signalement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeDialog;
