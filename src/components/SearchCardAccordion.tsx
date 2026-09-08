import { Link, useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";

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
  urgent_reason?: "reservation_pending" | "payment_pending" | null;
  tab_status?: "active" | "ongoing" | "done" | "cancelled";
  findr_name?: string | null;
  final_amount?: number | null;
  finalized_at?: string | null;
  cancel_reason?: string | null;
  has_invoice?: boolean;
}

interface SearchCardAccordionProps {
  search: SearchItem;
  onDataChange: () => void;
}

const categoryGradient = (cat: string) => {
  const gradients = [
    "linear-gradient(135deg, #F5E6D3 0%, #E8C89A 100%)",
    "linear-gradient(135deg, #EEE4D2 0%, #C9B896 100%)",
    "linear-gradient(135deg, #F0E4D0 0%, #D9BB87 100%)",
    "linear-gradient(135deg, #E8DDCB 0%, #B8A075 100%)",
    "linear-gradient(135deg, #F2E8D5 0%, #D4BD8B 100%)",
    "linear-gradient(135deg, #EBE0CB 0%, #C4A574 100%)",
  ];
  const h = [...(cat || "")].reduce((a, c) => a + c.charCodeAt(0), 0);
  return gradients[h % gradients.length];
};

const SearchCardAccordion = ({ search }: SearchCardAccordionProps) => {
  const navigate = useNavigate();

  const proposalCount = search.proposal_count ?? 0;
  const acceptedCount = search.accepted_count ?? 0;
  const unreadCount = search.unread_count ?? 0;
  const tabStatus = search.tab_status ?? "active";
  const isDone = tabStatus === "done";
  const isCancelled = tabStatus === "cancelled";
  const isTerminee = isDone || search.status === "completed" || search.status === "closed";
  const isReservee = search.status === "reserved" || (acceptedCount > 0 && !isDone && !isCancelled && !isTerminee);
  const urgentReason = search.urgent_reason ?? null;
  const isUrgent = !!urgentReason && !isTerminee;

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

  const statusBadge = () => {
    if (isCancelled) {
      return {
        label: "Annulée",
        style: {
          backgroundColor: "#EEEEEE",
          color: "#6B6259",
          border: "none",
        } as React.CSSProperties,
      };
    }
    if (isDone || isTerminee) {
      return {
        label: "Terminée",
        style: {
          backgroundColor: "#EEEEEE",
          color: "#777777",
          border: "none",
        } as React.CSSProperties,
      };
    }
    if (isReservee) {
      return {
        label: "En traitement",
        style: {
          backgroundColor: "#E2F3E6",
          color: "#1F7A34",
          border: "none",
        } as React.CSSProperties,
      };
    }
    return {
      label: "Active",
      style: {
        backgroundColor: "transparent",
        color: "#8B7333",
        border: "1.5px solid #D9BB87",
      } as React.CSSProperties,
    };
  };

  const badge = statusBadge();

  const urgentMessage =
    urgentReason === "reservation_pending"
      ? "⏳ Confirme la réservation sous 48h"
      : urgentReason === "payment_pending"
      ? "💳 Proposition acceptée — paiement en attente"
      : null;

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "#FFFFFF",
        border: isUrgent ? "1.5px solid #D85A30" : "none",
        borderRadius: 11,
        overflow: "hidden",
        opacity: isTerminee ? 0.85 : isCancelled ? 0.9 : 1,
        boxShadow: "0 3px 10px rgba(10,22,40,0.06)",
        transition: "opacity 0.15s, box-shadow 0.15s",
      }}
    >
      {/* Discreet gold circle badge for unread proposals (top-right) */}
      {unreadCount > 0 && !isUrgent && !isTerminee && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 22,
            height: 22,
            borderRadius: "50%",
            backgroundColor: "#D9BB87",
            color: "#070E42",
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            boxShadow: "0 1px 3px rgba(10,22,40,0.15)",
          }}
          title={`${unreadCount} nouvelle${unreadCount > 1 ? "s" : ""} proposition${unreadCount > 1 ? "s" : ""}`}
        >
          {unreadCount}
        </div>
      )}

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
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  background: categoryGradient(search.category),
                }}
              >
                <span style={{ fontSize: 22, opacity: 0.7 }}>🔍</span>
              </div>
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0" style={{ paddingRight: unreadCount > 0 && !isUrgent && !isTerminee ? 26 : 0 }}>
              <Link to={`/recherche/${search.id}`} className="min-w-0 flex-1">
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#070E42",
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
              <span style={{ fontWeight: 600, color: "#070E42" }}>{formatBudget()}</span>
            </p>
          </div>
        </div>

        <p
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "#6B6259",
          }}
        >
          {isDone
            ? [
                search.findr_name ? `Vendue par ${search.findr_name}` : "Transaction conclue",
                search.final_amount != null ? `${search.final_amount} €` : null,
              ]
                .filter(Boolean)
                .join(" — ") +
              (search.finalized_at || search.completed_at
                ? ` · le ${formatCompletedDate(search.finalized_at || search.completed_at)}`
                : "")
            : isCancelled
            ? `Annulée${
                search.finalized_at ? ` le ${formatCompletedDate(search.finalized_at)}` : ""
              }${search.cancel_reason ? ` — ${search.cancel_reason}` : ""}`
            : isTerminee && search.completed_at
            ? `Transaction conclue le ${formatCompletedDate(search.completed_at)}`
            : `${proposalCount} proposition${proposalCount !== 1 ? "s" : ""} reçue${proposalCount !== 1 ? "s" : ""}, dont ${acceptedCount} acceptée${acceptedCount !== 1 ? "s" : ""}`}
        </p>

        {(isDone || isCancelled) && (
          <div className="flex items-center gap-3" style={{ marginTop: 10 }}>
            <Link
              to={`/recherche/${search.id}`}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#070E42",
                textDecoration: "none",
              }}
            >
              Détails →
            </Link>
            {isDone && search.has_invoice && (
              <span style={{ fontSize: 11, color: "#8B7333" }}>Facture disponible</span>
            )}
          </div>
        )}

        <div className="flex justify-end" style={{ marginTop: 10, display: isDone || isCancelled ? "none" : undefined }}>
          <Link
            to={`/modifier-recherche/${search.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "1.5px solid #070E42",
              backgroundColor: "transparent",
              color: "#070E42",
              borderRadius: 999,
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

      {/* Urgent action banner (only for strong urgency) */}
      {isUrgent && urgentMessage && (
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
            backgroundColor: "#FEF1EA",
            border: "none",
            borderTop: "1px solid rgba(216,90,48,0.18)",
            cursor: "pointer",
            color: "#993C1D",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <span>{urgentMessage}</span>
          <span>Détails →</span>
        </button>
      )}
    </div>
  );
};

export default SearchCardAccordion;
