import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr.json";
import en from "./locales/en.json";

export const STORAGE_KEY = "findr_lang";

const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: stored === "en" || stored === "fr" ? stored : "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  } catch {}
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
}

export default i18n;
