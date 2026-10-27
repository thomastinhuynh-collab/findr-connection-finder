import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { loadFeatureFlags } from "@/hooks/useFeatureFlags";
import { authCallbackUrl } from "@/lib/authRedirect";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; session: Session | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authEventReceived = false;
    let active = true;
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        authEventReceived = true;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        // Email de bienvenue après confirmation de l'adresse (le serveur garantit un envoi unique).
        const u = session?.user;
        if (event === "SIGNED_IN" && u?.email_confirmed_at) {
          const name = (u.user_metadata?.full_name || u.user_metadata?.name || "") as string;
          setTimeout(() => {
            supabase.functions
              .invoke("send-transactional-email", {
                body: { type: "welcome", userId: u.id, data: { firstName: name.split(" ")[0] } },
              })
              .catch((e) => console.error("welcome email failed:", e));
          }, 0);
        }
        // Invitation à la liste d'attente : une fois par session, non bloquante, erreurs ignorées.
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && u?.email_confirmed_at) {
          const key = `findr_waitlist_invite_${u.id}`;
          try {
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, "1");
          } catch {
            /* stockage indisponible : on tente quand même */
          }
          setTimeout(() => {
            loadFeatureFlags()
              .then((f) => (f.betaOpen ? null : supabase.functions.invoke("invite-to-waitlist", { body: {} })))
              .catch(() => {});
          }, 0);
        }
      }
    );

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active || authEventReceived) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authCallbackUrl(),
        data: {
          full_name: fullName,
        },
      },
    });


    return { error, session: data?.session ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
