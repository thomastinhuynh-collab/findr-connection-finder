import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import usePageMeta from "@/hooks/usePageMeta";

type Role = "buyr" | "findr";

// Placeholder neutre (bandeau couleur unie) — à remplacer par la vraie photo (src uniquement).
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='800' preserveAspectRatio='none'%3E%3Crect width='1920' height='800' fill='%23DACAC2'/%3E%3C/svg%3E";

interface RoleLandingPageProps {
  role: Role;
  destination: "/poster" | "/recherches";
  sectionCount: number;
}

const RoleLandingPage = ({ role, destination, sectionCount }: RoleLandingPageProps) => {
  const { t } = useTranslation();
  const baseKey = `roleLanding.${role}`;

  usePageMeta({
    title: t(`${baseKey}.meta.title`),
    description: t(`${baseKey}.meta.description`),
  });

  return (
    <div className="min-h-screen bg-background font-sans">
      <main className="pt-[75px]">
        <section className="findr-navigation-bg border-t border-accent/10 px-4 py-20 text-center md:py-28">
          <div className="mx-auto max-w-4xl">
            <p className="mb-5 font-barlow text-xs font-medium uppercase tracking-[0.18em] text-accent/70">
              {t(`${baseKey}.hero.eyebrow`)}
            </p>
            <h1 className="mx-auto max-w-4xl text-4xl font-normal leading-tight text-accent md:text-6xl">
              {t(`${baseKey}.hero.title`)}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-accent/75 md:text-lg">
              {t(`${baseKey}.hero.subtitle`)}
            </p>
            <Button
              asChild
              className="mt-9 h-auto rounded-full bg-accent px-6 py-3 text-[13px] font-medium text-accent-foreground hover:bg-accent/90"
            >
              <Link to={destination}>{t(`${baseKey}.hero.cta`)}</Link>
            </Button>
            <Link
              to="/comment-ca-marche"
              className="mt-5 block text-sm text-accent/70 underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              {t(`${baseKey}.hero.secondaryLink`)}
            </Link>
          </div>
        </section>

        <img
          src={PLACEHOLDER_IMAGE}
          alt={t(`${baseKey}.image.alt`)}
          className="h-[280px] w-full object-cover md:h-[400px]"
        />

        {Array.from({ length: sectionCount }, (_, index) => {
          const sectionKey = `${baseKey}.sections.s${index + 1}`;
          return (
            <section
              key={sectionKey}
              className={`${index % 2 === 0 ? "bg-background" : "bg-card"} border-b border-border/50 px-4 py-14 md:py-20`}
            >
              <div className="mx-auto max-w-3xl">
                <p className="mb-4 font-barlow text-xs font-medium uppercase tracking-[0.16em] text-primary/55">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="text-3xl font-normal leading-tight text-primary md:text-4xl">
                  {t(`${sectionKey}.title`)}
                </h2>
                <div className="mt-6 space-y-5 text-[15px] leading-7 text-primary/75 md:text-base">
                  <p>{t(`${sectionKey}.p1`)}</p>
                  {t(`${sectionKey}.p2`, { defaultValue: "" }) && <p>{t(`${sectionKey}.p2`)}</p>}
                </div>
              </div>
            </section>
          );
        })}

        <section className="border-b border-border/50 bg-background px-4 py-14 md:py-20">
          <div className="mx-auto max-w-3xl border border-accent px-6 py-8 md:px-10 md:py-10">
            <p className="font-barlow text-xs font-medium uppercase tracking-[0.16em] text-primary/55">
              {t(`${baseKey}.example.label`)}
            </p>
            <p className="mt-5 text-[15px] leading-7 text-primary/75 md:text-base">
              {t(`${baseKey}.example.text`)}
            </p>
          </div>
        </section>

        <section className="findr-navigation-bg px-4 py-16 text-center md:py-20">
          <h2 className="text-3xl font-normal text-accent md:text-4xl">
            {t(`${baseKey}.closing.title`)}
          </h2>
          <Button
            asChild
            className="mt-7 h-auto rounded-full bg-accent px-6 py-3 text-[13px] font-medium text-accent-foreground hover:bg-accent/90"
          >
            <Link to={destination}>{t(`${baseKey}.closing.cta`)}</Link>
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RoleLandingPage;