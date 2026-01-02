# Configuration OAuth Google pour Vercel

## 📋 Résumé des Credentials

**Credentials configurées le 2026-01-02:**

- **Client ID**: `603850749287-hfhpia7cd34skie4crp6r6uhgmbemdk7.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-***************************` (configuré dans Vercel)
- **Refresh Token**: `1//03***************************` (configuré dans Vercel)
- **Project ID**: `apaddicto`
- **Calendar ID**: `doriansarry47@gmail.com`

## 🔗 Redirect URIs à Configurer dans Google Cloud Console

Pour que OAuth fonctionne correctement, vous devez ajouter les URIs suivants dans la Google Cloud Console:

### Étape 1: Accéder à Google Cloud Console
1. Allez sur https://console.cloud.google.com/apis/credentials
2. Sélectionnez le projet: **apaddicto**
3. Cliquez sur le Client OAuth 2.0: `603850749287-hfhpia7cd34skie4crp6r6uhgmbemdk7`

### Étape 2: Ajouter les Redirect URIs

Dans la section **"URIs de redirection autorisés"**, ajoutez les URIs suivants:

#### Pour le développement local:
```
http://localhost:3000/oauth2callback
http://localhost:5173/oauth2callback
```

#### Pour Vercel (Production):
```
https://webapp-frtjapec0-ikips-projects.vercel.app/oauth2callback
https://webapp-frtjapec0-ikips-projects.vercel.app/api/oauth/callback
```

#### Pour Vercel (Preview deployments):
```
https://*.vercel.app/oauth2callback
https://*.vercel.app/api/oauth/callback
```

### Étape 3: Sauvegarder
Cliquez sur **"ENREGISTRER"** en bas de la page.

## 🚀 Déploiement des Variables sur Vercel

### Méthode 1: Script Automatique (Recommandé)

Exécutez le script depuis le terminal:

```bash
cd /home/user/webapp
./update-vercel-env-new-oauth.sh
```

Ce script va:
1. ✅ Supprimer les anciennes variables OAuth
2. ✅ Ajouter les nouvelles credentials
3. ✅ Configurer toutes les variables nécessaires pour production, preview et development

### Méthode 2: Configuration Manuelle sur Vercel

1. Allez sur: https://vercel.com/dashboard
2. Sélectionnez votre projet: **webapp**
3. Allez dans: **Settings > Environment Variables**
4. Ajoutez/Modifiez les variables suivantes:

| Variable | Valeur | Environnements |
|----------|--------|----------------|
| `GOOGLE_CLIENT_ID` | `603850749287-hfhpia7cd34skie4crp6r6uhgmbemdk7.apps.googleusercontent.com` | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-***************************` | Production, Preview, Development |
| `GOOGLE_REFRESH_TOKEN` | `1//03***************************` | Production, Preview, Development |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3000/oauth2callback` | Development |
| `GOOGLE_REDIRECT_URI` | `https://webapp-frtjapec0-ikips-projects.vercel.app/oauth2callback` | Production |
| `GOOGLE_CALENDAR_ID` | `doriansarry47@gmail.com` | Production, Preview, Development |
| `VITE_GOOGLE_CLIENT_ID` | `603850749287-hfhpia7cd34skie4crp6r6uhgmbemdk7.apps.googleusercontent.com` | Production, Preview, Development |

## 🔄 Redéploiement

Après avoir configuré les variables:

### Option 1: Redéploiement automatique
Pushez vos changements sur GitHub - Vercel redéploiera automatiquement:
```bash
git add .
git commit -m "Update OAuth Google credentials"
git push origin main
```

### Option 2: Redéploiement manuel
Depuis le dashboard Vercel:
1. Allez dans l'onglet **Deployments**
2. Cliquez sur les trois points `...` du dernier déploiement
3. Cliquez sur **"Redeploy"**

## ✅ Vérification

Pour vérifier que tout fonctionne:

1. **Test de connexion OAuth**:
   - Accédez à votre application: https://webapp-frtjapec0-ikips-projects.vercel.app
   - Essayez de vous connecter avec Google
   - Vérifiez que vous êtes redirigé correctement

2. **Test Google Calendar**:
   - Créez un rendez-vous test
   - Vérifiez qu'il apparaît dans Google Calendar
   - Essayez de récupérer les créneaux disponibles

3. **Vérifier les logs Vercel**:
   ```bash
   vercel logs --follow
   ```

## 🐛 Debugging

Si OAuth ne fonctionne pas:

1. **Vérifier les redirect URIs dans Google Cloud Console**
   - Assurez-vous que tous les URIs sont correctement configurés
   - Pas d'espaces ou de caractères spéciaux

2. **Vérifier les variables d'environnement sur Vercel**
   - Toutes les variables sont bien définies
   - Pas de valeurs tronquées ou mal copiées

3. **Vérifier les logs**
   - Regarder les logs Vercel pour les erreurs OAuth
   - Vérifier la console du navigateur

4. **Tester localement d'abord**
   ```bash
   npm run dev
   # Tester sur http://localhost:5173
   ```

## 📚 Références

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 📝 Notes

- Les credentials actuelles sont valides et fonctionnelles
- Le refresh token est configuré pour renouveler automatiquement l'access token
- L'application utilise le service `GoogleCalendarOAuth2Service` (voir `/server/services/googleCalendarOAuth2.ts`)
- Les anciennes credentials ont été remplacées par les nouvelles

## ⚠️ Sécurité

- Ne jamais commiter les credentials dans le repository public
- Utiliser toujours des variables d'environnement
- Révoquer les anciennes credentials si elles ne sont plus utilisées
- Surveiller l'utilisation de l'API dans Google Cloud Console

---

**Dernière mise à jour**: 2026-01-02  
**Status**: ✅ Credentials configurées et prêtes pour le déploiement
