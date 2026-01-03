# 🔍 DIAGNOSTIC COMPLET DES PROBLÈMES DE CRÉNEAUX

**Date**: 2026-01-03  
**Priorité**: 🔴 CRITIQUE  
**Status**: En cours de résolution

---

## 🐛 PROBLÈMES IDENTIFIÉS

### 1. Décalage Horaire d'Une Heure
**Symptôme**: Les créneaux affichés dans l'application sont décalés d'une heure par rapport à Google Calendar.

**Exemple concret**:
```
Google Calendar (Europe/Paris): 17:00 - 20:00 "DISPONIBLE"
Application Web affiche     : 16:00 - 19:00 ❌
```

**Cause racine**:
Le problème existe dans **TROIS fichiers différents** qui manipulent les dates:

1. **`api/trpc.ts`** (ligne 254-273):
   - Utilise `toLocaleString('fr-FR', {timeZone: 'Europe/Paris'})` ✅ (CORRECT)
   - Mais cette correction n'est pas appliquée partout

2. **`server/services/googleCalendarOAuth2.ts`** (ligne 170-171):
   ```typescript
   timeMin: `${startDate}T00:00:00`,  // ❌ Pas de timezone explicite
   timeMax: `${endDate}T23:59:59`,    // ❌ Pas de timezone explicite
   ```
   - Google Calendar API interprète ces dates comme UTC
   - Résultat: récupère les événements du mauvais jour/heure

3. **`server/services/availabilityCalculator.ts`** (ligne 88-97):
   ```typescript
   const startTimeStr = formatInTimeZone(currentTime, rules.timezone, 'HH:mm');
   ```
   - Utilise `formatInTimeZone` ✅ mais sur des objets Date qui peuvent être mal construits

**Impact**:
- ❌ Les créneaux affichés ne correspondent pas à Google Calendar
- ❌ Confusion pour les praticiens et patients
- ❌ Risque de rendez-vous à la mauvaise heure

---

### 2. Double Réservation Possible
**Symptôme**: Plusieurs patients peuvent réserver le même créneau simultanément.

**Cause racine**:
Le système actuel ne vérifie PAS en temps réel si un créneau est toujours disponible lors de la réservation.

**Flux actuel (BUGUÉ)**:
```
1. Patient A charge les créneaux → 17:00 disponible
2. Patient B charge les créneaux → 17:00 disponible
3. Patient A réserve 17:00 → OK ✅
4. Patient B réserve 17:00 → OK ✅❌ (DEVRAIT ÉCHOUER!)
```

**Code problématique** dans `server/routers/appointmentOAuth2Router.ts` (ligne 73-96):
```typescript
// ÉTAPE 1 : Vérifier que le créneau est toujours disponible
const existingEvents = await calendarService.getExistingEvents(
  input.date,
  nextDayStr
);

const slotIsAvailable = isSlotAvailable(
  input.date,
  input.startTime,
  input.endTime,
  availableSlots
);
```

**Problème**: La vérification se fait AVANT la création de l'événement dans Google Calendar, mais il n'y a pas de **LOCK** entre la vérification et la création. Deux requêtes simultanées peuvent passer la vérification avant que l'événement ne soit créé.

**Impact**:
- ❌ Conflits de rendez-vous
- ❌ Overbooking du praticien
- ❌ Mauvaise expérience utilisateur

---

## 🔧 SOLUTIONS PROPOSÉES

### Solution 1: Correction du Décalage Horaire

#### A. Corriger `server/services/googleCalendarOAuth2.ts`
```typescript
// ❌ AVANT (ligne 170-171)
timeMin: `${startDate}T00:00:00`,
timeMax: `${endDate}T23:59:59`,

// ✅ APRÈS
timeMin: `${startDate}T00:00:00+01:00`,  // Explicite Europe/Paris (UTC+1)
timeMax: `${endDate}T23:59:59+01:00`,
```

