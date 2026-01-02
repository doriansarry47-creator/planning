# Mise à jour OAuth2 Google Calendar - 2026-01-02

## 🔴 Problème Identifié

L'application rencontrait l'erreur suivante lors de la récupération des disponibilités :

```
❌ Erreur lors de la récupération des événements: deleted_client
```

Cette erreur indique que les credentials OAuth2 configurées étaient obsolètes ou invalides (le client Google OAuth a été supprimé ou recréé).

## ✅ Solution Appliquée

### 1. Mise à jour des Credentials OAuth2 Google

Les anciennes credentials ont été remplacées par les nouvelles :

#### Anciennes Credentials (❌ Obsolètes)
- **Client ID**: `603850749287-*****.apps.googleusercontent.com` (révoqué)
- **Client Secret**: `GOCSPX-*****` (révoqué)
- **Refresh Token**: `1//03***` (révoqué)

#### Nouvelles Credentials (✅ Actives)
- **Client ID**: `603850749287-*****.apps.googleusercontent.com` (configuré dans Vercel)
- **Client Secret**: `GOCSPX-*****` (configuré dans Vercel)
- **Refresh Token**: `1//03***` (configuré dans Vercel)
- **Calendar ID**: `doriansarry47@gmail.com`
- **Redirect URI**: `http://localhost:3000/oauth2callback`

> ⚠️ **Note de sécurité** : Les credentials complètes sont stockées uniquement dans les variables d'environnement Vercel et le fichier `.env` local (ignoré par Git).

### 2. Fichiers Modifiés

#### `.env` (Local)
Mise à jour des variables d'environnement locales :
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_REDIRECT_URI`
- `VITE_GOOGLE_CLIENT_ID`

#### `update-vercel-env-new-oauth.sh`
Script automatisé pour mettre à jour les variables d'environnement sur Vercel avec les nouvelles credentials.

### 3. Déploiement sur Vercel

Les variables d'environnement suivantes ont été mises à jour avec succès sur Vercel :

✅ **Variables Configurées** :
1. `GOOGLE_CLIENT_ID` → `603850749287-*****.apps.googleusercontent.com`
2. `GOOGLE_CLIENT_SECRET` → `GOCSPX-*****`
3. `GOOGLE_REFRESH_TOKEN` → `1//03***`
4. `GOOGLE_REDIRECT_URI` → `http://localhost:3000/oauth2callback`
5. `GOOGLE_CALENDAR_ID` → `doriansarry47@gmail.com`
6. `VITE_GOOGLE_CLIENT_ID` → `603850749287-*****.apps.googleusercontent.com`

**Résultat** : 6/6 variables configurées avec succès ✅

## 🔄 Prochaines Étapes

### Pour Appliquer les Changements

1. **Redéployer l'application sur Vercel** :
   ```bash
   # Méthode 1 : Via Git (recommandé)
   git add .
   git commit -m "fix: Mise à jour OAuth2 Google Calendar credentials"
   git push origin main
   
   # Méthode 2 : Via Vercel CLI
   vercel --prod
   ```

2. **Vérifier les variables d'environnement** :
   - Dashboard Vercel : https://vercel.com/dashboard/~/settings/environment-variables
   - Vérifier que les 6 variables sont présentes et actives

3. **Tester la connexion Google Calendar** :
   - Accéder à l'application déployée
   - Tenter de récupérer les disponibilités
   - Vérifier les logs Vercel pour confirmer l'absence d'erreur `deleted_client`

## 🔒 Informations de Configuration Google Cloud

### Projet Google Cloud
- **Project ID**: `apaddicto`
- **Project Number**: `603850749287`

### Credentials OAuth 2.0
Les credentials proviennent de Google Cloud Console :
```json
{
  "web": {
    "client_id": "603850749287-*****.apps.googleusercontent.com",
    "project_id": "apaddicto",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "GOCSPX-*****",
    "redirect_uris": ["http://localhost:3000/oauth2callback"]
  }
}
```

> ⚠️ Les valeurs complètes sont configurées dans les variables d'environnement Vercel.

### Redirect URIs Autorisés
Pour ajouter des URIs de redirection supplémentaires (par exemple pour production) :

1. Accéder à [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Sélectionner le projet `apaddicto`
3. Cliquer sur le Client ID OAuth 2.0
4. Ajouter les URIs autorisés :
   - `http://localhost:3000/oauth2callback` (développement)
   - `https://votre-domaine.vercel.app/oauth2callback` (production)

## 📝 Notes Importantes

### Sécurité
- ⚠️ **JAMAIS** commiter les credentials dans Git
- Les credentials sont stockées uniquement dans :
  - `.env` (local, ignoré par Git)
  - Variables d'environnement Vercel (chiffrées)
  - Script `update-vercel-env-new-oauth.sh` (à supprimer après utilisation ou à garder privé)

### Compatibilité
- ✅ Compatible avec l'architecture actuelle de l'application
- ✅ Compatible avec `GoogleCalendarOAuth2Service`
- ✅ Compatible avec l'environnement serverless Vercel
- ✅ Pas de changement de code nécessaire (seulement les variables d'environnement)

### Maintenance
- Le refresh token est valide tant qu'il n'est pas révoqué
- Si le refresh token expire ou est révoqué, il faudra :
  1. Réautoriser l'application via OAuth flow
  2. Obtenir un nouveau refresh token
  3. Mettre à jour les variables d'environnement

## 🧪 Tests de Validation

Après le déploiement, vérifier :

1. ✅ **Logs Vercel** : Plus d'erreur `deleted_client`
2. ✅ **Récupération des disponibilités** : `getAvailabilitiesByDate` fonctionne
3. ✅ **Création de rendez-vous** : Les RDV sont créés dans Google Calendar
4. ✅ **Synchronisation** : Les événements Google Calendar sont lus correctement

## 📊 Diagnostic

Si l'erreur persiste après le déploiement :

1. Vérifier que les variables Vercel sont bien configurées
2. Vérifier les logs Vercel : `vercel logs`
3. Vérifier que le refresh token n'a pas été révoqué dans Google Cloud Console
4. Tester en local avec les nouvelles credentials dans `.env`

---

**Date de mise à jour** : 2026-01-02  
**Statut** : ✅ Configuration terminée - En attente de redéploiement  
**Auteur** : Claude AI Assistant
