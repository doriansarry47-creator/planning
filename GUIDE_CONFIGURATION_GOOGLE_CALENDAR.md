# Configuration Google Calendar - Guide Complet

## 🎯 Objectif
Intégrer votre application de planning avec Google Calendar pour synchroniser automatiquement les rendez-vous.

## 📋 Ce qui est déjà configuré
- ✅ Service Google Calendar côté serveur
- ✅ Interface d'administration pour la connexion
- ✅ Synchronisation automatique lors de la création de rendez-vous
- ✅ Configuration des variables d'environnement

## 🔧 Étapes à suivre

### 1. Obtenir les credentials Google Calendar

Allez sur [Google Cloud Console](https://console.cloud.google.com/) et suivez ces étapes :

#### 1.1 Créer un projet (si pas déjà fait)
- Cliquez sur "Sélectionner un projet" en haut de la page
- Cliquez sur "Nouveau projet"
- Nommez-le "Planning App"
- Cliquez sur "Créer"

#### 1.2 Activer l'API Google Calendar
- Allez dans "API et services" > "Bibliothèque"
- Recherchez "Google Calendar API"
- Cliquez sur "Google Calendar API"
- Cliquez sur "Activer"

#### 1.3 Créer les credentials OAuth 2.0
- Allez dans "API et services" > "Identifiants"
- Cliquez sur "Créer des identifiants" > "ID client OAuth 2.0"
- Type d'application : "Application Web"
- Nom : "Planning App Client"
- URI de redirection autorisés :
  - `http://localhost:5173/oauth/callback` (développement)
  - `https://votre-domaine.com/oauth/callback` (production)

#### 1.4 Obtenir les identifiants
Après création, notez :
- **Client ID** : `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
- **Client Secret** : `xxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Configuration du fichier .env

Mettez à jour votre fichier `.env` avec les bonnes valeurs :

```env
# Google Calendar OAuth Configuration
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback

# Variables côté client (Vite)
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Configuration du côté client

Le fichier `client/src/lib/googleCalendar.ts` est déjà configuré pour utiliser :
- Votre API key via `VITE_GOOGLE_API_KEY`
- Les credentials OAuth2 via `VITE_GOOGLE_CLIENT_ID`

### 4. Utilisation côté admin

Dans l'interface d'administration, allez dans les paramètres Google Calendar :
1. Cliquez sur "Connecter Google Calendar"
2. Autorisez l'application
3. Les rendez-vous seront automatiquement synchronisés

## 🧪 Test de la configuration

Pour tester la connexion :
1. Lancez l'application : `npm run dev`
2. Allez dans l'admin
3. Tentez de vous connecter à Google Calendar
4. Vérifiez les logs pour les erreurs

## 🔒 Configuration côté serveur

Le service Google Calendar côté serveur utilise un Service Account pour la synchronisation automatique. Si vous voulez activer cette fonctionnalité :

### Service Account (Optionnel mais recommandé)

1. Dans Google Cloud Console :
   - Allez dans "IAM et administration" > "Comptes de service"
   - Cliquez sur "Créer un compte de service"
   - Nommez-le "planning-calendar-service"
   - Téléchargez le fichier JSON

2. Configurez le fichier `.env` :
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=planning-calendar-service@votre-projet.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary
```

3. Partagez votre Google Calendar avec l'email du service account

## 🎨 Fonctionnalités actuelles

L'intégration offre :
- ✅ Connexion OAuth2 côté admin
- ✅ Synchronisation automatique lors de la création de rendez-vous
- ✅ Mise à jour et annulation des événements
- ✅ Rappels automatiques
- ✅ Interface de configuration dans l'admin

## 🐛 Dépannage

### Erreur "Invalid client"
- Vérifiez que `VITE_GOOGLE_CLIENT_ID` est correct
- Assurez-vous que l'URI de redirection est autorisé

### Erreur "Access denied"
- Vérifiez que l'API Calendar est activée
- Assurez-vous que les scopes OAuth2 sont corrects

### Pas de synchronisation
- Vérifiez les logs du serveur
- Assurez-vous que toutes les variables d'environnement sont définies

## 📱 Test avec l'interface

1. **Connexion Admin** :
   - Interface : `/admin` > Paramètres Google Calendar
   - Cliquez sur "Connecter Google Calendar"

2. **Création de rendez-vous** :
   - Créer un nouveau rendez-vous via l'application
   - Vérifier la création automatique dans Google Calendar

3. **Vérification** :
   - Les événements apparaissent avec la couleur "vert"
   - Les rappels sont configurés automatiquement

## 🚀 Prochaines étapes

Une fois la configuration terminée, l'application :
- Synchronisera automatiquement tous les nouveaux rendez-vous
- Permettra la gestion bidirectionnelle (création, modification, annulation)
- Enverra des rappels automatiques

---

**Note** : L'intégration est déjà prête ! Il suffit de configurer les credentials OAuth2 de Google Cloud Console.