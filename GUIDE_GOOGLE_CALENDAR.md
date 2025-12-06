# Guide Intégration Google Calendar

## Configuration requise

### Variables environnement :
```env
VITE_GOOGLE_CLIENT_ID=votre_client_id
VITE_GOOGLE_API_KEY=votre_api_key
GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=[clé privée]
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_CALENDAR_ID=primary
```

### Service Account :
1. Créer dans Google Cloud Console
2. Activer API Google Calendar
3. Télécharger clé JSON
4. Ajouter email service account aux permissions calendrier

### OAuth (optionnel) :
1. Créer identifiants OAuth 2.0 Client ID
2. Configurer URLs redirection
3. Obtenir refresh token

## Fonctionnalités

### Interface utilisateur :
- Type de consultation : sélecteur
- Email patient : optionnel (invitation automatique)

### Synchronisation automatique :
- Créneaux → Google Calendar
- Récupération 30 prochains jours
- Invitations patients automatiques

### Endpoints API :
```
GET  /api/health
POST /api/trpc/availabilitySlots.create
GET  /api/trpc/availabilitySlots.listByPractitioner
POST /api/trpc/googleCalendar.sync
```

## Structure données

**Création créneau** :
```typescript
{
  practitionerId: number;
  dayOfWeek: number;      // 0-6
  startTime: string;      // ISO datetime
  endTime: string;        // ISO datetime
  capacity?: number;      // default: 1
  notes?: string;         // Type consultation
  isActive?: boolean;     // default: true
  emailPatient?: string;  // Invitation Google
}
```

## Monitoring

### Health check :
```bash
curl https://webapp-frtjapec0-ikips-projects.vercel.app/api/health
```

Réponse :
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T21:00:00.000Z",
  "googleCalendar": "initialized"
}
```

## Dépannage

### Google Calendar not initialized :
- Vérifier variables environnement
- Confirmer clé privée formatée avec \n
- Valider permissions service account

### Failed to create event :
- API Google Calendar activée
- Email patient valide
- Vérifier quotas API

## Avantages

✅ **Synchronisation automatique**
✅ **Invitations patients**  
✅ **Visibilité complète**
✅ **Fiabilité Google**
✅ **Interface intuitive**

---
*Guide technique - Version 1.0.0*