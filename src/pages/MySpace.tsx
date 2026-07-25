import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Star, Search, Plus, Settings, LogOut, Crown, Wallet, Package, Heart, Clock, Euro, MapPin, Pencil, MoreHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import PremiumWallet from "@/components/PremiumWallet";
import SearchCardAccordion from "@/components/SearchCardAccordion";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_findr: boolean;
  is_premium: boolean | null;
  xp_points: number;
  level: number;
  city: string | null;
}

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

interface Evaluation {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  from_user: {
    full_name: string | null;
  } | null;
}

const mockTransactions = [
  { id: "1", type: "credit" as const, amount: 25.00, description: "Vente recherche #127", date: "15 Jan 2026" },
  { id: "2", type: "debit" as const, amount: 15.00, description: "Abonnement Premium", date: "10 Jan 2026" },
  { id: "3", type: "credit" as const, amount: 45.50, description: "Vente recherche #125", date: "5 Jan 2026" },
];

const MySpace = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [walletBalance] = useState(155.50);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [gamificationEnabled, setGamificationEnabled] = useState(false);
  const [hasProposals, setHasProposals] = useState(false);
  const [hasCommission, setHasCommission] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSearches();
      fetchEvaluations();
      fetchFavorites();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) setProfile(data as any);
  };

  const fetchSearches = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) {
      const searchesWithCounts = await Promise.all(
        data.map(async (search) => {
          const { count: proposalCount } = await supabase
            .from("proposals")
            .select("*", { count: "exact", head: true })
            .eq("search_id", search.id)
            .eq("status", "pending");

          const { count: reservationCount } = await supabase
            .from("reservations")
            .select("*", { count: "exact", head: true })
            .eq("search_id", search.id)
            .eq("status", "pending");
          
          return { 
            ...search, 
            proposal_count: proposalCount || 0,
            reservation_count: reservationCount || 0
          };
        })
      );
      setSearches(searchesWithCounts);
    }
  };

  const fetchEvaluations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("evaluations")
      .select(`
        *,
        from_user:profiles!evaluations_from_user_id_fkey(full_name)
      `)
      .eq("to_user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setEvaluations(data as any);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data: favData } = await supabase
      .from("favorites")
      .select("search_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (favData && favData.length > 0) {
      const searchIds = favData.map(f => f.search_id);
      const { data: searchesData } = await supabase
        .from("searches")
        .select("id, title, description, category, budget_min, budget_max, urgency, image_url, user_id")
        .in("id", searchIds);

      if (searchesData) {
        const userIds = [...new Set(searchesData.map(s => s.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, city")
          .in("user_id", userIds);

        const cityMap = new Map(profiles?.map(p => [p.user_id, p.city]) || []);
        
        const enriched = searchesData.map(s => ({
          ...s,
          city: cityMap.get(s.user_id) || "France",
        }));
        setFavorites(enriched);
      }
    } else {
      setFavorites([]);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Fichier trop lourd", description: "Max 5 Mo", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("search-images").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("search-images").getPublicUrl(path);
      const { error: updErr } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("user_id", user.id);
      if (updErr) throw updErr;
      await fetchProfile();
      toast({ title: "Photo mise à jour" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#112150' }}></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const averageRating = evaluations.length > 0
    ? (evaluations.reduce((acc, e) => acc + e.rating, 0) / evaluations.length).toFixed(1)
    : "N/A";

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="px-6 md:px-12 lg:px-16 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Profile Header */}
            {(() => {
              const xpPerLevel = 500;
              const currentLevelXp = (profile.level - 1) * xpPerLevel;
              const nextLevelXp = profile.level * xpPerLevel;
              const xpInLevel = Math.max(0, profile.xp_points - currentLevelXp);
              const progressPct = Math.min(100, (xpInLevel / xpPerLevel) * 100);
              return (
            <div className="relative flex flex-col md:flex-row items-start gap-6 mb-8">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />

              {/* Avatar with hover overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Changer ma photo"
                className="group relative flex-shrink-0 rounded-full overflow-hidden"
                style={{ width: 80, height: 80 }}
              >
                <Avatar className="w-20 h-20 border-2" style={{ borderColor: '#D9BD8B' }}>
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl font-bold" style={{ backgroundColor: '#112150', color: '#F5F0EA' }}>
                    {profile.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  style={{ backgroundColor: 'rgba(27,42,74,0.6)' }}
                >
                  <Pencil className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                </div>
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-display font-bold" style={{ color: '#1B2A4A' }}>
                    {profile.full_name || "Utilisateur"}
                  </h1>
                  {profile.is_premium && (
                    <Badge style={{ backgroundColor: '#D9BD8B', color: '#112150' }}>
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {profile.is_findr && (
                    <Badge style={{ backgroundColor: '#112150', color: '#F5F0EA' }}>findr</Badge>
                  )}
                </div>

                {/* Rating: badge "Nouveau membre" if 0 evals, else stars */}
                <div className="flex items-center gap-2 mt-2">
                  {evaluations.length === 0 ? (
                    <span
                      style={{
                        backgroundColor: '#EEF2FF',
                        color: '#3B4F8C',
                        fontSize: 11,
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontWeight: 500,
                      }}
                    >
                      Nouveau membre
                    </span>
                  ) : (
                    <>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(Number(averageRating))
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: '#6B7280' }}>
                        ({evaluations.length} évaluation{evaluations.length !== 1 ? 's' : ''})
                      </span>
                    </>
                  )}
                </div>

                {/* City + Level row */}
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm" style={{ color: '#4B5563' }}>
                  {profile.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: '#D9BD8B' }} />
                      <span>{profile.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: '#D9BD8B' }} />
                    <span>Niveau {profile.level} · {profile.xp_points} XP</span>
                  </div>
                </div>

                {/* XP progress bar */}
                <div className="mt-2">
                  <div
                    style={{
                      width: 200,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#E8E2D9',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${progressPct}%`,
                        height: '100%',
                        backgroundColor: '#C9A84C',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: '#9A8F84', marginTop: 4 }}>
                    {xpInLevel} / {xpPerLevel} XP pour le Niveau {profile.level + 1}
                  </p>
                </div>

                {/* Edit profile button — inline */}
                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1.5 transition-colors"
                  style={{
                    border: '1.5px solid #1B2A4A',
                    color: '#1B2A4A',
                    fontSize: 12,
                    padding: '5px 14px',
                    borderRadius: 7,
                    backgroundColor: 'transparent',
                  }}
                >
                  <Pencil className="w-3 h-3" />
                  Modifier mon profil
                </button>

                {/* À propos */}
                <div className="mt-5">
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#D9BD8B', letterSpacing: '0.08em' }}
                  >
                    À propos
                  </h3>
                  {profile.bio ? (
                    <div
                      className="rounded-xl p-5"
                      style={{ backgroundColor: '#FAF7F2', border: '1px solid #ECE6DA' }}
                    >
                      <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                        {profile.bio}
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1.5px dashed #D4CCBC',
                        borderRadius: 10,
                        padding: 16,
                      }}
                    >
                      <p style={{ fontSize: 13, color: '#6B6259', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>✏️</span>
                        Ajoute une bio pour te présenter à la communauté
                      </p>
                      <button
                        type="button"
                        className="mt-3 transition-colors"
                        style={{
                          backgroundColor: 'transparent',
                          border: '1.5px solid #C9A84C',
                          color: '#C9A84C',
                          fontSize: 12,
                          borderRadius: 7,
                          padding: '6px 16px',
                          fontWeight: 500,
                        }}
                      >
                        + Ajouter ma bio
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Top-right discreet menu */}
              <div className="absolute top-0 right-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="p-2 rounded-md hover:bg-muted transition-colors"
                      style={{ color: '#6B6259' }}
                      aria-label="Plus d'options"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Paramètres du compte
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} style={{ color: '#DC2626' }}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
              );
            })()}

            {/* Separator */}
            <div className="border-b mb-6" style={{ borderColor: '#E5E1D8' }} />

            {/* Tabs */}
            <Tabs defaultValue="searches" className="w-full">
              <TabsList
                className="flex w-auto justify-start gap-2 bg-transparent border-b rounded-none h-auto p-0"
                style={{ borderColor: '#E5E1D8' }}
              >
                <TabsTrigger
                  value="searches"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 text-sm font-medium"
                  style={{ color: '#6B7280' }}
                >
                  Annonces
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 text-sm font-medium flex items-center gap-1.5"
                  style={{ color: '#6B7280' }}
                >
                  Favoris
                </TabsTrigger>
                <TabsTrigger
                  value="wallet"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 text-sm font-medium flex items-center gap-1.5"
                  style={{ color: '#6B7280' }}
                >
                  Portefeuille
                </TabsTrigger>
                <TabsTrigger
                  value="evaluations"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-3 text-sm font-medium"
                  style={{ color: '#6B7280' }}
                >
                  Évaluations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="searches" className="mt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#9A8F84",
                        fontWeight: 500,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      MON ESPACE
                    </span>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1B2A4A" }}>
                      Mes recherches en cours
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    {profile.is_findr && (
                      <Button variant="outline" asChild size="sm" style={{ borderColor: '#D9BD8B', color: '#112150' }}>
                        <Link to="/mes-propositions">
                          <Package className="w-4 h-4 mr-2" />
                          Mes propositions
                        </Link>
                      </Button>
                    )}
                    <Link
                      to="/poster"
                      className="inline-flex items-center transition-colors"
                      style={{
                        backgroundColor: "#1B2A4A",
                        color: "#FFFFFF",
                        borderRadius: 8,
                        padding: "10px 18px",
                        fontSize: 13,
                        fontWeight: 500,
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#243d6b")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1B2A4A")}
                    >
                      <span style={{ fontSize: 16, marginRight: 6, lineHeight: 1 }}>+</span>
                      Poster une recherche
                    </Link>
                  </div>
                </div>

                {searches.length === 0 ? (
                  <div className="py-16 text-center">
                    <Search className="w-12 h-12 mx-auto mb-4" style={{ color: '#D9BD8B' }} />
                    <p style={{ color: '#6B7280' }}>Aucune recherche pour le moment</p>
                    <Button asChild className="mt-4" size="sm" style={{ backgroundColor: '#112150', color: '#F5F0EA' }}>
                      <Link to="/poster">Poster ma première recherche</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {searches.map((search) => (
                      <SearchCardAccordion
                        key={search.id}
                        search={search}
                        onDataChange={fetchSearches}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="wallet" className="mt-6">
                <PremiumWallet 
                  balance={walletBalance}
                  isPremium={profile?.is_premium || false}
                  transactions={mockTransactions}
                  onAddFunds={() => navigate("/premium")}
                />
              </TabsContent>

              <TabsContent value="favorites" className="mt-6">
                {favorites.length === 0 ? (
                  <div className="py-16 text-center">
                    <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: '#D9BD8B' }} />
                    <p style={{ color: '#6B7280' }}>Aucun favori pour le moment</p>
                    <Button asChild className="mt-4" size="sm" style={{ backgroundColor: '#112150', color: '#F5F0EA' }}>
                      <Link to="/recherches">Parcourir les annonces</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map((search) => (
                      <div
                        key={search.id}
                        className="flex rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-white border"
                        style={{ borderColor: '#E5E1D8' }}
                        onClick={() => navigate(`/recherche/${search.id}`)}
                      >
                        {search.image_url && (
                          <div className="w-28 h-28 flex-shrink-0">
                            <img
                              src={search.image_url}
                              alt={search.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-3 flex-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F0EBE3', color: '#8B7355' }}>
                            {search.category}
                          </span>
                          <h3 className="font-semibold text-sm mt-1 line-clamp-1" style={{ color: '#112150' }}>
                            {search.title}
                          </h3>
                          {search.description && (
                            <p className="text-xs line-clamp-1 mt-0.5" style={{ color: '#6B7280' }}>
                              {search.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs mt-2" style={{ color: '#9CA3AF' }}>
                            <span className="flex items-center gap-1">
                              <Euro className="w-3 h-3" />
                              {search.budget_min && search.budget_max
                                ? `${search.budget_min}€ – ${search.budget_max}€`
                                : "Non défini"}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {search.city}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="evaluations" className="mt-6">
                {evaluations.length === 0 ? (
                  <div className="py-16 text-center">
                    <Star className="w-12 h-12 mx-auto mb-4" style={{ color: '#D9BD8B' }} />
                    <p style={{ color: '#6B7280' }}>Aucune évaluation pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {evaluations.map((evaluation) => (
                      <div
                        key={evaluation.id}
                        className="bg-white rounded-lg p-4 border"
                        style={{ borderColor: '#E5E1D8' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < evaluation.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm" style={{ color: '#6B7280' }}>
                            par {evaluation.from_user?.full_name || "Anonyme"}
                          </span>
                        </div>
                        {evaluation.comment && (
                          <p className="text-sm" style={{ color: '#374151' }}>{evaluation.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MySpace;
