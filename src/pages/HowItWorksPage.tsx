import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

const NAVY = "#070E42";
const GOLD = "#D9BB87";
const GOLD_GREY = "#9C8B6B";

type SectionKey = "buyr" | "findr" | "etapes" | "reservation" | "frais" | "savoir-vivre";

const anchors: { key: SectionKey; labelKey: string }[] = [
  { key: "buyr", labelKey: "buyr" },
  { key: "findr", labelKey: "findr" },
  { key: "etapes", labelKey: "etapes" },
  { key: "reservation", labelKey: "reservation" },
  { key: "frais", labelKey: "frais" },
  { key: "savoir-vivre", labelKey: "savoirVivre" },
];

const romans: Record<SectionKey, string> = {
  buyr: "I",
  findr: "II",
  etapes: "III",
  reservation: "IV",
  frais: "V",
  "savoir-vivre": "VI",
};

const listKeys = ["i1", "i2", "i3", "i4"];
const stepKeys = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];
const etiquetteKeys = ["r1", "r2", "r3", "r4", "r5", "r6"];

const Dash = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-3" style={{ color: "#4B5563", fontSize: 13.5, lineHeight: 1.65 }}>
    <span style={{ color: GOLD, flexShrink: 0 }}>—</span>
    <span>{children}</span>
  </li>
);

