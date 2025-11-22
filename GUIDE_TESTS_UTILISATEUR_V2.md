# 🧪 Guide de Tests Utilisateur - Système de Réservation V2

## 📋 Vue d'ensemble

Système de réservation amélioré avec intégration Google Calendar iCal :
- **Lecture automatique** des disponibilités depuis Google Calendar
- **Créneaux de 60 minutes** fixes
- **Réservation directe** dans Google Calendar
- **Emails automatiques** de confirmation et rappel 24h avant

## 🌐 URLs de Test

### Application de Test
- **URL principale** : https://3000-iisnhv0y3m2aoqwpcatom-d0b9e1e2.sandbox.novita.ai
- **Page de réservation** : https://3000-iisnhv0y3m2aoqwpcatom-d0b9e1e2.sandbox.novita.ai/book-appointment

### Google Calendar (Vérification)
- **Email** : doriansarry47@gmail.com
- **URL iCal** : https://calendar.google.com/calendar/ical/doriansarry47%40gmail.com/public/basic.ics

## ✅ Scénarios de Test

### Test 1 : Vérification des Disponibilités

**Objectif** : Vérifier que les créneaux de 60 minutes sont correctement détectés depuis Google Calendar

**Étapes** :
1. Accéder à la page de réservation
2. Observer le chargement du calendrier
3. Vérifier que les dates avec disponibilités sont visuellement distinctes
4. Vérifier le message de chargement

**Résultat attendu** :
- ✅ Les dates avec créneaux apparaissent en surbrillance
- ✅ Les dates sans créneaux sont grisées
- ✅ Message "X dates disponibles" s'affiche
- ✅ Chargement fluide et rapide

### Test 2 : Sélection d'une Date

**Objectif** : Tester la sélection d'une date disponible

**Étapes** :
1. Cliquer sur une date disponible (en couleur)
2. Observer l'affichage des créneaux horaires
3. Vérifier que tous les créneaux sont de 60 minutes

**Résultat attendu** :
- ✅ Passage automatique à l'étape 2
- ✅ Affichage des créneaux de 60 minutes
- ✅ Format d'heure correct (HH:mm)
- ✅ Indication "(60 min)" sur chaque créneau

### Test 3 : Sélection d'un Créneau

**Objectif** : Sélectionner un horaire disponible

**Étapes** :
1. Cliquer sur un créneau horaire
2. Observer le changement visuel du bouton sélectionné
3. Vérifier le passage à l'étape 3

**Résultat attendu** :
- ✅ Créneau sélectionné visuellement distinct (gradient bleu/vert)
- ✅ Passage automatique à l'étape 3
- ✅ Récapitulatif visible avec date, heure, durée

### Test 4 : Formulaire d'Informations

**Objectif** : Remplir et valider le formulaire patient

**Données de test** :
```
Prénom : Jean
Nom : Dupont
Email : jean.dupont@test.com
Téléphone : 0612345678
Motif : Test de consultation (optionnel)
```

**Étapes** :
1. Remplir tous les champs requis
2. Optionnellement ajouter un motif
3. Cliquer sur "Confirmer le rendez-vous"
4. Observer le processus de confirmation

**Résultat attendu** :
- ✅ Validation des champs (email format, téléphone format)
- ✅ Bouton "Confirmer" devient "Confirmation en cours..." avec spinner
- ✅ Toast de succès s'affiche
- ✅ Passage à l'écran de confirmation

### Test 5 : Confirmation et Google Calendar

**Objectif** : Vérifier la création du rendez-vous dans Google Calendar

**Étapes** :
1. Après confirmation, noter l'heure du RDV
2. Ouvrir Google Calendar (doriansarry47@gmail.com)
3. Chercher l'événement créé

**Résultat attendu** :
- ✅ Événement "🩺 Consultation - Jean Dupont" créé
- ✅ Date et heure corrects
- ✅ Durée de 60 minutes
- ✅ Email du patient dans les participants
- ✅ Description complète (motif, téléphone, email)
- ✅ Rappels configurés (24h et 1h avant)

### Test 6 : Email de Confirmation

**Objectif** : Vérifier l'envoi de l'email de confirmation

**Étapes** :
1. Après confirmation, vérifier l'email utilisé
2. Attendre quelques secondes
3. Consulter la boîte email

**Résultat attendu** :
- ✅ Email reçu avec sujet "Confirmation de rendez-vous"
- ✅ Design professionnel et clair
- ✅ Toutes les informations présentes (date, heure, praticien)
- ✅ Bouton "Annuler le rendez-vous" présent
- ✅ Coordonnées du cabinet incluses

### Test 7 : Écran de Confirmation

**Objectif** : Vérifier l'affichage de l'écran de confirmation

**Résultat attendu** :
- ✅ Icône de succès (CheckCircle) verte
- ✅ Message de confirmation clair
- ✅ Récapitulatif complet du RDV
- ✅ Mention de l'email envoyé
- ✅ Mention du rappel 24h avant
- ✅ Boutons "Retour à l'accueil" et "Nouveau rendez-vous"

### Test 8 : Gestion des Erreurs

**Objectif** : Tester la robustesse de l'application

**Scénarios d'erreur à tester** :

