import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Star, Search, Plus, Settings, LogOut, Crown, Wallet, Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

// Mock transactions pour simulation
const mockTransactions = [
  { id: "1", type: "credit" as const, amount: 25.00, description: "Vente recherche #127", date: "15 Jan 2026" },
  { id: "2", type: "debit" as const, amount: 15.00, description: "Abonnement Premium", date: "10 Jan 2026" },
  { id: "3", type: "credit" as const, amount: 45.50, description: "Vente recherche #125", date: "5 Jan 2026" },
];

const MySpace = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [walletBalance] = useState(155.50);

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
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) setProfile(data);
  };

  const fetchSearches = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) {
      // Fetch pending proposal counts and reservation counts for each search
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Profile Header */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {profile.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center md:text-left flex-1">
                    <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2 justify-center md:justify-start">
                      {profile.full_name || "Utilisateur"}
                      {profile.is_premium && (
                        <Badge className="bg-accent text-accent-foreground">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                      {profile.is_findr && (
                        <Badge className="bg-primary text-primary-foreground">findr</Badge>
                      )}
                      <Badge variant="outline">Niveau {profile.level}</Badge>
                      <Badge variant="outline">{profile.xp_points} XP</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Link to My Proposals for Findrs */}
                  {profile.is_findr && (
                    <Button variant="outline" asChild className="md:hidden mt-4 w-full">
                      <Link to="/mes-propositions">
                        <Package className="w-4 h-4 mr-2" />
                        Mes propositions
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Search className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-primary">{searches.length}</p>
                  <p className="text-sm text-muted-foreground">Recherches</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-3xl font-bold text-primary">{averageRating}</p>
                  <p className="text-sm text-muted-foreground">Note moyenne</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <User className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-primary">{evaluations.length}</p>
                  <p className="text-sm text-muted-foreground">Évaluations</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="searches" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="searches">Mes Recherches</TabsTrigger>
                <TabsTrigger value="wallet" className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" />
                  Portefeuille
                </TabsTrigger>
                <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
              </TabsList>

              <TabsContent value="searches" className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Mes recherches en cours</h2>
                  <div className="flex gap-2">
                    {profile.is_findr && (
                      <Button variant="outline" asChild>
                        <Link to="/mes-propositions">
                          <Package className="w-4 h-4 mr-2" />
                          Mes propositions
                        </Link>
                      </Button>
                    )}
                    <Button asChild className="btn-hero">
                      <Link to="/poster">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle recherche
                      </Link>
                    </Button>
                  </div>
                </div>

                {searches.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Aucune recherche pour le moment</p>
                      <Button asChild className="mt-4 btn-hero">
                        <Link to="/poster">Poster ma première recherche</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
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

              <TabsContent value="evaluations" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Évaluations reçues</h2>

                {evaluations.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Aucune évaluation pour le moment</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {evaluations.map((evaluation) => (
                      <Card key={evaluation.id}>
                        <CardContent className="py-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
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
                                <span className="text-sm text-muted-foreground">
                                  par {evaluation.from_user?.full_name || "Anonyme"}
                                </span>
                              </div>
                              {evaluation.comment && (
                                <p className="text-sm">{evaluation.comment}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
