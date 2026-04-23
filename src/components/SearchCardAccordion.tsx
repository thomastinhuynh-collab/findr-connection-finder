import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Package, CalendarClock, Edit, Loader2, User, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const [editHover, setEditHover] = useState(false);
  const [propHover, setPropHover] = useState(false);
  const [resaHover, setResaHover] = useState(false);

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

  const formatBudget = () => {
    const { budget_min, budget_max } = search;
    if (budget_min && budget_max) return `${budget_min}€ – ${budget_max}€`;
    if (budget_max) return `< ${budget_max}€`;
    if (budget_min) return `> ${budget_min}€`;
    return "Non défini";
  };

  const statusLabel = search.status === "active" ? "Active" : search.status === "paused" ? "En pause" : search.status === "reserved" ? "Réservée" : search.status;
  const proposalCount = search.proposal_count ?? 0;
  const reservationCount = search.reservation_count ?? 0;

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E2D9",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      {/* TOP — Image + infos + Edit */}
      <div style={{ padding: "14px 14px 12px" }}>
        <div className="flex gap-3">
          <Link to={`/recherche/${search.id}`} className="flex-shrink-0">
            {search.image_url ? (
              <img
                src={search.image_url}
                alt={search.title}
                style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }}
              />
            ) : (
              <div
                className="flex items-center justify-center"
                style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: "#F5F0E8" }}
              >
                <span className="text-xl">🔍</span>
              </div>
            )}
          </Link>

          <div className="flex-1 min-w-0">
            {/* Title + status badge inline */}
            <div className="flex items-center gap-2 min-w-0">
              <Link to={`/recherche/${search.id}`} className="min-w-0 flex-1">
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1B2A4A",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    margin: 0,
                  }}
                >
                  {search.title}
                </h3>
              </Link>
              <span
                style={{
                  backgroundColor: "#1B2A4A",
                  color: "#C9A84C",
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "3px 9px",
                  borderRadius: 20,
                  letterSpacing: "0.03em",
                  flexShrink: 0,
                  textTransform: "capitalize",
                }}
              >
                {statusLabel}
              </span>
            </div>

            {/* Category */}
            <p style={{ fontSize: 11, color: "#C9A84C", fontWeight: 500, margin: "4px 0 2px" }}>
              {search.category}
            </p>

            {/* Budget */}
            <p style={{ fontSize: 12, color: "#6B6259", margin: 0 }}>
              Budget :{" "}
              <span style={{ fontWeight: 600, color: "#1B2A4A" }}>{formatBudget()}</span>
            </p>
          </div>
        </div>

        {/* Edit button */}
        <div className="flex justify-end" style={{ marginTop: 12 }}>
          <Link
            to={`/modifier-recherche/${search.id}`}
            onMouseEnter={() => setEditHover(true)}
            onMouseLeave={() => setEditHover(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "1.5px solid #1B2A4A",
              backgroundColor: editHover ? "#1B2A4A" : "transparent",
              color: editHover ? "#FFFFFF" : "#1B2A4A",
              borderRadius: 7,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 500,
              transition: "background-color 0.15s, color 0.15s",
              textDecoration: "none",
            }}
          >
            <Edit style={{ width: 13, height: 13 }} />
            Modifier
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: "#EEE8DF" }} />

      {/* BOTTOM ROW 1 — Propositions (navy) */}
      <Collapsible open={proposalsOpen} onOpenChange={handleProposalsToggle}>
        <CollapsibleTrigger asChild>
          <button
            onMouseEnter={() => setPropHover(true)}
            onMouseLeave={() => setPropHover(false)}
            style={{
              width: "100%",
              backgroundColor: propHover ? "#243d6b" : "#1B2A4A",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
          >
            <span className="flex items-center gap-2">
              <Package style={{ width: 18, height: 18, color: "#C9A84C" }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: "#FFFFFF" }}>
                Propositions reçues
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span
                style={{
                  backgroundColor: "#C9A84C",
                  color: "#1B2A4A",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                }}
              >
                {proposalCount}
              </span>
              <ChevronDown
                style={{
                  width: 14,
                  height: 14,
                  color: "rgba(255,255,255,0.6)",
                  transition: "transform 0.2s",
                  transform: proposalsOpen ? "rotate(180deg)" : "none",
                }}
              />
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div style={{ backgroundColor: "#FFFFFF", padding: "10px 14px", borderTop: "1px solid #EEE8DF" }}>
            {loadingProposals ? (
              <div className="flex justify-center py-3">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#C9A84C" }} />
              </div>
            ) : proposals.length === 0 ? (
              <p className="text-center py-2" style={{ fontSize: 12, color: "#6B6259" }}>
                Aucune proposition
              </p>
            ) : (
              <div className="space-y-2">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    onClick={() => navigate(`/recherche/${search.id}`)}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
                    style={{ backgroundColor: "#FAF7F2", border: "1px solid #EEE8DF" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {proposal.findr_profile?.avatar_url ? (
                        <img src={proposal.findr_profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1B2A4A" }}>
                          <User className="w-3.5 h-3.5" style={{ color: "#FFFFFF" }} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate" style={{ fontSize: 12, fontWeight: 600, color: "#1B2A4A" }}>
                          {proposal.title}
                        </p>
                        <div className="flex items-center gap-1.5" style={{ fontSize: 10.5, color: "#6B6259" }}>
                          <span>{proposal.findr_profile?.full_name || "findr"}</span>
                          {proposal.findr_profile?.is_premium && <Crown className="w-3 h-3" style={{ color: "#C9A84C" }} />}
                          <span>•</span>
                          <span>{formatDate(proposal.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C" }}>
                        {proposal.proposed_price.toFixed(0)}€
                      </span>
                      {statusBadge(proposal.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* BOTTOM ROW 2 — Réservations (cream) */}
      <Collapsible open={reservationsOpen} onOpenChange={handleReservationsToggle}>
        <CollapsibleTrigger asChild>
          <button
            onMouseEnter={() => setResaHover(true)}
            onMouseLeave={() => setResaHover(false)}
            style={{
              width: "100%",
              backgroundColor: resaHover ? "#EDE7DC" : "#F5F0E8",
              padding: "10px 16px",
              borderTop: "1px solid #EEE8DF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "none",
              borderTopWidth: 1,
              borderTopStyle: "solid",
              borderTopColor: "#EEE8DF",
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
          >
            <span className="flex items-center gap-2">
              <CalendarClock style={{ width: 14, height: 14, color: "#9A8F84" }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#6B6259" }}>
                Réservations
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span
                style={{
                  backgroundColor: "#E8E2D9",
                  color: "#1B2A4A",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 20,
                }}
              >
                {reservationCount}
              </span>
              <ChevronDown
                style={{
                  width: 13,
                  height: 13,
                  color: "#B0A898",
                  transition: "transform 0.2s",
                  transform: reservationsOpen ? "rotate(180deg)" : "none",
                }}
              />
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div style={{ backgroundColor: "#FFFFFF", padding: "10px 14px", borderTop: "1px solid #EEE8DF" }}>
            {loadingReservations ? (
              <div className="flex justify-center py-3">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#C9A84C" }} />
              </div>
            ) : reservations.length === 0 ? (
              <p className="text-center py-2" style={{ fontSize: 12, color: "#6B6259" }}>
                Aucune réservation active
              </p>
            ) : (
              <div className="space-y-2">
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
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SearchCardAccordion;
