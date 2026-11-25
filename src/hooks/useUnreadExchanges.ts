import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Nombre d'échanges ayant au moins un message non lu (chiffre doré de la Messagerie). */
export function useUnreadExchanges(): number {
  const { user } = useAuth();
  const uid = user?.id;
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!uid) { setCount(0); return; }
    const { data } = await supabase.rpc("unread_exchanges_count");
    setCount(typeof data === "number" ? data : 0);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    load();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => { clearTimeout(timer); timer = setTimeout(load, 400); };
    // Nouveau message reçu ou message marqué comme lu.
    const channel = supabase
      .channel(`unread-exchanges-${uid}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${uid}` }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `receiver_id=eq.${uid}` }, refresh)
      .subscribe();
    return () => { clearTimeout(timer); supabase.removeChannel(channel); };
  }, [uid, load]);

  return count;
}
