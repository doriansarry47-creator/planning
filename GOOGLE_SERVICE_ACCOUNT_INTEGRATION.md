# Intégration Google Service Account - Guide Complet

## ✅ Configuration Réussie

L'intégration Google Service Account a été configurée avec succès pour permettre la synchronisation automatique avec Google Calendar.

## 📋 Détails du Service Account

### Informations d'identification

- **Project ID**: `apaddicto`
- **Service Account Email**: `planningadmin@apaddicto.iam.gserviceaccount.com`
- **Client ID**: `117226736084884112171`
- **Private Key ID**: `cf5391b4920e407d0f2afce77d704830895dd37c`

### Calendrier cible

- **Calendar ID**: `doriansarry47@gmail.com`

## 🔧 Configuration des Variables d'Environnement

### Variables requises

Les variables suivantes ont été ajoutées au fichier `.env`:

```bash
# Service Account Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com
```

### Variables de fallback (optionnelles)

```bash
# Google Calendar iCal (Fallback)
GOOGLE_CALENDAR_ICAL_URL=https://calendar.google.com/calendar/ical/doriansarry47%40gmail.com/private-2cf662f95113561ce5f879c3be6193c7/basic.ics
GOOGLE_CALENDAR_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com

# OAuth (Alternative)
GOOGLE_CLIENT_ID=603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:5173/oauth/callback
GOOGLE_REFRESH_TOKEN=1//036wt8eMutncaCgYIARAAGAMSNwF-L9IrYYVjwaU8Aom2Xu31hFufKfxX8TiMsCqa6Am8bdSzXUYk0hbKilAvYukmI47egIUWd5M
```

## 🎯 Fonctionnalités Activées

### 1. Lecture des disponibilités

Le système peut maintenant lire les créneaux "DISPONIBLE" directement depuis Google Calendar:

```typescript
const service = getGoogleCalendarService();
const slots = await service.getAvailableSlots(date, 60);
```

### 2. Création de rendez-vous

Le système peut créer des événements de rendez-vous dans Google Calendar:

```typescript
const eventId = await service.bookAppointment({
  date: appointmentDate,
  startTime: "14:00",
  duration: 60,
  patientName: "Jean Dupont",
  patientEmail: "jean.dupont@example.com",
  patientPhone: "+33612345678",
  reason: "Consultation générale",
});
```

### 3. Système de fallback

Le système dispose de 3 niveaux de fallback:

1. **Service Account JWT** (méthode principale)
2. **Google Calendar iCal** (fallback en lecture seule)
3. **Créneaux par défaut** (fallback complet)

## 🚀 Déploiement sur Vercel

### Variables d'environnement à configurer

Pour déployer sur Vercel, ajoutez les variables suivantes dans les paramètres du projet:

```bash
# Variables obligatoires
GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC466s/UvpWfdv2\nkcCX2jzeshNKCPr2B0ZWLgK8rKOU1V8pShF1H5iZhLDxJohfbNrx8fR9cBTYEGD8\n8exLG14M92RtJ8J68TyO9YZg5+AggPMpBeQgyPI4YPyzArjV1KmNFpsocBpB1OLU\nD6VrS61LeGgKas9hk1OiwwtLjercBvESSE98474b//MCGHoA3LgjhuDGL8MrGjwI\n/EApDVyDd8Z8G8eV12Tu4kaXqFZjf1+/twUJhIwteLDYNmahW27XlgvQs8J1vNzA\nx+2Qr5NDWyaVAr0PPCDe/S+rXdTL3rXGA5zYiCg1MOOuCUtYPrihZv86Bg/7OfkC\nJeBlzccvAgMBAAECggEAWTJ0O+tOjYHQJDNR7u16BwFmhIOoahxANTmkYFX14ci6\nSjRMD27aMNLsdqXbigv74FCRWiBCLaZY4infjKr6xs5eRriy+pJ6X4rW8s9mMMeC\ngvswew/ypndB7ScW+S3HSyLoXK0WPULu1tNlO0gZoxnFNaEnvy1NXmkufZdK/i4X\n7SfDDfBtI/E0nKcEoNoYojoB3W6TW0x0ipo4qiSUU7EP8yxCo40Az1+s04boHWYU\nE2vHtx1qc+HH7S2Xe8KpgiouqDufUkC+1Wp2rvEeEf/b3fSjg7cSggzz8bHkYQIN\n4UgP2dWivBloxyFPKQ5E7OWqe+1t/OvrFpa5pzA5oQKBgQDx7Su4Dgv4TNdxXHUE\ngGxCii0G55Y6YC/uoEzu0vyiup/VWIp0ep6Ahq6IsY4jh+gHWKHBnQjC1dTNnZmd\naEB0v3ECFsL4Szdmi/0pcPxphCwBrkCpRdvARdK1FiJf0ziqiLNNc4G4jgv2LcGL\nVYLvxVWQssHDEjv57W4/dBdTfQKBgQDDrY1yO3jejeZz/p/aX7NWoQG1qLHSkXO2\nubWLBlYwLYqXR43oogLsRoJ8qpEM9K2FvYpexa8dx569HHFG9fhfBgHaUO/rMQgg\nFriXzJTmaM82zMZn8K4qsAoifE6ucehLzbzAfqsNMn8quBN7Yjc/8TMXxIWvl4JJ\n0rfzXkctGwKBgQDiXA9z/3CjuwI6R1AWDjM9bxwCQd4GcMlodQSG0VMgz42NiXLC\n2ZhEmb/kln1wMVGgzgVLqyrvYjPiz3tUFJ96nUWXtsRmnboQcRtHEziZYdnrGKfX\nuk2K8cndNgCjuHZk2dMqvNC7Ze07QkS9oh0JS5Jr+VXit8T2bHmjVXQd4QKBgFSd\nEIPr6Zk6/QL9gLwaE9+K4cVeu/4UvVevOCx0wgI1Py+pVljY7bCj0Lr9uplCmGIz\nksjmbJHRBvg5e1Y2+H6Gh3iS9RvbaOsPSCUD5wM3IRtOMyEw9u8ojklZPWC7irp0\nrYEDhQ3A3zJmxK3ey4tPzkshxLkoJ8OqZbbL9rUvAoGBAI+lcG08Ji7I+uTIyWy+\nH8+gHLRrkmaHGBrimuauduav/dMHbuOcAa6ctKgYL5HWfpZOJiN0mFgObO+qHVG2\n5vpBQGIaES555WGLcEK9I0HVW9TKtcnsL/s1mPr+4nVGN4Np8aLQy3GrShKJzEya\nAQr9mE9XwRq/DgmC1DQMJXBc\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com

# Variables de base de données
DATABASE_URL=votre_url_postgres

# Variables d'email (Resend)
RESEND_API_KEY=votre_cle_resend
APP_URL=https://votre-app.vercel.app
```

