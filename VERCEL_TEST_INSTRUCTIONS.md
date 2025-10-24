# 🧪 Instructions de Test du Déploiement Vercel

**Date**: 24 Octobre 2025  
**Commit**: 7ffcc52  
**Status**: ✅ Corrections appliquées, en attente de tests

---

## 🚀 Étape 1: Vérifier le Déploiement

### Option A: Via le Dashboard Vercel

1. **Accédez au Dashboard Vercel**:
   ```
   https://vercel.com/dashboard
   ```

2. **Sélectionnez le projet**:
   - Projet: `planning` ou `webapp`
   - Organisation: `doriansarry47-creator` ou `ikips-projects`

3. **Vérifiez le dernier déploiement**:
   - Onglet: **Deployments**
   - Cherchez le commit: `7ffcc52` ou `fix(vercel): Corriger la configuration Node.js`
   - Status attendu: ✅ **Ready** (ou 🔄 **Building**)

4. **Consultez les logs**:
   - Cliquez sur le déploiement
   - Onglet: **Build Logs**
   - Vérifiez qu'il n'y a **pas d'erreur** `spawn npm ENOENT`

### Option B: Via l'URL de Production

Le déploiement Vercel devrait être accessible à:
```
https://planning-[hash].vercel.app
```

**Trouvez votre URL exacte**:
1. Dashboard Vercel → Projet → Onglet **Domains**
2. Copiez l'URL principale (généralement la première listée)

---

## 🧪 Étape 2: Tests de Base

### Test 1: Page d'Accueil

**URL**: `https://[votre-app].vercel.app/`

**Résultat attendu**:
- ✅ Page se charge sans erreur 404
- ✅ Design/styling visible (Tailwind CSS)
- ✅ Navigation fonctionnelle

### Test 2: API Health Check

**URL**: `https://[votre-app].vercel.app/api/health`

**Méthode**: GET

**Résultat attendu**:
```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2025-10-24T..."
}
```

**Si erreur**:
- 502 Bad Gateway → Problème avec les fonctions serverless
- 500 Internal Server Error → Vérifier les variables d'environnement
- 404 Not Found → Problème de routing dans vercel.json

---

## 🔐 Étape 3: Test de Connexion Admin

### Test 3.1: Page de Connexion Admin

**URL**: `https://[votre-app].vercel.app/login/admin`

**Résultat attendu**:
- ✅ Formulaire de connexion visible
- ✅ Champs: Email, Mot de passe
- ✅ Bouton "Se connecter"

### Test 3.2: Connexion avec Identifiants Admin

**Identifiants**:
```
Email: dorainsarry@yahoo.fr
Mot de passe: admin123
```

**Actions**:
1. Entrer l'email: `dorainsarry@yahoo.fr`
2. Entrer le mot de passe: `admin123`
3. Cliquer sur **Se connecter**

**Résultat attendu**:
- ✅ Redirection vers `/admin/dashboard`
- ✅ Message de bienvenue affiché
- ✅ Nom de l'admin visible dans l'interface

**Si échec**:
- Vérifier les variables d'environnement (JWT_SECRET, DATABASE_URL)
- Consulter les logs API dans Vercel
- Tester l'endpoint `/api/auth/login?userType=admin` directement

---

## 🎯 Étape 4: Tests des Fonctionnalités Admin

Une fois connecté au dashboard admin, testez les fonctionnalités suivantes:

### 4.1 Vue Dashboard

**URL**: `/admin/dashboard`

**Éléments à vérifier**:
- [ ] Statistiques affichées (total patients, RDV, etc.)
- [ ] Graphiques/charts visibles
- [ ] Navigation latérale fonctionnelle
- [ ] Pas d'erreurs console

### 4.2 Gestion des Patients

**URL**: `/admin/patients`

**Tests**:
- [ ] Liste des patients charge
- [ ] Recherche/filtre fonctionne
- [ ] Clic sur un patient ouvre les détails
- [ ] Bouton "Nouveau patient" visible

**Test de création** (optionnel):
1. Cliquer sur "Nouveau patient"
2. Remplir le formulaire:
   ```
   Nom: Test
   Prénom: Patient
   Email: test.patient@example.com
   Téléphone: 0612345678
   Date de naissance: 1990-01-01
   ```
3. Soumettre
4. Vérifier que le patient apparaît dans la liste

### 4.3 Gestion des Rendez-vous

**URL**: `/admin/appointments` ou `/admin/calendar`

**Tests**:
- [ ] Liste ou calendrier des RDV charge
- [ ] Filtres par date/praticien fonctionnent
- [ ] Création de RDV possible
- [ ] Modification de RDV fonctionne
- [ ] Annulation de RDV fonctionne

**Test de création** (optionnel):
1. Cliquer sur "Nouveau rendez-vous"
2. Remplir:
   ```
   Patient: (Sélectionner un existant)
   Praticien: (Sélectionner un existant)
   Date: (Date future)
   Heure: 14:00
   Type: Consultation
   ```
3. Soumettre
4. Vérifier dans le calendrier

### 4.4 Gestion des Praticiens

**URL**: `/admin/practitioners`

