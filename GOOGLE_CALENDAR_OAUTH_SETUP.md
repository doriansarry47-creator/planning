# 📅 Configuration Google Calendar avec OAuth 2.0

## 🎯 Objectif

Ce système permet de :
1. **Gérer vos disponibilités** directement depuis votre Google Calendar
2. **Permettre aux patients** de consulter les créneaux disponibles en ligne
3. **Synchroniser automatiquement** les rendez-vous pris par les patients sur votre Google Calendar

## 🔧 Configuration Actuelle

Les clés OAuth ont été configurées dans le fichier `.env` :

```env
# OAuth 2.0 Client ID
VITE_GOOGLE_CLIENT_ID=d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939
GOOGLE_CLIENT_ID=d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939

# Calendar API Key
VITE_GOOGLE_API_KEY=d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939
GOOGLE_API_KEY=d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939

# Pour la synchronisation Google Calendar
GOOGLE_CALENDAR_ID=primary
```

## ✨ Fonctionnalités Disponibles

### 1. Gestion des Disponibilités (Praticien)

Vous gérez vos disponibilités directement dans votre Google Calendar :

- **Bloquer un créneau** : Créez un événement dans votre calendrier Google
- **Libérer un créneau** : Supprimez l'événement correspondant
- **Les patients voient** : Uniquement les créneaux libres (pas d'événement)

### 2. Réservation de Rendez-vous (Patients)

Les patients peuvent :

1. Accéder à la page : **`/available-slots`**
2. Voir tous les créneaux disponibles pour les prochaines semaines
3. Sélectionner un créneau
4. Remplir leurs informations (nom, email, téléphone, motif)
5. Confirmer la réservation

### 3. Synchronisation Automatique

Lorsqu'un patient prend rendez-vous :

- ✅ Un événement est **automatiquement créé** dans votre Google Calendar
- ✅ Le patient reçoit un **email de confirmation**
- ✅ Des **rappels automatiques** sont configurés (1 jour et 1 heure avant)
- ✅ Le patient apparaît comme **participant** dans l'événement

## 🚀 Utilisation

### Pour le Praticien

#### Définir vos Disponibilités

**Option 1 : Laisser les créneaux libres (Recommandé)**
- Ne créez **aucun événement** sur les plages horaires où vous êtes disponible
- Le système détectera automatiquement les plages libres entre 9h et 18h (personnalisable)

**Option 2 : Marquer explicitement les disponibilités**
- Créez des événements "DISPONIBLE" dans votre calendrier
- Ces créneaux seront visibles pour les patients

#### Bloquer des Créneaux

1. Ouvrez votre Google Calendar
2. Créez un événement sur la plage horaire à bloquer
3. Les patients ne verront plus ce créneau comme disponible

#### Configurer les Horaires de Travail

Par défaut, les créneaux sont proposés :
- **Lundi à Vendredi** (pas le weekend)
- **9h00 à 18h00**
- **Par tranches de 30 minutes**

Pour modifier ces paramètres, éditez le fichier :
```
server/googleCalendarRouter.ts
```

### Pour les Patients

1. **Accéder à la page** : `https://votre-site.com/available-slots`

2. **Naviguer dans le calendrier** :
   - Utilisez les boutons "Semaine précédente" / "Semaine suivante"
   - Les créneaux disponibles sont en **vert**
   - Les créneaux occupés sont en **rouge/gris**

3. **Réserver un créneau** :
   - Cliquez sur un créneau disponible (vert)
   - Remplissez le formulaire :
     - Nom complet *
     - Email * (pour recevoir la confirmation)
     - Téléphone (optionnel)
     - Motif de consultation (optionnel)
   - Cliquez sur "Confirmer"

4. **Confirmation** :
   - Un email de confirmation est envoyé
   - L'événement apparaît dans le Google Calendar du praticien
   - Des rappels automatiques sont configurés

## 📊 API Endpoints

### Récupérer les créneaux disponibles

```typescript
trpc.googleCalendar.getAvailableSlots.useQuery({
  startDate: "2025-11-21T00:00:00.000Z",
  endDate: "2025-11-27T23:59:59.999Z",
  workingHours: {
    start: "09:00",
    end: "18:00"
  },
  slotDuration: 30 // minutes
})
```

### Créer un rendez-vous

```typescript
trpc.googleCalendar.createAppointment.useMutation({
  patientName: "Jean Dupont",
  patientEmail: "jean@example.com",
  patientPhone: "0612345678",
  date: "2025-11-25T00:00:00.000Z",
  startTime: "10:00",
  endTime: "10:30",
  reason: "Consultation",
  practitionerName: "Dr. Praticien"
})
```

### Vérifier la disponibilité d'un créneau

```typescript
trpc.googleCalendar.checkSlotAvailability.useQuery({
  date: "2025-11-25T00:00:00.000Z",
  startTime: "10:00",
  endTime: "10:30"
})
```

### Annuler un rendez-vous

```typescript
trpc.googleCalendar.cancelAppointment.useMutation({
  eventId: "google-event-id"
})
```

## 🔒 Sécurité

Les clés OAuth sont stockées dans le fichier `.env` qui :
- ❌ **N'est PAS commité** dans Git (dans `.gitignore`)
- ✅ Est **sécurisé** côté serveur uniquement
- ✅ N'est **jamais exposé** au client

En production (Vercel), configurez les variables d'environnement dans les paramètres du projet.

## 🎨 Personnalisation

### Modifier les Horaires de Travail

Dans `server/googleCalendarRouter.ts`, ligne ~20 :

```typescript
workingHours: {
  start: z.string().regex(/^\d{2}:\d{2}$/), // Ex: "08:00"
  end: z.string().regex(/^\d{2}:\d{2}$/),   // Ex: "19:00"
}
```

### Modifier la Durée des Créneaux

Par défaut : 30 minutes. Pour changer :

```typescript
slotDuration: z.number().min(15).max(120).optional()
```

### Modifier les Rappels

Dans `server/services/googleCalendarOAuth.ts`, ligne ~180 :

```typescript
reminders: {
  useDefault: false,
  overrides: [
    { method: 'email', minutes: 24 * 60 }, // 1 jour avant
    { method: 'email', minutes: 60 },      // 1 heure avant
    { method: 'popup', minutes: 30 },      // 30 minutes avant
  ],
}
```

### Activer les Weekends

Dans `server/services/googleCalendarOAuth.ts`, ligne ~70 :

```typescript
// Commenter ces lignes pour activer les weekends
// if (dayOfWeek !== 0 && dayOfWeek !== 6) {
//   ...
// }
```

## 🐛 Dépannage

### Les créneaux ne s'affichent pas

1. Vérifiez que les variables d'environnement sont bien configurées
2. Vérifiez que l'API Google Calendar est activée
3. Vérifiez les logs du serveur pour les erreurs
4. Vérifiez que `GOOGLE_CALENDAR_ID=primary` est correct

### Les rendez-vous ne sont pas créés

1. Vérifiez que le Client ID et API Key sont corrects
2. Vérifiez que le calendrier est accessible
3. Regardez les logs du serveur pour les erreurs détaillées

### Les patients ne voient pas les mêmes créneaux

1. Vérifiez le fuseau horaire (Europe/Paris par défaut)
2. Videz le cache du navigateur
3. Vérifiez la synchronisation de votre Google Calendar

## 📚 Architecture

```
client/src/pages/AvailableSlots.tsx
  └─> trpc.googleCalendar.*
      └─> server/googleCalendarRouter.ts
          └─> server/services/googleCalendarOAuth.ts
              └─> Google Calendar API
```

## 🎉 Résultat Final

Une fois tout configuré, vous avez :

✅ **Gestion simple** de vos disponibilités via Google Calendar
✅ **Interface patient** moderne et intuitive
✅ **Synchronisation automatique** des rendez-vous
✅ **Emails de confirmation** automatiques
✅ **Rappels automatiques** pour les patients
✅ **Accès depuis tous vos appareils** (smartphone, tablette, ordinateur)

## 🚀 Prochaines Étapes

Pour activer le système en production :

1. Déployez l'application sur Vercel
2. Configurez les variables d'environnement dans Vercel
3. Testez la prise de rendez-vous
4. Communiquez le lien `/available-slots` à vos patients

---

**Questions ?** Consultez la documentation complète ou contactez le support.
