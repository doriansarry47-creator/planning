# 🚀 Guide de Déploiement Cloudflare Pages

## 📋 Prérequis

1. ✅ Compte Cloudflare (gratuit ou payant)
2. ✅ Base de données PostgreSQL Neon configurée
3. ✅ Wrangler CLI installé globalement
4. ✅ Git repository connecté à GitHub

## 🔧 Configuration Initiale

### 1. Installer Wrangler (si nécessaire)
```bash
npm install -g wrangler
# ou
npx wrangler --version
```

### 2. Se connecter à Cloudflare
```bash
npx wrangler login
```
Cela ouvrira votre navigateur pour l'authentification.

### 3. Configurer les Variables d'Environnement Locales
```bash
# Copier l'exemple
cp .dev.vars.example .dev.vars

# Éditer avec vos vraies valeurs
nano .dev.vars
```

Contenu de `.dev.vars` :
```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=votre-cle-secrete-jwt-minimum-32-caracteres
```

## 📦 Build Local

Toujours tester le build localement avant de déployer :

```bash
# Nettoyer et builder
rm -rf dist
npm run build

# Vérifier le contenu
ls -la dist/
# Vous devriez voir:
# - _worker.js (votre application)
# - _routes.json (configuration des routes)
# - _headers (en-têtes de sécurité)
# - static/ (assets statiques)
```

## 🌐 Méthode 1 : Déploiement via GitHub (Recommandé)

### Configuration dans le Dashboard Cloudflare

1. **Accédez à Cloudflare Pages**
   - Allez sur https://dash.cloudflare.com/
   - Sélectionnez votre compte
   - Cliquez sur "Workers & Pages" > "Create application" > "Pages" > "Connect to Git"

2. **Connectez votre Repository GitHub**
   - Autorisez Cloudflare à accéder à votre compte GitHub
   - Sélectionnez le repository : `doriansarry47-creator/planning`
   - Cliquez sur "Begin setup"

3. **Configurez le Build**
   - **Project name** : `webapp` (ou un nom personnalisé)
   - **Production branch** : `main`
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : `/` (laisser vide)
   - **Framework preset** : None

4. **Configurer les Variables d'Environnement**
   
   Dans "Environment variables" > "Production" :
   - Cliquez sur "Add variable"
   - Ajoutez les variables suivantes :

   | Variable Name | Value |
   |---------------|-------|
   | `DATABASE_URL` | `postgresql://user:password@host/db?sslmode=require` |
   | `JWT_SECRET` | `votre-cle-secrete-minimum-32-caracteres` |
   | `NODE_VERSION` | `22` |

5. **Sauvegarder et Déployer**
   - Cliquez sur "Save and Deploy"
   - Le build et déploiement commenceront automatiquement

### Déploiements Automatiques

Une fois configuré, chaque `git push` sur la branche `main` déclenchera automatiquement :
1. ✅ Clone du repository
2. ✅ Installation des dépendances (`npm install`)
3. ✅ Build de l'application (`npm run build`)
4. ✅ Déploiement sur Cloudflare Pages

## 🖥️ Méthode 2 : Déploiement Direct avec Wrangler CLI

### Première fois : Créer le Projet

```bash
# Se connecter à Cloudflare
npx wrangler login

# Créer le projet Pages
npx wrangler pages project create webapp --production-branch main
```

### Configurer les Secrets

```bash
# DATABASE_URL
npx wrangler pages secret put DATABASE_URL --project-name webapp
# Entrez votre URL de base de données quand demandé

# JWT_SECRET
npx wrangler pages secret put JWT_SECRET --project-name webapp
# Entrez votre clé secrète JWT quand demandé
```

### Build et Déploiement

```bash
# Build
npm run build

# Déployer vers production
npx wrangler pages deploy dist --project-name webapp --branch main

# Ou utiliser le script npm
npm run deploy
```

### Déploiement vers Preview (Staging)

```bash
# Déployer une branche de test
npx wrangler pages deploy dist --project-name webapp --branch preview
```

## 🔐 Configuration de la Base de Données

### 1. Initialiser la Base de Données Neon

```bash
# Se connecter à votre base de données Neon
psql "postgresql://user:password@host/database?sslmode=require"

# Exécuter le script d'initialisation
\i init-db.sql

# Ou directement avec psql
psql "postgresql://user:password@host/database?sslmode=require" -f init-db.sql
```

### 2. Vérifier les Tables

```sql
-- Lister toutes les tables
\dt

-- Vérifier qu'un admin existe
SELECT * FROM admins LIMIT 1;
```

## 🧪 Test du Déploiement

### 1. Vérifier l'URL de Production

