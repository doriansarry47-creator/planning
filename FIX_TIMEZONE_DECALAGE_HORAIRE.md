# 🕐 CORRECTION : Décalage Horaire d'Une Heure

**Date** : 2026-01-03  
**Priorité** : 🔴 CRITIQUE  
**Statut** : ✅ CORRIGÉ  
**Branch** : `fix/timezone-decalage-horaire`  
**Commit** : `0754fa0`

---

## 🐛 Problème Identifié

### Symptômes
- **Google Calendar** affiche un événement "DISPONIBLE" de **17h00 à 20h00**
- **L'Application Web** propose des créneaux de **16h00 à 19h00**
- **Décalage constaté** : **-1 heure systématique**

### Exemple Concret
```
📅 Google Calendar (Europe/Paris):
   └─ Événement "DISPONIBLE" : 17:00 - 20:00

🖥️ Application Web (affichage utilisateur):
   ├─ Créneau 1 : 16:00 - 17:00 ❌ (devrait être 17:00 - 18:00)
   ├─ Créneau 2 : 17:00 - 18:00 ❌ (devrait être 18:00 - 19:00)
   └─ Créneau 3 : 18:00 - 19:00 ❌ (devrait être 19:00 - 20:00)
```

---

## 🔍 Analyse de la Cause Racine

### Origine du Bug

Le problème se situait dans **`api/trpc.ts`** dans la fonction `getAvailableSlotsFromOAuth()` :

#### Code AVANT (bugué) :
```typescript
const dateStr = slotStart.toISOString().split('T')[0];      // ❌ UTC
const startTime = slotStart.toTimeString().slice(0, 5);     // ❌ Timezone locale serveur
const endTime = slotEnd.toTimeString().slice(0, 5);         // ❌ Timezone locale serveur
```

### Pourquoi ça causait un problème ?

1. **Google Calendar API** renvoie les événements avec `timeZone: 'Europe/Paris'`
2. **Dates JavaScript** sont stockées en UTC en interne
3. **`.toTimeString()`** utilise la timezone **du serveur Vercel** (probablement UTC)
4. **Résultat** : Conversion UTC → Europe/Paris = décalage de +1h, mais les créneaux affichent -1h

### Schéma du Bug

```
Google Calendar (17:00 Europe/Paris)
   ↓ API Google renvoie dateTime: "2026-01-03T17:00:00+01:00"
   ↓ new Date() parse en UTC: "2026-01-03T16:00:00Z"
   ↓ .toTimeString() affiche en UTC: "16:00:00"
   ↓ Application affiche: 16h00 ❌
```

---

## ✅ Solution Implémentée

### Code APRÈS (corrigé) :

```typescript
// ✅ CORRECTION TIMEZONE: Utiliser Europe/Paris pour l'affichage
const dateStr = slotStart.toLocaleString('fr-FR', { 
  timeZone: 'Europe/Paris', 
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit' 
}).split('/').reverse().join('-');

const startTime = slotStart.toLocaleString('fr-FR', { 
  timeZone: 'Europe/Paris', 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false
});

const endTime = slotEnd.toLocaleString('fr-FR', { 
  timeZone: 'Europe/Paris', 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false
});
```

### Schéma de la Correction

```
Google Calendar (17:00 Europe/Paris)
   ↓ API Google renvoie dateTime: "2026-01-03T17:00:00+01:00"
   ↓ new Date() parse en UTC: "2026-01-03T16:00:00Z"
   ↓ .toLocaleString('fr-FR', {timeZone: 'Europe/Paris'}) → "17:00"
   ↓ Application affiche: 17h00 ✅
```

---

## 📝 Modifications Apportées

### Fichiers Modifiés

| Fichier | Fonction | Lignes | Description |
|---------|----------|--------|-------------|
| `api/trpc.ts` | `getAvailableSlotsFromOAuth()` | 245-270 | Génération des créneaux avec timezone Paris |
| `api/trpc.ts` | `getBookedSlots()` | 360-375 | Lecture des RDV en BD avec timezone Paris |

### Améliorations Supplémentaires

#### 1. Logs de Debugging Timezone
```typescript
console.log('[Vercel TRPC Timezone] 🕐 Événement Google Calendar:', {
  title: dispoEvent.summary,
  startISO: dispoEvent.start.dateTime,      // Raw ISO from Google
  endISO: dispoEvent.end.dateTime,
  startParsed: eventStart.toISOString(),    // Parsed UTC
  endParsed: eventEnd.toISOString(),
});

console.log('[Vercel TRPC Timezone] 🎯 Créneau généré:', {
  slotKey,
  dateStr,
  startTime,
  endTime,
  slotStartUTC: slotStart.toISOString(),    // UTC reference
  slotEndUTC: slotEnd.toISOString(),
});
```

#### 2. Cohérence Base de Données
La fonction `getBookedSlots()` utilise maintenant aussi `Europe/Paris` pour garantir la cohérence lors de la comparaison avec les créneaux générés.

---

## 🧪 Tests de Validation

