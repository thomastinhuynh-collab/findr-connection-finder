# Contrôle des numéros de suivi

- [x] Validation partagée, unicité et colonnes de reconnaissance sans modifier les lignes existantes.
- [x] Reconnaissance 17TRACK, revérifications et alertes avec versements protégés.
- [x] Affichage FR/EN et annulation à 7 jours pour un suivi non confirmé.
- [x] Tests et refus serveur vérifiés sans modifier de transaction réelle ; formulaire testé avec données simulées dans le navigateur.
- [ ] Reconnaissance réelle d'un nouveau colis et alertes après 72 h : nécessite une nouvelle expédition réelle ; aucun numéro réel enregistré pour tester.

# Liens de transaction

- [x] Relier les emails et notifications de transaction à leur réservation.
- [x] Conserver la page demandée pendant la connexion, Google et la confirmation d’email.
- [x] Tester les règles de destination et les parcours sans session sur ordinateur et navigateur mobile intégré simulé.
- [ ] Vérification réelle Google, clic de confirmation d’email et application de messagerie native : nécessite une connexion Google interactive et un appareil avec client mail ; les retours de session et le navigateur intégré simulé sont vérifiés.
- [ ] Vérifier à l’écran /admin/tarifs-port (non-admin : message) et le lien depuis /admin/litiges — en attente du feu vert de Thomas, lecture seule
