# Scénarios de Tests Utilisateurs 🧪

Guide complet des tests manuels à effectuer sur l'application Planning App.

---

## 🎯 Objectif

Valider que toutes les fonctionnalités de l'application fonctionnent correctement du point de vue de l'utilisateur final.

---

## 📋 Prérequis

- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Connexion Internet stable
- URL de production : https://webapp-frtjapec0-ikips-projects.vercel.app

---

## 🧪 Scénario 1 : Première Visite - Découverte de l'Application

### Objectif
Tester l'expérience d'un nouvel utilisateur qui découvre l'application.

### Étapes
1. Ouvrir le navigateur en mode navigation privée
2. Accéder à : https://webapp-frtjapec0-ikips-projects.vercel.app
3. Observer le temps de chargement initial
4. Examiner la page d'accueil

### Résultats Attendus
- ✅ La page se charge en moins de 10 secondes
- ✅ Le titre "Planning & Scheduling App" est visible
- ✅ Le sous-titre explique le but de l'application
- ✅ Deux boutons principaux sont affichés :
  - "Book Appointment" (bleu)
  - "View My Appointments" (outline)
- ✅ Trois cartes de fonctionnalités sont présentes :
  - Easy Booking
  - Real-time Updates
  - Admin Dashboard
- ✅ Le design est professionnel et épuré
- ✅ Aucune erreur dans la console du navigateur (F12)

### Critères de Succès
- [ ] Temps de chargement acceptable
- [ ] Tous les éléments visuels s'affichent
- [ ] Le texte est lisible
- [ ] Pas d'erreur JavaScript

---

## 🧪 Scénario 2 : Navigation - Tentative de Réservation

### Objectif
Tester le flux de navigation vers la page de réservation.

### Étapes
1. Depuis la page d'accueil
2. Cliquer sur le bouton "Book Appointment"
3. Attendre le chargement de la page

### Résultats Attendus
- ✅ Redirection vers `/book-appointment`
- ✅ URL change correctement dans la barre d'adresse
- ✅ Titre de la page : "Book Appointment"
- ✅ Message affiché : "Appointment booking form coming soon..."
- ✅ Pas de spinner de chargement infini
- ✅ Pas d'erreur 404

### Actions Supplémentaires
1. Utiliser le bouton "Retour" du navigateur
2. Vérifier le retour à la page d'accueil

### Critères de Succès
- [ ] Navigation fluide
- [ ] Pages se chargent correctement
- [ ] Bouton retour fonctionne
- [ ] Pas de perte de contexte

---

## 🧪 Scénario 3 : Accès aux Rendez-vous (Non Authentifié)

### Objectif
Vérifier que les routes protégées redirigent correctement les utilisateurs non authentifiés.

### Étapes
1. Depuis la page d'accueil
2. Cliquer sur "View My Appointments"
3. Observer le comportement

### Résultats Attendus
- ✅ Un spinner de chargement s'affiche brièvement
- ✅ Redirection automatique vers la page d'accueil
- ✅ Pas d'accès à la page des rendez-vous
- ✅ Pas de message d'erreur affiché
- ✅ Comportement cohérent avec la protection des routes

### Test Alternatif
1. Accéder directement à : https://webapp-frtjapec0-ikips-projects.vercel.app/appointments
2. Observer le même comportement de redirection

### Critères de Succès
- [ ] Protection des routes fonctionne
- [ ] Redirection rapide
- [ ] Pas d'affichage de données sensibles
- [ ] UX cohérente

---

## 🧪 Scénario 4 : Tentative d'Accès Admin (Non Autorisé)

### Objectif
Valider que la page admin est protégée et inaccessible sans authentification.

### Étapes
1. Dans la barre d'adresse, entrer : https://webapp-frtjapec0-ikips-projects.vercel.app/admin
2. Appuyer sur Entrée
3. Observer le comportement

### Résultats Attendus
- ✅ Spinner de chargement brièvement visible
- ✅ Redirection vers la page d'accueil
- ✅ Aucune donnée admin n'est visible
- ✅ Pas de message d'erreur explicite
- ✅ Console du navigateur sans erreur

### Critères de Succès
- [ ] Sécurité de la route admin
- [ ] Pas de fuite d'information
- [ ] Redirection appropriée
- [ ] Pas d'erreur critique

