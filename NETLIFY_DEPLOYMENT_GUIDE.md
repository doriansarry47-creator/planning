# 🚀 Guide de Déploiement Netlify

Ce guide vous aide à déployer votre application Planning App sur Netlify pour résoudre le problème "Page not found" (erreur 404).

## 📋 Prérequis

- Un compte Netlify (gratuit) : https://app.netlify.com/signup
- Git installé
- Accès au repository GitHub

## 🔧 Fichiers de Configuration Créés

### 1. `netlify.toml` (Configuration principale)
```toml
[build]
  command = "npm run build"
  publish = "client/dist"
  install = "npm install"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Ce fichier configure :**
- ✅ Le build avec Vite
- ✅ Le répertoire de publication (`client/dist`)
- ✅ Les redirections SPA (Single Page Application)
- ✅ Les fonctions serverless Netlify

### 2. `client/public/_redirects` (Redirections)
```
/api/*  /.netlify/functions/:splat  200
/*      /index.html                  200
```

**Ce fichier assure que :**
- ✅ Toutes les routes sont redirigées vers `index.html`
- ✅ Le routing côté client fonctionne correctement
- ✅ Plus d'erreur 404 sur les pages internes

### 3. `.netlifyignore` (Optimisation)
Exclut les fichiers inutiles du déploiement pour accélérer le build.

## 🌐 Méthode 1 : Déploiement via Interface Netlify (Recommandé)

### Étape 1 : Pusher les changements sur GitHub

```bash
# Ajouter les fichiers de configuration
git add netlify.toml .netlifyignore client/public/_redirects netlify/ package.json

# Commiter les changements
git commit -m "feat: Add Netlify deployment configuration"

# Pusher sur GitHub
git push origin main
```

### Étape 2 : Connecter Netlify à GitHub

1. **Se connecter à Netlify** : https://app.netlify.com
2. **Cliquer sur "Add new site"** → "Import an existing project"
3. **Sélectionner "GitHub"**
4. **Autoriser Netlify** à accéder à vos repositories
5. **Choisir votre repository** : `planning`

### Étape 3 : Configurer le déploiement

Netlify détectera automatiquement `netlify.toml` mais vérifiez :

- **Branch to deploy** : `main`
- **Build command** : `npm run build` (auto-détecté)
- **Publish directory** : `client/dist` (auto-détecté)
- **Node version** : 20.x (auto-détecté)

### Étape 4 : Variables d'environnement

Dans l'interface Netlify, allez dans :
**Site settings** → **Build & deploy** → **Environment** → **Environment variables**

Ajoutez vos variables :

```env
DATABASE_URL=postgresql://...
GOOGLE_API_KEY=your_api_key
NODE_ENV=production
```

### Étape 5 : Déployer

1. **Cliquer sur "Deploy site"**
2. Netlify va :
   - ✅ Cloner votre repository
   - ✅ Installer les dépendances
   - ✅ Construire l'application
   - ✅ Déployer sur le CDN

### Étape 6 : Tester

Une fois déployé, vous obtiendrez une URL :
```
https://votre-site.netlify.app
```

**Testez les routes :**
- ✅ `https://votre-site.netlify.app/` → Page d'accueil
- ✅ `https://votre-site.netlify.app/book-appointment` → Réservation
- ✅ `https://votre-site.netlify.app/appointments` → Mes rendez-vous
- ✅ `https://votre-site.netlify.app/admin` → Dashboard admin

**Plus d'erreur 404 !** 🎉

## 🌐 Méthode 2 : Déploiement via Netlify CLI

### Étape 1 : Installer Netlify CLI

```bash
npm install -g netlify-cli
```

### Étape 2 : Se connecter

```bash
netlify login
```

### Étape 3 : Initialiser le site

```bash
# À la racine du projet
netlify init
```

Suivez les instructions :
1. **Create & configure a new site**
2. **Choisir votre team**
3. **Nom du site** (optionnel)
4. **Build command** : `npm run build`
5. **Publish directory** : `client/dist`

### Étape 4 : Déployer

```bash
# Build local
npm run build

# Déploiement de production
netlify deploy --prod
```

### Étape 5 : Tester en local (optionnel)

```bash
# Démarrer le serveur de développement Netlify
npm run netlify:dev
```

Cela démarre un serveur local qui simule l'environnement Netlify.

## 🔍 Débogage

### Problème : Erreur 404 persiste

**Solution** : Vérifiez que le fichier `_redirects` est bien dans `client/dist/`

```bash
npm run build
ls -la client/dist/_redirects
```

### Problème : Build échoue

**Solution** : Vérifiez les logs dans Netlify

1. Allez dans **Deploys**
2. Cliquez sur le déploiement échoué
3. Consultez les logs détaillés

**Erreurs communes :**
- ❌ Variables d'environnement manquantes
- ❌ Dépendances non installées
- ❌ Erreurs de compilation TypeScript

### Problème : API ne fonctionne pas

**Solution** : Configurez les fonctions Netlify

Les routes `/api/*` sont redirigées vers les fonctions Netlify dans `netlify/functions/`.

**Exemple de fonction** (`netlify/functions/health.ts`) :

```typescript
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  };
};
```

**Test** : `https://votre-site.netlify.app/.netlify/functions/health`

## 🎯 Domaine personnalisé (Optionnel)

### Ajouter un domaine

1. **Site settings** → **Domain management** → **Add custom domain**
2. **Entrez votre domaine** : `planning.votredomaine.com`
3. **Configurer les DNS** selon les instructions Netlify

**DNS recommandé :**
```
Type: CNAME
Name: planning (ou @)
Value: votre-site.netlify.app
```

### HTTPS automatique

Netlify active automatiquement HTTPS avec Let's Encrypt (gratuit).

## 📊 Monitoring et Analytics

### Build notifications

Configurez les notifications :
1. **Site settings** → **Build & deploy** → **Deploy notifications**
2. **Add notification** → Choisir (Email, Slack, etc.)

### Analytics

Activez Netlify Analytics :
1. **Site overview** → **Analytics**
2. **Enable Netlify Analytics** ($9/mois)

Ou utilisez Google Analytics gratuitement.

## 🔄 Déploiement continu

Une fois configuré, chaque push sur `main` déclenche un déploiement automatique :

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
# ➡️ Déploiement automatique sur Netlify
```

## 🆚 Comparaison Netlify vs Vercel

| Critère | Netlify | Vercel |
|---------|---------|--------|
| **Facile à configurer** | ✅ Excellent | ✅ Excellent |
| **SPA Routing** | ✅ Natif | ✅ Natif |
| **Fonctions serverless** | ✅ Oui | ✅ Oui |
| **Build time** | ⚡ Rapide | ⚡ Très rapide |
| **Pricing** | 💰 Gratuit (300 min/mois) | 💰 Gratuit (100 GB-hours) |
| **CDN** | 🌍 Global | 🌍 Edge Network |

**Recommandation** : Les deux sont excellents. Netlify est légèrement plus adapté aux applications avec beaucoup de routes statiques.

## ✅ Checklist finale

Avant de déployer, vérifiez :

- [ ] `netlify.toml` configuré
- [ ] `_redirects` dans `client/public/`
- [ ] Variables d'environnement ajoutées
- [ ] Build réussit en local (`npm run build`)
- [ ] Git commit et push effectué
- [ ] Site connecté à GitHub/GitLab
- [ ] Déploiement lancé
- [ ] Tests des routes principales

## 🆘 Support

**Documentation Netlify** : https://docs.netlify.com

**Forum communautaire** : https://answers.netlify.com

**Support** : support@netlify.com (pour les plans payants)

---

## 🎉 Résultat attendu

Après le déploiement :

✅ **Page d'accueil** : Fonctionne  
✅ **Routes internes** : Fonctionne (plus d'erreur 404)  
✅ **Rechargement de page** : Fonctionne  
✅ **Navigation** : Fonctionne  
✅ **Build** : Automatisé  
✅ **HTTPS** : Activé  
✅ **CDN** : Global  

**Temps de déploiement** : ~2-5 minutes

**URL finale** : `https://planning-app-<random>.netlify.app`

---

**Créé le** : 2025-12-30  
**Version** : 1.0.0  
**Status** : ✅ Production Ready
