# Guide de Déploiement Vercel 🚀

Ce guide explique comment déployer l'application Planning avec les nouvelles fonctionnalités EasyAppointments sur Vercel.

## 📋 Prérequis

- Compte Vercel (gratuit ou payant)
- Base de données MySQL/PostgreSQL configurée
- Compte Google Cloud (pour Google Calendar API)
- Repository GitHub avec le code

## 🔧 Configuration Vercel

### 1. Variables d'Environnement

Configurer les variables suivantes dans le dashboard Vercel :

```env
# Base de données
DATABASE_URL=mysql://user:password@host:port/database

# Google Calendar API
GOOGLE_API_KEY=your_google_api_key_here

# Environnement
NODE_ENV=production

# OAuth Owner (pour le premier admin)
OWNER_OPENID=your_oauth_id_here
```

### 2. Build Configuration

Le projet est déjà configuré avec `vercel.json` :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📦 Étapes de Déploiement

### 1. Déploiement Initial

```bash
# Installer Vercel CLI (si pas déjà fait)
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer en production
vercel --prod
```

### 2. Déploiement Automatique (Recommandé)

1. Connecter votre repository GitHub à Vercel
2. Configurer les branches :
   - **Production** : `main`
   - **Preview** : toutes les autres branches
3. Chaque push sur `main` déclenchera un déploiement automatique

### 3. Migrations de Base de Données

**⚠️ Important** : Exécuter les migrations avant le déploiement !

```bash
# En local avec DATABASE_URL de production
npm run db:push
```

Ou configurer un script de build qui inclut les migrations :

```json
{
  "scripts": {
    "build": "npm run db:push && vite build",
    "build:vercel": "vite build"
  }
}
```

## 🗄️ Configuration Base de Données

### Option 1 : PlanetScale (Recommandé)

1. Créer une base de données sur [PlanetScale](https://planetscale.com/)
2. Obtenir la connection string
3. Ajouter dans Vercel env vars

```env
DATABASE_URL=mysql://user:password@aws.connect.psdb.cloud/database?ssl={"rejectUnauthorized":true}
```

### Option 2 : Neon (PostgreSQL)

Si vous préférez PostgreSQL :

1. Créer une base sur [Neon](https://neon.tech/)
2. Adapter le schema.ts pour PostgreSQL
3. Utiliser `drizzle-orm/neon-http`

### Option 3 : MySQL Classique

Utiliser un provider MySQL traditionnel :
- Railway
- DigitalOcean
- AWS RDS

## 🔐 Sécurité

### Variables Sensibles

Ne JAMAIS commiter :
- `DATABASE_URL`
- `GOOGLE_API_KEY`
- `OWNER_OPENID`
- Tokens secrets

Utiliser le `.env.example` comme template.

### HTTPS

Vercel fournit automatiquement :
- Certificat SSL gratuit
- HTTPS obligatoire
- Domaine custom supporté

## 📊 Monitoring

### 1. Logs Vercel

Accéder aux logs en temps réel :
```bash
vercel logs
```

Ou via le dashboard Vercel :
- Functions logs
- Build logs
- Edge logs

### 2. Analytics

Activer Vercel Analytics :
1. Aller dans Settings → Analytics
2. Activer Web Analytics
3. Voir les métriques en temps réel

### 3. Performance Monitoring

Activer Speed Insights :
1. Settings → Speed Insights
2. Activer pour voir les Core Web Vitals
3. Optimiser selon les recommandations

## 🚀 Optimisations

### 1. Build Optimization

Déjà configuré dans `vite.config.ts` :
- Code splitting
- Tree shaking
- Minification
- Chunk optimization

### 2. Caching

Configurer headers de cache dans `vercel.json` :

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. Edge Functions

Pour améliorer les performances, considérer :
- Edge Middleware pour l'auth
- Edge Functions pour les APIs légères

## 🔄 CI/CD Workflow

### Workflow Recommandé

1. **Development**
   - Branche : `develop` ou feature branches
   - Auto-déployé en Preview
   - Tests automatiques

2. **Staging**
   - Branche : `staging`
   - Preview deployment
   - Tests E2E

3. **Production**
   - Branche : `main`
   - Production deployment
   - Monitoring actif

### GitHub Actions (Optionnel)

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Deploy to Production
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 🐛 Troubleshooting

### Erreur : "Module not found"

**Solution** : Vérifier les imports dans `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["client/src/*"],
      "@shared/*": ["shared/*"]
    }
  }
}
```

### Erreur : "Database connection failed"

**Solutions** :
1. Vérifier `DATABASE_URL` dans env vars
2. Autoriser l'IP de Vercel dans votre DB
3. Vérifier les credentials

### Erreur : "Build failed"

**Solutions** :
1. Vérifier les logs de build
2. Tester le build en local : `npm run build`
3. Vérifier les dépendances dans `package.json`

### Preview Deployment Fails

**Solutions** :
1. Vérifier les env vars pour Preview
2. S'assurer que les migrations sont à jour
3. Check les logs de build

## 📈 Après le Déploiement

### 1. Vérifications Post-Déploiement

- [ ] Site accessible via HTTPS
- [ ] API endpoints fonctionnels
- [ ] Connexion base de données OK
- [ ] Google Calendar sync actif
- [ ] Authentification fonctionnelle
- [ ] Admin dashboard accessible

### 2. Tests Fonctionnels

Tester les flux critiques :

1. **Réservation** (`/book`)
   - Sélection service/praticien
   - Choix date et heure
   - Confirmation
   - Vérifier hash d'annulation

2. **Admin** (`/admin`)
   - Login admin
   - Création de service
   - Gestion des rendez-vous
   - Logs d'activité

3. **API**
   ```bash
   # Test endpoint services
   curl https://your-app.vercel.app/api/services/list
   
   # Test endpoint appointments
   curl https://your-app.vercel.app/api/appointments/getAll
   ```

### 3. Configuration Google Calendar

Si pas déjà fait, suivre `GOOGLE_CALENDAR_SETUP.md` :
1. Créer projet Google Cloud
2. Activer Calendar API
3. Créer credentials OAuth
4. Tester la synchronisation

### 4. Monitoring Continu

Configurer les alertes :
- Erreurs 500
- Temps de réponse > 2s
- Uptime monitoring
- Database connections

## 🎯 Production Checklist

Avant de déployer en production :

- [ ] Migrations DB exécutées
- [ ] Env vars configurées
- [ ] Build teste en local
- [ ] Tests E2E passés
- [ ] Documentation à jour
- [ ] Backup DB configuré
- [ ] Monitoring actif
- [ ] SSL/HTTPS actif
- [ ] Domain configuré (optionnel)
- [ ] Analytics configurées

## 🔗 Liens Utiles

- [Vercel Documentation](https://vercel.com/docs)
- [Deployment Guide](https://vercel.com/docs/deployments/overview)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

## 📞 Support

En cas de problème :
1. Consulter les logs Vercel
2. Vérifier la documentation
3. Créer une issue sur GitHub
4. Contacter le support Vercel

---

**Dernière mise à jour** : 2025-11-15  
**Version** : 1.0.0  
**Auteur** : GenSpark AI Developer
