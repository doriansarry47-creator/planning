# 🚀 Quick Start - MedPlan

## ⚡ Démarrage en 30 secondes

### Option 1 : Script de démarrage (Le plus simple)
```bash
./start-dev.sh
```

### Option 2 : Commande npm
```bash
npm run dev:full
```

### Option 3 : Démarrage manuel (2 terminaux)
```bash
# Terminal 1 - API
npm run dev:api

# Terminal 2 - Frontend
npm run dev
```

## 🔐 Comptes de Test

### Admin
```
URL: http://localhost:5173/admin/login
Email: doriansarry@yahoo.fr
Mot de passe: admin123
```

### Patient
```
URL: http://localhost:5173/patient/login
Email: patient.test@medplan.fr
Mot de passe: patient123
```

## 🌐 URLs de l'Application

- **Page d'accueil** : http://localhost:5173/
- **API Health** : http://localhost:5000/api/health
- **Login Admin** : http://localhost:5173/admin/login
- **Login Patient** : http://localhost:5173/patient/login

## 🧪 Tester l'API

```bash
# Tester la connexion admin
curl -X POST http://localhost:5000/api/auth?action=login&userType=admin \
  -H "Content-Type: application/json" \
  -d '{"email":"doriansarry@yahoo.fr","password":"admin123"}'

# Tester la connexion patient
curl -X POST http://localhost:5000/api/auth?action=login&userType=patient \
  -H "Content-Type: application/json" \
  -d '{"email":"patient.test@medplan.fr","password":"patient123"}'
```

## 🛠️ Commandes Utiles

```bash
# Vérifier la base de données
npm run db:check

# Réinitialiser le mot de passe admin
npm run db:reset-admin

# Créer un patient de test
npm run db:create-patient

# Tester l'API
npm run test:api
```

## ⚠️ Prérequis

1. **Node.js 20.x** installé
2. **Base de données PostgreSQL** configurée (Neon)
3. **Fichier .env** avec DATABASE_URL

## 🔧 Configuration

Le fichier `.env` doit contenir :
```env
DATABASE_URL=postgresql://...
JWT_SECRET=medplan-jwt-secret-key-2024-production
SESSION_SECRET=medplan-session-secret-2024-production
NODE_ENV=development
PORT=5000
VITE_API_URL=/api
```

## 📖 Documentation Complète

- **Guide Développement** : [DEV_LOCAL_GUIDE.md](DEV_LOCAL_GUIDE.md)
- **Résultats Tests** : [TESTS_RESULTS.md](TESTS_RESULTS.md)
- **Corrections** : [CORRECTIONS_FINALES.md](CORRECTIONS_FINALES.md)
- **README** : [README.md](README.md)

## 🎯 Workflow Typique

1. **Démarrer** : `npm run dev:full`
2. **Ouvrir** : http://localhost:5173
3. **Se connecter** : Admin ou Patient
4. **Développer** : Modifier le code (hot reload actif)
5. **Tester** : `npm run test:api`
6. **Arrêter** : Ctrl+C

## 🚨 Dépannage Rapide

### Port déjà utilisé
```bash
# Trouver et tuer le processus
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Erreur de connexion DB
```bash
# Vérifier la connexion
npm run db:check
```

### Erreur d'authentification
```bash
# Réinitialiser les comptes
npm run db:reset-admin
npm run db:create-patient
```

## 📞 Support

- **Documentation** : Voir les fichiers MD dans le projet
- **Email** : doriansarry47@gmail.com
- **Tests** : `npm run test:api`

---

**Temps de démarrage** : ~30 secondes  
**Configuration requise** : ~2 minutes  
**Prêt à développer** : ✅
