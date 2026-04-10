import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { Lock, CheckCircle, CircleAlert } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"checking" | "ready" | "invalid" | "success">("checking");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);

    const hasRecoveryContext =
      hashParams.get("type") === "recovery" ||
      searchParams.get("type") === "recovery" ||
      hashParams.has("access_token") ||
      hashParams.has("refresh_token") ||
      searchParams.has("access_token") ||
      searchParams.has("refresh_token") ||
      searchParams.has("token_hash") ||
      searchParams.has("code");

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || session) {
        setStatus("ready");
      }
    });

    const checkRecoveryAccess = async () => {
      if (hasRecoveryContext && mounted) {
        setStatus("ready");
      }

      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;
      setStatus(session || hasRecoveryContext ? "ready" : "invalid");
    };

    void checkRecoveryAccess();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStatus("success");
      toast({
        title: "Mot de passe mis à jour !",
        description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
      });
      setTimeout(() => navigate("/"), 3000);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "#112150" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo variant="light" />
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-vintage">
          {status === "checking" && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground text-lg">Chargement de la page de réinitialisation...</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="text-center space-y-4">
              <CircleAlert className="w-16 h-16 text-accent mx-auto" />
              <h1 className="text-2xl font-display font-bold text-primary">Lien invalide ou expiré</h1>
              <p className="text-muted-foreground">
                Redemandez un email de réinitialisation depuis la page de connexion.
              </p>
              <Button type="button" className="w-full btn-hero" onClick={() => navigate("/")}>
                Retour à l'accueil
              </Button>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-accent mx-auto" />
              <h1 className="text-2xl font-display font-bold text-primary">Mot de passe modifié !</h1>
              <p className="text-muted-foreground">Redirection vers l'accueil...</p>
            </div>
          )}

          {status === "ready" && (
            <>
              <div className="text-center mb-6">
                <Lock className="w-12 h-12 text-accent mx-auto mb-4" />
                <h1 className="text-2xl font-display font-bold text-primary">Nouveau mot de passe</h1>
                <p className="text-muted-foreground mt-2">
                  Choisissez un nouveau mot de passe pour votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full btn-hero" disabled={loading}>
                  {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

