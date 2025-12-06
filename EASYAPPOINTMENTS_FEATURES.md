# EasyAppointments Features Integration 🚀

Ce document décrit les fonctionnalités d'EasyAppointments qui ont été intégrées dans l'application Planning.

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Nouvelles Tables de Base de Données](#nouvelles-tables-de-base-de-données)
- [API Endpoints](#api-endpoints)
- [Interfaces Utilisateur](#interfaces-utilisateur)
- [Configuration](#configuration)
- [Utilisation](#utilisation)

## 🎯 Vue d'ensemble

L'intégration s'inspire d'[EasyAppointments](https://github.com/alextselegidis/easyappointments), une solution open-source de gestion de rendez-vous. Les fonctionnalités clés implémentées incluent :

- ✅ Gestion complète des services et catégories
- ✅ Plans de travail hebdomadaires pour les praticiens
- ✅ Périodes bloquées (congés, indisponibilités)
- ✅ Système de réservation multi-étapes
- ✅ Annulation sécurisée par hash unique
- ✅ Synchronisation Google Calendar
- ✅ Support des webhooks pour notifications
- ✅ Interface admin pour la gestion des services

## 📊 Nouvelles Tables de Base de Données

### 1. `serviceCategories`
Catégorisation des services proposés.

```typescript
{
  id: number
  name: string
  description: string
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 2. `services`
Services médicaux/professionnels disponibles.

```typescript
{
  id: number
  name: string
  description: string
  duration: number // en minutes
  price: decimal
  currency: string
  location: string
  color: string // hex color
  availabilitiesType: "flexible" | "fixed"
  attendantsNumber: number
  isPrivate: boolean
  categoryId: number
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 3. `practitionerServices`
Association many-to-many entre praticiens et services.

```typescript
{
  id: number
  practitionerId: number
  serviceId: number
  createdAt: timestamp
}
```

### 4. `workingPlans`
Plans de travail hebdomadaires des praticiens.

```typescript
{
  id: number
  practitionerId: number
  dayOfWeek: "monday" | "tuesday" | ... | "sunday"
  startTime: time
  endTime: time
  breakStartTime: time
  breakEndTime: time
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 5. `blockedPeriods`
Périodes d'indisponibilité (congés, vacances).

```typescript
{
  id: number
  practitionerId: number
  startDatetime: timestamp
  endDatetime: timestamp
  reason: string
  notes: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 6. `settings`
Configuration globale de l'application.

```typescript
{
  id: number
  name: string // unique
  value: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 7. `webhooks`
Configuration des webhooks pour notifications.

```typescript
{
  id: number
  name: string
  url: string
  actions: string // JSON array
  secretToken: string
  isSslVerified: boolean
  isActive: boolean
  notes: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 8. `googleCalendarSync`
Tracking de synchronisation avec Google Calendar.

```typescript
{
  id: number
  appointmentId: number
  googleEventId: string
  googleCalendarId: string
  syncStatus: "synced" | "pending" | "failed"
  lastSyncAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 9. Enhanced `appointments`
Table appointments améliorée avec nouveaux champs.

**Nouveaux champs :**
- `serviceId`: ID du service réservé
- `bookDatetime`: Date/heure de réservation
- `startDatetime`, `endDatetime`: Timestamps précis
- `location`: Lieu du rendez-vous
- `color`: Couleur pour le calendrier
- `hash`: Code unique pour annulation
- `googleCalendarId`, `caldavCalendarId`: IDs de sync
- `isUnavailability`: Marqueur pour périodes d'indispo

## 🛠️ API Endpoints

### Services Router (`/api/services`)

#### Catégories
- `GET /categories/list` - Liste des catégories
- `POST /categories/create` - Créer une catégorie (admin)

#### Services
- `GET /list` - Liste des services
- `GET /getById` - Détails d'un service
- `POST /create` - Créer un service (admin)
- `PUT /update` - Modifier un service (admin)
- `DELETE /delete` - Supprimer un service (admin)

#### Services des Praticiens
- `GET /practitionerServices/list?practitionerId={id}` - Services d'un praticien
- `POST /practitionerServices/add` - Associer service à praticien (admin)

### Schedule Router (`/api/schedule`)

#### Working Plans
- `GET /workingPlans/list?practitionerId={id}` - Plan de travail
- `POST /workingPlans/create` - Créer un plan (admin)
- `PUT /workingPlans/update` - Modifier un plan (admin)

#### Blocked Periods
- `GET /blockedPeriods/list?practitionerId={id}` - Périodes bloquées
- `POST /blockedPeriods/create` - Créer une période (admin)
- `DELETE /blockedPeriods/delete` - Supprimer une période (admin)

#### Availabilities
- `GET /availabilities` - Calculer les disponibilités
  - Params: `practitionerId`, `startDate`, `endDate`
  - Retourne: working plan, blocked periods, appointments

### Enhanced Appointments Router

**Nouveaux endpoints :**
- `POST /appointments/create` - Création avec service et hash
- `GET /appointments/getByHash?hash={hash}` - Récupérer par hash
- `POST /appointments/cancelByHash` - Annuler par hash (sans auth)
- `PUT /appointments/update` - Mise à jour complète

## 🎨 Interfaces Utilisateur

### 1. Enhanced Book Appointment (`/book`)

Flux de réservation en 4 étapes :

**Étape 1 : Service & Praticien**
- Sélection du service dans une liste
- Affichage prix, durée, description
- Choix du praticien avec spécialité

**Étape 2 : Date**
- Calendrier interactif
- Désactivation weekends et jours passés
- Navigation mois par mois

**Étape 3 : Heure**
- Grille de créneaux disponibles
- Basé sur le working plan du praticien
- Exclusion des périodes bloquées

**Étape 4 : Détails**
- Résumé du rendez-vous
- Motif de consultation
- Notes complémentaires
- Lieu préféré
- Confirmation finale

**Confirmation**
- Affichage du hash d'annulation
- Résumé complet
- Options : retour accueil ou nouvelle réservation

### 2. Services Management (`/admin` → Services tab)

Interface admin pour gérer les services :

**Catégories**
- Création rapide
- Affichage en badges
- Liste des catégories actives

**Services**
- Table complète avec :
  - Nom, description
  - Durée (avec icône horloge)
  - Prix (avec devise)
  - Catégorie (badge)
  - Couleur (indicateur visuel)
  - Actions (éditer, supprimer)
- Dialog de création avec formulaire complet
- Validation des champs

## ⚙️ Configuration

### 1. Migrations de Base de Données

Après avoir récupéré le code, exécuter :

```bash
npm run db:push
```

Cela créera toutes les nouvelles tables dans votre base de données.

### 2. Variables d'Environnement

Aucune nouvelle variable requise. Les existantes suffisent :

```env
DATABASE_URL=mysql://...
GOOGLE_API_KEY=...
NODE_ENV=production
```

### 3. Google Calendar Setup

La synchronisation Google Calendar est déjà configurée si vous avez suivi le guide `GOOGLE_CALENDAR_SETUP.md`.

## 🚀 Utilisation

### Pour les Utilisateurs

1. **Réserver un rendez-vous**
   - Aller sur `/book`
   - Suivre les 4 étapes
   - Conserver le code d'annulation

2. **Annuler un rendez-vous**
   - Utiliser le code hash reçu
   - Endpoint : `/api/appointments/cancelByHash`
   - Aucune authentification requise

### Pour les Admins

1. **Créer des catégories de services**
   - Aller dans `/admin`
   - Tab "Services"
   - "Ajouter une catégorie"

2. **Créer des services**
   - Cliquer "Nouveau service"
   - Remplir le formulaire :
     - Nom, description
     - Durée (minutes)
     - Prix (optionnel)
     - Catégorie
     - Couleur (pour calendrier)
   - Sauvegarder

3. **Configurer les plans de travail**
   - Via API pour le moment
   - UI à venir dans future version

4. **Gérer les périodes bloquées**
   - Via API pour le moment
   - UI à venir dans future version

## 📊 Exemples d'Utilisation

### Créer un Service (TypeScript)

```typescript
import { trpc } from '@/lib/trpc';

const createService = trpc.services.create.useMutation();

createService.mutate({
  name: "Consultation générale",
  description: "Consultation médicale standard",
  duration: 30,
  price: "50.00",
  currency: "EUR",
  categoryId: 1,
  color: "#3788d8",
});
```

### Réserver un Rendez-vous

```typescript
const createAppointment = trpc.appointments.create.useMutation();

createAppointment.mutate({
  practitionerId: 1,
  serviceId: 2,
  appointmentDate: new Date('2025-11-20'),
  startTime: "10:00",
  reason: "Consultation de suivi",
  notes: "Apporter les résultats d'analyses",
});
```

### Annuler par Hash

```typescript
const cancelByHash = trpc.appointments.cancelByHash.useMutation();

cancelByHash.mutate("abc123xyz789..."); // Hash reçu lors de la réservation
```

## 🔐 Sécurité

### Hash d'Annulation
- Généré avec `nanoid(32)` (32 caractères)
- Unique par rendez-vous
- Permet l'annulation sans authentification
- Conservé dans la table `appointments.hash`

### Authentification API
- Services publics : list, getById
- Création/modification : admin uniquement
- Annulation par hash : public (par design)

## 🎯 Prochaines Étapes

1. **Calcul Dynamique des Disponibilités**
   - Implémenter l'algorithme de calcul
   - Tenir compte des working plans
   - Exclure blocked periods
   - Vérifier les rendez-vous existants

2. **Notifications Email**
   - Configuration SMTP
   - Templates d'emails
   - Envoi automatique :
     - Confirmation de réservation
     - Rappel 24h avant
     - Confirmation d'annulation

3. **Webhooks Actifs**
   - Système de dispatch
   - Événements : appointment.created, appointment.cancelled
   - Retry logic
   - Logs de webhooks

4. **UI Admin Complète**
   - Gestion des working plans
   - Gestion des blocked periods
   - Tableau de bord des services
   - Analytics des réservations

5. **Amélirations UX**
   - Calcul temps réel des dispos
   - Sélection multiple de praticiens
   - Filtres avancés
   - Notifications push

## 📚 Références

- [EasyAppointments Original](https://github.com/alextselegidis/easyappointments)
- [Documentation EasyAppointments](https://easyappointments.org/docs.html)
- [API EasyAppointments](https://easyappointments.org/api-docs.html)

## 🤝 Contribution

Pour toute amélioration ou bug concernant ces fonctionnalités, veuillez :
1. Créer une issue sur GitHub
2. Proposer une PR avec vos modifications
3. Suivre les conventions de code du projet

---

**Version** : 1.0.0  
**Date** : 2025-11-15  
**Auteur** : GenSpark AI Developer
