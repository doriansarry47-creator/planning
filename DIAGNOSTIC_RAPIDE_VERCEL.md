# Diagnostic Rapide - Erreur 404 Vercel

## ⚡ Actions Immédiates (5 minutes)

### 1. Vérifier l'État du Déploiement

**Via Dashboard Vercel** :
```
https://vercel.com/dashboard
→ Sélectionner le projet "planning"
→ Onglet "Deployments"
→ Vérifier le statut du dernier déploiement
```

**Statuts possibles** :
- 🟢 **Ready** → Application déployée avec succès
- 🟡 **Building** → Build en cours (attendre)
- 🔴 **Error** → Build échoué (voir les logs)
- ⚪ **Queued** → En attente (attendre)

### 2. Vérifier les Logs de Build

**Si status = Error** :
```
Dashboard → Deployments → Cliquer sur le déploiement → "View Build Logs"
```

**Erreurs courantes** :

#### ❌ "Command failed: npm run build"
**Cause** : Erreur de compilation TypeScript ou Vite

**Solution** :
```bash
cd /home/user/webapp
npm run build  # Tester localement
```

Si ça échoue localement, corriger les erreurs avant de redéployer.

#### ❌ "Module not found"
**Cause** : Dépendance manquante dans `package.json`

**Solution** :
```bash
npm install <package-manquant>
git add package.json package-lock.json
git commit -m "fix: ajouter dépendance manquante"
git push
```

#### ❌ "Cannot find module 'api/index.ts'"
**Cause** : Fichier API manquant ou chemin incorrect

**Solution** :
Vérifier que `api/index.ts` existe :
```bash
ls -la /home/user/webapp/api/index.ts
```

### 3. Forcer un Nouveau Build

**Méthode 1 : Via Dashboard**
```
Deployments → Dernier déploiement → "..." → "Redeploy"
→ DÉCOCHER "Use existing Build Cache"
→ Cliquer "Redeploy"
```

**Méthode 2 : Via CLI**
```bash
cd /home/user/webapp
vercel --prod --force
```

---

## 🔍 Diagnostic Approfondi

### Vérifier la Configuration Vercel

**1. Vérifier `vercel.json`** :
```bash
cd /home/user/webapp
cat vercel.json
```

