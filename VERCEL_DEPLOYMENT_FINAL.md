# 🚀 Guide de Déploiement Vercel - Application Thérapie Sensorimotrice

## ✅ Corrections Appliquées

### Problèmes Résolus
1. ✅ Erreur `node_modules/.bin/vite: No such file or directory` 
2. ✅ Erreur `Command "npm run build" exited with 127`
3. ✅ Optimisation de la configuration Vercel pour le plan Hobby

### Changements Effectués
- **package.json** : Script de build corrigé (`vite build` au lieu de `node_modules/.bin/vite build`)
- **vercel.json** : Configuration optimisée (ciblage de `api/index.ts` uniquement)
- ✅ Build testé avec succès (5.13s)

---

## 📋 Prérequis

### 1. Compte Vercel
- Créez un compte sur [vercel.com](https://vercel.com)
- Connectez votre compte GitHub

### 2. Base de données Neon
- Créez une base de données sur [neon.tech](https://neon.tech)
- Notez l'URL de connexion PostgreSQL

---

## 🔧 Configuration Vercel

### Étape 1 : Importer le Projet
1. Connectez-vous à [vercel.com](https://vercel.com)
2. Cliquez sur "Add New" → "Project"
3. Importez le repository GitHub : `doriansarry47-creator/planning`
4. Branche à déployer : **main**

### Étape 2 : Configuration du Build
Vercel détectera automatiquement :
- **Framework Preset** : `Other` (ou laissez vide)
- **Build Command** : `npm run build` (déjà configuré dans vercel.json)
- **Output Directory** : `dist` (déjà configuré dans vercel.json)
- **Install Command** : `npm ci` (déjà configuré dans vercel.json)
- **Node.js Version** : `20.x` (défini dans package.json)

### Étape 3 : Variables d'Environnement

Ajoutez ces variables dans Vercel Dashboard → Settings → Environment Variables :

#### Variables Essentielles (OBLIGATOIRES)
```bash
# Base de données Neon
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require

# Sécurité JWT
JWT_SECRET=votre-cle-secrete-super-longue-et-complexe-minimum-32-caracteres
SESSION_SECRET=votre-cle-session-secrete-super-longue-et-complexe-minimum-32-caracteres

# URL Frontend (Vercel assignera automatiquement)
VITE_FRONTEND_URL=https://votre-app.vercel.app

# API URL pour le client
VITE_API_URL=/api
```

#### Variables Optionnelles (Pour notifications)
```bash
# Email SMTP (si vous voulez les notifications email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=doriansarry@yahoo.fr
SMTP_PASS=votre-mot-de-passe-application

# SMS Twilio (si vous voulez les notifications SMS)
TWILIO_ACCOUNT_SID=votre-account-sid
TWILIO_AUTH_TOKEN=votre-auth-token
TWILIO_PHONE_NUMBER=votre-numero-twilio

# Sécurité Cron
CRON_SECRET=votre-secret-cron-pour-taches-automatiques
```

### Étape 4 : Déploiement
1. Cliquez sur "Deploy"
2. Vercel va :
   - ✅ Installer les dépendances (`npm ci`)
   - ✅ Builder l'application (`npm run build`)
   - ✅ Déployer sur l'infrastructure serverless
   - ✅ Générer une URL de production

---

## 🗄️ Initialisation de la Base de Données

Une fois l'application déployée, initialisez la base de données :

### Option 1 : Via l'Interface Admin (Recommandé)
1. Accédez à : `https://votre-app.vercel.app/api/init-db`
2. Cette route créera automatiquement :
   - ✅ Toutes les tables
   - ✅ L'admin super_admin avec email `doriansarry@yahoo.fr`
   - ✅ Mot de passe par défaut : `DoraineAdmin2024!`

### Option 2 : Via Scripts Locaux
```bash
# Depuis votre machine locale avec les variables d'environnement configurées
npm run db:setup
```

---

## 🔐 Premier Accès Admin

### 1. Connexion Admin
- URL : `https://votre-app.vercel.app/login/admin`
- Email : `doriansarry@yahoo.fr`
- Mot de passe : `DoraineAdmin2024!`

### 2. ⚠️ IMPORTANT : Changez le mot de passe
Après la première connexion :
1. Allez dans Paramètres → Profil
2. Changez immédiatement le mot de passe par défaut

---

## 📱 Structure de l'Application

### Pour les Patients
- **Page d'accueil** : `https://votre-app.vercel.app/`
- **Inscription** : `https://votre-app.vercel.app/patient/register`
- **Connexion** : `https://votre-app.vercel.app/login/patient`
- **Dashboard** : `https://votre-app.vercel.app/patient/dashboard`
- **Prise de RDV** : `https://votre-app.vercel.app/patient/book-appointment`

### Pour l'Admin (Dorian Sarry)
- **Connexion** : `https://votre-app.vercel.app/login/admin`
- **Dashboard** : `https://votre-app.vercel.app/admin/dashboard`
- Gestion complète :
  - 📅 Rendez-vous
  - 👥 Patients
  - 📊 Statistiques
  - 📝 Notes thérapeutiques
  - ⏰ Disponibilités

---

## 🔍 Vérification du Déploiement

### Tests à Effectuer

#### 1. Test de Santé de l'API
```bash
curl https://votre-app.vercel.app/api/health
# Réponse attendue : { "success": true, "message": "API is healthy" }
```

#### 2. Test de l'Interface Patient
- Ouvrez : `https://votre-app.vercel.app/`
- Vérifiez que la page d'accueil s'affiche correctement

#### 3. Test de l'Interface Admin
- Ouvrez : `https://votre-app.vercel.app/login/admin`
- Connectez-vous avec les identifiants par défaut

---

## 🐛 Résolution de Problèmes

### Erreur : "Build Failed"
**Solution** : Vérifiez les logs Vercel
1. Allez dans Vercel Dashboard → Deployments
2. Cliquez sur le déploiement échoué
3. Consultez les logs pour identifier l'erreur

### Erreur : "DATABASE_URL is required"
**Solution** : Ajoutez la variable d'environnement
1. Vercel Dashboard → Settings → Environment Variables
2. Ajoutez `DATABASE_URL` avec votre URL Neon

### Erreur : "API Routes not working"
**Solution** : Vérifiez vercel.json
- Le fichier `vercel.json` doit contenir les règles de réécriture pour `/api/*`
- ✅ Déjà configuré dans ce projet

### Erreur : "Cannot connect to database"
**Solution** : Vérifiez la base de données Neon
1. Allez sur neon.tech
2. Vérifiez que la base de données est active
3. Vérifiez que l'URL de connexion est correcte
4. Testez avec `?sslmode=require` dans l'URL

---

## 📊 Monitoring

### Logs Vercel
- Accédez aux logs en temps réel dans Vercel Dashboard
- Filtrez par type : Build, Edge, Serverless

### Métriques
Vercel fournit automatiquement :
- 📈 Trafic et requêtes
- ⚡ Performance et temps de réponse
- 🚨 Taux d'erreurs
- 📊 Usage des fonctions serverless

---

## 🔄 Déploiements Continus

### Déploiement Automatique
Chaque push sur la branche `main` déclenche automatiquement :
1. 🔨 Build de l'application
2. ✅ Tests (si configurés)
3. 🚀 Déploiement en production

### Déploiement Preview
Chaque Pull Request crée automatiquement :
- 🔍 Une URL de preview unique
- 🧪 Environnement de test isolé
- ✅ Validation avant merge

---

## 🎯 Checklist de Déploiement

- [ ] Repository importé dans Vercel
- [ ] Variables d'environnement configurées (DATABASE_URL, JWT_SECRET)
- [ ] Base de données Neon créée et accessible
- [ ] Premier déploiement réussi
- [ ] Base de données initialisée (via /api/init-db)
- [ ] Connexion admin testée
- [ ] Mot de passe admin changé
- [ ] Page d'accueil patient accessible
- [ ] Formulaire d'inscription patient fonctionnel
- [ ] API endpoints testés

---

## 📚 Ressources

- **Documentation Vercel** : [vercel.com/docs](https://vercel.com/docs)
- **Documentation Neon** : [neon.tech/docs](https://neon.tech/docs)
- **Support Vercel** : [vercel.com/support](https://vercel.com/support)

---

## 🎉 Félicitations !

Votre application de gestion de thérapie sensorimotrice est maintenant déployée et accessible en production ! 

**URL de Production** : `https://votre-app.vercel.app`

---

*Dernière mise à jour : 27 octobre 2025*
*Build testé et validé : ✅*
