import { useState } from "react";
import { Search, Compass, CheckCircle, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useScrollReveal, useScrollRevealGroup } from "@/hooks/useScrollReveal";
import { useTranslation } from "react-i18next";

const steps = [
  { icon: Search, step: "01", key: "s1" },
  { icon: Compass, step: "02", key: "s2" },
  { icon: CheckCircle, step: "03", key: "s3" },
  { icon: ShieldCheck, step: "04", key: "s4" },
];

const HowItWorks = () => {
  const { t } = useTranslation();
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const headingRef = useScrollReveal();
  const cardsRef = useScrollRevealGroup();

  return (
    <section className="py-14 relative overflow-hidden bg-cream">
      {/* Warm texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at center, hsl(var(--gold)) 1px, transparent 1px)`,
          backgroundSize: '18px 18px',
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div ref={headingRef} className="scroll-reveal text-center mb-7">
          <span className="text-sm font-barlow font-medium uppercase tracking-wider text-accent">
            {t("homeSteps.eyebrow")}
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6 text-foreground">
            {t("homeSteps.title")}
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-foreground/70">
            {t("homeSteps.subtitle")}
          </p>
        </div>

        {/* Horizontal stepper */}
        <div className="relative">
          {/* Connector line - desktop only */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-accent/20" />

          <div ref={cardsRef} className="stagger-group grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="stagger-item relative group cursor-pointer flex flex-col items-center text-center"
                onClick={() => setSelectedStep(index)}
              >
                {/* Step circle */}
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10 transition-all duration-300 border-4 border-accent bg-cream group-hover:scale-110 group-hover:bg-accent"
                  style={{ boxShadow: '0 4px 20px -4px hsl(var(--gold) / 0.25)' }}
                >
                  <span className="step-num text-2xl font-barlow font-bold absolute transition-all duration-300 text-accent group-hover:opacity-0 group-hover:scale-50">
                    {step.step}
                  </span>
                  <step.icon className="step-icon w-9 h-9 absolute transition-all duration-300 text-accent opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 group-hover:text-cream" />
                </div>
                
                <h3 className="text-lg font-display font-semibold mb-2 text-foreground">
                  {t(`homeSteps.${step.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed max-w-[220px] text-foreground/65">
                  {t(`homeSteps.${step.key}.description`)}
                </p>
                
                <div className="mt-3 text-xs font-barlow font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-accent">
                  <span>{t("homeSteps.more")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for step details */}
      <Dialog open={selectedStep !== null} onOpenChange={() => setSelectedStep(null)}>
        <DialogContent className="max-w-md bg-cream border-accent/30">
          {selectedStep !== null && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent/12">
                    {(() => {
                      const StepIcon = steps[selectedStep].icon;
                      return <StepIcon className="w-6 h-6 text-accent" />;
                    })()}
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-barlow font-bold bg-accent text-accent-foreground">
                    {t("homeSteps.stepLabel", { step: steps[selectedStep].step })}
                  </span>
                </div>
                <DialogTitle className="text-xl font-display font-bold text-foreground">
                  {t(`homeSteps.${steps[selectedStep].key}.detailsTitle`)}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription asChild>
                <ul className="space-y-3 mt-4">
                  {["d1", "d2", "d3", "d4", "d5"].map((d) => (
                    <li key={d} className="flex items-start gap-3 text-sm text-foreground/85">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent" />
                      <span>{t(`homeSteps.${steps[selectedStep].key}.${d}`)}</span>
                    </li>
                  ))}
                </ul>
              </DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HowItWorks;
