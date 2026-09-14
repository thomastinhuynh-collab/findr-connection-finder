import LegalLayout from "./LegalLayout";
import { Trans, useTranslation } from "react-i18next";

const LegalNotice = () => {
  const { t } = useTranslation();

  return (
  <LegalLayout title={t("legalNotice.title")}>
    <h2>{t("legalNotice.publisher.title")}</h2>
    <p>
      <Trans i18nKey="legalNotice.publisher.text" components={{ strong: <strong /> }} />
    </p>
    <ul>
      {["company", "capital", "office", "rcs", "president", "email", "vat"].map((key) => (
        <li key={key}><strong>{t(`legalNotice.publisher.${key}Label`)}</strong> {t(`legalNotice.publisher.${key}`)}</li>
      ))}
    </ul>

    <h2>{t("legalNotice.hosting.title")}</h2>
    <p>
      <Trans i18nKey="legalNotice.hosting.text" components={{ strong: <strong /> }} />
    </p>
    <ul>
      {["company", "address", "phone", "email"].map((key) => (
        <li key={key}><strong>{t(`legalNotice.hosting.${key}Label`)}</strong> {t(`legalNotice.hosting.${key}`)}</li>
      ))}
    </ul>

    <h2>{t("legalNotice.intellectualProperty.title")}</h2>
    <p>{t("legalNotice.intellectualProperty.text")}</p>

    <h2>{t("legalNotice.liability.title")}</h2>
    <p>{t("legalNotice.liability.text")}</p>

    <h2>{t("legalNotice.contact.title")}</h2>
    <p>
      <Trans i18nKey="legalNotice.contact.text" components={{ email: <a href="mailto:contact@findrapp.fr" /> }} />
    </p>

    <h2>{t("legalNotice.mediation.title")}</h2>
    <p>{t("legalNotice.mediation.text")}</p>
  </LegalLayout>
  );
};

export default LegalNotice;
