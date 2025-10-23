# 🚀 Guide de Déploiement Rapide - MedPlan v3.0

## ⚡ Déploiement en 5 Minutes

### Étape 1 : Push sur GitHub ✅
```bash
git push origin main
```
**✅ FAIT** - Code déjà poussé sur GitHub

### Étape 2 : Configuration Vercel (via Dashboard)

#### 2.1 Connecter le Repository
1. Aller sur https://vercel.com/dashboard
2. Cliquer sur "Add New Project"
3. Importer depuis GitHub : `doriansarry47-creator/planning`
4. Configuration automatique détectée ✅

#### 2.2 Configurer les Variables d'Environnement

**Variables OBLIGATOIRES :**

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
JWT_SECRET=[générer avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
SESSION_SECRET=[générer une autre clé unique]
NODE_ENV=production
```

**Comment générer les clés sécurisées :**
```bash
# Générer JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Générer SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Variables OPTIONNELLES :**
```env
# Email (notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app

# SMS Twilio (notifications)
TWILIO_ACCOUNT_SID=votre-sid
TWILIO_AUTH_TOKEN=votre-token
TWILIO_PHONE_NUMBER=votre-numero

# Sécurité Cron
CRON_SECRET=[générer une clé unique]
```

#### 2.3 Déployer
1. Cliquer sur "Deploy"
2. Attendre 2-3 minutes ⏱️
3. Récupérer l'URL : `https://votre-projet.vercel.app`

### Étape 3 : Configuration de la Base de Données

#### 3.1 Créer une Base Neon (Recommandé)
1. Aller sur https://console.neon.tech/
2. Créer un nouveau projet "MedPlan Production"
3. Copier la connection string (avec SSL)
4. Ajouter dans Vercel : 
   - Dashboard → Settings → Environment Variables
   - Name: `DATABASE_URL`
   - Value: `postgresql://...?sslmode=require`

#### 3.2 Migrer le Schéma
```bash
# Localement, avec DATABASE_URL de production
export DATABASE_URL="postgresql://...?sslmode=require"
npm run db:migrate
```

#### 3.3 Créer le Compte Super Admin
```bash
npm run db:init-admin
```

**Compte créé :**
- Email : `admin@medplan.fr`
- Mot de passe : `Admin2024!Secure`
- Rôle : `super_admin`

⚠️ **CRITIQUE** : Changez ce mot de passe après la première connexion !

### Étape 4 : Tests Post-Déploiement

#### 4.1 Test Connexion Admin
1. Ouvrir : `https://votre-projet.vercel.app/login/admin`
2. Se connecter avec les credentials ci-dessus
3. Vérifier le dashboard

#### 4.2 Test Inscription Patient
1. Ouvrir : `https://votre-projet.vercel.app/patient/register`
2. Créer un compte
3. Se connecter
4. Tester la prise de rendez-vous

#### 4.3 Tests Automatisés
```bash
# Modifier l'URL dans tests/user-acceptance-test.ts
const API_BASE_URL = 'https://votre-projet.vercel.app/api';

# Lancer les tests
npm run test:user
```

### Étape 5 : Sécurité Post-Déploiement ✅

#### Checklist Critique :
- [ ] Mot de passe admin changé
- [ ] JWT_SECRET unique généré
- [ ] SESSION_SECRET unique généré
- [ ] Base de données sauvegardée
- [ ] Monitoring Vercel activé
- [ ] Tests passés avec succès

## 🔧 Commandes Utiles

### Voir les Logs
```bash
# Via Vercel CLI
npx vercel logs --follow --token hIcZzJfKyVMFAGh2QVfMzXc6

# Via Dashboard
https://vercel.com/dashboard → Votre Projet → Logs
```

### Redéployer
```bash
# Automatique sur chaque push
git push origin main

# Manuel
npx vercel --prod --token hIcZzJfKyVMFAGh2QVfMzXc6
```

### Rollback
```bash
# Dashboard → Deployments → Promote to Production
```

## 🐛 Résolution de Problèmes

### Erreur : "DATABASE_URL is not defined"
✅ Solution : Ajouter DATABASE_URL dans Vercel Environment Variables

### Erreur : "JWT_SECRET is required"
✅ Solution : Générer et ajouter JWT_SECRET dans Vercel

### Erreur 500 sur /api
✅ Solution : Vérifier les logs Vercel pour identifier l'erreur

### Build Failed
✅ Solution : Tester `npm run build` localement

## 📊 Performance Attendue

Après déploiement, vous devriez observer :

- ✅ Lighthouse Score > 90
- ✅ Temps de chargement < 2s
- ✅ Time to Interactive < 2.5s
- ✅ API response time < 500ms
- ✅ Bundle initial < 200KB

## 🎯 Fonctionnalités Disponibles

### Admin
- ✅ Dashboard avec statistiques temps réel
- ✅ Gestion des rendez-vous (filtres, confirmation, annulation)
- ✅ Gestion des patients
- ✅ Système de permissions
- ✅ Protection anti-brute force
- ✅ Suivi des connexions

### Patient
- ✅ Inscription sécurisée
- ✅ Prise de rendez-vous (cabinet/visio)
- ✅ Dashboard personnel
- ✅ Historique des consultations
- ✅ Gestion du profil

## 📱 URLs Importantes

- **Homepage** : `https://votre-projet.vercel.app`
- **Admin Login** : `https://votre-projet.vercel.app/login/admin`
- **Patient Register** : `https://votre-projet.vercel.app/patient/register`
- **Patient Login** : `https://votre-projet.vercel.app/login/patient`

## 🔗 Liens Utiles

- **GitHub** : https://github.com/doriansarry47-creator/planning
- **Vercel Dashboard** : https://vercel.com/dashboard
- **Neon Console** : https://console.neon.tech/
- **Documentation** : Voir README_OPTIMIZATION.md

## ✨ C'est Terminé !

Votre application MedPlan v3.0 est maintenant déployée et prête à l'emploi ! 🎉

**Prochaines Étapes :**
1. Changez le mot de passe admin
2. Configurez les notifications (email/SMS)
3. Invitez vos premiers patients
4. Configurez un domaine personnalisé (optionnel)

---

*Besoin d'aide ? Consultez DEPLOYMENT_OPTIMIZED.md ou ouvrez une issue sur GitHub.*
