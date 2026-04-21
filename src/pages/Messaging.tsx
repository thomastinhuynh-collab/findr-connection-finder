import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2, CheckCheck, Check, Info, Paperclip, X, Plus } from "lucide-react";
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
  images?: string[];
}

const MAX_CHARS = 240;
const MAX_PHOTOS = 5;

const QUICK_SUGGESTIONS = [
  "J'ai peut-être ce que vous cherchez 👀",
  "Quel est votre budget ?",
  "Pouvez-vous envoyer plus de photos ?",
];

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
  const [photos, setPhotos] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localImagesRef = useRef<Record<string, string[]>>({});

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
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          
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
    if ((!message.trim() && photos.length === 0) || !user || !search) return;

    setSending(true);
    const actualReceiverId = search.user_id;
    const photosSnapshot = [...photos];
    const contentToSend = message.trim() || (photosSnapshot.length > 0 ? "📷 Photo(s)" : "");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        search_id: id,
        sender_id: user.id,
        receiver_id: actualReceiverId,
        content: contentToSend
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    } else {
      if (data && photosSnapshot.length > 0) {
        localImagesRef.current[data.id] = photosSnapshot;
      }
      setMessage("");
      setPhotos([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    setMessage(text);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      toast({
        title: "Limite atteinte",
        description: `Maximum ${MAX_PHOTOS} photos par message.`,
      });
    }

    const newPreviews = filesToAdd.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...newPreviews]);
    if (e.target) e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, Message[]>);

  const remainingChars = MAX_CHARS - message.length;
  const firstName = search?.profiles?.full_name?.split(" ")[0] || "l'utilisateur";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
        <main className="pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: "#6B7B9E" }} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!search) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-serif font-bold mb-4" style={{ color: "#112150" }}>
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5F0E8" }}>
        

      <main className="flex-1 pt-24 pb-8">
        <div className="container mx-auto px-4 h-full flex flex-col max-w-3xl">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <button
              onClick={() => {
                const idx = (window.history.state as any)?.idx;
                if (typeof idx === "number" && idx > 0) navigate(-1);
                else navigate(`/recherche/${id}`);
              }}
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: "#6B7B9E" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          </motion.div>

          {/* Main chat card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl overflow-hidden flex flex-col"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            {/* Conversation Header */}
            <div
              className="flex items-center gap-4 px-5 py-4 border-b"
              style={{ borderColor: "#ECE6DA", backgroundColor: "#FFFFFF" }}
            >
              {search.profiles?.avatar_url ? (
                <img
                  src={search.profiles.avatar_url}
                  alt={search.profiles.full_name || "User"}
                  className="w-12 h-12 rounded-full object-cover border-2"
                  style={{ borderColor: "#D9BD8B" }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                  style={{ backgroundColor: "#6B7B9E" }}
                >
                  {search.profiles?.full_name?.charAt(0) || "U"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate" style={{ color: "#112150" }}>
                    {search.profiles?.full_name || "Utilisateur"}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "#E6F4EA", color: "#1E7A3E" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    En ligne
                  </span>
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: "#8A8275" }}>
                  Recherche : {search.title}
                </p>
              </div>

              <button
                onClick={() => navigate(`/recherche/${id}`)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#F5F0E8]"
                title="Voir l'annonce"
                aria-label="Voir l'annonce"
              >
                <Info className="w-5 h-5" style={{ color: "#6B7B9E" }} />
              </button>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 px-5 py-6 overflow-y-auto min-h-[420px] max-h-[520px]"
              style={{ backgroundColor: "#F5F0E8" }}
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  {/* Minimalist chat bubbles illustration */}
                  <svg
                    width="96"
                    height="80"
                    viewBox="0 0 96 80"
                    fill="none"
                    className="mb-5"
                  >
                    <path
                      d="M8 20a12 12 0 0 1 12-12h32a12 12 0 0 1 12 12v14a12 12 0 0 1-12 12H32l-10 8v-8h-2A12 12 0 0 1 8 34V20Z"
                      fill="#6B7B9E"
                      fillOpacity="0.18"
                      stroke="#6B7B9E"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M88 38a12 12 0 0 0-12-12H54a12 12 0 0 0-12 12v10a12 12 0 0 0 12 12h18l8 6v-6h-2a12 12 0 0 0 12-12V38Z"
                      fill="#6B7B9E"
                      fillOpacity="0.35"
                      stroke="#6B7B9E"
                      strokeWidth="1.5"
                    />
                  </svg>

                  <p className="text-lg font-semibold mb-1" style={{ color: "#112150" }}>
                    Commencez la conversation
                  </p>
                  <p className="text-sm max-w-sm" style={{ color: "#6B7280" }}>
                    Dites à {firstName} si vous avez l'article qu'il recherche 👋
                  </p>

                  {/* Quick suggestions */}
                  <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-md">
                    {QUICK_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="text-sm px-3.5 py-2 rounded-full bg-white border transition-all hover:-translate-y-0.5"
                        style={{
                          borderColor: "#D9D2C2",
                          color: "#6B7B9E",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date}>
                      <div className="flex items-center justify-center mb-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs"
                          style={{ backgroundColor: "#FFFFFF", color: "#8A8275", border: "1px solid #ECE6DA" }}
                        >
                          {formatDate(dayMessages[0].created_at)}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {dayMessages.map((msg) => {
                          const isMine = msg.sender_id === user?.id;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className="max-w-[72%] px-4 py-2.5"
                                style={{
                                  borderRadius: "18px",
                                  backgroundColor: isMine ? "#6B7B9E" : "#FFFFFF",
                                  color: isMine ? "#FFFFFF" : "#1F2937",
                                  border: isMine ? "none" : "1px solid #ECE6DA",
                                  boxShadow: isMine
                                    ? "0 1px 3px rgba(107,123,158,0.25)"
                                    : "0 1px 3px rgba(0,0,0,0.04)",
                                }}
                              >
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                  {msg.content}
                                </p>
                                <div
                                  className={`flex items-center gap-1 mt-1 ${
                                    isMine ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <span
                                    className="text-[11px]"
                                    style={{
                                      color: isMine ? "rgba(255,255,255,0.75)" : "#9CA3AF",
                                    }}
                                  >
                                    {formatTime(msg.created_at)}
                                  </span>
                                  {isMine &&
                                    (msg.is_read ? (
                                      <CheckCheck className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.85)" }} />
                                    ) : (
                                      <Check className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.6)" }} />
                                    ))}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div
              className="px-4 py-3 border-t bg-white"
              style={{ borderColor: "#ECE6DA" }}
            >
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[#F5F0E8] flex-shrink-0"
                  title="Joindre une photo"
                  aria-label="Joindre une photo"
                >
                  <Paperclip className="w-5 h-5" style={{ color: "#6B7B9E" }} />
                </button>

                <div className="flex-1 relative">
                  <Textarea
                    value={message}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_CHARS) setMessage(e.target.value);
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder={`Écrivez un message à ${firstName}...`}
                    className="resize-none min-h-[48px] pr-14 rounded-2xl border bg-white"
                    style={{ borderColor: "#D9D2C2" }}
                    rows={1}
                  />
                  <span
                    className="absolute right-3 bottom-2 text-[11px] tabular-nums"
                    style={{
                      color: remainingChars <= 20 ? "#C0392B" : "#9CA3AF",
                    }}
                  >
                    {remainingChars}
                  </span>
                </div>

                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  size="icon"
                  className="h-11 w-11 rounded-full text-white transition-all hover:-translate-y-0.5 hover:shadow-md flex-shrink-0"
                  style={{ backgroundColor: "#C9A96E" }}
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messaging;
