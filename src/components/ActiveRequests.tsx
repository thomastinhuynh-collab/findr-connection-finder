import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const urgencyLabels: Record<string, string> = {
  "3-days": "3 jours",
  "1-week": "1 semaine",
  "2-weeks": "2 semaines",
  "1-month": "1 mois",
  "no-rush": "Pas pressé",
  "normal": "Normal",
};

interface SearchData {
  id: string;
  title: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  user_id: string;
  created_at: string;
}

interface ProfileData {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  level: number | null;
  xp_points: number | null;
}

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
  const [searches, setSearches] = useState<SearchData[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileData>>({});
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    const { data, error } = await supabase
      .from("searches")
      .select("id, title, category, budget_min, budget_max, urgency, image_url, image_urls, user_id, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data || data.length === 0) {
      setLoading(false);
      return;
    }

    setSearches(data);

    const userIds = [...new Set(data.map(s => s.user_id))];
    const searchIds = data.map(s => s.id);

    const [profilesRes, proposalsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, avatar_url, city, level, xp_points").in("user_id", userIds),
      supabase.from("proposals").select("search_id").in("search_id", searchIds),
    ]);

    if (profilesRes.data) {
      const map: Record<string, ProfileData> = {};
      profilesRes.data.forEach(p => { map[p.user_id] = p; });
      setProfiles(map);
    }

    if (proposalsRes.data) {
      const counts: Record<string, number> = {};
      proposalsRes.data.forEach(p => { counts[p.search_id] = (counts[p.search_id] || 0) + 1; });
      setProposalCounts(counts);
    }

    setLoading(false);
  };

  const getImages = (search: SearchData): string[] => {
    if (search.image_urls?.length) return search.image_urls;
    if (search.image_url) return [search.image_url];
    return [];
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (min && max) return `${min}€ – ${max}€`;
    if (max) return `< ${max}€`;
    if (min) return `> ${min}€`;
    return "Non défini";
  };

  if (loading) {
    return (
      <section style={{ backgroundColor: "#F5F0E8" }} className="py-14">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </section>
    );
  }

  if (searches.length === 0) return null;

  return (
    <section style={{ backgroundColor: "#F5F0E8" }} className="pt-4 pb-10 md:pt-6 md:pb-14">
      <div className="container mx-auto px-4" style={{ maxWidth: "1400px" }}>
        {/* Header */}
        <div className="mb-7">
          <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#C9A84C", fontWeight: 600 }}>
            Recherches en cours
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {searches.map((search) => {
            const profile = profiles[search.user_id];
            const images = getImages(search);

            return (
              <div
                key={search.id}
                onClick={() => navigate(`/recherche/${search.id}`)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8E0D4] transition-all duration-200"
                style={{ transition: "box-shadow 0.2s ease, transform 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(27,42,74,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Image */}
                <div className="relative h-[200px] overflow-hidden">
                  {images.length > 0 ? (
                    <CardImageCarousel images={images} alt={search.title} />
                  ) : (
                    <div className="w-full h-full bg-[#E8E0D4] flex items-center justify-center">
                      <span className="text-4xl">🔍</span>
                    </div>
                  )}



                  {/* Category badge */}
                  <Badge
                    style={{
                      position: "absolute", top: "10px", right: "10px",
                      background: "rgba(27, 42, 74, 0.92)", color: "#C9A84C",
                      fontSize: "11px", fontWeight: 500, borderRadius: "20px",
                      padding: "4px 12px", border: "none",
                    }}
                  >
                    {search.category}
                  </Badge>

                  {/* Urgency */}
                  {search.urgency && search.urgency !== "no-rush" && search.urgency !== "normal" && (
                    <div
                      className="absolute bottom-3 left-3 flex items-center gap-1.5"
                      style={{
                        background: "rgba(255,255,255,0.92)", borderRadius: "20px",
                        padding: "4px 10px", fontSize: "11px", fontWeight: 500, color: "#1B2A4A",
                      }}
                    >
                      <Clock className="w-3 h-3" />
                      {urgencyLabels[search.urgency] || search.urgency}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3
                    className="line-clamp-1"
                    style={{ fontSize: "16px", fontWeight: 600, color: "#1B2A4A", marginBottom: "8px" }}
                  >
                    {search.title}
                  </h3>

                  <p style={{ fontSize: "20px", fontWeight: 700, color: "#1B2A4A", marginBottom: "12px" }}>
                    {formatBudget(search.budget_min, search.budget_max)}
                  </p>

                  {/* User + Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E8E0D4]">
                    <div className="flex items-center gap-2">
                      {profile?.avatar_url && (
                        <img src={profile.avatar_url} alt={profile.full_name || ""} className="w-6 h-6 rounded-full object-cover" />
                      )}
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#1B2A4A" }}>
                        {profile?.full_name || "Utilisateur"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3" style={{ fontSize: "12px", color: "#8A8070" }}>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {proposalCounts[search.id] || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile?.city || "France"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/recherches")}
            className="hover:bg-[#1B2A4A] hover:text-white transition-all duration-200"
            style={{
              border: "1.5px solid #1B2A4A", color: "#1B2A4A",
              background: "transparent", height: "46px",
              padding: "0 28px", borderRadius: "8px", fontWeight: 600,
            }}
          >
            Voir toutes les demandes actives
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ActiveRequests;
