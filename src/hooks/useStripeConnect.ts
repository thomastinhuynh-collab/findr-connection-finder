import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Lance (ou reprend) l'onboarding Stripe Connect Express du findr
 * et redirige vers le lien hébergé par Stripe.
 */
export const useStripeConnect = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const startOnboarding = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-stripe-connect-account",
        { body: { origin: window.location.origin } },
      );
      if (error) throw error;
      if (!data?.url) throw new Error("Lien Stripe indisponible");
      window.location.href = data.url as string;
    } catch (err: any) {
      toast({
        title: "Configuration impossible",
        description: err?.message || "Réessaie dans un instant.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast]);

  return { startOnboarding, loading };
};

export default useStripeConnect;
