# 🧪 Exemple de Tests Unitaires - Logique de Disponibilités

## 📋 Contexte

Ce document illustre comment les nouvelles fonctions `isDisponibilite()` et `isRendezVousOuBlocage()` fonctionnent avec des exemples concrets.

---

## ✅ Tests de `isDisponibilite()`

### Test 1 : Événements "DISPONIBLE"

```typescript
describe('isDisponibilite', () => {
  test('devrait identifier "DISPONIBLE"', () => {
    const event = { summary: 'DISPONIBLE', type: 'VEVENT' };
    expect(isDisponibilite(event)).toBe(true);
  });

  test('devrait identifier "disponible" (minuscules)', () => {
    const event = { summary: 'disponible', type: 'VEVENT' };
    expect(isDisponibilite(event)).toBe(true);
  });

  test('devrait identifier "DISPONIBLE 17h30–20h"', () => {
    const event = { summary: 'DISPONIBLE 17h30–20h', type: 'VEVENT' };
    expect(isDisponibilite(event)).toBe(true);
  });

  test('devrait identifier "🟢 Disponible"', () => {
    const event = { summary: '🟢 Disponible', type: 'VEVENT' };
    expect(isDisponibilite(event)).toBe(true);
  });

  test('devrait identifier "available"', () => {
    const event = { summary: 'available', type: 'VEVENT' };
    expect(isDisponibilite(event)).toBe(true);
  });

  test('devrait identifier "Libre"', () => {
    const event = { summary: 'Libre', type: 'VEVENT' };
    expect(isDisponibilite(event)).toBe(true);
  });

  test('devrait identifier "Free"', () => {
    const event = { summary: 'Free', type: 'VEVENT' };
    expect(isDisponibilite(event)).toBe(true);
  });

  test('devrait rejeter "RDV - Jean Dupont"', () => {
    const event = { summary: 'RDV - Jean Dupont', type: 'VEVENT' };
    expect(isDisponibilite(event)).toBe(false);
  });

  test('devrait rejeter un événement sans summary', () => {
    const event = { type: 'VEVENT' };
    expect(isDisponibilite(event)).toBe(false);
  });
});
```

---

## ❌ Tests de `isRendezVousOuBlocage()`

### Test 2 : Événements Bloquants

```typescript
describe('isRendezVousOuBlocage', () => {
  test('devrait identifier "RDV - Jean Dupont"', () => {
    const event = { summary: 'RDV - Jean Dupont', type: 'VEVENT' };
    expect(isRendezVousOuBlocage(event)).toBe(true);
  });

  test('devrait identifier "Consultation - Marie Martin"', () => {
    const event = { summary: 'Consultation - Marie Martin', type: 'VEVENT' };
    expect(isRendezVousOuBlocage(event)).toBe(true);
  });

  test('devrait identifier "🔴 Réservé"', () => {
    const event = { summary: '🔴 Réservé', type: 'VEVENT' };
    expect(isRendezVousOuBlocage(event)).toBe(true);
  });

  test('devrait identifier "🩺 Rendez-vous"', () => {
    const event = { summary: '🩺 Rendez-vous', type: 'VEVENT' };
    expect(isRendezVousOuBlocage(event)).toBe(true);
  });

  test('devrait identifier "Indisponible"', () => {
    const event = { summary: 'Indisponible', type: 'VEVENT' };
    expect(isRendezVousOuBlocage(event)).toBe(true);
  });

  test('devrait rejeter "DISPONIBLE" (car c\'est une disponibilité)', () => {
    const event = { summary: 'DISPONIBLE', type: 'VEVENT' };
    expect(isRendezVousOuBlocage(event)).toBe(false); // ✅ Priorité aux disponibilités
  });

  test('devrait rejeter un événement sans summary', () => {
    const event = { type: 'VEVENT' };
    expect(isRendezVousOuBlocage(event)).toBe(false);
  });
});
```

---

## 🔄 Tests de `getAvailableSlotsFromIcal()`

### Test 3 : Scénario Complet

