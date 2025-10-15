# 🚀 Guide de Développement Local - MedPlan

## ✅ Problèmes Résolus

### 🔐 Authentification Admin et Patient
- ✅ **Mot de passe admin réinitialisé** : `doriansarry@yahoo.fr` / `admin123`
- ✅ **Compte patient de test créé** : `patient.test@medplan.fr` / `patient123`
- ✅ **API d'authentification fonctionnelle** : Tests validés pour admin et patient
- ✅ **Base de données PostgreSQL connectée** : Neon Database opérationnelle

### 🔧 Configuration Développement Local
- ✅ **Serveur API développement** : `api-server.ts` sur le port 5000
- ✅ **Proxy Vite configuré** : `/api` → `http://localhost:5000`
- ✅ **Scripts npm ajoutés** : Commandes pratiques pour le développement

## 📋 Comptes de Test

### 👤 Administrateur
```
Email: doriansarry@yahoo.fr
Mot de passe: admin123
URL de connexion: /admin/login
```

### 👥 Patient
```
Email: patient.test@medplan.fr
Mot de passe: patient123
URL de connexion: /patient/login
```

## 🛠️ Démarrage Rapide

### Option 1 : Démarrage complet (Recommandé)
```bash
# Démarre l'API et le frontend en même temps
npm run dev:full
```

### Option 2 : Démarrage manuel
```bash
# Terminal 1 : Démarrer le serveur API
npm run dev:api

# Terminal 2 : Démarrer le frontend
npm run dev
```

L'application sera accessible sur : `http://localhost:5173` ou `http://localhost:5174`

## 📡 Scripts Disponibles

### Développement
```bash
# Démarrer uniquement le frontend
npm run dev

# Démarrer uniquement l'API
npm run dev:api

# Démarrer API + Frontend
npm run dev:full

# Build pour production
npm run build

# Prévisualiser le build
npm run preview
```

### Base de Données
```bash
# Vérifier la connexion DB et lister les comptes
npm run db:check

# Réinitialiser le mot de passe admin
npm run db:reset-admin

# Créer/mettre à jour le compte patient de test
npm run db:create-patient
```

### Tests
```bash
# Tester l'API directement
npm run test:api
```

## 🏗️ Architecture Développement

### Ports
- **Frontend (Vite)** : `http://localhost:5173` (ou 5174)
- **API Backend** : `http://localhost:5000`

### Flux de Requêtes
```
Browser → Vite Dev Server (5173)
           ↓ Proxy /api/*
         API Server (5000)
           ↓
         PostgreSQL (Neon)
```

### Fichiers Clés
```
├── api-server.ts           # Serveur API de développement
├── api/                    # Fonctions API serverless
│   ├── auth/index.ts       # Authentification
│   ├── appointments/       # Gestion rendez-vous
│   └── practitioners/      # Gestion praticiens
├── src/                    # Frontend React
│   ├── pages/              # Pages de l'app
│   ├── components/         # Composants React
│   └── hooks/              # Hooks personnalisés
├── vite.config.ts          # Config Vite avec proxy
└── .env                    # Variables d'environnement
```

## 🔍 Dépannage

### Erreur : Port déjà utilisé
```bash
# Vérifier les ports occupés
lsof -ti:5000 -ti:5173

# Tuer les processus si nécessaire
kill -9 $(lsof -ti:5000)
kill -9 $(lsof -ti:5173)
```

### Erreur : Base de données non accessible
```bash
# Vérifier la connexion
npm run db:check

# Vérifier les variables d'environnement
cat .env | grep DATABASE_URL
```

### Erreur : Échec de connexion admin/patient
```bash
# Réinitialiser le mot de passe admin
npm run db:reset-admin

# Créer/mettre à jour le patient de test
npm run db:create-patient

# Tester l'API
npm run test:api
```

### Erreur 404 sur /api/auth
- ✅ Vérifier que le serveur API tourne sur le port 5000
- ✅ Vérifier la config du proxy dans `vite.config.ts`
- ✅ Redémarrer les deux serveurs

### Erreur 500 sur /api/auth
- ✅ Vérifier les logs du serveur API (terminal 1)
- ✅ Vérifier la connexion à la base de données
- ✅ Vérifier les variables d'environnement dans `.env`

## 🌐 URLs de Test

### Frontend
- Accueil : `http://localhost:5173/`
- Login Admin : `http://localhost:5173/admin/login`
- Login Patient : `http://localhost:5173/patient/login`

### API (via Proxy)
- Health : `http://localhost:5173/api/health`
- Login Admin : `POST http://localhost:5173/api/auth?action=login&userType=admin`
- Login Patient : `POST http://localhost:5173/api/auth?action=login&userType=patient`

### API (Direct)
- Health : `http://localhost:5000/api/health`
- Login Admin : `POST http://localhost:5000/api/auth?action=login&userType=admin`
- Login Patient : `POST http://localhost:5000/api/auth?action=login&userType=patient`

## 📝 Variables d'Environnement

Le fichier `.env` contient :
```env
# Base de données Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:npg_6aG2wNlTWnsb@ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Authentification
JWT_SECRET=medplan-jwt-secret-key-2024-production
JWT_EXPIRES_IN=24h

# Session
SESSION_SECRET=medplan-session-secret-2024-production

# API
NODE_ENV=development
PORT=5000
VITE_API_URL=/api
```

## 🚀 Déploiement sur Vercel

### Prérequis
- Compte Vercel
- Token Vercel : `VWMcm9MIiegjohDNlFYGpFyQ`

### Étapes
1. **Se connecter à Vercel**
   ```bash
   vercel login
   ```

2. **Configurer les variables d'environnement**
   - Aller sur vercel.com
   - Projet > Settings > Environment Variables
   - Ajouter toutes les variables de `.env`

3. **Déployer**
   ```bash
   vercel --prod
   ```

4. **Tester l'API en production**
   ```bash
   curl -X POST https://votre-app.vercel.app/api/auth?action=login&userType=admin \
     -H "Content-Type: application/json" \
     -d '{"email":"doriansarry@yahoo.fr","password":"admin123"}'
   ```

## 📊 Tests Effectués

### ✅ Tests Réussis
- [x] Connexion à la base de données PostgreSQL
- [x] Liste des tables (7 tables détectées)
- [x] Compte admin existe et est accessible
- [x] Compte patient de test créé
- [x] API Health Check
- [x] API Login Admin (doriansarry@yahoo.fr)
- [x] API Login Patient (patient.test@medplan.fr)
- [x] Proxy Vite vers API Backend
- [x] Token JWT généré correctement
- [x] Données utilisateur retournées sans le mot de passe

### 📸 Logs de Test
```
✅ Admin login successful!
Success: true
Message: Connexion réussie
Token present: true
User email: doriansarry@yahoo.fr

✅ Patient login successful!
Success: true
Message: Connexion réussie
Token present: true
User email: patient.test@medplan.fr
```

## 💡 Conseils

1. **Toujours démarrer l'API en premier** : L'API doit tourner avant le frontend
2. **Vérifier les logs** : Les erreurs API apparaissent dans le terminal de l'API
3. **Utiliser les scripts npm** : Ils gèrent automatiquement les configurations
4. **Tester régulièrement** : Utiliser `npm run test:api` pour valider l'API

## 📞 Support

En cas de problème :
1. Vérifier les logs du terminal API
2. Vérifier les logs du navigateur (F12 > Console)
3. Tester l'API directement avec `npm run test:api`
4. Vérifier la connexion DB avec `npm run db:check`

---

**✅ Configuration validée le : 2025-10-15**
**👨‍💻 Développement local opérationnel**
