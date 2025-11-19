# 🧪 Guide de Test Utilisateur - Google Calendar Integration

## ⚠️ IMPORTANT : Configuration Préalable Requise

Avant de commencer les tests, vous devez **ABSOLUMENT** avoir :

1. ✅ Créé un Service Account dans Google Cloud Console (FAIT)
2. ✅ Partagé votre Google Calendar avec l'email du service account (FAIT)
3. ❗ **Configuré le fichier `.env` avec la clé privée** (À FAIRE)

---

## 📋 Étape 3 : Configuration du fichier `.env`

### 🔑 Récupération de la clé privée

1. Ouvrez le fichier JSON téléchargé lors de la création du Service Account
2. Trouvez la clé `private_key` dans le JSON
3. Copiez la valeur complète (avec les `\n`)

Exemple du fichier JSON :
```json
{
  "type": "service_account",
  "project_id": "votre-projet-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwgg...\n-----END PRIVATE KEY-----\n",
  "client_email": "planningadmin@apaddicto.iam.gserviceaccount.com",
  ...
}
```

### ✏️ Modification du fichier `.env`

1. Ouvrez le fichier `.env` à la racine du projet
2. Remplacez la ligne :
   ```env
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   ```
   
   Par votre vraie clé (gardez les guillemets et les `\n`) :
   ```env
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwgg...\n-----END PRIVATE KEY-----\n"
   ```

3. Vérifiez que les autres variables sont correctes :
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
   GOOGLE_CALENDAR_ID=primary
   ```

4. **Ajoutez aussi votre DATABASE_URL** (depuis Vercel ou Neon) :
   ```env
   DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
   ```

5. Sauvegardez le fichier `.env`

---

## 🚀 Démarrage de l'Application

### Terminal 1 : Démarrer l'application

```bash
cd /home/user/webapp
npm run dev
```

### Vérification des logs

Vérifiez dans les logs qu'il n'y a **PAS** de message d'erreur concernant Google Calendar.

✅ **Bon signe** :
```
VITE v6.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

❌ **Erreur à corriger** :
```
[GoogleCalendar] Configuration incomplète. Synchronisation Google Calendar désactivée.
```
➡️ Si vous voyez cette erreur, revérifiez votre fichier `.env`

---

## 🧪 Test 1 : Création de Plages de Disponibilité (Admin)

### Objectif
Créer des plages de disponibilité de 18h à 20h pour les lundis, mardis, jeudis et vendredis avec des séances d'une heure.

### Étapes

1. **Ouvrez l'application** : http://localhost:5173

2. **Connectez-vous en tant qu'admin**
   - Si vous n'avez pas de compte admin, créez-en un ou utilisez les credentials de test

3. **Allez dans le Dashboard Admin**
   - Cliquez sur "Admin" dans le menu
   - Ou allez sur : http://localhost:5173/admin

4. **Accédez à la Gestion des Disponibilités**
   - Dans le menu admin, cliquez sur "Disponibilités" ou "Gestion des créneaux"
   - Ou allez sur : http://localhost:5173/admin/availability

5. **Cliquez sur "Nouveau créneau"**

6. **Sélectionnez le type**
   - Cliquez sur le bouton **"Disponibilité"** (en vert)
   - Vérifiez que les boutons **"Disponibilité"** et **"Absence"** sont bien visibles

7. **Passez à l'onglet "Créneaux récurrents"**

8. **Configurez les créneaux** :
   - **Date de début** : Sélectionnez le lundi prochain
   - **Type de consultation** : Consultation classique
   - **Heure de début de journée** : 18:00
   - **Heure de fin de journée** : 20:00
   - **Durée du créneau** : 60 minutes
   - **Pause entre créneaux** : 0 minutes
   - **Jours de la semaine** : Sélectionnez **Lundi**, **Mardi**, **Jeudi**, **Vendredi**
   - **Fin de la récurrence** : 
     - Choisissez "Jusqu'à une date"
     - Sélectionnez une date dans 2 mois