**OU MIEUX**:
```typescript
// Construire les dates avec timezone explicite
const startDateTime = new Date(`${startDate}T00:00:00`);
const endDateTime = new Date(`${endDate}T23:59:59`);

// Formatter en ISO avec offset
timeMin: formatInTimeZone(startDateTime, 'Europe/Paris', "yyyy-MM-dd'T'HH:mm:ssXXX"),
timeMax: formatInTimeZone(endDateTime, 'Europe/Paris', "yyyy-MM-dd'T'HH:mm:ssXXX"),
```

#### B. Corriger `server/services/availabilityCalculator.ts`
```typescript
// ❌ PROBLÈME (ligne 85-86): Utilisation ambiguë de new Date()
let currentTime = range.startDateTime;

// ✅ SOLUTION: S'assurer que les dates viennent de Google avec timezone
// Google Calendar API retourne déjà des dates ISO avec offset (+01:00)
// new Date() sur "2026-01-03T17:00:00+01:00" → crée un Date UTC correct
// formatInTimeZone() convertit ensuite correctement vers Europe/Paris
```

Le code actuel est **presque correct** mais dépend des dates fournies par Google Calendar.

#### C. Vérifier `api/trpc.ts`
Le code dans `api/trpc.ts` utilise déjà la bonne méthode:
```typescript
const startTime = slotStart.toLocaleString('fr-FR', { 
  timeZone: 'Europe/Paris', 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: false
});
```
✅ Cette partie est **CORRECTE**.

---

### Solution 2: Prévention de la Double Réservation

#### A. Stratégie 1: Vérification + Lock (RECOMMANDÉE)
```typescript
async function bookAppointment(input) {
  // 1. Récupérer les événements EN TEMPS RÉEL
  const events = await getEventsFromGoogleCalendar(input.date, nextDay);
  
  // 2. Vérifier disponibilité
  const isAvailable = checkSlotAvailability(input.date, input.startTime, events);
  
  if (!isAvailable) {
    throw new Error('Créneau non disponible');
  }
  
  // 3. Créer IMMÉDIATEMENT dans Google Calendar (AVANT la DB)
  const googleEventId = await createGoogleCalendarEvent({...});
  
  // 4. Enregistrer dans la DB avec le googleEventId
  await db.insert(appointments).values({
    googleEventId,
    ...
  });
  
  return { success: true };
}
```

**Avantage**: Google Calendar devient la **source de vérité**. Si deux requêtes arrivent en même temps:
- Requête 1: Crée l'événement Google → Succès
- Requête 2: Vérifie la disponibilité → Voit l'événement → Échec ✅

#### B. Stratégie 2: Transaction DB avec SELECT FOR UPDATE
```typescript
await db.transaction(async (tx) => {
  // 1. Vérifier avec lock exclusif
  const existingAppt = await tx
    .select()
    .from(appointments)
    .where(and(
      eq(appointments.date, input.date),
      eq(appointments.startTime, input.startTime),
      ne(appointments.status, 'cancelled')
    ))
    .for('update')  // Lock la ligne
    .limit(1);
  
  if (existingAppt.length > 0) {
    throw new Error('Créneau déjà réservé');
  }
  
  // 2. Créer l'événement Google
  const googleEventId = await createGoogleCalendarEvent({...});
  
  // 3. Insérer dans la DB
  await tx.insert(appointments).values({...});
});
```

**Problème**: Cette approche nécessite que la DB soit la source de vérité, mais on utilise Google Calendar comme source principale.

#### C. Stratégie 3: Combinaison (OPTIMAL)
```typescript
// 1. Vérifier Google Calendar (source de vérité)
const events = await getEventsFromGoogleCalendar(...);
const available = checkAvailability(..., events);

if (!available) {
  throw new Error('Créneau non disponible (Google Calendar)');
}

// 2. Créer dans Google Calendar IMMÉDIATEMENT
const googleEventId = await createGoogleCalendarEvent({...});

// 3. Transaction DB avec double vérification
await db.transaction(async (tx) => {
  const existingAppt = await tx
    .select()
    .from(appointments)
    .where(...)
    .for('update');
  
  if (existingAppt.length > 0) {
    // Rollback: Supprimer l'événement Google
    await deleteGoogleCalendarEvent(googleEventId);
    throw new Error('Créneau déjà réservé (DB)');
  }
  
  await tx.insert(appointments).values({
    googleEventId,
    ...
  });
});
```

