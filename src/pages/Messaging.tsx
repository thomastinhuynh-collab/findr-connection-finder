import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SearchData {
  id: string;
  title: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const Messaging = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; sender: "me" | "other"; time: string }[]>([]);
  const [search, setSearch] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Connexion requise",
        description: "Tu dois être connecté pour accéder à la messagerie.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    if (id && user) {
      fetchSearch();
    }
  }, [id, user]);

  const fetchSearch = async () => {
    const { data, error } = await supabase
      .from("searches")
      .select(`
        id, title, user_id,
        profiles!searches_user_id_fkey(full_name, avatar_url)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching search:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la conversation.",
        variant: "destructive",
      });
    } else {
      setSearch(data as any);
    }
    setLoading(false);
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        { text: message, sender: "me", time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }
      ]);
      setMessage("");
      toast({
        title: "Message envoyé",
        description: "Le système de messagerie complet sera bientôt disponible !",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!search) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-serif font-bold text-primary mb-4">
              Conversation non trouvée
            </h1>
            <Button onClick={() => navigate("/recherches")}>
              Retour aux recherches
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-8">
        <div className="container mx-auto px-4 h-full flex flex-col max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>

            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
              {search.profiles?.avatar_url ? (
                <img
                  src={search.profiles.avatar_url}
                  alt={search.profiles.full_name || "User"}
                  className="w-12 h-12 rounded-full border-2 border-accent object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                  {search.profiles?.full_name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <p className="font-semibold text-primary">
                  {search.profiles?.full_name || "Utilisateur"}
                </p>
                <p className="text-sm text-muted-foreground truncate max-w-md">
                  {search.title}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Messages Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 bg-card border border-border rounded-2xl p-4 mb-4 min-h-[400px] overflow-y-auto"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <User className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Commencez la conversation</p>
                <p className="text-sm max-w-sm mt-2">
                  Envoyez un message à {search.profiles?.full_name || "l'utilisateur"} pour discuter de sa recherche.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.sender === "me"
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === "me" ? "text-accent-foreground/70" : "text-muted-foreground"
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex gap-3">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Écrivez votre message..."
                className="resize-none min-h-[60px] flex-1 border-border focus:border-accent"
                rows={2}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                size="lg"
                className="self-end gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messaging;