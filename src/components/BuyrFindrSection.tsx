import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const GOLD = "rgb(217, 187, 135)";
const DARK = "#070E42";

const inter = { fontFamily: "'Inter', system-ui, sans-serif" };
const playfair = { fontFamily: "'Playfair Display', Georgia, serif" };

const BuyrFindrSection = () => {
  const { t } = useTranslation();
  return (
    <section
      style={{
        width: "100%",
        background: "linear-gradient(180deg, #070E42 0%, #0F1F3D 100%)",
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
            {t("buyrFindr.eyebrow")}
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
            {t("buyrFindr.titleLine1")}{" "}
            <span style={{ fontStyle: "italic", fontWeight: 500 }}>
              {t("buyrFindr.titleLine2")}
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
              {t("buyrFindr.buyr.eyebrow")}
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
              {t("buyrFindr.buyr.title")} <span style={{ fontStyle: "italic" }}>buyr</span>
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
              {t("buyrFindr.buyr.text")}
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
              {t("buyrFindr.buyr.cta")}
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
              {t("buyrFindr.findr.eyebrow")}
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
              {t("buyrFindr.findr.title")} <span style={{ fontStyle: "italic" }}>findr</span>
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
              {t("buyrFindr.findr.text")}
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
              {t("buyrFindr.findr.cta")}
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
