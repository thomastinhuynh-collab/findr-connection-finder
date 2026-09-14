import { ReactNode } from "react";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

interface LegalLayoutProps {
  title: string;
  updatedAt?: string;
  children: ReactNode;
}

const LegalLayout = ({ title, updatedAt = "7 mai 2026", children }: LegalLayoutProps) => {
  const { t, i18n } = useTranslation();
  const displayedDate = updatedAt === "7 mai 2026" ? t("legalLayout.updatedDate") : updatedAt;

  return (
    <div className="min-h-screen bg-[#F5F0EA]">
      <main className="container mx-auto px-4 pt-32 pb-20 max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#070E42] mb-3">
          {title}
        </h1>
        <p className="text-sm text-[#070E42]/60 mb-12">
          {t("legalLayout.lastUpdated", { date: displayedDate })}
        </p>
        <article className="prose prose-slate max-w-none font-inter text-[#070E42]/85 leading-relaxed space-y-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[#070E42] [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#070E42] [&_h3]:mt-6 [&_h3]:mb-2 [&_a]:text-[#070E42] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default LegalLayout;
