import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Package, CalendarClock, Lock, Edit, Loader2, User, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import ReservationCard from "./ReservationCard";

interface SearchItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  created_at: string;
  image_url: string | null;
  urgency: string | null;
  proposal_count?: number;
  reservation_count?: number;
}

interface Proposal {
  id: string;
  title: string;
  proposed_price: number;
  status: string;
  created_at: string;
  findr_id: string;
  findr_profile?: {
    full_name: string | null;
    avatar_url: string | null;
    is_premium: boolean | null;
  };
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

interface SearchCardAccordionProps {
  search: SearchItem;
  onDataChange: () => void;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "pending": return <Badge variant="secondary" className="text-xs">En attente</Badge>;
    case "accepted_pending": return <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 text-xs">Paiement en attente</Badge>;
    case "completed": return <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30 text-xs">Finalisé</Badge>;
    case "rejected": return <Badge variant="destructive" className="text-xs">Refusé</Badge>;
    default: return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
};

const SearchCardAccordion = ({ search, onDataChange }: SearchCardAccordionProps) => {
  const navigate = useNavigate();
  const [proposalsOpen, setProposalsOpen] = useState(false);
  const [reservationsOpen, setReservationsOpen] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [proposalsFetched, setProposalsFetched] = useState(false);
  const [reservationsFetched, setReservationsFetched] = useState(false);

  const fetchProposals = async () => {
    if (proposalsFetched) return;
    setLoadingProposals(true);
    const { data } = await supabase
      .from("proposals")
      .select("*")
      .eq("search_id", search.id)
      .order("created_at", { ascending: false });

    if (data) {
      const withProfiles = await Promise.all(
        data.map(async (p) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, is_premium")
            .eq("user_id", p.findr_id)
            .maybeSingle();
          return { ...p, findr_profile: profile };
        })
      );
      setProposals(withProfiles as Proposal[]);
    }
    setProposalsFetched(true);
    setLoadingProposals(false);
  };

  const fetchReservations = async () => {
    if (reservationsFetched) return;
    setLoadingReservations(true);
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .eq("search_id", search.id)
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false });

    if (data) {
      const withProfiles = await Promise.all(
        data.map(async (r) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", r.findr_id)
            .maybeSingle();
          return { ...r, findr_profile: profile };
        })
      );
      setReservations(withProfiles as Reservation[]);
    }
    setReservationsFetched(true);
    setLoadingReservations(false);
  };

  const handleProposalsToggle = (open: boolean) => {
    setProposalsOpen(open);
    if (open) fetchProposals();
  };

  const handleReservationsToggle = (open: boolean) => {
    setReservationsOpen(open);
    if (open) fetchReservations();
  };

  const handleReservationUpdate = () => {
    setReservationsFetched(false);
    fetchReservations();
    onDataChange();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="py-4">
        {/* Main search info */}
        <div className="flex gap-4">
          <Link to={`/recherche/${search.id}`} className="flex-shrink-0">
            {search.image_url ? (
              <img
                src={search.image_url}
                alt={search.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <Link to={`/recherche/${search.id}`}>
                  <h3 className="font-semibold text-primary truncate hover:text-accent transition-colors">{search.title}</h3>
                </Link>
                <p className="text-sm text-muted-foreground">{search.category}</p>
                {(search.budget_min || search.budget_max) && (
                  <p className="text-sm mt-1">
                    Budget: {search.budget_min || 0}€ - {search.budget_max || "∞"}€
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {search.status === "reserved" ? (
                  <Badge className="bg-accent/20 text-accent border border-accent/50 gap-1 flex-shrink-0">
                    <Lock className="w-3 h-3" />
                    Réservée
                  </Badge>
                ) : (
                  <Badge variant={search.status === "active" ? "default" : "secondary"} className="flex-shrink-0">
                    {search.status === "active" ? "Active" : search.status === "paused" ? "En pause" : search.status}
                  </Badge>
                )}
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/modifier-recherche/${search.id}`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible sections */}
        <div className="mt-4 space-y-2">
          {/* Proposals accordion */}
          {(search.proposal_count ?? 0) > 0 && (
            <Collapsible open={proposalsOpen} onOpenChange={handleProposalsToggle}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors">
                <span className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Package className="w-4 h-4 text-accent" />
                  {search.proposal_count} proposition{(search.proposal_count ?? 0) > 1 ? "s" : ""}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${proposalsOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                {loadingProposals ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                  </div>
                ) : proposals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">Aucune proposition</p>
                ) : (
                  <div className="space-y-2 pl-2">
                    {proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/recherche/${search.id}`)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {proposal.findr_profile?.avatar_url ? (
                            <img src={proposal.findr_profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-primary truncate">{proposal.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{proposal.findr_profile?.full_name || "findr"}</span>
                              {proposal.findr_profile?.is_premium && <Crown className="w-3 h-3 text-accent" />}
                              <span>•</span>
                              <span>{formatDate(proposal.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-bold text-accent">{proposal.proposed_price.toFixed(0)}€</span>
                          {statusBadge(proposal.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Reservations accordion */}
          {(search.reservation_count ?? 0) > 0 && (
            <Collapsible open={reservationsOpen} onOpenChange={handleReservationsToggle}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors">
                <span className="flex items-center gap-2 text-sm font-medium text-accent">
                  <CalendarClock className="w-4 h-4" />
                  {search.reservation_count} réservation{(search.reservation_count ?? 0) > 1 ? "s" : ""}
                </span>
                <ChevronDown className={`w-4 h-4 text-accent transition-transform duration-200 ${reservationsOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                {loadingReservations ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                  </div>
                ) : reservations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">Aucune réservation active</p>
                ) : (
                  <div className="space-y-2 pl-2">
                    {reservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        isOwner={true}
                        searchTitle={search.title}
                        onUpdate={handleReservationUpdate}
                      />
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchCardAccordion;
