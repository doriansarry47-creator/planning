# 🔧 Fix : Synchronisation des rendez-vous avec Google Calendar

## 📋 Problème identifié

Les rendez-vous enregistrés dans la base de données ne sont pas tous synchronisés avec Google Calendar. Cela se produit dans les cas suivants :

1. **Rendez-vous créés avant la configuration de Google Calendar** : Ces rendez-vous ont un `googleEventId` commençant par `local_` au lieu d'un vrai ID Google Calendar
2. **Rendez-vous créés manuellement dans la BD** : Directement via des scripts ou l'interface admin sans passer par le flux de réservation standard
3. **Échecs de synchronisation temporaires** : Erreurs réseau ou problèmes de configuration qui n'ont pas créé l'événement dans Google Calendar

## ✅ Solution implémentée

### 1. Script de synchronisation manuelle

Un nouveau script a été créé pour synchroniser tous les rendez-vous non synchronisés :

```bash
npm run sync:appointments
```

**Ce script :**
- ✅ Récupère tous les rendez-vous sans `googleEventId` ou avec un ID local (`local_*`)
- ✅ Crée les événements correspondants dans Google Calendar
- ✅ Met à jour la base de données avec les vrais `googleEventId`
- ✅ Affiche un rapport détaillé de la synchronisation

### 2. Utilitaire de synchronisation réutilisable

Un module utilitaire a été créé dans `server/lib/syncAppointmentToCalendar.ts` :

```typescript
import { syncAppointmentToCalendar } from './lib/syncAppointmentToCalendar';

// Synchroniser un rendez-vous
const result = await syncAppointmentToCalendar(appointment);
if (result.success) {
  console.log('Synchronisé avec succès:', result.eventId);
}
```

**Fonctionnalités :**
- Détecte automatiquement si un rendez-vous est déjà synchronisé
- Gère les erreurs de manière robuste
- Peut être utilisé dans n'importe quelle partie de l'application

## 🚀 Utilisation

### Synchroniser tous les rendez-vous non synchronisés

```bash
npm run sync:appointments
```

**Exemple de sortie :**
```
🔄 Synchronisation des rendez-vous vers Google Calendar...

✅ Connexion à la base de données établie
✅ Service Google Calendar connecté

📊 15 rendez-vous non synchronisés trouvés

📅 Synchronisation du rendez-vous #1
   Patient: Jean Dupont
   Date: 2024-12-15T09:00:00.000Z
   ✅ Synchronisé avec succès (Event ID: abc123xyz)

📅 Synchronisation du rendez-vous #2
   Patient: Marie Martin
   Date: 2024-12-15T10:00:00.000Z
   ✅ Synchronisé avec succès (Event ID: def456uvw)

...

============================================================
📊 RÉSUMÉ DE LA SYNCHRONISATION
============================================================
Total rendez-vous traités : 15
✅ Synchronisés avec succès : 15
❌ Échecs : 0
============================================================

✅ Synchronisation terminée avec succès !
💡 Conseil : Vérifiez votre Google Calendar pour voir les nouveaux événements
```

### Intégrer la synchronisation dans le code

Pour garantir que tous les nouveaux rendez-vous sont synchronisés, utilisez l'utilitaire :

```typescript
import { syncAppointmentToCalendar, updateAppointmentEventId } from './lib/syncAppointmentToCalendar';

// Après avoir créé un rendez-vous
const appointment = await db.insert(appointments).values({...}).returning();

// Synchroniser avec Google Calendar
const syncResult = await syncAppointmentToCalendar(appointment[0]);
if (syncResult.success && syncResult.eventId) {
  await updateAppointmentEventId(appointment[0].id, syncResult.eventId);
}
```

## 🔍 Vérification

### 1. Vérifier les rendez-vous non synchronisés dans la BD

```sql
SELECT id, customerName, startTime, googleEventId 
FROM appointments 
WHERE googleEventId IS NULL 
   OR googleEventId LIKE 'local_%';
```

### 2. Vérifier dans Google Calendar

1. Ouvrez [Google Calendar](https://calendar.google.com/)
2. Cherchez les événements avec le préfixe `🏥 RDV - `
3. Vérifiez que tous vos rendez-vous y figurent

### 3. Vérifier dans l'application

1. Accédez à l'interface admin
2. Consultez la liste des rendez-vous
3. Tous les rendez-vous avec un statut "confirmed" devraient avoir un `googleEventId` valide (non vide et ne commençant pas par `local_`)

## 🛡️ Prévention

Pour éviter ce problème à l'avenir :

1. **Toujours utiliser le flux de réservation standard** : L'endpoint `bookAppointment` gère automatiquement la synchronisation
2. **Tester la configuration Google Calendar** : Avant de créer des rendez-vous, vérifier que le service est opérationnel
3. **Exécuter le script de synchronisation régulièrement** : En cas de doute, lancer `npm run sync:appointments`
4. **Surveiller les logs** : Les erreurs de synchronisation sont journalisées avec le préfixe `[BookingRouter]` ou `[SyncAppointment]`

## 📝 Logs importants

Lors de la création d'un rendez-vous, vous devriez voir :

```
[BookingRouter] Tentative de réservation avec service Google Calendar...
[GoogleCalendar] Événement créé: abc123xyz
[BookingRouter] ✅ Rendez-vous créé dans Google Calendar: abc123xyz
[BookingRouter] ✅ Rendez-vous CONFIRMÉ en BD: 2024-12-15T09:00:00.000Z - patient@email.com
```

Si vous voyez :
```
[BookingRouter] Aucun service Google Calendar disponible, création d'un ID local
[BookingRouter] ✅ Rendez-vous créé localement avec ID: local_1734123456_abc123
```

Cela signifie que Google Calendar n'est pas configuré. Vérifiez :
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_CALENDAR_ID`

## 🆘 Dépannage

### Problème : "Service Google Calendar non disponible"

**Cause :** Variables d'environnement manquantes ou incorrectes

**Solution :**
1. Vérifiez votre fichier `.env`
2. Assurez-vous que toutes les variables sont définies :
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=votre-service-account@projet.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CALENDAR_ID=doriansarry47@gmail.com
   ```
3. Redémarrez le serveur

### Problème : "Base de données non disponible"

**Cause :** Variable `DATABASE_URL` non configurée

**Solution :**
1. Vérifiez que `DATABASE_URL` est dans votre `.env`
2. Format : `postgresql://user:password@host:port/database`

### Problème : Certains rendez-vous ne se synchronisent pas

**Cause :** Données invalides ou dates passées

**Solution :**
1. Vérifiez que les dates sont valides
2. Vérifiez que l'email du patient est valide
3. Consultez les logs pour plus de détails

## 📚 Fichiers modifiés/créés

- ✅ `scripts/sync-appointments-to-calendar.ts` - Script de synchronisation
- ✅ `server/lib/syncAppointmentToCalendar.ts` - Utilitaire réutilisable
- ✅ `package.json` - Ajout de la commande `sync:appointments`
- ✅ `SYNC_APPOINTMENTS_FIX.md` - Cette documentation

## 🎯 Résultat attendu

Après avoir exécuté le script de synchronisation :
- ✅ Tous les rendez-vous ont un `googleEventId` valide (non null, ne commence pas par `local_`)
- ✅ Tous les rendez-vous apparaissent dans Google Calendar
- ✅ Les créneaux réservés ne sont plus visibles comme "disponibles" dans l'interface de réservation
- ✅ Les notifications et rappels Google Calendar fonctionnent pour tous les rendez-vous

---

**Date de création** : 2024-12-13  
**Version** : 1.0.0  
**Auteur** : Assistant IA
