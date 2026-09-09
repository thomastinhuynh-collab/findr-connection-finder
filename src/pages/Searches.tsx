import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Search, Clock, Euro, MessageCircle, Filter, SlidersHorizontal, Loader2, X, ArrowUpDown, ChevronDown, Tag, Wallet } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import UserBadge from "@/components/UserBadge";
import SearchImageCarousel from "@/components/SearchImageCarousel";
import FavoriteButton from "@/components/FavoriteButton";

interface SearchItem {
  id: string;
  title: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string | null;
  deadline: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const getDeadlineBadge = (deadline: string | null) => {
  if (!deadline) return null;
  const days = Math.round((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Délai dépassé", bg: "rgba(140,140,140,0.92)", color: "#fff" };
  const label = `Il reste ${days} jour${days > 1 ? "s" : ""}`;
  if (days < 3) return { label, bg: "rgba(239,83,80,0.95)", color: "#fff" };
  if (days <= 7) return { label, bg: "rgba(245,158,11,0.95)", color: "#1B2A4A" };
  return { label, bg: "rgba(201,168,76,0.95)", color: "#1B2A4A" };
};

const urgencyLabels: Record<string, string> = {
  "3-days": "3 jours",
  "1-week": "1 semaine",
  "2-weeks": "2 semaines",
  "1-month": "1 mois",
  "no-rush": "Pas pressé",
  "normal": "Normal",
};

const urgencyOrder: Record<string, number> = {
  "3-days": 1,
  "1-week": 2,
  "2-weeks": 3,
  "1-month": 4,
  "normal": 5,
  "no-rush": 6,
};

const categories = [
  "Toutes",
  "Mode & Maroquinerie",
  "Pop Culture & TCG",
  "Vinyles & Musique",
  "Photo & Électronique",
  "Bijoux & Accessoires",
  "Déco & Mobilier",
];

type SortOption = "relevance" | "recent" | "price-asc" | "price-desc" | "urgency-asc" | "urgency-desc" | "deadline-asc";
type DeadlineFilter = "all" | "urgent" | "week" | "none";

const PAGE_SIZE = 24;


const Searches = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [sortTouched, setSortTouched] = useState(false);
  const [selectedUrgency, setSelectedUrgency] = useState("Toutes");
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("all");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 5000]);
  const [budgetTouched, setBudgetTouched] = useState(false);
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({});
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(0);


  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const queryFromUrl = searchParams.get("q");
    
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
      if (!sortTouched) setSortBy("relevance");
    }
  }, [searchParams]);


  useEffect(() => {
    pageRef.current = 0;
    fetchSearches(true);
  }, [selectedCategory]);

  const fetchSearches = async (reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    const page = reset ? 0 : pageRef.current;
    const from = page * PAGE_SIZE;

    let query = supabase
      .from("searches")
      .select("id, title, category, budget_min, budget_max, urgency, deadline, image_url, image_urls, created_at, user_id")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (selectedCategory !== "Toutes") {
      query = query.eq("category", selectedCategory);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching searches:", error);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const batch = data || [];
    setHasMore(batch.length === PAGE_SIZE);
    pageRef.current = page + 1;

    if (batch.length > 0) {
      const filtered = batch.filter(s => !s.deadline || new Date(s.deadline).getTime() > Date.now());
      const userIds = [...new Set(filtered.map(s => s.user_id))];
      const searchIds = filtered.map(s => s.id);
      const [profilesRes, proposalsRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", userIds),
        supabase.from("proposals").select("search_id").in("search_id", searchIds),
      ]);

      const profilesMap = new Map(profilesRes.data?.map(p => [p.user_id, p]) || []);

      const searchesWithProfiles = filtered.map(search => ({
        ...search,
        profiles: profilesMap.get(search.user_id) || null
      }));

      const counts: Record<string, number> = {};
      proposalsRes.data?.forEach(p => { counts[p.search_id] = (counts[p.search_id] || 0) + 1; });
      setProposalCounts(prev => (reset ? counts : { ...prev, ...counts }));

      setSearches(prev => (reset ? (searchesWithProfiles as any) : [...prev, ...(searchesWithProfiles as any)]));
    } else if (reset) {
      setSearches([]);
      setProposalCounts({});
    }
    setLoading(false);
    setLoadingMore(false);
  };


  const formatBudget = (min: number | null, max: number | null) => {
    if (min && max) return `${min}-${max}€`;
    if (max) return `< ${max}€`;
    if (min) return `> ${min}€`;
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

  const relevanceScore = (s: SearchItem, q: string) => {
    if (!q) return 0;
    const query = q.toLowerCase();
    const title = (s.title || "").toLowerCase();
    let score = 0;
    if (title === query) score += 100;
    else if (title.startsWith(query)) score += 60;
    else if (title.includes(query)) score += 40;
    // deadline proximity bonus
    if (s.deadline) {
      const days = (new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (days > 0 && days < 14) score += Math.max(0, 10 - days);
    }
    return score;
  };

  const filteredAndSortedSearches = searches
    .filter((search) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery = !q || search.title.toLowerCase().includes(q);
      const matchesUrgency = selectedUrgency === "Toutes" || search.urgency === selectedUrgency;
      // Budget filter
      const bMin = search.budget_min ?? search.budget_max ?? 0;
      const bMax = search.budget_max ?? search.budget_min ?? 0;
      const matchesBudget = !budgetTouched || (bMax >= budgetRange[0] && bMin <= budgetRange[1]);
      // Deadline filter
      let matchesDeadline = true;
      if (deadlineFilter === "none") matchesDeadline = !search.deadline;
      else if (deadlineFilter === "urgent") {
        matchesDeadline = !!search.deadline && (new Date(search.deadline).getTime() - Date.now()) / 86400000 < 3;
      } else if (deadlineFilter === "week") {
        const d = search.deadline ? (new Date(search.deadline).getTime() - Date.now()) / 86400000 : Infinity;
        matchesDeadline = !!search.deadline && d < 7;
      }
      return matchesQuery && matchesUrgency && matchesBudget && matchesDeadline;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "relevance":
          return relevanceScore(b, searchQuery) - relevanceScore(a, searchQuery);
        case "price-asc":
          return (a.budget_min || 0) - (b.budget_min || 0);
        case "price-desc":
          return (b.budget_max || b.budget_min || 0) - (a.budget_max || a.budget_min || 0);
        case "urgency-asc":
          return (urgencyOrder[a.urgency || "normal"] || 5) - (urgencyOrder[b.urgency || "normal"] || 5);
        case "urgency-desc":
          return (urgencyOrder[b.urgency || "normal"] || 5) - (urgencyOrder[a.urgency || "normal"] || 5);
        case "deadline-asc": {
          if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          if (a.deadline && !b.deadline) return -1;
          if (!a.deadline && b.deadline) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        case "recent":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const NAVY = "#070E42";
  const GOLD_ACCENT = "#D9BB87";
  const pillBase: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    padding: "8px 14px",
    borderRadius: 999,
    background: "#FFFFFF",
    border: "1px solid #E5E0D6",
    color: "#1B2A4A",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  };
  const pillActive: React.CSSProperties = {
    ...pillBase,
    background: NAVY,
    color: GOLD_ACCENT,
    border: `1px solid ${NAVY}`,
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4">
              Recherches actives
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Parcours les demandes des buyrs et propose tes trouvailles pour gagner des commissions
            </p>
          </motion.div>

          {/* Free text search (kept for typing on the page) */}
          <div className="relative mb-4 max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un objet, une marque…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!sortTouched && e.target.value) setSortBy("relevance");
              }}
              className="h-12 pl-12 rounded-full"
            />
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-3">
            {filteredAndSortedSearches.length} recherche{filteredAndSortedSearches.length > 1 ? "s" : ""} trouvée{filteredAndSortedSearches.length > 1 ? "s" : ""}
          </p>

          {/* Toolbar */}
          <div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8E2D9",
              borderRadius: 16,
              padding: "12px 14px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            {/* Left: filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category */}
              <Popover>
                <PopoverTrigger asChild>
                  <button style={selectedCategory !== "Toutes" ? pillActive : pillBase}>
                    <Tag className="w-3.5 h-3.5" />
                    {selectedCategory === "Toutes" ? "Catégorie" : selectedCategory}
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted"
                      style={{
                        background: selectedCategory === cat ? "#F5F1E8" : "transparent",
                        color: "#1B2A4A",
                        fontWeight: selectedCategory === cat ? 600 : 400,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Budget */}
              <Popover>
                <PopoverTrigger asChild>
                  <button style={budgetTouched ? pillActive : pillBase}>
                    <Wallet className="w-3.5 h-3.5" />
                    {budgetTouched ? `${budgetRange[0]}€ – ${budgetRange[1]}€` : "Budget"}
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">Fourchette de budget</span>
                    {budgetTouched && (
                      <button
                        onClick={() => { setBudgetTouched(false); setBudgetRange([0, 5000]); }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>
                  <Slider
                    min={0}
                    max={5000}
                    step={50}
                    value={budgetRange}
                    onValueChange={(v) => { setBudgetRange([v[0], v[1]] as [number, number]); setBudgetTouched(true); }}
                  />
                  <div className="flex justify-between mt-3 text-sm font-medium" style={{ color: "#1B2A4A" }}>
                    <span>{budgetRange[0]}€</span>
                    <span>{budgetRange[1]}€{budgetRange[1] === 5000 ? "+" : ""}</span>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Deadline */}
              <Popover>
                <PopoverTrigger asChild>
                  <button style={deadlineFilter !== "all" ? pillActive : pillBase}>
                    <Clock className="w-3.5 h-3.5" />
                    {deadlineFilter === "all" && "Délai"}
                    {deadlineFilter === "urgent" && "Urgent <3j"}
                    {deadlineFilter === "week" && "Cette semaine"}
                    {deadlineFilter === "none" && "Sans échéance"}
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-1">
                  {([
                    { v: "all", label: "Toutes" },
                    { v: "urgent", label: "Urgent < 3 jours" },
                    { v: "week", label: "Cette semaine" },
                    { v: "none", label: "Sans échéance" },
                  ] as { v: DeadlineFilter; label: string }[]).map((o) => (
                    <button
                      key={o.v}
                      onClick={() => setDeadlineFilter(o.v)}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted"
                      style={{
                        background: deadlineFilter === o.v ? "#F5F1E8" : "transparent",
                        color: "#1B2A4A",
                        fontWeight: deadlineFilter === o.v ? 600 : 400,
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {(selectedCategory !== "Toutes" || budgetTouched || deadlineFilter !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory("Toutes");
                    setBudgetTouched(false);
                    setBudgetRange([0, 5000]);
                    setDeadlineFilter("all");
                    setSearchQuery("");
                  }}
                  style={{ ...pillBase, border: "none", background: "transparent", color: "#8A7A4C" }}
                >
                  <X className="w-3.5 h-3.5" /> Réinitialiser
                </button>
              )}
            </div>

            {/* Right: sort */}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 12, color: "#6B6355", fontWeight: 500 }}>Trier par</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button style={pillActive}>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {sortBy === "relevance" && "Pertinence"}
                    {sortBy === "recent" && "Plus récent"}
                    {sortBy === "price-asc" && "Prix croissant"}
                    {sortBy === "price-desc" && "Prix décroissant"}
                    {sortBy === "deadline-asc" && "Échéance proche"}
                    {sortBy === "urgency-asc" && "Délai le plus court"}
                    {sortBy === "urgency-desc" && "Délai le plus long"}
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-1">
                  {([
                    { v: "relevance", label: "Pertinence", show: !!searchQuery },
                    { v: "recent", label: "Plus récent", show: true },
                    { v: "price-asc", label: "Prix croissant", show: true },
                    { v: "price-desc", label: "Prix décroissant", show: true },
                    { v: "deadline-asc", label: "Échéance proche", show: true },
                  ] as { v: SortOption; label: string; show: boolean }[])
                    .filter((o) => o.show)
                    .map((o) => (
                      <button
                        key={o.v}
                        onClick={() => { setSortBy(o.v); setSortTouched(true); }}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted"
                        style={{
                          background: sortBy === o.v ? "#F5F1E8" : "transparent",
                          color: "#1B2A4A",
                          fontWeight: sortBy === o.v ? 600 : 400,
                        }}
                      >
                        {o.label}
                      </button>
                    ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>



          {/* Loading state */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredAndSortedSearches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Aucune recherche trouvée</p>
              <Button onClick={() => navigate("/poster")}>Poster ma recherche</Button>
            </div>
          )}

          {/* Search Grid */}
          {!loading && filteredAndSortedSearches.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedSearches.map((search, index) => {
                const initials = (search.profiles?.full_name || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  onClick={() => navigate(`/recherche/${search.id}`)}
                  className="group cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E8E2D9",
                    borderRadius: "14px",
                    overflow: "hidden",
                  }}
                  whileHover={{
                    boxShadow: "0 6px 20px rgba(27,42,74,0.10)",
                  }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-secondary">
                    <div className="absolute top-2.5 left-2.5 z-10" onClick={(e) => e.stopPropagation()}>
                      <FavoriteButton searchId={search.id} />
                    </div>
                    <SearchImageCarousel
                      images={[
                        ...(search.image_urls?.length ? search.image_urls : search.image_url ? [search.image_url] : []),
                      ]}
                      alt={search.title}
                    />

                    {/* Category badge — top right */}
                    <span
                      className="absolute"
                      style={{
                        top: "10px",
                        right: "10px",
                        backgroundColor: "#070E42",
                        color: "#FFFFFF",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        padding: "5px 12px",
                        borderRadius: "20px",
                        zIndex: 5,
                      }}
                    >
                      {search.category}
                    </span>

                    {/* Deadline badge — bottom left */}
                    {(() => {
                      const d = getDeadlineBadge(search.deadline);
                      if (!d) return null;
                      return (
                        <span
                          className="absolute flex items-center"
                          style={{
                            bottom: "10px",
                            left: "10px",
                            backgroundColor: d.bg,
                            color: d.color,
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: "20px",
                            gap: "4px",
                            zIndex: 5,
                          }}
                        >
                          <Clock style={{ width: "12px", height: "12px" }} />
                          {d.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Content */}
                  <div style={{ padding: "14px 16px 12px" }}>
                    <h3
                      className="truncate"
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#1B2A4A",
                        marginBottom: "8px",
                      }}
                    >
                      {search.title}
                    </h3>

                    {/* Budget */}
                    <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", color: "#8A7A4C", textTransform: "uppercase" }}>
                      Budget
                    </span>
                    <div className="flex items-center" style={{ gap: "4px", marginTop: "2px" }}>
                      <Euro style={{ width: "13px", height: "13px", color: "#C9A84C" }} />
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#1B2A4A" }}>
                        {formatBudget(search.budget_min, search.budget_max)}
                      </span>
                    </div>

                    {/* Divider */}
                    <div style={{ height: "1px", backgroundColor: "#EEE8DF", margin: "10px 0" }} />

                    {/* Footer */}
                    <div
                      className="flex items-center justify-between"
                      style={{ height: "36px" }}
                    >
                      {/* Author */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profil/${search.user_id}`);
                        }}
                        className="flex items-center hover:opacity-80 transition-opacity"
                        style={{ gap: "7px" }}
                      >
                        {search.profiles?.avatar_url ? (
                          <img
                            src={search.profiles.avatar_url}
                            alt={search.profiles.full_name || "User"}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                              if (fallback) fallback.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <span
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: "#1B2A4A",
                            color: "#C9A84C",
                            fontSize: "11px",
                            fontWeight: 600,
                            display: search.profiles?.avatar_url ? "none" : "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {initials}
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#1B2A4A" }}>
                          {search.profiles?.full_name || "Utilisateur"}
                        </span>
                      </button>
                    </div>

                    {/* Proposal count / CTA */}
                    <div style={{ marginTop: "8px", fontSize: "12px" }}>
                      {(proposalCounts[search.id] || 0) > 0 ? (
                        <span style={{ color: "#1B2A4A" }}>
                          {proposalCounts[search.id]} proposition{proposalCounts[search.id] > 1 ? "s" : ""} déjà reçue{proposalCounts[search.id] > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span style={{ color: "#C9A84C", fontStyle: "italic" }}>
                          Sois le premier findr à proposer →
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}

          {!loading && hasMore && (
            <div className="flex justify-center mt-10">
              <Button
                onClick={() => fetchSearches(false)}
                disabled={loadingMore}
                size="lg"
                style={{ backgroundColor: "#070E42", color: "#F5F0EA" }}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Charger plus"
                )}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Searches;