```typescript
describe('getAvailableSlotsFromIcal', () => {
  beforeEach(() => {
    // Mock iCal URL
    process.env.GOOGLE_CALENDAR_ICAL_URL = 'https://calendar.google.com/...';
  });

  test('devrait générer des créneaux à partir de "DISPONIBLE"', async () => {
    // Mock iCal response
    const mockEvents = {
      event1: {
        type: 'VEVENT',
        summary: 'DISPONIBLE',
        start: new Date('2025-12-27T09:00:00'),
        end: new Date('2025-12-27T12:00:00'),
      },
    };

    // Mock ical.async.fromURL
    jest.spyOn(ical.async, 'fromURL').mockResolvedValue(mockEvents);

    const slots = await getAvailableSlotsFromIcal(
      new Date('2025-12-27'),
      new Date('2025-12-27')
    );

    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].date).toBe('2025-12-27');
    expect(slots[0].startTime).toBe('09:00');
  });

  test('ne devrait PAS générer de créneaux à partir de "RDV"', async () => {
    const mockEvents = {
      event1: {
        type: 'VEVENT',
        summary: 'RDV - Jean Dupont',
        start: new Date('2025-12-27T09:00:00'),
        end: new Date('2025-12-27T10:00:00'),
      },
    };

    jest.spyOn(ical.async, 'fromURL').mockResolvedValue(mockEvents);

    const slots = await getAvailableSlotsFromIcal(
      new Date('2025-12-27'),
      new Date('2025-12-27')
    );

    expect(slots.length).toBe(0); // ✅ Les RDV ne créent PAS de créneaux
  });

  test('devrait filtrer les créneaux qui chevauchent un RDV', async () => {
    const mockEvents = {
      event1: {
        type: 'VEVENT',
        summary: 'DISPONIBLE',
        start: new Date('2025-12-27T09:00:00'),
        end: new Date('2025-12-27T12:00:00'),
      },
      event2: {
        type: 'VEVENT',
        summary: 'RDV - Marie Martin',
        start: new Date('2025-12-27T10:00:00'),
        end: new Date('2025-12-27T11:00:00'),
      },
    };

    jest.spyOn(ical.async, 'fromURL').mockResolvedValue(mockEvents);

    const slots = await getAvailableSlotsFromIcal(
      new Date('2025-12-27'),
      new Date('2025-12-27')
    );

    // Les créneaux de 10h00-11h00 devraient être filtrés
    const slot10h = slots.find(s => s.startTime === '10:00');
    expect(slot10h).toBeUndefined(); // ✅ Créneau filtré car chevauchement
  });

  test('devrait filtrer les créneaux passés', async () => {
    const now = new Date('2025-12-27T15:00:00');
    jest.spyOn(Date, 'now').mockReturnValue(now.getTime());

    const mockEvents = {
      event1: {
        type: 'VEVENT',
        summary: 'DISPONIBLE',
        start: new Date('2025-12-27T09:00:00'), // Passé
        end: new Date('2025-12-27T12:00:00'),
      },
      event2: {
        type: 'VEVENT',
        summary: 'DISPONIBLE',
        start: new Date('2025-12-27T16:00:00'), // Futur
        end: new Date('2025-12-27T18:00:00'),
      },
    };

    jest.spyOn(ical.async, 'fromURL').mockResolvedValue(mockEvents);

    const slots = await getAvailableSlotsFromIcal(
      new Date('2025-12-27'),
      new Date('2025-12-27')
    );

    // Seuls les créneaux futurs (16h00-18h00)
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every(s => parseInt(s.startTime.split(':')[0]) >= 16)).toBe(true);
  });
});
```

---

## 📊 Matrice de Tests

| Événement iCal | `isDisponibilite()` | `isRendezVousOuBlocage()` | Crée Créneau ? | Bloque Temps ? |
|----------------|---------------------|---------------------------|----------------|----------------|
| DISPONIBLE | ✅ true | ❌ false | ✅ OUI | ❌ NON |
| disponible | ✅ true | ❌ false | ✅ OUI | ❌ NON |
| DISPONIBLE 17h30–20h | ✅ true | ❌ false | ✅ OUI | ❌ NON |
| 🟢 Disponible | ✅ true | ❌ false | ✅ OUI | ❌ NON |
| available | ✅ true | ❌ false | ✅ OUI | ❌ NON |
| Libre | ✅ true | ❌ false | ✅ OUI | ❌ NON |
| Free | ✅ true | ❌ false | ✅ OUI | ❌ NON |
| RDV - Jean | ❌ false | ✅ true | ❌ NON | ✅ OUI |
| Consultation | ❌ false | ✅ true | ❌ NON | ✅ OUI |
| 🔴 Réservé | ❌ false | ✅ true | ❌ NON | ✅ OUI |
| 🩺 Rendez-vous | ❌ false | ✅ true | ❌ NON | ✅ OUI |
| Indisponible | ❌ false | ✅ true | ❌ NON | ✅ OUI |

---

## 🎯 Cas d'Usage Réels

### Cas 1 : Journée Type

**Google Calendar** :
```
09:00-12:00 | DISPONIBLE
14:00-15:00 | RDV - Jean Dupont
15:00-18:00 | DISPONIBLE
```

**Résultat Attendu** :
```javascript
slots = [
  { date: '2025-12-27', startTime: '09:00', endTime: '10:00' },
  { date: '2025-12-27', startTime: '10:00', endTime: '11:00' },
  { date: '2025-12-27', startTime: '11:00', endTime: '12:00' },
  { date: '2025-12-27', startTime: '15:00', endTime: '16:00' },
  { date: '2025-12-27', startTime: '16:00', endTime: '17:00' },
  { date: '2025-12-27', startTime: '17:00', endTime: '18:00' },
]
```

**Logs Attendus** :
```
[Vercel TRPC] 🟢 DISPONIBILITÉ détectée: DISPONIBLE
[Vercel TRPC] 🔴 BLOCAGE détecté: 2025-12-27|14:00|15:00 - RDV - Jean Dupont
[Vercel TRPC] 🟢 DISPONIBILITÉ détectée: DISPONIBLE
[Vercel TRPC] 📊 Analyse iCal: 2 disponibilités, 1 blocages
[Vercel TRPC] 🎯 RÉSULTAT FINAL: 6 créneaux bookables trouvés
```

