# 📋 Guide de Tests - Système de Réservation Optimisé

## 🎯 Objectif

Ce guide vous permet de tester le nouveau système de réservation de rendez-vous optimisé qui :
- ✅ Affiche uniquement les créneaux disponibles depuis Google Calendar
- ✅ Tous les rendez-vous durent exactement **60 minutes**
- ✅ Crée automatiquement les rendez-vous dans Google Calendar
- ✅ Envoie des emails de confirmation automatiques
- ✅ Configure des rappels automatiques 24h avant

## 🔧 Prérequis

### 1. Configuration Google Calendar

Vous devez avoir configuré dans votre Google Calendar (doriansarry47@gmail.com) des créneaux de disponibilité avec les caractéristiques suivantes :

- **Titre** : Contenir un mot-clé comme "DISPONIBLE", "DISPO", "🟢", "LIBRE"
- **Durée** : N'importe quelle durée (sera divisée en créneaux de 60 minutes)
- **Transparence** : "Disponible" (pour ne pas bloquer l'agenda)
- **Visibilité** : Public (pour que l'iCal puisse les lire)

**Exemple de créneaux à créer :**
```
Titre: 🟢 DISPONIBLE
Date: Lundi 25 novembre 2025
Heure: 09:00 - 12:00 (sera divisé en 3 créneaux de 60 min : 09:00, 10:00, 11:00)
```

```
Titre: DISPONIBLE
Date: Mardi 26 novembre 2025
Heure: 14:00 - 17:00 (sera divisé en 3 créneaux de 60 min : 14:00, 15:00, 16:00)
```

### 2. Variables d'environnement

Le fichier `.env` doit contenir :

```env
# Google Calendar Configuration
GOOGLE_CALENDAR_ICAL_URL=https://calendar.google.com/calendar/ical/doriansarry47%40gmail.com/public/basic.ics
GOOGLE_CALENDAR_EMAIL=doriansarry47@gmail.com
GOOGLE_CALENDAR_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email Service (Resend)
RESEND_API_KEY=re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd
APP_URL=http://localhost:5173
```

### 3. Démarrer l'application

```bash
# Dans le terminal
cd /home/user/webapp
npm install
npm run dev
```

L'application sera disponible sur : http://localhost:5173

## 📝 Scénarios de Tests

### 🧪 Test 1 : Affichage des disponibilités

**Objectif** : Vérifier que les créneaux disponibles depuis Google Calendar sont correctement affichés

**Étapes** :
1. Ouvrir http://localhost:5173/book-appointment
2. Vérifier que la page charge sans erreur
3. Vérifier que le calendrier s'affiche
4. Vérifier que certaines dates sont en surbrillance (dates avec disponibilités)

**Résultat attendu** :
- ✅ Le calendrier affiche les dates futures uniquement
- ✅ Les dates passées sont grisées/désactivées
- ✅ Les dates avec créneaux disponibles sont visuellement distinctes
- ✅ Un message "X disponibilités chargées" apparaît dans la console

**En cas d'erreur** :
- Vérifier que Google Calendar contient des événements "DISPONIBLE" dans le futur
- Vérifier l'URL iCal dans le fichier `.env`
- Vérifier la console du navigateur pour les erreurs

---

### 🧪 Test 2 : Sélection d'une date disponible

**Objectif** : Vérifier que les créneaux horaires s'affichent correctement

**Étapes** :
1. Cliquer sur une date avec disponibilités
2. Vérifier que l'étape 2 (sélection de l'heure) s'affiche
3. Observer les créneaux horaires proposés

**Résultat attendu** :
- ✅ L'interface passe à l'étape 2 (indicateur de progression)
- ✅ Les créneaux horaires sont affichés sous forme de boutons
- ✅ Chaque créneau indique "60 min"
- ✅ Le nombre de créneaux disponibles est affiché
- ✅ La date sélectionnée est clairement visible

**En cas d'erreur** :
- Si aucun créneau n'apparaît, vérifier que les événements dans Google Calendar durent au moins 60 minutes
- Vérifier que les événements contiennent bien le mot-clé "DISPONIBLE"

---

### 🧪 Test 3 : Sélection d'un créneau horaire

**Objectif** : Vérifier le passage à l'étape de saisie des informations

**Étapes** :
1. Cliquer sur un créneau horaire (ex: 09:00)
2. Vérifier que l'interface passe à l'étape 3

**Résultat attendu** :
- ✅ L'interface passe à l'étape 3 (formulaire d'informations)
- ✅ Un récapitulatif affiche la date, l'heure et la durée (60 min)
- ✅ Le formulaire demande : prénom, nom, email, téléphone, motif
- ✅ Le bouton "Retour" permet de revenir en arrière

---

### 🧪 Test 4 : Réservation d'un rendez-vous

**Objectif** : Vérifier le processus complet de réservation

**Étapes** :
1. Remplir le formulaire avec des informations de test :
   - Prénom : Jean
   - Nom : Dupont
   - Email : (votre email réel pour recevoir la confirmation)
   - Téléphone : 06 12 34 56 78
   - Motif : Test de réservation
2. Cliquer sur "Confirmer le rendez-vous"
3. Attendre la confirmation

**Résultat attendu** :
- ✅ Un message "Confirmation en cours..." s'affiche
- ✅ Après quelques secondes, la page de confirmation apparaît
- ✅ Le message "🎉 Rendez-vous confirmé !" s'affiche
- ✅ Le récapitulatif montre toutes les informations correctes
- ✅ Une notification indique qu'un email a été envoyé

**En cas d'erreur** :
- Vérifier la console du navigateur pour les messages d'erreur
- Vérifier que la clé privée Google Calendar est correctement configurée
- Vérifier que le token Resend est valide

---

### 🧪 Test 5 : Vérification dans Google Calendar

**Objectif** : Confirmer que le rendez-vous a été créé dans Google Calendar

**Étapes** :
1. Ouvrir Google Calendar (https://calendar.google.com)
2. Se connecter avec doriansarry47@gmail.com
3. Naviguer vers la date du rendez-vous réservé
4. Vérifier qu'un événement est présent

**Résultat attendu** :
- ✅ Un événement "🩺 Consultation - Jean Dupont" est visible
- ✅ L'heure de début correspond à l'heure sélectionnée
- ✅ La durée est exactement 60 minutes
- ✅ Les détails de l'événement contiennent :
  - Email du patient
  - Téléphone du patient
  - Motif de consultation
- ✅ Un rappel est configuré pour 24h avant

---

### 🧪 Test 6 : Réception de l'email de confirmation

**Objectif** : Vérifier que le patient reçoit bien l'email

**Étapes** :
1. Vérifier la boîte email utilisée lors de la réservation
2. Chercher un email de "Dorian Sarry - Thérapie"
3. Ouvrir l'email

**Résultat attendu** :
- ✅ L'email est reçu dans les 1-2 minutes
- ✅ Le sujet contient "Confirmation de rendez-vous" et la date
- ✅ Le contenu HTML est correctement formaté
- ✅ Toutes les informations du rendez-vous sont présentes :
  - Date complète (jour, mois, année)
  - Heure de début et de fin
  - Nom du praticien
  - Motif de consultation
  - Adresse du cabinet
- ✅ Un bouton "Annuler le rendez-vous" est présent

**En cas d'absence d'email** :
- Vérifier le dossier Spam/Indésirables
- Vérifier que le token Resend est valide
- Consulter les logs du serveur pour les erreurs d'envoi

---

### 🧪 Test 7 : Créneaux non disponibles après réservation

**Objectif** : Vérifier que le créneau réservé n'est plus disponible

**Étapes** :
1. Noter le créneau qui vient d'être réservé (ex: Lundi 25 nov à 09:00)
2. Rafraîchir la page de réservation
3. Retourner à la sélection de cette même date
4. Vérifier les créneaux disponibles

**Résultat attendu** :
- ✅ Le créneau réservé n'apparaît plus dans la liste
- ✅ Les autres créneaux de la même plage sont toujours disponibles
- ✅ Si c'était le dernier créneau, la date n'est plus en surbrillance

---

### 🧪 Test 8 : Réservation d'un nouveau rendez-vous

**Objectif** : Tester le bouton "Nouveau rendez-vous"

**Étapes** :
1. Depuis la page de confirmation, cliquer sur "Nouveau rendez-vous"
2. Vérifier le retour à l'étape 1
3. Réserver un autre créneau avec d'autres informations

**Résultat attendu** :
- ✅ Le formulaire est complètement réinitialisé
- ✅ Aucune information de la réservation précédente n'est conservée
- ✅ La nouvelle réservation fonctionne normalement

---

### 🧪 Test 9 : Test de la durée fixe de 60 minutes

**Objectif** : Vérifier que tous les créneaux durent 60 minutes

**Étapes** :
1. Créer dans Google Calendar un événement "DISPONIBLE" de 2h30 (ex: 14:00 - 16:30)
2. Rafraîchir la page de réservation
3. Sélectionner cette date
4. Observer les créneaux générés

**Résultat attendu** :
- ✅ 2 créneaux de 60 min sont générés : 14:00 et 15:00
- ✅ Le créneau 16:00 n'est PAS généré (il ne reste que 30 min)
- ✅ Chaque créneau indique bien "(60 min)"

---

### 🧪 Test 10 : Gestion des erreurs

**Objectif** : Vérifier le comportement en cas d'erreur

**Scénarios à tester** :

#### A. Tentative de double réservation
1. Ouvrir 2 onglets avec la page de réservation
2. Réserver le même créneau dans les 2 onglets simultanément

**Résultat attendu** :
- ✅ Le premier onglet réussit
- ✅ Le second affiche une erreur "Ce créneau n'est plus disponible"

#### B. Formulaire incomplet
1. Essayer de soumettre sans remplir tous les champs obligatoires

**Résultat attendu** :
- ✅ Les champs manquants sont mis en évidence
- ✅ Un message d'erreur est affiché

#### C. Email invalide
1. Entrer un email invalide (ex: "test@")
2. Essayer de soumettre

**Résultat attendu** :
- ✅ Le champ email est marqué comme invalide
- ✅ La soumission est bloquée

---

## 🐛 Débogage

### Vérifier les logs du serveur

Dans le terminal où tourne `npm run dev`, vous devriez voir :

```
[GoogleCalendarIcal] Récupération des disponibilités depuis iCal...
[GoogleCalendarIcal] X créneaux disponibles trouvés
[BookingRouter] X créneaux trouvés, convertis en Y créneaux de 60min
[BookingRouter] ✅ Rendez-vous créé avec succès: [event-id]
[Email] Email de confirmation envoyé avec succès: [message-id]
```

### Vérifier les logs du navigateur

Ouvrir la console (F12) et vérifier :

```
✅ Disponibilités chargées: X dates
[BookingRouter] Disponibilités groupées pour X dates
```

### Erreurs courantes

#### "Service Google Calendar non configuré"
- **Cause** : Variables d'environnement manquantes
- **Solution** : Vérifier le fichier `.env`

#### "Aucun créneau disponible trouvé"
- **Cause** : Pas d'événements "DISPONIBLE" dans Google Calendar
- **Solution** : Créer des événements avec le bon mot-clé

#### "Erreur lors de la création du rendez-vous"
- **Cause** : Clé privée Google Calendar incorrecte
- **Solution** : Vérifier `GOOGLE_CALENDAR_PRIVATE_KEY` dans `.env`

#### "Email non envoyé"
- **Cause** : Token Resend invalide
- **Solution** : Vérifier `RESEND_API_KEY` dans `.env`

---

## ✅ Checklist de validation finale

Avant de considérer le système comme opérationnel, vérifier :

- [ ] Les disponibilités sont lues depuis Google Calendar
- [ ] Tous les créneaux affichés durent 60 minutes
- [ ] Les rendez-vous sont créés dans Google Calendar
- [ ] Les emails de confirmation sont envoyés
- [ ] Les rappels 24h avant sont configurés
- [ ] L'interface est responsive (mobile, tablette, desktop)
- [ ] Les dates passées ne sont pas sélectionnables
- [ ] Les créneaux réservés disparaissent de la liste
- [ ] Le bouton "Retour" fonctionne à chaque étape
- [ ] Le bouton "Nouveau rendez-vous" réinitialise tout
- [ ] Les informations du praticien sont correctes
- [ ] Les coordonnées du cabinet sont correctes

---

## 📊 Métriques de succès

Un test réussi doit aboutir à :

1. **Temps de chargement** : < 2 secondes pour afficher le calendrier
2. **Disponibilités** : Toutes les dates avec créneaux sont visibles
3. **Réservation** : < 5 secondes entre la confirmation et la page de succès
4. **Email** : Reçu en moins de 2 minutes
5. **Google Calendar** : Événement visible immédiatement après rafraîchissement
6. **Rappels** : Configurés automatiquement pour 24h avant

---

## 🎓 Notes importantes

### Pour les patients

- L'interface est **uniquement pour les patients**
- Aucune authentification n'est requise
- Les rendez-vous sont ajoutés automatiquement dans Google Calendar
- Un email de confirmation est envoyé immédiatement
- Un rappel automatique sera envoyé 24h avant

### Pour l'administrateur (vous)

- Gérez vos disponibilités **directement dans Google Calendar**
- Créez des événements avec le mot "DISPONIBLE" pour les rendre réservables
- Les rendez-vous confirmés apparaissent automatiquement dans votre agenda
- Vous recevrez une notification par email pour chaque nouveau rendez-vous
- Aucune interface d'administration n'est nécessaire

### Durée des rendez-vous

- **TOUS** les rendez-vous durent **exactement 60 minutes**
- Les créneaux de disponibilité sont automatiquement découpés en tranches de 60 min
- Si un créneau fait 2h30, il générera 2 créneaux de 60 min (pas 3)

---

## 🚀 Prochaines étapes après validation

Une fois tous les tests réussis :

1. ✅ Valider le fonctionnement complet
2. 📝 Noter les éventuels bugs ou améliorations
3. 🔧 Corriger les problèmes identifiés
4. 🎨 Ajuster l'UI/UX si nécessaire
5. 🚢 Déployer en production sur Vercel

---

**Bonne chance pour les tests ! 🎉**

Si vous rencontrez des problèmes, consultez les sections "Débogage" et "Erreurs courantes" ci-dessus.
