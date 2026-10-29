# Débloquer les ventes payées

## Problème confirmé
Depuis la dernière étape, chaque nouveau paiement place la vente en « Étiquette à fournir ». Or l'écran pour fournir l'étiquette n'existe pas encore, et rien ne fait sortir la vente de ce statut. Résultat :
- le buyr ne peut pas choisir sa livraison ;
- le findr ne voit ni le formulaire d'expédition ni « Je ne peux plus fournir l'objet » ;
- le buyr reçoit pourtant l'email « Tu as 3 jours pour fournir l'étiquette ».

Toute nouvelle vente reste bloquée juste après le paiement.

## Correctif proposé (minimal, réversible)
En attendant que le parcours étiquette soit construit, les nouveaux paiements reprennent l'ancien parcours :
1. Après paiement, la vente passe de nouveau en « À expédier » (ancien statut), avec choix de livraison côté buyr et expédition côté findr, comme avant.
2. La tâche horaire n'envoie plus la notification ni l'email « étiquette prête », puisqu'aucune vente n'entre dans le nouveau statut.
3. Tout le reste est conservé : le nouveau statut, ses libellés, les champs étiquette, l'espace de fichiers privé et la recopie de l'adresse du findr. Le jour où l'écran étiquette existe, il suffira de réactiver ces deux points.

Aucune donnée existante n'est modifiée (aucune vente n'est actuellement dans le nouveau statut ; je le revérifierai avant).

## Alternative
Construire tout de suite le parcours étiquette (dépôt du fichier par le buyr, validation et dépôt par le findr). C'est nettement plus long et demande tes choix sur les écrans.

## Détails techniques
- `stripe-webhook` : `payment_status: "paye_en_attente_reception"` au lieu de `AWAITING_LABEL`, sans `label_deadline_at` ; garder `ALREADY_PAID_STATUSES` pour l'idempotence.
- `auto-release-funds` : désactiver l'étape 4 (`label_ready`) derrière une constante `LABEL_FLOW_ENABLED = false` dans `_shared/paymentStatus.ts`, la recopie de `ship_from` restant assurée par le webhook.
- Mettre à jour la règle AGENTS.md sur le statut initial et `paymentStatus.test.ts`.
- Redéployer `stripe-webhook` et `auto-release-funds`.