Après le déploiement, Cloudflare vous donnera une URL comme :
```
https://webapp.pages.dev
# ou
https://webapp-xxx.pages.dev
```

### 2. Tester les Endpoints

```bash
# Page d'accueil
curl https://webapp.pages.dev/

# API Health Check
curl https://webapp.pages.dev/api/auth/me

# Test de connexion admin
curl -X POST https://webapp.pages.dev/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 3. Vérifier dans le Navigateur

Ouvrez l'URL dans votre navigateur et testez :
- ✅ Page d'accueil s'affiche
- ✅ Inscription patient fonctionne
- ✅ Connexion admin fonctionne
- ✅ Prise de rendez-vous fonctionne

## 🐛 Dépannage

### Problème : Build échoue sur Cloudflare

**Solution 1 : Vérifier Node Version**
```bash
# Dans le dashboard Cloudflare, ajouter la variable :
NODE_VERSION=22
```

**Solution 2 : Vérifier les logs**
- Allez dans "Workers & Pages" > "webapp" > "View build logs"
- Cherchez les erreurs spécifiques

### Problème : 500 Internal Server Error après déploiement

**Cause probable** : Variables d'environnement manquantes

**Solution** :
1. Vérifiez que `DATABASE_URL` et `JWT_SECRET` sont configurés
2. Redéployez après avoir ajouté les variables

### Problème : Cannot connect to database

**Causes possibles** :
1. URL de base de données incorrecte
2. Base de données non initialisée
3. Problème de connexion Neon

**Solutions** :
```bash
# 1. Tester la connexion localement
psql "$DATABASE_URL"

# 2. Vérifier que sslmode=require est présent
echo $DATABASE_URL | grep sslmode

# 3. Réinitialiser le secret sur Cloudflare
npx wrangler pages secret put DATABASE_URL --project-name webapp
```

### Problème : JWT token invalide

**Cause** : JWT_SECRET différent entre local et production

**Solution** :
```bash
# Utiliser le même secret partout
npx wrangler pages secret put JWT_SECRET --project-name webapp
```

## 📊 Monitoring et Logs

### Voir les Logs en Temps Réel

```bash
# Logs de production
npx wrangler pages deployment tail --project-name webapp

# Logs d'un déploiement spécifique
npx wrangler pages deployment tail --project-name webapp --deployment-id <id>
```

### Dashboard Cloudflare

1. Allez sur https://dash.cloudflare.com/
2. "Workers & Pages" > "webapp"
3. Onglets disponibles :
   - **Deployments** : Historique des déploiements
   - **Settings** : Configuration
   - **Functions** : Métriques de performance
   - **Analytics** : Statistiques d'utilisation

## 🔄 Rollback

Si un déploiement pose problème :

### Via Dashboard
1. Allez dans "Deployments"
2. Trouvez le dernier déploiement qui fonctionnait
3. Cliquez sur "Rollback to this deployment"

### Via CLI
```bash
# Lister les déploiements
npx wrangler pages deployment list --project-name webapp

# Promouvoir un déploiement spécifique en production
npx wrangler pages deployment promote <deployment-id> --project-name webapp
```

## 🌍 Domaine Personnalisé (Optionnel)

### Ajouter un Domaine

1. Dans le dashboard : "Custom domains" > "Set up a custom domain"
2. Entrez votre domaine : `example.com`
3. Suivez les instructions pour configurer les DNS

### Configuration DNS

Ajoutez un enregistrement CNAME :
```
CNAME @ webapp.pages.dev
# ou
CNAME www webapp.pages.dev
```

## 📝 Checklist de Déploiement

Avant chaque déploiement, vérifiez :

- [ ] ✅ Les tests locaux passent (`npm run build`)
- [ ] ✅ Les variables d'environnement sont configurées
- [ ] ✅ La base de données est initialisée
- [ ] ✅ Le `.gitignore` exclut `.dev.vars` et `node_modules`
- [ ] ✅ Le code est commité sur Git
- [ ] ✅ Le build produit `dist/_worker.js`
- [ ] ✅ Les identifiants admin par défaut sont changés (production)

## 🎉 Après le Déploiement

1. **Tester l'application complète**
   - Inscription patient
   - Connexion patient/admin
   - Prise de rendez-vous
   - Gestion admin

2. **Configurer les alertes**
   - Dans Cloudflare Dashboard > Notifications
   - Activer les alertes pour les erreurs 5xx

3. **Documenter l'URL de production**
   - Mettre à jour le README.md
   - Partager avec l'équipe

## 🔗 Ressources Utiles

- [Documentation Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Hono Framework](https://hono.dev/)
- [Neon Database](https://neon.tech/docs/introduction)

---

**Dernière mise à jour** : 2025-10-29
**Version** : 1.0.0
