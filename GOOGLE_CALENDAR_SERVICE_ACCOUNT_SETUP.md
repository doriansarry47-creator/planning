# Configuration Google Calendar avec Service Account

Ce guide vous explique comment configurer l'intégration Google Calendar en utilisant un **Service Account** (Compte de Service) pour synchroniser automatiquement les rendez-vous.

## 📌 Pourquoi utiliser un Service Account ?

- ✅ **Pas besoin d'authentification manuelle** : Le service tourne automatiquement en arrière-plan
- ✅ **Pas de refresh token** : Pas besoin de renouveler l'autorisation
- ✅ **Idéal pour les serveurs** : Parfait pour les applications backend
- ✅ **Sécurisé** : Les credentials sont gérés côté serveur uniquement

---

## 🚀 Étapes de configuration

### Étape 1 : Créer un projet dans Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur **"Sélectionner un projet"** en haut
3. Cliquez sur **"Nouveau projet"**
4. Donnez un nom au projet (ex: `Planning Apaddicto`)
5. Cliquez sur **"Créer"**

---

### Étape 2 : Activer l'API Google Calendar

1. Dans votre projet, allez dans le menu **"API et services" > "Bibliothèque"**
2. Recherchez **"Google Calendar API"**
3. Cliquez sur le résultat
4. Cliquez sur le bouton **"Activer"**

---

### Étape 3 : Créer un Service Account

1. Allez dans **"API et services" > "Identifiants"**
2. Cliquez sur **"Créer des identifiants"**
3. Sélectionnez **"Compte de service"**
4. Remplissez les informations :
   - **Nom du compte de service** : `Planning Admin` (ou tout autre nom)
   - **ID du compte de service** : `planningadmin` (ou laissez auto-générer)
   - **Description** : `Service account pour synchroniser les RDV avec Google Calendar`
5. Cliquez sur **"Créer et continuer"**
6. Pour le rôle, sélectionnez **"Propriétaire"** ou **"Éditeur"** (pour avoir les permissions nécessaires)
7. Cliquez sur **"Continuer"** puis **"Terminé"**

---

### Étape 4 : Télécharger les credentials du Service Account

1. Dans la liste des comptes de service, trouvez celui que vous venez de créer
2. Cliquez sur l'**email du compte de service** (ex: `planningadmin@apaddicto.iam.gserviceaccount.com`)
3. Allez dans l'onglet **"Clés"**
4. Cliquez sur **"Ajouter une clé" > "Créer une clé"**
5. Choisissez le format **JSON**
6. Cliquez sur **"Créer"**
7. **Le fichier JSON est téléchargé automatiquement** - Gardez-le en sécurité !

Le fichier JSON ressemble à ceci :
```json
{
  "type": "service_account",
  "project_id": "votre-projet",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nXXXXXXXXXX\n-----END PRIVATE KEY-----\n",
  "client_email": "planningadmin@apaddicto.iam.gserviceaccount.com",
  "client_id": "117226736084884112171",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

### Étape 5 : Partager votre Google Calendar avec le Service Account

🔴 **TRÈS IMPORTANT** : Le service account doit avoir accès à votre calendrier !

1. Ouvrez [Google Calendar](https://calendar.google.com/)
2. Dans la liste des calendriers à gauche, trouvez le calendrier que vous souhaitez synchroniser
3. Cliquez sur les **trois points (⋮)** à côté du nom du calendrier
4. Sélectionnez **"Paramètres et partage"**
5. Dans la section **"Partager avec des personnes en particulier"**, cliquez sur **"Ajouter des personnes"**
6. Entrez l'**email du service account** (ex: `planningadmin@apaddicto.iam.gserviceaccount.com`)
7. Choisissez les permissions : **"Apporter des modifications aux événements"** ou **"Gérer le partage"**
8. Cliquez sur **"Envoyer"**

✅ Maintenant le service account peut lire et écrire des événements dans votre calendrier !

---

### Étape 6 : Obtenir l'ID du calendrier (optionnel)

Si vous voulez utiliser un calendrier spécifique (autre que le calendrier principal) :

1. Dans Google Calendar, allez dans **"Paramètres"**
2. Dans la liste de gauche, cliquez sur le calendrier souhaité
3. Faites défiler jusqu'à **"Intégrer le calendrier"**
4. Copiez l'**"ID du calendrier"** (ex: `votre-email@gmail.com` ou `xxxxx@group.calendar.google.com`)

---

### Étape 7 : Configurer les variables d'environnement

#### En développement local

Créez un fichier `.env` à la racine du projet et ajoutez :

```env
# Email du service account (depuis le fichier JSON téléchargé)
GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com

# Clé privée du service account (depuis le fichier JSON)
# IMPORTANT: Remplacez les retours à la ligne par \n
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"

