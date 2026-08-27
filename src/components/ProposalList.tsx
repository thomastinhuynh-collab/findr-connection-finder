import { useState, useEffect, useCallback } from "react";
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  CheckCircle2, 
  XCircle, 
  MessageCircle, 
  ExternalLink, 
  CreditCard,
  Shield, 
  Loader2, 
  Euro,
  Package,
  Clock,
  Crown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  Truck,
  AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

interface ReservationPayment {
  id: string;
  proposal_id: string | null;
  payment_status: string | null;
  object_price: number | null;
  buyr_fee: number | null;
  total_buyr_amount: number | null;
  findr_payout_amount: number | null;
  tracking_number?: string | null;
  carrier?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  tracking_status?: string | null;
  accepted_at?: string | null;
  created_at?: string | null;
}

interface ProposalListProps {
  proposals: Proposal[];
  isOwner: boolean;
  searchId: string;
  searchOwnerId: string;
  isPremium: boolean;
  onProposalUpdate: () => void;
}

const FEE_RATE = 0.04;
const round2 = (n: number) => Math.round(n * 100) / 100;

const ProposalList = ({ 
  proposals, 
  isOwner, 
  searchId,
  searchOwnerId,
  isPremium,
  onProposalUpdate 
}: ProposalListProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmReceiptDialog, setConfirmReceiptDialog] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [payments, setPayments] = useState<Record<string, ReservationPayment>>({});
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  // Check if current user is the findr of the selected proposal
  const isCurrentUserFindr = selectedProposal && user?.id === selectedProposal.findr_id;

  const getFees = (price: number) => {
    const objectPrice = round2(price);
    const buyrFee = round2(objectPrice * FEE_RATE);
    const findrFee = round2(objectPrice * FEE_RATE);
    return {
      objectPrice,
      buyrFee,
      findrFee,
      total: round2(objectPrice + buyrFee),
      payout: round2(objectPrice - findrFee),
    };
  };

  const fetchPayments = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("reservations")
      .select("id, proposal_id, payment_status, object_price, buyr_fee, total_buyr_amount, findr_payout_amount, tracking_number, carrier, shipped_at, delivered_at, tracking_status, accepted_at, created_at")
      .eq("search_id", searchId);
    const map: Record<string, ReservationPayment> = {};
    (data || []).forEach((r: any) => {
      if (r.proposal_id) map[r.proposal_id] = r as ReservationPayment;
    });
    setPayments(map);
  }, [searchId, user]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleAccept = async (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setPaymentDialogOpen(true);
  };


  const DAY = 24 * 60 * 60 * 1000;

  // Le buyr peut demander l'annulation : 5 jours sans expédition,
  // ou 10 jours après une expédition jamais livrée.
  const canBuyrCancel = (p?: ReservationPayment) => {
    if (!p || p.payment_status !== "paye_en_attente_reception") return false;
    if (p.shipped_at) return Date.now() - new Date(p.shipped_at).getTime() >= 10 * DAY;
    const since = new Date(p.accepted_at ?? p.created_at ?? Date.now()).getTime();
    return Date.now() - since >= 5 * DAY;
  };

  const handleMarkShipped = async () => {
    const reservation = selectedProposal ? payments[selectedProposal.id] : null;
    if (!reservation) return;
    if (trackingNumber.trim().length < 4 || carrier.trim().length < 2) {
      toast({
        title: "Informations manquantes",
        description: "Le transporteur et le numéro de suivi sont obligatoires.",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("mark-shipped", {
        body: {
          reservationId: reservation.id,
          trackingNumber: trackingNumber.trim(),
          carrier: carrier.trim(),
        },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error ?? error?.message);
      toast({ title: "Colis expédié 📦", description: "Le buyr a été notifié, le suivi est actif." });
      setShipDialogOpen(false);
      setTrackingNumber("");
      setCarrier("");
      fetchPayments();
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Impossible d'enregistrer l'expédition.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRefund = async () => {
    const reservation = selectedProposal ? payments[selectedProposal.id] : null;
    if (!reservation) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-reservation-refund", {
        body: { reservationId: reservation.id },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error ?? error?.message);
      toast({ title: "Annulation confirmée", description: "Le remboursement intégral est en cours." });
      setCancelDialogOpen(false);
      fetchPayments();
      onProposalUpdate();
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Annulation impossible.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (proposal: Proposal) => {
    try {
      const { error } = await supabase
        .from("proposals")
        .update({ status: "rejected" })
        .eq("id", proposal.id);

      if (error) throw error;

      // Notify the Findr that their proposal was rejected
      await supabase
        .from("notifications")
        .insert({
          user_id: proposal.findr_id,
          type: "proposal_rejected",
          title: "Proposition refusée",
          message: `Votre proposition pour "${proposal.title}" a été refusée.`,
          link: "/mes-propositions"
        });

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
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment-checkout", {
        body: { proposalId: selectedProposal.id, origin: window.location.origin },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("Lien de paiement indisponible");
      window.location.href = data.url as string;
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Paiement impossible",
        description: error?.message || "Impossible de démarrer le paiement.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!selectedProposal) return;
    const reservation = payments[selectedProposal.id];
    if (!reservation) {
      toast({
        title: "Erreur",
        description: "Paiement introuvable pour cette proposition.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("release-funds-to-findr", {
        body: { reservationId: reservation.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Transaction finalisée ! 🎉",
        description: "Le paiement a été versé au findr. Merci pour ta confiance !",
      });

      setConfirmReceiptDialog(false);
      await fetchPayments();
      onProposalUpdate();
    } catch (error: any) {
      console.error("Error confirming receipt:", error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de confirmer la réception.",
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
            <Card 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedProposal(proposal);
                setDetailDialogOpen(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Images */}
                  {proposal.image_urls && proposal.image_urls.length > 0 ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 group">
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
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <Package className="w-7 h-7 text-muted-foreground" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="font-semibold text-primary text-sm leading-tight line-clamp-2">{proposal.title}</h4>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/profil/${proposal.findr_id}`); }}
                      className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1 mb-1"
                    >
                      {proposal.findr_profile?.full_name || "findr"}
                      {proposal.findr_profile?.is_premium && (
                        <Crown className="w-3 h-3 text-accent" />
                      )}
                    </button>

                    {proposal.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                        {proposal.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-accent">
                        {proposal.proposed_price.toFixed(2)} €
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(proposal.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons - full width below */}
                <div className="mt-3 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {isOwner && proposal.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleReject(proposal)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Refuser
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90 text-success-foreground"
                        onClick={() => handleAccept(proposal)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Accepter
                      </Button>
                    </>
                  )}

                  {["paye_en_attente_reception", "livre"].includes(
                    payments[proposal.id]?.payment_status ?? "",
                  ) && (
                    <div className="w-full flex flex-wrap items-center gap-2 bg-success/10 border border-success/30 rounded-lg p-2 text-xs text-foreground">
                      🛡️ Paiement sécurisé — en attente de confirmation de réception.
                      {payments[proposal.id]?.tracking_status && (
                        <span className="font-medium text-primary">
                          · {payments[proposal.id]?.tracking_status}
                          {payments[proposal.id]?.tracking_number
                            ? ` (${payments[proposal.id]?.carrier} — ${payments[proposal.id]?.tracking_number})`
                            : ""}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Findr : marquer comme expédié */}
                  {user?.id === proposal.findr_id &&
                    payments[proposal.id]?.payment_status === "paye_en_attente_reception" &&
                    !payments[proposal.id]?.shipped_at && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedProposal(proposal);
                            setShipDialogOpen(true);
                          }}
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          Marquer comme expédié
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => {
                            setSelectedProposal(proposal);
                            setCancelDialogOpen(true);
                          }}
                        >
                          Je ne peux plus fournir l'objet
                        </Button>
                      </>
                    )}

                  {isOwner &&
                    ["paye_en_attente_reception", "livre"].includes(
                      payments[proposal.id]?.payment_status ?? "",
                    ) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedProposal(proposal);
                          setConfirmReceiptDialog(true);
                        }}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Confirmer la réception de l'objet
                      </Button>
                    )}

                  {isOwner && canBuyrCancel(payments[proposal.id]) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => {
                        setSelectedProposal(proposal);
                        setCancelDialogOpen(true);
                      }}
                    >
                      Le findr n'a pas donné de nouvelles ? Demander l'annulation et le remboursement
                    </Button>
                  )}


                  {proposal.product_link && (
                    <a
                      href={proposal.product_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Voir l'annonce
                    </a>
                  )}

                  {/* Edit button for findr */}
                  {user?.id === proposal.findr_id && proposal.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/modifier-proposition/${proposal.id}`)}
                    >
                      Modifier
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <Shield className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="break-words">Confirmer le paiement</span>
            </DialogTitle>
            <DialogDescription>
              Le paiement sera bloqué jusqu'à confirmation de réception de l'article.
            </DialogDescription>
          </DialogHeader>

          {selectedProposal && (() => {
            const fees = getFees(selectedProposal.proposed_price);
            return (
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
                    <div className="min-w-0">
                      <p className="font-medium break-words">{selectedProposal.title}</p>
                      <p className="text-sm text-muted-foreground break-words">
                        par {selectedProposal.findr_profile?.full_name || "findr"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm gap-4">
                    <span className="text-muted-foreground break-words">Prix de l'article</span>
                    <span className="text-right flex-shrink-0">{fees.objectPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm gap-4">
                    <span className="text-muted-foreground break-words">Frais de service (4%)</span>
                    <span className="text-right flex-shrink-0">+{fees.buyrFee.toFixed(2)} €</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold gap-4">
                    <span className="break-words">Total</span>
                    <span className="text-accent text-right flex-shrink-0">{fees.total.toFixed(2)} €</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-success" />
                  <span>Le paiement sera bloqué jusqu'à confirmation de réception de l'article.</span>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-accent hover:bg-accent/90 whitespace-normal"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="break-words">Payer {selectedProposal && getFees(selectedProposal.proposed_price).total.toFixed(2)} € par carte bancaire</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Proposal Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <Package className="w-5 h-5 text-accent flex-shrink-0" />
              <span className="break-words">Détail de la proposition</span>
            </DialogTitle>
          </DialogHeader>

          {selectedProposal && (
            <div className="space-y-6 py-4">
              {/* Image Carousel */}
              {selectedProposal.image_urls && selectedProposal.image_urls.length > 0 ? (
                <div className="relative">
                  {selectedProposal.image_urls.length === 1 ? (
                    <div className="aspect-video rounded-xl overflow-hidden">
                      <img
                        src={selectedProposal.image_urls[0]}
                        alt={selectedProposal.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <Carousel className="w-full">
                      <CarouselContent>
                        {selectedProposal.image_urls.map((url, index) => (
                          <CarouselItem key={index}>
                            <div className="aspect-video rounded-xl overflow-hidden">
                              <img
                                src={url}
                                alt={`${selectedProposal.title} - Image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </Carousel>
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {selectedProposal.image_urls.length} photo{selectedProposal.image_urls.length > 1 ? 's' : ''}
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-secondary flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-2" />
                    <p>Aucune photo fournie</p>
                  </div>
                </div>
              )}

              {/* Title and Price */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-primary">{selectedProposal.title}</h3>
                  <button
                    onClick={() => {
                      setDetailDialogOpen(false);
                      navigate(`/profil/${selectedProposal.findr_id}`);
                    }}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-1 mt-1"
                  >
                    par {selectedProposal.findr_profile?.full_name || "findr"}
                    {selectedProposal.findr_profile?.is_premium && (
                      <Crown className="w-3 h-3 text-accent" />
                    )}
                  </button>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-accent">
                    {selectedProposal.proposed_price.toFixed(2)} €
                  </span>
                  {getStatusBadge(selectedProposal.status)}
                </div>
              </div>

              {/* Description */}
              {selectedProposal.description && (
                <div className="bg-secondary/50 rounded-xl p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message du findr
                  </h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedProposal.description}
                  </p>
                </div>
              )}

              {/* Product Link */}
              {selectedProposal.product_link && (
                <a
                  href={selectedProposal.product_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-accent hover:underline bg-accent/10 rounded-lg p-3"
                >
                  <ExternalLink className="w-4 h-4" />
                  Voir l'annonce originale
                </a>
              )}

              {/* Price Breakdown Preview */}
              {isOwner && selectedProposal.status === "pending" && (() => {
                const fees = getFees(selectedProposal.proposed_price);
                return (
                  <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium mb-2">Récapitulatif du prix</h4>
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-muted-foreground break-words">Prix de l'article</span>
                      <span className="text-right flex-shrink-0">{fees.objectPrice.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm gap-4">
                      <span className="text-muted-foreground break-words">Frais de service (4%)</span>
                      <span className="text-right flex-shrink-0">+{fees.buyrFee.toFixed(2)} €</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-semibold gap-4">
                      <span className="break-words">Total à payer</span>
                      <span className="text-accent text-right flex-shrink-0">{fees.total.toFixed(2)} €</span>
                    </div>
                  </div>
                );
              })()}


              {/* Date */}
              <div className="text-sm text-muted-foreground">
                Proposition reçue le {formatDate(selectedProposal.created_at)}
              </div>
            </div>
          )}

          <DialogFooter className="!flex-col !items-stretch gap-2 pt-2 border-t border-border/60">
            {/* Primary action first, full width */}
            {isOwner && selectedProposal?.status === "pending" && (
              <Button
                size="lg"
                className="w-full bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => {
                  setDetailDialogOpen(false);
                  handleAccept(selectedProposal);
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
                Accepter cette proposition
              </Button>
            )}

            {isOwner &&
              selectedProposal &&
              payments[selectedProposal.id]?.payment_status === "paye_en_attente_reception" && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    setConfirmReceiptDialog(true);
                  }}
                >
                  <Package className="w-4 h-4 mr-2 flex-shrink-0" />
                  Confirmer la réception de l'objet
                </Button>
              )}

            {/* Findr can edit their own pending proposal */}
            {!isOwner && isCurrentUserFindr && selectedProposal?.status === "pending" && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  setDetailDialogOpen(false);
                  navigate(`/modifier-proposition/${selectedProposal.id}`);
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                Modifier ma proposition
              </Button>
            )}

            {/* Secondary actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {selectedProposal && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    navigate(`/messagerie/${searchId}?with=${isOwner ? selectedProposal.findr_id : searchOwnerId ?? ""}`);
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {isOwner ? "Contacter le findr" : "Contacter le buyr"}
                </Button>
              )}

              {isOwner && selectedProposal?.status === "pending" && (
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    handleReject(selectedProposal);
                    setDetailDialogOpen(false);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  Refuser
                </Button>
              )}
            </div>

            {/* Dismiss last, discreet */}
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setDetailDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* Confirm Receipt Dialog */}
      <Dialog open={confirmReceiptDialog} onOpenChange={setConfirmReceiptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <Package className="w-5 h-5 text-success flex-shrink-0" />
              <span className="break-words">Confirmer la réception</span>
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
                    Une fois confirmé, le paiement sera libéré au findr. Assurez-vous que l'article correspond bien à vos attentes.
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

      {/* Dialogue expédition (findr) */}
      <Dialog open={shipDialogOpen} onOpenChange={setShipDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme expédié</DialogTitle>
            <DialogDescription>
              Le numéro de suivi est obligatoire : il permet de suivre le colis automatiquement et
              de libérer ton paiement dès la livraison.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="carrier">Transporteur</Label>
              <Input
                id="carrier"
                placeholder="Colissimo, Chronopost, Mondial Relay, UPS…"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking">Numéro de suivi</Label>
              <Input
                id="tracking"
                placeholder="Ex. 6A12345678901"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShipDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleMarkShipped} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Confirmer l'expédition
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue annulation & remboursement */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler et rembourser</DialogTitle>
            <DialogDescription>
              La transaction sera annulée et le buyr intégralement remboursé, frais de service
              inclus.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Cette action est définitive. Le remboursement apparaît sur le moyen de paiement
              d'origine sous quelques jours.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Retour
            </Button>
            <Button variant="destructive" onClick={handleCancelRefund} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Confirmer l'annulation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalList;