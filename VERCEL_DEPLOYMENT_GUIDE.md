# 🚀 Guide de Déploiement Vercel - MedPlan v3.0

## Token Vercel
Votre token de déploiement : `hIcZzJfKyVMFAGh2QVfMzXc6`

## 📋 Étapes de Déploiement

### 1. Configuration du Token Vercel

```bash
# Définir le token Vercel
export VERCEL_TOKEN="hIcZzJfKyVMFAGh2QVfMzXc6"

# Ou créer un fichier .vercel-token
echo "hIcZzJfKyVMFAGh2QVfMzXc6" > ~/.vercel-token
```

### 2. Installation de Vercel CLI

```bash
npm install -g vercel
```

### 3. Configuration du Projet Vercel

Le fichier `vercel.json` est déjà configuré avec les optimisations suivantes :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type,Authorization" }
      ]
    }
  ]
}
```

### 4. Variables d'Environnement Requises

Avant de déployer, configurez ces variables sur Vercel :

**Variables Obligatoires :**
```bash
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
JWT_SECRET="[générer avec: openssl rand -base64 32]"
SESSION_SECRET="[générer avec: openssl rand -base64 32]"
NODE_ENV="production"
```

**Variables Optionnelles :**
```bash
# Email (si notifications email activées)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="doriansarry@yahoo.fr"
SMTP_PASS="votre-mot-de-passe-app"

# SMS Twilio (si notifications SMS activées)
TWILIO_ACCOUNT_SID="votre-account-sid"
TWILIO_AUTH_TOKEN="votre-auth-token"
TWILIO_PHONE_NUMBER="votre-numero"

# Sécurité Cron
CRON_SECRET="[générer une clé unique]"
```

### 5. Déploiement avec Token

```bash
# Se connecter avec le token
vercel login --token hIcZzJfKyVMFAGh2QVfMzXc6

# Ou définir le token en variable d'environnement
export VERCEL_TOKEN="hIcZzJfKyVMFAGh2QVfMzXc6"

# Déployer en production
vercel --prod --token hIcZzJfKyVMFAGh2QVfMzXc6

# Ou simplement (si le token est en variable d'environnement)
vercel --prod
```

### 6. Configuration Post-Déploiement

Après le déploiement initial :

```bash
# 1. Récupérer les variables d'environnement de production
vercel env pull .env.production --token hIcZzJfKyVMFAGh2QVfMzXc6

# 2. Migrer la base de données
npm run db:migrate

# 3. Initialiser le compte super admin
npm run db:init-admin
```

**Compte Super Admin créé :**
- Email: `admin@medplan.fr`
- Mot de passe: `Admin2024!Secure`
- ⚠️ **Changez ce mot de passe immédiatement après la première connexion !**

### 7. Vérification du Déploiement

```bash
# Vérifier le statut du déploiement
vercel inspect --token hIcZzJfKyVMFAGh2QVfMzXc6

# Voir les logs en temps réel
vercel logs --follow --token hIcZzJfKyVMFAGh2QVfMzXc6

# Lister tous les déploiements
vercel ls --token hIcZzJfKyVMFAGh2QVfMzXc6
```

### 8. Configuration des Variables via CLI

```bash
# Ajouter une variable d'environnement
vercel env add DATABASE_URL production --token hIcZzJfKyVMFAGh2QVfMzXc6

# Lister les variables
vercel env ls --token hIcZzJfKyVMFAGh2QVfMzXc6

# Supprimer une variable
vercel env rm DATABASE_URL production --token hIcZzJfKyVMFAGh2QVfMzXc6
```

## 🔒 Base de Données Neon PostgreSQL

### Configuration Recommandée

1. **Créer une base de données sur Neon** : https://neon.tech/
2. **Copier la connection string** (avec SSL activé)
3. **Configurer dans Vercel** :

```bash
vercel env add DATABASE_URL production --token hIcZzJfKyVMFAGh2QVfMzXc6
# Coller : postgresql://user:password@host/database?sslmode=require
```

### Migration de la Base de Données

Après avoir configuré `DATABASE_URL` :

```bash
# Exécuter les migrations
npm run db:migrate

# Initialiser le super admin
npm run db:init-admin

# Vérifier la connexion
npm run db:check
```

## 🧪 Tests Post-Déploiement

### 1. Test Manuel

**Accès Admin :**
1. Aller sur : `https://votre-domaine.vercel.app/login/admin`
2. Email : `admin@medplan.fr`
3. Mot de passe : `Admin2024!Secure`

