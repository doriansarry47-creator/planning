# Instructions de Déploiement Vercel

## Problème Actuel
Le projet est configuré avec Node.js 20.x dans les paramètres Vercel, mais nous avons besoin de changer cela pour que le déploiement fonctionne correctement.

## Solution : Changer la version Node.js dans le Dashboard Vercel

### Étape 1 : Accéder au Dashboard Vercel
1. Allez sur [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Connectez-vous avec votre compte
3. Sélectionnez le projet **webapp** (ikips-projects)

### Étape 2 : Modifier les Settings
1. Cliquez sur l'onglet **Settings** (Paramètres)
2. Dans le menu latéral, cliquez sur **General**
3. Trouvez la section **Node.js Version**
4. Changez de **20.x** à **18.x**
5. Cliquez sur **Save** (Enregistrer)

### Étape 3 : Déclencher un Nouveau Déploiement
Deux options :

**Option A : Via Dashboard Vercel**
1. Allez dans l'onglet **Deployments**
2. Cliquez sur le dernier déploiement
3. Cliquez sur le bouton **⋯** (trois points)
4. Sélectionnez **Redeploy**
5. Confirmez avec **Redeploy**

**Option B : Via Git Push** (Recommandé)
Un push sur la branche `main` déclenchera automatiquement un nouveau déploiement.

## Informations du Projet

- **URL de Production**: https://webapp-ikips-projects.vercel.app (ou similaire)
- **Projet Vercel**: ikips-projects/webapp
- **Repository GitHub**: https://github.com/doriansarry47-creator/planning.git
- **Branche de Production**: main

## Variables d'Environnement Nécessaires

Assurez-vous que ces variables sont configurées dans Vercel Dashboard > Settings > Environment Variables:

- `DATABASE_URL`: URL PostgreSQL Neon
- `JWT_SECRET`: medplan-jwt-secret-key-2024-production
- `SESSION_SECRET`: medplan-session-secret-2024-production
- `NODE_ENV`: production
- `VITE_API_URL`: /api

## Test de l'Application Après Déploiement

### Accès Admin
1. Allez sur `https://votre-url-vercel.vercel.app/login/admin`
2. Email: **doriansarry@yahoo.fr**
3. Mot de passe: **admin123**
4. Vous devriez être redirigé vers `/admin/dashboard`

### Accès Patient  
1. Allez sur `https://votre-url-vercel.vercel.app/login/patient`
2. Créez un compte patient ou utilisez un compte de test
3. Vous devriez être redirigé vers `/patient/dashboard`

## Corrections Appliquées

✅ Amélioré `vercel.json` pour le routage API correct
✅ Configuré les rewrites pour SPA (Single Page Application)
✅ Build local testé avec succès
✅ Code committé et pushé sur GitHub

## En Cas de Problème

### Erreur 404 sur les routes
- Vérifiez que `vercel.json` contient les bons rewrites
- Assurez-vous que le build a créé un fichier `dist/index.html`

### Erreur API
- Vérifiez les variables d'environnement dans Vercel Dashboard
- Consultez les logs dans Vercel Dashboard > Deployments > [votre-deploiement] > Functions Logs

### Page blanche après connexion
- Ouvrez la console du navigateur (F12)
- Vérifiez s'il y a des erreurs JavaScript
- Assurez-vous que le token JWT est sauvegardé dans localStorage

## Support

Si vous rencontrez des problèmes après avoir suivi ces étapes, vérifiez :
1. Les logs de déploiement Vercel
2. Les logs des fonctions serverless (Functions)
3. La console du navigateur pour les erreurs frontend
