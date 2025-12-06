# Tests de l'intégration Google Calendar

Ce document contient les scénarios de test pour vérifier l'intégration Google Calendar avec Service Account.

---

## 🎯 Objectif des tests

Valider que :
1. ✅ Le service Google Calendar est correctement configuré
2. ✅ Les créneaux de disponibilité peuvent inclure des types d'absence
3. ✅ Un événement est automatiquement créé dans Google Calendar lors de la prise de RDV
4. ✅ Le `googleEventId` est bien stocké dans la base de données
5. ✅ Les rappels sont correctement configurés (30 minutes avant)
6. ✅ Les informations du patient sont correctement transmises

---

## 📋 Prérequis

Avant de commencer les tests :

- [ ] Les variables d'environnement sont configurées :
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
  - `GOOGLE_CALENDAR_ID`
- [ ] Le calendrier Google est partagé avec l'email du service account
- [ ] L'API Google Calendar est activée dans Google Cloud Console
- [ ] L'application est démarrée (`npm run dev`)

---

## 🧪 Scénario 1 : Configuration du Service Google Calendar

### Objectif
Vérifier que le service Google Calendar est correctement initialisé.

### Étapes
1. Démarrer l'application
   ```bash
   npm run dev
   ```
2. Observer les logs au démarrage du serveur

### Résultat attendu
✅ **Succès** : Aucun message d'avertissement concernant Google Calendar

❌ **Échec** : Message dans les logs :
```
[GoogleCalendar] Configuration incomplète. Synchronisation Google Calendar désactivée.
[GoogleCalendar] Assurez-vous que GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY sont définis
```

### Correction en cas d'échec
- Vérifier que `.env` contient bien toutes les variables nécessaires
- Vérifier que la clé privée est correctement formatée (avec les `\n`)
- Redémarrer l'application

---

## 🧪 Scénario 2 : Création de disponibilités avec types d'absence

### Objectif
Vérifier que l'admin peut créer des créneaux de disponibilité avec différents types d'absence.

### Étapes
1. Se connecter en tant qu'administrateur
2. Aller dans **Admin > Gestion des disponibilités**
3. Cliquer sur **"Nouveau créneau"**
4. Vérifier la présence des boutons **"Disponibilité"** et **"Absence"**
5. Sélectionner **"Absence"**
6. Vérifier que la liste déroulante affiche :
   - 📚 Formation (orange)
   - 🏥 Santé (rose)
   - 🌴 Congé (teal)
7. Sélectionner **"Disponibilité"**
8. Vérifier que la liste déroulante affiche :
   - Consultation classique (bleu)
   - Suivi (vert)
   - Urgent (rouge)
   - Première consultation (violet)
   - Séance de groupe (indigo)

### Résultat attendu
✅ **Succès** : 
- Les deux types de créneaux sont disponibles
- Les types d'absence apparaissent avec leurs icônes et couleurs
- Les types de consultation apparaissent avec leurs couleurs

❌ **Échec** : 
- Les boutons Disponibilité/Absence ne sont pas visibles
- Les types d'absence n'apparaissent pas

### Correction en cas d'échec
- Vérifier que le fichier `SlotCreationDialog.tsx` a bien été mis à jour
- Vider le cache du navigateur
- Redémarrer le serveur de développement

---

## 🧪 Scénario 3 : Prise de rendez-vous et synchronisation Google Calendar

### Objectif
Vérifier qu'un événement est automatiquement créé dans Google Calendar lorsqu'un patient prend un rendez-vous.

### Données de test
- Patient : Jean Dupont
- Email : jean.dupont@example.com
- Téléphone : +33 6 12 34 56 78
- Date : Demain
- Heure : 14:00
- Durée : 1 heure
- Motif : Consultation de suivi

### Étapes
1. Se connecter en tant que patient (ou créer un compte test)
2. Aller sur **"Prendre un rendez-vous"**
3. Sélectionner un praticien
4. Choisir une date et heure disponible
5. Remplir le formulaire avec les données de test
6. Valider le rendez-vous
7. Observer les logs du serveur
8. Ouvrir Google Calendar dans un navigateur
9. Vérifier la présence de l'événement

