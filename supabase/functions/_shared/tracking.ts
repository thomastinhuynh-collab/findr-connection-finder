/**
 * Construit l'URL de suivi du colis chez le transporteur.
 * Repli sur 17TRACK si le transporteur n'est pas reconnu.
 */
export function trackingUrl(
  carrier?: string | null,
  trackingNumber?: string | null,
): string | null {
  if (!trackingNumber) return null;
  const n = encodeURIComponent(trackingNumber.trim());
  const c = (carrier ?? "").toLowerCase();

  if (c.includes("colissimo") || c.includes("la poste"))
    return `https://www.laposte.fr/outils/suivre-vos-envois?code=${n}`;
  if (c.includes("mondial")) return `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${n}`;
  if (c.includes("chronopost"))
    return `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${n}`;
  if (c.includes("dhl")) return `https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=${n}`;
  if (c.includes("ups")) return `https://www.ups.com/track?loc=fr_FR&tracknum=${n}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
  if (c.includes("dpd")) return `https://www.dpd.fr/trace/${n}`;
  if (c.includes("gls")) return `https://gls-group.com/FR/fr/suivi-colis?match=${n}`;
  if (c.includes("tnt"))
    return `https://www.tnt.com/express/fr_fr/site/shipping-tools/tracking.html?searchType=con&cons=${n}`;
  if (c.includes("colis privé") || c.includes("colis prive"))
    return `https://www.colisprive.fr/moncolis/pages/detailColis.aspx?numColis=${n}`;

  return `https://t.17track.net/fr#nums=${n}`;
}
