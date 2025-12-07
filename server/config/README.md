# Configuration Google Calendar Service Account

Ce dossier contient les fichiers de configuration pour l'authentification avec Google Calendar via un Service Account.

## Fichier requis

### `google-service-account.json`

Ce fichier contient les credentials du Service Account Google pour accéder à Google Calendar API.

**⚠️ IMPORTANT : Ce fichier est ignoré par git pour des raisons de sécurité.**

### Structure du fichier

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "...",
  "universe_domain": "googleapis.com"
}
```

## Configuration

1. **Créer un Service Account dans Google Cloud Console :**
   - Aller sur https://console.cloud.google.com/
   - Créer un nouveau projet ou sélectionner un projet existant
   - Activer l'API Google Calendar
   - Créer un Service Account avec les permissions nécessaires
   - Télécharger le fichier JSON des credentials

2. **Partager le calendrier avec le Service Account :**
   - Ouvrir Google Calendar
   - Partager le calendrier avec l'email du Service Account (ex: `planningadmin@apaddicto.iam.gserviceaccount.com`)
   - Donner les permissions "Apporter des modifications aux événements" (Make changes to events)

3. **Placer le fichier dans ce dossier :**
   ```bash
   cp /path/to/downloaded-credentials.json ./google-service-account.json
   ```

4. **Variables d'environnement (alternative) :**
   
   Au lieu d'utiliser le fichier JSON, vous pouvez aussi configurer ces variables d'environnement :
   
   ```bash
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CALENDAR_ID=your-calendar-id@gmail.com
   ```

## Fonctionnalités

Une fois configuré, le système :

- ✅ **Filtre les créneaux disponibles** : Affiche uniquement les créneaux marqués "DISPONIBLE" dans Google Calendar ET non réservés en base de données
- ✅ **Bloque automatiquement les créneaux** : Lorsqu'un rendez-vous est pris, le créneau "DISPONIBLE" est modifié en "🔴 RÉSERVÉ" dans Google Calendar
- ✅ **Synchronisation temps réel** : Les créneaux pris sont immédiatement bloqués et ne sont plus visibles pour les autres patients
- ✅ **Notification automatique** : Les patients reçoivent un email de confirmation via Google Calendar

## Sécurité

- ⚠️ **Ne jamais committer le fichier `google-service-account.json`**
- ⚠️ **Ne jamais partager les credentials en clair**
- ✅ Le fichier est automatiquement ignoré par git (voir `.gitignore`)
- ✅ Utiliser les variables d'environnement en production (Vercel, Railway, etc.)

## Troubleshooting

### Erreur : "Credentials Service Account manquants"
- Vérifier que le fichier `google-service-account.json` existe dans ce dossier
- OU que les variables d'environnement sont correctement définies

### Erreur : "Erreur lors de l'autorisation JWT"
- Vérifier que la clé privée est correctement formatée (doit commencer par `-----BEGIN PRIVATE KEY-----`)
- Vérifier que le Service Account a les permissions nécessaires

### Les créneaux ne s'affichent pas
- Vérifier que le calendrier est bien partagé avec l'email du Service Account
- Vérifier que les événements sont marqués "DISPONIBLE" dans le titre
- Vérifier l'ID du calendrier dans la variable `GOOGLE_CALENDAR_ID`

## Support

Pour plus d'informations, consulter :
- [Documentation Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [Service Accounts Documentation](https://cloud.google.com/iam/docs/service-accounts)
