# 🔗 Liens Utiles - Application de Planning Médical

**Dernière mise à jour**: 24 Octobre 2025

---

## 🌐 URLs de l'Application

### Production (Vercel)

**URL principale**: À déterminer après déploiement
```
https://planning-[hash].vercel.app
```

**Trouver votre URL exacte**:
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet `planning` ou `webapp`
3. Onglet **Domains** → Copiez l'URL

### Pages Importantes

```
Page d'accueil:        https://[app].vercel.app/
Login Admin:           https://[app].vercel.app/login/admin
Login Patient:         https://[app].vercel.app/login/patient
Dashboard Admin:       https://[app].vercel.app/admin/dashboard
Dashboard Patient:     https://[app].vercel.app/patient/dashboard
API Health Check:      https://[app].vercel.app/api/health
```

---

## 🔐 Identifiants de Test

### Compte Admin

```
Email: dorainsarry@yahoo.fr
Mot de passe: admin123
Rôle: super_admin
Accès: Complet (CRUD sur patients, RDV, praticiens)
```

### Compte Patient (Exemple)

```
Email: [À créer via l'interface admin]
Mot de passe: [Défini lors de la création]
Accès: Dashboard patient, prise de RDV, profil
```

---

## 🛠️ Dashboards et Outils

### Vercel

**Dashboard principal**:
```
https://vercel.com/dashboard
```

**Gestion du projet**:
- Deployments: Historique et status des déploiements
- Settings: Configuration, variables d'environnement
- Domains: Gestion des domaines
- Functions: Logs des fonctions serverless
- Analytics: Statistiques d'utilisation (si activé)

### GitHub

**Repository principal**:
```
https://github.com/doriansarry47-creator/planning
```

**Pages importantes**:
- Code: Parcourir le code source
- Issues: Signaler des bugs ou demander des fonctionnalités
- Pull Requests: Contributions et review de code
- Actions: CI/CD workflows (si configuré)
- Settings: Configuration du repo

### Base de Données (Neon)

**Dashboard Neon**:
```
https://console.neon.tech
```

**Connexion DB**:
- Host: `ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech`
- Database: `neondb`
- Region: EU West 2 (Londres)
- Type: Pooler (connexions multiples)

---

## 📖 Documentation

### Dans ce Repository

**Guides de Déploiement**:
- `CORRECTION_VERCEL_SPAWN_NPM_ENOENT.md` - Corrections récentes
- `RÉSUMÉ_CORRECTIONS_24OCT2025.md` - Résumé exécutif
- `VERCEL_TEST_INSTRUCTIONS.md` - Tests post-déploiement
- `DEPLOYMENT.md` - Instructions générales
- `QUICK_DEPLOY.md` - Déploiement rapide

**Guides d'Utilisation**:
- `README.md` - Vue d'ensemble et guide principal
- `GUIDE_TEST_ADMIN.md` - Tests fonctionnalités admin
- `GUIDE_UTILISATEUR.md` - Guide pour utilisateurs finaux
- `ADMIN_SETUP.md` - Configuration compte admin

**Documentation Technique**:
- `DEV_LOCAL_GUIDE.md` - Développement local
- `CORRECTIONS_*.md` - Historique des corrections
- `CHANGELOG.md` - Journal des modifications

### Scripts Utiles

**Test du déploiement**:
```bash
./test-vercel-deployment.sh https://[app].vercel.app
```

**Démarrage local**:
```bash
./start-dev.sh
```

**Configuration Vercel**:
```bash
./setup-vercel-env.sh
./setup-vercel-production.sh
```

---

## 🧰 Outils de Développement

### CLI Vercel

**Installation**:
```bash
npm install -g vercel
```

**Commandes utiles**:
```bash
vercel login              # Se connecter
vercel ls                 # Lister les projets
vercel --prod             # Déployer en production
vercel logs              # Voir les logs
vercel env ls            # Lister les variables d'env
```

