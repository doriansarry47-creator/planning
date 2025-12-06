# 🔧 Correction - Impossible de charger les disponibilités

## ✅ Modifications effectuées

Les méthodes manquantes ont été ajoutées au service Google Calendar pour gérer les disponibilités :

### 1. **Nouvelles fonctionnalités ajoutées**

#### Interface `AvailabilitySlotData`
- Structure de données pour les créneaux de disponibilité
- Support de la récurrence (DAILY, WEEKLY, MONTHLY)
- Support des paramètres optionnels (titre, description)

#### Méthodes implémentées

1. **`createAvailabilitySlot(slotData)`**
   - Créer un créneau de disponibilité dans Google Calendar
   - Support de la récurrence avec règles RRULE
   - Marquage automatique avec `isAvailabilitySlot: true`
   - Couleur spécifique (vert sage)
   - Transparence pour ne pas bloquer le calendrier

2. **`updateAvailabilitySlot(eventId, slotData)`**
   - Mettre à jour un créneau existant
   - Conservation du marquage de disponibilité

3. **`deleteAvailabilitySlot(eventId)`**
   - Supprimer un créneau de disponibilité

4. **`getAvailabilitySlots(startDate, endDate, slotDuration)`**
   - Récupérer tous les créneaux disponibles dans une période
   - Découpage automatique en slots de durée configurable (défaut: 30 min)
   - Vérification automatique si chaque slot est libre
   - Exclusion des créneaux déjà réservés (rendez-vous)
   - Retour des slots groupés par date

5. **`buildRecurrenceRule(recurrence)`**
   - Construction des règles RRULE pour la récurrence
   - Support de `FREQ`, `UNTIL`, `COUNT`, `BYDAY`

### 2. **Corrections apportées**

- ✅ Ajout de l'import `TRPCError` manquant dans `availabilitySlotsRouter.ts`
- ✅ Toutes les méthodes appelées par `availabilityRouter.ts` sont maintenant implémentées
- ✅ Support complet de la gestion des créneaux de disponibilité

## ⚠️ Configuration requise

### Variable d'environnement manquante CRITIQUE

Le service Google Calendar nécessite **OBLIGATOIREMENT** la clé privée du Service Account :

```env
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----"
```

### 📋 Comment obtenir la clé privée ?

1. **Accédez à Google Cloud Console**
   - https://console.cloud.google.com/

2. **Sélectionnez votre projet** : `apaddicto`

3. **Accédez aux Service Accounts**
   - Menu : IAM & Admin > Service Accounts
   - Cherchez : `planningadmin@apaddicto.iam.gserviceaccount.com`

4. **Créer une nouvelle clé**
   - Cliquez sur le service account
   - Onglet "Keys" (Clés)
   - "Add Key" > "Create new key"
   - Choisissez le format **JSON**
   - Téléchargez le fichier

5. **Extraire la clé privée**
   
   Le fichier JSON téléchargé contient un champ `private_key` :
   
   ```json
   {
     "type": "service_account",
     "project_id": "apaddicto",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "planningadmin@apaddicto.iam.gserviceaccount.com",
     ...
   }
   ```

6. **Configurer la variable d'environnement**

   **Pour le développement local (.env)** :
   ```env
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_COMPLETE_ICI\n-----END PRIVATE KEY-----"
   ```

   **Pour Vercel (Production)** :
   ```bash
   # Via CLI
   vercel env add GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY production
   # Puis coller la clé privée complète
   
   # OU via Dashboard
   # 1. Accédez à : https://vercel.com/[votre-compte]/[votre-projet]/settings/environment-variables
   # 2. Cliquez sur "Add New"
   # 3. Name: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
   # 4. Value: Collez la clé privée complète
   # 5. Environment: Production
   ```

### 🔐 Sécurité importante

- ⚠️ **NE JAMAIS** committer le fichier `.env` dans git
- ⚠️ **NE JAMAIS** partager la clé privée publiquement
- ✅ Le fichier `.env` est déjà dans `.gitignore`
- ✅ Utilisez Vercel Environment Variables pour la production

## 🚀 Déploiement sur Vercel

### 1. Configurer les variables d'environnement

Accédez au dashboard Vercel et ajoutez **TOUTES** ces variables :

