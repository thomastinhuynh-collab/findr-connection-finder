import { useTranslation } from "react-i18next";

const GOLD = "rgb(217, 187, 135)";
const NAVY = "#070E42";

interface Props {
  variant?: "gold" | "navy";
}

const LanguageSwitcher = ({ variant = "gold" }: Props) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("en") ? "en" : "fr";
  const base = variant === "gold" ? GOLD : NAVY;

  const langs: { code: "fr" | "en"; label: string }[] = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
  ];

  return (
    <div
      aria-label="Langue / Language"
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: `0.5px solid ${variant === "gold" ? "rgba(217, 187, 135, 0.4)" : "rgba(10,22,40,0.25)"}`,
        borderRadius: 24,
        overflow: "hidden",
      }}
    >
      {langs.map((l) => {
        const active = current === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => i18n.changeLanguage(l.code)}
            aria-pressed={active}
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              letterSpacing: "0.04em",
              padding: "7px 11px",
              border: "none",
              cursor: "pointer",
              background: active
                ? variant === "gold"
                  ? "rgba(217, 187, 135, 0.16)"
                  : "rgba(10,22,40,0.08)"
                : "transparent",
              color: active ? base : variant === "gold" ? "rgba(217, 187, 135, 0.6)" : "rgba(10,22,40,0.55)",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
