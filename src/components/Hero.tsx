import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import HeaderActions from "@/components/HeaderActions";
import Logo from "@/components/Logo";

const GOLD = "rgb(217, 187, 135)";
const DARK = "#0A1628";

const navLinks = [
  { label: "Comment ça marche", to: "/comment-ca-marche" },
  { label: "Je deviens buyr", to: "/poster" },
  { label: "Je deviens findr", to: "/recherches" },
  { label: "Blog", to: "/blog" },
];

const categories = [
  { name: "Mode & Maroquinerie", slug: "Mode & Maroquinerie" },
  { name: "Pop Culture & TCG", slug: "Pop Culture & TCG" },
  { name: "Vinyles & Musique", slug: "Vinyles & Musique" },
  { name: "Photo & Électronique", slug: "Photo & Électronique" },
  { name: "Bijoux & Accessoires", slug: "Bijoux & Accessoires" },
];

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [searchCount, setSearchCount] = useState<number>(847);
  const [heroQuery, setHeroQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { count } = await supabase
          .from("searches")
          .select("id", { count: "exact", head: true })
          .eq("status", "active");
        if (typeof count === "number") setSearchCount(count);
      } catch {}
    })();
  }, []);

  const inter = { fontFamily: "'Inter', system-ui, sans-serif" };
  const playfair = { fontFamily: "'Playfair Display', Georgia, serif" };
  const borderLine = "0.5px solid rgba(217, 187, 135, 0.12)";


  return (
    <section
      style={{
        width: "100%",
        background: "linear-gradient(180deg, #0A1628 0%, #0F1F3D 100%)",
      }}
    >
      <div
        style={{
          position: isStuck ? "fixed" : "relative",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: isStuck
            ? "linear-gradient(180deg, #0A1628 0%, #0F1F3D 100%)"
            : "transparent",
          borderBottom: isStuck
            ? "0.5px solid rgba(217, 187, 135, 0.12)"
            : "0.5px solid transparent",
          boxShadow: isStuck ? "0 2px 20px rgba(0,0,0,0.25)" : "none",
          transition: "box-shadow 0.25s ease, background 0.25s ease",
        }}
      >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* ============ ZONE 1: NAV ============ */}
        <nav
          className="flex items-center"
          style={{
            padding: "20px 32px",
            gap: 40,
            borderBottom: borderLine,
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ flexShrink: 0, textDecoration: "none" }}>
            <Logo size={24} />
          </Link>

          {/* Center links */}
          <div
            className="hidden md:flex"
            style={{ flex: 1, justifyContent: "center", gap: 32 }}
          >
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  ...inter,
                  fontSize: 13,
                  fontWeight: 400,
                  color: "rgba(217, 187, 135, 0.75)",
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(217, 187, 135, 0.75)")
                }
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right buttons */}
          <div
            className="hidden md:flex items-center"
            style={{ flexShrink: 0, gap: 12 }}
          >
            {user && <HeaderActions variant="gold" />}
            <button
              onClick={() => navigate("/poster")}
              style={{
                ...inter,
                fontSize: 13,
                fontWeight: 400,
                color: GOLD,
                background: "transparent",
                border: "0.5px solid rgba(217, 187, 135, 0.4)",
                padding: "9px 20px",
                borderRadius: 24,
                cursor: "pointer",
              }}
            >
              Poster une recherche
            </button>
            <button
              onClick={() => (user ? navigate("/mon-espace") : setAuthOpen(true))}
              style={{
                ...inter,
                fontSize: 13,
                fontWeight: 500,
                color: DARK,
                background: GOLD,
                border: "none",
                padding: "9px 22px",
                borderRadius: 24,
                cursor: "pointer",
              }}
            >
              Mon espace
            </button>
          </div>

          {/* Mobile actions + burger */}
          {user && (
            <div className="md:hidden" style={{ marginLeft: "auto", marginRight: 4 }}>
              <HeaderActions variant="gold" />
            </div>
          )}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            style={{
              background: "transparent",
              border: "none",
              color: GOLD,
              fontSize: 22,
              cursor: "pointer",
              padding: 4,
            }}
          >
            {mobileOpen ? "×" : "≡"}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden"
            style={{
              padding: "16px 32px",
              borderBottom: borderLine,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  ...inter,
                  fontSize: 14,
                  color: "rgba(217, 187, 135, 0.85)",
                  textDecoration: "none",
                }}
              >
                {l.label}
              </Link>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/poster");
                }}
                style={{
                  ...inter,
                  fontSize: 13,
                  color: GOLD,
                  background: "transparent",
                  border: "0.5px solid rgba(217, 187, 135, 0.4)",
                  padding: "9px 18px",
                  borderRadius: 24,
                  flex: 1,
                }}
              >
                Poster
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  user ? navigate("/mon-espace") : setAuthOpen(true);
                }}
                style={{
                  ...inter,
                  fontSize: 13,
                  fontWeight: 500,
                  color: DARK,
                  background: GOLD,
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: 24,
                  flex: 1,
                }}
              >
                Mon espace
              </button>
            </div>
          </div>
        )}

        {/* ============ ZONE 2: CATEGORIES ============ */}
        <div
          className="hidden md:flex"
          style={{
            gap: 32,
            padding: "12px 32px",
            borderBottom: borderLine,
            alignItems: "center",
          }}
        >
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() =>
                navigate(`/recherches?category=${encodeURIComponent(c.slug)}`)
              }
              style={{
                ...inter,
                fontSize: 12,
                color: "rgba(217, 187, 135, 0.65)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: 0,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(217, 187, 135, 0.65)")
              }
            >
              {c.name}
              <span style={{ fontSize: 10 }}>▾</span>
            </button>
          ))}
        </div>

        {/* ============ ZONE 2.5: SEARCH BAR (dedicated row) ============ */}
        <div
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.02)",
            borderBottom: borderLine,
            padding: "14px 32px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = heroQuery.trim();
              navigate(`/recherches${q ? `?q=${encodeURIComponent(q)}` : ""}`);
            }}
            style={{
              width: "100%",
              maxWidth: 560,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#F5F1E8",
              border: "1px solid rgba(10,22,40,0.08)",
              borderRadius: 999,
              padding: "5px 5px 5px 18px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            }}
          >
            <span style={{ color: "rgba(10,22,40,0.55)", fontSize: 15, lineHeight: 1 }}>⌕</span>
            <input
              type="text"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder={`Chercher parmi les ${searchCount} recherches en cours…`}
              style={{
                ...inter,
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#0A1628",
                fontSize: 13,
                padding: "8px 0",
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              style={{
                ...inter,
                fontSize: 13,
                fontWeight: 600,
                color: GOLD,
                background: "#0A1628",
                border: "none",
                padding: "9px 22px",
                borderRadius: 999,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Rechercher
            </button>
          </form>
        </div>
      </div>
      </div>

      {/* Spacer to compensate for fixed header (only when stuck) */}
      {isStuck && (
        <>
          <div style={{ height: 168 }} className="hidden md:block" />
          <div style={{ height: 128 }} className="md:hidden" />
        </>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>

        {/* ============ ZONE 3: HERO CONTENT (compact) ============ */}
        <div
          style={{
            position: "relative",
            padding: "1.5rem 32px 1.25rem",
            color: GOLD,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Live badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(217, 187, 135, 0.08)",
              border: "0.5px solid rgba(217, 187, 135, 0.2)",
              borderRadius: 20,
              padding: "6px 14px",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: GOLD,
                display: "inline-block",
                animation: "pulse 1.8s ease-in-out infinite",
              }}
            />
            <span
              style={{
                ...inter,
                fontSize: 11,
                color: GOLD,
                letterSpacing: "0.5px",
              }}
            >
              847 recherches en direct
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              ...playfair,
              fontSize: "clamp(30px, 4.8vw, 46px)",
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: "-1px",
              color: GOLD,
              margin: "0 auto 0.75rem",
              maxWidth: 1100,
              whiteSpace: "nowrap",
            }}
          >
            L'objet que tu cherches{" "}
            <span style={{ fontStyle: "italic", fontWeight: 500 }}>
              existe quelque part.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              ...inter,
              fontSize: 15,
              fontWeight: 300,
              lineHeight: 1.6,
              color: "rgba(217, 187, 135, 0.75)",
              maxWidth: 560,
              margin: "0 auto 1.5rem",
            }}
          >
            Décris-le. Une communauté de chineurs passionnés le déniche pour toi.
          </p>

          {/* Simple CTA buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => navigate("/poster")}
              style={{
                ...inter,
                fontSize: 13,
                fontWeight: 500,
                color: DARK,
                background: GOLD,
                border: "none",
                padding: "12px 24px",
                borderRadius: 24,
                cursor: "pointer",
              }}
            >
              Poster une recherche
            </button>
            <button
              onClick={() => navigate("/recherches")}
              style={{
                ...inter,
                fontSize: 13,
                fontWeight: 500,
                color: GOLD,
                background: "transparent",
                border: `1px solid ${GOLD}`,
                padding: "12px 24px",
                borderRadius: 24,
                cursor: "pointer",
              }}
            >
              Devenir findr
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        .hero-cta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 768px) {
          .hero-cta-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode="signup"
      />
    </section>
  );
};

export default Hero;
