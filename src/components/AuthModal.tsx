import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { translateAuthError } from "@/lib/authErrors";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

const AuthModal = ({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const { error, session } = await signUp(email, password, fullName);
      if (error) {
        toast({
          title: "Erreur d'inscription",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      } else if (!session) {
        toast({
          title: "Inscription enregistrée",
          description: "Vérifie ta boîte mail pour confirmer ton inscription avant de te connecter",
        });
      } else {
        toast({
          title: "Inscription réussie !",
          description: "Bienvenue sur findr !",
        });
        onClose();
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Erreur de connexion",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connexion réussie !",
          description: "Content de vous revoir !",
        });
        onClose();
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-primary">
            {mode === "login" ? "Connexion" : "Inscription"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean@exemple.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
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
          <Button type="submit" className="w-full btn-hero" disabled={loading}>
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "S'inscrire"}
          </Button>
          {mode === "login" && (
            <p className="text-center">
              <button
                type="button"
                onClick={async () => {
                  if (!email) {
                    toast({
                      title: "Email requis",
                      description: "Entrez votre email ci-dessus pour recevoir le lien de réinitialisation.",
                      variant: "destructive",
                    });
                    return;
                  }
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  if (error) {
                    toast({ title: "Erreur", description: translateAuthError(error.message), variant: "destructive" });
                  } else {
                    toast({
                      title: "Email envoyé !",
                      description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
                    });
                  }
                }}
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </p>
          )}
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:underline font-medium"
            >
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
