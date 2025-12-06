# Correction Erreur 404 Vercel - 21 Novembre 2025

## 🚨 Problème

Erreur **404: NOT_FOUND** lors de l'accès à l'application déployée sur Vercel :
```
404: NOT_FOUND
Code: NOT_FOUND
ID: cdg1::z88dk-1763717647480-01c94eae69d5
planning-s6q2-kdcrncurx-ikips-projects.vercel.app
```

## 🔍 Analyse du Problème

### Causes Identifiées

1. **Configuration `vercel.json` Incorrecte**
   - L'ancienne configuration essayait de servir `client/dist/**` comme des fichiers statiques pré-buildés
   - Vercel ne trouvait pas ces fichiers car ils n'étaient pas dans le dépôt Git
   - La configuration ne spécifiait pas de `buildCommand` pour construire l'application

2. **Build Non Exécuté sur Vercel**
   - Sans `buildCommand` explicite, Vercel ne savait pas comment builder le projet
   - Les fichiers `client/dist/` ne sont pas versionnés dans Git (et ne devraient pas l'être)
   - Le dossier de sortie n'était pas correctement spécifié

3. **Routing des Fichiers Statiques**
   - L'ancienne configuration pointait vers `/client/dist/index.html` au lieu de `/index.html`
   - Manque de gestion du filesystem pour servir les assets (JS, CSS)

## ✅ Solution Appliquée

### 1. Nouvelle Configuration `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist",
  "installCommand": "npm install",
  "framework": null,
  "functions": {
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2. Changements Clés

#### `buildCommand: "npm run build"`
- ✅ Indique explicitement à Vercel comment builder l'application
- ✅ Exécute `vite build` qui génère les fichiers dans `client/dist/`

#### `outputDirectory: "client/dist"`
- ✅ Spécifie où Vercel trouvera les fichiers statiques après le build
- ✅ Correspond à la configuration Vite dans `vite.config.ts`

#### `installCommand: "npm install"`
- ✅ Installation explicite des dépendances
- ✅ Assure que toutes les dépendances sont présentes avant le build

#### `framework: null`
- ✅ Désactive la détection automatique de framework
- ✅ Utilise notre configuration personnalisée

#### `functions.api/index.ts`
- ✅ Configure la fonction serverless pour l'API
- ✅ Alloue 1024 MB de mémoire et 10 secondes de timeout

#### Routes Optimisées
```json
[
  {
    "src": "/api/(.*)",
    "dest": "/api/index.ts"
  },
  {
    "handle": "filesystem"
  },
  {
    "src": "/(.*)",
    "dest": "/index.html"
  }
]
```

1. **Route API** : `/api/*` → fonction serverless `api/index.ts`
2. **Filesystem Handler** : Sert automatiquement les assets statiques (JS, CSS, images)
3. **Fallback SPA** : Toutes les autres routes → `index.html` (pour le routing côté client React)

## 🧪 Validation Locale

### Test du Build
```bash
cd /home/user/webapp && rm -rf client/dist && npm run build
```

**Résultat :**
```
✓ 3196 modules transformed.
dist/index.html                   0.85 kB │ gzip:   0.45 kB
dist/assets/index-Ot1jjFNs.css   99.38 kB │ gzip:  16.80 kB
dist/assets/index-Dtg7rCnL.js   991.50 kB │ gzip: 298.97 kB
✓ built in 13.18s
```
✅ **Build réussi**

### Test de Compilation TypeScript API
```bash
npx tsc --project tsconfig.api.json --noEmit
```
✅ **Aucune erreur TypeScript**

## 📦 Structure du Build

```
client/dist/
├── assets/
│   ├── index-Ot1jjFNs.css (99.38 kB)
│   └── index-Dtg7rCnL.js (991.50 kB)
└── index.html (0.85 kB)
```

## 🚀 Processus de Déploiement Vercel

Avec cette nouvelle configuration, lors du déploiement Vercel :

1. **Installation** : `npm install` → Installe toutes les dépendances
2. **Build** : `npm run build` → Compile l'application React avec Vite
3. **Génération** : Crée les fichiers dans `client/dist/`
4. **Déploiement** : 
   - Fichiers statiques servis depuis `client/dist/`
   - API déployée comme fonction serverless Node.js
5. **Routing** : Configuration des routes pour SPA + API

## 🔧 Commande de Déploiement

Pour déployer sur Vercel (après commit) :

```bash
# Avec Vercel CLI
vercel --prod

# Ou via Git push (si Vercel est connecté à GitHub)
git push origin main
```

## ⚠️ Points Importants

### Ne PAS Versionner `client/dist/`
Le dossier `client/dist/` doit rester dans `.gitignore` car :
- ❌ Il est généré automatiquement par le build
- ❌ Il change à chaque modification
- ❌ Il alourdit le dépôt Git inutilement
- ✅ Vercel le génère automatiquement lors du déploiement

### Token Vercel
Le token fourni : `1AV6yo1uRL6VT5xPZitq7S5p`

**⚠️ Sécurité** : Ce token doit être configuré comme variable d'environnement :
```bash
# Localement
export VERCEL_TOKEN=1AV6yo1uRL6VT5xPZitq7S5p

# Ou dans Vercel Dashboard
# Settings → Environment Variables → VERCEL_TOKEN
```

## 📋 Checklist Post-Déploiement

Après le déploiement, vérifier :

- [ ] L'URL Vercel est accessible (pas de 404)
- [ ] La page d'accueil se charge avec le contenu React
- [ ] Les assets (CSS, JS) sont chargés correctement
- [ ] L'endpoint `/api/health` retourne `{"status":"ok"}`
- [ ] L'endpoint `/api/trpc` est accessible
- [ ] Le routing React (Wouter) fonctionne
- [ ] Les variables d'environnement sont configurées
- [ ] La base de données Postgres est connectée

## 🔗 Ressources

- **Documentation Vercel** : https://vercel.com/docs/project-configuration
- **Vite Build** : https://vitejs.dev/guide/build.html
- **tRPC on Vercel** : https://trpc.io/docs/serverless

## 📝 Prochaines Étapes

1. ✅ Committer les changements de `vercel.json`
2. ✅ Pousser sur la branche principale ou créer une PR
3. ⏳ Déployer sur Vercel
4. ⏳ Vérifier que l'application est accessible
5. ⏳ Configurer les variables d'environnement nécessaires
6. ⏳ Tester toutes les fonctionnalités

---

**Date** : 21 Novembre 2025  
**Auteur** : GenSpark AI Developer  
**Status** : ✅ Configuration corrigée, prête pour déploiement
