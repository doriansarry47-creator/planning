# 🏥 Système de Réservation Type Doctolib - Guide d'Intégration

## 🎯 Améliorations Implémentées

Ce document détaille toutes les améliorations apportées au système de gestion des rendez-vous pour créer une solution type Doctolib avec intégration Google Calendar.

## 📋 Nouvelles Fonctionnalités

### 1. Gestion Avancée des Créneaux (`availability_slots`)

**Nouvelle table** pour gérer les créneaux de disponibilité réutilisables :

- ✅ Créneaux avec capacité multiple (plusieurs patients par créneau)
- ✅ Gestion de récurrence (règles RRULE ou JSON)  
- ✅ Suivi du statut de réservation
- ✅ Notes et métadonnées par créneau

### 2. Intégration Google Calendar

**Service complet** pour synchroniser automatiquement les rendez-vous :

- ✅ Authentification via Service Account ou OAuth
- ✅ Création automatique d'événements lors de réservation
- ✅ Mise à jour et suppression synchronisées
- ✅ Gestion des erreurs et reconnection
- ✅ Support multi-calendrier

### 3. API Enrichie

**Nouveaux endpoints** pour une expérience Doctolib-like :

- ✅ `GET /api/availability/slots/:practitionerId/:date` - Créneaux disponibles
- ✅ `POST /api/availability/slots/generate` - Génération automatique
- ✅ `POST /api/availability/slots/recurring` - Créneaux récurrents
- ✅ CRUD complet pour la gestion des créneaux

### 4. Logique de Réservation Améliorée

**Transaction sécurisée** pour éviter les double-bookings :

- ✅ Vérification de disponibilité en temps réel
- ✅ Transaction atomique (DB + Google Calendar)
- ✅ Gestion des capacités multiples
- ✅ Rollback automatique en cas d'erreur

## 🛠️ Configuration Google Calendar

### Option A : Service Account (Recommandée)

1. **Créer un Service Account** dans Google Cloud Console :
   ```bash
   # 1. Aller sur https://console.cloud.google.com/
   # 2. Créer ou sélectionner un projet
   # 3. Activer l'API Google Calendar
   # 4. Créer un Service Account
   # 5. Télécharger le fichier JSON des credentials
   ```

2. **Configurer les variables d'environnement** :
   ```env
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
   GOOGLE_CALENDAR_ID=primary
   ```

3. **Partager le calendrier** avec le service account :
   ```
   # Dans Google Calendar, partager votre calendrier avec l'email du service account
   # avec les permissions "Apporter des modifications aux événements"
   ```

### Option B : Variables Séparées

```env
GOOGLE_CLIENT_EMAIL=your-service@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary
```

### Test de Connexion

Utilisez l'endpoint de test pour vérifier la configuration :

```bash
POST /api/availability/test-connection
# Headers: Authorization: Bearer <admin-jwt>

# Réponse attendue:
{
  "message": "Connexion Google Calendar réussie",
  "status": "connected"
}
```

## 📊 Exemples d'Utilisation

### 1. Créer des Créneaux Récurrents

```bash
POST /api/availability/slots/recurring
Content-Type: application/json
Authorization: Bearer <admin-jwt>

{
  "practitionerId": "uuid-praticien",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "timeSlots": [
    {
      "startTime": "09:00",
      "endTime": "09:30",
      "daysOfWeek": [1, 2, 3, 4, 5]
    },
    {
      "startTime": "14:00", 
      "endTime": "14:30",
      "daysOfWeek": [1, 2, 3, 4, 5]
    }
  ],
  "capacity": 1,
  "notes": "Consultations standard"
}
```

### 2. Génération Automatique de Créneaux

```bash
POST /api/availability/slots/generate
Content-Type: application/json
Authorization: Bearer <admin-jwt>

{
  "practitionerId": "uuid-praticien",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "workingDays": [1, 2, 3, 4, 5],
  "workingHours": { "start": "09:00", "end": "17:00" },
  "slotDuration": 30,
  "breakTimes": [{ "start": "12:00", "end": "13:00" }],
  "capacity": 1
}
```