**Tests**:
- [ ] Liste des praticiens charge
- [ ] Ajout de praticien possible
- [ ] Modification fonctionne
- [ ] Disponibilités affichées

### 4.5 Profil Admin

**URL**: `/admin/profile`

**Tests**:
- [ ] Informations admin affichées
- [ ] Modification du profil possible
- [ ] Changement de mot de passe fonctionne

---

## 🐛 Étape 5: Tests de Sécurité

### Test 5.1: Mauvais Mot de Passe

**Actions**:
1. Se déconnecter
2. Tenter de se connecter avec:
   ```
   Email: dorainsarry@yahoo.fr
   Mot de passe: mauvais_mot_de_passe
   ```

**Résultat attendu**:
- ❌ Message d'erreur: "Email ou mot de passe incorrect"
- ❌ Pas de redirection vers dashboard

### Test 5.2: Verrouillage après 5 Tentatives

**Actions**:
1. Tenter 5 connexions avec mauvais mot de passe
2. Vérifier le message après la 5ème tentative

**Résultat attendu**:
- ❌ Message: "Compte temporairement verrouillé"
- 🔒 Impossibilité de se connecter pendant X minutes

### Test 5.3: Accès Non Autorisé

**Actions**:
1. Se déconnecter
2. Tenter d'accéder directement à:
   ```
   https://[app].vercel.app/admin/dashboard
   ```

**Résultat attendu**:
- ❌ Redirection vers `/login/admin`
- 🔒 Message: "Authentification requise"

---

## 📊 Étape 6: Vérification des Logs

### Logs Vercel

**Accès**:
1. Dashboard Vercel → Projet
2. Onglet **Functions** (ou **Monitoring**)
3. Sélectionner une fonction (ex: `/api/index`)
4. Consulter les logs en temps réel

**Points à vérifier**:
- ✅ Pas d'erreurs 500
- ✅ Connexions DB réussies
- ✅ JWT tokens générés correctement
- ✅ Temps de réponse < 1 seconde

### Console Browser

**Accès**: 
- Chrome/Firefox: F12 → Console
- Safari: Cmd+Option+C

**Points à vérifier**:
- ✅ Pas d'erreurs JavaScript
- ✅ Requêtes API réussies (200, 201)
- ✅ Pas de CORS errors
- ✅ Assets chargés (CSS, images)

---

## ✅ Checklist Finale

### Déploiement
- [ ] Build Vercel réussi (status: Ready)
- [ ] Pas d'erreur `spawn npm ENOENT`
- [ ] Temps de build < 60 secondes
- [ ] URL de production accessible

### Fonctionnalités
- [ ] Page d'accueil charge
- [ ] API Health Check répond
- [ ] Connexion admin fonctionne
- [ ] Dashboard admin accessible
- [ ] CRUD patients fonctionne
- [ ] CRUD rendez-vous fonctionne
- [ ] CRUD praticiens fonctionne

### Sécurité
- [ ] Authentification requise pour admin
- [ ] Mauvais mot de passe bloque connexion
- [ ] JWT tokens fonctionnent
- [ ] Variables d'environnement configurées

### Performance
- [ ] Page load < 3 secondes
- [ ] API response < 1 seconde
- [ ] Pas de fuites mémoire
- [ ] Console sans erreurs

---

## 🔧 Dépannage Rapide

### Problème 1: Erreur 502 Bad Gateway

**Causes possibles**:
- Variables d'environnement manquantes
- Connexion DB échouée
- Timeout fonction serverless

**Solutions**:
1. Vérifier `DATABASE_URL` dans Vercel Settings
2. Vérifier `JWT_SECRET` configuré
3. Augmenter `maxDuration` dans vercel.json

### Problème 2: Erreur 404 sur Routes

**Causes possibles**:
- Rewrites mal configurés
- Build incomplet

**Solutions**:
1. Vérifier `vercel.json` rewrites
2. Vérifier dossier `dist/` généré
3. Redéployer avec cache désactivé

### Problème 3: Connexion Admin Échoue

**Causes possibles**:
- JWT_SECRET incorrect
- DATABASE_URL invalide
- Admin inexistant en DB

**Solutions**:
1. Vérifier variables d'environnement
2. Tester endpoint API directement
3. Vérifier logs Vercel Functions

---

## 📞 Support

**En cas de problème persistant**:

1. **Consulter les logs**:
   - Vercel Dashboard → Functions → Logs
   - Browser Console (F12)

2. **Tester API directement**:
   ```bash
   curl https://[app].vercel.app/api/health
   curl -X POST https://[app].vercel.app/api/auth/login?userType=admin \
     -H "Content-Type: application/json" \
     -d '{"email":"dorainsarry@yahoo.fr","password":"admin123"}'
   ```

3. **Documentation**:
   - Lire `CORRECTION_VERCEL_SPAWN_NPM_ENOENT.md`
   - Lire `GUIDE_TEST_ADMIN.md`
   - Lire `README.md`

4. **Contact**:
   - Email: doriansarry47@gmail.com
   - GitHub Issues: https://github.com/doriansarry47-creator/planning/issues

---

**Bonne chance pour les tests !** 🚀

Si tout fonctionne correctement, le déploiement est un succès ! ✅
