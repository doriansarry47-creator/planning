# Guide de Test des Corrections de Connexion

## 🎯 Objectif

Vérifier que les corrections apportées résolvent le problème de page blanche après connexion admin/patient.

## 🚀 Étapes de Test

### 1. Préparation

#### Option A : Test en Production (Recommandé)
1. Assurez-vous que le déploiement Vercel est terminé
2. URL de production : https://webapp-7iftxmp1g-ikips-projects.vercel.app
3. Si la protection Vercel est activée, désactivez-la temporairement

#### Option B : Test en Local
```bash
cd /home/user/webapp
npm run dev
```

### 2. Test de Connexion Admin

#### Étape 2.1 : Ouvrir la console du navigateur
1. Ouvrez Chrome/Firefox/Edge
2. Appuyez sur F12 pour ouvrir les outils de développement
3. Allez dans l'onglet "Console"
4. Allez dans l'onglet "Network" également

#### Étape 2.2 : Vider le localStorage
Dans la console, exécutez :
```javascript
localStorage.clear();
console.log('localStorage vidé');
```

#### Étape 2.3 : Se connecter
1. Allez sur : `/admin/login`
2. Entrez les identifiants :
   - Email : `doriansarry@yahoo.fr`
   - Mot de passe : `Dorian1234!` ou `admin123`
3. Cliquez sur "Connexion"

#### Étape 2.4 : Vérifications
**✅ Ce qui doit se passer :**
- Pas d'erreur `SyntaxError: "undefined" is not valid JSON` dans la console
- Redirection automatique vers `/admin/dashboard`
- Le dashboard admin s'affiche correctement
- Pas de page blanche

**🔍 Dans l'onglet Network :**
1. Recherchez la requête `auth?action=login&userType=admin`
2. Cliquez dessus
3. Dans l'onglet "Response", vérifiez la structure :
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "doriansarry@yahoo.fr", ... },
    "token": "eyJ..."
  },
  "message": "Connexion réussie"
}
```

**🔍 Dans l'onglet Application/Storage :**
1. Allez dans "Local Storage"
2. Vérifiez que les clés suivantes existent :
   - `token` : doit contenir un JWT (commence par "eyJ...")
   - `user` : doit contenir un JSON valide avec les infos utilisateur
   - `userType` : doit contenir "admin"

**🔍 Dans la console :**
Exécutez pour vérifier que les données sont valides :
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('UserType:', localStorage.getItem('userType'));
```

### 3. Test de Connexion Patient

#### Étape 3.1 : Se déconnecter
1. Cliquez sur le bouton de déconnexion dans le dashboard admin
2. Vérifiez que vous êtes redirigé vers la page d'accueil

#### Étape 3.2 : Créer un compte patient test
1. Allez sur `/patient/register`
2. Remplissez le formulaire avec des données de test
3. Soumettez le formulaire

#### Étape 3.3 : Vérifications après inscription
**✅ Ce qui doit se passer :**
- Pas d'erreur dans la console
- Redirection automatique vers `/patient/dashboard`
- Le dashboard patient s'affiche correctement
- Pas de page blanche

#### Étape 3.4 : Test de connexion patient
1. Déconnectez-vous
2. Allez sur `/patient/login`
3. Connectez-vous avec les identifiants créés précédemment

**✅ Ce qui doit se passer :**
- Connexion réussie
- Redirection vers `/patient/dashboard`
- Dashboard s'affiche correctement

### 4. Test de Robustesse

#### Test 4.1 : localStorage corrompu
Dans la console :
```javascript
// Corrompre le localStorage
localStorage.setItem('user', 'undefined');
localStorage.setItem('token', 'invalid-token');
localStorage.setItem('userType', 'admin');

// Rafraîchir la page
location.reload();
```

**✅ Ce qui doit se passer :**
- Pas de crash
- Pas d'erreur `JSON.parse("undefined")`
- Le localStorage doit être nettoyé automatiquement
- Redirection vers la page de connexion