### Résultat attendu dans les logs
✅ **Succès** :
```
[Appointments] ✅ Rendez-vous ajouté dans Google Calendar: abc123xyz456
```

❌ **Échec** :
```
[Appointments] ⚠️ Service Google Calendar non configuré. Rendez-vous créé sans synchronisation.
```
ou
```
[Appointments] ❌ Erreur lors de la synchronisation Google Calendar: ...
```

### Résultat attendu dans Google Calendar
✅ **Succès** :
- Un événement apparaît avec :
  - **Titre** : "Consultation - Jean Dupont"
  - **Description** : Contient le nom, le motif, le téléphone et le praticien
  - **Date/Heure** : Demain à 14:00
  - **Durée** : 1 heure
  - **Rappel** : 30 minutes avant (email + popup)
  - **Couleur** : Vert (#10)

❌ **Échec** :
- Aucun événement n'apparaît dans le calendrier
- L'événement apparaît mais sans rappel
- Les informations sont incorrectes

### Correction en cas d'échec
1. Vérifier les logs pour identifier l'erreur
2. Vérifier que le calendrier est bien partagé avec le service account
3. Vérifier que l'API Google Calendar est activée
4. Tester manuellement l'API avec le script de test (voir section Dépannage)

---

## 🧪 Scénario 4 : Vérification du stockage du googleEventId

### Objectif
Vérifier que l'ID de l'événement Google Calendar est bien stocké dans la base de données.

### Étapes
1. Créer un rendez-vous (voir Scénario 3)
2. Noter l'ID de l'événement dans les logs (ex: `abc123xyz456`)
3. Se connecter à la base de données
4. Exécuter la requête SQL :
   ```sql
   SELECT id, customerName, customerEmail, googleEventId, createdAt 
   FROM appointments 
   ORDER BY createdAt DESC 
   LIMIT 1;
   ```

### Résultat attendu
✅ **Succès** :
- La colonne `googleEventId` contient l'ID de l'événement Google Calendar
- L'ID correspond à celui affiché dans les logs

❌ **Échec** :
- La colonne `googleEventId` est `NULL`
- L'ID ne correspond pas

### Correction en cas d'échec
- Vérifier que la fonction `updateAppointment` est bien appelée après la création de l'événement
- Vérifier que le champ `googleEventId` existe bien dans le schéma de la table `appointments`

---

## 🧪 Scénario 5 : Gestion des erreurs

### Objectif
Vérifier que l'application gère correctement les erreurs de synchronisation sans bloquer la création du rendez-vous.

### Test 1 : Service Account invalide

#### Étapes
1. Modifier temporairement le `.env` avec une clé privée invalide
2. Redémarrer l'application
3. Créer un rendez-vous

#### Résultat attendu
✅ **Succès** :
- Le rendez-vous est créé dans la base de données
- Un message d'erreur apparaît dans les logs
- L'utilisateur reçoit la confirmation du rendez-vous
- Aucun événement n'est créé dans Google Calendar

❌ **Échec** :
- La création du rendez-vous échoue complètement
- L'application plante

### Test 2 : Calendrier non partagé

#### Étapes
1. Retirer temporairement les permissions du calendrier pour le service account
2. Créer un rendez-vous

#### Résultat attendu
✅ **Succès** :
- Le rendez-vous est créé dans la base de données
- Un message d'erreur "Permission denied" apparaît dans les logs
- L'utilisateur reçoit la confirmation du rendez-vous

❌ **Échec** :
- La création du rendez-vous échoue
- Aucun message d'erreur clair

---

## 🧪 Scénario 6 : Personnalisation des rappels

### Objectif
Vérifier que les rappels peuvent être personnalisés.

### Étapes
1. Modifier `server/services/googleCalendar.ts`
2. Changer le délai du rappel :
   ```typescript
   reminders: {
     useDefault: false,
     overrides: [
       { method: 'email', minutes: 60 },  // Changé à 60 minutes
       { method: 'popup', minutes: 60 },
     ],
   }
   ```
3. Redémarrer l'application
4. Créer un rendez-vous
5. Vérifier dans Google Calendar

### Résultat attendu
✅ **Succès** :
- L'événement a un rappel configuré à 60 minutes avant (au lieu de 30)

❌ **Échec** :
- Le rappel reste à 30 minutes
- Aucun rappel n'est configuré

---

## 🧪 Scénario 7 : Test de charge (optionnel)

### Objectif
Vérifier que le système peut gérer plusieurs créations de rendez-vous simultanées.

### Étapes
1. Créer 10 rendez-vous rapidement (dans un intervalle de 2 minutes)
2. Observer les logs
3. Vérifier dans Google Calendar

### Résultat attendu
✅ **Succès** :
- Les 10 rendez-vous sont créés dans la base de données
- Les 10 événements apparaissent dans Google Calendar
- Aucune erreur de quota ou de rate limiting

❌ **Échec** :
- Certains rendez-vous ne sont pas synchronisés
- Erreurs de quota dans les logs

### Correction en cas d'échec
- Vérifier les quotas de l'API Google Calendar
- Implémenter un système de retry en cas d'erreur temporaire
- Implémenter une file d'attente pour les synchronisations

---

## 📊 Tableau récapitulatif des tests

| Scénario | Statut | Commentaires |
|----------|--------|--------------|
| 1. Configuration du Service | ⏳ À tester | |
| 2. Types d'absence | ⏳ À tester | |
| 3. Synchronisation Google Calendar | ⏳ À tester | |
| 4. Stockage googleEventId | ⏳ À tester | |
| 5. Gestion des erreurs | ⏳ À tester | |
| 6. Personnalisation rappels | ⏳ À tester | |
| 7. Test de charge | ⏳ Optionnel | |

**Légende** :
- ⏳ À tester
- ✅ Réussi
- ❌ Échec
- ⚠️ Réussi avec remarques

---

## 🐛 Dépannage rapide

### Le service Google Calendar ne se lance pas
```bash
# Vérifier les variables d'environnement
echo $GOOGLE_SERVICE_ACCOUNT_EMAIL
echo $GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

# Si vides, vérifier le fichier .env
cat .env | grep GOOGLE_
```

### Les événements ne sont pas créés
```bash
# Tester manuellement l'API
# Installer gcloud CLI : https://cloud.google.com/sdk/docs/install
gcloud auth activate-service-account --key-file=service-account-key.json
gcloud auth print-access-token

# Utiliser le token pour tester
curl -X POST \
  https://www.googleapis.com/calendar/v3/calendars/primary/events \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Test Event",
    "start": {
      "dateTime": "2025-11-20T14:00:00+01:00",
      "timeZone": "Europe/Paris"
    },
    "end": {
      "dateTime": "2025-11-20T15:00:00+01:00",
      "timeZone": "Europe/Paris"
    }
  }'
```

### Erreur "Invalid credentials"
- Vérifier que la clé privée dans `.env` contient bien les `\n`
- Vérifier qu'il n'y a pas d'espaces ou de caractères supplémentaires
- Télécharger à nouveau le fichier JSON du service account

---

## 📝 Rapport de test

Une fois tous les tests effectués, remplir ce rapport :

### Environnement de test
- Date : _______________
- Version de l'application : _______________
- Environnement : [ ] Développement [ ] Production
- Navigateur : _______________

### Résultats
- Tests réussis : _____ / 7
- Tests échoués : _____ / 7
- Temps total des tests : _____ minutes

### Problèmes identifiés
1. ________________________________________
2. ________________________________________
3. ________________________________________

### Recommandations
1. ________________________________________
2. ________________________________________
3. ________________________________________

---

## ✅ Validation finale

L'intégration Google Calendar est validée si :
- [ ] Tous les tests critiques (1-4) passent avec succès
- [ ] Les logs ne contiennent pas d'erreurs
- [ ] Les événements apparaissent correctement dans Google Calendar
- [ ] Les `googleEventId` sont bien stockés dans la base de données
- [ ] Les rappels sont configurés correctement

**Testé par** : _______________  
**Date** : _______________  
**Signature** : _______________
