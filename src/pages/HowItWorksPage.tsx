import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NAVY = "#0A1628";
const GOLD = "#D9BB87";
const GOLD_GREY = "#9C8B6B";

type SectionKey = "buyr" | "findr" | "etapes" | "reservation" | "frais" | "savoir-vivre";

const anchors: { key: SectionKey; label: string }[] = [
  { key: "buyr", label: "LE BUYR" },
  { key: "findr", label: "LE FINDR" },
  { key: "etapes", label: "ÉTAPE PAR ÉTAPE" },
  { key: "reservation", label: "RÉSERVATION" },
  { key: "frais", label: "FRAIS" },
  { key: "savoir-vivre", label: "SAVOIR-VIVRE" },
];

const romans: Record<SectionKey, string> = {
  buyr: "I",
  findr: "II",
  etapes: "III",
  reservation: "IV",
  frais: "V",
  "savoir-vivre": "VI",
};

const buyrItems = [
  "Poste une recherche détaillée avec photos d'inspiration et budget",
  "Reçoit des propositions de findrs qui ont trouvé l'objet",
  "Choisit la meilleure offre et valide l'achat en toute sécurité",
  "Évalue le findr après réception pour aider la communauté",
];

const findrItems = [
  "Parcourt les recherches et identifie celles qu'il peut satisfaire",
  "Chine activement en brocantes, friperies, vide-greniers, en ligne…",
  "Fait une proposition avec photos, prix et description détaillée",
  "Gagne une commission sur chaque vente réussie",
];

const steps = [
  {
    title: "Le buyr poste sa recherche",
    description:
      "Description détaillée de l'objet recherché, photos d'inspiration, fourchette de budget, niveau d'urgence. Plus la recherche est précise, plus les propositions seront pertinentes.",
  },
  {
    title: "Les findrs découvrent et réservent",
    description:
      "Les findrs passionnés consultent les recherches. S'ils pensent pouvoir trouver l'objet, ils peuvent demander une réservation exclusive pour éviter la concurrence pendant leur recherche.",
  },
  {
    title: "Le findr fait sa proposition",
    description:
      "Une fois l'objet trouvé, le findr soumet sa proposition avec photos réelles, prix proposé (incluant sa commission) et description de l'état.",
  },
  {
    title: "Négociation et validation",
    description:
      "Le buyr et le findr échangent via la messagerie intégrée. Le buyr peut demander des photos supplémentaires, négocier, ou valider directement la proposition.",
  },
  {
    title: "Paiement sécurisé",
    description:
      "Le buyr procède au paiement sécurisé. Les fonds sont conservés jusqu'à réception et validation de l'objet. Protection pour les deux parties.",
  },
  {
    title: "Envoi et réception",
    description:
      "Le findr envoie l'objet avec suivi. À réception, le buyr confirme que tout est conforme. Les fonds sont alors libérés au findr.",
  },
  {
    title: "Évaluation mutuelle",
    description:
      "Les deux parties s'évaluent mutuellement. Ces avis construisent la réputation et la confiance au sein de la communauté.",
  },
];

const etiquette = [
  {
    title: "Respect et bienveillance",
    description:
      "Chaque membre mérite respect. Les échanges doivent rester courtois, même en cas de désaccord.",
  },
  {
    title: "Communication claire",
    description:
      "Répondez aux messages dans un délai raisonnable (24-48h). Soyez précis dans vos descriptions.",
  },
  {
    title: "Honnêteté",
    description:
      "Décrivez fidèlement l'état des objets. Les mauvaises surprises nuisent à la confiance de tous.",
  },
  {
    title: "Ponctualité",
    description:
      "Respectez vos engagements : délais de réservation, d'envoi, de réponse. Prévenez en cas d'imprévu.",
  },
  {
    title: "Évaluations justes",
    description:
      "Évaluez de manière constructive. Un avis négatif doit être justifié et factuel.",
  },
  {
    title: "Pas de transactions externes",
    description:
      "Toutes les transactions doivent passer par findr pour garantir la protection de chacun.",
  },
];

const Dash = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-3" style={{ color: "#4B5563", fontSize: 13.5, lineHeight: 1.65 }}>
    <span style={{ color: GOLD, flexShrink: 0 }}>—</span>
    <span>{children}</span>
  </li>
);

