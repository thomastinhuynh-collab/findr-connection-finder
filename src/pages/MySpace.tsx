import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Star, Search, Plus, Settings, LogOut, Crown, Wallet, Package, Heart, Clock, Euro, MapPin, Pencil, MoreHorizontal, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import PremiumWallet from "@/components/PremiumWallet";
import SearchCardAccordion from "@/components/SearchCardAccordion";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
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
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [walletBalance] = useState(155.50);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [gamificationEnabled, setGamificationEnabled] = useState(false);
  const [hasProposals, setHasProposals] = useState(false);
  const [hasCommission, setHasCommission] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", bio: "", city: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [activePanel, setActivePanel] = useState<null | "favorites" | "wallet" | "evaluations">(null);
  const togglePanel = (p: "favorites" | "wallet" | "evaluations") =>
    setActivePanel((cur) => (cur === p ? null : p));

  const openEditProfile = () => {
    setEditForm({
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      city: profile?.city || "",
    });
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name.trim() || null,
          bio: editForm.bio.trim() || null,
          city: editForm.city.trim() || null,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      await fetchProfile();
      toast({ title: "Profil mis à jour" });
      setEditOpen(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

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
      fetchGamificationFlag();
      fetchActivityFlags();
    }
  }, [user]);

  const fetchGamificationFlag = async () => {
    const { data } = await (supabase as any)
      .from("app_settings")
      .select("gamification_enabled")
      .maybeSingle();
    if (data) setGamificationEnabled(!!data.gamification_enabled);
  };

  const fetchActivityFlags = async () => {
    if (!user) return;
    const { count: propCount } = await supabase
      .from("proposals")
      .select("*", { count: "exact", head: true })
      .eq("findr_id", user.id);
    setHasProposals((propCount || 0) > 0);
    const { count: comCount } = await supabase
      .from("proposals")
      .select("*", { count: "exact", head: true })
      .eq("findr_id", user.id)
      .eq("status", "completed");
    setHasCommission((comCount || 0) > 0);
  };

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
      const now = Date.now();
      const searchesWithCounts = await Promise.all(
        data.map(async (search) => {
          const { data: props } = await supabase
            .from("proposals")
            .select("status, updated_at")
            .eq("search_id", search.id);

          const proposals = props || [];
          const proposalCount = proposals.length;
          const unreadCount = proposals.filter((p) => p.status === "pending").length;
          const acceptedCount = proposals.filter(
            (p) => p.status === "accepted_pending" || p.status === "completed"
          ).length;
          const paymentPending = proposals.some((p) => p.status === "accepted_pending");
          const completed = proposals
            .filter((p) => p.status === "completed")
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

          const { data: reservations } = await supabase
            .from("reservations")
            .select("created_at, status")
            .eq("search_id", search.id)
            .eq("status", "pending");

          const reservationRows = reservations || [];
          const hasRecentReservation = reservationRows.some(
            (r) => now - new Date(r.created_at).getTime() < 48 * 3600 * 1000
          );

          const urgent_reason: "reservation_pending" | "payment_pending" | null =
            hasRecentReservation
              ? "reservation_pending"
              : paymentPending
              ? "payment_pending"
              : null;

          return {
            ...search,
            proposal_count: proposalCount,
            unread_count: unreadCount,
            accepted_count: acceptedCount,
            completed_at: completed?.updated_at || null,
            reservation_count: reservationRows.length,
            urgent_reason,
          };
        })
      );

      // Sort: urgent first, then unread, then most recent
      searchesWithCounts.sort((a, b) => {
        const aU = a.urgent_reason ? 2 : (a.unread_count || 0) > 0 ? 1 : 0;
        const bU = b.urgent_reason ? 2 : (b.unread_count || 0) > 0 ? 1 : 0;
        if (aU !== bU) return bU - aU;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

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
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Fichier trop lourd", description: "Max 8 Mo", variant: "destructive" });
      return;
    }
    setUploadingBanner(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/banner-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("search-images").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("search-images").getPublicUrl(path);
      const { error: updErr } = await (supabase.from("profiles") as any).update({ banner_url: pub.publicUrl }).eq("user_id", user.id);
      if (updErr) throw updErr;
      await fetchProfile();
      toast({ title: "Bannière mise à jour" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  const handleRemoveBanner = async () => {
    if (!user) return;
    const { error } = await (supabase.from("profiles") as any).update({ banner_url: null }).eq("user_id", user.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    await fetchProfile();
    toast({ title: "Bannière supprimée" });
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
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
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
              const firstLetter = (profile.full_name?.trim().charAt(0) || user.email?.charAt(0) || "U").toUpperCase();
              return (
            <div
              className="relative mb-8"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                border: "1px solid rgba(10,22,40,0.08)",
                overflow: "hidden",
              }}
            >
              {/* Hidden banner input */}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />

              {/* Banner area — slim, default brand gradient */}
              <div
                className="relative w-full group/banner"
                style={{
                  height: 90,
                  background: profile.banner_url
                    ? undefined
                    : "linear-gradient(120deg, #0A1628 0%, #132a4d 100%)",
                }}
              >
                {profile.banner_url && (
                  <img
                    src={profile.banner_url}
                    alt="Bannière de profil"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: profile.banner_url
                      ? "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(10,22,40,0.35) 100%)"
                      : "radial-gradient(ellipse at top right, rgba(217,187,135,0.14), transparent 60%)",
                  }}
                />
                <div className="absolute flex gap-2" style={{ top: 10, right: 12, zIndex: 3 }}>
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="inline-flex items-center gap-1.5 transition-all"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.92)",
                      color: "#0A1628",
                      border: "1px solid rgba(10,22,40,0.1)",
                      fontSize: 12,
                      padding: "5px 11px",
                      borderRadius: 999,
                      fontWeight: 500,
                      cursor: "pointer",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Pencil className="w-3 h-3" />
                    {uploadingBanner
                      ? "Envoi…"
                      : profile.banner_url
                      ? "Changer la bannière"
                      : "Ajouter une bannière"}
                  </button>
                  {profile.banner_url && (
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="transition-all"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.92)",
                        color: "#8B3A2E",
                        border: "1px solid rgba(10,22,40,0.1)",
                        fontSize: 12,
                        padding: "5px 11px",
                        borderRadius: 999,
                        fontWeight: 500,
                        cursor: "pointer",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      Retirer
                    </button>
                  )}
                </div>
              </div>

              <div className="relative" style={{ padding: 32, paddingTop: 24 }}>
              {/* Decorative watermark letter — centered behind name/bio block */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: -30,
                  right: 24,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 110,
                  lineHeight: 1,
                  color: "rgba(10,22,40,0.035)",
                  pointerEvents: "none",
                  userSelect: "none",
                  zIndex: 0,
                }}
              >
                {firstLetter}
              </span>

              <div className="relative flex flex-col md:flex-row items-start gap-6" style={{ zIndex: 1 }}>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />

              {/* Avatar with hover overlay — pulled up to overlap banner */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Changer ma photo"
                className="group relative flex-shrink-0 rounded-full overflow-hidden"
                style={{ width: 108, height: 108, marginTop: -76 }}
              >
                <Avatar className="w-[108px] h-[108px]" style={{ border: '4px solid #FFFFFF', boxShadow: '0 0 0 3px #D9BB87' }}>
                  <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback
                    style={{
                      backgroundColor: '#0A1628',
                      color: '#D9BB87',
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontStyle: 'italic',
                      fontWeight: 700,
                      fontSize: 44,
                    }}
                  >
                    {firstLetter}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  style={{ backgroundColor: 'rgba(10,22,40,0.6)' }}
                >
                  <Pencil className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                </div>
              </button>




              <div className="flex-1 min-w-0">
                {/* a. Name + status badges + email verified */}
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
                  {(user as any)?.email_confirmed_at && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        color: '#1B7A4A',
                        backgroundColor: 'rgba(27,122,74,0.08)',
                        border: '1px solid rgba(27,122,74,0.25)',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontWeight: 500,
                      }}
                    >
                      ✓ Email vérifié
                    </span>
                  )}
                </div>

                {/* b. Rating line */}
                <div className="flex items-center gap-2 mt-2">
                  {evaluations.length === 0 ? (
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>Pas encore d'avis</span>
                  ) : (
                    <>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4"
                            style={{
                              color: i < Math.round(Number(averageRating)) ? '#D9BB87' : '#E5E1D8',
                              fill: i < Math.round(Number(averageRating)) ? '#D9BB87' : 'transparent',
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0A1628' }}>
                        {averageRating}
                      </span>
                      <span className="text-xs" style={{ color: '#6B7280' }}>
                        ({evaluations.length} avis)
                      </span>
                    </>
                  )}
                </div>

                {/* c. À propos — bio */}
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
                        onClick={openEditProfile}
                        className="mt-3 transition-colors"
                        style={{
                          backgroundColor: '#D9BB87',
                          border: '1.5px solid #D9BB87',
                          color: '#0A1628',
                          fontSize: 12,
                          borderRadius: 999,
                          padding: '6px 16px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + Ajouter ma bio
                      </button>
                    </div>
                  )}
                </div>

                {/* d. Dominant category tag */}
                {(() => {
                  if (searches.length === 0) return null;
                  const counts: Record<string, number> = {};
                  for (const s of searches) counts[s.category] = (counts[s.category] || 0) + 1;
                  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
                  if (!dominant) return null;
                  return (
                    <div className="mt-3">
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 11,
                          color: '#0A1628',
                          backgroundColor: '#F5F1E8',
                          border: '1px solid #E5DFD1',
                          padding: '4px 12px',
                          borderRadius: 999,
                          fontWeight: 500,
                        }}
                      >
                        <span style={{ color: '#D9BB87' }}>◆</span>
                        Catégorie favorite · {dominant}
                      </span>
                    </div>
                  );
                })()}

                {/* e. Secondary metadata line */}
                {(() => {
                  const memberSince = (profile as any).created_at
                    ? new Date((profile as any).created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                    : null;
                  return (
                    <div
                      className="mt-4 flex flex-wrap items-center text-sm"
                      style={{ gap: 16, color: '#6B6259' }}
                    >
                      <span style={{ fontSize: 13 }}>
                        <span style={{ fontWeight: 600, color: '#0A1628' }}>{searches.length}</span>
                        <span style={{ color: '#9A8570', marginLeft: 4 }}>
                          {searches.length > 1 ? 'recherches actives' : 'recherche active'}
                        </span>
                      </span>
                      {profile.city && (
                        <span className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
                          <MapPin className="w-3.5 h-3.5" style={{ color: '#D9BB87' }} />
                          {profile.city}
                        </span>
                      )}
                      {memberSince && (
                        <span style={{ fontSize: 12, color: '#9A8570' }}>
                          Membre depuis <span style={{ color: '#6B6259', fontWeight: 500 }}>{memberSince}</span>
                        </span>
                      )}
                      {gamificationEnabled && (
                        <span className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
                          <Clock className="w-3.5 h-3.5" style={{ color: '#D9BB87' }} />
                          Niveau {profile.level} · {profile.xp_points} XP
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Profile completion (kept, hidden at 100%) */}
                {gamificationEnabled ? (
                  <div className="mt-3" style={{ maxWidth: 340 }}>
                    <div style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: '#E8E2D9', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #D9BB87, #c9a876)', transition: 'width 0.3s ease' }} />
                    </div>
                    <p style={{ fontSize: 11, color: '#9A8F84', marginTop: 4 }}>
                      {xpInLevel} / {xpPerLevel} XP pour le Niveau {profile.level + 1}
                    </p>
                  </div>
                ) : (() => {
                  const fields = [profile.avatar_url, profile.bio, profile.city, profile.full_name];
                  const filled = fields.filter(Boolean).length;
                  const pct = Math.round((filled / fields.length) * 100);
                  const missing: string[] = [];
                  if (!profile.avatar_url) missing.push("une photo");
                  if (!profile.bio) missing.push("une bio");
                  if (pct >= 100) return null;
                  return (
                    <div className="mt-3" style={{ maxWidth: 340 }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#0A1628', fontWeight: 600 }}>
                          Profil complété à {pct}%
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: '#E8E2D9', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #D9BB87, #c9a876)', transition: 'width 0.3s ease' }} />
                      </div>
                      {missing.length > 0 && (
                        <p style={{ fontSize: 11, color: '#9A8F84', marginTop: 6 }}>
                          Ajoute {missing.join(" + ")} pour rassurer les chineurs.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* f. Edit profile button — bottom */}
                <button
                  type="button"
                  onClick={openEditProfile}
                  className="mt-5 inline-flex items-center gap-1.5 transition-colors"
                  style={{
                    border: '1.5px solid #0A1628',
                    color: '#0A1628',
                    fontSize: 12,
                    padding: '6px 16px',
                    borderRadius: 999,
                    backgroundColor: 'transparent',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Pencil className="w-3 h-3" />
                  Modifier mon profil
                </button>
              </div>
              </div>

              </div>


              {/* Top-right discreet menu */}
              <div className="absolute" style={{ top: 196, right: 12, zIndex: 4 }}>

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
                    <DropdownMenuItem onClick={openEditProfile}>
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
                  value="favorites"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 pt-2 pb-3 text-sm font-medium inline-flex items-center gap-1.5"
                  style={{ color: '#6B7280' }}
                >
                  Favoris
                </TabsTrigger>
                {hasProposals && (
                  <button
                    type="button"
                    onClick={() => navigate("/mes-propositions")}
                    className="rounded-none border-b-2 border-transparent px-3 pt-2 pb-3 text-sm font-medium inline-flex items-center gap-1.5 bg-transparent"
                    style={{ color: '#6B7280' }}
                  >
                    Mes propositions
                  </button>
                )}
                <TabsTrigger
                  value="wallet"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 pt-2 pb-3 text-sm font-medium inline-flex items-center gap-1.5"
                  style={{ color: '#6B7280' }}
                >
                  <Wallet className="w-4 h-4" />
                  Portefeuille
                </TabsTrigger>
                <TabsTrigger
                  value="evaluations"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 pt-2 pb-3 text-sm font-medium inline-flex items-center gap-1.5"
                  style={{ color: '#6B7280' }}
                >
                  Évaluations
                </TabsTrigger>
              </TabsList>


              <TabsContent value="searches" className="mt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0A1628" }}>
                      Mes recherches en cours
                    </h2>
                    <div style={{ width: 60, height: 2, backgroundColor: "#D9BB87", borderRadius: 2, marginTop: 8 }} />
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#0A1628' }}>Modifier mon profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nom complet</Label>
              <Input
                id="edit-name"
                value={editForm.full_name}
                onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Ton nom"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-city">Ville</Label>
              <Input
                id="edit-city"
                value={editForm.city}
                onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Paris, Lyon…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editForm.bio}
                onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Présente-toi à la communauté…"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs" style={{ color: '#9A8F84' }}>
                {editForm.bio.length}/500
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingProfile}>
              Annuler
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              style={{ backgroundColor: '#0A1628', color: '#F5F0EA' }}
            >
              {savingProfile ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MySpace;
