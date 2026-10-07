import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useWaitlist() {
  const { t } = useTranslation();
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const shownAt = useRef(Date.now());

  useEffect(() => {
    supabase.rpc("get_waitlist_count").then(({ data }) => {
      if (typeof data === "number") setCount(data);
    });
  }, []);

  const submit = async (
    email: string,
    role: "buyr" | "findr" | "unknown" = "unknown",
    honeypot = "",
  ) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error(t("waitlistSignup.errors.invalidEmail"));
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("join-waitlist", {
        body: {
          email: trimmed,
          role,
          website: honeypot,
          elapsed_ms: Date.now() - shownAt.current,
        },
      });
      if (error) {
        const status = (error as { context?: Response }).context?.status;
        toast.error(t(status === 429 ? "waitlistSignup.errors.rateLimited" : "waitlistSignup.errors.generic"));
        return false;
      }
      if (!data?.ok) {
        toast.error(t("waitlistSignup.errors.generic"));
        return false;
      }
      setSubmitted(true);
      toast.success(t("waitlistSignup.checkEmail"));
      return true;
    } catch {
      toast.error(t("waitlistSignup.errors.generic"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { count, loading, submitted, submit };
}

/** Affiche le résultat d'une confirmation (?confirmed=1|0) puis nettoie l'URL. */
export function useWaitlistConfirmationNotice() {
  const { t } = useTranslation();
  useEffect(() => {
    const url = new URL(window.location.href);
    const c = url.searchParams.get("confirmed");
    if (c !== "1" && c !== "0") return;
    if (c === "1") toast.success(t("waitlistSignup.confirmed"));
    else toast.error(t("waitlistSignup.confirmInvalid"));
    url.searchParams.delete("confirmed");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }, [t]);
}