### Scénario de Test

#### Données de Test
```
📅 Google Calendar (Europe/Paris):
   Événement: "DISPONIBLE"
   Date: 2026-01-03
   Heure: 17:00 - 20:00 (Europe/Paris)
```

#### Résultats Attendus
```
✅ L'application doit afficher:
   ├─ Créneau 1 : 17:00 - 18:00
   ├─ Créneau 2 : 18:00 - 19:00
   └─ Créneau 3 : 19:00 - 20:00
```

### Vérification dans les Logs Vercel

Cherchez ces logs après déploiement :

```
✅ Logs attendus :
[Vercel TRPC Timezone] 🕐 Événement Google Calendar: {
  title: 'DISPONIBLE',
  startISO: '2026-01-03T17:00:00+01:00',
  startParsed: '2026-01-03T16:00:00.000Z'  // UTC normal
}

[Vercel TRPC Timezone] 🎯 Créneau généré: {
  slotKey: '2026-01-03|17:00',   // ✅ 17:00 pas 16:00 !
  startTime: '17:00',
  endTime: '18:00',
  slotStartUTC: '2026-01-03T16:00:00.000Z'
}
```

---

## 🚀 Déploiement

### Étapes à Suivre

1. **Récupérer les dernières modifications** :
   ```bash
   git fetch origin main
   git rebase origin/main
   ```

2. **Pousser la branche** :
   ```bash
   git push origin fix/timezone-decalage-horaire
   ```

3. **Créer une Pull Request** :
   - Depuis : `fix/timezone-decalage-horaire`
   - Vers : `main`
   - Titre : "fix(timezone): Corriger le décalage horaire d'une heure"

4. **Vercel Preview** :
   - URL générée automatiquement
   - Tester les créneaux avant merge

5. **Merger vers Production** :
   - Après validation des tests
   - Déploiement automatique Vercel

6. **Vérifier la Production** :
   - URL : https://webapp-frtjapec0-ikips-projects.vercel.app
   - Consulter les logs Vercel

---

## 📊 Impact de la Correction

### Avant la Correction
```
❌ Utilisateur voit 16h00 disponible
❌ Utilisateur réserve à 16h00
❌ Praticien attend le patient à 17h00
❌ Confusion totale
```

### Après la Correction
```
✅ Utilisateur voit 17h00 disponible
✅ Utilisateur réserve à 17h00
✅ Praticien attend le patient à 17h00
✅ Synchronisation parfaite Calendar ↔ Application
```

### Bénéfices
- ✅ **Cohérence totale** entre Google Calendar et l'application
- ✅ **Évite les malentendus** entre praticien et patients
- ✅ **Fiabilité** des réservations
- ✅ **Logs détaillés** pour debugging futur

---

## 🔧 Points Techniques Importants

### Pourquoi `toLocaleString()` ?

```typescript
// ❌ MAUVAIS: Utilise la timezone du serveur (UTC sur Vercel)
date.toTimeString()           // → "16:00:00 GMT+0000 (UTC)"

// ❌ MAUVAIS: Toujours en UTC
date.toISOString()            // → "2026-01-03T16:00:00.000Z"

// ✅ BON: Force la timezone souhaitée
date.toLocaleString('fr-FR', { 
  timeZone: 'Europe/Paris'    // → "17:00"
})
```

### Gestion des Timezones en JavaScript

| Méthode | Timezone | Usage |
|---------|----------|-------|
| `new Date()` | UTC (interne) | Stockage |
| `.toISOString()` | UTC | API / BD |
| `.toTimeString()` | Locale serveur | ❌ À éviter |
| `.toLocaleString('fr-FR', {timeZone})` | Spécifiée | ✅ Affichage |

### Règles d'Or

1. **Toujours stocker en UTC** (base de données)
2. **Afficher dans la timezone utilisateur** (Europe/Paris)
3. **Utiliser `toLocaleString()` avec `timeZone`** explicite
4. **Logger les deux formats** (UTC et local) pour debugging

---

## 🔗 Références

- **Commit** : `0754fa0`
- **Branch** : `fix/timezone-decalage-horaire`
- **PR** : (à créer)
- **Documentation Liée** :
  - `RÉSOLUTION_CRITIQUE_DISPONIBILITÉS.md`
  - `OAUTH2_MIGRATION_GUIDE.md`
  - `README.md`

---

## 📞 Contact

**Auteur** : @doriansarry47-creator  
**Date** : 2026-01-03  
**Version** : 1.0.0

---

## ✅ Checklist de Validation

- [x] Code corrigé dans `api/trpc.ts`
- [x] Logs de debugging ajoutés
- [x] Commit effectué avec message descriptif
- [ ] Tests manuels sur Preview Vercel
- [ ] Pull Request créée
- [ ] Merge vers `main`
- [ ] Déploiement Production validé
- [ ] Logs Vercel vérifiés
- [ ] Tests utilisateur finaux

---

**Status Final** : 🟢 CORRECTION PRÊTE POUR DÉPLOIEMENT
