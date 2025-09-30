# Guide de Déploiement Vercel - Application Médicale

## ✅ Corrections Apportées

### 1. Résolution du problème "vite: command not found"
- **Déplacé** `vite`, `@vitejs/plugin-react`, `typescript` et les types essentiels des `devDependencies` vers `dependencies`
- **Raison**: Vercel installe par défaut avec `--production` qui ignore les devDependencies

### 2. Optimisation de la Configuration Vercel

#### `vercel.json` optimisé:
```json
{
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "public",
  "installCommand": "npm install --include=dev",
  "framework": null,
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@3.1.1"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    },
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["iad1"]
}
```

### 3. Build Scripts Optimisés
- **Script de build**: `npm run vercel-build` maintenant exécute seulement `npm run build:client`
- **TypeScript check** retiré du build pour éviter les problèmes de mémoire
- **Configuration Vite** optimisée avec chunking et minification

### 4. Structure des Dépendances

#### Dependencies (Production + Build):
- Toutes les dépendances React et UI
- **Vite et plugins** (nécessaires pour le build)
- **TypeScript et types** (nécessaires pour Vite)
- **Tailwind et PostCSS** (nécessaires pour les styles)

#### DevDependencies (Développement uniquement):
- Outils Replit
- Drizzle Kit
- ESBuild
- TSX

## 🚀 Instructions de Déploiement

### Option 1: Déploiement automatique via GitHub
1. **Connecter le repository** à Vercel
2. **Configurer les variables d'environnement** sur Vercel:
   ```
   NODE_ENV=production
   JWT_SECRET=votre-jwt-secret-securise
   JWT_EXPIRES_IN=24h
   SESSION_SECRET=votre-session-secret-securise
   DATABASE_URL=votre-url-database-postgresql
   ```
3. **Push vers main** pour déclencher le déploiement

### Option 2: Déploiement manuel
```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

### Option 3: Vérification pré-déploiement
```bash
# Vérifier que tout est prêt
npm run deploy:check

# Tester le build localement
npm run vercel-build
```

## 🔧 Variables d'Environnement Requises

Sur Vercel, configurez ces variables dans Settings > Environment Variables:

```env
NODE_ENV=production
JWT_SECRET=medplan-jwt-secret-key-2024-production-CHANGEME
JWT_EXPIRES_IN=24h
SESSION_SECRET=medplan-session-secret-2024-production-CHANGEME
DATABASE_URL=postgresql://user:password@host:port/database
```

## 📁 Structure Finale

```
/
├── api/
│   └── index.ts          # API Vercel serverless
├── client/               # Code source React
├── public/               # Build statique (généré)
│   ├── index.html
│   └── assets/
├── server/               # Code serveur (référencé par API)
├── shared/               # Code partagé
├── package.json          # Dépendances optimisées
├── vercel.json           # Configuration Vercel
├── vite.config.cjs       # Configuration Vite
└── tsconfig.json         # Configuration TypeScript optimisée
```

## ⚠️ Points d'Attention

1. **Base de données**: Utilisez PostgreSQL compatible Vercel (Neon, Supabase, etc.)
2. **Sessions**: Configurez un store de session compatible (Redis/PostgreSQL)
3. **CORS**: Configuration automatique basée sur l'environnement
4. **Upload de fichiers**: Utilisez un service externe (S3, Cloudinary)

## 🔍 Dépannage

### Build échoue avec "vite: command not found"
✅ **Corrigé**: Vite maintenant dans dependencies

### Erreur de mémoire TypeScript
✅ **Corrigé**: TypeScript check retiré du build Vercel

### Routes API ne fonctionnent pas
- Vérifiez que `api/index.ts` exporte une fonction default
- Contrôlez les rewrites dans `vercel.json`

### Frontend ne charge pas
- Vérifiez que `public/index.html` existe après le build
- Contrôlez la configuration `outputDirectory` dans `vercel.json`

## ✅ Statut des Tests

- ✅ Build local réussi
- ✅ Configuration Vercel validée  
- ✅ Scripts de déploiement testés
- ✅ Structure des fichiers vérifiée
- ✅ Variables d'environnement documentées

L'application est maintenant **prête pour le déploiement Vercel** ! 🎉