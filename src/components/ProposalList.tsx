import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  ExternalLink, 
  Wallet, 
  Shield, 
  Loader2, 
  Euro,
  Package,
  Clock,
  Crown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Proposal {
  id: string;
  title: string;
  description: string | null;
  proposed_price: number;
  image_urls: string[];
  product_link: string | null;
  status: string;
  created_at: string;
  findr_id: string;
  findr_profile?: {
    full_name: string | null;
    avatar_url: string | null;
    is_premium: boolean | null;
  };
}

interface ProposalListProps {
  proposals: Proposal[];
  isOwner: boolean;
  searchId: string;
  walletBalance: number;
  isPremium: boolean;
  onProposalUpdate: () => void;
}

const ProposalList = ({ 
  proposals, 
  isOwner, 
  searchId, 
  walletBalance, 
  isPremium,
  onProposalUpdate 
}: ProposalListProps) => {
  const navigate = useNavigate();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmReceiptDialog, setConfirmReceiptDialog] = useState(false);

  const platformFee = isPremium ? 0 : 0.05;
  const authFee = 0.03;

  const calculateTotal = (price: number) => {
    return price * (1 + platformFee + authFee);
  };

  const handleAccept = async (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setPaymentDialogOpen(true);
  };

  const handleReject = async (proposalId: string) => {
    try {
      const { error } = await supabase
        .from("proposals")
        .update({ status: "rejected" })
        .eq("id", proposalId);

      if (error) throw error;

      toast({
        title: "Proposition refusée",
        description: "La proposition a été refusée.",
      });
      
      onProposalUpdate();
    } catch (error) {
      console.error("Error rejecting proposal:", error);
      toast({
        title: "Erreur",
        description: "Impossible de refuser la proposition.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    if (!selectedProposal) return;

    const totalAmount = calculateTotal(selectedProposal.proposed_price);

    if (walletBalance < totalAmount) {
      toast({
        title: "Solde insuffisant",
        description: "Veuillez recharger votre portefeuille pour effectuer ce paiement.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Update proposal status to accepted with payment pending
      const { error } = await supabase
        .from("proposals")
        .update({ status: "accepted_pending" })
        .eq("id", selectedProposal.id);

      if (error) throw error;

      toast({
        title: "Paiement en attente ! 💰",
        description: "Le paiement sera libéré une fois l'article reçu et vérifié.",
      });

      setPaymentDialogOpen(false);
      onProposalUpdate();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter le paiement.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!selectedProposal) return;

    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from("proposals")
        .update({ status: "completed" })
        .eq("id", selectedProposal.id);

      if (error) throw error;

      toast({
        title: "Transaction finalisée ! 🎉",
        description: "Le paiement a été libéré au Findr. Merci pour votre confiance !",
      });

      setConfirmReceiptDialog(false);
      onProposalUpdate();
    } catch (error) {
      console.error("Error confirming receipt:", error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la réception.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
      case "accepted_pending":
        return <Badge className="bg-warning text-warning-foreground">Paiement en attente</Badge>;
      case "completed":
        return <Badge className="bg-success text-success-foreground">Finalisé</Badge>;
      case "rejected":
        return <Badge variant="destructive">Refusé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (proposals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Aucune proposition pour le moment.</p>
        {!isOwner && <p className="text-sm mt-1">Soyez le premier à proposer une trouvaille !</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {proposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Images */}
                  {proposal.image_urls && proposal.image_urls.length > 0 ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={proposal.image_urls[0]}
                        alt={proposal.title}
                        className="w-full h-full object-cover"
                      />
                      {proposal.image_urls.length > 1 && (
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                          +{proposal.image_urls.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-primary truncate">{proposal.title}</h4>
                        <button
                          onClick={() => navigate(`/profil/${proposal.findr_id}`)}
                          className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1"
                        >
                          {proposal.findr_profile?.full_name || "Findr"}
                          {proposal.findr_profile?.is_premium && (
                            <Crown className="w-3 h-3 text-accent" />
                          )}
                        </button>
                      </div>
                      {getStatusBadge(proposal.status)}
                    </div>

                    {proposal.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {proposal.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-accent">
                          {proposal.proposed_price.toFixed(2)} €
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(proposal.created_at)}
                        </span>
                      </div>

                      {/* Actions for owner */}
                      {isOwner && proposal.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleReject(proposal.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-success hover:bg-success/90 text-success-foreground"
                            onClick={() => handleAccept(proposal)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Accepter
                          </Button>
                        </div>
                      )}

                      {/* Confirm receipt for accepted_pending */}
                      {isOwner && proposal.status === "accepted_pending" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedProposal(proposal);
                            setConfirmReceiptDialog(true);
                          }}
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Confirmer réception
                        </Button>
                      )}

                      {/* Link for external product */}
                      {proposal.product_link && (
                        <a
                          href={proposal.product_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Voir l'annonce
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" />
              Confirmer le paiement
            </DialogTitle>
            <DialogDescription>
              Payez avec votre portefeuille Findr. Le paiement sera en attente jusqu'à réception de l'article.
            </DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-4 py-4">
              {/* Proposal Summary */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex gap-3">
                  {selectedProposal.image_urls?.[0] && (
                    <img
                      src={selectedProposal.image_urls[0]}
                      alt={selectedProposal.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">{selectedProposal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      par {selectedProposal.findr_profile?.full_name || "Findr"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prix de l'article</span>
                  <span>{selectedProposal.proposed_price.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Commission plateforme ({isPremium ? "0%" : "5%"})
                  </span>
                  <span className={isPremium ? "text-success" : ""}>
                    {isPremium ? "Gratuit" : `+${(selectedProposal.proposed_price * 0.05).toFixed(2)} €`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frais d'authentification (3%)</span>
                  <span>+{(selectedProposal.proposed_price * 0.03).toFixed(2)} €</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-accent">
                    {calculateTotal(selectedProposal.proposed_price).toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="flex items-center justify-between bg-primary/5 rounded-lg p-3">
                <span className="text-sm">Solde portefeuille</span>
                <span className={`font-bold ${walletBalance >= calculateTotal(selectedProposal.proposed_price) ? "text-success" : "text-destructive"}`}>
                  {walletBalance.toFixed(2)} €
                </span>
              </div>

              {walletBalance < calculateTotal(selectedProposal.proposed_price) && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  Solde insuffisant. Veuillez recharger votre portefeuille dans "Mon Espace".
                </div>
              )}

              {/* Security Info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 text-success" />
                <span>Le paiement sera sécurisé jusqu'à confirmation de réception</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing || (selectedProposal && walletBalance < calculateTotal(selectedProposal.proposed_price))}
              className="bg-accent hover:bg-accent/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Euro className="w-4 h-4 mr-2" />
                  Payer {selectedProposal && calculateTotal(selectedProposal.proposed_price).toFixed(2)} €
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Receipt Dialog */}
      <Dialog open={confirmReceiptDialog} onOpenChange={setConfirmReceiptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-success" />
              Confirmer la réception
            </DialogTitle>
            <DialogDescription>
              Confirmez que vous avez bien reçu l'article et qu'il correspond à la description.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    Attention : Action irréversible
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Une fois confirmé, le paiement sera libéré au Findr. Assurez-vous que l'article correspond bien à vos attentes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>L'article correspond à la description</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>L'article est en bon état</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-success" />
              <span>L'authenticité a été vérifiée</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReceiptDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirmReceipt}
              disabled={isProcessing}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmer et libérer le paiement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalList;