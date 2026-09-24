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
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.98 11.98 0 0 0 12 0 11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
            </svg>
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
