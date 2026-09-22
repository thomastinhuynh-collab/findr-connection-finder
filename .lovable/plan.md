# Retrait du point relais findr + choix de livraison du buyr

Deux chantiers indépendants, sans dépendance de code entre eux.

## 1. Retrait du « Point relais préféré » du profil findr

- Dans « Modifier mon profil » : suppression du bloc « Point relais préféré », de l'état associé et de l'enregistrement de ce champ.
- Suppression du fichier du sélecteur de point relais.
- La colonne en base est conservée telle quelle, aucune migration.

## 2. Choix de livraison du buyr

Nouvelle étape affichée au buyr dès que son paiement est confirmé :
« Comment veux-tu recevoir ton colis ? »

Deux options :
- **Livraison à domicile** — rue, code postal, ville.
- **Retrait en point relais** — transporteur (Mondial Relay ou Chronopost), code postal, lien vers la page de recherche officielle du transporteur, puis recopie du nom, de l'adresse et de l'identifiant du point choisi.

Le choix est enregistré sur la réservation et reste modifiable tant que le colis n'est pas expédié.

Tant que le buyr n'a pas fait ce choix :
- le findr voit un message « Le buyr n'a pas encore indiqué son mode de livraison » à la place du bouton d'expédition ;
- la demande d'expédition est également refusée côté serveur, pour que le statut ne puisse pas passer à « expédié » sans adresse ou point relais.

Textes disponibles en français et en anglais.

## Détails techniques

- Migration : `reservations.delivery_type` (`domicile` | `point_relais`, CHECK), `delivery_address` jsonb, `delivery_relay_point` jsonb. Aucune suppression.
- Nouveau composant autonome `src/components/DeliveryChoicePicker.tsx` (aucun import du composant supprimé) : props `reservationId`, `value`, `onSaved`, écriture directe via le client backend, protégé par les policies RLS existantes du buyr sur `reservations`.
- `src/components/ProposalList.tsx` : `fetchPayments` sélectionne aussi les trois nouvelles colonnes ; encart buyr affiché quand `isOwner && payment_status === "paye_en_attente_reception"` ; le bloc « Marquer comme expédié » du findr est remplacé par le message d'attente si `delivery_type` est nul.
- `supabase/functions/mark-shipped/index.ts` : lecture de `delivery_type` et refus 400 si absent.
- `src/pages/MySpace.tsx` : retrait de l'import, de `RelayPoint` dans l'interface `Profile`, de `editRelayPoint`, du champ dans l'update et du bloc JSX ; `rm src/components/RelayPointPicker.tsx`.
- Clés i18n ajoutées sous `delivery.*` dans `fr.json` et `en.json`.
