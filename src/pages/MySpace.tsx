import { useState, useEffect, useRef } from "react";
import CategoryGlyph from "@/components/CategoryGlyph";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Star, Search, Plus, Crown, Wallet, Package, Heart, Clock, Euro, MapPin, Pencil, CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { pendingEarnings, finalizedSales, profileCompletion } from "@/lib/accountMoney";
import { formatPrice } from "@/lib/fees";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import NegativeBalanceBanner from "@/components/NegativeBalanceBanner";
import KeywordAlertsPanel from "@/components/KeywordAlertsPanel";
import TranslatedContent from "@/components/TranslatedContent";
import { isComingSoonCategory } from "@/lib/categories";
import { needsStripeOnboarding, shouldShowStripeActionBadge } from "@/lib/stripeOnboarding";
import { shouldShowShipFromActionBadge } from "@/lib/shipFrom";
import { buyrMustProvideLabel } from "@/lib/buyrLabelAction";
import { awaitsDeliveryChoice } from "@/lib/deliveryChoice";
import ShipFromCard from "@/components/ShipFromCard";
import { EmptySection, LoadError, RowSkeletons } from "@/components/MySpaceStates";
import TodoNowBlock, { useTodoItems, ACCOUNT_TODO_KINDS } from "@/components/TodoNowBlock";
import { resolveMySpaceLocation, MY_SPACE_SECTIONS, type MySpaceSection } from "@/lib/mySpaceSections";
import MySpaceBottomBar from "@/components/MySpaceBottomBar";
import OngoingSalesBlock from "@/components/OngoingSalesBlock";
import { useTranslation } from "react-i18next";
import ContainedPhoto from "@/components/ContainedPhoto";
import BuyrSearchesPanel from "@/components/BuyrSearchesPanel";
import { useUnreadExchanges } from "@/hooks/useUnreadExchanges";
import { todoNavCount } from "@/lib/todoActions";
import { classifySearchTab, excludeWithdrawn } from "@/lib/buyrSearchRows";
import MessageEmailPreference from "@/components/MessageEmailPreference";

type StripeSyncStatus = { complete: boolean; details_submitted: boolean; payouts_enabled: boolean; transfers: string | null };
const FindrEmptyState = ({ text }: { text: string }) => {
  const { t } = useTranslation();
  return (
    <div className="py-12 text-center rounded-xl" style={{ border: "1px dashed #D4CCBC", backgroundColor: "#FAF7F2" }}>
      <p className="mb-4 text-sm max-w-md mx-auto" style={{ color: "#374151" }}>{text}</p>
      <Link to="/je-deviens-findr" className="inline-flex items-center min-h-11 text-sm font-semibold underline-offset-4 hover:underline" style={{ color: "#070E42" }}>
        {t("mySpace.tabs.empty.cta")} →
      </Link>
    </div>
  );
};