# ID du calendrier (primary = calendrier principal)
GOOGLE_CALENDAR_ID=primary
```

**⚠️ Comment copier la clé privée ?**

Dans le fichier JSON téléchargé, la clé `private_key` contient des retours à la ligne `\n`. 
Copiez-la telle quelle (avec les guillemets et les `\n`) dans votre fichier `.env`.

Exemple :
```json
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBg...\n-----END PRIVATE KEY-----\n"
```

Devient dans `.env` :
```env
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBg...\n-----END PRIVATE KEY-----\n"
```

#### En production (Vercel)

1. Allez dans les **paramètres de votre projet Vercel**
2. Section **"Environment Variables"**
3. Ajoutez ces variables :
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` : L'email du service account
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` : La clé privée (avec les `\n`)
   - `GOOGLE_CALENDAR_ID` : L'ID du calendrier

4. Cliquez sur **"Save"**
5. **Redéployez** votre application pour que les variables prennent effet

---

## ✅ Tester l'intégration

### Test 1 : Vérifier la configuration

Lancez votre application :
```bash
npm run dev
```

Vérifiez dans les logs du serveur :
```
[GoogleCalendar] Service configuré avec succès
```

Si vous voyez :
```
[GoogleCalendar] Configuration incomplète. Synchronisation Google Calendar désactivée.
```
➡️ Vérifiez que toutes les variables d'environnement sont bien définies.

### Test 2 : Créer un rendez-vous

1. Allez sur votre application
2. Connectez-vous en tant que patient
3. Prenez un rendez-vous
4. Vérifiez dans votre **Google Calendar** que l'événement a été créé

Vous devriez voir :
- 📅 Un événement avec le nom du patient
- ⏰ La date et l'heure du rendez-vous
- 📝 Les détails (motif, téléphone, praticien)
- 🔔 Un rappel 30 minutes avant

### Test 3 : Vérifier les logs

Dans les logs du serveur, vous devriez voir :
```
[Appointments] ✅ Rendez-vous ajouté dans Google Calendar: xxxxxxxxxxx
```

Si vous voyez une erreur, vérifiez :
- ✅ Que l'API Google Calendar est bien activée
- ✅ Que le service account a accès au calendrier
- ✅ Que la clé privée est correctement formatée dans `.env`

---

## 🔒 Sécurité

### ⚠️ NE JAMAIS FAIRE :
- ❌ Committer le fichier `.env` dans Git
- ❌ Partager le fichier JSON du service account publiquement
- ❌ Exposer la clé privée dans le code frontend

### ✅ TOUJOURS FAIRE :
- ✅ Ajouter `.env` dans `.gitignore`
- ✅ Stocker les credentials uniquement côté serveur
- ✅ Utiliser des variables d'environnement sécurisées en production
- ✅ Révoquer l'accès si les credentials sont compromis

### Comment révoquer l'accès ?

Si vous pensez que vos credentials ont été compromis :

1. Allez dans **Google Cloud Console**
2. **"API et services" > "Identifiants"**
3. Trouvez votre **service account**
4. Dans l'onglet **"Clés"**, supprimez la clé compromise
5. Créez une **nouvelle clé** et mettez à jour vos variables d'environnement

---

## 🎨 Personnalisation

### Modifier le rappel (30 minutes par défaut)

Dans `/home/user/webapp/server/services/googleCalendar.ts` :

```typescript
reminders: {
  useDefault: false,
  overrides: [
    { method: 'email', minutes: 30 },  // Email 30 min avant
    { method: 'popup', minutes: 30 },  // Popup 30 min avant
  ],
}
```

Vous pouvez changer `30` par n'importe quelle valeur en minutes.

### Modifier la couleur des événements

Dans le même fichier :

```typescript
colorId: '10', // Vert (pour les rendez-vous médicaux)
```

Codes couleur disponibles :
- `'1'` : Lavande
- `'2'` : Sauge
- `'3'` : Raisin
- `'4'` : Flamingo
- `'5'` : Banane
- `'6'` : Mandarine
- `'7'` : Paon
- `'8'` : Graphite
- `'9'` : Myrtille
- `'10'` : Basilic (vert)
- `'11'` : Tomate

---

## 🐛 Dépannage

### Erreur : "Permission denied"

➡️ **Solution** : Vérifiez que vous avez bien partagé le calendrier avec l'email du service account.

### Erreur : "Invalid grant" ou "Invalid credentials"

➡️ **Solution** : Vérifiez que la clé privée est correctement formatée dans `.env` (avec les `\n`).

### Les événements ne sont pas créés

➡️ **Vérifications** :
1. L'API Google Calendar est bien activée dans Google Cloud Console
2. Le service account a les bonnes permissions (Propriétaire ou Éditeur)
3. Le calendrier est bien partagé avec l'email du service account
4. Les variables d'environnement sont bien définies
5. L'application a été redéployée après modification des variables

### Tester manuellement l'API

Vous pouvez tester l'API Google Calendar directement avec cURL :

```bash
# Obtenir un access token
gcloud auth print-access-token

# Créer un événement de test
curl -X POST \
  https://www.googleapis.com/calendar/v3/calendars/primary/events \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Test Event",
    "start": {
      "dateTime": "2025-11-20T10:00:00+01:00",
      "timeZone": "Europe/Paris"
    },
    "end": {
      "dateTime": "2025-11-20T11:00:00+01:00",
      "timeZone": "Europe/Paris"
    }
  }'
```

---

## 📚 Ressources

- [Documentation Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [Service Accounts - Google Cloud](https://cloud.google.com/iam/docs/service-accounts)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)

---

## 💡 Fonctionnalités disponibles

L'intégration actuelle supporte :

- ✅ Création automatique d'événements lors de la prise de rendez-vous
- ✅ Envoi de notifications email aux patients
- ✅ Rappels configurables (30 minutes avant par défaut)
- ✅ Coloration des événements
- ✅ Stockage de l'ID de l'événement Google dans la base de données
- ✅ Gestion des erreurs sans bloquer la création du rendez-vous

À implémenter :
- ⏳ Mise à jour d'événements lors de la modification d'un rendez-vous
- ⏳ Suppression d'événements lors de l'annulation d'un rendez-vous
- ⏳ Vérification de disponibilité en temps réel

---

## 🎉 Félicitations !

Votre intégration Google Calendar est maintenant configurée. Chaque fois qu'un patient prend un rendez-vous, un événement sera automatiquement créé dans votre Google Calendar avec toutes les informations nécessaires et un rappel 30 minutes avant !

**Besoin d'aide ?** Consultez la section Dépannage ci-dessus ou les logs de votre serveur pour plus d'informations.
