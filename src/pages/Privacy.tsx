import LegalLayout from "./LegalLayout";
import { Trans, useTranslation } from "react-i18next";

const Privacy = () => {
  const { t } = useTranslation();

  return (
  <LegalLayout title={t("privacy.title")}>
    <p>{t("privacy.intro")}</p>

    <h2>{t("privacy.controller.title")}</h2>
    <p>
      <Trans i18nKey="privacy.controller.text" components={{ email: <a href="mailto:privacy@findrapp.fr" /> }} />
    </p>

    <h2>{t("privacy.data.title")}</h2>
    <ul>
      {["account", "transaction", "payment"].map((key) => <li key={key}><Trans i18nKey={`privacy.data.${key}`} components={{ strong: <strong /> }} /></li>)}
    </ul>

    <h2>{t("privacy.recipients.title")}</h2>
    <p><Trans i18nKey="privacy.recipients.text" components={{ strong: <strong /> }} /></p>

    <h2>{t("privacy.transfers.title")}</h2>
    <p><Trans i18nKey="privacy.transfers.text" components={{ strong: <strong /> }} /></p>

    <h2>{t("privacy.retention.title")}</h2>
    <p>{t("privacy.retention.text")}</p>

    <h2>{t("privacy.rights.title")}</h2>
    <p>
      <Trans i18nKey="privacy.rights.text" components={{ email: <a href="mailto:contact@findrapp.fr" />, cnil: <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" /> }} />
    </p>

    <h2>{t("privacy.cookies.title")}</h2>
    <p>{t("privacy.cookies.text")}</p>

  </LegalLayout>
  );
};

export default Privacy;
