import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MockUser {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  city: string;
  badge?: string;
}

const mockUsers: Record<string, MockUser> = {
  sophie: {
    name: "Sophie Marchand",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&q=80",
    level: 5,
    xp: 1200,
    city: "Paris",
  },
  thomas: {
    name: "Thomas Leroy",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    level: 8,
    xp: 3100,
    city: "Lyon",
    badge: "Top vendeur",
  },
  camille: {
    name: "Camille Dubois",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    level: 3,
    xp: 650,
    city: "Bordeaux",
  },
  marc: {
    name: "Marc Fontaine",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    level: 11,
    xp: 5400,
    city: "Marseille",
    badge: "Top vendeur",
  },
};

const mockSearches = [
  {
    id: "mock-1",
    title: "Nike Air Max 90 — Taille 42",
    category: "Mode Vintage",
    budget_min: 80,
    budget_max: 150,
    urgencyLabel: "2 semaines",
    offers: 3,
    user: mockUsers.sophie,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
    ],
  },
  {
    id: "mock-2",
    title: "Appareil photo Olympus OM-1",
    category: "Photo & Électronique",
    budget_min: 100,
    budget_max: 250,
    urgencyLabel: "1 mois",
    offers: 5,
    user: mockUsers.thomas,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
      "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=800&q=80",
    ],
  },
  {
    id: "mock-3",
    title: "Veste Levi's Sherpa années 80",
    category: "Mode Vintage",
    budget_min: 60,
    budget_max: 120,
    urgencyLabel: "3 semaines",
    offers: 2,
    user: mockUsers.camille,
    images: [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80",
    ],
  },
  {
    id: "mock-4",
    title: "Vinyle original Pink Floyd — The Wall",
    category: "Vinyles & Musique",
    budget_min: 40,
    budget_max: 90,
    urgencyLabel: "1 mois",
    offers: 7,
    user: mockUsers.marc,
    images: [
      "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80",
      "https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    ],
  },
  {
    id: "mock-5",
    title: "Carte Pokémon Dracaufeu 1ère édition",
    category: "Pop Culture & TCG",
    budget_min: 200,
    budget_max: 600,
    urgencyLabel: "2 semaines",
    offers: 12,
    user: mockUsers.sophie,
    images: [
      "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800&q=80",
      "https://images.unsplash.com/photo-1601987177651-8edfe6c20009?w=800&q=80",
      "https://images.unsplash.com/photo-1605979257913-1704eb7b6246?w=800&q=80",
    ],
  },
  {
    id: "mock-6",
    title: "Montre Casio G-Shock DW-5600 vintage",
    category: "Bijoux & Accessoires",
    budget_min: 70,
    budget_max: 130,
    urgencyLabel: "3 semaines",
    offers: 4,
    user: mockUsers.thomas,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800&q=80",
    ],
  },
];

const CardImageCarousel = ({ images, alt }: { images: string[]; alt: string }) => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="relative w-full h-full">
      <img
        src={images[current]}
        alt={alt}
        className="w-full h-full object-cover object-center transition-opacity duration-300"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((current - 1 + images.length) % images.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4 text-[#1B2A4A]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((current + 1) % images.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4 text-[#1B2A4A]" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

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
              onClick={() => navigate(`/recherche/${search.id}`)}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8E0D4] transition-all duration-200"
              style={{ transition: "box-shadow 0.2s ease, transform 0.2s ease" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(27,42,74,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {/* Image placeholder */}
              <div className="relative h-[200px] overflow-hidden">
                <CardImageCarousel images={search.images} alt={search.title} />

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

                {/* User + Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E8E0D4]">
                  <div className="flex items-center gap-2">
                    <img
                      src={search.user.avatar}
                      alt={search.user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "#1B2A4A" }}>
                      {search.user.name}
                    </span>
                    {search.user.badge && (
                      <span style={{ fontSize: "10px", background: "#C9A84C", color: "#1B2A4A", borderRadius: "4px", padding: "1px 6px", fontWeight: 600 }}>
                        {search.user.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3" style={{ fontSize: "12px", color: "#8A8070" }}>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {search.offers}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {search.user.city}
                    </span>
                  </div>
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