const HowItWorksPage = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState<SectionKey | null>("buyr");
  const [showStepDetails, setShowStepDetails] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState<SectionKey>("buyr");
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const onScroll = () => {
      let current: SectionKey = anchors[0].key;
      anchors.forEach(({ key }) => {
        const el = refs.current[key];
        if (el && el.getBoundingClientRect().top <= 160) current = key;
      });
      setActiveAnchor(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (key: SectionKey) => {
    setOpen(key);
    setActiveAnchor(key);
    setTimeout(() => {
      const el = refs.current[key];
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 130;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 60);
  };

  const toggle = (key: SectionKey) => setOpen((cur) => (cur === key ? null : key));

  const renderRow = (
    key: SectionKey,
    title: React.ReactNode,
    summary: string | null,
    content: React.ReactNode
  ) => {
    const isOpen = open === key;
    return (
      <div
        key={key}
        ref={(el) => (refs.current[key] = el)}
        style={{
          borderBottom: "1px solid rgba(10,22,40,0.08)",
          borderLeft: isOpen ? `2px solid ${GOLD}` : "2px solid transparent",
          backgroundColor: isOpen ? "rgba(217,187,135,0.04)" : "transparent",
          transition: "background-color 200ms ease",
        }}
      >
        <button
          onClick={() => toggle(key)}
          aria-expanded={isOpen}
          className="w-full flex items-start text-left"
          style={{ padding: "26px 22px", gap: 18 }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              width: 24,
              flexShrink: 0,
              color: isOpen ? GOLD : GOLD_GREY,
              lineHeight: "26px",
            }}
          >
            {romans[key]}
          </span>
          <span className="flex-1 min-w-0">
            <span
              className="block font-barlow"
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontStyle: "normal",
                color: NAVY,
                lineHeight: 1.35,
              }}
            >
              {title}
            </span>
            {summary && (
              <span
                className="block"
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.12em",
                  color: GOLD_GREY,
                  marginTop: 6,
                }}
              >
                {summary}
              </span>
            )}
          </span>
          <span
            style={{
              color: GOLD_GREY,
              fontSize: 20,
              fontWeight: 300,
              lineHeight: "26px",
              flexShrink: 0,
            }}
            aria-hidden
          >
            {isOpen ? "−" : "+"}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ paddingLeft: 66, paddingRight: 22, paddingBottom: 30 }}>
                {content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <Navbar />

      {/* Hero */}
      <section
        style={{ backgroundColor: NAVY, paddingTop: 56 + 64, paddingBottom: 48 }}
      >
        <div className="text-center" style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <p style={{ color: GOLD, fontSize: 11, letterSpacing: "0.22em", marginBottom: 14 }}>
            {t("howItWorks.eyebrow")}
          </p>
          <h1
            className="font-barlow"
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#F5F1E8",
              lineHeight: 1.3,
            }}
          >
            {t("howItWorks.title")}
          </h1>
          <div
            style={{
              width: 44,
              height: 1,
              backgroundColor: GOLD,
              margin: "18px auto",
            }}
          />
          <p style={{ color: "rgba(245,241,232,0.7)", fontSize: 14.5 }}>
            {t("howItWorks.subtitle")}
          </p>
        </div>
      </section>

      {/* Sticky anchor bar */}
      <nav
        className="sticky top-0 z-40"
        style={{ backgroundColor: NAVY, borderTop: "1px solid rgba(217,187,135,0.15)" }}
      >
        <div
          className="flex items-center justify-center gap-6 overflow-x-auto no-scrollbar"
          style={{ padding: "0 16px" }}
        >
          {anchors.map((a) => {
            const active = activeAnchor === a.key;
            return (
              <button
                key={a.key}
                onClick={() => goTo(a.key)}
                className="whitespace-nowrap"
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.16em",
                  color: active ? GOLD : "rgba(217,187,135,0.6)",
                  padding: "13px 2px",
                  borderBottom: active ? `1px solid ${GOLD}` : "1px solid transparent",
                }}
              >
                {t(`howItWorks.anchors.${a.labelKey}`)}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Accordion list */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 64px" }}>
        <div style={{ borderTop: "1px solid rgba(10,22,40,0.08)" }}>
          {renderRow(
            "buyr",
            t("howItWorks.buyr.title"),
            null,
            <>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
                {t("howItWorks.buyr.intro")}
              </p>
              <ul className="space-y-2.5">
                {listKeys.map((k) => (
                  <Dash key={k}>{t(`howItWorks.buyr.${k}`)}</Dash>
                ))}
              </ul>
            </>
          )}

          {renderRow(
            "findr",
            t("howItWorks.findr.title"),
            null,
            <>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
                {t("howItWorks.findr.intro")}
              </p>
              <ul className="space-y-2.5">
                {listKeys.map((k) => (
                  <Dash key={k}>{t(`howItWorks.findr.${k}`)}</Dash>
                ))}
              </ul>
            </>
          )}

          {renderRow(
            "etapes",
            t("howItWorks.steps.title"),
            null,
            <>
              <ul className="space-y-2.5">
                {stepKeys.map((k) => (
                  <li key={k}>
                    <div className="flex gap-3" style={{ color: "#4B5563", fontSize: 13.5, lineHeight: 1.65 }}>
                      <span style={{ color: GOLD, flexShrink: 0 }}>—</span>
                      <span>
                        <span style={{ color: NAVY }}>{t(`howItWorks.steps.${k}.title`)}</span>
                        {showStepDetails && (
                          <span className="block" style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>
                            {t(`howItWorks.steps.${k}.description`)}
                          </span>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowStepDetails((v) => !v)}
                style={{
                  marginTop: 18,
                  fontSize: 12.5,
                  color: GOLD,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                {showStepDetails ? t("howItWorks.steps.hideDetails") : t("howItWorks.steps.showDetails")}
              </button>
            </>
          )}

          {renderRow(
            "reservation",
            t("howItWorks.reservation.title"),
            t("howItWorks.reservation.summary"),
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p style={{ fontSize: 10.5, letterSpacing: "0.12em", color: GOLD_GREY, marginBottom: 10 }}>
                  {t("howItWorks.reservation.whyTitle")}
                </p>
                <ul className="space-y-2.5">
                  <Dash>{t("howItWorks.reservation.why1")}</Dash>
                  <Dash>{t("howItWorks.reservation.why2")}</Dash>
                  <Dash>{t("howItWorks.reservation.why3")}</Dash>
                </ul>
              </div>
              <div>
                <p style={{ fontSize: 10.5, letterSpacing: "0.12em", color: GOLD_GREY, marginBottom: 10 }}>
                  {t("howItWorks.reservation.howTitle")}
                </p>
                <ul className="space-y-2.5">
                  <Dash>{t("howItWorks.reservation.how1")}</Dash>
                  <Dash>{t("howItWorks.reservation.how2")}</Dash>
                  <Dash>{t("howItWorks.reservation.how3")}</Dash>
                </ul>
              </div>
            </div>
          )}

          {renderRow(
            "frais",
            t("howItWorks.fees.title"),
            t("howItWorks.fees.summary"),
            <>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
                {t("howItWorks.fees.intro")}
              </p>
              <ul className="space-y-2.5">
                <Dash>
                  <span style={{ color: NAVY }}>{t("howItWorks.fees.standardLabel")}</span>{" "}
                  {t("howItWorks.fees.standardText")}
                </Dash>
                <Dash>
                  <span style={{ color: NAVY }}>{t("howItWorks.fees.premiumLabel")}</span>{" "}
                  {t("howItWorks.fees.premiumText")}
                </Dash>
                <Dash>
                  {t("howItWorks.fees.examplePrefix")}{" "}
                  <span style={{ color: NAVY }}>52,50 €</span>
                  {t("howItWorks.fees.exampleMiddle")}{" "}
                  <span style={{ color: NAVY }}>51,50 €</span>.
                </Dash>
              </ul>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 18,
                  fontSize: 12.5,
                  color: GOLD_GREY,
                }}
              >
                {t("howItWorks.fees.premiumLink")} — bientôt disponible
              </span>
            </>
          )}

          {renderRow(
            "savoir-vivre",
            t("howItWorks.etiquette.title"),
            t("howItWorks.etiquette.summary"),
            <>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
                {t("howItWorks.etiquette.intro")}
              </p>
              <ul className="space-y-3">
                {etiquetteKeys.map((k) => (
                  <li key={k} className="flex gap-3" style={{ fontSize: 13.5, lineHeight: 1.65 }}>
                    <span style={{ color: GOLD, flexShrink: 0 }}>—</span>
                    <span>
                      <span style={{ color: NAVY }}>{t(`howItWorks.etiquette.${k}.title`)}</span>
                      <span className="block" style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>
                        {t(`howItWorks.etiquette.${k}.description`)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="text-center" style={{ marginTop: 56 }}>
          <Link
            to="/poster"
            style={{
              display: "inline-block",
              border: `1px solid ${NAVY}`,
              color: NAVY,
              fontSize: 12,
              letterSpacing: "0.16em",
              padding: "14px 28px",
              borderRadius: 2,
            }}
          >
            {t("howItWorks.cta")}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