**Doit contenir** :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist",
  ...
}
```

**2. Vérifier que les fichiers sont à jour** :
```bash
git log --oneline -5
```

**Doit montrer** :
```
3f99be7 docs(vercel): ajouter résumé complet
c99d952 docs(vercel): ajouter guide complet
13e99ac fix(vercel): corriger la configuration
```

### Tester le Build Local

**1. Nettoyer et rebuild** :
```bash
cd /home/user/webapp
rm -rf client/dist
npm run build
```

**2. Vérifier les fichiers générés** :
```bash
ls -lh client/dist/
ls -lh client/dist/assets/
```

**Attendu** :
```
client/dist/
├── assets/
│   ├── index-*.css (~99 KB)
│   └── index-*.js (~992 KB)
└── index.html (~0.85 KB)
```

**3. Tester l'API TypeScript** :
```bash
npx tsc --project tsconfig.api.json --noEmit
```

**Attendu** : Aucun output (= pas d'erreur)

---

## 🌐 Vérifier l'Application Déployée

### Si le Déploiement est "Ready"

**1. Ouvrir l'URL Vercel dans le navigateur**
```
https://votre-app.vercel.app
```

**Vérifications** :
- [ ] La page se charge (pas de 404)
- [ ] Pas d'écran blanc
- [ ] Console du navigateur (F12) sans erreurs 404

**2. Tester l'endpoint Health** :
```bash
curl https://votre-app.vercel.app/api/health
```

**Attendu** :
```json
{"status":"ok","timestamp":"2025-11-21T..."}
```

**Si 404** :
- ❌ La fonction serverless n'est pas déployée
- ✅ Redéployer avec `vercel --prod --force`

**3. Vérifier les Assets** :

Ouvrir DevTools (F12) :
- **Console** : Pas d'erreurs 404
- **Network** :
  - `index.html` → 200
  - `index-*.js` → 200
  - `index-*.css` → 200

**Si 404 sur les assets** :
- ❌ `outputDirectory` incorrect dans `vercel.json`
- ✅ Vérifier la configuration et redéployer

---

## 🔧 Solutions Rapides

### Problème : 404 sur la page principale

**Solution 1** : Vérifier `outputDirectory`
```json
// vercel.json
{
  "outputDirectory": "client/dist"  // ← Doit être exactement ça
}
```

**Solution 2** : Forcer un rebuild complet
```bash
vercel --prod --force
```

**Solution 3** : Vérifier les routes
```json
// vercel.json
{
  "routes": [
    {"src": "/api/(.*)", "dest": "/api/index.ts"},
    {"handle": "filesystem"},  // ← IMPORTANT pour servir les assets
    {"src": "/(.*)", "dest": "/index.html"}
  ]
}
```

### Problème : 404 sur /api/*

**Solution 1** : Vérifier que `api/index.ts` existe
```bash
ls -la api/index.ts
```

**Solution 2** : Vérifier la configuration de la fonction
```json
// vercel.json
{
  "functions": {
    "api/index.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**Solution 3** : Vérifier les imports dans `api/index.ts`
```bash
npx tsc --project tsconfig.api.json --noEmit
```

### Problème : Assets (JS/CSS) non chargés

**Solution 1** : Ajouter le filesystem handler
```json
{
  "routes": [
    ...,
    {"handle": "filesystem"},  // ← Ajouter cette ligne
    ...
  ]
}
```

**Solution 2** : Vérifier `index.html`
```bash
cat client/dist/index.html | grep "assets"
```

**Doit contenir** :
```html
<script type="module" crossorigin src="/assets/index-*.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-*.css">
```

---

## 📊 Checklist Complète

### Avant Déploiement
- [ ] `vercel.json` contient `buildCommand` et `outputDirectory`
- [ ] `npm run build` fonctionne localement
- [ ] `npx tsc --project tsconfig.api.json --noEmit` passe
- [ ] Tous les changements sont committés et poussés
- [ ] `api/index.ts` existe et compile sans erreur

### Pendant le Déploiement
- [ ] Build Vercel se termine sans erreur
- [ ] Logs ne montrent pas d'erreurs TypeScript
- [ ] Status passe à "Ready"

### Après Déploiement
- [ ] URL principale accessible (pas de 404)
- [ ] `/api/health` retourne `{"status":"ok"}`
- [ ] Assets (JS/CSS) chargés sans erreur 404
- [ ] Console du navigateur sans erreurs
- [ ] Application React s'affiche correctement

---

## 🆘 Aide d'Urgence

### Si Rien ne Fonctionne

**1. Retour à l'état connu** :
```bash
cd /home/user/webapp
git pull origin main
git log --oneline -1  # Doit montrer: 3f99be7
```

**2. Build propre** :
```bash
rm -rf client/dist node_modules
npm install
npm run build
```

**3. Déploiement forcé** :
```bash
vercel --prod --force --token 1AV6yo1uRL6VT5xPZitq7S5p
```

**4. Vérifier les variables d'environnement** :
```
Dashboard → Projet → Settings → Environment Variables
```

S'assurer que `DATABASE_URL`, `SESSION_SECRET`, etc. sont configurés.

### Contacts et Ressources

- **Vercel Dashboard** : https://vercel.com/dashboard
- **Vercel Status** : https://www.vercel-status.com
- **GitHub Issues** : https://github.com/doriansarry47-creator/planning/issues
- **Logs en temps réel** : `vercel logs --follow`

---

## ⚡ Script de Déploiement Rapide

Un script interactif est disponible :

```bash
cd /home/user/webapp
./deploy-vercel.sh
```

Ce script :
- ✅ Vérifie l'environnement
- ✅ Teste le build local (optionnel)
- ✅ Vérifie Git
- ✅ Déploie sur Vercel
- ✅ Affiche des messages clairs

---

**Mis à jour** : 21 Novembre 2025  
**Version** : 1.0  
**Commits appliqués** : `13e99ac`, `c99d952`, `3f99be7`
