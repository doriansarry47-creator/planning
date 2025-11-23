# ⚡ Instructions de Configuration Vercel

## 🎯 Configuration Immédiate des Variables d'Environnement

### Étape 1 : Accéder aux Settings Vercel

1. Aller sur https://vercel.com/ikips-projects/planning
2. Cliquer sur **Settings** dans la barre de navigation
3. Sélectionner **Environment Variables** dans le menu de gauche

---

## 🔐 Variables à Configurer

### Google Calendar OAuth2 (PRIORITÉ CRITIQUE)

```bash
# Client ID (identique pour frontend et backend)
VITE_GOOGLE_CLIENT_ID
Valeur: 603850749287-8c0hrol8l5gulsal23mna3raeolmd2l2.apps.googleusercontent.com
Environnement: Production, Preview, Development

GOOGLE_CLIENT_ID
Valeur: 603850749287-8c0hrol8l5gulsal23mna3raeolmd2l2.apps.googleusercontent.com
Environnement: Production, Preview, Development

# Client Secret (À OBTENIR depuis Google Cloud Console)
GOOGLE_CLIENT_SECRET
Valeur: [Voir Google Cloud Console]
Environnement: Production, Preview, Development

# Email du calendrier
GOOGLE_CALENDAR_EMAIL
Valeur: doriansarry47@gmail.com
Environnement: Production, Preview, Development

# URL de redirection OAuth
GOOGLE_REDIRECT_URI
Valeur: https://votre-app.vercel.app/api/oauth/callback
Environnement: Production
Note: Remplacer "votre-app.vercel.app" par l'URL réelle

# Refresh Token (À GÉNÉRER après déploiement)
GOOGLE_REFRESH_TOKEN
Valeur: [À générer via /api/oauth/init]
Environnement: Production, Preview, Development
```

### Email Service (Resend)

```bash
# Clé API Resend
RESEND_API_KEY
Valeur: [Votre clé Resend depuis https://resend.com]
Environnement: Production, Preview, Development

# URL de l'application
APP_URL
Valeur: https://votre-app.vercel.app
Environnement: Production
```

### Database (Optionnel)

```bash
# PostgreSQL Connection String
DATABASE_URL
Valeur: postgresql://username:password@host:port/database
Environnement: Production, Preview, Development

# Node Environment
NODE_ENV
Valeur: production
Environnement: Production
```

---

## 📝 Procédure Détaillée

### Étape 2 : Obtenir le Google Client Secret

1. Aller sur https://console.cloud.google.com
2. Sélectionner votre projet ou en créer un nouveau
3. Aller dans **APIs & Services** > **Credentials**
4. Trouver votre OAuth 2.0 Client ID existant ou en créer un nouveau
5. Copier le **Client Secret**
6. L'ajouter dans Vercel comme variable `GOOGLE_CLIENT_SECRET`

### Étape 3 : Configurer la Redirection OAuth

1. Dans Google Cloud Console > **Credentials**
2. Éditer votre OAuth 2.0 Client ID
3. Dans **Authorized redirect URIs**, ajouter :
   ```
   https://votre-app.vercel.app/api/oauth/callback
   ```
4. Sauvegarder

### Étape 4 : Déployer l'Application

1. Une fois toutes les variables configurées (sauf GOOGLE_REFRESH_TOKEN)
2. Merger la Pull Request #24 dans main
3. Vercel déploiera automatiquement
4. Noter l'URL de production (ex: https://planning-xyz.vercel.app)

### Étape 5 : Générer le Refresh Token

1. Une fois l'application déployée, visiter :
   ```
   https://votre-app.vercel.app/api/oauth/init
   ```

2. La réponse contiendra un lien d'autorisation :
   ```json
   {
     "success": true,
     "authUrl": "https://accounts.google.com/o/oauth2/auth?..."
   }
   ```

3. Cliquer sur le lien d'autorisation

4. Se connecter avec le compte Google (doriansarry47@gmail.com)

5. Autoriser l'accès au calendrier

6. Vous serez redirigé vers :
   ```
   https://votre-app.vercel.app/success?refresh_token=...
   ```

7. Copier le `refresh_token` depuis l'URL

