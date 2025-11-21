# Instructions de Déploiement Vercel - 21 Novembre 2025

## 🎯 Objectif
Déployer l'application de planning sur Vercel après la correction de l'erreur 404.

## ✅ Correctifs Appliqués
- ✅ Configuration `vercel.json` corrigée avec `buildCommand` et `outputDirectory`
- ✅ Compilation TypeScript validée (aucune erreur)
- ✅ Build local testé et fonctionnel
- ✅ Changements committés et poussés sur `main`

## 🚀 Méthodes de Déploiement

### Méthode 1 : Via Vercel CLI (Recommandée)

#### Étape 1 : Installer Vercel CLI (si nécessaire)
```bash
npm install -g vercel
```

#### Étape 2 : Se connecter à Vercel
```bash
vercel login
```
Ou avec le token fourni :
```bash
export VERCEL_TOKEN=1AV6yo1uRL6VT5xPZitq7S5p
vercel --token $VERCEL_TOKEN
```

#### Étape 3 : Déployer en Production
```bash
cd /home/user/webapp
vercel --prod
```

### Méthode 2 : Via GitHub (Auto-déploiement)

Si Vercel est connecté au dépôt GitHub :

1. Les changements ont déjà été poussés sur `main`
2. Vercel détectera automatiquement le push
3. Le build se lancera automatiquement
4. Attendre environ 2-5 minutes

**Vérifier le déploiement** :
- Aller sur : https://vercel.com/dashboard
- Sélectionner le projet "planning"
- Vérifier les logs de build

### Méthode 3 : Via Dashboard Vercel

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet
3. Aller dans "Deployments"
4. Cliquer sur "Redeploy" pour le dernier commit
5. Sélectionner "Use existing Build Cache" : **NON** (pour forcer un nouveau build)
6. Cliquer sur "Redeploy"

## 🔧 Configuration des Variables d'Environnement

Avant que l'application fonctionne complètement, configurer ces variables dans Vercel :

### Variables Essentielles

1. **Base de Données**
   ```
   DATABASE_URL=postgresql://...
   ```

2. **Session & Authentification**
   ```
   SESSION_SECRET=<votre-secret-session>
   ```

3. **Google OAuth (si utilisé)**
   ```
   GOOGLE_CLIENT_ID=<votre-client-id>
   GOOGLE_CLIENT_SECRET=<votre-client-secret>
   GOOGLE_REDIRECT_URI=https://votre-app.vercel.app/api/oauth/callback
   ```

4. **Email (Resend - si utilisé)**
   ```
   RESEND_API_KEY=<votre-clé-resend>
   ```

### Configuration via Dashboard

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet "planning"
3. Aller dans **Settings** → **Environment Variables**
4. Ajouter chaque variable :
   - Name : `DATABASE_URL`
   - Value : `postgresql://...`
   - Environments : ✅ Production, ✅ Preview, ✅ Development
5. Cliquer sur **Save**

### Configuration via CLI

```bash
vercel env add DATABASE_URL production
# Coller la valeur quand demandé

vercel env add SESSION_SECRET production
# Coller la valeur quand demandé
```

## 📊 Vérification du Déploiement

### 1. Vérifier les Logs de Build

```bash
vercel logs <deployment-url>
```

Ou via Dashboard :
- Deployments → Sélectionner le dernier déploiement → "View Function Logs"

### 2. Tester les Endpoints

#### Health Check
```bash
curl https://votre-app.vercel.app/api/health
```

**Attendu** :
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T..."
}
```

#### tRPC Health
```bash
curl https://votre-app.vercel.app/api/trpc/system.health
```

#### Page d'Accueil
Ouvrir dans le navigateur :
```
https://votre-app.vercel.app
```

**Attendu** : Application React se charge, pas de 404

### 3. Vérifier les Assets

Ouvrir les DevTools du navigateur (F12) :
- **Console** : Pas d'erreurs 404 pour les fichiers JS/CSS
- **Network** : Tous les assets chargés avec status 200
- **Sources** : Fichiers `index-*.js` et `index-*.css` présents

## 🐛 Dépannage

### Erreur : "Command failed: npm run build"

**Cause** : Build échoue sur Vercel

**Solution** :
1. Vérifier les logs de build Vercel
2. Tester localement :
   ```bash
   npm run build
   ```
3. Corriger les erreurs TypeScript si présentes

### Erreur : API routes retournent 404

**Cause** : Fonction serverless non déployée

**Solution** :
1. Vérifier que `api/index.ts` est présent dans le dépôt
2. Vérifier la configuration `functions` dans `vercel.json`
3. Redéployer :
   ```bash
   vercel --prod --force
   ```

### Erreur : Assets non chargés (CSS manquant)

**Cause** : Routing incorrect des fichiers statiques

**Solution** :
1. Vérifier que `outputDirectory` est `client/dist`
2. Vérifier la route `"handle": "filesystem"` dans `vercel.json`
3. Forcer un nouveau build complet

### Erreur : Database connection failed

**Cause** : `DATABASE_URL` non configuré ou incorrect

**Solution** :
1. Vérifier les variables d'environnement dans Vercel Dashboard
2. S'assurer que la base de données Postgres est accessible depuis Vercel
3. Tester la connexion avec :
   ```bash
   vercel env pull .env.production
   npm run db:push:postgres
   ```

## 📈 Monitoring Post-Déploiement

### Vercel Analytics

Activer dans Dashboard → Settings → Analytics
- Suivre les performances
- Détecter les erreurs
- Voir les métriques utilisateur

### Logs en Temps Réel

```bash
vercel logs --follow
```

Ou via Dashboard :
- Functions → Sélectionner une fonction → View Logs

## 🎉 Succès du Déploiement

Vous saurez que le déploiement est réussi quand :

✅ Build Vercel se termine sans erreur  
✅ L'URL de l'application se charge (pas de 404)  
✅ Les assets CSS/JS sont chargés  
✅ `/api/health` retourne `{"status":"ok"}`  
✅ L'interface React s'affiche correctement  
✅ Le routing interne fonctionne (navigation entre les pages)  

## 📞 Support

En cas de problème persistant :

1. **Vérifier les logs Vercel** : Dashboard → Deployments → Build Logs
2. **Vérifier la console du navigateur** : F12 → Console
3. **Tester localement** : `npm run build` puis servir `client/dist/`
4. **Forcer un redéploiement** : `vercel --prod --force`

## 🔗 Liens Utiles

- **Dashboard Vercel** : https://vercel.com/dashboard
- **Documentation** : https://vercel.com/docs
- **Status Vercel** : https://www.vercel-status.com
- **GitHub Repo** : https://github.com/doriansarry47-creator/planning

---

**Date** : 21 Novembre 2025  
**Auteur** : GenSpark AI Developer  
**Commit** : `13e99ac` - "fix(vercel): corriger la configuration Vercel pour résoudre l'erreur 404"