### Script de déploiement

Utilisez le script de déploiement existant:

```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

Ou déployez manuellement:

```bash
vercel --prod
```

## 📊 Tests de l'Intégration

### 1. Vérifier l'état du service

```bash
curl https://votre-app.vercel.app/trpc/booking.healthCheck
```

Réponse attendue:
```json
{
  "success": true,
  "oauth2Available": true,
  "icalAvailable": true,
  "timestamp": "2025-12-07T13:53:15.246Z"
}
```

### 2. Récupérer les disponibilités

```bash
curl -X POST https://votre-app.vercel.app/trpc/booking.getAvailabilities \
  -H "Content-Type: application/json" \
  -d '{"startDate": "2025-12-08", "endDate": "2025-12-15"}'
```

### 3. Réserver un rendez-vous

```bash
curl -X POST https://votre-app.vercel.app/trpc/booking.bookAppointment \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-08",
    "time": "14:00",
    "patientInfo": {
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@example.com",
      "phone": "+33612345678",
      "reason": "Consultation"
    }
  }'
```

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais commiter** le fichier `.env` dans Git
2. **Utiliser des variables d'environnement** pour tous les secrets
3. **Activer l'authentification** sur les endpoints sensibles
4. **Limiter les permissions** du Service Account aux scopes nécessaires
5. **Monitorer les accès** via Google Cloud Console

### Permissions du Service Account

Le Service Account a les permissions suivantes:

- `https://www.googleapis.com/auth/calendar.readonly` (lecture)
- `https://www.googleapis.com/auth/calendar.events` (création d'événements)

## 📝 Logs et Debugging

### Activer les logs détaillés

Les logs sont automatiquement activés en développement. En production, surveillez:

```bash
# Vérifier les logs Vercel
vercel logs

# Vérifier l'initialisation
grep "Google Calendar" vercel.log
```

### Messages de log importants

- ✅ `Service Account JWT autorisé` - Authentification réussie
- ✅ `Google Calendar Service Account JWT initialisé avec succès` - Service prêt
- ⚠️ `Google Calendar non configuré, utilisation des créneaux par défaut` - Fallback activé
- ❌ `Erreur lors de l'autorisation JWT` - Problème d'authentification

## 🔄 Mise à Jour des Credentials

Si vous devez changer les credentials:

1. Créer un nouveau Service Account dans Google Cloud Console
2. Télécharger le nouveau fichier JSON
3. Mettre à jour les variables d'environnement:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
4. Partager le calendrier avec le nouvel email du Service Account
5. Redéployer l'application

## 📞 Support

En cas de problème:

1. Vérifier que le Service Account a accès au calendrier
2. Vérifier que les APIs sont activées dans Google Cloud
3. Vérifier les logs de l'application
4. Consulter la documentation: [GOOGLE_CALENDAR_SERVICE_ACCOUNT_SETUP.md](./GOOGLE_CALENDAR_SERVICE_ACCOUNT_SETUP.md)

## ✨ Résumé

L'intégration est maintenant complète et fonctionnelle:

- ✅ Service Account configuré
- ✅ Variables d'environnement ajoutées
- ✅ Service Google Calendar initialisé
- ✅ Système de fallback en place
- ✅ Application testée et fonctionnelle

**URL de l'application locale**: https://5000-ir9dki22bqy92wce2wrt6-d0b9e1e2.sandbox.novita.ai
