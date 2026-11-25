import { useCallback, useEffect, useState } from "react";
import { Bell, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUnreadExchanges } from "@/hooks/useUnreadExchanges";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadExchanges = useUnreadExchanges();
  const { pathname } = useLocation();
  const onMessaging = pathname === "/messagerie" || pathname.startsWith("/messagerie/");

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

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    const channel = supabase
      .channel(`header-actions-${user.id}-${Math.random().toString(36).slice(2)}`)
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

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
      {/* Messagerie : lien direct, chiffre doré = conversations avec des non lus */}
      <Link
        to="/messagerie"
        aria-label={t("messagingList.envelopeAria", { count: unreadExchanges })}
        aria-current={onMessaging ? "page" : undefined}
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ ...iconButtonStyle, color: onMessaging ? GOLD : color, minWidth: 44, minHeight: 44 }}
      >
        <Mail size={20} strokeWidth={onMessaging ? 2 : 1.6} />
        {unreadExchanges > 0 && (
          <span
            aria-hidden="true"
            style={{ position: "absolute", top: 2, right: 0, minWidth: 18, height: 18, padding: "0 4px", borderRadius: 999,
              background: GOLD, color: NAVY, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          >
            {unreadExchanges > 9 ? "9+" : unreadExchanges}
          </span>
        )}
      </Link>

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
             <h3 className="font-semibold text-sm text-primary">{t("headerActions.notifications")}</h3>
            {unreadNotifs > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                 {t("headerActions.markAllRead")}
              </button>
            )}
          </div>
          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                 {t("headerActions.noNotification")}
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
