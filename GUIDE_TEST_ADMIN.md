# 🧪 Guide de Test des Fonctionnalités Admin

## 📋 Informations de Connexion

```
URL: https://[votre-app].vercel.app/admin/login
Email: dorainsarry@yahoo.fr
Mot de passe: admin123
```

## ✅ Tests à Effectuer

### 1. 🔐 Test d'Authentification

#### Test de Connexion Réussie
1. Accéder à `/admin/login`
2. Entrer l'email: `dorainsarry@yahoo.fr`
3. Entrer le mot de passe: `admin123`
4. Cliquer sur "Accéder à l'administration"
5. **Résultat attendu**: Redirection vers `/admin/dashboard`

#### Test de Connexion Échouée
1. Accéder à `/admin/login`
2. Entrer un mauvais mot de passe
3. **Résultat attendu**: Message d'erreur "Mot de passe incorrect. X tentative(s) restante(s)"
4. Après 5 tentatives: "Compte verrouillé pour 15 minutes"

### 2. 📊 Test du Dashboard Admin

#### Vue d'Ensemble
1. Vérifier l'affichage des statistiques:
   - Nombre total de rendez-vous
   - Rendez-vous aujourd'hui
   - Rendez-vous à venir
   - Taux d'occupation
2. Vérifier le calendrier interactif
3. Vérifier la liste des prochains rendez-vous

#### Navigation
1. Menu de navigation visible
2. Liens vers:
   - Dashboard
   - Rendez-vous
   - Patients
   - Paramètres
   - Déconnexion

### 3. 📅 Gestion des Rendez-vous

#### Liste des Rendez-vous
1. Accéder à la page de gestion des rendez-vous
2. Vérifier l'affichage de la liste
3. Vérifier les filtres (date, statut, patient)
4. Vérifier la recherche

#### Création de Rendez-vous
1. Cliquer sur "Nouveau rendez-vous"
2. Remplir le formulaire:
   - Sélectionner un patient
   - Choisir une date
   - Choisir un horaire
   - Ajouter des notes (optionnel)
3. **Résultat attendu**: Rendez-vous créé avec succès

#### Modification de Rendez-vous
1. Sélectionner un rendez-vous existant
2. Cliquer sur "Modifier"
3. Changer la date ou l'heure
4. Sauvegarder
5. **Résultat attendu**: Rendez-vous mis à jour

#### Annulation de Rendez-vous
1. Sélectionner un rendez-vous
2. Cliquer sur "Annuler"
3. Confirmer l'annulation
4. **Résultat attendu**: Statut changé en "Annulé"

### 4. 👥 Gestion des Patients

#### Liste des Patients
1. Accéder à la page patients
2. Vérifier l'affichage de tous les patients
3. Tester la recherche par nom/email
4. Tester les filtres

#### Voir le Profil Patient
1. Cliquer sur un patient
2. Vérifier l'affichage des informations:
   - Informations personnelles
   - Historique des rendez-vous
   - Notes médicales
   - Allergies

#### Ajouter des Notes
1. Accéder au profil d'un patient
2. Ajouter une note de consultation
3. **Résultat attendu**: Note enregistrée et visible

### 5. 🔔 Notifications

#### Test des Notifications
1. Créer un nouveau rendez-vous
2. Vérifier l'envoi de notification au patient
3. Modifier un rendez-vous
4. Vérifier la notification de modification
5. Annuler un rendez-vous
6. Vérifier la notification d'annulation

### 6. 🔒 Test de Sécurité

#### Routes Protégées
1. Se déconnecter
2. Essayer d'accéder directement à:
   - `/admin/dashboard`
   - `/admin/appointments`
   - `/admin/patients`
3. **Résultat attendu**: Redirection vers `/admin/login`

#### Token Expiration
1. Se connecter
2. Attendre 24 heures (ou modifier l'expiration du token)
3. Essayer d'accéder à une page protégée
4. **Résultat attendu**: Redirection vers login

### 7. 📱 Test Responsive

#### Desktop
1. Tester sur écran large (>1024px)
2. Vérifier l'affichage du menu latéral
3. Vérifier l'affichage des tableaux

#### Tablette
1. Tester sur écran moyen (768px-1023px)
2. Vérifier l'adaptation du layout
3. Vérifier le menu hamburger

#### Mobile
1. Tester sur écran petit (<768px)
2. Vérifier la navigation mobile
3. Vérifier les formulaires
4. Vérifier les tableaux (scroll horizontal)

## 🐛 Rapport de Bugs

Si vous rencontrez des problèmes, notez:

### Bug Template
```markdown
**Titre**: [Description courte du bug]

**Étapes pour reproduire**:
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

**Résultat attendu**: [Ce qui devrait se passer]

**Résultat obtenu**: [Ce qui se passe réellement]

**Environnement**:
- Navigateur: [Chrome/Firefox/Safari/Edge]
- Version: [Version du navigateur]
- Appareil: [Desktop/Mobile/Tablette]
- Système: [Windows/Mac/iOS/Android]

**Captures d'écran**: [Si possible]

**Console du navigateur**: [Messages d'erreur JavaScript]
```

## 📊 Checklist de Validation

### Fonctionnalités Principales
- [ ] Connexion admin fonctionnelle
- [ ] Dashboard admin accessible
- [ ] Liste des rendez-vous affichée
- [ ] Création de rendez-vous possible
- [ ] Modification de rendez-vous possible
- [ ] Annulation de rendez-vous possible
- [ ] Liste des patients accessible
- [ ] Profil patient détaillé
- [ ] Ajout de notes médicales
- [ ] Notifications envoyées

### Sécurité
- [ ] Routes protégées correctement
- [ ] Token JWT fonctionnel
- [ ] Déconnexion fonctionnelle
- [ ] Verrouillage après tentatives échouées

### Performance
- [ ] Chargement rapide (<3 secondes)
- [ ] Pas d'erreurs dans la console
- [ ] API répond correctement
- [ ] Pas de fuites mémoire

### UX/UI
- [ ] Design cohérent
- [ ] Navigation intuitive
- [ ] Messages d'erreur clairs
- [ ] Feedback visuel sur les actions
- [ ] Responsive sur tous les appareils

## 📞 Support

En cas de problème, contacter:
- **Email**: doriansarry47@gmail.com
- **Documentation**: README.md
- **Logs**: Vérifier la console du navigateur (F12)

---

**Version**: 1.0
**Date**: 24 Octobre 2025
**Status**: ✅ Guide de test complet
