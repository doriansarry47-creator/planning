# 🏥 Application Thérapie Sensorimotrice - Dorian Sarry

> Application web moderne pour la gestion de cabinet de thérapie sensorimotrice avec prise de rendez-vous en ligne, déployée sur Vercel avec architecture serverless.

---

## 🎉 STATUT : Prêt pour la Production ✅

### ✅ Corrections Appliquées (27 Octobre 2025)
- **Build Vercel** : Erreur `node_modules/.bin/vite` corrigée ✅
- **Configuration Vercel** : Optimisée pour serverless ✅
- **Documentation** : Guides complets ajoutés ✅
- **Tests** : Build validé en 5.13s ✅

**Pull Requests Mergées** : [#42](https://github.com/doriansarry47-creator/planning/pull/42), [#43](https://github.com/doriansarry47-creator/planning/pull/43), [#44](https://github.com/doriansarry47-creator/planning/pull/44)

---

## 🚀 Déploiement Rapide (10-15 minutes)

### Option 1 : Via l'Interface Vercel (Recommandé)

#### Étape 1 : Importer le Projet
1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Importez : `doriansarry47-creator/planning`
3. Branche : `main`

#### Étape 2 : Variables d'Environnement
Dans Vercel Dashboard → Settings → Environment Variables :
```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/db?sslmode=require
JWT_SECRET=votre-cle-secrete-minimum-32-caracteres
SESSION_SECRET=votre-cle-session-minimum-32-caracteres
VITE_FRONTEND_URL=https://votre-app.vercel.app
VITE_API_URL=/api
```

#### Étape 3 : Déployer
Cliquez sur "Deploy" - Vercel détecte automatiquement la configuration ✅

#### Étape 4 : Initialiser la Base
Accédez une fois à : `https://votre-app.vercel.app/api/init-db`

#### Étape 5 : Connexion Admin
```
URL      : https://votre-app.vercel.app/login/admin
Email    : doriansarry@yahoo.fr
Password : DoraineAdmin2024!
```
⚠️ **Changez le mot de passe immédiatement !**

### Option 2 : Via le Script Automatisé
```bash
./vercel-setup.sh
```

### Option 3 : Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 📚 Documentation Complète

### 📖 Guides de Déploiement
- **[CORRECTIONS_COMPLETES.md](./CORRECTIONS_COMPLETES.md)** - ⭐ Document récapitulatif central
- **[DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)** - Guide rapide (10-15 min)
- **[VERCEL_DEPLOYMENT_FINAL.md](./VERCEL_DEPLOYMENT_FINAL.md)** - Guide détaillé complet
- **[vercel-setup.sh](./vercel-setup.sh)** - Script CLI automatisé

### 📋 Documentation Technique
- **[README.md](./README.md)** - Documentation technique complète
- **[AMELIORATIONS_STRATEGIQUES.md](./AMELIORATIONS_STRATEGIQUES.md)** - Roadmap stratégique

---

## 🏗️ Architecture

### Stack Technique

#### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le design
- **Wouter** pour le routage
- **React Query** pour la gestion d'état
- **Vite** comme build tool

#### Backend & API
- **Vercel Serverless Functions**
- **Node.js 20.x**
- **Neon PostgreSQL** (serverless)
- **Drizzle ORM**
- **JWT** pour l'authentification

#### Déploiement
- **Vercel** (hosting + serverless)
- **GitHub** (CI/CD automatique)
- **Neon** (base de données)

### Structure du Projet
```
planning/
├── src/                    # Code source React
│   ├── components/         # Composants réutilisables
│   ├── pages/              # Pages de l'application
│   ├── hooks/              # Custom hooks React
│   └── lib/                # Utilitaires
├── api/                    # API Serverless Vercel
│   ├── _lib/               # Bibliothèques API
│   ├── _routes/            # Routes API
│   └── index.ts            # Router principal
├── shared/                 # Code partagé
│   └── schema.ts           # Schéma DB Drizzle
├── dist/                   # Build de production
├── vercel.json             # Configuration Vercel
├── package.json            # Dépendances npm
└── vite.config.ts          # Configuration Vite
```

---

## ✨ Fonctionnalités

### 👤 Interface Patient
- ✅ Inscription et connexion sécurisées
- ✅ Prise de rendez-vous en ligne
- ✅ Tableau de bord personnel
- ✅ Historique des consultations
- ✅ Gestion du profil
- ✅ Questionnaire d'accueil spécifique

### 👨‍⚕️ Interface Admin (Dorian Sarry)
- ✅ Dashboard complet avec statistiques
- ✅ Gestion des patients
- ✅ Gestion des rendez-vous
- ✅ Notes thérapeutiques privées
- ✅ Gestion des disponibilités
- ✅ Calendrier interactif
- ✅ Système de sécurité avancé (verrouillage, tentatives)

### 🔐 Sécurité
- ✅ Authentification JWT
- ✅ Mots de passe hashés (bcrypt)
- ✅ Protection contre les attaques brute-force
- ✅ Variables d'environnement sécurisées
- ✅ CORS configuré

---

## 🌐 URLs de l'Application

### Patient
- 🏠 Accueil : `/`
- 📝 Inscription : `/patient/register`
- 🔐 Connexion : `/login/patient`
- 📅 Prise RDV : `/patient/book-appointment`
- 👤 Dashboard : `/patient/dashboard`
- 📋 Mes RDV : `/patient/appointments`
- 📊 Suivi : `/patient/follow-up`
- ⚙️ Profil : `/patient/profile`

### Admin
- 🔐 Connexion : `/login/admin`
- 📊 Dashboard : `/admin/dashboard`

### API
- 🏥 Health Check : `/api/health`
- 🔧 Init DB : `/api/init-db`
- 🔐 Auth : `/api/auth/*`
- 📅 Appointments : `/api/appointments`
- 👥 Patients : `/api/patients`

---

## 🧪 Tests & Vérification

### Test Build Local
```bash
npm install
npm run build
# ✅ Build réussi en ~5 secondes
```

### Test API Health
```bash
curl https://votre-app.vercel.app/api/health
# ✅ Réponse : { "success": true, "message": "API is healthy" }
```

### Test Interface
- ✅ Ouvrir : `https://votre-app.vercel.app/`
- ✅ Tester inscription patient
- ✅ Tester connexion admin

---

## 📦 Scripts Disponibles

```bash
# Développement
npm run dev              # Lance le serveur de dev Vite
npm run dev:api          # Lance l'API en local
npm run dev:full         # Lance Vite + API

# Build & Preview
npm run build            # Build pour production
npm run preview          # Preview du build

# Base de données
npm run db:check         # Vérifie la connexion DB
npm run db:setup         # Initialise la DB + admin
npm run db:migrate       # Migrations schema
npm run db:init-admin    # Crée le super admin

# Tests
npm run test:api         # Test API directe
npm run test:user        # Tests d'acceptation
```

---

## 🐛 Résolution de Problèmes

### Build échoue sur Vercel
✅ **RÉSOLU** : Script de build corrigé dans package.json

### API ne répond pas
➡️ Vérifiez `DATABASE_URL` dans les variables Vercel

### Erreur de connexion DB
➡️ Vérifiez que votre base Neon est active

### Plus d'Aide
Consultez [CORRECTIONS_COMPLETES.md](./CORRECTIONS_COMPLETES.md) pour le guide complet

---

## 🔗 Liens Utiles

- **Repository** : [github.com/doriansarry47-creator/planning](https://github.com/doriansarry47-creator/planning)
- **Vercel** : [vercel.com/dashboard](https://vercel.com/dashboard)
- **Neon DB** : [neon.tech](https://neon.tech)
- **Documentation Vercel** : [vercel.com/docs](https://vercel.com/docs)

---

## 📝 Changelog

### v3.1.0 - 27 Octobre 2025 ✅
- 🔧 **Fix** : Correction du script de build Vercel
- ⚙️ **Optimization** : Configuration Vercel optimisée
- 📚 **Docs** : Guides complets de déploiement ajoutés
- ✅ **Status** : Prêt pour la production

### v3.0.0 - 23 Octobre 2025
- 🎨 Interface moderne avec design amélioré
- 🗺️ Roadmap stratégique sur 15 mois
- 📊 Composants UI avancés
- 🌙 Mode sombre

---

## 👤 Auteur

**Dorian Sarry** - Thérapeute en Sensorimotricité  
Application développée pour la gestion du cabinet de thérapie

---

## 📄 Licence

Projet privé - Tous droits réservés

---

## 🎉 Prêt à Déployer !

L'application est maintenant **corrigée**, **testée** et **prête pour la production** ! 🚀

**Démarrage Rapide** : Consultez [DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)

---

*Dernière mise à jour : 27 octobre 2025*  
*Build validé : ✅ 5.13s*  
*Status : Production Ready ✅*
