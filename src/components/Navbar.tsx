import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";
import HeaderActions from "@/components/HeaderActions";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const navLinks = [
  { key: "howItWorks", to: "/comment-ca-marche" },
  { key: "becomeBuyr", to: "/je-deviens-buyr" },
  { key: "becomeFindr", to: "/je-deviens-findr" },
  { key: "blog", to: "/blog" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  if (location.pathname === "/") return null;

  const openMySpace = () => {
    if (user) {
      navigate("/mon-espace");
      return;
    }
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="findr-navigation-bg fixed inset-x-0 top-0 z-50 shadow-lg">
        <div className="mx-auto max-w-[1280px]">
          <nav className="flex items-center justify-between gap-10 border-b border-accent/10 px-4 py-5 md:px-8">
            <Link to="/" className="shrink-0 no-underline" aria-label={t("nav.home", { defaultValue: "Accueil" })}>
              <Logo size={34} />
            </Link>

            <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-[13px] font-normal text-accent/75 transition-colors hover:text-accent"
                >
                  {t(`nav.${link.key}`)}
                </Link>
              ))}
            </div>

            <div className="hidden shrink-0 items-center gap-3 md:flex">
              {user && <HeaderActions variant="gold" />}
              <button
                type="button"
                onClick={() => navigate("/poster")}
                className="rounded-full border border-accent/40 bg-transparent px-5 py-[9px] text-[13px] font-normal text-accent transition-colors hover:border-accent hover:bg-accent/10"
              >
                {t("nav.postSearch")}
              </button>
              <button
                type="button"
                onClick={openMySpace}
                className="rounded-full bg-accent px-[22px] py-[9px] text-[13px] font-medium text-accent-foreground transition-colors hover:bg-accent/90"
              >
                {t("nav.mySpace")}
              </button>
              <LanguageSwitcher variant="gold" />
            </div>

            {user && (
              <div className="ml-auto md:hidden">
                <HeaderActions variant="gold" />
              </div>
            )}
            <div className={`${user ? "" : "ml-auto"} md:hidden`}>
              <LanguageSwitcher variant="gold" />
            </div>
            <button
              type="button"
              className="p-1 text-[22px] leading-none text-accent md:hidden"
              onClick={() => setIsOpen((open) => !open)}
              aria-label={t("nav.menu")}
              aria-expanded={isOpen}
            >
              {isOpen ? "×" : "≡"}
            </button>
          </nav>

          {isOpen && (
            <div className="flex flex-col gap-[14px] border-b border-accent/10 px-8 py-4 md:hidden">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-accent/85 transition-colors hover:text-accent"
                >
                  {t(`nav.${link.key}`)}
                </Link>
              ))}
              <div className="mt-1 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/poster");
                  }}
                  className="flex-1 rounded-full border border-accent/40 bg-transparent px-[18px] py-[9px] text-[13px] text-accent"
                >
                  {t("nav.postSearchShort")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    openMySpace();
                  }}
                  className="flex-1 rounded-full bg-accent px-5 py-[9px] text-[13px] font-medium text-accent-foreground"
                >
                  {t("nav.mySpace")}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="signup"
      />
    </>
  );
};

export default Navbar;