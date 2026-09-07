import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

interface SearchData {
  id: string;
  title: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string;
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
}

const getDeadlineBadge = (deadline: string, t: TFunction) => {
  const days = Math.round((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const label = t("card.daysLeft", { count: days });
  return { label, bg: "rgba(239,83,80,0.95)", color: "#fff" };
};

const ExpiringSoon = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searches, setSearches] = useState<SearchData[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileData>>({});
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const nowIso = new Date().toISOString();
      const maxIso = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("searches")
        .select("id, title, category, budget_min, budget_max, deadline, image_url, image_urls, user_id, created_at")
        .eq("status", "active")
        .not("deadline", "is", null)
        .gt("deadline", nowIso)
        .lt("deadline", maxIso)
        .order("deadline", { ascending: true })
        .limit(5);

      const items = (data || []) as SearchData[];
      setSearches(items);

      if (items.length > 0) {
        const userIds = [...new Set(items.map(s => s.user_id))];
        const searchIds = items.map(s => s.id);
        const [profilesRes, proposalsRes] = await Promise.all([
          supabase.from("profiles").select("user_id, full_name, avatar_url, city").in("user_id", userIds),
          supabase.from("proposals").select("search_id").in("search_id", searchIds),
        ]);
        if (profilesRes.data) {
          const map: Record<string, ProfileData> = {};
          profilesRes.data.forEach(p => { map[p.user_id] = p as ProfileData; });
          setProfiles(map);
        }
        if (proposalsRes.data) {
          const counts: Record<string, number> = {};
          proposalsRes.data.forEach(p => { counts[p.search_id] = (counts[p.search_id] || 0) + 1; });
          setProposalCounts(counts);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const formatBudget = (min: number | null, max: number | null) => {
    if (min && max) return `${min}€ – ${max}€`;
    if (max) return `< ${max}€`;
    if (min) return `> ${min}€`;
    return t("card.budgetUndefined");
  };

  const getImage = (s: SearchData) => s.image_urls?.[0] || s.image_url || null;

  if (loading || searches.length === 0) return null;

  return (
    <section style={{ backgroundColor: "#F5F0E8" }} className="pt-8 pb-2 md:pt-10 md:pb-4">
      <div className="container mx-auto px-4" style={{ maxWidth: "1400px" }}>
        <div className="mb-5">
          <h2
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "24px",
              fontWeight: 700,
              color: "#1B2A4A",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 1.2,
            }}
          >
            {t("expiring.title")}
          </h2>
          <p style={{ fontSize: "13px", color: "#6B6355", marginTop: "6px" }}>
            {t("expiring.subtitle")}
          </p>
          <div style={{ width: "48px", height: "3px", backgroundColor: "#EF5350", borderRadius: "2px", marginTop: "8px" }} />
        </div>

        <div className="flex gap-4 overflow-x-auto md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
          {searches.map((search) => {
            const profile = profiles[search.user_id];
            const image = getImage(search);
            const badge = getDeadlineBadge(search.deadline, t);
            const proposalCount = proposalCounts[search.id] || 0;

            return (
              <div
                key={search.id}
                onClick={() => navigate(`/recherche/${search.id}`)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8E0D4] transition-all duration-200 flex-shrink-0 w-[85%] sm:w-[45%] md:w-auto snap-start"
                style={{ transition: "box-shadow 0.2s ease, transform 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(27,42,74,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div className="relative h-[180px] overflow-hidden">
                  {image ? (
                    <img src={image} alt={search.title} className="w-full h-full object-cover object-center" />
                  ) : (
                    <div className="w-full h-full bg-[#E8E0D4] flex items-center justify-center">
                      <span className="text-4xl">🔍</span>
                    </div>
                  )}
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
                  <div
                    className="absolute bottom-3 left-3 flex items-center gap-1.5"
                    style={{
                      background: badge.bg, borderRadius: "20px",
                      padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: badge.color,
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    {badge.label}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="line-clamp-1" style={{ fontSize: "16px", fontWeight: 600, color: "#1B2A4A", marginBottom: "8px" }}>
                    {search.title}
                  </h3>
                  <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#8A7A4C", textTransform: "uppercase" }}>
                    {t("card.budget")}
                  </span>
                  <p style={{ fontSize: "20px", fontWeight: 700, color: "#1B2A4A", marginTop: "2px", marginBottom: "12px" }}>
                    {formatBudget(search.budget_min, search.budget_max)}
                  </p>

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
      </div>
    </section>
  );
};

export default ExpiringSoon;