8. Retourner dans Vercel Settings > Environment Variables

9. Ajouter la variable :
   ```
   Nom: GOOGLE_REFRESH_TOKEN
   Valeur: [le token copié]
   Environnement: Production, Preview, Development
   ```

10. Cliquer sur **Redeploy** pour appliquer les changements

---

## ✅ Vérification Post-Configuration

### Test 1 : Health Check
```bash
curl https://votre-app.vercel.app/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "googleCalendar": "initialized",
  "service": "Optimized Booking System",
  "version": "2.0"
}
```

### Test 2 : TRPC Health Check
Visiter dans le navigateur :
```
https://votre-app.vercel.app/api/trpc/booking.healthCheck
```

### Test 3 : Interface de Réservation
1. Aller sur `https://votre-app.vercel.app/book-appointment`
2. Sélectionner une date
3. Vérifier que les créneaux s'affichent
4. Faire une réservation test
5. Vérifier l'événement dans Google Calendar
6. Vérifier la réception de l'email

---

## 🚨 Dépannage Rapide

### Problème : "googleCalendar: not initialized"

**Cause** : GOOGLE_REFRESH_TOKEN manquant ou invalide

**Solution** :
1. Vérifier que la variable est bien configurée sur Vercel
2. Régénérer le token via `/api/oauth/init`
3. Redéployer l'application

### Problème : "Email sending failed"

**Cause** : RESEND_API_KEY invalide ou manquante

**Solution** :
1. Vérifier la clé sur https://resend.com
2. Vérifier que la variable est configurée sur Vercel
3. Régénérer une nouvelle clé si nécessaire

### Problème : Build Failed

**Cause** : Variables manquantes ou erreur de code

**Solution** :
1. Consulter les logs dans Vercel Dashboard
2. Vérifier que toutes les variables sont configurées
3. Vérifier que le code compile localement : `npm run build`

---

## 📊 Monitoring

### Logs en Temps Réel
```bash
# Installer Vercel CLI
npm install -g vercel

# Voir les logs
vercel logs --follow
```

### Dashboard Vercel
- **Deployments** : Voir l'historique des déploiements
- **Analytics** : Voir les métriques d'utilisation
- **Functions** : Voir les logs des fonctions API
- **Environment Variables** : Gérer les variables

---

## 🔄 Workflow de Mise à Jour

Pour les futures mises à jour :

```bash
# 1. Travailler sur genspark_ai_developer
git checkout genspark_ai_developer

# 2. Faire les modifications
# ... éditer les fichiers ...

# 3. Commit immédiat
git add -A
git commit -m "type: description"

# 4. Sync avec main
git fetch origin main
git rebase origin/main

# 5. Squash si nécessaire
git reset --soft HEAD~N
git commit -m "message comprehensive"

# 6. Push
git push -f origin genspark_ai_developer

# 7. Créer/mettre à jour PR
gh pr create --title "..." --body "..."

# 8. Merger et Vercel redéploie automatiquement
```

---

## 📞 Contacts et Ressources

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Google Calendar API](https://developers.google.com/calendar)
- [Resend Docs](https://resend.com/docs)

### URLs Importantes
- **Repository** : https://github.com/doriansarry47-creator/planning
- **Vercel Dashboard** : https://vercel.com/ikips-projects/planning
- **Google Cloud Console** : https://console.cloud.google.com
- **Resend Dashboard** : https://resend.com/dashboard

---

## ✨ Checklist Finale

- [ ] Toutes les variables d'environnement configurées sur Vercel
- [ ] Google OAuth2 Client Secret ajouté
- [ ] Authorized redirect URIs configuré dans Google Cloud
- [ ] Application déployée sur Vercel
- [ ] GOOGLE_REFRESH_TOKEN généré et configuré
- [ ] Application redéployée avec le refresh token
- [ ] Health checks passent avec succès
- [ ] Interface de réservation testée
- [ ] Événement créé dans Google Calendar
- [ ] Email de confirmation reçu

---

**Status** : 📋 Guide de Configuration  
**Dernière mise à jour** : 2025-11-23  
**Auteur** : GenSpark AI Developer
