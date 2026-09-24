import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { translateAuthError } from "@/lib/authErrors";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const handleGoogleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      toast({
        title: t("auth.loginError"),
        description: translateAuthError(result.error.message),
        variant: "destructive",
      });
      return;
    }

    if (result.redirected) {
      // The browser is navigating to Google — nothing more to do here.
      return;
    }

    toast({
      title: t("auth.loginSuccess"),
      description: t("auth.welcomeBack"),
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const { error, session } = await signUp(email, password, fullName);
      if (error) {
        toast({
          title: t("auth.signupError"),
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      } else if (!session) {
        toast({
          title: t("auth.signupSaved"),
          description: t("auth.confirmEmail"),
        });
      } else {
        toast({
          title: t("auth.signupSuccess"),
          description: t("auth.welcome"),
        });
        onClose();
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: t("auth.loginError"),
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("auth.loginSuccess"),
          description: t("auth.welcomeBack"),
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
            {mode === "login" ? t("auth.login") : t("auth.signup")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">{t("auth.fullName")}</Label>
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
              placeholder={t("auth.emailPlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
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
            {loading ? t("auth.loading") : mode === "login" ? t("auth.signIn") : t("auth.signUp")}
          </Button>
          <div className="flex items-center gap-3 my-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">{t("auth.orDivider")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <span aria-hidden="true" className="font-display font-bold text-base leading-none">G</span>
            {t("auth.googleSignIn")}
          </Button>
          {mode === "login" && (
            <p className="text-center">
              <button
                type="button"
                onClick={async () => {
                  if (!email) {
                    toast({
                      title: t("auth.emailRequired"),
                      description: t("auth.resetPrompt"),
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
                       title: t("auth.emailSent"),
                       description: t("auth.resetSent"),
                    });
                  }
                }}
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                {t("auth.forgotPassword")}
              </button>
            </p>
          )}
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:underline font-medium"
            >
              {mode === "login" ? t("auth.signUp") : t("auth.signIn")}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
