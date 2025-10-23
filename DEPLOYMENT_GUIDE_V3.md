# 🚀 Guide de Déploiement MedPlan v3.0 sur Vercel

## 📋 Pré-requis

### Comptes nécessaires
1. **Compte Vercel** : https://vercel.com/signup
2. **Base de données Neon** : https://neon.tech (recommandé pour Vercel)
3. **Compte Twilio** (optionnel pour SMS) : https://www.twilio.com
4. **Compte email SMTP** : Gmail, Yahoo, ou autre

### Outils locaux
- Node.js 18+ installé
- Git installé
- Vercel CLI : `npm install -g vercel`

---

## 📝 Étape 1 : Préparation du Projet

### 1.1 Cloner et Installer

```bash
# Si pas déjà fait
git clone <votre-repo>
cd medplan-vercel

# Installer les dépendances
npm install
```

### 1.2 Vérifier la Configuration

Vérifiez que les fichiers suivants existent :
- ✅ `vercel.json` - Configuration Vercel
- ✅ `package.json` - Dépendances Node.js
- ✅ `vite.config.ts` - Configuration Vite
- ✅ `shared/schema.ts` ou `shared/schema-enhanced.ts` - Schéma DB

---

## 🗄️ Étape 2 : Configuration de la Base de Données

### 2.1 Créer une base Neon PostgreSQL

1. Aller sur https://neon.tech
2. Créer un nouveau projet
3. Copier l'URL de connexion (format : `postgresql://user:pass@host/db?sslmode=require`)

### 2.2 Initialiser le schéma

```bash
# Créer un fichier .env local
cp .env.example .env

# Éditer .env et ajouter votre DATABASE_URL
DATABASE_URL="postgresql://..."

# Lancer les migrations (si vous avez Drizzle configuré)
npx drizzle-kit push:pg
```

### 2.3 Créer les comptes admin initiaux

```bash
# Script pour créer l'admin Dorian Sarry
npm run db:reset-admin
```

---

## ☁️ Étape 3 : Déploiement sur Vercel

### 3.1 Connexion à Vercel

```bash
# Se connecter avec votre compte Vercel
vercel login
```

### 3.2 Configuration du Projet

```bash
# Initialiser le projet Vercel (première fois)
vercel

# Répondre aux questions :
# ? Set up and deploy "~/medplan-vercel"? [Y/n] Y
# ? Which scope do you want to deploy to? <votre-compte>
# ? Link to existing project? [y/N] N
# ? What's your project's name? medplan-app
# ? In which directory is your code located? ./
```

### 3.3 Configuration des Variables d'Environnement

**Option A : Via le Dashboard Vercel** (Recommandé)

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet `medplan-app`
3. Aller dans **Settings** → **Environment Variables**
4. Ajouter les variables suivantes :

```env
# Base de données (OBLIGATOIRE)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Sécurité (OBLIGATOIRE)
JWT_SECRET=votre-clé-jwt-très-sécurisée-min-32-caractères
SESSION_SECRET=votre-clé-session-très-sécurisée-min-32-caractères

# Email SMTP (Recommandé)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=doriansarry@yahoo.fr
SMTP_PASS=votre-mot-de-passe-application

# SMS Twilio (Optionnel)
TWILIO_ACCOUNT_SID=votre-twilio-sid
TWILIO_AUTH_TOKEN=votre-twilio-token
TWILIO_PHONE_NUMBER=+33123456789

# Environnement
NODE_ENV=production
```

**Option B : Via CLI**

```bash
# Ajouter les variables une par une
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add SESSION_SECRET
# ... etc
```

### 3.4 Déploiement en Production

```bash
# Build local pour vérifier
npm run build

# Déployer en production
vercel --prod
```

**Résultat :**
```
✅ Production: https://medplan-app.vercel.app [3s]
```

---

## 🔐 Étape 4 : Configuration de Sécurité

### 4.1 Génération de Secrets Sécurisés

```bash
# Générer des clés secrètes aléatoires
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Utiliser pour JWT_SECRET et SESSION_SECRET
```

### 4.2 Configuration SMTP Gmail (si utilisé)

1. Activer la validation en 2 étapes sur Gmail
2. Générer un "Mot de passe d'application" :
   - Aller dans Paramètres Gmail → Sécurité
   - "Mots de passe des applications"
   - Générer un mot de passe pour "Autre (nom personnalisé)"
3. Utiliser ce mot de passe dans `SMTP_PASS`

### 4.3 Configuration CORS (si nécessaire)

Si vous avez un domaine personnalisé, mettez à jour dans `api/_lib/response.ts` :

```typescript
const allowedOrigins = [
  'https://medplan-app.vercel.app',
  'https://votre-domaine.com'
];
```

---

## 🧪 Étape 5 : Tests Post-Déploiement

### 5.1 Vérifier l'Application

1. **Page d'accueil** : https://medplan-app.vercel.app
   - ✅ Devrait afficher la landing page

2. **Connexion admin** : https://medplan-app.vercel.app/login/admin
   - Email : `admin@medplan.fr`
   - Password : `admin123` (ou celui défini)

3. **API Health Check** : https://medplan-app.vercel.app/api/health
   - ✅ Devrait retourner `{ "status": "ok" }`