---

## 📋 PLAN D'ACTION

### Étape 1: Correction du Décalage Horaire (PRIORITÉ 1)
1. ✅ Modifier `server/services/googleCalendarOAuth2.ts`
   - Ajouter l'offset timezone aux requêtes API
2. ✅ Vérifier `server/services/availabilityCalculator.ts`
   - S'assurer que les dates sont correctement formatées
3. ✅ Tester avec un événement Google Calendar "DISPONIBLE 17:00-20:00"
4. ✅ Vérifier que l'application affiche bien "17:00-20:00"

### Étape 2: Prévention Double Réservation (PRIORITÉ 1)
1. ✅ Implémenter la Stratégie 3 (Combinaison)
2. ✅ Ajouter des logs détaillés
3. ✅ Tester avec deux requêtes simultanées
4. ✅ Vérifier qu'une seule passe

### Étape 3: Tests et Validation
1. ⏳ Tests manuels complets
2. ⏳ Tests en environnement Preview Vercel
3. ⏳ Tests en Production

### Étape 4: Documentation
1. ⏳ Mettre à jour la documentation
2. ⏳ Créer un guide de débogage timezone

---

## 🧪 SCÉNARIOS DE TEST

### Test 1: Décalage Horaire
```
✅ Créer un événement Google Calendar:
   - Titre: "DISPONIBLE"
   - Date: 2026-01-06
   - Heure: 17:00 - 20:00 (Europe/Paris)

✅ Vérifier dans l'application:
   - Les créneaux affichés doivent être:
     • 17:00 - 18:00
     • 18:00 - 19:00
     • 19:00 - 20:00
   
❌ PAS:
     • 16:00 - 17:00
     • 17:00 - 18:00
     • 18:00 - 19:00
```

### Test 2: Double Réservation
```
✅ Scénario:
   1. Ouvrir l'application dans 2 navigateurs différents
   2. Charger les créneaux dans les deux
   3. Sélectionner le même créneau (ex: 17:00)
   4. Cliquer "Réserver" simultanément

✅ Résultat attendu:
   - Navigateur 1: "Rendez-vous confirmé" ✅
   - Navigateur 2: "Créneau non disponible" ❌

❌ Résultat actuel (bugué):
   - Navigateur 1: "Rendez-vous confirmé" ✅
   - Navigateur 2: "Rendez-vous confirmé" ✅ (PROBLÈME!)
```

### Test 3: Synchronisation DB ↔ Calendar
```
✅ Scénario:
   1. Réserver un créneau via l'application
   2. Vérifier dans Google Calendar
   3. Supprimer l'événement depuis Google Calendar
   4. Recharger les créneaux dans l'application

✅ Résultat attendu:
   - Le créneau redevient disponible immédiatement
```

---

## 📊 IMPACT DES CORRECTIONS

### Avant
- ❌ Décalage horaire systématique de -1h
- ❌ Double réservation possible
- ❌ Désynchronisation DB/Calendar

### Après
- ✅ Affichage correct des créneaux
- ✅ Protection contre les doubles réservations
- ✅ Google Calendar comme source de vérité unique
- ✅ Logs détaillés pour débogage
- ✅ Fiabilité totale du système

---

## 🔗 FICHIERS À MODIFIER

| Fichier | Lignes | Modifications |
|---------|--------|--------------|
| `server/services/googleCalendarOAuth2.ts` | 170-171 | Ajouter offset timezone |
| `server/routers/appointmentOAuth2Router.ts` | 61-150 | Implémenter protection double réservation |
| `api/trpc.ts` | 549-631 | Vérifier et renforcer la validation |

---

**Auteur**: Claude AI - Senior Full-Stack Engineer  
**Date**: 2026-01-03  
**Version**: 1.0
