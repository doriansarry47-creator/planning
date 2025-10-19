# 🧪 Guide de Test Utilisateur - MedPlan

## ✅ Déploiement Réussi !

Votre application MedPlan est maintenant déployée et accessible sur Vercel.

## 🔗 URLs d'Accès

### URL Principale
**https://webapp-ikips-projects.vercel.app**

### URLs Alternatives
- https://webapp-7tj17oa36-ikips-projects.vercel.app
- https://webapp-gules-chi.vercel.app

## 🔐 Accéder à l'Application

### Étape 1 : Authentification Vercel

⚠️ **Important** : L'application est actuellement protégée par Vercel Authentication.

1. **Ouvrez** votre navigateur
2. **Accédez** à : https://webapp-ikips-projects.vercel.app
3. **Connectez-vous** avec votre compte Vercel (doriansarry47-6114)
4. Vous serez **automatiquement redirigé** vers l'application

### Étape 2 : Désactiver la Protection (Optionnel)

Si vous souhaitez un accès public :

1. **Accédez** au dashboard Vercel : https://vercel.com/ikips-projects/webapp
2. **Allez** dans **Settings** → **Deployment Protection**
3. **Désactivez** la protection
4. L'application sera accessible sans authentification

## 🧪 Tests à Effectuer

### Test 1 : Connexion Administrateur

#### Étapes
1. **Cliquez** sur "Connexion Admin" dans le menu principal
2. **Entrez** les identifiants :
   - **Email** : `admin@medplan.fr`
   - **Mot de passe** : `admin123`
3. **Cliquez** sur "Se connecter"

#### Vérifications
- ✅ La connexion réussit sans erreur
- ✅ Vous êtes redirigé vers le dashboard administrateur
- ✅ Le dashboard affiche les statistiques (rendez-vous, patients, etc.)
- ✅ Le menu de navigation est visible et fonctionnel
- ✅ Vous pouvez accéder aux sections : Rendez-vous, Patients, Praticiens

#### Fonctionnalités Admin à Tester
- **Gestion des rendez-vous** : Voir, modifier, annuler les rendez-vous
- **Gestion des patients** : Voir la liste des patients
- **Gestion des praticiens** : Ajouter/modifier des praticiens
- **Statistiques** : Vérifier que les graphiques s'affichent correctement

---

### Test 2 : Connexion Patient

#### Étapes
1. **Déconnectez-vous** (si connecté en admin)
2. **Cliquez** sur "Connexion Patient" dans le menu
3. **Entrez** les identifiants :
   - **Email** : `patient@test.fr`
   - **Mot de passe** : `patient123`
4. **Cliquez** sur "Se connecter"

#### Vérifications
- ✅ La connexion réussit sans erreur
- ✅ Vous êtes redirigé vers le dashboard patient
- ✅ Le dashboard affiche vos rendez-vous
- ✅ Le bouton "Prendre rendez-vous" est visible
- ✅ Les rendez-vous existants s'affichent avec leurs détails

---

### Test 3 : Inscription Patient

#### Étapes
1. **Déconnectez-vous** (si connecté)
2. **Accédez** à la page d'inscription patient
3. **Remplissez** le formulaire avec :
   - Prénom et nom
   - Email (utilisez un nouveau email)
   - Mot de passe (minimum 8 caractères)
   - Confirmation du mot de passe
   - Téléphone (optionnel)
   - Motif de consultation
   - Type de session préférée (cabinet ou visio)
   - Acceptez les conditions
4. **Cliquez** sur "Créer mon compte"

#### Vérifications
- ✅ La validation des champs fonctionne
- ✅ Le compte est créé avec succès
- ✅ Vous êtes automatiquement connecté
- ✅ Vous êtes redirigé vers le dashboard patient

---

### Test 4 : Prise de Rendez-vous

#### Prérequis
Être connecté en tant que patient (test@test.fr ou nouveau compte)

#### Étapes
1. **Cliquez** sur "Prendre rendez-vous"
2. **Sélectionnez** une date et heure
3. **Choisissez** le type de consultation :
   - 🏥 Cabinet
   - 💻 Visio
4. **Sélectionnez** la durée (30, 60, ou 90 minutes)
5. **Remplissez** le motif de consultation (détails importants)
6. **Ajoutez** des informations complémentaires si nécessaire :
   - Référence par un professionnel ?
   - Date de début des symptômes
   - Etc.
7. **Cliquez** sur "Confirmer le rendez-vous"

#### Vérifications
- ✅ Le formulaire se remplit correctement
- ✅ La validation fonctionne (champs obligatoires)
- ✅ Le rendez-vous est créé avec succès
- ✅ Un message de confirmation s'affiche
- ✅ Le rendez-vous apparaît dans votre dashboard
- ✅ Le statut est "En attente" (pending)

