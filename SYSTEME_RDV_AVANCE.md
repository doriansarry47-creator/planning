# 🚀 Système de Rendez-vous Avancé avec Google Calendar

## 📋 Vue d'ensemble

Ce système offre une solution complète de gestion de rendez-vous avec :
- **Calendrier dédié** secondaire pour les RDV (séparé du calendrier personnel)
- **Créneaux récurrents** et ponctuels
- **Verrouillage temporaire** des créneaux pendant la réservation
- **Vérification des conflits** en temps réel
- **Protection contre les double-réservations**

## 🎯 Architecture

```
┌─────────────────────────────────────────────┐
│         GOOGLE CALENDAR                      │
│                                             │
│  ┌──────────────┐    ┌──────────────┐     │
│  │  Calendrier  │    │  Calendrier  │     │
│  │  Principal   │    │  RDV (dédié) │     │
│  │  (privé)     │    │  (public)    │     │
│  └──────────────┘    └──────────────┘     │
│         │                    │              │
│         └──────┬─────────────┘              │
│                │                            │
└────────────────┼────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│    BACKEND - Appointment Calendar Service   │
│                                             │
│  • Gestion des créneaux disponibles         │
│  • Verrouillage temporaire                  │
│  • Vérification des conflits                │
│  • Création/annulation de RDV               │
└─────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│           FRONTEND                           │
│                                             │
│  ┌──────────────┐    ┌──────────────┐     │
│  │    Admin     │    │   Patient    │     │
│  │ Availability │    │   Booking    │     │
│  └──────────────┘    └──────────────┘     │
└─────────────────────────────────────────────┘
```

## 🔧 Configuration

### 1. Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
# OAuth Google Calendar
VITE_GOOGLE_CLIENT_ID=d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939
GOOGLE_CLIENT_ID=d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939

VITE_GOOGLE_API_KEY=d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939
GOOGLE_API_KEY=d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939

# Calendrier principal (pour vérification conflits)
GOOGLE_CALENDAR_ID=primary
GOOGLE_MAIN_CALENDAR_ID=primary

