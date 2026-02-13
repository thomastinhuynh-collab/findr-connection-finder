import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Euro, 
  Calendar,
  MessageCircle, 
  Gift,
  Star,
  Shield,
  Crown,
  Loader2,
  CalendarClock,
  Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProposalList from "@/components/ProposalList";
import ReservationCard from "@/components/ReservationCard";
import ReservationBadge from "@/components/ReservationBadge";

interface SearchWithProfile {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string | null;
  image_url: string | null;
  status: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    is_premium: boolean | null;
    xp_points: number | null;
    level: number | null;
  } | null;
}

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

interface UserProfile {
  is_premium: boolean | null;
  xp_points: number | null;
}

interface Reservation {
  id: string;
  search_id: string;
  findr_id: string;
  buyr_id: string;
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

const urgencyLabels: Record<string, string> = {
  "3-days": "3 jours",
  "1-week": "1 semaine",
  "2-weeks": "2 semaines",
  "1-month": "1 mois",
  "no-rush": "Pas pressé",
  "normal": "Normal",
};

const SearchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState<SearchWithProfile | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance] = useState(155.50); // Mock balance

  useEffect(() => {
    if (id) {
      fetchSearch();
      fetchProposals();
      fetchReservations();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchSearch = async () => {
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching search:", error);
      setLoading(false);
      return;
    }

    // Fetch profile separately
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, is_premium, xp_points, level")
      .eq("user_id", data.user_id)
      .single();

    setSearch({
      ...data,
      profiles: profile
    } as any);
    setLoading(false);
  };

  const fetchProposals = async () => {
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("search_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching proposals:", error);
      return;
    }

    // Fetch findr profiles for each proposal
    const proposalsWithProfiles = await Promise.all(
      (data || []).map(async (proposal) => {
        const { data: findrProfile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, is_premium")
          .eq("user_id", proposal.findr_id)
          .maybeSingle();

        return {
          ...proposal,
          findr_profile: findrProfile
        };
      })
    );

    setProposals(proposalsWithProfiles as Proposal[]);
  };

  const fetchReservations = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("search_id", id)
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reservations:", error);
      return;
    }

    // Fetch findr profiles
    const reservationsWithProfiles = await Promise.all(
      (data || []).map(async (reservation) => {
        const { data: findrProfile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("user_id", reservation.findr_id)
          .maybeSingle();

        return {
          ...reservation,
          findr_profile: findrProfile
        };
      })
    );

    setReservations(reservationsWithProfiles as Reservation[]);
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("is_premium, xp_points")
      .eq("user_id", user.id)
      .maybeSingle();

    setUserProfile(data);
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (min && max) return `${min} - ${max}€`;
    if (max) return `Jusqu'à ${max}€`;
    if (min) return `À partir de ${min}€`;
    return "Non défini";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Il y a moins d'1h";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString("fr-FR");
  };

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Tu dois être connecté pour contacter l'annonceur.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/messagerie/${id}`);
  };

  const handleProposal = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Tu dois être connecté pour faire une proposition.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/proposition/${id}`);
  };

  const handleReservation = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Tu dois être connecté pour demander une réservation.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/reservation/${id}`);
  };

  // Check if user can interact (for reserved searches)
  const activeReservation = reservations.find(r => r.status === "approved");
  const isReserved = search?.status === "reserved" && activeReservation;
  const canInteract = !isReserved || activeReservation?.findr_id === user?.id;
  const hasExistingReservation = reservations.some(
    r => r.findr_id === user?.id && (r.status === "pending" || r.status === "approved")
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!search) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-serif font-bold text-primary mb-4">
              Annonce non trouvée
            </h1>
            <Button onClick={() => navigate("/recherches")}>
              Retour aux recherches
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isOwner = user?.id === search.user_id;
  const pendingProposals = proposals.filter(p => p.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden mb-6 bg-secondary">
                {search.image_url ? (
                  <img
                    src={search.image_url}
                    alt={search.title}
                    className="w-full h-[400px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center">
                    <span className="text-8xl">🔍</span>
                  </div>
                )}
                {search.urgency === "3-days" && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm px-3 py-1">
                    Urgent
                  </Badge>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  {isReserved && (
                    <ReservationBadge expiresAt={activeReservation?.expires_at || null} />
                  )}
                  <Badge 
                    variant="secondary" 
                    className="bg-background/90 backdrop-blur-sm text-sm px-3 py-1"
                  >
                    {search.category}
                  </Badge>
                </div>
              </div>

              {/* Title & Meta */}
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-primary mb-4">
                {search.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <Euro className="w-4 h-4 text-accent" />
                  {formatBudget(search.budget_min, search.budget_max)}
                </span>
                <span className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 text-accent" />
                  {urgencyLabels[search.urgency || "normal"] || search.urgency}
                </span>
                <span className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4 text-accent" />
                  {formatDate(search.created_at)}
                </span>
              </div>

              {/* Description */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-primary mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {search.description || "Aucune description fournie."}
                </p>
              </div>

              {/* Proposals - only show here for non-owners */}
              {!isOwner && (
                <Collapsible defaultOpen={proposals.length > 0} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-secondary/30 transition-colors">
                    <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-accent" />
                      Propositions
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-accent font-medium">
                        {proposals.length} proposition{proposals.length !== 1 ? "s" : ""}
                      </span>
                      <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6">
                      <ProposalList
                        proposals={proposals}
                        isOwner={isOwner}
                        searchId={id || ""}
                        searchOwnerId={search.user_id}
                        walletBalance={walletBalance}
                        isPremium={userProfile?.is_premium || false}
                        onProposalUpdate={() => {
                          fetchProposals();
                        }}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              {/* User Card */}
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Publié par</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profil/${search.user_id}`);
                  }}
                  className="flex items-center gap-4 mb-4 w-full text-left hover:opacity-80 transition-opacity"
                >
                  {search.profiles?.avatar_url ? (
                    <img
                      src={search.profiles.avatar_url}
                      alt={search.profiles.full_name || "User"}
                      className="w-14 h-14 rounded-full border-2 border-accent object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      {search.profiles?.full_name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-primary hover:text-accent transition-colors">
                        {search.profiles?.full_name || "Utilisateur"}
                      </p>
                      {search.profiles?.is_premium && (
                        <Crown className="w-4 h-4 text-accent" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span>Niveau {search.profiles?.level || 1}</span>
                      <span>•</span>
                      <span>{search.profiles?.xp_points || 0} XP</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Reservation Status for reserved searches */}
              {isReserved && !isOwner && (
                <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Lock className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-accent">Annonce réservée</h3>
                  </div>
                  {canInteract ? (
                    <p className="text-sm text-muted-foreground">
                      Tu as réservé cette annonce. Tu es le seul à pouvoir interagir avec le buyr.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Cette annonce est actuellement réservée par un autre findr.
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {!isOwner && canInteract && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={handleContact}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Envoyer un message
                  </Button>
                  
                  <Button 
                    size="lg" 
                    className="w-full gap-2"
                    onClick={handleProposal}
                  >
                    <Gift className="w-5 h-5" />
                    Faire une proposition
                  </Button>

                  {/* Reservation Button */}
                  {!hasExistingReservation && !isReserved && (
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                      onClick={handleReservation}
                    >
                      <CalendarClock className="w-5 h-5" />
                      Demander une réservation
                    </Button>
                  )}

                  {hasExistingReservation && !isReserved && (
                    <div className="bg-secondary/50 rounded-xl p-3 text-center">
                      <p className="text-sm text-muted-foreground">
                        <CalendarClock className="w-4 h-4 inline mr-1" />
                        Tu as déjà une demande de réservation en cours
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Proposez votre trouvaille avec photos et prix
                  </p>
                </div>
              )}

              {/* Owner View */}
              {isOwner && (
                <div className="space-y-6">
                  {/* Reservations Collapsible */}
                  {(reservations.filter(r => r.status === "pending").length > 0 || activeReservation) && (
                    <Collapsible defaultOpen className="bg-card border border-border rounded-2xl overflow-hidden">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-secondary/30 transition-colors">
                        <h3 className="font-semibold text-primary flex items-center gap-2">
                          <CalendarClock className="w-5 h-5 text-accent" />
                          Demandes de réservation
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-accent font-medium">
                            {reservations.filter(r => r.status === "pending" || r.status === "approved").length} réservation{reservations.filter(r => r.status === "pending" || r.status === "approved").length !== 1 ? "s" : ""}
                          </span>
                          <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-6 pb-6 space-y-4">
                          {reservations
                            .filter(r => r.status === "pending")
                            .map(reservation => (
                              <ReservationCard
                                key={reservation.id}
                                reservation={reservation}
                                isOwner={true}
                                searchTitle={search.title}
                                onUpdate={() => {
                                  fetchReservations();
                                  fetchSearch();
                                }}
                              />
                            ))}
                          {activeReservation && (
                            <>
                              <h4 className="font-medium text-primary flex items-center gap-2 pt-2">
                                <Lock className="w-4 h-4 text-accent" />
                                Réservation active
                              </h4>
                              <ReservationCard
                                reservation={activeReservation}
                                isOwner={true}
                                searchTitle={search.title}
                                onUpdate={() => {
                                  fetchReservations();
                                  fetchSearch();
                                }}
                              />
                            </>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Proposals Collapsible for Owner */}
                  <Collapsible defaultOpen={proposals.length > 0} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-secondary/30 transition-colors">
                      <h3 className="font-semibold text-primary flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-accent" />
                        Propositions
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-accent font-medium">
                          {proposals.length} proposition{proposals.length !== 1 ? "s" : ""}
                        </span>
                        {pendingProposals > 0 && (
                          <Badge className="bg-accent text-accent-foreground">
                            {pendingProposals} nouvelle{pendingProposals !== 1 ? "s" : ""}
                          </Badge>
                        )}
                        <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-6 pb-6">
                        <ProposalList
                          proposals={proposals}
                          isOwner={isOwner}
                          searchId={id || ""}
                          searchOwnerId={search.user_id}
                          walletBalance={walletBalance}
                          isPremium={userProfile?.is_premium || false}
                          onProposalUpdate={() => {
                            fetchProposals();
                          }}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}

              {/* Trust badges */}
              <div className="mt-6 p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="w-5 h-5 text-accent" />
                  <span>Paiement sécurisé via findr</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchDetail;