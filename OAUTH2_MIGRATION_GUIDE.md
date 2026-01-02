# 🚀 GUIDE DE MIGRATION - GOOGLE OAUTH 2.0

## 📋 Table des matières

1. [Architecture](#architecture)
2. [Nouveaux fichiers](#nouveaux-fichiers)
3. [Variables d'environnement](#variables-denvironnement)
4. [Fonctionnement](#fonctionnement)
5. [API Endpoints](#api-endpoints)
6. [Pièges courants et solutions](#pièges-courants-et-solutions)
7. [Tests](#tests)
8. [Migration depuis l'ancienne version](#migration-depuis-lancienne-version)

---

## 🏗️ Architecture

### 🎯 Nouvelle Architecture (OAuth 2.0)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Sélection de créneau                                 │  │
│  │  └─> appRouter.availabilityOAuth2.getAvailableSlots  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Réservation                                          │  │
│  │  └─> appRouter.appointmentOAuth2.bookAppointment     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVEUR (tRPC)                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  availabilityOAuth2Router                            │  │
│  │  - getAvailableSlots()                               │  │
│  │  - checkSlot()                                       │  │
│  │  - getWorkingHours()                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  appointmentOAuth2Router                             │  │
│  │  - bookAppointment()                                 │  │
│  │  - cancelAppointment()                               │  │
│  │  - getClientAppointments()                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVICES (Business Logic)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  GoogleCalendarOAuth2Service                         │  │
│  │  - getExistingEvents()                               │  │
│  │  - createAppointment()                               │  │
│  │  - deleteAppointment()                               │  │
│  │  - Auto refresh token                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AvailabilityCalculator                              │  │
│  │  - calculateAvailableSlots()                         │  │
│  │  - DEFAULT_WORKING_HOURS                             │  │
│  │  - groupSlotsByDate()                                │  │
│  │  - getAvailableDates()                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE CALENDAR API v3                         │
│                  (OAuth 2.0)                                │
└─────────────────────────────────────────────────────────────┘
```

### ✅ Avantages de cette architecture

- **Pas de Service Account** : OAuth 2.0 plus simple et sécurisé
- **Pas d'iCal** : Utilisation directe de l'API Google Calendar
- **Pas d'événements "disponible"** : Génération dynamique basée sur des règles
- **Déterministe** : Mêmes résultats en preview et production
- **Stateless** : Compatible 100% Vercel serverless
- **Timezone explicite** : Europe/Paris partout

---

## 📁 Nouveaux fichiers

### 1. **Service OAuth 2.0**
```
server/services/googleCalendarOAuth2.ts
```
- Gère l'authentification OAuth 2.0 avec refresh token
- Récupère automatiquement des access tokens
- Méthodes : `getExistingEvents()`, `createAppointment()`, `deleteAppointment()`

### 2. **Algorithme de disponibilités**
```
server/services/availabilityCalculator.ts
```
- Calcule les créneaux disponibles basé sur des règles
- Filtre les créneaux occupés
- Configuration : `DEFAULT_WORKING_HOURS`

### 3. **Router Disponibilités**
```
server/routers/availabilityOAuth2Router.ts
```
- Endpoints tRPC pour récupérer les disponibilités
- `getAvailableSlots()`, `checkSlot()`, `getWorkingHours()`

### 4. **Router Rendez-vous**
```
server/routers/appointmentOAuth2Router.ts
```
- Endpoints tRPC pour gérer les rendez-vous
- `bookAppointment()`, `cancelAppointment()`, `getClientAppointments()`

---

## 🔐 Variables d'environnement

### Sur Vercel (Production)

Les variables suivantes ont été configurées automatiquement :

```bash
GOOGLE_CLIENT_ID=603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REFRESH_TOKEN=1//038BGdIzAbbjSCgYIARAAGAMSNwF-L9IrVFOUiSh0P4A4PvkAda2AimH1xhTfpGngQCIokTwWUFlOKZZaxB4cN2Xa2j0QlCGXjoY
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com
```

### En local (.env)

Ces variables sont déjà dans ton fichier `.env` :

```env
GOOGLE_CLIENT_ID=603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REFRESH_TOKEN=1//038BGdIzAbbjSCgYIARAAGAMSNwF-L9IrVFOUiSh0P4A4PvkAda2AimH1xhTfpGngQCIokTwWUFlOKZZaxB4cN2Xa2j0QlCGXjoY
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com
```

---

## ⚙️ Fonctionnement

### 1. Calcul des disponibilités

#### Étape 1 : Règles de travail
```typescript
const DEFAULT_WORKING_HOURS = {
  timezone: 'Europe/Paris',
  workingDays: [1, 2, 3, 4, 5], // Lundi à Vendredi
  startHour: 9,                  // 9h00
  startMinute: 0,
  endHour: 18,                   // 18h00
  endMinute: 0,
  slotDuration: 60,              // 60 minutes
  minAdvanceBookingMinutes: 120, // 2 heures minimum
  maxAdvanceBookingDays: 30,     // 30 jours maximum
};
```

#### Étape 2 : Génération des créneaux
```
Pour chaque jour de travail :
  Générer créneaux de 9h à 18h (durée 60 min)
  Exemple : 09:00-10:00, 10:00-11:00, ..., 17:00-18:00
```

#### Étape 3 : Récupération des événements Google Calendar
```typescript
const events = await calendarService.getExistingEvents(startDate, endDate);
// Récupère TOUS les événements existants (rendez-vous, événements personnels, etc.)
```

#### Étape 4 : Filtrage des créneaux
```
Pour chaque créneau généré :
  ✅ Vérifier qu'il est dans le futur (+ délai minimum 2h)
  ✅ Vérifier qu'aucun événement ne chevauche ce créneau
  ❌ Si chevauchement détecté → créneau retiré
```

#### Étape 5 : Résultat
```typescript
{
  slots: [
    { date: "2025-12-28", startTime: "09:00", endTime: "10:00", duration: 60 },
    { date: "2025-12-28", startTime: "11:00", endTime: "12:00", duration: 60 },
    // ...
  ],
  slotsByDate: {
    "2025-12-28": [/* créneaux du 28 */],
    "2025-12-29": [/* créneaux du 29 */],
  },
  availableDates: ["2025-12-28", "2025-12-29", ...]
}
```

### 2. Réservation d'un rendez-vous

#### Étape 1 : Vérification du créneau
```typescript
// Le client sélectionne un créneau
const slot = { date: "2025-12-28", startTime: "14:00", endTime: "15:00" };

// Le serveur vérifie que le créneau est toujours disponible
const isAvailable = await checkSlotAvailability(slot);
```

#### Étape 2 : Création de l'événement Google Calendar
```typescript
const eventId = await calendarService.createAppointment({
  date: "2025-12-28",
  startTime: "14:00",
  endTime: "15:00",
  clientName: "Jean Dupont",
  clientEmail: "jean@example.com",
  clientPhone: "0601020304",
  notes: "Première consultation",
});
```

#### Étape 3 : Enregistrement en base de données
```typescript
await db.insert(appointments).values({
  patientName: "Jean Dupont",
  patientEmail: "jean@example.com",
  date: new Date("2025-12-28"),
  startTime: "14:00",
  endTime: "15:00",
  status: "confirmed",
  googleEventId: eventId,
});
```

---

## 🔌 API Endpoints

### Disponibilités

#### 1. Récupérer les créneaux disponibles

```typescript
// Client
const { data } = await trpc.availabilityOAuth2.getAvailableSlots.query({
  startDate: "2025-12-28",
  endDate: "2026-01-28",
});

// Réponse
{
  success: true,
  slots: TimeSlot[],
  slotsByDate: Record<string, TimeSlot[]>,
  availableDates: string[],
  workingHoursInfo: {...}
}
```

#### 2. Vérifier un créneau spécifique

```typescript
const { data } = await trpc.availabilityOAuth2.checkSlot.query({
  date: "2025-12-28",
  startTime: "14:00",
  endTime: "15:00",
});

// Réponse
{
  available: true,
  reason: null
}
```

#### 3. Récupérer les horaires de travail

```typescript
const { data } = await trpc.availabilityOAuth2.getWorkingHours.query();

// Réponse
{
  timezone: "Europe/Paris",
  workingDays: [1, 2, 3, 4, 5],
  workingDaysNames: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
  startTime: "09:00",
  endTime: "18:00",
  slotDuration: 60,
  minAdvanceBookingMinutes: 120,
  maxAdvanceBookingDays: 30
}
```

### Rendez-vous

#### 1. Réserver un rendez-vous

```typescript
const { data } = await trpc.appointmentOAuth2.bookAppointment.mutate({
  date: "2025-12-28",
  startTime: "14:00",
  endTime: "15:00",
  clientName: "Jean Dupont",
  clientEmail: "jean@example.com",
  clientPhone: "0601020304", // optionnel
  notes: "Première consultation", // optionnel
});

// Réponse
{
  success: true,
  appointmentId: 123,
  googleEventId: "abc123xyz",
  message: "Rendez-vous confirmé avec succès !"
}
```

#### 2. Annuler un rendez-vous

```typescript
const { data } = await trpc.appointmentOAuth2.cancelAppointment.mutate({
  appointmentId: 123,
});

// Réponse
{
  success: true,
  message: "Rendez-vous annulé avec succès"
}
```

#### 3. Récupérer les rendez-vous d'un client

```typescript
const { data } = await trpc.appointmentOAuth2.getClientAppointments.query({
  email: "jean@example.com",
});

// Réponse
{
  success: true,
  appointments: [...]
}
```

---

## 🚨 Pièges courants et solutions

### 1. ❌ Timezone incorrecte en production

**Problème** :
```javascript
// ❌ JAMAIS FAIRE ÇA
const now = new Date(); // Utilise la timezone du serveur (imprévisible)
```

**Solution** :
```javascript
// ✅ TOUJOURS utiliser UTC ou timezone explicite
const nowUTC = new Date(); // UTC
const dateStr = nowUTC.toISOString(); // Format ISO 8601 avec 'Z'
```

### 2. ❌ Comparaison de dates instable

**Problème** :
```javascript
// ❌ Comparaison fragile
if (slot.date === "28/12/2025") { ... }
```

**Solution** :
```javascript
// ✅ Format ISO 8601 (YYYY-MM-DD)
if (slot.date === "2025-12-28") { ... }
```

### 3. ❌ Oubli du délai minimum de réservation

**Problème** :
```javascript
// ❌ Permet de réserver dans 5 minutes
const slots = generateSlots(today, tomorrow);
```

**Solution** :
```javascript
// ✅ Filtrer les créneaux avec minAdvanceBookingMinutes
const minBookingTime = new Date(Date.now() + 120 * 60 * 1000); // +2h
const slots = generateSlots(today, tomorrow).filter(slot => {
  const slotTime = new Date(`${slot.date}T${slot.startTime}:00Z`);
  return slotTime > minBookingTime;
});
```

### 4. ❌ Refresh token expiré

**Problème** :
```
Error: OAuth token refresh failed: invalid_grant
```

**Solution** :
1. Ré-obtenir un nouveau refresh token via OAuth consent flow
2. Mettre à jour `GOOGLE_REFRESH_TOKEN` dans Vercel
3. Redéployer

### 5. ❌ Événement Google Calendar non trouvé

**Problème** :
```
Error: Event not found when trying to delete
```

**Solution** :
```typescript
// ✅ Vérifier l'existence avant suppression
const deleted = await calendarService.deleteAppointment(eventId);
if (!deleted) {
  console.warn('Événement déjà supprimé');
}
```

### 6. ❌ Créneaux dupliqués

**Problème** : Les créneaux apparaissent plusieurs fois.

**Solution** :
```typescript
// ✅ Utiliser Set pour dédupliquer
const uniqueDates = Array.from(new Set(slots.map(s => s.date)));
```

---

## 🧪 Tests

### Test en local

```bash
# 1. S'assurer que les variables sont dans .env
cat .env | grep GOOGLE_

# 2. Démarrer le serveur
npm run dev

# 3. Tester les endpoints
curl http://localhost:5000/api/trpc/availabilityOAuth2.getAvailableSlots?input='{"startDate":"2025-12-28","endDate":"2026-01-28"}'
```

### Test en production (Vercel)

```bash
# 1. Vérifier les variables d'environnement
vercel env ls

# 2. Tester l'endpoint de disponibilités
curl 'https://ton-app.vercel.app/api/trpc/availabilityOAuth2.getAvailableSlots?input=%7B%22startDate%22%3A%222025-12-28%22%2C%22endDate%22%3A%222026-01-28%22%7D'
```

### Tests unitaires (à implémenter)

```typescript
// tests/availabilityCalculator.test.ts
import { calculateAvailableSlots } from '../server/services/availabilityCalculator';

test('should filter overlapping events', () => {
  const events = [
    { startDateTime: new Date('2025-12-28T10:00:00Z'), endDateTime: new Date('2025-12-28T11:00:00Z') }
  ];
  
  const slots = calculateAvailableSlots('2025-12-28', '2025-12-28', events);
  
  // Le créneau 10:00-11:00 ne doit PAS être disponible
  expect(slots.find(s => s.startTime === '10:00')).toBeUndefined();
});
```

---

## 🔄 Migration depuis l'ancienne version

### Étape 1 : Identifier les appels actuels

**Ancien code (à remplacer)** :
```typescript
// ❌ Ancien endpoint basé sur iCal/Service Account
const slots = await trpc.availabilitySlots.getAvailable.query({ ... });
```

**Nouveau code** :
```typescript
// ✅ Nouveau endpoint OAuth 2.0
const slots = await trpc.availabilityOAuth2.getAvailableSlots.query({
  startDate: "2025-12-28",
  endDate: "2026-01-28",
});
```

### Étape 2 : Mettre à jour les composants React

**Exemple de migration** :

```typescript
// AVANT
import { trpc } from './lib/trpc';

function AvailabilityPicker() {
  const { data } = trpc.availabilitySlots.getAvailable.useQuery({
    startDate: '2025-12-28',
    endDate: '2026-01-28',
  });
  
  return <div>{/* ... */}</div>;
}

// APRÈS
import { trpc } from './lib/trpc';

function AvailabilityPicker() {
  const { data } = trpc.availabilityOAuth2.getAvailableSlots.useQuery({
    startDate: '2025-12-28',
    endDate: '2026-01-28',
  });
  
  // Structure de données identique, pas besoin de changer le rendu
  return <div>{/* ... */}</div>;
}
```

### Étape 3 : Supprimer les anciens fichiers (optionnel)

Une fois la migration validée, tu peux supprimer :
- `server/services/googleCalendarIcal.ts` (iCal)
- Les références aux Service Accounts
- Les anciens routers non utilisés

---

## 📊 Comparaison Avant/Après

| Critère | ❌ Avant (iCal + Service Account) | ✅ Après (OAuth 2.0) |
|---------|----------------------------------|---------------------|
| **Authentification** | Service Account JWT | OAuth 2.0 + Refresh Token |
| **Disponibilités** | Parse événements "disponible" iCal | Génération dynamique basée sur règles |
| **Fiabilité** | ❌ Bugs timezone, cache iCal | ✅ Déterministe, temps réel |
| **Configuration** | Service Account JSON + iCal URL | 4 variables d'environnement |
| **Vercel** | ⚠️ Instable (cache, timezone) | ✅ 100% compatible serverless |
| **Maintenance** | 🔴 Complexe | 🟢 Simple |

---

## ✅ Checklist de déploiement

- [x] Variables d'environnement configurées sur Vercel
- [x] Services OAuth 2.0 créés
- [x] Algorithme de disponibilités implémenté
- [x] Routers tRPC créés
- [x] Documentation complète
- [ ] Tests manuels en local
- [ ] Tests en production Vercel
- [ ] Migration des composants React (si nécessaire)
- [ ] Monitoring des logs en production

---

## 📞 Support

En cas de problème :

1. **Vérifier les logs Vercel** : `vercel logs`
2. **Tester les variables** : `vercel env ls`
3. **Vérifier le refresh token** : Ré-obtenir un nouveau token si nécessaire

---

**Version** : 1.0.0  
**Date** : 2025-12-27  
**Auteur** : Claude - Senior Full-Stack Engineer
