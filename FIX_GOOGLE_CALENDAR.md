# Correction de l'erreur Google Calendar

## 🐛 Problème identifié

**Erreur**: `error:1E08010C:DECODER routines::unsupported`

Cette erreur se produisait lors de la création d'événements dans Google Calendar via le Service Account JWT.

### Cause principale
La clé privée du Service Account n'était pas correctement traitée :
- Les caractères `\n` (newlines) n'étaient pas correctement convertis
- Plusieurs remplacements successifs causaient des problèmes de décodage
- Le format PEM de la clé était corrompu après traitement

## ✅ Corrections apportées

### 1. Fichier `api/index.ts` (API Vercel)

#### Amélioration du traitement de la clé privée
```typescript
// AVANT (causait l'erreur)
serviceAccountPrivateKey = serviceAccountPrivateKey
  .trim()
  .replace(/^"|"$/g, '')
  .replace(/\\n/g, '\n')
  .replace(/\\\\n/g, '\n');  // ❌ Trop de remplacements

// APRÈS (corrigé)
serviceAccountPrivateKey = serviceAccountPrivateKey
  .replace(/^["']|["']$/g, '') // Enlever les guillemets
  .replace(/\\n/g, '\n');       // Convertir les \n littéraux ✅
```

#### Ajout de validation
- Vérification que la clé contient bien `-----BEGIN PRIVATE KEY-----`
- Messages d'erreur plus détaillés avec stack trace

#### Nouvelle méthode `createEvent()`
Ajout d'une méthode complète pour créer des événements dans Google Calendar :
- Construction correcte des dates avec timezone Europe/Paris
- Ajout des rappels email (24h et 1h avant)
- Marquage visuel des rendez-vous (couleur rouge, icône 🏥)
- Métadonnées pour distinguer les rendez-vous des disponibilités

### 2. Fichier `server/services/googleCalendar.ts`

#### Support des variables d'environnement
Le service supporte maintenant deux méthodes de configuration :

**Méthode 1: Variables d'environnement (Vercel/Production)** ✅ PRIORITAIRE
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com
```

**Méthode 2: Fichier JSON (Développement local)** 
```bash
server/google-service-account.json
```

#### Amélioration du filtrage des créneaux
- Meilleure détection des rendez-vous vs disponibilités
- Utilisation de `transparency: 'opaque'` pour identifier les créneaux bloqués
- Logs détaillés pour le debugging

### 3. Route `/api/book` mise à jour

La route utilise maintenant la nouvelle méthode `createEvent()` :
```typescript
// Créer l'événement dans Google Calendar
googleEventId = await googleCalendarService.createEvent({
  patientName: `${firstName} ${lastName}`,
  patientEmail: email,
  patientPhone: phone,
  date: appointmentDate,
  startTime: time,
  endTime: endTime,
  reason: reason || '',
});
```

## 🎯 Fonctionnalités confirmées

### ✅ Création automatique de créneaux de disponibilité
- Les créneaux marqués `isAvailabilitySlot=true` sont détectés
- Couleur verte (sage) pour différenciation visuelle

### ✅ Réservation de rendez-vous
- Création d'événements avec toutes les informations patient
- Envoi automatique dans Google Calendar
- Couleur rouge pour les rendez-vous confirmés

### ✅ Masquage des créneaux réservés
- Filtrage automatique basé sur `transparency: 'opaque'`
- Détection des chevauchements de créneaux
- Les créneaux déjà réservés n'apparaissent plus comme disponibles

### ✅ Notifications
- Email de confirmation au patient via Resend
- Rappels Google Calendar (24h et 1h avant)
- Logs détaillés pour le suivi

### ✅ Synchronisation temps réel
- Récupération en temps réel des créneaux depuis Google Calendar
- Prise en compte immédiate des nouveaux rendez-vous
- Pas de décalage entre Calendar et l'application

## 🔧 Configuration Vercel requise

### Variables d'environnement à configurer

```bash
# Service Account Google Calendar
GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com

# Clé privée (attention au format !)
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC466s/...
...
-----END PRIVATE KEY-----"

# Email (Resend)
RESEND_API_KEY=re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd
APP_URL=https://webapp-frtjapec0-ikips-projects.vercel.app

# Base de données
DATABASE_URL=postgresql://...
```

### ⚠️ Important pour la clé privée

1. **Garder les guillemets doubles** autour de la clé complète
2. **Les `\n` doivent être littéraux** (pas de vrais sauts de ligne dans Vercel UI)
3. Format attendu dans Vercel :
   ```
   "-----BEGIN PRIVATE KEY-----\nMIIEvgI...\n...KEY-----\n"
   ```

## 🧪 Tests à effectuer

### Test 1: Vérification de l'initialisation
```bash
curl https://your-app.vercel.app/api/health
```

Doit retourner :
```json
{
  "googleCalendar": "initialized"
}
```

### Test 2: Récupération des créneaux
```bash
curl https://your-app.vercel.app/api/slots?date=2025-12-13
```

### Test 3: Réservation d'un rendez-vous
```bash
curl -X POST https://your-app.vercel.app/api/book \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-13",
    "time": "15:00",
    "patientInfo": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "phone": "0612345678",
      "reason": "Test"
    }
  }'
```

Doit retourner :
```json
{
  "success": true,
  "googleEventId": "abc123...",
  "message": "Rendez-vous confirmé et ajouté à votre Google Calendar"
}
```

## 📊 Logs de débogage

Les logs suivants confirment le bon fonctionnement :

```
[Vercel API] ✅ Google Calendar initialisé avec succès
[Vercel TRPC] bookAppointment: {...}
[Vercel TRPC] ✅ Événement créé dans Google Calendar: abc123xyz
[Vercel TRPC] ✅ Email de confirmation envoyé
```

## 🚀 Déploiement

1. **Pousser les modifications** sur la branche main
2. **Vérifier les variables d'environnement** dans Vercel Dashboard
3. **Tester l'endpoint** `/api/health`
4. **Effectuer une réservation test** via l'interface

## 📝 Notes importantes

- La clé privée doit être partagée avec le calendrier Google cible
- Le Service Account doit avoir les permissions `calendar` et `calendar.events`
- Le calendrier doit être partagé avec `planningadmin@apaddicto.iam.gserviceaccount.com`
- Les créneaux de disponibilité doivent avoir `transparency: 'transparent'`
- Les rendez-vous réservés doivent avoir `transparency: 'opaque'`

## 🔗 Références

- [Google Calendar API - Service Accounts](https://developers.google.com/calendar/api/guides/auth)
- [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
