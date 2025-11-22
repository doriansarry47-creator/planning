# Configuration Google Calendar

Ce guide vous explique comment configurer l'intégration Google Calendar pour synchroniser automatiquement les rendez-vous pris par vos patients.

## 🎯 Objectif

Lorsqu'un patient prend un rendez-vous sur votre site, l'événement sera automatiquement créé dans votre Google Calendar avec:
- Le nom du patient
- L'email du patient
- L'heure de début et de fin
- Le motif de consultation
- Des rappels automatiques (1 jour avant et 1 heure avant)

## 📋 Prérequis

- Un compte Google
- Accès à Google Cloud Console
- Votre calendrier Google (par défaut: calendrier principal)

## 🔧 Étapes de configuration

### 1. Créer un projet dans Google Cloud Console

1. Allez sur https://console.cloud.google.com/
2. Cliquez sur "Sélectionner un projet" en haut
3. Cliquez sur "Nouveau projet"
4. Donnez un nom à votre projet (ex: "Planning Thérapie")
5. Cliquez sur "Créer"

### 2. Activer l'API Google Calendar

1. Dans votre projet, allez dans "API et services" > "Bibliothèque"
2. Recherchez "Google Calendar API"
3. Cliquez sur "Google Calendar API"
4. Cliquez sur "Activer"

### 3. Créer les credentials OAuth 2.0

1. Allez dans "API et services" > "Identifiants"
2. Cliquez sur "Créer des identifiants" > "ID client OAuth"
3. Si demandé, configurez l'écran de consentement OAuth:
   - Type d'utilisateur: Externe
   - Nom de l'application: "Planning Thérapie"
   - Email d'assistance: votre email
   - Domaines autorisés: votre domaine (ex: monsite.com)
   - Ajoutez les scopes:
     - `.../auth/calendar.events` (pour gérer les événements)
     - `.../auth/calendar` (pour accéder au calendrier)
4. Créez l'ID client OAuth:
   - Type d'application: Application Web
   - Nom: "Planning Thérapie Client"
   - URI de redirection autorisés:
     - `http://localhost:5173/oauth/callback` (développement)
     - `https://votre-domaine.com/oauth/callback` (production)
5. Cliquez sur "Créer"
6. Notez le **Client ID** et le **Client Secret**

### 4. Obtenir le Refresh Token

#### Option A: Utiliser le script fourni (recommandé)

1. Créez un fichier `get-google-token.js`:

```javascript
const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:5173/oauth/callback';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Générer l'URL d'autorisation
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent', // Force le refresh token
});

console.log('Autorisez cette app en visitant cette URL:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Entrez le code depuis cette URL: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Votre Refresh Token:');
    console.log(tokens.refresh_token);
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token:', error);
  }
});
```

2. Remplacez `YOUR_CLIENT_ID` et `YOUR_CLIENT_SECRET` par vos valeurs
3. Exécutez: `node get-google-token.js`
4. Ouvrez l'URL affichée dans votre navigateur
5. Autorisez l'application
6. Copiez le code de l'URL de redirection
7. Collez-le dans le terminal
8. Copiez le **Refresh Token** affiché

#### Option B: Utiliser OAuth 2.0 Playground

1. Allez sur https://developers.google.com/oauthplayground/
2. Cliquez sur l'icône ⚙️ en haut à droite
3. Cochez "Use your own OAuth credentials"
4. Entrez votre Client ID et Client Secret
5. Dans la liste de gauche, trouvez "Calendar API v3"
6. Sélectionnez `https://www.googleapis.com/auth/calendar.events`
7. Cliquez sur "Authorize APIs"
8. Autorisez l'application
9. Cliquez sur "Exchange authorization code for tokens"
10. Copiez le **Refresh Token**

### 5. Configurer les variables d'environnement

#### En développement local

1. Créez un fichier `.env` à la racine du projet:

```env
DATABASE_URL=votre_database_url
GOOGLE_API_KEY=votre_google_api_key

# Google Calendar Configuration
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback
GOOGLE_REFRESH_TOKEN=votre_refresh_token
GOOGLE_CALENDAR_ID=primary
```

2. Remplacez les valeurs par celles obtenues précédemment
3. `GOOGLE_CALENDAR_ID=primary` utilise votre calendrier principal
   - Pour utiliser un calendrier spécifique, utilisez son ID (trouvable dans les paramètres du calendrier)

