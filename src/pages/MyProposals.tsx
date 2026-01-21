import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Clock, CheckCircle, XCircle, ExternalLink, Loader2, Euro, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProposalWithSearch {
  id: string;
  title: string;
  description: string | null;
  proposed_price: number;
  image_urls: string[];
  product_link: string | null;
  status: string;
  created_at: string;
  search: {
    id: string;
    title: string;
    category: string;
    user_id: string;
    profiles: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "En attente",
    color: "bg-warning text-warning-foreground",
    icon: <Clock className="w-4 h-4" />,
  },
  accepted_pending: {
    label: "Acceptée - Paiement en attente",
    color: "bg-accent text-accent-foreground",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  completed: {
    label: "Terminée",
    color: "bg-green-600 text-white",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  rejected: {
    label: "Refusée",
    color: "bg-destructive text-destructive-foreground",
    icon: <XCircle className="w-4 h-4" />,
  },
};

const MyProposals = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [proposals, setProposals] = useState<ProposalWithSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProposals();
      subscribeToProposals();
    }
  }, [user]);

  const fetchProposals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("findr_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching proposals:", error);
      setLoading(false);
      return;
    }

    // Fetch search details for each proposal
    const proposalsWithSearches = await Promise.all(
      (data || []).map(async (proposal) => {
        const { data: searchData } = await supabase
          .from("searches")
          .select("id, title, category, user_id")
          .eq("id", proposal.search_id)
          .maybeSingle();

        let profiles = null;
        if (searchData) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", searchData.user_id)
            .maybeSingle();
          profiles = profileData;
        }

        return {
          ...proposal,
          search: searchData ? { ...searchData, profiles } : null,
        };
      })
    );

    setProposals(proposalsWithSearches);
    setLoading(false);
  };

  const subscribeToProposals = () => {
    if (!user) return;

    const channel = supabase
      .channel("my-proposals-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "proposals",
          filter: `findr_id=eq.${user.id}`,
        },
        () => {
          fetchProposals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const pendingCount = proposals.filter((p) => p.status === "pending").length;
  const acceptedCount = proposals.filter((p) => p.status === "accepted_pending" || p.status === "completed").length;
  const rejectedCount = proposals.filter((p) => p.status === "rejected").length;

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
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
                Mes Propositions
              </h1>
              <p className="text-muted-foreground">
                Suis l'état de toutes tes propositions envoyées
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-warning" />
                  <p className="text-2xl font-bold text-primary">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-primary">{acceptedCount}</p>
                  <p className="text-xs text-muted-foreground">Acceptées</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <XCircle className="w-6 h-6 mx-auto mb-2 text-destructive" />
                  <p className="text-2xl font-bold text-primary">{rejectedCount}</p>
                  <p className="text-xs text-muted-foreground">Refusées</p>
                </CardContent>
              </Card>
            </div>

            {/* Proposals List */}
            {proposals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Tu n'as pas encore fait de proposition</p>
                  <Button asChild className="btn-hero">
                    <Link to="/recherches">Voir les recherches</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal, index) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Image */}
                          <div className="w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 bg-secondary">
                            {proposal.image_urls?.[0] ? (
                              <img
                                src={proposal.image_urls[0]}
                                alt={proposal.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={statusConfig[proposal.status]?.color || "bg-muted"}>
                                    {statusConfig[proposal.status]?.icon}
                                    <span className="ml-1">{statusConfig[proposal.status]?.label || proposal.status}</span>
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-primary truncate">{proposal.title}</h3>
                                {proposal.search && (
                                  <p className="text-sm text-muted-foreground">
                                    Pour : <Link to={`/recherche/${proposal.search.id}`} className="hover:text-accent">{proposal.search.title}</Link>
                                  </p>
                                )}
                                {proposal.search?.profiles && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Demandé par {proposal.search.profiles.full_name || "Utilisateur"}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1 text-lg font-bold text-accent">
                                  <Euro className="w-4 h-4" />
                                  {proposal.proposed_price}
                                </div>
                                <span className="text-xs text-muted-foreground">{formatDate(proposal.created_at)}</span>
                              </div>
                            </div>

                            {proposal.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {proposal.description}
                              </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-3">
                              {proposal.search && (
                                <Button size="sm" variant="outline" asChild>
                                  <Link to={`/recherche/${proposal.search.id}`}>
                                    <Eye className="w-4 h-4 mr-1" />
                                    Voir la recherche
                                  </Link>
                                </Button>
                              )}
                              {proposal.product_link && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={proposal.product_link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Voir le produit
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyProposals;