const HowItWorksPage = () => {
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
              className="block"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 19,
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
            GUIDE
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 34,
              color: "#F5F1E8",
              lineHeight: 1.2,
            }}
          >
            Comment ça <em>marche</em> ?
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
            Tout comprendre en un coup d'œil, sans avoir à tout lire.
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
                {a.label}
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
            "Le buyr",
            null,
            <>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
                Celui qui cherche un objet précis et confie sa recherche à la communauté.
              </p>
              <ul className="space-y-2.5">
                {buyrItems.map((t) => (
                  <Dash key={t}>{t}</Dash>
                ))}
              </ul>
            </>
          )}

          {renderRow(
            "findr",
            <em>Le findr</em>,
            null,
            <>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
                Celui qui part en chasse et déniche l'objet demandé, où qu'il se cache.
              </p>
              <ul className="space-y-2.5">
                {findrItems.map((t) => (
                  <Dash key={t}>{t}</Dash>
                ))}
              </ul>
            </>
          )}

          {renderRow(
            "etapes",
            "Étape par étape",
            null,
            <>
              <ul className="space-y-2.5">
                {steps.map((s) => (
                  <li key={s.title}>
                    <div className="flex gap-3" style={{ color: "#4B5563", fontSize: 13.5, lineHeight: 1.65 }}>
                      <span style={{ color: GOLD, flexShrink: 0 }}>—</span>
                      <span>
                        <span style={{ color: NAVY }}>{s.title}</span>
                        {showStepDetails && (
                          <span className="block" style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>
                            {s.description}
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
                {showStepDetails ? "Masquer le détail" : "Voir le détail de chaque étape"}
              </button>
            </>
          )}

          {renderRow(
            "reservation",
            "Le système de réservation",
            "FONCTIONNALITÉ CLÉ",
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p style={{ fontSize: 10.5, letterSpacing: "0.12em", color: GOLD_GREY, marginBottom: 10 }}>
                  POURQUOI RÉSERVER ?
                </p>
                <ul className="space-y-2.5">
                  <Dash>Éviter que plusieurs findrs cherchent le même objet</Dash>
                  <Dash>Investir du temps sereinement dans la recherche</Dash>
                  <Dash>Montrer son engagement au buyr</Dash>
                </ul>
              </div>
              <div>
                <p style={{ fontSize: 10.5, letterSpacing: "0.12em", color: GOLD_GREY, marginBottom: 10 }}>
                  COMMENT ÇA FONCTIONNE ?
                </p>
                <ul className="space-y-2.5">
                  <Dash>Le findr demande une réservation avec une durée</Dash>
                  <Dash>Le buyr approuve, modifie ou refuse la demande</Dash>
                  <Dash>La recherche devient exclusive pendant la durée</Dash>
                </ul>
              </div>
            </div>
          )}

          {renderRow(
            "frais",
            "Les frais de la plateforme",
            "5% STANDARD · 3% PREMIUM",
            <>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
                findr prélève une commission unique sur chaque transaction pour maintenir la
                plateforme, garantir la sécurité des paiements et accompagner la communauté.
              </p>
              <ul className="space-y-2.5">
                <Dash>
                  <span style={{ color: NAVY }}>Frais standard — 5%</span> prélevés sur chaque
                  transaction, pour tous les utilisateurs.
                </Dash>
                <Dash>
                  <span style={{ color: NAVY }}>Frais Premium — 3%</span> pour les membres Premium,
                  avec des avantages exclusifs.
                </Dash>
                <Dash>
                  Exemple concret : un findr trouve un vinyle rare à 50 € ; le buyr paie 50 € + 5 % ={" "}
                  <span style={{ color: NAVY }}>52,50 €</span>. Avec Premium, 50 € + 3 % ={" "}
                  <span style={{ color: NAVY }}>51,50 €</span>.
                </Dash>
              </ul>
              <Link
                to="/premium"
                style={{
                  display: "inline-block",
                  marginTop: 18,
                  fontSize: 12.5,
                  color: GOLD,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Découvrir Premium
              </Link>
            </>
          )}

          {renderRow(
            "savoir-vivre",
            "Le savoir-vivre findr",
            "6 RÈGLES DE BONNE CONDUITE",
            <>
              <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
                Pour que l'expérience soit agréable pour tous, quelques règles de bonne conduite.
              </p>
              <ul className="space-y-3">
                {etiquette.map((r) => (
                  <li key={r.title} className="flex gap-3" style={{ fontSize: 13.5, lineHeight: 1.65 }}>
                    <span style={{ color: GOLD, flexShrink: 0 }}>—</span>
                    <span>
                      <span style={{ color: NAVY }}>{r.title}</span>
                      <span className="block" style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>
                        {r.description}
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
            POSTER UNE RECHERCHE →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