9. **Prévisualisez**
   - Cliquez sur **"Prévisualiser"**
   - Vérifiez le nombre de créneaux générés
   - Devrait afficher : 2 créneaux par jour × 4 jours × 8 semaines = ~64 créneaux

10. **Créez les créneaux**
    - Cliquez sur **"Créer [X] créneau(x)"**
    - Attendez la confirmation

### ✅ Résultat attendu

- Toast de succès : "64 créneau(x) créé(s) avec succès"
- Les créneaux apparaissent dans le calendrier
- Vous voyez des blocs verts pour les créneaux disponibles

### 📸 Capture d'écran

Prenez une capture d'écran du calendrier avec les créneaux créés.

---

## 🧪 Test 2 : Prise de Rendez-vous (Patient)

### Objectif
Un patient prend un rendez-vous sur un créneau disponible.

### Étapes

1. **Déconnectez-vous** (si connecté en tant qu'admin)

2. **Connectez-vous en tant que patient** ou créez un compte patient
   - Email : patient.test@example.com
   - Nom : Jean Dupont

3. **Allez sur la page de prise de RDV**
   - Cliquez sur "Prendre un rendez-vous" dans le menu
   - Ou allez sur : http://localhost:5173/book-appointment

4. **Sélectionnez un praticien**

5. **Choisissez une date et heure**
   - Sélectionnez un **lundi à 18h00** ou **19h00**
   - Ou un mardi/jeudi/vendredi dans les mêmes horaires

6. **Remplissez le formulaire**
   - **Nom** : Jean Dupont
   - **Email** : jean.dupont@test.com
   - **Téléphone** : +33 6 12 34 56 78
   - **Motif** : Consultation de suivi
   - **Notes** : Test de l'intégration Google Calendar

7. **Validez le rendez-vous**
   - Cliquez sur **"Confirmer le rendez-vous"**
   - Attendez la confirmation

### ✅ Résultat attendu

- Toast de succès : "Rendez-vous créé avec succès"
- Email de confirmation reçu (si configuré)
- Redirection vers la page de confirmation

### 📊 Vérification dans les logs

Dans le terminal où l'application tourne, vous devriez voir :

```
[Appointments] ✅ Rendez-vous ajouté dans Google Calendar: abc123xyz456
```

### ❌ En cas d'erreur

Si vous voyez :
```
[Appointments] ❌ Erreur lors de la synchronisation Google Calendar: ...
```

➡️ Vérifiez :
1. Que la clé privée est correcte dans `.env`
2. Que le calendrier est bien partagé avec le service account
3. Que l'API Google Calendar est activée

---

## 🧪 Test 3 : Vérification dans Google Calendar

### Objectif
Vérifier que l'événement a bien été créé automatiquement dans Google Calendar.

### Étapes

1. **Ouvrez Google Calendar**
   - Allez sur : https://calendar.google.com

2. **Vérifiez la date et l'heure du rendez-vous**
   - Cliquez sur le jour où vous avez créé le RDV
   - Cherchez l'événement à l'heure choisie

3. **Vérifiez les détails de l'événement**
   - **Titre** : "Consultation - Jean Dupont"
   - **Heure** : 18:00 - 19:00 (selon votre choix)
   - **Description** : Devrait contenir :
     - Nom du patient
     - Motif : Consultation de suivi
     - Téléphone : +33 6 12 34 56 78
     - Praticien : [Nom du praticien]
   - **Rappel** : 30 minutes avant (email + notification)
   - **Couleur** : Vert (pour les RDV médicaux)

### ✅ Résultat attendu

📅 **L'événement est présent dans Google Calendar** avec toutes les informations correctes !

### 📸 Capture d'écran

Prenez une capture d'écran de l'événement dans Google Calendar.

---

## 🧪 Test 4 : Vérification en Base de Données

### Objectif
Vérifier que le `googleEventId` est bien stocké.

### Étapes (Optionnel - Technique)

Si vous avez accès à votre base de données Neon :

1. Connectez-vous à votre base de données
2. Exécutez cette requête :
   ```sql
   SELECT 
     id, 
     "customerName", 
     "customerEmail", 
     "startTime", 
     "googleEventId", 
     "createdAt" 
   FROM appointments 
   ORDER BY "createdAt" DESC 
   LIMIT 1;
   ```

### ✅ Résultat attendu

| id | customerName | customerEmail | startTime | googleEventId | createdAt |
|----|--------------|---------------|-----------|---------------|-----------|
| 1 | Jean Dupont | jean.dupont@... | 2025-11-... | abc123xyz... | 2025-11-... |

➡️ La colonne `googleEventId` contient l'ID de l'événement Google Calendar !

---

## 🐛 Dépannage

### Problème 1 : "Cannot read property 'createEvent' of null"

**Cause** : Le service Google Calendar n'est pas initialisé

**Solution** :
1. Vérifiez que toutes les variables d'environnement sont définies dans `.env`
2. Redémarrez l'application
3. Vérifiez les logs au démarrage

### Problème 2 : "Invalid grant" ou "Invalid credentials"

**Cause** : La clé privée est mal formatée

**Solution** :
1. Vérifiez que la clé privée contient bien les `\n`
2. Vérifiez qu'il n'y a pas d'espaces supplémentaires
3. Téléchargez à nouveau le fichier JSON et recopiez la clé

### Problème 3 : "Permission denied"

**Cause** : Le calendrier n'est pas partagé avec le service account

**Solution** :
1. Ouvrez Google Calendar
2. Paramètres du calendrier
3. Partagez avec `planningadmin@apaddicto.iam.gserviceaccount.com`
4. Donnez les permissions "Apporter des modifications aux événements"

### Problème 4 : Les créneaux ne s'affichent pas

**Cause** : Problème de schéma ou de migration DB

**Solution** :
1. Vérifiez que la table `availabilitySlots` existe
2. Vérifiez que le schéma est bien appliqué
3. Consultez les logs pour identifier l'erreur

---

## 📊 Checklist de Validation

Cochez au fur et à mesure :

- [ ] Fichier `.env` configuré avec la vraie clé privée
- [ ] DATABASE_URL configurée
- [ ] Application démarrée sans erreur
- [ ] Créneaux de disponibilité créés (18h-20h, lun/mar/jeu/ven)
- [ ] Les créneaux apparaissent dans le calendrier admin
- [ ] Rendez-vous créé par un patient
- [ ] Message de confirmation affiché
- [ ] Log "[Appointments] ✅ Rendez-vous ajouté dans Google Calendar" visible
- [ ] Événement visible dans Google Calendar
- [ ] Toutes les informations correctes dans l'événement
- [ ] Rappel 30 minutes avant configuré
- [ ] `googleEventId` stocké en base de données

---

## ✅ Tests Réussis !

Si tous les tests passent, **l'intégration Google Calendar fonctionne parfaitement** !

Vous pouvez maintenant :
1. Committer les changements finaux
2. Pusher sur GitHub
3. Déployer sur Vercel avec les variables d'environnement

---

## 📝 Rapport de Test

Une fois les tests terminés, remplissez ce rapport :

**Date** : ________________

**Tests réussis** : ____ / 4

**Problèmes rencontrés** :
1. _____________________________________
2. _____________________________________

**Captures d'écran** :
- [ ] Calendrier admin avec créneaux
- [ ] Événement dans Google Calendar
- [ ] Logs de confirmation

**Temps total des tests** : _______ minutes

**Signature** : _________________

---

## 🚀 Prochaine Étape

Une fois les tests validés, consultez le document `RECAPITULATIF_IMPLEMENTATION.md` pour les étapes de déploiement en production.
