# Synchronisation Google Calendar 📅

Ce document explique comment configurer et utiliser la synchronisation des disponibilités avec Google Calendar.

## 🎯 Fonctionnalités

- ✅ **Synchronisation bidirectionnelle** avec Google Calendar
- ✅ **Masquage automatique** des créneaux pris
- ✅ **Affichage uniquement des créneaux disponibles** aux utilisateurs
- ✅ **Création automatique** de rendez-vous dans Google Calendar
- ✅ **Notifications par email** automatiques
- ✅ **Gestion des conflits** en temps réel

## 📋 Prérequis

1. Un compte Google avec Google Calendar activé
2. Un projet dans Google Cloud Console
3. L'API Google Calendar activée
4. Un Service Account créé avec les credentials JSON

## 🔧 Configuration

### 1. Créer un Service Account

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google Calendar :
   - Menu → APIs & Services → Library
   - Recherchez "Google Calendar API"
   - Cliquez sur "Enable"

4. Créez un Service Account :
   - Menu → APIs & Services → Credentials
   - Cliquez sur "Create Credentials" → "Service Account"
   - Donnez un nom (ex: "Planning Admin")
   - Cliquez sur "Create and Continue"
   - Accordez le rôle "Editor" ou "Owner"
   - Cliquez sur "Done"

5. Téléchargez les credentials :
   - Cliquez sur le Service Account créé
   - Onglet "Keys"
   - "Add Key" → "Create new key"
   - Format: JSON
   - Téléchargez le fichier

### 2. Configurer les variables d'environnement

Dans votre fichier `.env`, ajoutez ou modifiez :

```env
# Service Account Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=votre-service-account@votre-projet.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=votre-email@gmail.com
```

