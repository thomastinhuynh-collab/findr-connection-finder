import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";

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
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "linear-gradient(180deg, #0A1628 0%, #0F1F3D 100%)",
          borderBottom: "0.5px solid rgba(217, 187, 135, 0.12)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.25)",
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
            <span
              style={{
                ...playfair,
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: "-0.3px",
                color: GOLD,
              }}
            >
              findr
            </span>
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

          {/* Mobile burger */}
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

          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("q") as HTMLInputElement);
              const q = input?.value.trim();
              navigate(`/recherches${q ? `?q=${encodeURIComponent(q)}` : ""}`);
            }}
            style={{
              marginLeft: "auto",
              flex: "1 1 340px",
              maxWidth: 440,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              border: "0.5px solid rgba(217, 187, 135, 0.4)",
              borderRadius: 24,
              padding: "5px 5px 5px 16px",
            }}
          >
            <span style={{ color: "rgba(217, 187, 135, 0.6)", fontSize: 14 }}>⌕</span>
            <input
              type="text"
              name="q"
              placeholder="Rechercher un objet, une marque…"
              style={{
                ...inter,
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: GOLD,
                fontSize: 13,
                padding: "4px 0",
              }}
            />
            <button
              type="submit"
              style={{
                ...inter,
                fontSize: 12,
                fontWeight: 500,
                color: GOLD,
                background: "transparent",
                border: "0.5px solid rgba(217, 187, 135, 0.4)",
                padding: "6px 16px",
                borderRadius: 20,
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

      {/* Spacer to compensate for fixed header */}
      <div style={{ height: 112 }} className="hidden md:block" />
      <div style={{ height: 64 }} className="md:hidden" />

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
