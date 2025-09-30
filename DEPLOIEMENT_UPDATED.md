# Guide de Déploiement Vercel - Application Planning Médical

## ✅ Corrections Appliquées

L'application a été corrigée pour résoudre l'erreur de runtime Vercel. Les modifications incluent :

### 1. Configuration Vercel (`vercel.json`)
- ✅ Suppression de la spécification explicite du runtime problématique
- ✅ Configuration optimisée pour auto-détection Vercel
- ✅ Routage correct pour API et SPA
- ✅ Headers de sécurité maintenus

### 2. Configuration Build (`package.json`)
- ✅ Script de build optimisé pour Vercel
- ✅ Sortie vers `dist/public` comme attendu
- ✅ Version Node.js spécifiée (>=20.19.0)

### 3. Variables d'Environnement (`.env`)
- ✅ Fichier créé avec toutes les variables nécessaires
- ✅ Configuration base de données PostgreSQL
- ✅ Secrets JWT et session configurés

## 🚀 Instructions de Déploiement

### Étape 1 : Connexion à Vercel
1. Allez sur [https://vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub

### Étape 2 : Importer le Projet
1. Cliquez sur "New Project"
2. Sélectionnez le repository `doriansarry47-creator/planning`
3. Cliquez sur "Import"

### Étape 3 : Configuration du Projet
**Framework Preset :** Sélectionnez "Other" ou laissez "Other" (pas Express)
**Build Command :** `npm run build` (sera automatiquement détecté)
**Output Directory :** `dist/public` (sera automatiquement détecté)
**Install Command :** `npm install` (sera automatiquement détecté)

### Étape 4 : Variables d'Environnement
Ajoutez ces variables dans l'onglet "Environment Variables" :

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_i84emMYdFacv@ep-fragrant-mountain-ab8sksei-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=medplan-jwt-secret-2024-secure-key-for-production
JWT_EXPIRES_IN=24h
SESSION_SECRET=medplan-session-secret-2024-secure-key-for-prod
```

### Étape 5 : Déploiement
1. Cliquez sur "Deploy"
2. Attendez que le build se termine (environ 2-3 minutes)

## ✅ Vérification du Déploiement

Une fois déployé, votre application devrait :
- ✅ Afficher la page de connexion correctement
- ✅ Permettre la navigation dans l'interface
- ✅ Connecter à la base de données PostgreSQL
- ✅ Gérer l'authentification JWT

### Endpoints API disponibles :
- `https://votre-app.vercel.app/api/health` - Vérification serveur
- `https://votre-app.vercel.app/api/auth` - Authentication
- `https://votre-app.vercel.app/api/practitioners` - Praticiens
- `https://votre-app.vercel.app/api/appointments` - Rendez-vous
- `https://votre-app.vercel.app/api/patients` - Patients

## 🔧 Résolution des Problèmes

### Si l'erreur de runtime persiste :
1. Vérifiez que tous les fichiers ont bien été poussés sur GitHub
2. Dans Vercel, allez dans Settings > Functions et vérifiez qu'aucune configuration de runtime n'est forcée
3. Redéployez en cliquant sur "Redeploy" dans l'onglet Deployments

### Si la base de données ne se connecte pas :
1. Vérifiez que la variable `DATABASE_URL` est correctement configurée
2. Testez la connexion avec l'endpoint `/api/health`

---

**✅ L'application est maintenant prête pour un déploiement réussi sur Vercel !**