### 3. Récupérer les Créneaux Disponibles

```bash
GET /api/availability/slots/uuid-praticien/2024-01-15?availableOnly=true

# Réponse:
{
  "practitionerId": "uuid-praticien",
  "practitionerName": "Dr. Jean Dupont",
  "date": "2024-01-15",
  "slots": [
    {
      "id": "slot-uuid",
      "practitionerId": "uuid-praticien",
      "startTime": "2024-01-15T09:00:00.000Z",
      "endTime": "2024-01-15T09:30:00.000Z",
      "duration": 30,
      "isAvailable": true,
      "capacity": 1,
      "bookedCount": 0
    }
  ],
  "totalSlots": 16
}
```

### 4. Réserver un Créneau avec Google Calendar

```bash
POST /api/appointments
Content-Type: application/json
Authorization: Bearer <patient-jwt>

{
  "practitionerId": "uuid-praticien",
  "slotId": "slot-uuid",
  "appointmentDate": "2024-01-15",
  "startTime": "09:00",
  "endTime": "09:30",
  "reason": "Consultation de routine"
}

# Le système :
# 1. Vérifie la disponibilité du créneau
# 2. Crée le rendez-vous en transaction
# 3. Crée automatiquement l'événement Google Calendar
# 4. Retourne les détails avec l'ID Google Calendar
```

## 🔄 Workflow Complet Type Doctolib

### Côté Admin

1. **Configuration initiale** :
   ```bash
   # 1. Créer les praticiens via /api/practitioners
   # 2. Générer leurs créneaux via /api/availability/slots/generate
   # 3. Configurer les exceptions via /api/availability/slots
   ```

2. **Gestion continue** :
   ```bash
   # Ajouter des créneaux ponctuels
   POST /api/availability/slots
   
   # Modifier les créneaux existants
   PUT /api/availability/slots/:id
   
   # Désactiver/supprimer des créneaux
   DELETE /api/availability/slots/:id?force=true
   ```

### Côté Patient

1. **Sélection du praticien** :
   ```bash
   GET /api/practitioners
   ```

2. **Consultation des créneaux disponibles** :
   ```bash
   GET /api/availability/slots/:practitionerId/:date?availableOnly=true
   ```

3. **Réservation** :
   ```bash
   POST /api/appointments
   # Avec slotId pour les créneaux prédéfinis
   ```

4. **Gestion des rendez-vous** :
   ```bash
   GET /api/appointments/patient      # Voir ses rendez-vous
   PUT /api/appointments/:id/cancel   # Annuler (+ suppression Google Calendar)
   ```

## 🔐 Sécurité et Bonnes Pratiques

### 1. Gestion des Transactions

```typescript
// Exemple de transaction sécurisée
await db.transaction(async (trx) => {
  // 1. Vérifier disponibilité
  const isAvailable = await checkSlotAvailability(slotId);
  if (!isAvailable) throw new Error("Créneau non disponible");
  
  // 2. Créer le rendez-vous
  const appointment = await trx.insert(appointments).values(data).returning();
  
  // 3. Marquer le créneau comme réservé si capacité atteinte
  await updateSlotCapacity(slotId);
  
  return appointment;
});
```

### 2. Gestion des Erreurs Google Calendar

```typescript
// Création avec fallback gracieux
googleCalendarService.createEvent(appointment, practitioner, patient)
  .then(async (result) => {
    if (result.success) {
      await db.update(appointments)
        .set({ googleEventId: result.eventId })
        .where(eq(appointments.id, appointment.id));
    } else {
      console.error('Google Calendar error:', result.error);
      // Le rendez-vous reste valide même si Google Calendar échoue
    }
  })
  .catch(error => {
    console.error('Critical Google Calendar error:', error);
  });
```

### 3. Validation des Données

```typescript
// Toujours valider avec Zod
const validatedData = insertAvailabilitySlotSchema.parse(req.body);

// Vérifier l'existence des ressources
const practitioner = await db.select()
  .from(practitioners)
  .where(eq(practitioners.id, practitionerId))
  .limit(1);

if (practitioner.length === 0) {
  throw new Error("Praticien introuvable");
}
```