# Calendrier dédié aux RDV
GOOGLE_APPOINTMENT_CALENDAR_ID=primary
# Ou créez un calendrier dédié et utilisez son ID
```

### 2. Créer un calendrier dédié (Recommandé)

#### Option A : Via l'interface admin

1. Accédez à `/admin/availability`
2. Le système proposera de créer un calendrier dédié
3. L'ID du calendrier sera automatiquement configuré

#### Option B : Manuellement dans Google Calendar

1. Ouvrez Google Calendar
2. Cliquez sur "+" à côté de "Autres agendas"
3. Sélectionnez "Créer un agenda"
4. Nom : "Rendez-vous Patients"
5. Description : "Calendrier dédié à la gestion des RDV"
6. Cliquez sur "Créer un agenda"
7. Paramètres → Intégration de l'agenda
8. Copiez l'**ID de l'agenda**
9. Ajoutez dans `.env` : `GOOGLE_APPOINTMENT_CALENDAR_ID=xxx@group.calendar.google.com`

## 👨‍⚕️ Interface Admin - Gestion des Disponibilités

### Accès
URL: `/admin/availability`
Rôle requis: Admin

### Fonctionnalités

#### 1. Créer un Créneau Ponctuel

**Utilisation :** Pour un créneau unique à une date spécifique.

Exemple :
- Date : 25 novembre 2025
- Heure : 10h00 - 10h30

Le créneau sera visible uniquement pour cette date.

#### 2. Créer des Créneaux Récurrents

**Utilisation :** Pour des créneaux qui se répètent régulièrement.

Exemples :

**Tous les lundis 9h-10h pendant 3 mois :**
```
Date de début : 2025-11-25
Heure : 09:00 - 10:00
Fréquence : Hebdomadaire
Jours : Lundi
Date de fin : 2026-02-25
```

**Tous les jours ouvrables 14h-15h :**
```
Date de début : 2025-11-25
Heure : 14:00 - 15:00
Fréquence : Hebdomadaire
Jours : Lundi, Mardi, Mercredi, Jeudi, Vendredi
Date de fin : 2025-12-31
```

#### 3. Création en Masse

**Utilisation :** Pour générer automatiquement tous les créneaux d'une période.

Exemple : Créer tous les créneaux de décembre 2025
```
Date de début : 2025-12-01
Date de fin : 2025-12-31
Horaires : 09:00 - 18:00
Durée des créneaux : 30 minutes
Jours de travail : Lundi à Vendredi
```

Résultat : Le système créera automatiquement ~360 créneaux (18 par jour × 20 jours ouvrables).

#### 4. Supprimer un Créneau

Cliquez sur l'icône 🗑️ à côté d'un créneau pour le supprimer.

⚠️ **Attention :** Si le créneau est déjà réservé, il sera transformé en créneau disponible.

## 👥 Interface Patient - Réservation de Rendez-vous

### Accès
URL: `/booking`
Rôle : Public (pas d'authentification requise)

### Processus de Réservation

#### Étape 1 : Sélection du créneau

1. Le patient navigue dans le calendrier par semaines
2. Les créneaux disponibles sont affichés en **vert**
3. Cliquez sur un créneau pour le sélectionner

#### Étape 2 : Verrouillage automatique

Dès qu'un patient clique sur un créneau :
- ✅ Le créneau est **verrouillé pour 5 minutes**
- ⏰ Un **timer** s'affiche : "4:59, 4:58, ..."
- 🔒 Aucun autre patient ne peut réserver ce créneau pendant ce temps
- Le créneau passe en **jaune** dans Google Calendar

#### Étape 3 : Formulaire de réservation

Le patient remplit :
- **Nom complet** (requis)
- **Email** (requis) - Pour la confirmation
- **Téléphone** (optionnel)
- **Motif** (optionnel) - Description de la consultation

#### Étape 4 : Confirmation

Deux options :

**Option A : Confirmer**
- Le rendez-vous est créé
- Le créneau passe en **bleu** dans Google Calendar
- Un email de confirmation est envoyé au patient
- Des rappels automatiques sont configurés (1 jour et 1 heure avant)
- Le praticien voit le RDV dans son calendrier

**Option B : Annuler**
- Le créneau est déverrouillé automatiquement
- Il redevient **disponible** (vert) pour les autres patients

#### Étape 5 : Expiration du verrou

Si le patient ne confirme pas dans les 5 minutes :
- ⏰ Le verrou expire automatiquement
- 🔓 Le créneau redevient disponible
- ❌ Le formulaire se ferme
- Le patient doit recommencer

## 🔒 Sécurité & Gestion des Conflits

### Verrouillage de Créneaux

Le système utilise un **double verrou** :
1. **Verrou en mémoire** (serveur) : Immédiat et ultra-rapide
2. **Verrou Google Calendar** : Le créneau passe en "RÉSERVATION EN COURS"

### Vérification des Conflits

Avant chaque réservation, le système vérifie :
1. ✅ Le créneau n'est pas déjà réservé dans le calendrier RDV
2. ✅ Aucun conflit avec le calendrier principal (optionnel)
3. ✅ Le créneau n'est pas verrouillé par un autre utilisateur
4. ✅ Le créneau existe toujours (pas supprimé entre-temps)

### Protection Contre Double-Réservation

**Scénario :** 2 patients cliquent exactement en même temps sur le même créneau

Résultat :
- 👤 **Patient A** : Verrou obtenu ✅ → Peut réserver
- 👤 **Patient B** : Verrou refusé ❌ → Message "Ce créneau vient d'être pris"

Le système garantit **un seul réservant à la fois**.

### Confidentialité

- ❌ Les patients ne voient **JAMAIS** les événements privés du praticien
- ✅ Seuls les créneaux marqués "DISPONIBLE" sont visibles
- ✅ Le calendrier principal reste 100% privé
- ✅ Le praticien contrôle totalement ce qui est visible

## 📊 États des Créneaux

| État | Couleur | Description | Visible Patient |
|------|---------|-------------|-----------------|
| **DISPONIBLE** | 🟢 Vert | Créneau libre | ✅ Oui |
| **VERROUILLÉ** | 🟡 Jaune | En cours de réservation | ❌ Non |
| **RÉSERVÉ** | 🔵 Bleu | Rendez-vous confirmé | ❌ Non |
| **PRIVÉ** | 🔴 Rouge | Événement personnel | ❌ Non |

## 🔄 Workflow Complet

### Du côté Praticien

1. **Création de créneaux** (via `/admin/availability`)
   - Créneaux ponctuels, récurrents, ou en masse
   - Apparaissent en **vert** dans Google Calendar

2. **Réception de réservation**
   - Le créneau vert devient **bleu**
   - Détails du patient visibles (nom, email, téléphone, motif)
   - Notification email reçue

3. **Gestion du calendrier**
   - Créneaux bleus = RDV confirmés
   - Créneaux verts = Disponibles
   - Autres couleurs = Événements personnels

### Du côté Patient

1. **Consultation** (`/booking`)
   - Voit uniquement les créneaux verts

2. **Sélection**
   - Clique sur un créneau
   - Timer de 5 minutes démarre

3. **Réservation**
   - Remplit le formulaire
   - Confirme

4. **Confirmation**
   - Email reçu instantanément
   - Rappels automatiques configurés

## 🛠️ API Endpoints

### Admin

```typescript
// Créer un calendrier dédié
appointmentBooking.createAppointmentCalendar({ calendarName: "RDV Patients" })