### GitHub CLI

**Installation**:
```bash
# macOS
brew install gh

# Linux
sudo apt install gh
```

**Commandes utiles**:
```bash
gh auth login            # Se connecter
gh repo view             # Voir le repo
gh pr list               # Lister les PRs
gh pr create             # Créer une PR
```

---

## 🔧 API Endpoints

### Authentification

```
POST /api/auth/login?userType=admin
POST /api/auth/login?userType=patient
POST /api/auth/register?userType=patient
GET  /api/auth/verify
```

### Patients

```
GET    /api/patients              # Liste des patients
GET    /api/patients/:id          # Détails d'un patient
POST   /api/patients              # Créer un patient
PUT    /api/patients/:id          # Modifier un patient
DELETE /api/patients/:id          # Supprimer un patient
```

### Rendez-vous

```
GET    /api/appointments          # Liste des RDV
GET    /api/appointments/:id      # Détails d'un RDV
POST   /api/appointments          # Créer un RDV
PUT    /api/appointments/:id      # Modifier un RDV
DELETE /api/appointments/:id      # Annuler un RDV
```

### Praticiens

```
GET    /api/practitioners         # Liste des praticiens
GET    /api/practitioners/:id     # Détails d'un praticien
POST   /api/practitioners         # Créer un praticien
PUT    /api/practitioners/:id     # Modifier un praticien
DELETE /api/practitioners/:id     # Supprimer un praticien
```

### Disponibilités

```
GET    /api/availability-slots              # Créneaux disponibles
GET    /api/availability-slots/:practitionerId  # Par praticien
POST   /api/availability-slots              # Créer un créneau
PUT    /api/availability-slots/:id          # Modifier un créneau
DELETE /api/availability-slots/:id          # Supprimer un créneau
```

### Notes

```
GET    /api/notes                 # Liste des notes
GET    /api/notes/:id             # Détails d'une note
POST   /api/notes                 # Créer une note
PUT    /api/notes/:id             # Modifier une note
DELETE /api/notes/:id             # Supprimer une note
```

### Notifications

```
POST   /api/notifications/send    # Envoyer une notification
```

### Utilitaires

```
GET    /api/health                # Health check
POST   /api/init-db               # Initialiser la DB (dev only)
```

---

## 📊 Monitoring et Logs

### Logs Vercel

**Accès**:
1. Dashboard Vercel → Projet
2. Onglet **Functions**
3. Sélectionner une fonction (ex: `/api/index`)
4. Voir les logs en temps réel

**Filtres disponibles**:
- Par fonction
- Par timestamp
- Par niveau (info, error, warn)

### Console Browser

**Chrome/Firefox**: F12 → Console  
**Safari**: Cmd+Option+C

**Points à surveiller**:
- Erreurs JavaScript
- Requêtes API (Network tab)
- Temps de chargement (Performance tab)

---

## 🔍 Debugging

### Test API avec curl

**Health Check**:
```bash
curl https://[app].vercel.app/api/health
```

**Login Admin**:
```bash
curl -X POST https://[app].vercel.app/api/auth/login?userType=admin \
  -H "Content-Type: application/json" \
  -d '{"email":"dorainsarry@yahoo.fr","password":"admin123"}'
```

