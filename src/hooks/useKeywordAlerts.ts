import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const KEYWORD_ALERT_LIMIT = 10;

export interface KeywordAlert {
  id: string;
  keyword: string;
  created_at: string;
}

export const useKeywordAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<KeywordAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("keyword_alerts")
      .select("id, keyword, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setAlerts(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  /** Returns an error code, or null on success. */
  const addAlert = useCallback(
    async (rawKeyword: string): Promise<null | "unauthenticated" | "tooShort" | "limit" | "duplicate" | "error"> => {
      if (!user) return "unauthenticated";
      const keyword = rawKeyword.trim();
      if (keyword.length < 2) return "tooShort";
      if (alerts.length >= KEYWORD_ALERT_LIMIT) return "limit";
      if (alerts.some((a) => a.keyword.toLowerCase() === keyword.toLowerCase())) return "duplicate";

      setSaving(true);
      const { data, error } = await supabase
        .from("keyword_alerts")
        .insert({ user_id: user.id, keyword })
        .select("id, keyword, created_at")
        .single();
      setSaving(false);

      if (error) {
        const msg = error.message || "";
        if (msg.includes("keyword_alert_limit_reached")) return "limit";
        if (msg.includes("keyword_too_short")) return "tooShort";
        if (msg.includes("duplicate key")) return "duplicate";
        return "error";
      }
      if (data) setAlerts((cur) => [data, ...cur]);
      return null;
    },
    [user, alerts]
  );

  const removeAlert = useCallback(async (id: string) => {
    const { error } = await supabase.from("keyword_alerts").delete().eq("id", id);
    if (!error) setAlerts((cur) => cur.filter((a) => a.id !== id));
    return !error;
  }, []);

  return {
    alerts,
    loading,
    saving,
    limit: KEYWORD_ALERT_LIMIT,
    limitReached: alerts.length >= KEYWORD_ALERT_LIMIT,
    addAlert,
    removeAlert,
    refetch: fetchAlerts,
  };
};
