import LegalLayout from "./LegalLayout";
import { Mail, MessageCircle, Shield } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();

  return (
  <LegalLayout title={t("contact.title")}>
    <p>
      {t("contact.intro")}
    </p>

    <div className="grid md:grid-cols-3 gap-4 not-prose mt-8">
      <a
        href="mailto:contact@findrapp.fr"
        className="block p-6 bg-white rounded-xl border border-[#070E42]/10 hover:border-[#D9BB87] hover:shadow-md transition-all"
      >
        <Mail className="w-6 h-6 text-[#070E42] mb-3" />
        <h3 className="font-display font-semibold text-[#070E42] mb-1">{t("contact.general")}</h3>
        <p className="text-sm text-[#070E42]/70">contact@findrapp.fr</p>
      </a>
      <a
        href="mailto:support@findrapp.fr"
        className="block p-6 bg-white rounded-xl border border-[#070E42]/10 hover:border-[#D9BB87] hover:shadow-md transition-all"
      >
        <MessageCircle className="w-6 h-6 text-[#070E42] mb-3" />
        <h3 className="font-display font-semibold text-[#070E42] mb-1">{t("contact.support")}</h3>
        <p className="text-sm text-[#070E42]/70">support@findrapp.fr</p>
      </a>
      <a
        href="mailto:privacy@findrapp.fr"
        className="block p-6 bg-white rounded-xl border border-[#070E42]/10 hover:border-[#D9BB87] hover:shadow-md transition-all"
      >
        <Shield className="w-6 h-6 text-[#070E42] mb-3" />
        <h3 className="font-display font-semibold text-[#070E42] mb-1">{t("contact.privacy")}</h3>
        <p className="text-sm text-[#070E42]/70">privacy@findrapp.fr</p>
      </a>
    </div>

    <h2>{t("contact.responseTitle")}</h2>
    <p>{t("contact.responseText")}</p>

    <h2>{t("contact.reportTitle")}</h2>
    <p>
      <Trans i18nKey="contact.reportText" components={{ email: <a href="mailto:support@findrapp.fr" /> }} />
    </p>
  </LegalLayout>
  );
};

export default Contact;
