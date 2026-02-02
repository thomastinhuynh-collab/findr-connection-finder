import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarClock,
  Check,
  X,
  Clock,
  User,
  Loader2,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Reservation {
  id: string;
  search_id: string;
  findr_id: string;
  justification: string;
  requested_duration_days: number;
  approved_duration_days: number | null;
  status: string;
  expires_at: string | null;
  created_at: string;
  findr_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface ReservationCardProps {
  reservation: Reservation;
  isOwner: boolean;
  searchTitle: string;
  onUpdate: () => void;
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", variant: "secondary" },
  approved: { label: "Approuvée", variant: "default" },
  rejected: { label: "Refusée", variant: "destructive" },
  expired: { label: "Expirée", variant: "outline" },
  cancelled: { label: "Annulée", variant: "outline" },
};

const durationOptions = [
  { value: "3", label: "3 jours" },
  { value: "7", label: "1 semaine" },
  { value: "14", label: "2 semaines" },
  { value: "30", label: "1 mois" },
];

const ReservationCard = ({
  reservation,
  isOwner,
  searchTitle,
  onUpdate,
}: ReservationCardProps) => {
  const { toast } = useToast();
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(
    reservation.requested_duration_days.toString()
  );
  const [processing, setProcessing] = useState(false);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(selectedDuration));

      // Update reservation
      const { error: reservationError } = await supabase
        .from("reservations")
        .update({
          status: "approved",
          approved_duration_days: parseInt(selectedDuration),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", reservation.id);

      if (reservationError) throw reservationError;

      // Update search status to reserved
      const { error: searchError } = await supabase
        .from("searches")
        .update({ status: "reserved" })
        .eq("id", reservation.search_id);

      if (searchError) throw searchError;

      // Notify Findr
      await supabase.from("notifications").insert({
        user_id: reservation.findr_id,
        type: "reservation_approved",
        title: "Réservation acceptée !",
        message: `Ta demande de réservation pour "${searchTitle}" a été acceptée pour ${selectedDuration} jours.`,
        link: `/recherche/${reservation.search_id}`,
      });

      toast({
        title: "Réservation acceptée",
        description: `L'annonce est maintenant réservée pour ${selectedDuration} jours.`,
      });

      setShowAcceptDialog(false);
      onUpdate();
    } catch (error) {
      console.error("Error accepting reservation:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la réservation.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: "rejected" })
        .eq("id", reservation.id);

      if (error) throw error;

      // Notify Findr
      await supabase.from("notifications").insert({
        user_id: reservation.findr_id,
        type: "reservation_rejected",
        title: "Réservation refusée",
        message: `Ta demande de réservation pour "${searchTitle}" a été refusée.`,
        link: `/recherche/${reservation.search_id}`,
      });

      toast({
        title: "Réservation refusée",
        description: "La demande a été refusée.",
      });

      setShowRejectDialog(false);
      onUpdate();
    } catch (error) {
      console.error("Error rejecting reservation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de refuser la réservation.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy 'à' HH:mm", {
      locale: fr,
    });
  };

  const statusInfo = statusLabels[reservation.status] || statusLabels.pending;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-accent" />
                <CardTitle className="text-base">Demande de réservation</CardTitle>
              </div>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Findr info */}
            <div className="flex items-center gap-3">
              {reservation.findr_profile?.avatar_url ? (
                <img
                  src={reservation.findr_profile.avatar_url}
                  alt={reservation.findr_profile.full_name || "findr"}
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-medium text-primary">
                  {reservation.findr_profile?.full_name || "findr"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Demandé le {formatDate(reservation.created_at)}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Durée demandée :</span>
              <span className="font-medium text-primary">
                {reservation.requested_duration_days} jours
              </span>
            </div>

            {reservation.approved_duration_days && (
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Durée approuvée :</span>
                <span className="font-medium text-accent">
                  {reservation.approved_duration_days} jours
                </span>
              </div>
            )}

            {reservation.expires_at && reservation.status === "approved" && (
              <div className="flex items-center gap-2 text-sm bg-accent/10 p-2 rounded-lg">
                <CalendarClock className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Expire le :</span>
                <span className="font-medium text-accent">
                  {formatDate(reservation.expires_at)}
                </span>
              </div>
            )}

            {/* Justification */}
            <div className="bg-secondary/50 rounded-xl p-4">
              <p className="text-sm font-medium text-primary mb-2">
                Justification :
              </p>
              <p className="text-sm text-muted-foreground">
                {reservation.justification}
              </p>
            </div>

            {/* Actions for Owner */}
            {isOwner && reservation.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Refuser
                </Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90"
                  onClick={() => setShowAcceptDialog(true)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accepter
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accepter la réservation</DialogTitle>
            <DialogDescription>
              Tu peux ajuster la durée de la réservation si tu le souhaites.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Durée de la réservation</Label>
              <Select
                value={selectedDuration}
                onValueChange={setSelectedDuration}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                      {option.value ===
                        reservation.requested_duration_days.toString() &&
                        " (demandé)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-accent">Important :</strong> Pendant la
                réservation, ton annonce sera masquée et seul ce findr pourra
                interagir avec toi.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAcceptDialog(false)}
            >
              Annuler
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90"
              onClick={handleAccept}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la réservation</DialogTitle>
            <DialogDescription>
              Es-tu sûr de vouloir refuser cette demande de réservation ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Refuser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReservationCard;