## 📈 Performance et Scalabilité

### 1. Indexation Base de Données

```sql
-- Index recommandés pour performance
CREATE INDEX idx_availability_slots_practitioner_date ON availability_slots(practitioner_id, start_time);
CREATE INDEX idx_appointments_slot_status ON appointments(slot_id, status);
CREATE INDEX idx_appointments_practitioner_date ON appointments(practitioner_id, appointment_date);
```

### 2. Cache et Optimisation

```typescript
// Mise en cache des créneaux disponibles
const cacheKey = `availability:${practitionerId}:${date}`;
let slots = await cache.get(cacheKey);

if (!slots) {
  slots = await availabilityService.getAvailableSlots(filters);
  await cache.set(cacheKey, slots, 300); // 5 minutes
}
```

### 3. Pagination pour Gros Volumes

```typescript
// Pagination des créneaux
GET /api/availability/slots/:practitionerId?page=1&limit=50&startDate=2024-01-01&endDate=2024-01-31
```

## 🚀 Déploiement

### 1. Variables d'Environnement de Production

```env
# Base de données
DATABASE_URL=postgresql://...

# Google Calendar (Service Account JSON en une ligne)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_CALENDAR_ID=primary

# Sécurité
JWT_SECRET=your-production-secret
SESSION_SECRET=your-session-secret
```

### 2. Migration de Base de Données

```bash
# Appliquer le nouveau schéma
npm run db:push

# Optionnel: créer des données de test
npm run db:seed
```

### 3. Test de Santé

```bash
# Vérifier que tout fonctionne
GET /api/health
GET /api/availability/test-connection
```

## 🔧 Dépannage

### Problèmes Courants

1. **"Google Calendar non configuré"**
   - Vérifier les variables d'environnement
   - Tester avec `/api/availability/test-connection`

2. **"Créneau non disponible"**
   - Vérifier la capacité du créneau
   - Utiliser `availableOnly=true` dans les requêtes

3. **"Erreur de transaction"**
   - Vérifier les contraintes de base de données
   - S'assurer que les IDs existent

### Logs Utiles

```bash
# Activer les logs détaillés
DEBUG=google-calendar,availability npm start
```

## 📚 Documentation API Complète

### Endpoints Disponibles

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/availability/slots/:practitionerId/:date` | Créneaux d'une date | Public |
| `GET` | `/api/availability/slots/:practitionerId` | Tous les créneaux | Public |
| `POST` | `/api/availability/slots` | Créer un créneau | Admin |
| `POST` | `/api/availability/slots/recurring` | Créneaux récurrents | Admin |
| `POST` | `/api/availability/slots/generate` | Génération auto | Admin |
| `PUT` | `/api/availability/slots/:id` | Modifier créneau | Admin |
| `DELETE` | `/api/availability/slots/:id` | Supprimer créneau | Admin |
| `POST` | `/api/appointments` | Réserver (+ Google Calendar) | Patient |
| `PUT` | `/api/appointments/:id/cancel` | Annuler (+ Google Calendar) | Patient |
| `POST` | `/api/availability/test-connection` | Test Google Calendar | Admin |

### Codes de Réponse

- `200`: Succès
- `201`: Créé avec succès
- `400`: Données invalides
- `401`: Non authentifié
- `403`: Non autorisé  
- `404`: Ressource introuvable
- `500`: Erreur serveur

---

## ✨ Résumé des Améliorations

Votre système dispose maintenant de :

✅ **Gestion complète des créneaux** type Doctolib  
✅ **Intégration Google Calendar** automatique  
✅ **API enrichie** avec tous les endpoints nécessaires  
✅ **Logique de réservation sécurisée** avec transactions  
✅ **Documentation complète** pour l'utilisation  
✅ **Architecture scalable** pour croissance future  

Le système est maintenant prêt pour une utilisation en production avec toutes les fonctionnalités d'une plateforme de réservation moderne ! 🎉