#### En production (Vercel)

1. Allez dans les paramètres de votre projet Vercel
2. Section "Environment Variables"
3. Ajoutez ces variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (avec votre domaine de production)
   - `GOOGLE_REFRESH_TOKEN`
   - `GOOGLE_CALENDAR_ID`
4. Redéployez votre application

### 6. Tester l'intégration

1. Lancez votre application: `npm run dev`
2. Créez un rendez-vous de test
3. Vérifiez dans votre Google Calendar que l'événement a été créé
4. Vérifiez que vous avez reçu une notification email

## 🎨 Personnalisation

### Modifier les rappels

Dans `/home/user/webapp/server/services/googleCalendar.ts`, ligne ~85:

```typescript
reminders: {
  useDefault: false,
  overrides: [
    { method: 'email', minutes: 24 * 60 }, // 1 jour avant
    { method: 'popup', minutes: 60 },      // 1 heure avant
  ],
},
```

### Modifier la couleur des événements

Dans le même fichier, ligne ~96:

```typescript
colorId: '10', // Vert
```

Codes couleur disponibles:
- '1': Lavande
- '2': Sauge
- '3': Raisin
- '4': Flamingo
- '5': Banane
- '6': Mandarine
- '7': Paon
- '8': Graphite
- '9': Myrtille
- '10': Basilic
- '11': Tomate

### Utiliser un calendrier spécifique

Si vous voulez utiliser un calendrier autre que le principal:

1. Ouvrez Google Calendar
2. Trouvez le calendrier dans la liste de gauche
3. Cliquez sur ⋮ > "Paramètres et partage"
4. Copiez l'"ID du calendrier" (format: xxxxx@group.calendar.google.com)
5. Utilisez cet ID dans `GOOGLE_CALENDAR_ID`

## 🔒 Sécurité

⚠️ **Important:**
- Ne committez JAMAIS les fichiers `.env` contenant vos secrets
- Gardez votre Client Secret et Refresh Token confidentiels
- Ajoutez `.env` à votre `.gitignore`
- En production, utilisez les variables d'environnement de votre plateforme (Vercel, etc.)
- Révocez l'accès si vous pensez que vos credentials ont été compromis

## 🐛 Dépannage

### "Invalid grant" ou "Token has been expired or revoked"

- Régénérez un nouveau Refresh Token en suivant l'étape 4
- Vérifiez que `access_type: 'offline'` est bien configuré lors de l'obtention du token
- Assurez-vous d'avoir ajouté `prompt: 'consent'` pour forcer un nouveau refresh token

### "Insufficient Permission"

- Vérifiez que vous avez autorisé les bons scopes:
  - `https://www.googleapis.com/auth/calendar.events`
  - `https://www.googleapis.com/auth/calendar`

### Les événements ne sont pas créés

- Vérifiez les logs de votre serveur
- Vérifiez que toutes les variables d'environnement sont définies
- Vérifiez que l'API Google Calendar est bien activée dans Google Cloud Console
- Testez votre configuration avec un simple appel API

### Tester manuellement l'API

```bash
curl -X POST \
  https://www.googleapis.com/calendar/v3/calendars/primary/events \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Test Event",
    "start": {
      "dateTime": "2025-11-15T10:00:00+01:00",
      "timeZone": "Europe/Paris"
    },
    "end": {
      "dateTime": "2025-11-15T11:00:00+01:00",
      "timeZone": "Europe/Paris"
    }
  }'
```

## 📚 Ressources

- [Documentation Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)

## 💡 Fonctionnalités disponibles

L'intégration actuelle supporte:
- ✅ Création automatique d'événements lors de la prise de rendez-vous
- ✅ Notifications email aux patients
- ✅ Rappels configurables
- ✅ Coloration des événements
- ✅ Vérification de disponibilité (optionnel)
- ✅ Mise à jour d'événements (à implémenter)
- ✅ Annulation d'événements (à implémenter)

## 🚀 Prochaines étapes

Pour étendre l'intégration:
- Synchroniser les modifications de rendez-vous
- Synchroniser les annulations
- Vérifier la disponibilité en temps réel avant la réservation
- Ajouter des rappels SMS (via intégration tierce)
- Exporter les rendez-vous dans d'autres formats (iCal, etc.)

---

**Besoin d'aide ?** Contactez le support technique ou consultez la documentation complète dans `/home/user/webapp/server/services/googleCalendar.ts`