### 5.2 Tester les Fonctionnalités

- [ ] Inscription patient
- [ ] Connexion patient
- [ ] Prise de rendez-vous
- [ ] Dashboard admin
- [ ] Gestion des praticiens
- [ ] Envoi d'emails de confirmation
- [ ] SMS de rappel (si configuré)

### 5.3 Vérifier les Logs

```bash
# Voir les logs en temps réel
vercel logs https://medplan-app.vercel.app --follow
```

---

## 🔧 Étape 6 : Configuration Avancée (Optionnel)

### 6.1 Domaine Personnalisé

1. Aller dans **Settings** → **Domains**
2. Ajouter votre domaine : `rdv.medplan-sarry.fr`
3. Configurer les DNS selon les instructions Vercel

### 6.2 Certificat SSL

- Automatique avec Vercel (Let's Encrypt)
- Aucune action requise

### 6.3 Analyse et Monitoring

**Vercel Analytics** (Gratuit)
```bash
# Installer le package
npm install @vercel/analytics

# Ajouter dans src/main.tsx
import { Analytics } from '@vercel/analytics/react';

// Dans le rendu
<Analytics />
```

**Sentry pour Error Tracking** (Optionnel)
```bash
npm install @sentry/react @sentry/tracing
```

### 6.4 Cron Jobs (Rappels Automatiques)

Créer `api/cron/send-reminders.ts` :

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Vérifier le secret CRON
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Logique d'envoi des rappels
  // ...

  res.json({ success: true, sent: 10 });
}
```

Ajouter dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## 📊 Étape 7 : Monitoring et Maintenance

### 7.1 Surveiller les Performances

- **Vercel Dashboard** : Temps de réponse, erreurs, bandwidth
- **Logs** : `vercel logs`
- **Analytics** : Visiteurs, pages vues

### 7.2 Sauvegardes Base de Données

**Neon automatique** : Sauvegardes quotidiennes incluses

**Sauvegarde manuelle** :
```bash
# Exporter la DB
pg_dump $DATABASE_URL > backup.sql

# Restaurer
psql $DATABASE_URL < backup.sql
```

### 7.3 Mises à Jour

```bash
# Mettre à jour les dépendances
npm update

# Vérifier les vulnérabilités
npm audit fix

# Redéployer
vercel --prod
```

---

## 🐛 Dépannage Commun

### Problème : Build Failed

**Erreur TypeScript**
```bash
# Vérifier localement
npm run build

# Corriger les erreurs TS
# Puis redéployer
```

**Dépendances manquantes**
```bash
# Vérifier package.json
npm install
npm run build
```

### Problème : 500 Internal Server Error

**Vérifier les logs**
```bash
vercel logs --follow
```

**Variables d'environnement manquantes**
- Vérifier que `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET` sont définies

**Problème de connexion DB**
- Vérifier que Neon DB est accessible
- Tester la connexion : `psql $DATABASE_URL`

### Problème : CORS Errors

Ajouter votre domaine dans `api/_lib/response.ts` :

```typescript
const allowedOrigins = [
  'https://medplan-app.vercel.app',
  'https://votre-nouveau-domaine.com'
];
```

### Problème : Emails non reçus

**Vérifier SMTP**
```bash
# Tester avec nodemailer localement
node test-email.js
```

**Gmail bloquant**
- Activer "Accès moins sécurisé" (non recommandé)
- Utiliser un "Mot de passe d'application" (recommandé)

---

## 🚀 Checklist de Déploiement

Avant de considérer le déploiement comme terminé :

- [ ] ✅ Base de données Neon créée et accessible
- [ ] ✅ Variables d'environnement configurées sur Vercel
- [ ] ✅ Déploiement réussi (`vercel --prod`)
- [ ] ✅ Page d'accueil accessible
- [ ] ✅ Connexion admin fonctionne
- [ ] ✅ Inscription patient fonctionne
- [ ] ✅ Prise de RDV fonctionne
- [ ] ✅ API répond correctement
- [ ] ✅ Emails de confirmation envoyés
- [ ] 🟡 SMS configurés (optionnel)
- [ ] 🟡 Domaine personnalisé configuré (optionnel)
- [ ] 🟡 Analytics activé (optionnel)
- [ ] 🟡 Cron jobs configurés (optionnel)

---

## 📞 Support

### Documentation
- **Vercel** : https://vercel.com/docs
- **Neon** : https://neon.tech/docs
- **Drizzle ORM** : https://orm.drizzle.team/docs

### Communauté
- **Discord Vercel** : https://vercel.com/discord
- **GitHub Issues** : <votre-repo>/issues

---

## 📈 Prochaines Étapes

Après un déploiement réussi :

1. **Phase 1** (Mois 1-3) : Implémenter les améliorations UX du document `AMELIORATIONS_STRATEGIQUES.md`
2. **Phase 2** (Mois 4-8) : Ajouter fonctionnalités premium (paiement, téléconsultation)
3. **Phase 3** (Mois 9-15) : IA, mobile natif, marketplace

---

**Félicitations ! 🎉 Votre application MedPlan est maintenant en production !**

*Version 3.0 - 23 Octobre 2025*
