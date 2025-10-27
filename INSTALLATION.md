# Guide d'Installation et Configuration

## 🎯 Vue d'ensemble

Cette application est une solution complète de gestion de rendez-vous médicaux optimisée pour Cloudflare Pages avec backend Hono et base de données PostgreSQL Neon.

## 📋 Prérequis

- Node.js 18+ installé
- Compte Cloudflare (pour le déploiement)
- Base de données PostgreSQL (Neon recommandé)
- Git installé

## 🚀 Installation Rapide

### 1. Cloner le repository

```bash
git clone https://github.com/doriansarry47-creator/planning.git
cd planning
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la base de données PostgreSQL

#### Option A: Base de données existante (Neon)

Vous avez déjà la connexion PostgreSQL fournie:
```
postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### Option B: Créer une nouvelle base de données Neon

1. Créer un compte sur [Neon](https://neon.tech)
2. Créer un nouveau projet
3. Copier l'URL de connexion PostgreSQL
4. Remplacer dans `.dev.vars`

### 4. Initialiser la base de données

Exécutez le script SQL d'initialisation pour créer toutes les tables:

#### Méthode 1: Via psql

```bash
# Avec l'URL de connexion complète
psql "postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" -f init-db.sql
```

#### Méthode 2: Via l'interface Neon

1. Se connecter sur [console.neon.tech](https://console.neon.tech)
2. Aller dans votre projet
3. Ouvrir le SQL Editor
4. Copier/coller le contenu de `init-db.sql`
5. Exécuter le script

#### Méthode 3: Via un client PostgreSQL (DBeaver, pgAdmin)

1. Ouvrir votre client PostgreSQL
2. Créer une nouvelle connexion avec les paramètres:
   - Host: `ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech`
   - Port: `5432`
   - Database: `neondb`
   - User: `neondb_owner`
   - Password: `npg_1zDVUWYjNB4s`
   - SSL: `require`
3. Ouvrir et exécuter `init-db.sql`

### 5. Configurer les variables d'environnement

Créer un fichier `.dev.vars` à la racine du projet:

```bash
# .dev.vars
DATABASE_URL=postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-please
```

**⚠️ Important**: 
- Ne JAMAIS committer `.dev.vars` dans git (déjà dans .gitignore)
- Changer le `JWT_SECRET` en production
- Utiliser un générateur de secrets: `openssl rand -base64 32`

### 6. Tester en local

```bash
# Build l'application
npm run build

# Lancer avec wrangler
npm run dev:sandbox

# Ou avec PM2 (recommandé pour le sandbox)
pm2 start ecosystem.config.cjs

# Tester
curl http://localhost:3000
```

L'application devrait être accessible sur http://localhost:3000

## 🔐 Identifiants par défaut

Après l'initialisation de la base de données, un compte administrateur est créé:

- **Email**: admin@example.com
- **Mot de passe**: admin123

**⚠️ IMPORTANT**: Changez ce mot de passe immédiatement en production !

### Changer le mot de passe admin

Pour générer un nouveau hash de mot de passe:

```javascript
// Node.js
const bcrypt = require('bcryptjs');
const newPassword = 'VotreNouveauMotDePasseSecurise123!';
const hash = bcrypt.hashSync(newPassword, 10);
console.log(hash);
```

Puis mettre à jour dans la base de données:

```sql
UPDATE admins 
SET password = 'le-hash-généré' 
WHERE email = 'admin@example.com';
```

## 🌐 Déploiement sur Cloudflare Pages

### 1. Prérequis

- Compte Cloudflare
- Wrangler CLI installé: `npm install -g wrangler`

### 2. Authentification Cloudflare

```bash
wrangler login
```

### 3. Créer le projet Cloudflare Pages

```bash
npx wrangler pages project create webapp --production-branch main
```

### 4. Configurer les secrets de production

```bash
# Configurer DATABASE_URL
npx wrangler pages secret put DATABASE_URL --project-name webapp
# Coller l'URL PostgreSQL quand demandé

# Configurer JWT_SECRET
npx wrangler pages secret put JWT_SECRET --project-name webapp
# Coller votre secret JWT quand demandé (généré avec openssl rand -base64 32)
```

### 5. Déployer

```bash
# Build et déployer
npm run deploy

# Ou manuellement
npm run build
npx wrangler pages deploy dist --project-name webapp
```

### 6. Configuration DNS (optionnel)

Pour utiliser un domaine personnalisé:

```bash
npx wrangler pages domain add votredomaine.com --project-name webapp
```

## 📊 Structure de la Base de Données

Le script `init-db.sql` crée les tables suivantes:

### Tables principales

1. **admins** - Comptes administrateurs
   - Authentification avec bcrypt
   - Gestion des rôles et permissions
   - Protection contre les tentatives de connexion répétées

2. **patients** - Profils patients
   - Informations personnelles
   - Questionnaire médical d'accueil
   - Préférences de consultation

3. **appointments** - Rendez-vous
   - Lien patient/praticien
   - Statuts: pending, confirmed, cancelled, completed
   - Types: cabinet, visio
   - Notes thérapeutiques

4. **availability_slots** - Créneaux de disponibilité
   - Configuration des horaires
   - Créneaux récurrents
   - Durées personnalisables

5. **notes** - Notes de suivi
   - Notes privées du thérapeute
   - Historique par patient
   - Date de session

6. **unavailabilities** - Indisponibilités
   - Congés et fermetures
   - Périodes personnalisées

### Index pour performance

Le script crée automatiquement des index sur:
- Emails (patients, admins)
- IDs de patients dans appointments et notes
- Dates de rendez-vous
- Statuts de rendez-vous

## 🔧 Maintenance et Opérations

### Backup de la base de données

```bash
# Via pg_dump
pg_dump "postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" > backup_$(date +%Y%m%d).sql
```

### Nettoyage des anciennes données

```sql
-- Supprimer les rendez-vous annulés de plus de 6 mois
DELETE FROM appointments 
WHERE status = 'cancelled' 
AND created_at < NOW() - INTERVAL '6 months';

-- Supprimer les créneaux passés
DELETE FROM availability_slots 
WHERE date < CURRENT_DATE - INTERVAL '1 month' 
AND is_available = true;
```

### Monitoring

```sql
-- Statistiques générales
SELECT 
  (SELECT COUNT(*) FROM patients) as total_patients,
  (SELECT COUNT(*) FROM appointments) as total_appointments,
  (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pending,
  (SELECT COUNT(*) FROM appointments WHERE status = 'confirmed') as confirmed;

-- Rendez-vous par mois
SELECT 
  DATE_TRUNC('month', date) as month,
  COUNT(*) as total_appointments,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
FROM appointments
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC
LIMIT 6;
```

## 🐛 Dépannage

### Problème: L'application ne démarre pas

```bash
# Vérifier les logs PM2
pm2 logs webapp

# Redémarrer
pm2 restart webapp

# Nettoyer et redémarrer
pm2 delete webapp
npm run build
pm2 start ecosystem.config.cjs
```

### Problème: Erreur de connexion à la base de données

1. Vérifier que `.dev.vars` existe et contient la bonne `DATABASE_URL`
2. Tester la connexion PostgreSQL:
   ```bash
   psql "postgresql://..." -c "SELECT 1;"
   ```
3. Vérifier que les tables sont créées:
   ```bash
   psql "postgresql://..." -c "\dt"
   ```

### Problème: Erreur JWT

- Vérifier que `JWT_SECRET` est défini dans `.dev.vars`
- Minimum 32 caractères recommandé
- Regénérer avec: `openssl rand -base64 32`

### Problème: Port 3000 déjà utilisé

```bash
# Nettoyer le port
npm run clean-port

# Ou manuellement
fuser -k 3000/tcp
```

## 📚 Ressources

- [Documentation Hono](https://hono.dev/)
- [Documentation Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Documentation Neon PostgreSQL](https://neon.tech/docs)
- [Documentation Drizzle ORM](https://orm.drizzle.team/)
- [Documentation Wrangler](https://developers.cloudflare.com/workers/wrangler/)

## 🆘 Support

Pour toute question ou problème:
1. Vérifier ce guide d'installation
2. Consulter le README.md
3. Vérifier les logs: `pm2 logs webapp`
4. Contacter l'administrateur

---

**Dernière mise à jour**: 2025-10-27
