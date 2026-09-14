import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Gem, Clock, ShieldCheck, Send, Coins, Heart, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTranslation } from "react-i18next";

const buyerBenefits = [
  { icon: Gem, textKey: "becomeFindr.buyr.benefits.rare" },
  { icon: Send, textKey: "becomeFindr.buyr.benefits.free" },
  { icon: Clock, textKey: "becomeFindr.buyr.benefits.fast" },
  { icon: ShieldCheck, textKey: "becomeFindr.buyr.benefits.support" },
];

const finderBenefits = [
  { icon: Coins, textKey: "becomeFindr.findr.benefits.expertise" },
  { icon: Heart, textKey: "becomeFindr.findr.benefits.choose" },
  { icon: Calendar, textKey: "becomeFindr.findr.benefits.earn" },
  { icon: TrendingUp, textKey: "becomeFindr.findr.benefits.reputation" },
];

const BecomeFindr = () => {
  const { t } = useTranslation();
  const headingRef = useScrollReveal();
  const leftCardRef = useScrollReveal();
  const rightCardRef = useScrollReveal();

  return (
    <section className="py-14 relative overflow-hidden bg-navy-primary">
      <div className="container mx-auto px-4 relative z-10">
        <div ref={headingRef} className="scroll-reveal text-center mb-7">
          <span className="text-sm font-barlow font-medium uppercase tracking-wider text-accent">
            {t("becomeFindr.eyebrow")}
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 text-cream">
            {t("becomeFindr.title")}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* buyr Card */}
          <div
            ref={leftCardRef}
            className="scroll-reveal-left rounded-3xl p-8 md:p-10 flex flex-col border border-secondary/40 bg-secondary"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-accent/15">
              <Search className="w-7 h-7 text-accent" />
            </div>

            <h3 className="text-2xl font-display font-bold mb-2 text-cream">
              {t("becomeFindr.buyr.title")}
            </h3>
            <p className="text-sm mb-8 text-cream/60">
              {t("becomeFindr.buyr.subtitle")}
            </p>

            <ul className="space-y-4 mb-10 flex-grow">
              {buyerBenefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-accent/12">
                    <b.icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-cream/90">{t(b.textKey)}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="cta-hover w-full text-base py-6 rounded-full font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
              asChild
            >
              <Link to="/poster">
                {t("becomeFindr.buyr.cta")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          {/* findr Card */}
          <div
            ref={rightCardRef}
            className="scroll-reveal-right rounded-3xl p-8 md:p-10 flex flex-col border border-secondary/40 bg-secondary"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-accent/12">
              <Heart className="w-7 h-7 text-accent" />
            </div>

            <h3 className="text-2xl font-display font-bold mb-2 text-cream">
              {t("becomeFindr.findr.title")}
            </h3>
            <p className="text-sm mb-8 text-cream/60">
              {t("becomeFindr.findr.subtitle")}
            </p>

            <ul className="space-y-4 mb-10 flex-grow">
              {finderBenefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-accent/12">
                    <b.icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-cream/90">{t(b.textKey)}</span>
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              variant="outline"
              className="cta-hover w-full text-base py-6 rounded-full font-semibold border-2 border-cream text-cream bg-transparent hover:bg-cream/5"
              asChild
            >
              <Link to="/recherches">
                {t("becomeFindr.findr.cta")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeFindr;