```env
DATABASE_URL=postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=[VOTRE_CLE_PRIVEE_JSON]
GOOGLE_CALENDAR_ID=primary
GOOGLE_CLIENT_ID=603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
RESEND_API_KEY=re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd
APP_URL=https://webapp-frtjapec0-ikips-projects.vercel.app
VITE_GOOGLE_CLIENT_ID=603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AQ.Ab8RN6LlJ2_vSoax5RXbetblQX_QeoEDSQexk9_nFMB-OwS-Og
```

### 2. Redéployer l'application

```bash
# Via Git (automatique)
git push origin main

# OU via CLI
vercel --prod
```

### 3. Vérifier le déploiement

Une fois déployé, testez l'API des disponibilités :

```
GET https://webapp-frtjapec0-ikips-projects.vercel.app/api/trpc/availability.getAvailableSlots?input={"startDate":"2025-12-06T00:00:00Z","endDate":"2025-12-13T00:00:00Z"}
```

## 🧪 Tests en local

### 1. Démarrer le serveur

```bash
npm run dev
```

### 2. Tester les disponibilités

```bash
# Ouvrez : http://localhost:5173
# Accédez à la page de réservation
# Les créneaux disponibles devraient s'afficher
```

### 3. Vérifier les logs

Les logs du service afficheront :
- `[GoogleCalendar] Créneau de disponibilité créé: [eventId]`
- `[GoogleCalendar] Configuration incomplète` si la clé manque

## 📊 Structure des données

### Créneau de disponibilité dans Google Calendar

```json
{
  "summary": "Disponibilité",
  "description": "Créneau de disponibilité pour prise de rendez-vous",
  "start": {
    "dateTime": "2025-12-06T09:00:00Z",
    "timeZone": "Europe/Paris"
  },
  "end": {
    "dateTime": "2025-12-06T10:00:00Z",
    "timeZone": "Europe/Paris"
  },
  "transparency": "transparent",
  "colorId": "2",
  "extendedProperties": {
    "private": {
      "isAvailabilitySlot": "true"
    }
  }
}
```

### Réponse de l'API `getAvailableSlots`

```json
{
  "success": true,
  "slots": {
    "2025-12-06": [
      {
        "startTime": "09:00",
        "endTime": "09:30",
        "isAvailable": true
      },
      {
        "startTime": "09:30",
        "endTime": "10:00",
        "isAvailable": false
      }
    ]
  },
  "totalSlots": 20,
  "availableSlots": 15,
  "period": {
    "start": "2025-12-06T00:00:00Z",
    "end": "2025-12-13T00:00:00Z"
  }
}
```

## 🔗 Liens utiles

- **Dashboard Vercel** : https://vercel.com/dashboard
- **Google Cloud Console** : https://console.cloud.google.com/
- **Service Account** : https://console.cloud.google.com/iam-admin/serviceaccounts?project=apaddicto
- **API Google Calendar** : https://console.cloud.google.com/apis/library/calendar-json.googleapis.com

## ✅ Commit effectué

```
fix: Ajouter les méthodes de gestion des disponibilités au service Google Calendar

- Ajout de l'interface AvailabilitySlotData pour la gestion des créneaux
- Implémentation de createAvailabilitySlot() pour créer des créneaux
- Implémentation de updateAvailabilitySlot() pour mettre à jour des créneaux
- Implémentation de deleteAvailabilitySlot() pour supprimer des créneaux
- Implémentation de getAvailabilitySlots() pour récupérer les créneaux disponibles
- Ajout de buildRecurrenceRule() pour gérer la récurrence (DAILY, WEEKLY, MONTHLY)
- Support des créneaux récurrents avec RRULE
- Ajout de l'import TRPCError manquant dans availabilitySlotsRouter.ts
- Les créneaux sont marqués avec extendedProperties.isAvailabilitySlot
- Gestion de la découpe des créneaux en slots de durée configurable
- Vérification automatique de la disponibilité en excluant les rendez-vous existants
```

**Commit hash** : `3aff8aa`

Les modifications ont été poussées vers la branche `main` du dépôt GitHub.

## 📝 Prochaines étapes

1. ✅ **URGENT** : Configurer `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` dans Vercel
2. ✅ Créer des créneaux de disponibilité via l'interface admin
3. ✅ Tester la réservation côté patient
4. ✅ Vérifier les synchronisations dans Google Calendar
5. ✅ Configurer les notifications email (Resend déjà configuré)

---

**Status** : ✅ Code corrigé et poussé  
**Bloquant** : ⚠️ Variable GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY manquante