---

## 🧪 Scénario 5 : Page 404 - Gestion des Erreurs

### Objectif
Tester la gestion des pages inexistantes et le retour à la navigation normale.

### Étapes
1. Accéder à : https://webapp-frtjapec0-ikips-projects.vercel.app/page-qui-nexiste-pas
2. Observer la page d'erreur
3. Cliquer sur le bouton "Go Home"
4. Vérifier le retour à l'accueil

### Résultats Attendus
- ✅ Page 404 personnalisée s'affiche
- ✅ Gros "404" bien visible
- ✅ Message "Page not found"
- ✅ Bouton "Go Home" présent et stylisé
- ✅ Clic sur le bouton ramène à l'accueil
- ✅ Design cohérent avec le reste de l'app

### Tests Additionnels
Essayer différentes URLs invalides :
- `/abc123`
- `/admin/settings`
- `/user/profile`

### Critères de Succès
- [ ] Toutes les routes invalides montrent la page 404
- [ ] Bouton de retour fonctionne
- [ ] Design professionnel de la page d'erreur
- [ ] Pas de double redirection

---

## 🧪 Scénario 6 : Tests Responsive - Mobile

### Objectif
Valider que l'application est utilisable sur mobile.

### Étapes
1. Ouvrir les DevTools (F12)
2. Activer le mode responsive (Ctrl+Shift+M)
3. Sélectionner iPhone 12/13 Pro
4. Naviguer sur toutes les pages

### Résultats Attendus
- ✅ Layout s'adapte à la taille d'écran
- ✅ Textes restent lisibles
- ✅ Boutons sont facilement cliquables (taille suffisante)
- ✅ Pas de débordement horizontal
- ✅ Les cartes se réorganisent en colonne unique
- ✅ Navigation fluide sur mobile

### Résolutions à Tester
- 375x667 (iPhone SE)
- 390x844 (iPhone 12/13)
- 414x896 (iPhone 11 Pro Max)

### Critères de Succès
- [ ] Affichage correct sur toutes les résolutions
- [ ] Éléments interactifs accessibles
- [ ] Pas de contenu coupé
- [ ] Performances acceptables

---

## 🧪 Scénario 7 : Tests Responsive - Tablet

### Objectif
Vérifier l'adaptation sur tablette.

### Étapes
1. Mode responsive dans DevTools
2. Sélectionner iPad
3. Tester en portrait et paysage
4. Naviguer sur les pages

### Résultats Attendus
- ✅ Grid des cartes en 2 colonnes (ou 3)
- ✅ Espacement approprié
- ✅ Typographie adaptée
- ✅ Navigation confortable

### Résolutions à Tester
- 768x1024 (iPad)
- 820x1180 (iPad Air)
- 1024x1366 (iPad Pro)

### Critères de Succès
- [ ] Layout adapté aux tablettes
- [ ] Bon usage de l'espace
- [ ] Interface intuitive
- [ ] Pas de white space excessif

---

## 🧪 Scénario 8 : Performance - Temps de Chargement

### Objectif
Mesurer les performances de l'application.

### Étapes
1. Ouvrir DevTools (F12)
2. Aller dans l'onglet Network
3. Cocher "Disable cache"
4. Recharger la page (Ctrl+Shift+R)
5. Noter les métriques

### Métriques à Vérifier
- Time to First Byte (TTFB) : < 500ms
- First Contentful Paint (FCP) : < 2s
- Largest Contentful Paint (LCP) : < 4s
- Time to Interactive (TTI) : < 5s
- Total Load Time : < 10s

### Ressources Chargées
- ✅ index.html : < 1 KB
- ✅ CSS bundle : ~67 KB
- ✅ JS bundle : ~466 KB
- ✅ Total transfert : < 600 KB

### Critères de Succès
- [ ] LCP < 4 secondes
- [ ] TTI < 5 secondes
- [ ] Taille totale raisonnable
- [ ] Compression gzip active

---

## 🧪 Scénario 9 : Console et Erreurs JavaScript

### Objectif
S'assurer qu'il n'y a pas d'erreurs JavaScript qui impactent l'expérience.

