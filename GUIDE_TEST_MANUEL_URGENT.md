# 🚨 GUIDE DE TEST MANUEL URGENT - Création de Créneaux

**Date**: 2025-11-19  
**Problème corrigé**: Modal de date de fin de récurrence (ajout de `modal={true}`)  
**URL de l'application**: https://3000-i13ep9dwuqegv2dzas5x0-ad490db5.sandbox.novita.ai

---

## ✅ CORRECTION APPLIQUÉE

### Problème identifié
Le modal pour sélectionner la date de fin de récurrence ne s'ouvrait pas correctement dans le formulaire de création de créneaux récurrents.

### Cause
Manque de l'attribut `modal={true}` sur le composant `Popover` à la ligne 857 du fichier `SlotCreationDialog.tsx`.

### Solution appliquée
```tsx
// AVANT (ligne 857)
<Popover>

// APRÈS (ligne 857)
<Popover modal={true}>
```

**Fichier modifié**: `/home/user/webapp/client/src/components/admin/SlotCreationDialog.tsx`  
**Ligne**: 857

---

## 🧪 SCÉNARIO DE TEST COMPLET

### PHASE 1: Connexion Admin (5 minutes)

#### Étape 1.1: Accéder à la page de connexion
1. **Ouvrir le navigateur** (Chrome, Firefox, Safari, Edge)
2. **URL à saisir**: 
   ```
   https://3000-i13ep9dwuqegv2dzas5x0-ad490db5.sandbox.novita.ai/login
   ```
3. **Vérification**: La page de connexion s'affiche avec les champs email et mot de passe

#### Étape 1.2: Saisir les identifiants admin
1. **Email**: `doriansarry@yahoo.fr`
2. **Mot de passe**: `admin123`
3. **Action**: Cliquer sur le bouton "Se connecter" ou "Login"

#### Étape 1.3: Vérification de la connexion
- ✅ **Attendu**: Redirection automatique vers le dashboard
- ✅ **Vérifier**: Votre nom/email apparaît en haut à droite
- ✅ **URL actuelle**: Devrait être `/admin` ou dashboard admin

---

### PHASE 2: Navigation vers la Gestion des Disponibilités (2 minutes)

#### Étape 2.1: Accéder à la section Disponibilités
1. **Dans le dashboard admin**, chercher l'onglet ou la section "Disponibilités" ou "Créneaux"
2. **Ou accéder directement via URL**:
   ```
   https://3000-i13ep9dwuqegv2dzas5x0-ad490db5.sandbox.novita.ai/admin
   ```
3. **Vérification**: Vous voyez un calendrier et un bouton "Nouveau créneau"

---

### PHASE 3: 🔥 TEST CRITIQUE - Création de Créneaux Récurrents (10 minutes)

#### Étape 3.1: Ouvrir le formulaire de création
1. **Action**: Cliquer sur le bouton **"Nouveau créneau"** ou **"+ Nouveau créneau"**
2. **Vérification**: Une fenêtre modale (popup) s'ouvre
3. **Vérifier**: Deux onglets sont visibles:
   - "Créneau simple"
   - "Créneaux récurrents"

#### Étape 3.2: Passer en mode Récurrent
1. **Action**: Cliquer sur l'onglet **"Créneaux récurrents"**
2. **Vérification**: Le formulaire change pour afficher les options de récurrence

#### Étape 3.3: Sélectionner le type (Disponibilité)
1. **Action**: Cliquer sur le bouton **"Disponibilité"** (bouton vert)
2. **Vérification**: Le bouton devient actif/sélectionné

#### Étape 3.4: Configurer la date de début
1. **Action**: Cliquer sur le champ **"Date de début"**
2. **Vérification**: Un calendrier s'ouvre
3. **Action**: Sélectionner **aujourd'hui** ou la date du lundi prochain
4. **Vérification**: La date s'affiche dans le champ

#### Étape 3.5: Configurer les horaires
1. **Champ "Heure de début"**: Saisir `18:00`
2. **Champ "Heure de fin"**: Saisir `20:00`
3. **Champ "Durée du créneau"**: Laisser `60` minutes (ou ajuster selon besoin)
4. **Champ "Pause entre créneaux"**: Laisser `0` ou ajuster