**Note importante :** 
- Utilisez des guillemets doubles pour `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- Conservez les `\n` pour les retours à la ligne dans la clé privée

### 3. Partager votre calendrier avec le Service Account

1. Ouvrez [Google Calendar](https://calendar.google.com/)
2. Cliquez sur les 3 points à côté de votre calendrier
3. Sélectionnez "Paramètres et partage"
4. Dans "Partager avec des personnes spécifiques" :
   - Cliquez sur "Ajouter des personnes"
   - Entrez l'email du service account
   - Accordez les droits "Apporter des modifications aux événements"
   - Cliquez sur "Envoyer"

## 🚀 Utilisation

### Synchroniser les disponibilités

Pour créer des créneaux de disponibilité dans Google Calendar :

```bash
npm run sync:availability
```

Ce script va :
1. Se connecter à votre Google Calendar
2. Créer des créneaux de disponibilité selon la configuration
3. Afficher un résumé de la synchronisation

**Configuration par défaut :**
- **Période :** 3 mois à partir d'aujourd'hui
- **Horaires :** 9h00 - 18h00
- **Jours :** Du lundi au vendredi
- **Durée par créneau :** 60 minutes

Pour modifier ces paramètres, éditez le fichier `scripts/sync-availability.ts`.

### Exemple de configuration personnalisée

Dans `scripts/sync-availability.ts`, modifiez :

```typescript
const config = {
  startDate: new Date(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 mois
  workingHours: {
    start: '08:00',  // Début à 8h
    end: '20:00',    // Fin à 20h
  },
  daysOfWeek: [1, 2, 3, 4, 5, 6], // Lundi au samedi
  slotDuration: 30, // 30 minutes par créneau
};
```

## 📱 Fonctionnement

### Comment les créneaux sont gérés

1. **Création de disponibilités :**
   - Les créneaux sont créés dans Google Calendar avec l'indicateur `🟢 DISPONIBLE`
   - Ils sont marqués comme `transparent` (n'affectent pas votre disponibilité)
   - Couleur verte pour faciliter l'identification

2. **Réservation d'un créneau :**
   - Quand un utilisateur réserve, un rendez-vous est créé dans Google Calendar
   - L'événement est marqué comme `opaque` (bloque le calendrier)
   - Format : `🏥 RDV - Nom du patient`
   - Couleur bleue pour les rendez-vous

3. **Masquage automatique :**
   - L'application vérifie automatiquement les conflits
   - Les créneaux pris ne sont **PAS** affichés dans la liste des disponibilités
   - Seuls les créneaux libres sont visibles par les utilisateurs

### API utilisée

L'application utilise l'API Google Calendar v3 :
- `events.list` : Récupérer les événements
- `events.insert` : Créer des événements
- `events.update` : Modifier des événements
- `freebusy.query` : Vérifier la disponibilité

## 🔍 Vérification

### Tester la connexion

Pour vérifier que la configuration fonctionne :

1. Démarrez le serveur :
   ```bash
   npm run dev
   ```

2. Vérifiez les logs :
   ```
   [AvailabilitySync] Service de synchronisation initialisé
   ✅ Service Google Calendar connecté
   ```

3. Testez la récupération des créneaux :
   - Allez sur la page de réservation
   - Sélectionnez une date
   - Les créneaux disponibles doivent s'afficher (sans les créneaux pris)

### Logs importants

```
[AvailabilitySync] X créneaux de disponibilité
[AvailabilitySync] Y rendez-vous réservés
[AvailabilitySync] Z créneaux disponibles (créneaux pris masqués)
```

## ⚠️ Dépannage

### Problème : "Service Google Calendar non configuré"

**Cause :** Variables d'environnement manquantes ou incorrectes

**Solution :**
1. Vérifiez que toutes les variables sont définies dans `.env`
2. Vérifiez que la clé privée contient bien les `\n`
3. Redémarrez le serveur après modification

### Problème : "401 Unauthorized"

**Cause :** Le Service Account n'a pas accès au calendrier

**Solution :**
1. Vérifiez que le calendrier est partagé avec le service account
2. Vérifiez les droits accordés (minimum : "Apporter des modifications")
3. Attendez quelques minutes après le partage

### Problème : "403 Forbidden"

**Cause :** L'API Google Calendar n'est pas activée

**Solution :**
1. Allez sur Google Cloud Console
2. APIs & Services → Library
3. Recherchez "Google Calendar API"
4. Cliquez sur "Enable"

### Problème : Les créneaux pris s'affichent toujours

**Cause :** L'ancien service est utilisé au lieu du nouveau

**Solution :**
1. Vérifiez que `availabilitySync.ts` est bien importé
2. Redémarrez le serveur
3. Videz le cache du navigateur

## 🎨 Codes couleur dans Google Calendar

- 🟢 **Vert (10)** : Créneaux de disponibilité
- 🔵 **Bleu (2)** : Rendez-vous réservés
- 🟡 **Jaune (5)** : Créneaux en cours de réservation (verrouillés temporairement)

## 📊 Statistiques

Après synchronisation, vous verrez :
- Nombre total de créneaux créés
- Nombre de créneaux disponibles
- Nombre de créneaux déjà pris
- Durée de la synchronisation

## 🔐 Sécurité

- Les credentials du service account sont stockés uniquement sur le serveur
- Les clés privées ne sont jamais exposées au client
- Les emails des patients sont chiffrés dans les propriétés étendues
- Les données sensibles sont marquées comme privées dans Google Calendar

## 📚 Ressources

- [Documentation Google Calendar API](https://developers.google.com/calendar)
- [Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Authentification Google](https://developers.google.com/identity/protocols/oauth2/service-account)

## 💡 Conseils

1. **Synchronisez régulièrement** : Lancez `npm run sync:availability` chaque mois
2. **Vérifiez votre calendrier** : Consultez Google Calendar pour voir les créneaux créés
3. **Nettoyez les anciens créneaux** : Supprimez les créneaux passés pour garder le calendrier propre
4. **Testez sur une période courte** : Commencez avec 1-2 semaines pour valider la configuration

## 🆘 Support

En cas de problème :
1. Vérifiez les logs du serveur
2. Consultez la section Dépannage ci-dessus
3. Vérifiez la configuration dans Google Cloud Console
4. Testez la connexion avec un simple appel API