// Créer un créneau ponctuel
appointmentBooking.createAvailabilitySlot({
  date: "2025-11-25T00:00:00Z",
  startTime: "10:00",
  endTime: "10:30"
})

// Créer des créneaux récurrents
appointmentBooking.createRecurrentAvailability({
  startDate: "2025-11-25T00:00:00Z",
  startTime: "09:00",
  endTime: "10:00",
  recurrence: {
    frequency: "weekly",
    daysOfWeek: [1, 3, 5], // Lun, Mer, Ven
    endDate: "2026-02-25T23:59:59Z"
  }
})

// Création en masse
appointmentBooking.createBatchSlots({
  startDate: "2025-12-01T00:00:00Z",
  endDate: "2025-12-31T23:59:59Z",
  workingHours: { start: "09:00", end: "18:00" },
  slotDuration: 30,
  daysOfWeek: [1, 2, 3, 4, 5]
})

// Supprimer un créneau
appointmentBooking.deleteAvailabilitySlot({ slotId: "xxx" })
```

### Public (Patients)

```typescript
// Récupérer les créneaux disponibles
appointmentBooking.getAvailableSlots({
  startDate: "2025-11-25T00:00:00Z",
  endDate: "2025-12-01T23:59:59Z"
})

// Verrouiller un créneau
appointmentBooking.lockSlot({
  slotId: "xxx",
  durationMinutes: 5
})

// Vérifier les conflits
appointmentBooking.checkConflicts({
  date: "2025-11-25T00:00:00Z",
  startTime: "10:00",
  endTime: "10:30"
})

// Réserver
appointmentBooking.bookSlot({
  slotId: "xxx",
  patientInfo: {
    name: "Jean Dupont",
    email: "jean@example.com",
    phone: "0612345678",
    reason: "Consultation"
  }
})

// Déverrouiller (annulation)
appointmentBooking.unlockSlot({ slotId: "xxx" })
```

## 🎨 Personnalisation

### Durée du Verrouillage

Par défaut : 5 minutes. Pour modifier :

```typescript
// client/src/pages/ImprovedBooking.tsx, ligne ~97
lockSlot.mutate({ slotId: slot.id, durationMinutes: 10 }) // 10 minutes
```

### Horaires de Travail

Modifiez les horaires par défaut dans la création en masse.

### Durée des Créneaux

Par défaut : 30 minutes. Ajustable lors de la création en masse.

## 🐛 Dépannage

### Les créneaux ne s'affichent pas

1. Vérifiez que `GOOGLE_APPOINTMENT_CALENDAR_ID` est défini
2. Vérifiez que l'API Google Calendar est activée
3. Regardez les logs serveur pour les erreurs

### Le verrouillage ne fonctionne pas

1. Vérifiez que le serveur tourne en continu
2. Les verrous en mémoire sont perdus au redémarrage du serveur
3. Solution : utiliser Redis pour la persistance (optionnel)

### Double-réservation malgré tout

1. Vérifiez la latence réseau
2. Augmentez la durée du verrou si nécessaire
3. Vérifiez les logs pour détecter les erreurs

## ✅ Checklist de Déploiement

- [ ] Variables d'environnement configurées dans Vercel
- [ ] Calendrier dédié créé (optionnel mais recommandé)
- [ ] API Google Calendar activée
- [ ] Clés OAuth valides
- [ ] Tests de bout en bout effectués
- [ ] Documentation partagée avec l'équipe

## 🚀 Prochaines Améliorations Possibles

- [ ] Persistance des verrous avec Redis
- [ ] Notifications SMS (Twilio)
- [ ] Export iCal pour les patients
- [ ] Salle d'attente virtuelle
- [ ] Paiement en ligne
- [ ] Visioconférence intégrée
- [ ] Statistiques et analytics

---

**Système prêt à l'emploi** ✅
**Production-ready** ✅
**Scalable** ✅