---

### Test 5 : Gestion des Rendez-vous (Admin)

#### Prérequis
Être connecté en tant qu'administrateur

#### Étapes
1. **Accédez** à la section "Rendez-vous"
2. **Visualisez** la liste de tous les rendez-vous
3. **Cliquez** sur un rendez-vous pour voir les détails
4. **Modifiez** le statut (confirmé, complété, annulé)
5. **Ajoutez** des notes thérapeutiques (si disponible)
6. **Enregistrez** les modifications

#### Vérifications
- ✅ La liste des rendez-vous s'affiche avec les informations patient
- ✅ Le filtrage par statut fonctionne
- ✅ La modification du statut fonctionne
- ✅ Les modifications sont sauvegardées
- ✅ Le patient voit le changement de statut

---

### Test 6 : API Health Check

#### Test depuis le navigateur
1. **Ouvrez** : https://webapp-ikips-projects.vercel.app/api/health
2. **Vérifiez** que vous obtenez une réponse JSON positive

#### Test depuis le terminal
```bash
curl https://webapp-ikips-projects.vercel.app/api/health
```

#### Réponse Attendue
```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2025-10-19T12:00:00.000Z"
  }
}
```

---

## 🐛 Problèmes Courants et Solutions

### Problème 1 : "Authentication Required"

**Cause** : La protection Vercel est activée

**Solution** :
1. Connectez-vous avec votre compte Vercel
2. OU désactivez la protection dans les paramètres Vercel

---

### Problème 2 : "Route not found" ou 404

**Cause** : Le routage API n'est pas correctement configuré

**Solution** :
- Vérifiez que vous utilisez les bons chemins : `/api/auth/login`, `/api/appointments`, etc.
- Le déploiement devrait avoir résolu ce problème

---

### Problème 3 : Erreur de connexion à la base de données

**Cause** : Variables d'environnement non configurées ou base de données inaccessible

**Solution** :
1. Vérifiez les variables d'environnement sur Vercel
2. Testez la connexion à la base de données Neon
3. Vérifiez les logs Vercel : https://vercel.com/ikips-projects/webapp/logs

---

### Problème 4 : Page blanche après connexion

**Cause** : Problème de routage côté client

**Solution** :
- Videz le cache du navigateur (Ctrl+Shift+R)
- Vérifiez les erreurs dans la console du navigateur (F12)
- Ce problème devrait être résolu dans cette version

---

## 📊 Vérification des Logs

### Accéder aux Logs Vercel
1. **Allez** sur https://vercel.com/ikips-projects/webapp
2. **Cliquez** sur l'onglet "Logs"
3. **Filtrez** par fonction ou par temps réel
4. **Vérifiez** les erreurs éventuelles

### Logs Utiles
- ✅ Logs de connexion (auth)
- ✅ Logs de création de rendez-vous
- ✅ Logs de requêtes API
- ✅ Logs d'erreurs serveur

---

## ✅ Checklist de Test Complet

Cochez chaque test après l'avoir effectué :

- [ ] Connexion administrateur réussie
- [ ] Dashboard admin affiché correctement
- [ ] Connexion patient réussie
- [ ] Dashboard patient affiché correctement
- [ ] Inscription nouveau patient réussie
- [ ] Prise de rendez-vous patient réussie
- [ ] Modification de rendez-vous admin réussie
- [ ] Affichage des statistiques admin
- [ ] Navigation entre les pages fluide
- [ ] API Health Check réussie
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Pas d'erreurs dans les logs Vercel

---

## 🎯 Résultat Attendu

À la fin de ces tests, vous devriez avoir :

✅ Une application pleinement fonctionnelle
✅ Connexion admin et patient qui fonctionnent
✅ Possibilité de créer des rendez-vous
✅ Dashboard avec statistiques
✅ Aucune erreur visible

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez** les logs Vercel
2. **Consultez** le fichier DEPLOYMENT_SUCCESS.md
3. **Vérifiez** la console du navigateur (F12)
4. **Testez** avec un autre navigateur

---

## 🚀 Prochaines Étapes

Après validation des tests :

1. **Désactiver** la protection Vercel (si souhaité)
2. **Configurer** un domaine personnalisé
3. **Activer** les notifications email (si configuré)
4. **Ajouter** des praticiens et patients réels
5. **Former** les utilisateurs finaux

---

**Guide créé le** : 19 Octobre 2025
**Version de l'application** : 2.0.1
**Status** : ✅ Production Ready
