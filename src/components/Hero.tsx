import { useState } from "react";
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
    <section className="pt-4 px-3 md:px-6 pb-8" style={{ backgroundColor: DARK }}>
      <div
        className="mx-auto max-w-[1240px] relative"
        style={{
          borderRadius: 16,
          overflow: "hidden",
          background: "linear-gradient(180deg, #0A1628 0%, #0F1F3D 100%)",
          border: "0.5px solid rgba(217, 187, 135, 0.15)",
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

        {/* ============ ZONE 3: HERO CONTENT ============ */}
        <div
          style={{
            position: "relative",
            padding: "3rem 2.5rem 2.5rem",
            color: GOLD,
          }}
        >
          {/* Live badge */}
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 32,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(217, 187, 135, 0.08)",
              border: "0.5px solid rgba(217, 187, 135, 0.2)",
              borderRadius: 20,
              padding: "6px 14px",
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

          {/* Eyebrow */}
          <div
            style={{
              ...inter,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: 3,
              color: "rgba(217, 187, 135, 0.6)",
              marginBottom: "1.5rem",
              marginTop: 8,
            }}
          >
            — MARKETPLACE INVERSÉE
          </div>

          {/* Title */}
          <h1
            style={{
              ...playfair,
              fontSize: "clamp(34px, 5.5vw, 52px)",
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-1px",
              color: GOLD,
              margin: 0,
              marginBottom: "1.25rem",
            }}
          >
            L'objet que tu cherches
            <br />
            <span style={{ fontStyle: "italic", fontWeight: 500 }}>
              existe quelque part.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              ...inter,
              fontSize: 16,
              fontWeight: 300,
              lineHeight: 1.6,
              color: "rgba(217, 187, 135, 0.75)",
              maxWidth: 460,
              marginBottom: "2.5rem",
            }}
          >
            Décris-le. Une communauté de chineurs passionnés le déniche pour toi.
          </p>

          {/* CTA cards */}
          <div className="hero-cta-grid" style={{ marginBottom: "2rem" }}>
            {/* Left card — buyr */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                background: GOLD,
                borderRadius: 12,
                padding: 22,
              }}
            >
              <span
                style={{
                  ...playfair,
                  position: "absolute",
                  top: 8,
                  right: 14,
                  fontStyle: "italic",
                  fontSize: 42,
                  lineHeight: 1,
                  color: "rgba(10, 22, 40, 0.1)",
                }}
              >
                b
              </span>
              <div
                style={{
                  ...inter,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: 2,
                  color: "rgba(10, 22, 40, 0.55)",
                  marginBottom: 12,
                }}
              >
                01 — JE CHERCHE
              </div>
              <div
                style={{
                  ...playfair,
                  fontSize: 24,
                  fontWeight: 500,
                  letterSpacing: "-0.3px",
                  color: DARK,
                  marginBottom: 6,
                }}
              >
                Je suis <span style={{ fontStyle: "italic" }}>buyr</span>
              </div>
              <p
                style={{
                  ...inter,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "rgba(10, 22, 40, 0.7)",
                  marginBottom: 18,
                }}
              >
                Je poste ma recherche. Les findr me trouvent la perle rare.
              </p>
              <Link
                to="/poster"
                style={{
                  ...inter,
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: DARK,
                  borderBottom: `1px solid ${DARK}`,
                  paddingBottom: 2,
                  textDecoration: "none",
                }}
              >
                POSTER MA RECHERCHE →
              </Link>
            </div>

            {/* Right card — findr */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                background: "rgba(217, 187, 135, 0.05)",
                border: "0.5px solid rgba(217, 187, 135, 0.25)",
                borderRadius: 12,
                padding: 22,
              }}
            >
              <span
                style={{
                  ...playfair,
                  position: "absolute",
                  top: 8,
                  right: 14,
                  fontStyle: "italic",
                  fontSize: 42,
                  lineHeight: 1,
                  color: "rgba(217, 187, 135, 0.15)",
                }}
              >
                f
              </span>
              <div
                style={{
                  ...inter,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: 2,
                  color: "rgba(217, 187, 135, 0.55)",
                  marginBottom: 12,
                }}
              >
                02 — JE DÉNICHE
              </div>
              <div
                style={{
                  ...playfair,
                  fontSize: 24,
                  fontWeight: 500,
                  letterSpacing: "-0.3px",
                  color: GOLD,
                  marginBottom: 6,
                }}
              >
                Je deviens <span style={{ fontStyle: "italic" }}>findr</span>
              </div>
              <p
                style={{
                  ...inter,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "rgba(217, 187, 135, 0.7)",
                  marginBottom: 18,
                }}
              >
                Je monétise mon flair et mon carnet d'adresses.
              </p>
              <Link
                to="/recherches"
                style={{
                  ...inter,
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: GOLD,
                  borderBottom: `1px solid ${GOLD}`,
                  paddingBottom: 2,
                  textDecoration: "none",
                }}
              >
                REJOINDRE LES FINDR →
              </Link>
            </div>
          </div>

          {/* Social proof + stats */}
          <div
            className="hero-bottom"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              paddingTop: "1.75rem",
              borderTop: "0.5px solid rgba(217, 187, 135, 0.15)",
              flexWrap: "wrap",
            }}
          >
            {/* Avatars */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {[
                { bg: "#C4A574", label: "M", color: DARK },
                { bg: "#8B6F47", label: "L", color: GOLD },
                { bg: "#A68A5B", label: "J", color: DARK },
                {
                  bg: "rgba(217, 187, 135, 0.15)",
                  label: "+840",
                  color: GOLD,
                  small: true,
                },
              ].map((a, i) => (
                <div
                  key={i}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: `2px solid ${DARK}`,
                    background: a.bg,
                    marginLeft: i === 0 ? 0 : -8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...(a.small
                      ? { ...inter, fontSize: 9 }
                      : { ...playfair, fontSize: 10, fontWeight: 500 }),
                    color: a.color,
                  }}
                >
                  {a.label}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
              {[
                { n: "98", u: "%", l: "Objets trouvés" },
                { n: "72", u: "h", l: "Délai moyen" },
                { n: "840", u: "+", l: "Chineurs actifs" },
              ].map((s) => (
                <div key={s.l}>
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <span
                      style={{
                        ...playfair,
                        fontSize: 24,
                        fontWeight: 500,
                        color: GOLD,
                        lineHeight: 1,
                      }}
                    >
                      {s.n}
                    </span>
                    <span
                      style={{
                        ...playfair,
                        fontSize: 14,
                        color: "rgba(217, 187, 135, 0.55)",
                        marginLeft: 2,
                      }}
                    >
                      {s.u}
                    </span>
                  </div>
                  <div
                    style={{
                      ...inter,
                      fontSize: 11,
                      color: "rgba(217, 187, 135, 0.6)",
                      letterSpacing: "0.3px",
                      marginTop: 2,
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
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