---

### Cas 2 : Chevauchement

**Google Calendar** :
```
10:00-12:00 | DISPONIBLE
11:00-12:00 | RDV - Marie Martin
```

**Résultat Attendu** :
```javascript
slots = [
  { date: '2025-12-27', startTime: '10:00', endTime: '11:00' }, // ✅ Avant le RDV
  // 11:00-12:00 FILTRÉ car chevauchement avec RDV
]
```

**Logs Attendus** :
```
[Vercel TRPC] 🟢 DISPONIBILITÉ détectée: DISPONIBLE
[Vercel TRPC] 🔴 BLOCAGE détecté: 2025-12-27|11:00|12:00 - RDV - Marie Martin
[Vercel TRPC] ✅ Créneau DISPONIBLE ajouté: 2025-12-27 10:00-11:00
[Vercel TRPC] ❌ Créneau filtré (chevauchement): 2025-12-27|11:00|12:00 avec 2025-12-27|11:00|12:00
[Vercel TRPC] 🎯 RÉSULTAT FINAL: 1 créneaux bookables trouvés
```

---

### Cas 3 : Créneau Déjà Réservé en BD

**Google Calendar** :
```
14:00-18:00 | DISPONIBLE
```

**Base de Données** :
```sql
INSERT INTO appointments (startTime, endTime, status)
VALUES ('2025-12-27 15:00:00', '2025-12-27 16:00:00', 'confirmed');
```

**Résultat Attendu** :
```javascript
slots = [
  { date: '2025-12-27', startTime: '14:00', endTime: '15:00' }, // ✅
  // 15:00-16:00 FILTRÉ car réservé en BD
  { date: '2025-12-27', startTime: '16:00', endTime: '17:00' }, // ✅
  { date: '2025-12-27', startTime: '17:00', endTime: '18:00' }, // ✅
]
```

**Logs Attendus** :
```
[Vercel TRPC] 🟢 DISPONIBILITÉ détectée: DISPONIBLE
[Vercel TRPC] 💾 Rendez-vous en BD: 1
[Vercel TRPC] ✅ Créneau DISPONIBLE ajouté: 2025-12-27 14:00-15:00
[Vercel TRPC] ❌ Créneau filtré (réservé dans BD): 2025-12-27|15:00
[Vercel TRPC] ✅ Créneau DISPONIBLE ajouté: 2025-12-27 16:00-17:00
[Vercel TRPC] 🎯 RÉSULTAT FINAL: 3 créneaux bookables trouvés
```

---

## 🔍 Tests de Régression

### Avant la Correction (FAUX)

```typescript
test('ANCIEN COMPORTEMENT: "DISPONIBLE" bloque son propre créneau', () => {
  // ❌ ANCIEN CODE
  const event = { summary: 'DISPONIBLE', start: new Date('2025-12-27T09:00:00'), end: new Date('2025-12-27T12:00:00') };
  
  // Traitement erroné: tout est bloquant
  bookedSlots.add('2025-12-27|09:00|12:00');
  
  // Génération de créneaux (impossible car bloqué)
  const slots = generateSlots(); // []
  
  expect(slots.length).toBe(0); // ❌ Aucun créneau généré
});
```

### Après la Correction (CORRECT)

```typescript
test('NOUVEAU COMPORTEMENT: "DISPONIBLE" génère des créneaux', () => {
  // ✅ NOUVEAU CODE
  const event = { summary: 'DISPONIBLE', start: new Date('2025-12-27T09:00:00'), end: new Date('2025-12-27T12:00:00') };
  
  // Traitement correct: identifier le type
  if (isDisponibilite(event)) {
    disponibiliteEvents.push(event); // ✅ Source de créneaux
  }
  
  // Génération de créneaux
  const slots = generateSlots(); // [09:00-10:00, 10:00-11:00, 11:00-12:00]
  
  expect(slots.length).toBeGreaterThan(0); // ✅ Créneaux générés
});
```

---

## 📝 Commandes de Test

### Lancer les Tests Unitaires

```bash
# Installation (si nécessaire)
npm install --save-dev jest @types/jest ts-jest

# Configuration Jest (jest.config.js)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
};

# Lancer les tests
npm test

# Lancer avec couverture
npm test -- --coverage
```

### Tests en Production

```bash
# 1. Merger la PR
gh pr merge 48

# 2. Attendre le déploiement Vercel (2-3 min)

# 3. Vérifier les logs
vercel logs webapp-frtjapec0-ikips-projects --follow

# 4. Tester l'application
open https://webapp-frtjapec0-ikips-projects.vercel.app
```

---

## ✅ Résumé

**Problème** : Les événements "DISPONIBLE" bloquaient leur propre créneau  
**Solution** : Distinction claire entre disponibilités (source) et blocages  
**Tests** : 8 scénarios + tests unitaires + tests de régression  
**Résultat** : Créneaux disponibles visibles et bookables ✅

---

**Date** : 2025-12-26  
**Auteur** : Agent Développeur Senior  
**Version** : 2.0.0