#### Étape 3.6: Sélectionner les jours de la semaine
1. **Action**: Cliquer sur les badges des jours suivants:
   - ✅ **Lundi**
   - ✅ **Mardi**
   - ✅ **Jeudi**
   - ✅ **Vendredi**
2. **Vérification**: Les jours sélectionnés deviennent bleus/actifs
3. **Important**: Mercredi, Samedi, Dimanche doivent rester NON sélectionnés

#### Étape 3.7: 🔥 TEST CRITIQUE - Configurer la date de fin de récurrence
**C'EST ICI QUE LE BUG SE PRODUISAIT !**

1. **Action**: Cocher la case **"Jusqu'à une date"**
2. **Vérification**: Un champ de date apparaît en dessous
3. **Action CRITIQUE**: Cliquer sur le bouton **"Sélectionner une date de fin"**
4. **VÉRIFICATION DU FIX**: 
   - ✅ **SUCCÈS**: Un calendrier s'ouvre normalement
   - ❌ **ÉCHEC**: Rien ne se passe ou erreur JavaScript dans la console
5. **Action**: Sélectionner une date **4 semaines dans le futur**
6. **Vérification**: La date s'affiche dans le champ

**ALTERNATIVE - Test avec "Nombre d'occurrences"**:
1. Cocher la case **"Après un nombre d'occurrences"**
2. Saisir `16` (4 semaines × 4 jours = 16 créneaux)

#### Étape 3.8: Prévisualiser les créneaux
1. **Action**: Cliquer sur le bouton **"Prévisualiser"** (en bas du formulaire)
2. **Vérification**: Une liste de créneaux s'affiche
3. **Vérifier**:
   - ✅ Les créneaux sont de 18h00 à 20h00
   - ✅ Seulement Lundi, Mardi, Jeudi, Vendredi apparaissent
   - ✅ Aucun conflit n'est signalé
   - ✅ Le nombre total de créneaux est affiché

#### Étape 3.9: Créer les créneaux
1. **Action**: Cliquer sur le bouton **"Créer X créneau(x)"**
2. **Vérification**: 
   - ✅ Message de succès apparaît (toast notification)
   - ✅ Le modal se ferme
   - ✅ Le calendrier se recharge

#### Étape 3.10: Vérifier les créneaux dans le calendrier
1. **Vérification visuelle**: Dans le calendrier, vérifier que:
   - ✅ Les créneaux 18h-20h apparaissent les bons jours
   - ✅ Aucun créneau n'apparaît Mercredi, Samedi, Dimanche
   - ✅ Les créneaux sont marqués "Disponible" (vert)

---

### PHASE 4: Déconnexion et Préparation Test Patient (2 minutes)

#### Étape 4.1: Se déconnecter
1. **Action**: Cliquer sur votre profil ou menu utilisateur
2. **Action**: Cliquer sur **"Déconnexion"** ou **"Logout"**
3. **Vérification**: Retour à la page d'accueil ou de connexion

---

### PHASE 5: Test Prise de Rendez-vous (Patient) (5 minutes)

#### Étape 5.1: Accéder à la page de réservation
1. **URL à saisir**:
   ```
   https://3000-i13ep9dwuqegv2dzas5x0-ad490db5.sandbox.novita.ai/book
   ```
   **OU**
   ```
   https://3000-i13ep9dwuqegv2dzas5x0-ad490db5.sandbox.novita.ai/book-appointment
   ```

#### Étape 5.2: Sélectionner un praticien
1. **Action**: Sélectionner le praticien pour lequel vous avez créé les créneaux
2. **Vérification**: La liste des créneaux disponibles s'affiche

#### Étape 5.3: Sélectionner un créneau
1. **Vérification**: Les créneaux 18h-20h sont visibles pour les bons jours
2. **Action**: Cliquer sur un créneau disponible (par exemple, Lundi 18h00)
3. **Vérification**: Le créneau est sélectionné/mis en surbrillance

#### Étape 5.4: Remplir les informations patient
1. **Remplir les champs requis**:
   - Nom complet
   - Email
   - Téléphone
   - Type de consultation (si demandé)
   - Notes (optionnel)
