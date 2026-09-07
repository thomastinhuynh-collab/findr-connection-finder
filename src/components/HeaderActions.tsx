import { useCallback, useEffect, useState } from "react";
import { Bell, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const GOLD = "rgb(217, 187, 135)";
const NAVY = "#070E42";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface MessageRow {
  id: string;
  search_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean | null;
  created_at: string;
}

interface Conversation {
  key: string;
  searchId: string;
  partnerId: string;
  partnerName: string;
  lastContent: string;
  lastAt: string;
  unread: number;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  return date.toLocaleDateString("fr-FR");
};

interface HeaderActionsProps {
  /** gold = dark header (homepage), navy = light header */
  variant?: "gold" | "navy";
}

const HeaderActions = ({ variant = "navy" }: HeaderActionsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);

  const color = variant === "gold" ? GOLD : NAVY;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data as NotificationRow[]);
  }, [user]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(120);
    if (!data) return;

    const rows = data as MessageRow[];
    const partnerIds = Array.from(
      new Set(
        rows.map((m) => (m.sender_id === user.id ? m.receiver_id : m.sender_id))
      )
    );

    let names: Record<string, string> = {};
    if (partnerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", partnerIds);
      (profiles || []).forEach((p: any) => {
        names[p.user_id] = p.full_name || "Utilisateur";
      });
    }

    const map = new Map<string, Conversation>();
    rows.forEach((m) => {
      const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      const key = `${m.search_id}:${partnerId}`;
      const existing = map.get(key);
      const isUnread = m.receiver_id === user.id && !m.is_read;
      if (!existing) {
        map.set(key, {
          key,
          searchId: m.search_id,
          partnerId,
          partnerName: names[partnerId] || "Utilisateur",
          lastContent: m.content,
          lastAt: m.created_at,
          unread: isUnread ? 1 : 0,
        });
      } else if (isUnread) {
        existing.unread += 1;
      }
    });

    setConversations(
      Array.from(map.values()).sort(
        (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
      )
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    fetchConversations();

    const channel = supabase
      .channel(`header-actions-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchNotifications()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications, fetchConversations]);

  const markNotificationRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (!user) return null;

  const unreadNotifs = notifications.filter((n) => !n.is_read).length;
  const unreadMsgs = conversations.reduce((sum, c) => sum + c.unread, 0);

  const iconButtonStyle: React.CSSProperties = {
    position: "relative",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color,
    padding: 6,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 0,
  };

  const badge = (count: number) => (
    <span
      style={{
        position: "absolute",
        top: -2,
        right: -2,
        minWidth: 17,
        height: 17,
        padding: "0 4px",
        borderRadius: 999,
        background: "#E05A47",
        color: "#fff",
        fontSize: 10,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {count > 9 ? "9+" : count}
    </span>
  );

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {/* Messages */}
      <Popover open={msgOpen} onOpenChange={setMsgOpen}>
        <PopoverTrigger asChild>
          <button style={iconButtonStyle} aria-label="Messages">
            <Mail size={20} strokeWidth={1.6} />
            {unreadMsgs > 0 && badge(unreadMsgs)}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-background" align="end">
          <div className="p-3 border-b border-border">
            <h3 className="font-semibold text-sm text-primary">Messages</h3>
          </div>
          <ScrollArea className="h-[300px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Aucune conversation
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((c) => (
                  <button
                    key={c.key}
                    className={`w-full text-left p-3 hover:bg-secondary/50 transition-colors ${
                      c.unread > 0 ? "bg-accent/10" : ""
                    }`}
                    onClick={() => {
                      setMsgOpen(false);
                      navigate(`/messagerie/${c.searchId}?with=${c.partnerId}`);
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-primary truncate">
                        {c.partnerName}
                      </span>
                      {c.unread > 0 && (
                        <span className="text-[10px] font-semibold text-white bg-[#E05A47] rounded-full px-1.5 py-0.5">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {c.lastContent}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {formatTime(c.lastAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Notifications */}
      <Popover open={notifOpen} onOpenChange={setNotifOpen}>
        <PopoverTrigger asChild>
          <button style={iconButtonStyle} aria-label="Notifications">
            <Bell size={20} strokeWidth={1.6} />
            {unreadNotifs > 0 && badge(unreadNotifs)}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-background" align="end">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="font-semibold text-sm text-primary">Notifications</h3>
            {unreadNotifs > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Tout marquer lu
              </button>
            )}
          </div>
          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Aucune notification
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    className={`w-full text-left p-3 hover:bg-secondary/50 transition-colors ${
                      !n.is_read ? "bg-accent/10" : ""
                    }`}
                    onClick={() => {
                      markNotificationRead(n.id);
                      setNotifOpen(false);
                      if (n.link) {
                        if (/^https?:\/\//.test(n.link)) {
                          window.open(n.link, "_blank", "noopener,noreferrer");
                        } else {
                          navigate(n.link);
                        }
                      }

                    }}
                  >
                    <div className="flex gap-2">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          n.is_read ? "bg-muted" : "bg-accent"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {formatTime(n.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default HeaderActions;
