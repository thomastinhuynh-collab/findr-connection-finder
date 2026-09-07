import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Euro, 
  Calendar,
  MessageCircle, 
  Tag,
  Star,
  Shield,
  Crown,
  Loader2,
  CalendarClock,
  Lock,
  HelpCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProposalList from "@/components/ProposalList";
import ReservationCard from "@/components/ReservationCard";
import ReservationBadge from "@/components/ReservationBadge";
import FavoriteButton from "@/components/FavoriteButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useStripeConnect } from "@/hooks/useStripeConnect";

interface SearchWithProfile {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string | null;
  deadline: string | null;
  image_url: string | null;
  image_urls: string[] | null;
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

const getDeadlineBadge = (deadline: string | null) => {
  if (!deadline) return null;
  const diffMs = new Date(deadline).getTime() - Date.now();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const dateLabel = new Date(deadline).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  if (diffMs <= 0) {
    return { label: `Délai dépassé (éch. ${dateLabel})`, bg: "#E8E4DC", color: "#6B6355", border: "#D4CCBC" };
  }
  const unit = days <= 1 ? "jour" : "jours";
  const value = days < 1 ? 1 : days;
  const label = `Il reste ${value} ${unit} (éch. ${dateLabel})`;
  if (days < 3) return { label, bg: "rgba(239,83,80,0.12)", color: "#B03A2E", border: "#EF5350" };
  if (days <= 7) return { label, bg: "rgba(240,173,78,0.14)", color: "#8A5A12", border: "#E0A73C" };
  return { label, bg: "#F5F0E8", color: "#1B2A4A", border: "#C9A84C" };
};


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
  stripe_onboarding_complete?: boolean | null;
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

const SearchDetailCarousel = ({ search, activeReservation, isReserved }: {
  search: SearchWithProfile;
  activeReservation: Reservation | undefined;
  isReserved: boolean;
}) => {
  const allImages = useMemo(() => {
    const imgs: string[] = [];
    if (search.image_urls?.length) imgs.push(...search.image_urls);
    else if (search.image_url) imgs.push(search.image_url);
    return imgs;
  }, [search.image_url, search.image_urls]);

  const [current, setCurrent] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="relative rounded-xl overflow-hidden mb-6 bg-secondary">
        <div className="w-full h-[260px] md:h-[420px] flex items-center justify-center">
          <span className="text-8xl">🔍</span>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          {isReserved && <ReservationBadge expiresAt={activeReservation?.expires_at || null} />}
          <span style={{ backgroundColor: 'rgba(27,42,74,0.92)', color: '#C9A84C', fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', borderRadius: '20px', padding: '6px 14px' }}>{search.category}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Main image */}
      <div className="relative rounded-xl overflow-hidden bg-secondary">
        <img
          src={allImages[current]}
          alt={search.title}
          className="w-full h-[260px] md:h-[420px] object-cover transition-opacity duration-200"
          key={current}
        />

        {/* Counter */}
        {allImages.length > 1 && (
          <span className="absolute bottom-3 right-3 text-white text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.5)", fontSize: "12px" }}>
            {current + 1} / {allImages.length}
          </span>
        )}

        {/* Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => setCurrent(current - 1)}
              disabled={current === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-none transition-colors"
              style={{
                background: current === 0 ? "rgba(27,42,74,0.3)" : "rgba(27,42,74,0.7)",
                cursor: current === 0 ? "default" : "pointer",
                opacity: current === 0 ? 0.3 : 1,
              }}
              onMouseEnter={(e) => { if (current !== 0) e.currentTarget.style.background = "rgba(27,42,74,0.95)"; }}
              onMouseLeave={(e) => { if (current !== 0) e.currentTarget.style.background = "rgba(27,42,74,0.7)"; }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setCurrent(current + 1)}
              disabled={current === allImages.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-none transition-colors"
              style={{
                background: current === allImages.length - 1 ? "rgba(27,42,74,0.3)" : "rgba(27,42,74,0.7)",
                cursor: current === allImages.length - 1 ? "default" : "pointer",
                opacity: current === allImages.length - 1 ? 0.3 : 1,
              }}
              onMouseEnter={(e) => { if (current !== allImages.length - 1) e.currentTarget.style.background = "rgba(27,42,74,0.95)"; }}
              onMouseLeave={(e) => { if (current !== allImages.length - 1) e.currentTarget.style.background = "rgba(27,42,74,0.7)"; }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </>
        )}

        {/* Badges overlay */}
        {search.urgency === "3-days" && (
          <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm px-3 py-1">Urgent</Badge>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          {isReserved && <ReservationBadge expiresAt={activeReservation?.expires_at || null} />}
          <span style={{ backgroundColor: 'rgba(27,42,74,0.92)', color: '#C9A84C', fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', borderRadius: '20px', padding: '6px 14px' }}>{search.category}</span>
        </div>
      </div>

      {/* Dots */}
      {allImages.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {allImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="border-none p-0 transition-all"
              style={{
                width: i === current ? "24px" : "8px",
                height: "8px",
                borderRadius: i === current ? "4px" : "50%",
                background: i === current ? "#C9A84C" : "#D4CCBC",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-3">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="p-0 border-2 rounded-md overflow-hidden transition-all"
              style={{
                width: "64px",
                height: "64px",
                borderColor: i === current ? "#C9A84C" : "transparent",
                opacity: i === current ? 1 : 0.6,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { if (i !== current) e.currentTarget.style.opacity = "1"; }}
              onMouseLeave={(e) => { if (i !== current) e.currentTarget.style.opacity = "0.6"; }}
            >
              <img src={img} alt={`${search.title} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { startOnboarding, loading: stripeLoading } = useStripeConnect();
  const [search, setSearch] = useState<SearchWithProfile | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownerRating, setOwnerRating] = useState<{ avg: number; count: number } | null>(null);
  const [responseHours, setResponseHours] = useState<number | null>(null);
  const [gamificationEnabled, setGamificationEnabled] = useState(false);
  const [stripeGateOpen, setStripeGateOpen] = useState(false);
  const stripeReady = !!userProfile?.stripe_onboarding_complete;

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
    fetchOwnerMeta(data.user_id);
  };

  const fetchOwnerMeta = async (ownerId: string) => {
    const [{ data: settings }, { data: evals }, { data: msgs }] = await Promise.all([
      supabase.from("app_settings").select("gamification_enabled").maybeSingle(),
      supabase.from("evaluations").select("rating").eq("to_user_id", ownerId),
      supabase
        .from("messages")
        .select("search_id, sender_id, receiver_id, created_at")
        .or(`sender_id.eq.${ownerId},receiver_id.eq.${ownerId}`)
        .order("created_at", { ascending: true }),
    ]);

    setGamificationEnabled(!!settings?.gamification_enabled);

    if (evals && evals.length > 0) {
      const avg = evals.reduce((s, e) => s + (e.rating || 0), 0) / evals.length;
      setOwnerRating({ avg: Math.round(avg * 10) / 10, count: evals.length });
    } else {
      setOwnerRating({ avg: 0, count: 0 });
    }

    // Average first-response delay: per conversation thread, first inbound -> first reply
    if (msgs && msgs.length > 0) {
      const threads: Record<string, { inbound?: number; reply?: number }> = {};
      msgs.forEach((m: any) => {
        const other = m.sender_id === ownerId ? m.receiver_id : m.sender_id;
        const key = `${m.search_id}:${other}`;
        const t = new Date(m.created_at).getTime();
        const th = threads[key] || (threads[key] = {});
        if (m.receiver_id === ownerId) {
          if (th.inbound === undefined) th.inbound = t;
        } else if (th.inbound !== undefined && th.reply === undefined) {
          th.reply = t;
        }
      });
      const deltas = Object.values(threads)
        .filter((t) => t.inbound !== undefined && t.reply !== undefined)
        .map((t) => (t.reply! - t.inbound!) / (1000 * 60 * 60));
      if (deltas.length > 0) {
        const avgH = deltas.reduce((a, b) => a + b, 0) / deltas.length;
        setResponseHours(Math.max(1, Math.ceil(avgH)));
      }
    }
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
      .select("is_premium, xp_points, stripe_onboarding_complete")
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
    if (!stripeReady) {
      setStripeGateOpen(true);
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
  const deadlineBadge = getDeadlineBadge(search.deadline);

  const titleBlock = (
    <div className="flex items-start justify-between gap-4 mb-4">
      <h1 className="text-2xl md:text-4xl font-serif font-bold text-primary">
        {search.title}
      </h1>
      {!isOwner && (
        <FavoriteButton searchId={search.id} className="flex-shrink-0 border border-[#E8E0D4]" />
      )}
    </div>
  );

  const badgesBlock = (
    <div className="flex flex-wrap gap-2 mb-6">
      <span
        className="flex items-center gap-2 rounded-[20px] px-[14px] py-[6px]"
        style={{ backgroundColor: '#1B2A4A', color: '#FFFFFF', fontSize: '13px', fontWeight: 500 }}
      >
        <Euro className="w-4 h-4" style={{ color: '#C9A84C' }} />
        {formatBudget(search.budget_min, search.budget_max)}
      </span>
      {deadlineBadge && (
        <span
          className="flex items-center gap-2 rounded-[20px] px-[14px] py-[6px]"
          style={{ backgroundColor: deadlineBadge.bg, color: deadlineBadge.color, fontSize: '13px', fontWeight: 600, border: `1.5px solid ${deadlineBadge.border}` }}
        >
          <Clock className="w-4 h-4" />
          {deadlineBadge.label}
        </span>
      )}
      <span
        className="flex items-center gap-2 rounded-[20px] px-[14px] py-[6px]"
        style={{ backgroundColor: '#F5F0E8', color: '#1B2A4A', fontSize: '13px', fontWeight: 500, border: '1.5px solid #C9A84C' }}
      >
        <Calendar className="w-4 h-4" style={{ color: '#C9A84C' }} />
        {formatDate(search.created_at)}
      </span>
    </div>
  );

  const descriptionBlock = (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-primary mb-4">Description</h2>
      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {search.description?.trim() || "Aucune description fournie."}
      </p>
    </div>
  );

  const proposalsPanel = (
    <Collapsible defaultOpen={proposals.length > 0} className="bg-card border border-border rounded-2xl overflow-hidden">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-secondary/30 transition-colors text-left">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-accent" />
          Propositions
        </h2>
        <div className="flex items-center gap-2">
          {proposals.length === 0 ? (
            <span style={{ fontSize: '13px', color: '#C9A84C', fontStyle: 'italic' }}>
              Aucune proposition pour l'instant — sois le premier findr à en faire une
            </span>
          ) : (
            <>
              <span className="text-sm text-accent font-medium">
                {proposals.length} proposition{proposals.length !== 1 ? "s" : ""}
              </span>
              {isOwner && pendingProposals > 0 && (
                <Badge className="bg-accent text-accent-foreground">
                  {pendingProposals} nouvelle{pendingProposals !== 1 ? "s" : ""}
                </Badge>
              )}
              <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
            </>
          )}
        </div>
      </CollapsibleTrigger>
      {proposals.length > 0 && (
        <CollapsibleContent>
          <div className="px-6 pb-6">
            <ProposalList
              proposals={proposals}
              isOwner={isOwner}
              searchId={id || ""}
              searchOwnerId={search.user_id}
              isPremium={userProfile?.is_premium || false}
              onProposalUpdate={() => {
                fetchProposals();
              }}
            />
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );

  const userCard = (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h3
        className="mb-4 font-medium"
        style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8A8070' }}
      >
        Publié par
      </h3>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/profil/${search.user_id}`)}
          className="shrink-0 hover:opacity-80 transition-opacity"
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
        </button>
        <div>
          <div className="flex items-center gap-2">
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1B2A4A' }}>
              {search.profiles?.full_name || "Utilisateur"}
            </p>
            {search.profiles?.is_premium && (
              <span style={{ fontSize: '10px', color: '#C9A84C', backgroundColor: '#FDF6E8', borderRadius: '4px', padding: '2px 6px', fontWeight: 600 }}>
                Top vendeur
              </span>
            )}
          </div>

          {gamificationEnabled ? (
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span style={{ fontWeight: 500, color: '#1B2A4A' }}>Niveau {search.profiles?.level || 1}</span>
              <span style={{ color: '#8A8070' }}>•</span>
              <span style={{ color: '#8A8070' }}>{search.profiles?.xp_points || 0} XP</span>
            </div>
          ) : ownerRating && ownerRating.count > 0 ? (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    style={{
                      color: '#D9BB87',
                      fill: i <= Math.round(ownerRating.avg) ? '#D9BB87' : 'transparent',
                    }}
                  />
                ))}
              </span>
              <span style={{ fontWeight: 600, color: '#1B2A4A' }}>{ownerRating.avg.toFixed(1)}</span>
              <span style={{ color: '#8A8070' }}>({ownerRating.count} avis)</span>
            </div>
          ) : (
            <span style={{ fontSize: '13px', color: '#8A8070' }}>Pas encore d'avis</span>
          )}

          {responseHours !== null && (
            <p style={{ fontSize: '12px', color: '#6B6355', marginTop: '2px' }}>
              Répond généralement en moins de {responseHours}h
            </p>
          )}

          <button
            onClick={() => navigate(`/profil/${search.user_id}`)}
            className="mt-1 hover:underline block"
            style={{ fontSize: '12px', color: '#C9A84C' }}
          >
            Voir le profil complet →
          </button>
        </div>
      </div>
    </div>
  );

  const reservationStatusBlock = isReserved && !isOwner ? (
    <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Lock className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-accent">Annonce réservée</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {canInteract
          ? "Tu as réservé cette annonce. Tu es le seul à pouvoir interagir avec le buyr."
          : "Cette annonce est actuellement réservée par un autre findr."}
      </p>
    </div>
  ) : null;

  const actionsBlock = !isOwner && canInteract ? (
    <div className="bg-card border border-border rounded-2xl p-6">
      <Button
        className="w-full gap-2 rounded-lg"
        style={{ height: '52px', fontSize: '15px', fontWeight: 600, backgroundColor: '#1B2A4A', color: '#FFFFFF' }}
        onClick={handleProposal}
      >
        <Tag className="w-5 h-5" />
        Faire une proposition
      </Button>
      <p style={{ fontSize: '11px', color: '#8A8070', textAlign: 'center', marginTop: '4px' }}>
        Proposez votre trouvaille avec photo et prix
      </p>

      <Button
        variant="outline"
        className="w-full gap-2 rounded-lg mt-4"
        style={{ height: '44px', fontSize: '14px', fontWeight: 500, backgroundColor: 'transparent', border: '1.5px solid #C9A84C', color: '#1B2A4A' }}
        onClick={handleContact}
      >
        <MessageCircle className="w-5 h-5" />
        Envoyer un message
      </Button>

      {!hasExistingReservation && !isReserved && (
        <div className="flex items-center justify-center gap-1 mt-4">
          <button
            onClick={handleReservation}
            className="hover:underline"
            style={{ fontSize: '13px', color: '#C9A84C' }}
          >
            Demander une réservation
          </button>
          <span title="La réservation bloque l'objet le temps de finaliser l'échange">
            <HelpCircle className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
          </span>
        </div>
      )}

      {hasExistingReservation && !isReserved && (
        <div className="bg-secondary/50 rounded-xl p-3 text-center mt-4">
          <p className="text-sm text-muted-foreground">
            <CalendarClock className="w-4 h-4 inline mr-1" />
            Tu as déjà une demande de réservation en cours
          </p>
        </div>
      )}
    </div>
  ) : null;

  const ownerReservationsBlock = isOwner && (reservations.filter(r => r.status === "pending").length > 0 || activeReservation) ? (
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
  ) : null;

  const trustBlock = (
    <div
      className="mt-6 flex items-start gap-3"
      style={{ backgroundColor: '#F5F0E8', border: '1px solid #C9A84C', borderRadius: '10px', padding: '12px 16px' }}
    >
      <Shield className="w-[18px] h-[18px] shrink-0 mt-0.5" style={{ color: '#C9A84C' }} />
      <div>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#1B2A4A' }}>
          Paiement sécurisé via findr
        </span>
        <p style={{ fontSize: '11px', color: '#8A8070', fontStyle: 'italic', marginTop: '2px' }}>
          Fonds bloqués jusqu'à confirmation de réception
        </p>
      </div>
    </div>
  );

  const carousel = <SearchDetailCarousel search={search} activeReservation={activeReservation} isReserved={!!isReserved} />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* ===== Desktop layout ===== */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              {carousel}
              {titleBlock}
              {badgesBlock}
              {descriptionBlock}
              {!isOwner && proposalsPanel}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 self-start sticky"
              style={{ top: '90px' }}
            >
              {userCard}
              {reservationStatusBlock}
              {actionsBlock}
              {isOwner && (
                <div className="space-y-6">
                  {ownerReservationsBlock}
                  {proposalsPanel}
                </div>
              )}
              {trustBlock}
            </motion.div>
          </div>

          {/* ===== Mobile layout ===== */}
          <div className="lg:hidden" style={{ paddingBottom: !isOwner && canInteract ? '84px' : undefined }}>
            {carousel}
            {titleBlock}
            {badgesBlock}
            {reservationStatusBlock}
            {actionsBlock && <div className="mb-6">{actionsBlock}</div>}
            {descriptionBlock}
            {userCard}
            {isOwner ? (
              <div className="space-y-6">
                {ownerReservationsBlock}
                {proposalsPanel}
              </div>
            ) : (
              proposalsPanel
            )}
            {trustBlock}
          </div>
        </div>
      </main>

      {/* Mobile fixed action bar */}
      {!isOwner && canInteract && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3"
          style={{ backgroundColor: '#070E42', boxShadow: '0 -4px 16px rgba(10,22,40,0.25)' }}
        >
          <Button
            onClick={handleProposal}
            className="w-full gap-2 rounded-lg"
            style={{ height: '48px', fontSize: '15px', fontWeight: 600, backgroundColor: '#070E42', color: '#C9A84C', border: '1.5px solid #C9A84C' }}
          >
            🏷️ Faire une proposition
          </Button>
        </div>
      )}

      {/* Blocage : paiements non configurés */}
      <Dialog open={stripeGateOpen} onOpenChange={setStripeGateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#070E42' }}>Configure tes paiements</DialogTitle>
            <DialogDescription>
              Configure tes paiements avant de pouvoir proposer un objet — ça prend 2 minutes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setStripeGateOpen(false)}>
              Plus tard
            </Button>
            <Button
              onClick={startOnboarding}
              disabled={stripeLoading}
              style={{ backgroundColor: '#070E42', color: '#F5F0EA' }}
            >
              {stripeLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirection…</>
              ) : (
                "Configurer mes paiements"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};


export default SearchDetail;