### Étapes
1. Ouvrir DevTools (F12)
2. Aller dans l'onglet Console
3. Vider la console
4. Naviguer sur toutes les pages
5. Observer les messages

### Résultats Attendus
- ✅ Aucune erreur rouge
- ✅ Éventuellement des infos ou warnings (acceptables)
- ✅ Message React DevTools (normal)
- ✅ Pas d'erreur de chargement de ressources
- ✅ Pas d'erreur CORS

### Messages Acceptables
- Info sur React DevTools
- Warnings de développement (si mode dev)

### Critères de Succès
- [ ] Zero erreur critique
- [ ] Pas de warning bloquant
- [ ] Console propre
- [ ] Pas de stack trace d'erreur

---

## 🧪 Scénario 10 : SEO et Métadonnées

### Objectif
Vérifier les métadonnées pour le référencement.

### Étapes
1. Afficher le code source (Ctrl+U)
2. Vérifier les balises meta

### Éléments à Vérifier
- ✅ `<title>` présent : "Planning App"
- ✅ `<meta charset="UTF-8">`
- ✅ `<meta viewport>` configuré
- ✅ Favicon défini
- ✅ Apple touch icon

### Améliorations Futures
- Meta description
- Open Graph tags (Facebook)
- Twitter Card tags
- Structured data (Schema.org)

### Critères de Succès
- [ ] Title présent
- [ ] Viewport configuré
- [ ] HTML5 valide
- [ ] Base SEO OK

---

## 📊 Grille de Tests - Récapitulatif

| Scénario | Priorité | Statut | Notes |
|----------|----------|--------|-------|
| 1. Première visite | 🔴 Haute | ⏳ | |
| 2. Navigation réservation | 🔴 Haute | ⏳ | |
| 3. Routes protégées | 🔴 Haute | ⏳ | |
| 4. Admin non autorisé | 🔴 Haute | ⏳ | |
| 5. Page 404 | 🟡 Moyenne | ⏳ | |
| 6. Responsive mobile | 🔴 Haute | ⏳ | |
| 7. Responsive tablet | 🟡 Moyenne | ⏳ | |
| 8. Performance | 🟡 Moyenne | ⏳ | |
| 9. Console errors | 🔴 Haute | ⏳ | |
| 10. SEO | 🟢 Basse | ⏳ | |

---

## 🐛 Rapport de Bugs - Template

Si vous trouvez un bug, documentez-le ainsi :

### Bug #[Numéro]

**Titre** : [Description courte du bug]

**Priorité** : 🔴 Haute / 🟡 Moyenne / 🟢 Basse

**Environnement** :
- Navigateur : [Chrome/Firefox/Safari/Edge]
- Version : [Version du navigateur]
- OS : [Windows/Mac/Linux/iOS/Android]
- Résolution : [1920x1080 / Mobile / etc.]

**Description** :
[Description détaillée du problème]

**Steps to Reproduce** :
1. Étape 1
2. Étape 2
3. Étape 3

**Comportement Actuel** :
[Ce qui se passe actuellement]

**Comportement Attendu** :
[Ce qui devrait se passer]

**Screenshots** :
[Ajouter des captures d'écran si possible]

**Console Errors** :
```
[Copier les erreurs de la console]
```

---

## ✅ Critères de Validation Globaux

L'application est considérée comme validée si :

1. ✅ Tous les scénarios haute priorité passent
2. ✅ Aucune erreur critique JavaScript
3. ✅ Navigation fluide sur desktop et mobile
4. ✅ Temps de chargement < 10 secondes
5. ✅ Design cohérent sur toutes les pages
6. ✅ Routes protégées fonctionnent
7. ✅ Page 404 s'affiche correctement
8. ✅ Pas de régression visuelle

---

## 📝 Notes pour les Testeurs

- Tester dans différents navigateurs
- Vider le cache entre les tests
- Tester avec une connexion lente (Throttling)
- Essayer des interactions rapides (spam de clics)
- Tester le bouton retour du navigateur
- Vérifier les shortcuts clavier (Tab, Enter, Escape)

---

**Date de création** : 2025-11-10  
**Version de l'app testée** : 1.0.0  
**URL de test** : https://webapp-frtjapec0-ikips-projects.vercel.app
