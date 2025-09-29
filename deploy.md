# 🚀 Guide de Déploiement - Application Médicale

## 📋 Prérequis
1. Compte Vercel
2. Base de données PostgreSQL (Neon recommandé)
3. Repository GitHub configuré

## 🔧 Étapes de Déploiement sur Vercel

### 1. Configuration de la Base de Données
- Créez une base de données sur [Neon](https://neon.tech)
- Notez l'URL de connexion PostgreSQL

### 2. Déploiement sur Vercel

#### Option A: Via l'Interface Vercel (Recommandé)
1. Connectez-vous sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub: `https://github.com/doriansarry47-creator/planning`
4. Configurez les variables d'environnement :
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_i84emMYdFacv@ep-fragrant-mountain-ab8sksei-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   JWT_SECRET=medical_app_secret_2024_production
   SESSION_SECRET=medical_session_secret_2024_production
   NODE_ENV=production
   ```
5. Cliquez sur "Deploy"

#### Option B: Via CLI
```bash
# Installer Vercel CLI
npm install -g vercel

# Connexion à Vercel
vercel login

# Déploiement
vercel --prod
```

### 3. Configuration Post-Déploiement

#### Initialiser la Base de Données
Une fois déployé, vous devez créer les tables :
1. Connectez-vous à votre base de données Neon
2. Exécutez les commandes SQL suivantes ou utilisez l'interface Drizzle

#### Créer les Données de Test (Optionnel)
Vous pouvez créer manuellement les comptes de test :

**Administrateur:**
```sql
INSERT INTO users (username, email, password, full_name, role) VALUES 
('admin', 'admin@medical.fr', '$2a$12$hashedpassword', 'Administrateur Principal', 'admin');
```

**Patient de Test:**
```sql  
INSERT INTO patients (email, password, first_name, last_name, phone_number) VALUES 
('patient@test.fr', '$2a$12$hashedpassword', 'Pierre', 'Durand', '06 12 34 56 78');
```

### 4. Variables d'Environnement Détaillées

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL PostgreSQL | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Clé secrète JWT | `votre-secret-jwt-tres-long` |
| `SESSION_SECRET` | Secret de session | `votre-secret-session` |
| `NODE_ENV` | Environnement | `production` |

### 5. Post-Déploiement

#### Vérifications
1. **Santé de l'API** : `https://votre-app.vercel.app/api/health`
2. **Interface** : `https://votre-app.vercel.app`
3. **Connexion Admin** : `https://votre-app.vercel.app/admin/login`
4. **Connexion Patient** : `https://votre-app.vercel.app/patient/login`

#### Configuration Domaine (Optionnel)
1. Dans Vercel Dashboard → Domains
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions

### 6. Surveillance et Maintenance

#### Logs et Monitoring
- Consultez les logs sur Vercel Dashboard
- Configurez des alertes pour les erreurs

#### Mises à Jour
```bash
# Pour déployer une nouvelle version
git add .
git commit -m "Update: description des changements"
git push origin main
# Vercel redéploiera automatiquement
```

## 🔗 URLs de l'Application Déployée

Une fois déployé, votre application sera accessible via :
- **URL principale** : `https://votre-nom-projet.vercel.app`
- **API Health** : `https://votre-nom-projet.vercel.app/api/health`
- **Admin Login** : `https://votre-nom-projet.vercel.app/admin/login`
- **Patient Login** : `https://votre-nom-projet.vercel.app/patient/login`

## 🛠️ Dépannage

### Erreurs Communes
1. **Base de données non connectée** : Vérifiez DATABASE_URL
2. **Erreurs 500** : Consultez les logs Vercel
3. **Authentification échoue** : Vérifiez JWT_SECRET
4. **Build échoue** : Vérifiez les dépendances npm

### Support
- Issues GitHub : [Créer une issue](https://github.com/doriansarry47-creator/planning/issues)
- Documentation Vercel : [vercel.com/docs](https://vercel.com/docs)

---

✅ **Application déployée avec succès !** 
🏥 **Prêt à gérer les rendez-vous médicaux en production !**