interface Profile {
  id: string;
  notify_message_emails?: boolean;
  full_name: string | null;
  ship_from_first_name?: string | null;
  ship_from_last_name?: string | null;
  ship_from_street?: string | null;
  ship_from_postal_code?: string | null;
  ship_from_city?: string | null;
  ship_from_updated_at?: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  is_findr: boolean;
  is_premium: boolean | null;
  xp_points: number;
  level: number;
  city: string | null;
  stripe_account_id?: string | null;
  stripe_onboarding_complete?: boolean | null;
  negative_balance?: number | null;
  payout_hold?: boolean | null;

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
  urgent_reason?: "reservation_pending" | "payment_pending" | "receipt_pending" | "delivery_choice" | "label_pending" | null;
  tab_status?: "active" | "ongoing" | "done" | "cancelled";
  findr_name?: string | null;
  final_amount?: number | null;
  finalized_at?: string | null;
  cancel_reason?: string | null;
  has_invoice?: boolean;
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



const MySpace = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { startOnboarding, loading: stripeLoading } = useStripeConnect();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [stripeVerifying, setStripeVerifying] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<StripeSyncStatus | null>(null);
  const [stripeCompleteBanner, setStripeCompleteBanner] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("findr_stripe_banner") === "show"
  );
  const stripeReturnHandled = useRef(false);
  const stripeAutoSynced = useRef(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [loadingSearches, setLoadingSearches] = useState(true);
  const [searchesError, setSearchesError] = useState(false);
  const [proposalsError, setProposalsError] = useState(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  // Repositionnement de la bannière
  const bannerAreaRef = useRef<HTMLDivElement>(null);
  const bannerFrameRef = useRef<HTMLDivElement>(null);
  const [bannerEditorOpen, setBannerEditorOpen] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [bannerNatural, setBannerNatural] = useState<{ w: number; h: number } | null>(null);
  const [bannerFrame, setBannerFrame] = useState<{ w: number; h: number }>({ w: 600, h: 90 });
  const [bannerOffset, setBannerOffset] = useState({ x: 0, y: 0 });
  const bannerDragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const [gamificationEnabled, setGamificationEnabled] = useState(false);
  const [hasProposals, setHasProposals] = useState(false);
  const [findrActionCount, setFindrActionCount] = useState(0);
  const [actionProposals, setActionProposals] = useState<any[]>([]);
  const searchTabAutoSelected = useRef(false);
  const [findrActionByProposal, setFindrActionByProposal] = useState<Record<string, "dispute" | "ship">>({});
  const [hasCommission, setHasCommission] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", bio: "", city: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [myProposals, setMyProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const PANEL_PAGE_SIZE = 20;
  const [hasMoreProposals, setHasMoreProposals] = useState(false);
  const [loadingMoreProposals, setLoadingMoreProposals] = useState(false);
  const [hasMoreFavorites, setHasMoreFavorites] = useState(false);
  const [loadingMoreFavorites, setLoadingMoreFavorites] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const unreadExchanges = useUnreadExchanges();
  const location = useLocation();
  const resolvedLocation = resolveMySpaceLocation(location.search, location.hash);
  const activeSection: MySpaceSection = resolvedLocation.section;
  const [searchTab, setSearchTab] = useState<"active" | "ongoing" | "done" | "cancelled">("active");
  useEffect(() => {
    if (!resolvedLocation.redirect) return;
    if (resolvedLocation.external) { navigate(resolvedLocation.external, { replace: true }); return; }
    navigate(
      { pathname: "/mon-espace", search: `?${resolvedLocation.search}`, hash: resolvedLocation.hash ? `#${resolvedLocation.hash}` : "" },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.hash]);
  const selectSection = (key: MySpaceSection, hash?: string) => {
    navigate(`/mon-espace?section=${key}${hash ? `#${hash}` : ""}`);
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };
  useEffect(() => {
    const id = resolvedLocation.redirect ? "" : resolvedLocation.hash;
    if (!id || !profile) return;
    const timer = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, activeSection, !!profile]);

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
        } as any)
        .eq("user_id", user.id);
      if (error) throw error;
      await fetchProfile();
      toast({ title: t("mySpace.profileUpdated") });
      setEditOpen(false);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Synchronise l'état de l'inscription Stripe depuis Stripe
  const syncStripeAccount = async (): Promise<StripeSyncStatus | null> => {
    try {
      const { data } = await supabase.functions.invoke("sync-stripe-account");
      if (!data || typeof data.complete !== "boolean") return null;
      setStripeStatus(data);
      return data;
    } catch {
      return null;
    }
  };

  const showStripeBanner = () => {
    sessionStorage.setItem("findr_stripe_banner", "show");
    setStripeCompleteBanner(true);
  };
  const dismissStripeBanner = () => {
    sessionStorage.setItem("findr_stripe_banner", "dismissed");
    setStripeCompleteBanner(false);
  };

  // Vérification : synchro immédiate puis toutes les 3 s pendant 30 s au plus
  const stripeVerifyCancelled = useRef(false);
  const runStripeVerification = async (poll = true) => {
    stripeVerifyCancelled.current = false;
    setStripeVerifying(true);
    const start = Date.now();
    let status = await syncStripeAccount();
    while (poll && !status?.complete && !stripeVerifyCancelled.current && Date.now() - start < 30000) {
      await new Promise((r) => setTimeout(r, 3000));
      if (stripeVerifyCancelled.current) return;
      status = await syncStripeAccount();
    }
    if (stripeVerifyCancelled.current) return;
    await fetchProfile();
    setStripeVerifying(false);
    if (status?.complete) showStripeBanner();
  };

  // Retour depuis l'onboarding Stripe (attend que l'utilisateur soit chargé)
  useEffect(() => {
    if (!user) return;
    const status = new URLSearchParams(window.location.search).get("stripe");
    if (!status) return;
    window.history.replaceState({}, "", "/mon-espace");
    if (status === "success") {
      stripeReturnHandled.current = true;
      runStripeVerification();
      return () => { stripeVerifyCancelled.current = true; setStripeVerifying(false); };
    }
    if (status === "refresh") {
      toast({
        title: t("mySpace.setupIncomplete"),
        description: t("mySpace.setupResume"),
        variant: "destructive",
      });
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Compte Stripe existant mais incomplet à l'ouverture : une synchronisation
  useEffect(() => {
    if (!user || !profile || stripeReturnHandled.current || stripeAutoSynced.current) return;
    if (profile.stripe_account_id && profile.stripe_onboarding_complete !== true) {
      stripeAutoSynced.current = true;
      syncStripeAccount().then((s) => { if (s?.complete) fetchProfile(); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile?.stripe_account_id, profile?.stripe_onboarding_complete]);



  useEffect(() => {
    if (user) {
      lastFocusRefresh.current = Date.now();
      fetchProfile();
      fetchSearches();
      fetchEvaluations();
      fetchFavorites();
      fetchGamificationFlag();
      fetchActivityFlags();
      fetchMyProposals();
      fetchFindrActions();
    }
  }, [user]);

  const fetchGamificationFlag = async () => {
    const { data } = await (supabase as any)
      .from("app_settings")
      .select("gamification_enabled")
      .maybeSingle();
    if (data) setGamificationEnabled(!!data.gamification_enabled);
  };

  const fetchMyProposals = async (from = 0, append = false) => {
    if (!user) return;
    if (append) setLoadingMoreProposals(true);
    else setLoadingProposals(true);
    setProposalsError(false);
    const { data, error: propError } = await supabase
      .from("proposals")
      .select("id, title, description, proposed_price, image_urls, status, created_at, search_id, source_lang")
      .eq("findr_id", user.id)
      .order("created_at", { ascending: false })
      .limit(500);
    if (propError) { setProposalsError(true); setLoadingProposals(false); setLoadingMoreProposals(false); return; }
    const rows = data || [];
    setHasMoreProposals(false);
    const withSearch = await enrichProposals(rows);
    const ids = rows.map((r) => r.id);
    const { data: resRows } = ids.length
      ? await supabase.from("reservations")
          .select("id, proposal_id, payment_status, delivery_type, label_provided_at, label_deadline_at, shipped_at, delivered_at, tracking_review_notified_at, dispute_open, object_price, findr_fee, updated_at")
          .eq("findr_id", user.id).in("proposal_id", ids).order("updated_at", { ascending: false })
      : { data: [] as any[] };
    const resByProposal = new Map<string, any>();
    for (const r of resRows || []) {
      const prev = resByProposal.get(r.proposal_id);
      if (!prev || (prev.payment_status === "annule" && r.payment_status !== "annule")) resByProposal.set(r.proposal_id, r);
    }
    setMyProposals(withSearch.map((p: any) => {
      const r = resByProposal.get(p.id);
      return {
        ...p, proposalStatus: p.status, image_url: p.image_urls?.[0] ?? null, category: p.search?.category ?? null,
        buyr_first_name: p.search?.owner_name ? String(p.search.owner_name).trim().split(/\s+/)[0] : null,
        reservation_id: r?.id ?? null, payment_status: r?.payment_status ?? null, delivery_type: r?.delivery_type ?? null,
        label_provided_at: r?.label_provided_at ?? null, label_deadline_at: r?.label_deadline_at ?? null,
        shipped_at: r?.shipped_at ?? null, delivered_at: r?.delivered_at ?? null,
        tracking_review_notified_at: r?.tracking_review_notified_at ?? null, dispute_open: r?.dispute_open ?? false,
        object_price: r?.object_price ?? null, findr_fee: r?.findr_fee ?? null, reservation_updated_at: r?.updated_at ?? null,
      };
    }));
    setLoadingProposals(false);
    setLoadingMoreProposals(false);
  };

  const enrichProposals = async (rows: any[]) => {
    const searchIds = [...new Set(rows.map((p) => p.search_id))];
    const { data: searchRows } = searchIds.length
      ? await supabase.from("searches").select("id, title, description, source_lang, user_id, category").in("id", searchIds)
      : { data: [] as any[] };
    const ownerIds = [...new Set((searchRows || []).map((r: any) => r.user_id))];
    const { data: ownerRows } = ownerIds.length
      ? await supabase.from("profiles").select("user_id, full_name").in("user_id", ownerIds)
      : { data: [] as any[] };
    const ownerName = new Map((ownerRows || []).map((o: any) => [o.user_id, o.full_name]));
    const searchById = new Map((searchRows || []).map((r: any) => [r.id, { ...r, owner_name: ownerName.get(r.user_id) || null }]));
    return rows.map((p) => ({ ...p, search: searchById.get(p.search_id) || null }));
  };

  const fetchFindrActions = async () => {
    if (!user) return;
    const { data, count } = await supabase
      .from("reservations")
      .select("proposal_id, dispute_open", { count: "exact" })
      .eq("findr_id", user.id)
      .or("dispute_open.eq.true,and(payment_status.eq.paye_en_attente_reception,delivery_type.not.is.null)");
    setFindrActionCount(count || 0);
    const map: Record<string, "dispute" | "ship"> = {};
    for (const r of data || []) if (r.proposal_id) map[r.proposal_id] = r.dispute_open ? "dispute" : "ship";
    setFindrActionByProposal(map);
    const ids = Object.keys(map);
    if (ids.length === 0) {
      setActionProposals([]);
      return;
    }
    const { data: rows } = await supabase
      .from("proposals")
      .select("id, title, description, proposed_price, image_urls, status, created_at, search_id, source_lang")
      .in("id", ids);
    setActionProposals(await enrichProposals(rows || []));
  };

  const refreshBadges = () => {
    fetchSearches();
    fetchFindrActions();
    fetchProfile();
  };

  const refreshRef = useRef(refreshBadges);
  refreshRef.current = refreshBadges;
  const lastFocusRefresh = useRef(Date.now());
  useEffect(() => {
    if (!user) return;
    let notificationRefreshTimer: ReturnType<typeof setTimeout> | undefined;
    const onFocus = () => {
      if (Date.now() - lastFocusRefresh.current < 60_000) return;
      lastFocusRefresh.current = Date.now();
      refreshRef.current();
    };
    window.addEventListener("focus", onFocus);
    const channel = supabase
      .channel(`myspace-notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new.type === "new_message") return;
          clearTimeout(notificationRefreshTimer);
          notificationRefreshTimer = setTimeout(() => {
            notificationRefreshTimer = undefined;
            refreshRef.current();
          }, 3_000);
        }
      )
      .subscribe();
    return () => {
      clearTimeout(notificationRefreshTimer);
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (searchTabAutoSelected.current || searches.length === 0) return;
    searchTabAutoSelected.current = true;
    const todo = { active: 0, ongoing: 0, done: 0, cancelled: 0 } as Record<string, number>;
    for (const s of searches as any[]) if ((s.unread_count || 0) > 0 || s.urgent_reason) todo[s.tab_status ?? "active"]++;
    if (todo.active === 0) {
      const other = (["ongoing", "done", "cancelled"] as const).find((k) => todo[k] > 0);
      if (other) setSearchTab(other);
    }
  }, [searches]);

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
    const { data } = await supabase.rpc("get_my_profile");
    if (data) setProfile(data as any);
  };

  const fetchSearches = async () => {
    if (!user) return;
    setSearchesError(false);
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) { setSearchesError(true); setLoadingSearches(false); return; }

    if (data) {
      const now = Date.now();
      const searchesWithCounts = await Promise.all(
        data.map(async (search) => {
          const { data: props } = await supabase
            .from("proposals")
            .select("id, status, updated_at")
            .eq("search_id", search.id)
            .neq("status", "withdrawn");

          const proposals = excludeWithdrawn(props || []);
          const proposalCount = proposals.length;
          const unreadCount = proposals.filter((p) => p.status === "pending").length;
          const acceptedCount = proposals.filter(
            (p) => p.status === "accepted_pending" || p.status === "completed"
          ).length;
          const paymentPending = proposals.some((p) => p.status === "accepted_pending");
          const completed = proposals
            .filter((p) => p.status === "completed")
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

          const { data: allReservations } = await supabase
            .from("reservations")
            .select(
              "id, created_at, updated_at, status, payment_status, findr_id, object_price, total_buyr_amount, dispute_reason, delivery_type, dispute_open, label_deadline_at, label_provided_at, ship_from"
            )
            .eq("search_id", search.id)
            .order("updated_at", { ascending: false });

          const allRes = allReservations || [];
          const reservationRows = allRes.filter((r) => r.status === "pending");
          const hasRecentReservation = reservationRows.some(
            (r) => now - new Date(r.created_at).getTime() < 48 * 3600 * 1000
          );

          const receiptPending = allRes.some((r) => (r.payment_status === "expedie" || r.payment_status === "livre") && !r.dispute_open);
          const deliveryChoicePending = allRes.some(
            (r) => awaitsDeliveryChoice(r)
          );
          const labelPending = allRes.some((r) => buyrMustProvideLabel(r as any));
          const urgent_reason: "reservation_pending" | "payment_pending" | "receipt_pending" | "delivery_choice" | "label_pending" | null =
            hasRecentReservation
              ? "reservation_pending"
              : paymentPending
              ? "payment_pending"
              : labelPending
              ? "label_pending"
              : deliveryChoicePending
              ? "delivery_choice"
              : receiptPending
              ? "receipt_pending"
              : null;

          const paid = allRes.find((r) =>
            ["paye_attente_etiquette", "etiquette_refusee", "paye_en_attente_reception", "expedie", "livre", "versement_en_revue", "termine", "annule"].includes(
              r.payment_status ?? ""
            )
          );
          const ps = paid?.payment_status ?? null;

          const tab_status = classifySearchTab(ps);

          let findr_name: string | null = null;
          if (paid?.findr_id && (tab_status === "done" || tab_status === "cancelled")) {
            const { data: findrProfile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", paid.findr_id)
              .maybeSingle();
            findr_name = findrProfile?.full_name?.split(" ")[0] || null;
          }

          return {
            ...search,
            proposal_count: proposalCount,
            unread_count: unreadCount,
            accepted_count: acceptedCount,
            completed_at: completed?.updated_at || null,
            reservation_count: reservationRows.length,
            urgent_reason,
            tab_status,
            findr_name,
            final_amount: paid?.total_buyr_amount ?? paid?.object_price ?? null,
            transaction_id: paid?.id ?? null,
            finalized_at: paid?.updated_at || null,
            cancel_reason: paid?.dispute_reason || null,
            has_invoice: tab_status === "done",
            paid_status: ps,
            payment_pending: paymentPending,
            pay_proposal_id: proposals.find((p) => p.status === "accepted_pending")?.id ?? null,
            recent_reservation: hasRecentReservation,
            label_pending: labelPending,
            receipt_pending: receiptPending,
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
    setLoadingSearches(false);
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

  const fetchFavorites = async (from = 0, append = false) => {
    if (!user) return;
    if (append) setLoadingMoreFavorites(true);
    const { data: favData } = await supabase
      .from("favorites")
      .select("search_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, from + PANEL_PAGE_SIZE - 1);

    setHasMoreFavorites((favData?.length ?? 0) === PANEL_PAGE_SIZE);

    if (favData && favData.length > 0) {
      const searchIds = favData.map(f => f.search_id);
      const { data: searchesData } = await supabase
        .from("searches")
        .select("id, title, description, category, budget_min, budget_max, urgency, image_url, user_id, source_lang")
        .in("id", searchIds);

      if (searchesData) {
        const userIds = [...new Set(searchesData.map(s => s.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, city")
          .in("user_id", userIds);

        const cityMap = new Map(profiles?.map(p => [p.user_id, p.city]) || []);

        const order = new Map(searchIds.map((id, i) => [id, i]));
        const enriched = searchesData
          .map(s => ({
            ...s,
            city: cityMap.get(s.user_id) || "France",
          }))
          .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        setFavorites((prev) => (append ? [...prev, ...enriched] : enriched));
      }
    } else if (!append) {
      setFavorites([]);
    }
    setLoadingMoreFavorites(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("mySpace.fileTooLarge"), description: t("mySpace.max5"), variant: "destructive" });
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
      toast({ title: t("mySpace.photoUpdated") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const bannerCoverScale = () => {
    if (!bannerNatural) return 1;
    return Math.max(bannerFrame.w / bannerNatural.w, bannerFrame.h / bannerNatural.h);
  };

  const clampBannerOffset = (x: number, y: number) => {
    const scale = bannerCoverScale();
    if (!bannerNatural) return { x: 0, y: 0 };
    const dispW = bannerNatural.w * scale;
    const dispH = bannerNatural.h * scale;
    const minX = Math.min(0, bannerFrame.w - dispW);
    const minY = Math.min(0, bannerFrame.h - dispH);
    return {
      x: Math.max(minX, Math.min(0, x)),
      y: Math.max(minY, Math.min(0, y)),
    };
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: t("mySpace.fileTooLarge"), description: t("mySpace.max8"), variant: "destructive" });
      if (bannerInputRef.current) bannerInputRef.current.value = "";
      return;
    }
    // Conserve le format exact du cadre bannière affiché
    const areaW = bannerAreaRef.current?.offsetWidth || 900;
    const areaH = bannerAreaRef.current?.offsetHeight || 90;
    const previewW = Math.min(620, areaW);
    setBannerFrame({ w: previewW, h: Math.round((previewW * areaH) / areaW) });
    setBannerNatural(null);
    setBannerOffset({ x: 0, y: 0 });
    setBannerFile(file);
    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    setBannerPreviewUrl(URL.createObjectURL(file));
    setBannerEditorOpen(true);
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleBannerImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nat = { w: img.naturalWidth, h: img.naturalHeight };
    setBannerNatural(nat);
    const scale = Math.max(bannerFrame.w / nat.w, bannerFrame.h / nat.h);
    setBannerOffset({
      x: (bannerFrame.w - nat.w * scale) / 2,
      y: (bannerFrame.h - nat.h * scale) / 2,
    });
  };

  const startBannerDrag = (clientX: number, clientY: number) => {
    bannerDragRef.current = { px: clientX, py: clientY, ox: bannerOffset.x, oy: bannerOffset.y };
  };

  const moveBannerDrag = (clientX: number, clientY: number) => {
    const d = bannerDragRef.current;
    if (!d) return;
    setBannerOffset(clampBannerOffset(d.ox + (clientX - d.px), d.oy + (clientY - d.py)));
  };

  const endBannerDrag = () => {
    bannerDragRef.current = null;
  };

  const closeBannerEditor = () => {
    setBannerEditorOpen(false);
    setBannerFile(null);
    setBannerNatural(null);
    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    setBannerPreviewUrl(null);
  };

  const handleBannerConfirm = async () => {
    if (!bannerFile || !bannerPreviewUrl || !bannerNatural || !user) return;
    setUploadingBanner(true);
    try {
      const scale = bannerCoverScale();
      const sx = Math.max(0, -bannerOffset.x / scale);
      const sy = Math.max(0, -bannerOffset.y / scale);
      const sw = Math.min(bannerNatural.w - sx, bannerFrame.w / scale);
      const sh = Math.min(bannerNatural.h - sy, bannerFrame.h / scale);

      const outW = 1600;
      const outH = Math.max(1, Math.round((outW * bannerFrame.h) / bannerFrame.w));
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(t("mySpace.ui.canvasError"));

      const image = new Image();
      image.src = bannerPreviewUrl;
      await new Promise<void>((resolve, reject) => {
        if (image.complete) return resolve();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(t("mySpace.ui.imageError")));
      });
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outW, outH);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
      );
      if (!blob) throw new Error(t("mySpace.ui.exportError"));

      const path = `${user.id}/banner-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("search-images")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("search-images").getPublicUrl(path);
      const { error: updErr } = await (supabase.from("profiles") as any)
        .update({ banner_url: pub.publicUrl })
        .eq("user_id", user.id);
      if (updErr) throw updErr;
      await fetchProfile();
      toast({ title: t("mySpace.bannerUpdated") });
      closeBannerEditor();
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!user) return;
    const { error } = await (supabase.from("profiles") as any).update({ banner_url: null }).eq("user_id", user.id);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return;
    }
    await fetchProfile();
    toast({ title: t("mySpace.bannerRemoved") });
  };

  const { items: todoItems, error: todoError, retry: retryTodos } = useTodoItems(user?.id, profile);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#070E42' }}></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const sectionCounts: Record<MySpaceSection, { n: number; gold: boolean }> = {
    aujourdhui: { n: todoNavCount(todoItems, unreadExchanges), gold: true },
    recherches: { n: searches.filter((x: any) => classifySearchTab(x.paid_status ?? null) === "active").length, gold: false },
    compte: { n: (todoItems || []).filter((it) => ACCOUNT_TODO_KINDS.includes(it.kind)).length, gold: true },
  };

  const averageRating = evaluations.length > 0
    ? (evaluations.reduce((acc, e) => acc + e.rating, 0) / evaluations.length).toFixed(1)
    : "N/A";

  return (
    <div className="min-h-screen max-[640px]:pb-[calc(72px+16px+68px+env(safe-area-inset-bottom))]" style={{ backgroundColor: '#F5F1E8' }}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="px-6 md:px-12 lg:px-16 mx-auto">
          {stripeCompleteBanner && (
            <div role="status" className="mb-6 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 border border-success/40 bg-success/10">
              <p className="text-sm font-medium text-success">{t("mySpace.stripeCompleteBanner")}</p>
              <div className="flex items-center gap-4">
                <button type="button" className="text-sm font-semibold underline text-success" onClick={() => selectSection("compte", "paiements")}>
                  {t("mySpace.stripeCompleteLink")}
                </button>
                <button type="button" aria-label={t("mySpace.stripeCompleteClose")} className="text-lg leading-none text-success" onClick={dismissStripeBanner}>
                  ×
                </button>
              </div>
            </div>
          )}
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
              <div className="relative" style={{ padding: 32, paddingTop: 24 }}>
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
                title={t("mySpace.ui.changePhoto")} aria-label={t("mySpace.ui.changePhoto")}
                className="group relative flex-shrink-0 rounded-full overflow-hidden"
                style={{ width: 108, height: 108 }}
              >
                <Avatar className="w-[108px] h-[108px]" style={{ border: '4px solid #FFFFFF', boxShadow: '0 0 0 3px #D9BB87' }}>
                  <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback
                    style={{
                      backgroundColor: '#070E42',
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
                    {profile.full_name || t("mySpace.ui.defaultUser")}
                  </h1>
                  {(user as any)?.email_confirmed_at && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        color: '#1B7A4A',
                        backgroundColor: 'rgba(27,122,74,0.08)',
                        border: '1px solid rgba(27,122,74,0.25)',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontWeight: 500,
                      }}
                    >
                      ✓ {t("mySpace.ui.emailVerified")}
                    </span>
                  )}
                </div>

                {/* b. Rating line */}
                <div className="flex items-center gap-2 mt-2">
                  {evaluations.length === 0 ? (
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{t("mySpace.ui.noReviews")}</span>
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
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#070E42' }}>
                        {averageRating}
                      </span>
                      <span className="text-xs" style={{ color: '#6B7280' }}>
                        {t("mySpace.ui.reviewCount", { count: evaluations.length })}
                      </span>
                    </>
                  )}
                  <Link
                    to={`/profil/${user?.id}/evaluations`}
                    className="text-xs underline-offset-4 hover:underline inline-flex items-center min-h-11"
                    style={{ color: '#070E42', fontWeight: 500 }}
                  >
                    {t("mySpace.tabs.seeReviews")} →
                  </Link>
                </div>

                {/* c. À propos — bio (rubrique « Aujourd'hui » seulement) */}
                {activeSection === "aujourdhui" && (
                <div className="mt-5">
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: '#6B4F12', letterSpacing: '0.08em' }}
                  >
                    {t("mySpace.ui.about")}
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
                        {t("mySpace.ui.addBioHint")}
                      </p>
                      <button
                        type="button"
                        onClick={openEditProfile}
                        className="mt-3 transition-colors min-h-11"
                        style={{
                          backgroundColor: '#D9BB87',
                          border: '1.5px solid #D9BB87',
                          color: '#070E42',
                          fontSize: 12,
                          borderRadius: 999,
                          padding: '6px 16px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + {t("mySpace.ui.addBio")}
                      </button>
                    </div>
                  )}
                </div>

                )}

                {/* f. Edit profile button — bottom */}
                <button
                  type="button"
                  onClick={openEditProfile}
                  className="mt-5 inline-flex items-center gap-1.5 transition-colors min-h-11"
                  style={{
                    border: '1.5px solid #070E42',
                    color: '#070E42',
                    fontSize: 12,
                    padding: '6px 16px',
                    borderRadius: 999,
                    backgroundColor: 'transparent',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Pencil className="w-3 h-3" />
                  {t("mySpace.ui.editProfile")}
                </button>
              </div>
              </div>

              </div>

              </div>
              );
            })()}

            {/* Separator */}
            <div className="border-b mb-6" style={{ borderColor: '#E5E1D8' }} />

            {activeSection === "aujourdhui" && (<>
            <TodoNowBlock
              items={todoItems}
              error={todoError}
              onRetry={retryTodos}
              onStripe={() => setStripeModalOpen(true)}
              onShipFrom={() => {
                selectSection("compte", "adresse");
              }}
            />

            <OngoingSalesBlock userId={user.id} />
            </>)}

            {/* Modale d'information avant redirection Stripe */}
            <Dialog open={stripeModalOpen} onOpenChange={setStripeModalOpen}>
              <DialogContent className="sm:max-w-md" style={{ backgroundColor: '#FBFAF6' }}>
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: "'Playfair Display', serif", color: '#070E42' }}>
                    {t("mySpace.payments.modalTitle")}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>
                  {t("mySpace.payments.modalBody")}
                </p>
                <DialogFooter className="flex items-center justify-between gap-3 sm:justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => setStripeModalOpen(false)}
                    style={{ color: '#6B7280' }}
                  >
                    {t("mySpace.payments.cancel")}
                  </Button>
                  <Button
                    onClick={() => { setStripeModalOpen(false); startOnboarding(); }}
                    disabled={stripeLoading}
                    style={{ backgroundColor: '#070E42', color: '#F5F0EA' }}
                  >
                    {stripeLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("mySpace.payments.redirecting")}</>
                    ) : (
                      <>{t("mySpace.payments.continue")}</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Navigation entre les rubriques */}
            <nav aria-label={t("mySpace.sections.nav")} className="mb-6 border-b max-[640px]:hidden" style={{ borderColor: "#E5E1D8" }}>
              <ul className="flex gap-1 overflow-x-auto whitespace-nowrap sm:gap-4" style={{ scrollbarWidth: "none" }}>
                {MY_SPACE_SECTIONS.map((key) => {
                  const selected = activeSection === key;
                  const { n, gold } = sectionCounts[key];
                  const label = t(`mySpace.sections.${{ aujourdhui: "today", recherches: "searches", compte: "account" }[key]}`);
                  return (
                    <li key={key} className="shrink-0">
                      <Link
                        to={`/mon-espace?section=${key}`}
                        aria-current={selected ? "page" : undefined}
                        className="inline-flex min-h-[44px] items-center gap-2 px-2 text-sm rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{
                          color: "#070E42",
                          fontWeight: selected ? 600 : 500,
                          borderBottom: `2px solid ${selected ? "#D9BB87" : "transparent"}`,
                          marginBottom: -1,
                          outlineColor: "#070E42",
                        }}
                      >
                        {label}
                        {n > 0 && (
                          <span
                            aria-label={t(gold ? "mySpace.sections.actionCount" : "mySpace.sections.plainCount", { count: n })}
                            className="inline-flex items-center justify-center rounded-full"
                            style={gold
                              ? { backgroundColor: "#D9BB87", color: "#070E42", fontSize: 12, fontWeight: 600, minWidth: 20, height: 20, padding: "0 6px" }
                              : { color: "#4B5563", fontSize: 13, fontWeight: 500 }}
                          >
                            {n > 99 ? "99+" : n}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div>
            {activeSection === "compte" && (() => {
              const completion = profileCompletion(profile);
              const finalized = finalizedSales(myProposals);
              const pill = (text: string, done: boolean) => (
                <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold" style={done ? { backgroundColor: "#E7F3EC", color: "#1F6B47", border: "1px solid #B7D9C5" } : { backgroundColor: "#FBF3E2", color: "#6B4F12", border: "1px solid #D9BB87" }}>{text}</span>
              );
              const card = "rounded-xl p-5 bg-white scroll-mt-28";
              const cardStyle = { border: "1px solid #E5E1D8" };
              const h2 = { fontSize: 17, fontWeight: 600, color: "#070E42" } as const;
              return (
              <div className="w-full space-y-6">
                <section aria-labelledby="about-heading" className={card} style={cardStyle}>
                  <h2 id="about-heading" className="mb-3" style={h2}>{t("mySpace.account.aboutTitle")}</h2>
                  <p className="text-sm leading-relaxed" style={{ color: profile.bio ? "#374151" : "#6B7280" }}>{profile.bio || t("mySpace.account.noBio")}</p>
                  <div className="mt-4">
                    <p className="text-xs mb-1.5" style={{ color: "#4B5563" }}>{t("mySpace.account.completion", { n: completion })}</p>
                    <div role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100} aria-label={t("mySpace.account.completion", { n: completion })} className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#ECE6DA" }}>
                      <div className="h-full rounded-full" style={{ width: `${completion}%`, backgroundColor: "#070E42" }} />
                    </div>
                  </div>
                  <button type="button" onClick={openEditProfile} className="mt-3 min-h-[44px] text-sm font-semibold underline" style={{ color: "#070E42" }}>
                    {t("mySpace.account.editBio")}
                  </button>
                </section>

                <section id="paiements" aria-labelledby="payments-heading" className={card} style={cardStyle}>
                  <h2 id="payments-heading" className="mb-1" style={h2}>{t("mySpace.account.paymentsTitle")}</h2>
                  <p className="text-sm mb-3" style={{ color: "#4B5563" }}>{t("mySpace.payments.description")}</p>
                  <div className="flex flex-wrap items-center gap-3" role="status">
                    {profile.stripe_onboarding_complete ? pill(t("mySpace.account.stripeDone"), true)
                      : stripeVerifying ? (
                        <span className="text-sm inline-flex items-center" style={{ color: "#4B5563" }}><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("mySpace.payments.verifying")}</span>
                      ) : profile.stripe_account_id && stripeStatus?.details_submitted ? (<>
                        {pill(t("mySpace.account.stripeReview"), false)}
                        <Button variant="outline" onClick={() => runStripeVerification(false)}>{t("mySpace.payments.checkAgain")}</Button>
                      </>) : (<>
                        {pill(t("mySpace.account.stripeTodo"), false)}
                        <Button onClick={() => setStripeModalOpen(true)} disabled={stripeLoading} style={{ backgroundColor: "#070E42", color: "#F5F0EA" }}>
                          {stripeLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("mySpace.payments.redirecting")}</> : t("mySpace.account.stripeFinish")}
                        </Button>
                      </>)}
                  </div>

                  <div className="mt-5 space-y-3">
                    {user && <NegativeBalanceBanner userId={user.id} negativeBalance={Number(profile?.negative_balance ?? 0)} />}
                    <div className="rounded-xl p-4" style={{ backgroundColor: "#FAF7F2", border: "1px solid #ECE6DA" }}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4B5563" }}>{t("mySpace.account.pendingTitle")}</h3>
                      <p className="mt-1" style={{ fontSize: 22, fontWeight: 700, color: "#070E42" }}>{formatPrice(pendingEarnings(myProposals), i18n.language)}</p>
                      <p className="text-xs mt-1" style={{ color: "#4B5563" }}>{t("mySpace.account.pendingText")}</p>
                    </div>
                  </div>

                  <h3 className="mt-6 mb-2" style={{ fontSize: 15, fontWeight: 600, color: "#070E42" }}>{t("mySpace.account.finalizedTitle")}</h3>
                  {finalized.length === 0 ? (
                    <p className="text-sm" style={{ color: "#6B7280" }}>{t("mySpace.account.finalizedEmpty")}</p>
                  ) : (
                    <ul className="divide-y rounded-lg border" style={{ borderColor: "#E5E1D8" }}>
                      {finalized.map((f) => (
                        <li key={f.id} className="flex items-center justify-between gap-3 p-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium break-words" style={{ color: "#070E42" }}>{f.title}</p>
                            {f.finalizedAt && <p className="text-xs" style={{ color: "#4B5563" }}>{t("mySpace.account.finalizedOn", { date: new Date(f.finalizedAt).toLocaleDateString(i18n.language) })}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs" style={{ color: "#4B5563" }}>{t("mySpace.account.youReceive")}</p>
                            <p className="text-sm font-semibold" style={{ color: "#070E42" }}>{f.net == null ? "—" : formatPrice(f.net, i18n.language)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs mt-4" style={{ color: "#4B5563" }}>{t("mySpace.account.bankDelay")}</p>
                </section>

                <section id="adresse" className="scroll-mt-28">
                  <ShipFromCard key={profile.ship_from_updated_at ?? "new"} profile={profile} onSaved={fetchProfile} />
                </section>

                <MessageEmailPreference enabled={profile.notify_message_emails ?? true} onSaved={fetchProfile} />

                <section id="favoris" aria-labelledby="fav-section-heading" className={card} style={cardStyle}>
                  <h2 id="fav-section-heading" className="mb-4" style={h2}>{t("mySpace.account.favTitle")}</h2>
                  <h3 className="mb-3" style={{ fontSize: 15, fontWeight: 600, color: "#070E42" }}>{t("mySpace.tabs.favoritesTitle")}</h3>
                  {favorites.length === 0 ? (
                    <FindrEmptyState text={t("mySpace.tabs.empty.favorites")} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {favorites.map((search) => (
                        <Link key={search.id} to={`/recherche/${search.id}`} className="flex items-center gap-3 rounded-lg p-2 bg-white border hover:shadow-md transition-shadow min-h-[44px]" style={{ borderColor: "#E5E1D8" }}>
                          <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden" style={{ backgroundColor: "#F5F0EA" }}>
                            {search.image_url && <img src={search.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />}
                          </div>
                          <div className="min-w-0">
                            <TranslatedContent type="search" id={search.id} title={search.title} description={search.description} sourceLang={search.source_lang}>
                              {({ title }) => <p className="font-semibold text-sm line-clamp-2" style={{ color: "#070E42" }}>{title}</p>}
                            </TranslatedContent>
                            <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
                              {search.budget_min != null && search.budget_max != null
                                ? `${formatPrice(Number(search.budget_min), i18n.language)} – ${formatPrice(Number(search.budget_max), i18n.language)}`
                                : t("mySpace.ui.budgetUndefined")}
                            </p>
                          </div>
                        </Link>
                      ))}
                      {hasMoreFavorites && (
                        <div className="md:col-span-2 flex justify-center pt-1">
                          <Button variant="outline" size="sm" disabled={loadingMoreFavorites} onClick={() => fetchFavorites(favorites.length, true)}>
                            {loadingMoreFavorites ? t("common.loading") : t("mySpace.loadMore")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="pt-6 mt-6 border-t" style={{ borderColor: "#E5E1D8" }}>
                    <h3 className="mb-3" style={{ fontSize: 15, fontWeight: 600, color: "#070E42" }}>{t("keywordAlerts.title")}</h3>
                    <KeywordAlertsPanel />
                  </div>
                </section>
              </div>
              );
            })()}

            {activeSection === "recherches" && (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: "#070E42" }}>
                      {t("mySpace.ui.mySearchesTitle")}
                    </h2>
                    <div style={{ width: 60, height: 2, backgroundColor: "#D9BB87", borderRadius: 2, marginTop: 8 }} />
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to="/poster"
                      className="inline-flex items-center transition-colors min-h-11"
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
                      {t("mySpace.ui.postSearch")}
                    </Link>
                  </div>
                </div>

                {searchesError ? (
                  <LoadError onRetry={() => { setLoadingSearches(true); fetchSearches(); }} />
                ) : loadingSearches ? (
                  <RowSkeletons />
                ) : searches.length === 0 ? (
                  <EmptySection title={t("mySpace.states.noSearchesTitle")} text={t("mySpace.states.noSearchesText")} to="/poster" cta={t("mySpace.states.noSearchesCta")} />
                ) : (
                  <BuyrSearchesPanel searches={searches as any} tab={searchTab} onTabChange={setSearchTab} />
                )}
              </div>
            )}
            </div>


          </motion.div>
        </div>
      </main>

      <Footer />
      <MySpaceBottomBar
        active={activeSection}
        actionCounts={{ aujourdhui: sectionCounts.aujourdhui.n, compte: sectionCounts.compte.n }}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#070E42' }}>{t("mySpace.ui.editProfile")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">{t("mySpace.ui.fullName")}</Label>
              <Input
                id="edit-name"
                value={editForm.full_name}
                onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder={t("mySpace.ui.fullNamePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-city">{t("mySpace.ui.city")}</Label>
              <Input
                id="edit-city"
                value={editForm.city}
                onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                placeholder={t("mySpace.ui.cityPlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-bio">{t("mySpace.ui.bio")}</Label>
              <Textarea
                id="edit-bio"
                value={editForm.bio}
                onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder={t("mySpace.ui.bioPlaceholder")}
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
              {t("mySpace.payments.cancel")}
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              style={{ backgroundColor: '#070E42', color: '#F5F0EA' }}
            >
              {savingProfile ? t("mySpace.ui.saving") : t("mySpace.ui.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MySpace;