#### 8.1 : Créneau déjà réservé
1. Sélectionner un créneau
2. Attendre 30 secondes sans soumettre
3. (Simuler qu'un autre utilisateur réserve le même créneau)
4. Tenter de confirmer

**Résultat attendu** :
- ✅ Message d'erreur : "Ce créneau n'est plus disponible"
- ✅ Retour à la sélection d'horaire
- ✅ Créneaux mis à jour

#### 8.2 : Champs invalides
1. Entrer un email invalide (ex: "test")
2. Entrer un téléphone invalide (ex: "123")
3. Tenter de soumettre

**Résultat attendu** :
- ✅ Validation HTML5 empêche la soumission
- ✅ Messages d'erreur natifs du navigateur

#### 8.3 : Problème de connexion
1. Simuler une déconnexion réseau
2. Tenter de charger les disponibilités

**Résultat attendu** :
- ✅ Message d'erreur clair
- ✅ Toast "Impossible de charger les disponibilités"
- ✅ Bouton de retry possible

### Test 9 : Navigation et Retours

**Objectif** : Tester la navigation entre les étapes

**Étapes** :
1. Sélectionner une date
2. Cliquer sur "Changer la date" 
3. Sélectionner une autre date
4. Sélectionner un créneau
5. Cliquer sur "Retour"
6. Sélectionner un autre créneau

**Résultat attendu** :
- ✅ Navigation fluide entre les étapes
- ✅ Données précédentes conservées si pertinent
- ✅ Indicateur de progression mis à jour
- ✅ Aucune erreur console

### Test 10 : Responsive Design

**Objectif** : Vérifier l'affichage sur différents écrans

**Tailles à tester** :
- 📱 Mobile (375px)
- 📱 Tablet (768px)
- 💻 Desktop (1920px)

**Résultat attendu** :
- ✅ Calendrier adaptatif
- ✅ Grille de créneaux responsive (2/3/4 colonnes selon écran)
- ✅ Formulaire lisible sur mobile
- ✅ Boutons bien espacés et cliquables
- ✅ Pas de scroll horizontal

## 🔍 Points de Vérification Critiques

### Backend
- [ ] Service Google Calendar iCal initialisé
- [ ] Lecture des événements "DISPONIBLE" fonctionne
- [ ] Conversion en créneaux de 60 minutes correcte
- [ ] Création d'événements dans Google Calendar
- [ ] Suppression des créneaux "DISPONIBLE" après réservation
- [ ] Envoi d'emails via Resend

### Frontend
- [ ] Chargement des disponibilités au démarrage
- [ ] Calendrier désactive les dates non disponibles
- [ ] Affichage correct des créneaux de 60 min
- [ ] Validation du formulaire
- [ ] Gestion des erreurs
- [ ] Design moderne et professionnel

### Google Calendar
- [ ] Événements créés avec bon format
- [ ] Participants ajoutés
- [ ] Rappels configurés (24h avant)
- [ ] Couleur appropriée (vert sauge)
- [ ] Description complète

### Emails
- [ ] Email de confirmation envoyé au patient
- [ ] Design responsive de l'email
- [ ] Lien d'annulation fonctionnel
- [ ] Coordonnées du cabinet présentes

## 📊 Métriques de Performance

### Temps de Chargement
- [ ] Disponibilités chargées en < 2 secondes
- [ ] Passage entre étapes instantané
- [ ] Confirmation en < 3 secondes

### Expérience Utilisateur
- [ ] Moins de 3 clics pour réserver
- [ ] Instructions claires à chaque étape
- [ ] Feedback visuel immédiat
- [ ] Messages d'erreur compréhensibles

## 🐛 Bugs Connus à Vérifier

1. **Timezone** : Vérifier que les heures sont correctes (Europe/Paris)
2. **Doublons** : S'assurer qu'un créneau ne peut pas être réservé deux fois
3. **Refresh** : Tester le rechargement de page à chaque étape
4. **Browser** : Tester sur Chrome, Firefox, Safari

## 📝 Checklist de Validation Finale

Avant de considérer le système prêt pour la production :

- [ ] Tous les tests ci-dessus passent
- [ ] Aucune erreur console
- [ ] Google Calendar synchronisé correctement
- [ ] Emails reçus et bien formatés
- [ ] Design responsive validé
- [ ] Performance acceptable (< 3s pour une réservation)
- [ ] Documentation complète
- [ ] Variables d'environnement configurées pour production
- [ ] Tests sur plusieurs navigateurs

## 🎯 Critères de Succès

Le système est considéré comme réussi si :

1. ✅ Un utilisateur peut réserver en moins de 2 minutes
2. ✅ Les disponibilités sont toujours à jour
3. ✅ Les rendez-vous apparaissent dans Google Calendar
4. ✅ Les emails de confirmation sont reçus
5. ✅ L'interface est intuitive et moderne
6. ✅ Aucun créneau ne peut être double-réservé
7. ✅ Les rappels 24h avant fonctionnent (via Google Calendar)

## 📞 Support

En cas de problème lors des tests :
- Vérifier les logs serveur dans la console
- Vérifier les logs Google Calendar
- Vérifier que l'URL iCal est accessible
- Vérifier la clé API Resend

---

**Date de création** : 2025-11-22
**Version** : 2.0
**Développeur** : GenSpark AI Developer
