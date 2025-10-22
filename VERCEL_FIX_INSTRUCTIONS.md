# 🔧 Instructions pour Réparer le Déploiement Vercel

## ⚠️ Problème Actuel

Le déploiement échoue avec l'erreur :
```
Error: Found invalid Node.js Version: "20.x". Please set Node.js Version to 18.x in your Project Settings to use Node.js 18.
```

## ✅ Solution : Changer la Version Node.js dans les Paramètres Vercel

### Étape 1 : Accéder aux Paramètres du Projet

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte
3. Sélectionnez le projet **webapp** (ikips-projects/webapp)
4. Cliquez sur **Settings** (Paramètres)

### Étape 2 : Modifier la Version Node.js

1. Dans le menu de gauche, cliquez sur **General**
2. Trouvez la section **Node.js Version**
3. Changez la version de **20.x** à **18.x**
4. Cliquez sur **Save** (Enregistrer)

### Étape 3 : Redéployer

Deux options pour redéployer :

#### Option A : Via l'interface Vercel
1. Allez dans l'onglet **Deployments**
2. Cliquez sur le bouton **Redeploy** du dernier déploiement
3. Sélectionnez **Use existing Build Cache** (décochez si problèmes persistent)
4. Cliquez sur **Redeploy**

#### Option B : Via un nouveau commit (automatique)
Les changements ont déjà été pushés sur GitHub. Un nouveau déploiement devrait se déclencher automatiquement une fois la version Node.js changée.

## 🌐 URLs de l'Application

Après un déploiement réussi, vous pourrez accéder à :

- **Page d'accueil** : https://webapp-[hash].vercel.app/
- **Login Admin** : https://webapp-[hash].vercel.app/login/admin
- **Login Patient** : https://webapp-[hash].vercel.app/login/patient
- **Dashboard Admin** : https://webapp-[hash].vercel.app/admin/dashboard
- **Dashboard Patient** : https://webapp-[hash].vercel.app/patient/dashboard

## 👤 Identifiants Admin

Pour vous connecter en tant qu'administrateur :

- **Email** : doriansarry@yahoo.fr
- **Mot de passe** : admin123

## 🔐 Variables d'Environnement Requises

Assurez-vous que ces variables sont configurées dans **Settings → Environment Variables** :

```
DATABASE_URL=postgresql://neondb_owner:npg_6aG2wNlTWnsb@ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=medplan-jwt-secret-key-2024-production

JWT_EXPIRES_IN=24h

SESSION_SECRET=medplan-session-secret-2024-production

NODE_ENV=production

VITE_API_URL=/api
```

## 📝 Modifications Effectuées

Les changements suivants ont été appliqués pour résoudre le problème :

1. ✅ Correction de `vercel.json` pour améliorer le routage API
2. ✅ Spécification de Node.js 18.x dans `package.json` (engines)
3. ✅ Ajout de `NODE_VERSION=18` dans `vercel.json`
4. ✅ Suppression des fichiers `.nvmrc` et `.node-version` qui causaient des conflits
5. ✅ Test du build local (réussi)
6. ✅ Commits et push sur GitHub

## 🚀 Prochaines Étapes

1. Changez la version Node.js à 18.x dans les paramètres Vercel (étape critique ⚠️)
2. Attendez que le nouveau déploiement se termine
3. Testez l'accès aux pages admin et patient
4. Si le problème persiste, vérifiez les logs de déploiement dans Vercel

## 📞 Support

Si le problème persiste après avoir changé la version Node.js :
1. Vérifiez les logs de déploiement dans Vercel
2. Assurez-vous que toutes les variables d'environnement sont configurées
3. Essayez un redéploiement en désactivant le cache

---

**Dernière mise à jour** : 2025-10-22
**Status** : ⚠️ En attente du changement de version Node.js dans les paramètres Vercel
