import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, User, Loader2, CheckCheck, Check } from "lucide-react";
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

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
  created_at: string;
}

const Messaging = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      fetchMessages();
    }
  }, [id, user]);

  // Real-time subscription
  useEffect(() => {
    if (!id || !user) return;

    const channel = supabase
      .channel(`messages-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `search_id=eq.${id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          
          // Mark as read if we're the receiver
          if (newMessage.receiver_id === user.id) {
            markAsRead(newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchSearch = async () => {
    const { data: searchData, error: searchError } = await supabase
      .from("searches")
      .select("id, title, user_id")
      .eq("id", id)
      .maybeSingle();

    if (searchError || !searchData) {
      console.error("Error fetching search:", searchError);
      toast({
        title: "Erreur",
        description: "Impossible de charger la conversation.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", searchData.user_id)
      .maybeSingle();

    setSearch({
      ...searchData,
      profiles: profileData
    });
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("search_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
    
    // Mark unread messages as read
    if (user && data) {
      const unreadIds = data
        .filter(m => m.receiver_id === user.id && !m.is_read)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .in("id", unreadIds);
      }
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId);
  };

  const handleSend = async () => {
    if (!message.trim() || !user || !search) return;

    setSending(true);
    const receiverId = search.user_id === user.id ? search.user_id : search.user_id;
    
    // Determine the correct receiver (the other person in the conversation)
    const actualReceiverId = search.user_id;

    const { error } = await supabase
      .from("messages")
      .insert({
        search_id: id,
        sender_id: user.id,
        receiver_id: actualReceiverId,
        content: message.trim()
      });

    if (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    } else {
      setMessage("");
    }
    
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, Message[]>);

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
              onClick={() => {
                const idx = (window.history.state as any)?.idx;
                if (typeof idx === "number" && idx > 0) navigate(-1);
                else navigate(`/recherche/${id}`);
              }}
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
              <div className="flex-1">
                <p className="font-semibold text-primary">
                  {search.profiles?.full_name || "Utilisateur"}
                </p>
                <p className="text-sm text-muted-foreground truncate max-w-md">
                  {search.title}
                </p>
              </div>
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" title="En ligne" />
            </div>
          </motion.div>

          {/* Messages Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 bg-card border border-border rounded-2xl p-4 mb-4 min-h-[400px] max-h-[500px] overflow-y-auto"
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
              <div className="space-y-6">
                {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center mb-4">
                      <span className="bg-secondary px-3 py-1 rounded-full text-xs text-muted-foreground">
                        {formatDate(dayMessages[0].created_at)}
                      </span>
                    </div>
                    
                    {/* Messages for this date */}
                    <div className="space-y-3">
                      {dayMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                              msg.sender_id === user?.id
                                ? "bg-accent text-accent-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${
                              msg.sender_id === user?.id ? "justify-end" : "justify-start"
                            }`}>
                              <span className={`text-xs ${
                                msg.sender_id === user?.id ? "text-accent-foreground/70" : "text-muted-foreground"
                              }`}>
                                {formatTime(msg.created_at)}
                              </span>
                              {msg.sender_id === user?.id && (
                                msg.is_read ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-accent-foreground/70" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-accent-foreground/50" />
                                )
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
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
                disabled={!message.trim() || sending}
                size="lg"
                className="self-end gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
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