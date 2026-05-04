import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWaitlist() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.rpc("get_waitlist_count").then(({ data }) => {
      if (typeof data === "number") setCount(data);
    });
  }, []);

  const submit = async (email: string, role: "buyr" | "findr" | "unknown" = "unknown") => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Merci d'entrer une adresse email valide.");
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("waitlist").insert({ email: trimmed, role });
      if (error) {
        if (error.code === "23505") {
          toast.info("Tu es déjà inscrit(e) sur la liste d'attente !");
          setSubmitted(true);
        } else {
          toast.error("Une erreur est survenue. Réessaie plus tard.");
        }
        return false;
      }
      setSubmitted(true);
      setCount((prev) => (prev !== null ? prev + 1 : 1));
      toast.success("🎉 Tu es sur la liste ! On te prévient dès l'ouverture.");
      return true;
    } catch {
      toast.error("Une erreur est survenue.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { count, loading, submitted, submit };
}
