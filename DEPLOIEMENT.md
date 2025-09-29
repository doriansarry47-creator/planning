# 🚀 Guide de déploiement Vercel - MedPlan

## ✅ Problèmes résolus

### Problème initial
L'application affichait le code JavaScript au lieu de l'interface utilisateur.

### Corrections apportées
1. **Configuration Vercel simplifiée** - `vercel.json` optimisé pour les fichiers statiques
2. **Routage API corrigé** - Suppression du préfixe `/api` en double
3. **Build process amélioré** - Séparation client/serveur pour Vercel
4. **Variables d'environnement configurées** - Base de données et secrets

## 🔧 Étapes de déploiement

### 1. Se connecter à Vercel
- Aller sur : https://vercel.com/login
- Se connecter avec GitHub

### 2. Importer le projet
1. Cliquer sur "Add New..." → "Project"
2. Sélectionner le repository `doriansarry47-creator/planning`
3. Cliquer sur "Import"

### 3. Configuration automatique
Vercel détectera automatiquement :
- **Framework**: Other
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist/public`
- **Node.js Version**: 20.x (spécifié dans package.json)

### 4. Variables d'environnement
Les variables sont préconfigurées dans `vercel.json` :
```
DATABASE_URL=postgresql://neondb_owner:npg_i84emMYdFacv@ep-fragrant-mountain-ab8sksei-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
JWT_SECRET=medplan-jwt-secret-2024-secure-key-for-production
JWT_EXPIRES_IN=24h
SESSION_SECRET=medplan-session-secret-2024-secure-key-for-prod
```

### 5. Déployer
- Cliquer sur "Deploy"
- Attendre la fin du build (~2-3 minutes)

## 📂 Structure des fichiers

```
/
├── api/
│   └── server.ts           # Handler API pour Vercel
├── client/                 # Code React
├── server/                 # Code serveur Express
├── dist/public/           # Build output (généré)
├── vercel.json            # Configuration Vercel
└── package.json           # Scripts et dépendances
```

## 🔗 Endpoints API

Une fois déployé, l'API sera accessible via :
- `https://votre-app.vercel.app/api/health` - Statut du serveur
- `https://votre-app.vercel.app/api/auth` - Authentification
- `https://votre-app.vercel.app/api/practitioners` - Praticiens
- `https://votre-app.vercel.app/api/appointments` - Rendez-vous
- `https://votre-app.vercel.app/api/patients` - Patients

## 🛠️ Dépannage

### Si l'application ne se charge pas
1. Vérifier les logs de build dans Vercel
2. Vérifier que la base de données est accessible
3. Redéployer depuis l'interface Vercel

### Si l'API ne fonctionne pas
1. Tester `/api/health` pour vérifier le statut
2. Vérifier les variables d'environnement
3. Consulter les logs de function dans Vercel

## 🔄 Mises à jour

Pour déployer des changements :
1. Push sur la branche `main` de GitHub
2. Vercel redéploiera automatiquement

## 🔐 Sécurité

- Base de données PostgreSQL sécurisée (Neon)
- JWT pour l'authentification
- CORS configuré pour la production
- Headers de sécurité ajoutés

---

L'application est maintenant prête pour la production ! 🎉