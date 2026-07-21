import { Link } from "react-router-dom";

const GOLD = "rgb(217, 187, 135)";
const DARK = "#0A1628";

const inter = { fontFamily: "'Inter', system-ui, sans-serif" };
const playfair = { fontFamily: "'Playfair Display', Georgia, serif" };

const BuyrFindrSection = () => {
  return (
    <section
      style={{
        width: "100%",
        background: "linear-gradient(180deg, #0A1628 0%, #0F1F3D 100%)",
        padding: "5rem 32px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              ...inter,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: 3,
              color: "rgba(217, 187, 135, 0.6)",
              marginBottom: "1rem",
            }}
          >
            — REJOINS LA COMMUNAUTÉ
          </div>
          <h2
            style={{
              ...playfair,
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.5px",
              color: GOLD,
              margin: 0,
            }}
          >
            Deux façons de{" "}
            <span style={{ fontStyle: "italic", fontWeight: 500 }}>
              vivre findr.
            </span>
          </h2>
        </div>

        <div
          className="buyr-findr-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          {/* Left card — buyr */}
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: GOLD,
              borderRadius: 16,
              padding: "40px 36px",
            }}
          >
            <span
              style={{
                ...playfair,
                position: "absolute",
                top: 12,
                right: 24,
                fontStyle: "italic",
                fontSize: 90,
                lineHeight: 1,
                color: "rgba(10, 22, 40, 0.08)",
              }}
            >
              b
            </span>
            <div
              style={{
                ...inter,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: 2,
                color: "rgba(10, 22, 40, 0.55)",
                marginBottom: 16,
              }}
            >
              01 — JE CHERCHE
            </div>
            <div
              style={{
                ...playfair,
                fontSize: 32,
                fontWeight: 500,
                letterSpacing: "-0.5px",
                color: DARK,
                marginBottom: 12,
              }}
            >
              Je suis <span style={{ fontStyle: "italic" }}>buyr</span>
            </div>
            <p
              style={{
                ...inter,
                fontSize: 15,
                lineHeight: 1.6,
                color: "rgba(10, 22, 40, 0.75)",
                marginBottom: 28,
                maxWidth: 380,
              }}
            >
              Je poste ma recherche en quelques secondes. Les findr partent en
              chasse et me trouvent la perle rare, où qu'elle se cache.
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
              borderRadius: 16,
              padding: "40px 36px",
            }}
          >
            <span
              style={{
                ...playfair,
                position: "absolute",
                top: 12,
                right: 24,
                fontStyle: "italic",
                fontSize: 90,
                lineHeight: 1,
                color: "rgba(217, 187, 135, 0.12)",
              }}
            >
              f
            </span>
            <div
              style={{
                ...inter,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: 2,
                color: "rgba(217, 187, 135, 0.55)",
                marginBottom: 16,
              }}
            >
              02 — JE DÉNICHE
            </div>
            <div
              style={{
                ...playfair,
                fontSize: 32,
                fontWeight: 500,
                letterSpacing: "-0.5px",
                color: GOLD,
                marginBottom: 12,
              }}
            >
              Je deviens <span style={{ fontStyle: "italic" }}>findr</span>
            </div>
            <p
              style={{
                ...inter,
                fontSize: 15,
                lineHeight: 1.6,
                color: "rgba(217, 187, 135, 0.75)",
                marginBottom: 28,
                maxWidth: 380,
              }}
            >
              Je monétise mon flair, mon carnet d'adresses et mes bons plans.
              Chaque trouvaille devient une opportunité.
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
      </div>

      <style>{`
        @media (max-width: 768px) {
          .buyr-findr-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default BuyrFindrSection;
