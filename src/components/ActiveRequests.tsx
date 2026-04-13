import { useNavigate } from "react-router-dom";
import { Clock, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockSearches = [
  {
    id: "mock-1",
    title: "Nike Air Max 90 — Taille 42",
    category: "Mode Vintage",
    budget_min: 80,
    budget_max: 150,
    urgency: "2-weeks",
    urgencyLabel: "2 semaines",
    offers: 3,
    city: "Paris",
  },
  {
    id: "mock-2",
    title: "Appareil photo Olympus OM-1",
    category: "Photo & Électronique",
    budget_min: 100,
    budget_max: 250,
    urgency: "1-month",
    urgencyLabel: "1 mois",
    offers: 5,
    city: "Lyon",
  },
  {
    id: "mock-3",
    title: "Veste Levi's Sherpa années 80",
    category: "Mode Vintage",
    budget_min: 60,
    budget_max: 120,
    urgency: "2-weeks",
    urgencyLabel: "3 semaines",
    offers: 2,
    city: "Bordeaux",
  },
  {
    id: "mock-4",
    title: "Vinyle original Pink Floyd — The Wall",
    category: "Vinyles & Musique",
    budget_min: 40,
    budget_max: 90,
    urgency: "1-month",
    urgencyLabel: "1 mois",
    offers: 7,
    city: "Marseille",
  },
  {
    id: "mock-5",
    title: "Carte Pokémon Dracaufeu 1ère édition",
    category: "Pop Culture & TCG",
    budget_min: 200,
    budget_max: 600,
    urgency: "2-weeks",
    urgencyLabel: "2 semaines",
    offers: 12,
    city: "Toulouse",
  },
  {
    id: "mock-6",
    title: "Montre Casio G-Shock DW-5600 vintage",
    category: "Bijoux & Accessoires",
    budget_min: 70,
    budget_max: 130,
    urgency: "2-weeks",
    urgencyLabel: "3 semaines",
    offers: 4,
    city: "Nantes",
  },
];

const ActiveRequests = () => {
  const navigate = useNavigate();

  return (
    <section
      style={{ backgroundColor: "#F5F0E8", padding: "64px 0" }}
    >
      <div className="container mx-auto px-4" style={{ maxWidth: "1100px" }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#C9A84C",
                fontWeight: 600,
              }}
            >
              Demandes en cours
            </span>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 600,
                color: "#1B2A4A",
                marginTop: "8px",
              }}
            >
              Ce que la communauté recherche
            </h2>
          </div>
          <button
            onClick={() => navigate("/recherches")}
            style={{
              fontSize: "14px",
              color: "#C9A84C",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
              textDecoration: "none",
              transition: "text-decoration 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Voir toutes les demandes →
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockSearches.map((search) => (
            <div
              key={search.id}
              onClick={() => navigate("/recherches")}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8E0D4] hover:shadow-lg transition-all duration-300"
            >
              {/* Image placeholder */}
              <div className="relative h-48 bg-[#E8E0D4] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A]/10 to-[#C9A84C]/10" />

                {/* Demande buyr label */}
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "#C9A84C",
                    color: "#1B2A4A",
                    fontSize: "11px",
                    fontWeight: 600,
                    borderRadius: "4px",
                    padding: "3px 8px",
                    zIndex: 2,
                  }}
                >
                  Demande buyr
                </span>

                {/* Category badge */}
                <Badge
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "rgba(27, 42, 74, 0.92)",
                    color: "#C9A84C",
                    fontSize: "11px",
                    fontWeight: 500,
                    borderRadius: "20px",
                    padding: "4px 12px",
                    border: "none",
                  }}
                >
                  {search.category}
                </Badge>

                {/* Urgency */}
                <div
                  className="absolute bottom-3 left-3 flex items-center gap-1.5"
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    borderRadius: "20px",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#1B2A4A",
                  }}
                >
                  <Clock className="w-3 h-3" />
                  {search.urgencyLabel}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3
                  className="line-clamp-1"
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#1B2A4A",
                    marginBottom: "8px",
                  }}
                >
                  {search.title}
                </h3>

                {/* Budget */}
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1B2A4A",
                    marginBottom: "12px",
                  }}
                >
                  {search.budget_min}€ – {search.budget_max}€
                </p>

                {/* Stats */}
                <div
                  className="flex items-center gap-4 pt-3 border-t border-[#E8E0D4]"
                  style={{ fontSize: "13px", color: "#8A8070" }}
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {search.offers} offres
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {search.city}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/recherches")}
            className="hover:bg-[#1B2A4A] hover:text-white transition-all duration-200"
            style={{
              border: "1.5px solid #1B2A4A",
              color: "#1B2A4A",
              background: "transparent",
              height: "46px",
              padding: "0 28px",
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            Voir les 124 demandes actives
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ActiveRequests;