2. **Action**: Cliquer sur **"Confirmer le rendez-vous"** ou **"Réserver"**

#### Étape 5.5: Vérifier la confirmation
- ✅ **Attendu**: Message de confirmation apparaît
- ✅ **Vérifier**: Un email de confirmation est envoyé (si configuré)
- ✅ **Vérifier**: Le créneau n'est plus disponible pour d'autres patients

---

### PHASE 6: Vérification Finale (Admin) (3 minutes)

#### Étape 6.1: Se reconnecter en tant qu'admin
1. **URL**: 
   ```
   https://3000-i13ep9dwuqegv2dzas5x0-ad490db5.sandbox.novita.ai/login
   ```
2. **Identifiants**: `doriansarry@yahoo.fr` / `admin123`

#### Étape 6.2: Vérifier le créneau réservé
1. **Navigation**: Aller dans "Disponibilités" ou dashboard admin
2. **Vérification dans le calendrier**:
   - ✅ Le créneau réservé apparaît différemment (bleu au lieu de vert)
   - ✅ Le statut est "Réservé" ou "Booked"
   - ✅ Les informations du patient sont visibles
3. **Action**: Cliquer sur le créneau réservé
4. **Vérification**: Les détails du rendez-vous s'affichent:
   - Nom du patient
   - Email
   - Téléphone
   - Type de consultation
   - Notes

---

## 📊 CHECKLIST DE VALIDATION

### ✅ Validation Technique
- [ ] Le modal de date de fin de récurrence s'ouvre correctement
- [ ] Les créneaux récurrents sont créés sans erreur
- [ ] Les créneaux apparaissent dans le calendrier
- [ ] Les horaires sont corrects (18h-20h)
- [ ] Les jours sont corrects (Lun, Mar, Jeu, Ven uniquement)

### ✅ Validation Fonctionnelle
- [ ] Un patient peut voir les créneaux disponibles
- [ ] Un patient peut réserver un créneau
- [ ] Le créneau réservé change de statut
- [ ] L'admin peut voir les détails de la réservation

### ✅ Validation UX
- [ ] Aucune erreur JavaScript dans la console
- [ ] Les messages de succès/erreur sont clairs
- [ ] La navigation est fluide
- [ ] Les données sont cohérentes entre les vues

---

## 🐛 RAPPORT D'ERREURS

### Si vous rencontrez des problèmes, noter:

1. **Type d'erreur**:
   - [ ] Le modal ne s'ouvre pas
   - [ ] Les créneaux ne sont pas créés
   - [ ] Les créneaux ne s'affichent pas dans le calendrier
   - [ ] Erreur lors de la réservation patient
   - [ ] Autre: _____________________

2. **Message d'erreur** (si affiché):
   ```
   [Copier le message d'erreur ici]
   ```

3. **Console du navigateur** (F12 > Console):
   ```
   [Copier les erreurs JavaScript ici]
   ```

4. **Capture d'écran**:
   - Faire une capture d'écran du problème
   - Noter l'étape exacte où l'erreur se produit

---

## 📝 NOTES IMPORTANTES

### Navigateurs testés:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Résolution d'écran:
- Minimum recommandé: 1280x720
- Optimal: 1920x1080

### Connexion Internet:
- Stable et fonctionnelle
- L'application utilise des appels API en temps réel

---

## ✅ RÉSULTAT ATTENDU

Si tous les tests passent:
1. ✅ Le modal de date de fin s'ouvre normalement
2. ✅ Les créneaux récurrents sont créés avec succès
3. ✅ Les créneaux apparaissent dans le calendrier admin
4. ✅ Les patients peuvent réserver ces créneaux
5. ✅ Les réservations sont visibles côté admin

**Temps total estimé**: 25-30 minutes pour le test complet

---

## 📞 CONTACT

Pour tout problème ou question:
- Vérifier d'abord la console du navigateur (F12)
- Noter l'étape exacte où le problème survient
- Capturer une screenshot si possible
- Copier les messages d'erreur

---

**FIN DU GUIDE DE TEST**
