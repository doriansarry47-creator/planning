# 🚀 Guide de Déploiement Vercel - Application Planning Médical

## ✅ Statut du Déploiement

**L'application a été déployée avec succès sur Vercel !**

### 📍 URLs de Déploiement

- **URL de Production Principale**: `https://webapp-nfwsh4sfw-ikips-projects.vercel.app`
- **URL de Déploiement Secondaire**: `https://webapp-oco41it58-ikips-projects.vercel.app`
- **Project ID**: `prj_px2UcRuqcze9WorbfxfB563oTSGs`
- **Organisation ID**: `team_u81NHuzzLA66cTYpIrIXjmq0`

### ⚠️ PROBLÈME ACTUEL: Protection de Déploiement Activée

Les URLs ci-dessus sont actuellement protégées par l'authentification Vercel. Pour accéder à l'application, vous devez :

## 🔓 Étapes pour Désactiver la Protection de Déploiement

### Option 1 : Via le Dashboard Vercel (Recommandé)

1. **Se Connecter au Dashboard Vercel**
   - Allez sur https://vercel.com
   - Connectez-vous avec votre compte

2. **Accéder au Projet**
   - Cliquez sur "Projects" dans la barre latérale
   - Sélectionnez le projet "webapp"

3. **Désactiver la Protection**
   - Allez dans "Settings" (⚙️)
   - Cliquez sur "Deployment Protection" dans le menu de gauche
   - Sous "Vercel Authentication", cliquez sur "Edit"
   - Sélectionnez "Only Preview Deployments" ou "Disabled"
   - Cliquez sur "Save"

4. **Redéployer (si nécessaire)**
   - Si la protection ne se désactive pas immédiatement
   - Allez dans l'onglet "Deployments"
   - Cliquez sur le dernier déploiement
   - Cliquez sur "Redeploy"

### Option 2 : Via Vercel CLI

```bash
# Installer Vercel CLI (si pas déjà installé)
npm install -g vercel

# Se connecter
vercel login

# Naviguer vers le projet
cd /path/to/webapp

# Redéployer sans protection
vercel --prod
```

## 🔧 Configuration du Projet

### Variables d'Environnement Configurées

Les variables suivantes sont déjà configurées dans Vercel :

- ✅ `DATABASE_URL` : Connexion PostgreSQL Neon
- ✅ `JWT_SECRET` : Clé secrète pour les tokens JWT

### Build Configuration

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: None (Hono avec adaptateur Vercel)
- **Node.js Version**: 20.x (compatible)

## 📝 Modifications Apportées

### Fichiers Modifiés

1. **`vercel.json`** - Configuration Vercel simplifiée
2. **`src/index.tsx`** - Ajout de l'adaptateur Vercel et correction de syntaxe
3. **`vite.config.ts`** - Configuration du build pour ES modules
4. **`api/[[...route]].ts`** - Adaptateur API pour Vercel (nouveau fichier)

### Changements Techniques

- ✅ Correction des erreurs de syntaxe (triple quotes supprimées)
- ✅ Fix de la fonction async pour création de rendez-vous
- ✅ Adaptation du runtime : Node.js au lieu de Edge (compatibilité crypto/stream)
- ✅ Configuration Vercel optimisée
- ✅ Build réussi et fonctionnel

## 🧪 Tests à Effectuer Après Désactivation de la Protection

### 1. Test de Base

```bash
# Tester la page d'accueil
curl https://webapp-nfwsh4sfw-ikips-projects.vercel.app/

# Tester l'API health check
curl https://webapp-nfwsh4sfw-ikips-projects.vercel.app/api/auth/me
```

### 2. Test de Connexion Admin

```bash
curl -X POST https://webapp-nfwsh4sfw-ikips-projects.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123","userType":"admin"}'
```

### 3. Test de Connexion Patient

1. **S'inscrire** : Ouvrez `https://webapp-nfwsh4sfw-ikips-projects.vercel.app` dans votre navigateur
2. Remplissez le formulaire d'inscription patient
3. Connectez-vous avec vos identifiants

### 4. Test de Prise de Rendez-vous

1. Connectez-vous en tant que patient
2. Accédez au tableau de bord
3. Cliquez sur "Prendre rendez-vous"
4. Sélectionnez un créneau disponible
5. Confirmez le rendez-vous

### 5. Test du Tableau de Bord Admin

1. Connectez-vous en tant qu'admin (admin@example.com / admin123)
2. Vérifiez les statistiques
3. Consultez la liste des patients
4. Gérez les rendez-vous

## 📊 Monitoring et Logs

### Consulter les Logs de Déploiement

1. Dashboard Vercel > Project "webapp" > Deployments
2. Cliquez sur un déploiement pour voir les logs détaillés

### Consulter les Logs d'Exécution

```bash
# Via CLI
vercel logs https://webapp-nfwsh4sfw-ikips-projects.vercel.app

# Ou via Dashboard
Dashboard > Project > Functions (onglet)
```

## 🐛 Dépannage

### Problème : 404 Not Found

**Solution** : Vérifiez que le build a réussi et que les fichiers sont dans `dist/`

### Problème : 500 Internal Server Error

**Causes possibles** :
1. Variables d'environnement mal configurées
2. Erreur de connexion à la base de données
3. Erreur dans le code

**Solution** :
- Consultez les logs dans le Dashboard Vercel
- Vérifiez les variables d'environnement
- Testez la connexion à la base de données

### Problème : CORS Errors

**Solution** : Le CORS est déjà configuré dans `src/index.tsx`. Si le problème persiste, vérifiez la configuration.

## 📚 Ressources Utiles

- [Documentation Vercel](https://vercel.com/docs)
- [Hono Framework](https://hono.dev/)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Deployment Protection Guide](https://vercel.com/docs/security/deployment-protection)

## 🔗 Liens Importants

- **Repository GitHub**: https://github.com/doriansarry47-creator/planning
- **Dashboard Vercel**: https://vercel.com/ikips-projects/webapp
- **URL de Production**: https://webapp-nfwsh4sfw-ikips-projects.vercel.app

## ✅ Checklist Post-Déploiement

- [ ] Désactiver la protection de déploiement Vercel
- [ ] Tester l'accès à la page d'accueil
- [ ] Tester l'inscription d'un patient
- [ ] Tester la connexion admin
- [ ] Tester la prise de rendez-vous
- [ ] Vérifier le tableau de bord admin
- [ ] Configurer un domaine personnalisé (optionnel)
- [ ] Activer les notifications d'erreur
- [ ] Documenter l'URL finale pour les utilisateurs

---

**Date de Déploiement**: 2025-10-30
**Version**: 1.0.0
**Statut**: ✅ Déploiement Réussi - ⚠️ Protection à Désactiver
