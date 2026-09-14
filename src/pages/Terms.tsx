import LegalLayout from "./LegalLayout";
import { Trans, useTranslation } from "react-i18next";

const Terms = () => {
  const { t } = useTranslation();

  return (
  <LegalLayout title={t("terms.title")}>
    <p>{t("terms.intro")}</p>

    <h2>{t("terms.purpose.title")}</h2>
    <p>{t("terms.purpose.text")}</p>

    <h2>{t("terms.registration.title")}</h2>
    <p>{t("terms.registration.text")}</p>

    <h2>{t("terms.matching.title")}</h2>
    <ul>
      {["search", "proposal", "payment", "release"].map((key) => <li key={key}>{t(`terms.matching.${key}`)}</li>)}
    </ul>

    <h2>{t("terms.fees.title")}</h2>
    <p>
      <Trans i18nKey="terms.fees.text" components={{ strong: <strong /> }} />
    </p>

    <h2>{t("terms.obligations.title")}</h2>
    <ul>
      {["content", "commitments", "messaging"].map((key) => <li key={key}>{t(`terms.obligations.${key}`)}</li>)}
    </ul>

    <h2>{t("terms.suspension.title")}</h2>
    <p>{t("terms.suspension.text")}</p>

    <h2>{t("terms.liability.title")}</h2>
    <p>{t("terms.liability.text")}</p>

    <h2>{t("terms.personalData.title")}</h2>
    <p>
      <Trans i18nKey="terms.personalData.text" components={{ privacy: <a href="/confidentialite" /> }} />
    </p>

    <h2>{t("terms.law.title")}</h2>
    <p>{t("terms.law.text")}</p>
  </LegalLayout>
  );
};

export default Terms;
