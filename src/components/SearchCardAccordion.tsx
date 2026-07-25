import { Link, useNavigate } from "react-router-dom";
import { Edit, Bell } from "lucide-react";

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
  accepted_count?: number;
  unread_count?: number;
  completed_at?: string | null;
}

interface SearchCardAccordionProps {
  search: SearchItem;
  onDataChange: () => void;
}

const SearchCardAccordion = ({ search }: SearchCardAccordionProps) => {
  const navigate = useNavigate();

  const proposalCount = search.proposal_count ?? 0;
  const acceptedCount = search.accepted_count ?? 0;
  const unreadCount = search.unread_count ?? 0;
  const isTerminee = search.status === "completed" || search.status === "closed";
  const isReservee = search.status === "reserved";

  const formatBudget = () => {
    const { budget_min, budget_max } = search;
    if (budget_min && budget_max) return `${budget_min}€ – ${budget_max}€`;
    if (budget_max) return `< ${budget_max}€`;
    if (budget_min) return `> ${budget_min}€`;
    return "Non défini";
  };

  const formatCompletedDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Distinct status badge styling
  const statusBadge = () => {
    if (isTerminee) {
      return {
        label: "Terminée",
        style: {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          border: "1px solid #E5E7EB",
        } as React.CSSProperties,
      };
    }
    if (isReservee) {
      return {
        label: "Réservée",
        style: {
          backgroundColor: "#DCFCE7",
          color: "#166534",
          border: "1px solid #BBF7D0",
        } as React.CSSProperties,
      };
    }
    return {
      label: "Active",
      style: {
        backgroundColor: "transparent",
        color: "#C9A84C",
        border: "1.5px solid #D9BD8B",
      } as React.CSSProperties,
    };
  };

  const badge = statusBadge();

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E2D9",
        borderLeft: unreadCount > 0 ? "4px solid #D85A30" : "1px solid #E8E2D9",
        borderRadius: "14px",
        overflow: "hidden",
        opacity: isTerminee ? 0.85 : 1,
        transition: "opacity 0.15s",
      }}
    >
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
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "3px 9px",
                  borderRadius: 20,
                  letterSpacing: "0.03em",
                  flexShrink: 0,
                  ...badge.style,
                }}
              >
                {badge.label}
              </span>
            </div>

            <p style={{ fontSize: 11, color: "#C9A84C", fontWeight: 500, margin: "4px 0 2px" }}>
              {search.category}
            </p>

            <p style={{ fontSize: 12, color: "#6B6259", margin: 0 }}>
              Budget :{" "}
              <span style={{ fontWeight: 600, color: "#1B2A4A" }}>{formatBudget()}</span>
            </p>
          </div>
        </div>

        {/* Single info line replacing the two counters */}
        <p
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#6B6259",
          }}
        >
          {isTerminee && search.completed_at
            ? `Transaction conclue le ${formatCompletedDate(search.completed_at)}`
            : `${proposalCount} proposition${proposalCount !== 1 ? "s" : ""} reçue${proposalCount !== 1 ? "s" : ""}, dont ${acceptedCount} acceptée${acceptedCount !== 1 ? "s" : ""}`}
        </p>

        <div className="flex justify-end" style={{ marginTop: 10 }}>
          <Link
            to={`/modifier-recherche/${search.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "1.5px solid #1B2A4A",
              backgroundColor: "transparent",
              color: "#1B2A4A",
              borderRadius: 7,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <Edit style={{ width: 13, height: 13 }} />
            Modifier
          </Link>
        </div>
      </div>

      {/* Coral alert banner for unread proposals */}
      {unreadCount > 0 && !isTerminee && (
        <button
          type="button"
          onClick={() => navigate(`/recherche/${search.id}`)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "10px 14px",
            backgroundColor: "rgba(216, 90, 48, 0.08)",
            borderTop: "1px solid rgba(216, 90, 48, 0.15)",
            border: "none",
            cursor: "pointer",
            color: "#D85A30",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span className="flex items-center gap-2">
            <Bell style={{ width: 14, height: 14 }} />
            {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""} proposition{unreadCount > 1 ? "s" : ""} à traiter
          </span>
          <span style={{ textDecoration: "underline" }}>Voir →</span>
        </button>
      )}
    </div>
  );
};

export default SearchCardAccordion;
