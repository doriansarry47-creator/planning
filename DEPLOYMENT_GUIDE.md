# 🚀 Guide de Déploiement - Planning App

## 📋 Prérequis

- Compte Vercel actif
- Compte Google Cloud Platform avec API Calendar activée
- Compte Resend pour l'envoi d'emails
- Base de données PostgreSQL (ex: Neon, Vercel Postgres)

## 🔐 Variables d'Environnement Requises

### Sur Vercel
Aller dans **Settings > Environment Variables** et ajouter :

#### Base de Données
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

#### Google Calendar OAuth2
```
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your_api_key
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALENDAR_EMAIL=your_calendar_email@gmail.com
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/oauth/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

#### Email (Resend)
```
RESEND_API_KEY=re_your_api_key
APP_URL=https://your-app.vercel.app
```

## 🔑 Configuration Google Calendar OAuth2

### 1. Créer un Projet Google Cloud

1. Aller sur https://console.cloud.google.com
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer l'API Google Calendar

### 2. Créer des Credentials OAuth2

1. Aller dans **APIs & Services > Credentials**
2. Cliquer sur **Create Credentials > OAuth 2.0 Client ID**
3. Type d'application : **Web application**
4. Authorized redirect URIs : `https://your-app.vercel.app/api/oauth/callback`
5. Copier le **Client ID** et **Client Secret**

### 3. Obtenir le Refresh Token

#### Méthode 1: Via l'application déployée
1. Déployez l'application sur Vercel avec Client ID et Client Secret
2. Visitez : `https://your-app.vercel.app/api/oauth/init`
3. Cliquez sur le lien d'autorisation
4. Autorisez l'accès à votre Google Calendar
5. Copiez le refresh_token depuis l'URL de redirection
6. Ajoutez `GOOGLE_REFRESH_TOKEN` dans les variables Vercel
7. Redéployez l'application

#### Méthode 2: Via script local
```bash
# Utiliser l'outil oauth-test.html fourni dans le projet
# Ou utiliser un script Node.js pour générer le token
```

## 📧 Configuration Resend

1. Créer un compte sur https://resend.com
2. Obtenir une API Key
3. Ajouter la clé dans `RESEND_API_KEY`
4. Configurer le domaine d'envoi (optionnel)

## 🛠️ Déploiement sur Vercel

### Via GitHub (Recommandé)

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Vercel déploiera automatiquement à chaque push

### Via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

## ✅ Vérification du Déploiement

### 1. Tester la santé de l'API
```bash
curl https://your-app.vercel.app/api/health
```

Devrait retourner :
```json
{
  "status": "ok",
  "googleCalendar": "initialized",
  "service": "Optimized Booking System"
}
```

### 2. Tester l'intégration Google Calendar
```bash
curl https://your-app.vercel.app/api/trpc/booking.healthCheck
```

### 3. Tester la réservation
1. Ouvrir l'application dans le navigateur
2. Aller sur `/book-appointment`
3. Sélectionner une date
4. Vérifier que les créneaux disponibles s'affichent
5. Tenter une réservation test

## 🔍 Debugging

### Logs Vercel
```bash
# Voir les logs en temps réel
vercel logs --follow
```

### Vérifier les variables d'environnement
```bash
vercel env ls
```

### Problèmes courants

#### Google Calendar non initialisé
- Vérifier que `GOOGLE_REFRESH_TOKEN` est configuré
- Vérifier que le refresh token est valide
- Régénérer le refresh token si nécessaire

#### Emails non envoyés
- Vérifier `RESEND_API_KEY`
- Vérifier que le domaine d'envoi est vérifié sur Resend

#### Erreurs de build
- Vérifier que toutes les dépendances sont dans `package.json`
- Vérifier les types TypeScript

## 🔄 Mise à Jour

```bash
# Sur la branche genspark_ai_developer
git add .
git commit -m "feat: amélioration du système de réservation"
git push origin genspark_ai_developer

# Créer une Pull Request vers main
# Après merge, Vercel redéploiera automatiquement
```

## 📊 Monitoring

- **Vercel Dashboard** : Vérifier les déploiements et analytics
- **Google Calendar** : Vérifier que les événements sont créés
- **Resend Dashboard** : Vérifier que les emails sont envoyés

## 🆘 Support

En cas de problème :
1. Vérifier les logs Vercel
2. Vérifier la configuration des variables d'environnement
3. Consulter la documentation Google Calendar API
4. Consulter la documentation Resend

## 📝 Checklist de Déploiement

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Google Calendar OAuth2 configuré
- [ ] Refresh Token obtenu et configuré
- [ ] Resend API Key configurée
- [ ] Base de données configurée (si utilisée)
- [ ] Tests effectués sur l'environnement de production
- [ ] Emails de confirmation testés
- [ ] Créneaux disponibles testés
- [ ] Réservation testée de bout en bout

---

**Version** : 2.0  
**Dernière mise à jour** : 2025-11-23