#### Test 4.2 : Token expiré
1. Connectez-vous normalement
2. Dans la console :
```javascript
// Modifier le token pour simuler un token expiré
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid');

// Essayer d'accéder à une page protégée
location.href = '/admin/dashboard';
```

**✅ Ce qui doit se passer :**
- Erreur 401 capturée
- localStorage nettoyé automatiquement
- Redirection vers `/login`

### 5. Test des Dashboards

#### Test 5.1 : Dashboard Admin
1. Connectez-vous en tant qu'admin
2. Vérifiez que les données s'affichent :
   - Statistiques (nombre de RDV aujourd'hui, patients, etc.)
   - Liste des prochains rendez-vous
   - Actions rapides fonctionnelles

#### Test 5.2 : Dashboard Patient
1. Connectez-vous en tant que patient
2. Vérifiez que les données s'affichent :
   - Rendez-vous à venir
   - Historique des rendez-vous
   - Actions rapides fonctionnelles

## 📋 Checklist de Test

### Connexion Admin
- [ ] Pas d'erreur JSON.parse dans la console
- [ ] Redirection correcte vers /admin/dashboard
- [ ] Dashboard admin s'affiche correctement
- [ ] localStorage contient token, user, userType
- [ ] Format de réponse API correct (data.data.user, data.data.token)

### Connexion Patient
- [ ] Inscription patient fonctionne
- [ ] Connexion patient fonctionne
- [ ] Redirection correcte vers /patient/dashboard
- [ ] Dashboard patient s'affiche correctement
- [ ] localStorage contient token, user, userType

### Robustesse
- [ ] localStorage corrompu géré correctement
- [ ] Token expiré/invalide géré correctement
- [ ] Déconnexion nettoie tout le localStorage
- [ ] Pas de page blanche en cas d'erreur

### Dashboards
- [ ] Admin dashboard charge les données
- [ ] Patient dashboard charge les données
- [ ] Requêtes API fonctionnent avec le token
- [ ] Navigation entre pages fonctionne

## 🐛 Problèmes Connus

### Problème : Erreur 404 sur l'API
**Solution :** Vérifiez que l'URL de l'API est correcte dans `.env.production` ou `.env.local`

### Problème : Protection Vercel bloque l'accès
**Solution :** Désactivez la protection dans les paramètres Vercel ou utilisez un bypass token

### Problème : CORS errors
**Solution :** Les headers CORS sont déjà configurés dans les fonctions API. Vérifiez les logs Vercel.

## 📊 Résultats Attendus

### Avant les corrections
❌ Erreur : `SyntaxError: "undefined" is not valid JSON`
❌ Page blanche après connexion
❌ Impossible d'accéder aux dashboards

### Après les corrections
✅ Pas d'erreur dans la console
✅ Redirection automatique après connexion
✅ Dashboards s'affichent correctement
✅ localStorage géré proprement
✅ Gestion des erreurs robuste

## 📝 Rapport de Bug

Si vous trouvez un bug :

1. **Capturez les informations suivantes :**
   - Screenshot de l'erreur dans la console
   - Contenu du localStorage (console : `console.log(localStorage)`)
   - Étapes pour reproduire le bug
   - Navigateur et version utilisés

2. **Logs utiles :**
```javascript
// Dans la console du navigateur
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
console.log('UserType:', localStorage.getItem('userType'));

// Tester le parsing du user
try {
  const user = JSON.parse(localStorage.getItem('user'));
  console.log('User parsed:', user);
} catch (error) {
  console.error('Erreur parsing user:', error);
}
```

3. **Créez une issue GitHub** avec toutes ces informations

## 🎉 Test Réussi !

Si tous les tests passent :
- ✅ Les corrections sont fonctionnelles
- ✅ Le problème de page blanche est résolu
- ✅ Les connexions admin et patient fonctionnent correctement
- ✅ L'application est prête pour la production

---

**Version du guide :** 1.0  
**Date :** 18 octobre 2025  
**Auteur :** GenSpark AI Developer
