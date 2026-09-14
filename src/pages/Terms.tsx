import LegalLayout from "./LegalLayout";
import { Trans, useTranslation } from "react-i18next";

const Terms = () => {
  const { t } = useTranslation();

  return (
  <LegalLayout title={t("terms.title")}>
    <p>{t("terms.intro")}</p>

    <h2>{t("terms.purpose.title")}</h2>
    <p>{t("terms.purpose.text")}</p>

    <h2>{t("terms.definitions.title")}</h2>
    <p>{t("terms.definitions.text")}</p>

    <h2>{t("terms.registration.title")}</h2>
    <p>{t("terms.registration.text")}</p>

    <h2>{t("terms.matching.title")}</h2>
    <p>{t("terms.matching.text")}</p>

    <h2>{t("terms.role.title")}</h2>
    <p>
      <Trans i18nKey="terms.role.text" components={{ strong: <strong /> }} />
    </p>

    <h2>{t("terms.obligations.title")}</h2>
    <p>{t("terms.obligations.text")}</p>

    <h2>{t("terms.content.title")}</h2>
    <p>{t("terms.content.text")}</p>

    <h2>{t("terms.reviews.title")}</h2>
    <p>{t("terms.reviews.text")}</p>

    <h2>{t("terms.suspension.title")}</h2>
    <p>{t("terms.suspension.text")}</p>

    <h2>{t("terms.personalData.title")}</h2>
    <p>
      <Trans i18nKey="terms.personalData.text" components={{ privacy: <a href="/confidentialite" /> }} />
    </p>

    <h2>{t("terms.changes.title")}</h2>
    <p>{t("terms.changes.text")}</p>

    <h2>{t("terms.law.title")}</h2>
    <p>{t("terms.law.text")}</p>
  </LegalLayout>
  );
};

export default Terms;