**Inscription Patient :**
1. Aller sur : `https://votre-domaine.vercel.app/patient/register`
2. Créer un nouveau compte
3. Tester la prise de rendez-vous

### 2. Tests Automatisés

```bash
# Modifier l'URL de test
# Dans tests/user-acceptance-test.ts :
# const API_BASE_URL = 'https://votre-domaine.vercel.app/api';

# Lancer les tests
npm run test:user
```

## 📊 Monitoring

### Vercel Analytics

Activez Vercel Analytics pour suivre :
- Performance du site
- Temps de chargement
- Erreurs JavaScript
- Utilisation des API

```bash
# Voir les analytics
vercel analytics --token hIcZzJfKyVMFAGh2QVfMzXc6
```

### Logs et Erreurs

```bash
# Logs en temps réel
vercel logs --follow --token hIcZzJfKyVMFAGh2QVfMzXc6

# Logs avec filtre
vercel logs --filter "error" --token hIcZzJfKyVMFAGh2QVfMzXc6
```

## 🔄 Redéploiement

### Déploiement Automatique

Chaque push sur la branche `main` déclenchera automatiquement un nouveau déploiement.

### Déploiement Manuel

```bash
# Déploiement de production
vercel --prod --token hIcZzJfKyVMFAGh2QVfMzXc6

# Déploiement de preview
vercel --token hIcZzJfKyVMFAGh2QVfMzXc6
```

### Rollback

```bash
# Lister les déploiements
vercel ls --token hIcZzJfKyVMFAGh2QVfMzXc6

# Promouvoir un ancien déploiement
vercel promote <deployment-url> --token hIcZzJfKyVMFAGh2QVfMzXc6
```

## 🐛 Dépannage

### Erreur de Build

```bash
# Tester le build localement
npm run build

# Vérifier les logs Vercel
vercel logs --token hIcZzJfKyVMFAGh2QVfMzXc6
```

### Erreur de Base de Données

```bash
# Vérifier la connexion
npm run db:check

# Vérifier les variables d'environnement
vercel env ls production --token hIcZzJfKyVMFAGh2QVfMzXc6
```

### Erreur 500

1. Vérifier les logs : `vercel logs --filter "error"`
2. Vérifier que `JWT_SECRET` est défini
3. Vérifier la connexion à la base de données
4. Vérifier que les migrations sont exécutées

## 🔐 Sécurité

### Changement du Mot de Passe Admin

```bash
npm run db:reset-admin
```

### Rotation des Secrets

1. Générer de nouveaux secrets :
```bash
openssl rand -base64 32
```

2. Mettre à jour sur Vercel :
```bash
vercel env add JWT_SECRET production --token hIcZzJfKyVMFAGh2QVfMzXc6
```

3. Redéployer :
```bash
vercel --prod --token hIcZzJfKyVMFAGh2QVfMzXc6
```

## 📱 Domaine Personnalisé

### Ajouter un Domaine

```bash
# Ajouter un domaine
vercel domains add votredomaine.com --token hIcZzJfKyVMFAGh2QVfMzXc6

# Lister les domaines
vercel domains ls --token hIcZzJfKyVMFAGh2QVfMzXc6
```

### Configuration DNS

Suivez les instructions Vercel pour configurer :
- Record A vers l'IP Vercel
- Record CNAME pour les sous-domaines
- SSL/TLS automatique

## 🎯 Checklist de Déploiement

- [ ] Token Vercel configuré
- [ ] Variables d'environnement définies sur Vercel
- [ ] Base de données Neon créée
- [ ] DATABASE_URL configurée
- [ ] JWT_SECRET et SESSION_SECRET générés
- [ ] Build local réussi (`npm run build`)
- [ ] Déploiement effectué (`vercel --prod`)
- [ ] Migrations de base de données exécutées
- [ ] Compte super admin créé
- [ ] Tests manuels effectués
- [ ] Tests automatisés passés
- [ ] Mot de passe admin changé
- [ ] Monitoring activé
- [ ] Domaine personnalisé configuré (optionnel)

## 📞 Support

**Repository GitHub** : https://github.com/doriansarry47-creator/planning

**Vercel Dashboard** : https://vercel.com/dashboard

**Neon Console** : https://console.neon.tech/

---

✨ **Votre application MedPlan v3.0 est maintenant déployée et prête à être utilisée !** ✨