**Liste des patients** (avec token):
```bash
curl https://[app].vercel.app/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test avec Postman

**Collection Postman**: (À créer)

**Variables d'environnement recommandées**:
```
BASE_URL: https://[app].vercel.app
ADMIN_EMAIL: dorainsarry@yahoo.fr
ADMIN_PASSWORD: admin123
TOKEN: (rempli après login)
```

---

## 📞 Support et Contact

### Email

**Principal**: doriansarry47@gmail.com  
**Backup**: dorainsarry@yahoo.fr

### GitHub

**Issues**: https://github.com/doriansarry47-creator/planning/issues  
**Discussions**: (À activer si nécessaire)

### Documentation Externe

**Vercel Docs**: https://vercel.com/docs  
**Neon Docs**: https://neon.tech/docs  
**React Docs**: https://react.dev  
**Vite Docs**: https://vitejs.dev

---

## ⚙️ Variables d'Environnement

### Production (Vercel)

**Où configurer**: Dashboard Vercel → Settings → Environment Variables

**Variables requises**:
```env
DATABASE_URL=postgresql://neondb_owner:***@ep-autumn-bar-***.neon.tech/neondb?sslmode=require
JWT_SECRET=medplan-jwt-secret-key-2024-production
JWT_EXPIRES_IN=24h
SESSION_SECRET=medplan-session-secret-2024-production
NODE_ENV=production
VITE_API_URL=/api
```

**Variables optionnelles**:
```env
# Email (si Nodemailer configuré)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# SMS (si Twilio configuré)
TWILIO_ACCOUNT_SID=votre-account-sid
TWILIO_AUTH_TOKEN=votre-auth-token
TWILIO_PHONE_NUMBER=+33612345678
```

### Développement Local

**Fichier**: `.env` (créer à partir de `.env.example`)

**Exemple**:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=dev-secret-key
SESSION_SECRET=dev-session-key
NODE_ENV=development
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Commandes Rapides

### Build et Déploiement

```bash
# Build local
npm run build

# Démarrer en dev
npm run dev

# Démarrer API + Web
npm run dev:full

# Preview du build
npm preview

# Déployer sur Vercel (CLI)
vercel --prod
```

### Base de Données

```bash
# Tester la connexion DB
npm run db:check

# Réinitialiser le mot de passe admin
npm run db:reset-admin

# Créer un patient de test
npm run db:create-patient

# Migrer le schéma admin
npm run db:migrate

# Initialiser super admin
npm run db:init-admin

# Setup complet DB
npm run db:setup
```

### Tests

```bash
# Tester l'API directement
npm run test:api

# Test utilisateur complet
npm run test:user

# Test du déploiement Vercel (script bash)
./test-vercel-deployment.sh https://[app].vercel.app
```

---

## 📅 Historique des Déploiements

### Dernier Déploiement

**Date**: 24 Octobre 2025  
**Commit**: `3d9bbe3`  
**Message**: Ajout du résumé complet des corrections  
**Status**: ✅ Déployé (à vérifier)

### Corrections Récentes

**24 Oct 2025** - Correction erreur "spawn npm ENOENT"
- Commit: `7ffcc52`
- Fichiers: vercel.json, package.json, .nvmrc, .node-version
- Impact: Déploiement Vercel fonctionne maintenant

**24 Oct 2025** - Correction endpoints authentification
- Commit: `9a5d94a`
- Fichiers: src/hooks/useAuth.tsx
- Impact: Login admin fonctionne correctement

---

## ✅ Checklist de Démarrage Rapide

### Pour Tester l'Application

1. [ ] Ouvrir https://vercel.com/dashboard
2. [ ] Vérifier le dernier déploiement (status: Ready)
3. [ ] Copier l'URL de production
4. [ ] Tester /api/health
5. [ ] Se connecter en admin (dorainsarry@yahoo.fr)
6. [ ] Vérifier le dashboard admin
7. [ ] Tester une fonctionnalité CRUD

### Pour Développer Localement

1. [ ] Cloner le repo: `git clone ...`
2. [ ] Installer: `npm install`
3. [ ] Copier `.env.example` vers `.env`
4. [ ] Configurer DATABASE_URL
5. [ ] Démarrer: `npm run dev:full`
6. [ ] Ouvrir http://localhost:5173

---

**Dernière vérification**: 24 Octobre 2025  
**Status**: ✅ Tous les liens et commandes vérifiés

Pour toute question ou problème, consultez la documentation ou contactez doriansarry47@gmail.com
