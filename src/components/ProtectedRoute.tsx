import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import { clearAuthDestination, readAuthDestination, rememberAuthDestination, safeAuthDestination } from "@/lib/authRedirect";

export function AuthContinuation() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading || location.pathname === "/reset-password") return;
    const callback = location.pathname === "/auth/callback";
    const fromUrl = callback ? safeAuthDestination(new URLSearchParams(location.search).get("next")) : null;
    if (!user) {
      if (fromUrl) rememberAuthDestination(fromUrl);
      return;
    }
    const destination = fromUrl || readAuthDestination();
    if (destination || callback) {
      clearAuthDestination();
      const target = destination || "/";
      if (target !== `${location.pathname}${location.search}${location.hash}`) navigate(target, { replace: true });
    }
  }, [user?.id, loading, location.pathname, location.search, location.hash, navigate]);
  return null;
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const path = `${location.pathname}${location.search}${location.hash}`;
  useEffect(() => {
    if (!loading && !user) {
      rememberAuthDestination(path);
      setOpen(true);
    }
  }, [user?.id, loading, path]);
  if (loading) return null;
  if (user) return <>{children}</>;
  return <AuthModal isOpen={open} onClose={() => setOpen(false)} />;
}

export function AuthCallback() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(true);
  if (loading || user) return null;
  return <AuthModal isOpen={open} onClose={() => setOpen(false)} />;
}