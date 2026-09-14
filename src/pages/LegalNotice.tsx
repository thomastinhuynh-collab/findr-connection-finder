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
      <li><strong>{t("legalNotice.publisher.companyLabel")}</strong> findr SAS</li>
      <li><strong>{t("legalNotice.publisher.officeLabel")}</strong> France</li>
      <li><strong>{t("legalNotice.publisher.emailLabel")}</strong> contact@findrapp.fr</li>
      <li><strong>{t("legalNotice.publisher.directorLabel")}</strong> {t("legalNotice.publisher.director")}</li>
    </ul>

    <h2>{t("legalNotice.hosting.title")}</h2>
    <p>
      <Trans i18nKey="legalNotice.hosting.text" components={{ strong: <strong /> }} />
    </p>
    <ul>
      <li><strong>{t("legalNotice.hosting.companyLabel")}</strong> Lovable Labs Incorporated</li>
      <li><strong>{t("legalNotice.hosting.addressLabel")}</strong> {t("legalNotice.hosting.address")}</li>
      <li><strong>{t("legalNotice.hosting.phoneLabel")}</strong> +1 (323) 719-0419</li>
      <li><strong>{t("legalNotice.hosting.emailLabel")}</strong> <a href="mailto:support@lovable.dev">support@lovable.dev</a></li>
    </ul>

    <h2>{t("legalNotice.intellectualProperty.title")}</h2>
    <p>{t("legalNotice.intellectualProperty.text")}</p>

    <h2>{t("legalNotice.liability.title")}</h2>
    <p>{t("legalNotice.liability.text")}</p>

    <h2>{t("legalNotice.contact.title")}</h2>
    <p>
      <Trans i18nKey="legalNotice.contact.text" components={{ email: <a href="mailto:contact@findrapp.fr" /> }} />
    </p>
  </LegalLayout>
  );
};

export default LegalNotice;
