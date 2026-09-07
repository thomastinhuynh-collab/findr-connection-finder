import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import FavoriteButton from "@/components/FavoriteButton";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

interface SearchData {
  id: string;
  title: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
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

const getDeadlineBadge = (deadline: string | null, t: TFunction) => {
  if (!deadline) return null;
  const diffMs = new Date(deadline).getTime() - Date.now();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (days < 0) {
    return { label: t("card.deadlinePassed"), bg: "rgba(140,140,140,0.92)", color: "#fff" };
  }
  const label = t("card.daysLeft", { count: days });
  if (days < 3) return { label, bg: "rgba(239,83,80,0.95)", color: "#fff" };
  if (days <= 7) return { label, bg: "rgba(245,158,11,0.95)", color: "#1B2A4A" };
  return { label, bg: "rgba(201,168,76,0.95)", color: "#1B2A4A" };
};

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
  const { t } = useTranslation();
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
      .select("id, title, category, budget_min, budget_max, deadline, image_url, image_urls, user_id, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(24);

    if (error || !data || data.length === 0) {
      setLoading(false);
      return;
    }

    const filtered = data
      .filter(s => !s.deadline || new Date(s.deadline).getTime() > Date.now())
      .slice(0, 8);

    setSearches(filtered);

    const userIds = [...new Set(filtered.map(s => s.user_id))];
    const searchIds = filtered.map(s => s.id);

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
    return t("card.budgetUndefined");
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
        <div className="mb-8">
          <h2
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#1B2A4A",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 1.2,
            }}
          >
            {t("active.title")}
          </h2>
          <div
            style={{
              width: "64px",
              height: "4px",
              backgroundColor: "#D9BD8B",
              borderRadius: "2px",
              marginTop: "10px",
            }}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {searches.map((search) => {
            const profile = profiles[search.user_id];
            const images = getImages(search);
            const deadlineBadge = getDeadlineBadge(search.deadline, t);
            const proposalCount = proposalCounts[search.id] || 0;

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
                  <div className="absolute top-2.5 left-2.5 z-10" onClick={(e) => e.stopPropagation()}>
                    <FavoriteButton searchId={search.id} />
                  </div>
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
                      background: "#070E42", color: "#FFFFFF",
                      fontSize: "11px", fontWeight: 500, borderRadius: "20px",
                      padding: "4px 12px", border: "none",
                    }}
                  >
                    {search.category}
                  </Badge>

                  {/* Deadline badge */}
                  {deadlineBadge && (
                    <div
                      className="absolute bottom-3 left-3 flex items-center gap-1.5"
                      style={{
                        background: deadlineBadge.bg, borderRadius: "20px",
                        padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: deadlineBadge.color,
                      }}
                    >
                      <Clock className="w-3 h-3" />
                      {deadlineBadge.label}
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

                  <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#8A7A4C", textTransform: "uppercase" }}>
                    {t("card.budget")}
                  </span>
                  <p style={{ fontSize: "20px", fontWeight: 700, color: "#1B2A4A", marginTop: "2px", marginBottom: "12px" }}>
                    {formatBudget(search.budget_min, search.budget_max)}
                  </p>

                  {/* User + location */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E8E0D4]">
                    <div className="flex items-center gap-2">
                      {profile?.avatar_url && (
                        <img src={profile.avatar_url} alt={profile.full_name || ""} className="w-6 h-6 rounded-full object-cover" />
                      )}
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#1B2A4A" }}>
                        {profile?.full_name || t("card.user")}
                      </span>
                    </div>
                    <span className="flex items-center gap-1" style={{ fontSize: "12px", color: "#8A8070" }}>
                      <MapPin className="w-3 h-3" />
                      {profile?.city || t("card.country")}
                    </span>
                  </div>

                  {/* Social proof / CTA */}
                  <div className="mt-2" style={{ fontSize: "12px" }}>
                    {proposalCount > 0 ? (
                      <span style={{ color: "#1B2A4A" }}>
                        {t("card.proposalsReceived", { count: proposalCount })}
                      </span>
                    ) : (
                      <span style={{ color: "#C9A84C", fontStyle: "italic" }}>
                        {t("card.firstFindr")}
                      </span>
                    )}
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
            {t("active.cta")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ActiveRequests;
