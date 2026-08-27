import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Vérifie le rôle admin via la table dédiée user_roles.
 * ⚠️ Ce hook ne sert qu'à l'affichage : toutes les actions sensibles
 * sont re-vérifiées côté serveur (Edge Function resolve-dispute).
 */
export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const check = async () => {
      if (!user) {
        if (active) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (active) {
        setIsAdmin(!!data);
        setLoading(false);
      }
    };
    setLoading(true);
    check();
    return () => {
      active = false;
    };
  }, [user]);

  return { isAdmin, loading };
};
