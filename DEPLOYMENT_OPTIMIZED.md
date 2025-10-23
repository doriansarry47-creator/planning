# 🚀 Guide de Déploiement Optimisé - MedPlan v3.0

## 📋 Pré-requis

- Node.js 20.x
- Compte Vercel
- Base de données PostgreSQL (Neon recommandé)
- Git configuré

## 🔧 Installation et Configuration Locale

### 1. Cloner et Installer

```bash
# Cloner le repository
git clone <votre-repo>
cd medplan-vercel

# Installer les dépendances
npm install
```

### 2. Configuration de l'Environnement

Créez un fichier `.env` :

```env
# Base de données Neon PostgreSQL
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# JWT & Sécurité (générez des clés uniques en production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
SESSION_SECRET="your-super-secret-session-key-change-in-production"

# Configuration email SMTP (optionnel)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-mot-de-passe-app"

# Configuration SMS Twilio (optionnel)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# URLs
VITE_FRONTEND_URL="http://localhost:5173"

# Sécurité pour les tâches cron
CRON_SECRET="your-secure-cron-secret-key"

# Environnement
NODE_ENV="development"

# API
VITE_API_URL="/api"
```

### 3. Initialisation de la Base de Données

```bash
# Migrer le schéma de base de données
npm run db:migrate

# Créer le compte super admin
npm run db:init-admin

# Ou faire les deux en une commande
npm run db:setup
```

**Compte Super Admin créé:**
- Email: `admin@medplan.fr`
- Mot de passe: `Admin2024!Secure`
- Rôle: `super_admin`
- Permissions: `all`

⚠️ **IMPORTANT:** Changez ce mot de passe après la première connexion!

### 4. Tester Localement

```bash
# Démarrer le serveur de développement
npm run dev

# Dans un autre terminal, lancer les tests
npm run test:user
```

L'application sera accessible sur `http://localhost:5173`

## 🌐 Déploiement sur Vercel

### 1. Préparation

```bash
# Construire l'application
npm run build

# Vérifier que tout fonctionne
npm run preview
```

### 2. Installer Vercel CLI

```bash
npm install -g vercel
```

### 3. Se Connecter à Vercel

```bash
vercel login
```

### 4. Configuration des Variables d'Environnement

Dans le dashboard Vercel, ajoutez les variables d'environnement :

**Variables Obligatoires:**
- `DATABASE_URL` - URL de votre base de données PostgreSQL Neon
- `JWT_SECRET` - Clé secrète pour les tokens JWT (générez une clé unique!)
- `SESSION_SECRET` - Clé secrète pour les sessions (générez une clé unique!)

**Variables Optionnelles:**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Configuration email
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - Configuration SMS
- `CRON_SECRET` - Clé secrète pour les tâches cron

**Génération de clés sécurisées:**
```bash
# Générer des clés aléatoires sécurisées
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Déployer

```bash
# Déploiement en production
vercel --prod
```

### 6. Configuration Post-Déploiement

Après le déploiement, exécutez les scripts d'initialisation :

```bash
# Se connecter à votre instance Vercel
vercel env pull .env.production

# Migrer la base de données de production
npm run db:migrate

# Créer le compte super admin en production
npm run db:init-admin
```

## ✅ Vérification du Déploiement

### 1. Tests d'Acceptation

Configurez l'URL de production dans le fichier de test et exécutez :

```bash
# Modifier l'URL dans tests/user-acceptance-test.ts
# API_BASE_URL = 'https://votre-domaine.vercel.app/api'

npm run test:user
```

### 2. Tests Manuels

**Test Admin:**
1. Accédez à `https://votre-domaine.vercel.app/login/admin`
2. Connectez-vous avec :
   - Email: `admin@medplan.fr`
   - Mot de passe: `Admin2024!Secure`
3. Vérifiez le dashboard admin

**Test Patient:**
1. Accédez à `https://votre-domaine.vercel.app/patient/register`
2. Créez un nouveau compte patient
3. Connectez-vous et testez la prise de rendez-vous

## 🔒 Sécurité Post-Déploiement

### 1. Changement du Mot de Passe Admin

```bash
# Créer un script pour changer le mot de passe
# update-admin-password.ts existe déjà dans le projet
npm run db:reset-admin
```

### 2. Configuration des Headers de Sécurité

Le fichier `vercel.json` inclut déjà les headers de sécurité :
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Content-Security-Policy

### 3. Surveillance

Configurez des alertes Vercel pour :
- Erreurs 500
- Temps de réponse élevés
- Utilisation excessive de la bande passante

## 📊 Monitoring et Maintenance

### Logs Vercel

```bash
# Voir les logs en temps réel
vercel logs --follow
```

### Base de Données

- Surveillez l'utilisation de votre base Neon
- Configurez des sauvegardes automatiques
- Optimisez les requêtes lentes

### Performance

- Utilisez Vercel Analytics pour suivre les performances
- Configurez un CDN pour les assets statiques
- Optimisez les images et les bundles JavaScript

## 🐛 Dépannage

### Erreur de Connexion à la Base de Données

```bash
# Vérifier la connexion
npm run db:check
```

### Erreur de Build Vercel

1. Vérifiez les types TypeScript : `npm run build`
2. Vérifiez les dépendances : `npm install`
3. Vérifiez la configuration Node.js dans `package.json` : `"node": "20.x"`

### Erreur d'Authentification

1. Vérifiez que `JWT_SECRET` est défini dans Vercel
2. Vérifiez que les tokens ne sont pas expirés
3. Vérifiez les CORS dans `api/_routes/`

## 📈 Optimisations

### Performance Frontend

- ✅ Lazy loading des composants
- ✅ Code splitting automatique
- ✅ React Query avec cache optimisé
- ✅ Compression gzip automatique par Vercel

### Performance Backend

- ✅ Connection pooling PostgreSQL
- ✅ Serverless functions optimisées
- ✅ Validation Zod efficace
- ✅ Indexes sur la base de données

### SEO et Accessibilité

- ✅ Meta tags optimisés
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Performance Lighthouse > 90

## 🎯 Fonctionnalités Principales

### Système d'Administration

- ✅ Authentification sécurisée avec gestion des tentatives
- ✅ Système de rôles et permissions (super_admin, admin, moderator)
- ✅ Verrouillage automatique du compte après 5 tentatives échouées
- ✅ Suivi de la dernière connexion
- ✅ Dashboard complet avec statistiques en temps réel
- ✅ Gestion des rendez-vous avec filtres avancés
- ✅ Gestion des patients
- ✅ Export de données

### Système Patient

- ✅ Inscription sécurisée avec questionnaire d'accueil
- ✅ Prise de rendez-vous en ligne (cabinet ou visio)
- ✅ Dashboard personnel
- ✅ Historique des consultations
- ✅ Gestion du profil

### Sécurité

- ✅ JWT avec expiration
- ✅ Mots de passe hashés avec bcrypt (salt 12)
- ✅ Validation des données avec Zod
- ✅ Protection CSRF
- ✅ Headers de sécurité
- ✅ Rate limiting sur les tentatives de connexion

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour améliorer l'expérience patient et faciliter la gestion des cabinets médicaux.**
