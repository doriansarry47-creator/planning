# 📅 Intégration Google Calendar - Guide Complet

## 🎯 Vue d'ensemble

Ce système permet de :
- **Gérer vos disponibilités** via Google Calendar (interface admin)
- **Afficher les créneaux disponibles** aux patients
- **Synchroniser automatiquement** les rendez-vous pris par les patients dans votre Google Calendar
- **Envoyer des notifications** automatiques par email

## 🔧 Configuration avec Service Account

### Étape 1: Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez le nom du projet

### Étape 2: Activer l'API Google Calendar

1. Dans le menu, allez dans **API et services** > **Bibliothèque**
2. Recherchez "Google Calendar API"
3. Cliquez sur **Activer**

### Étape 3: Créer un Service Account

1. Allez dans **API et services** > **Identifiants**
2. Cliquez sur **Créer des identifiants** > **Compte de service**
3. Remplissez les informations :
   - **Nom** : Planning Admin
   - **Description** : Service account pour la gestion des rendez-vous
4. Cliquez sur **Créer et continuer**
5. Accordez le rôle **Propriétaire** (ou minimum **Éditeur**)
6. Cliquez sur **Continuer** puis **OK**

### Étape 4: Télécharger les credentials

1. Dans la liste des comptes de service, cliquez sur celui que vous venez de créer
2. Allez dans l'onglet **Clés**
3. Cliquez sur **Ajouter une clé** > **Créer une clé**
4. Choisissez le format **JSON**
5. Le fichier sera téléchargé automatiquement
6. **CONSERVEZ CE FICHIER EN SÉCURITÉ** ⚠️

### Étape 5: Extraire les informations du fichier JSON

Ouvrez le fichier JSON téléchargé. Vous verrez quelque chose comme :

```json
{
  "type": "service_account",
  "project_id": "votre-projet",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "planning-admin@votre-projet.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

Vous aurez besoin de :
- **`client_email`** : L'email du service account
- **`private_key`** : La clé privée (avec les `\n` pour les retours à la ligne)

### Étape 6: Partager votre Google Calendar

C'est l'étape **CRUCIALE** ! 🔑

1. Ouvrez [Google Calendar](https://calendar.google.com)
2. Trouvez le calendrier que vous voulez utiliser (généralement votre calendrier principal)
3. Cliquez sur les **trois points** à côté du nom du calendrier
4. Sélectionnez **Paramètres et partage**
5. Dans la section **Partager avec des personnes en particulier**, cliquez sur **Ajouter des utilisateurs et des groupes**
6. **Collez l'email du service account** (celui du fichier JSON, par exemple `planning-admin@votre-projet.iam.gserviceaccount.com`)
7. Accordez les permissions **Apporter des modifications aux événements**
8. Cliquez sur **Envoyer**

### Étape 7: Récupérer l'ID du calendrier (optionnel)

Si vous voulez utiliser un calendrier spécifique plutôt que le principal :

1. Dans les paramètres du calendrier, descendez jusqu'à **Intégrer le calendrier**
2. Copiez l'**ID du calendrier** (format: `votre.email@gmail.com` ou `xxxxx@group.calendar.google.com`)
3. Utilisez-le dans la variable `GOOGLE_CALENDAR_ID`

Pour utiliser le calendrier principal, laissez `GOOGLE_CALENDAR_ID=primary`

### Étape 8: Configurer les variables d'environnement

#### En développement local

Créez ou modifiez le fichier `.env` :

```bash
# Google Calendar Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=planning-admin@votre-projet.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary
```

**⚠️ Important pour la clé privée :**
- Gardez les `\n` pour les retours à la ligne
- Entourez la clé de guillemets doubles
- Copiez-la exactement comme elle apparaît dans le fichier JSON

#### En production (Vercel)

1. Allez dans les paramètres de votre projet Vercel
2. Section **Environment Variables**
3. Ajoutez :
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` : L'email du service account
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` : La clé privée (avec les `\n`)
   - `GOOGLE_CALENDAR_ID` : `primary` ou l'ID de votre calendrier
4. Redéployez votre application

## 🚀 Utilisation

### Côté Administrateur

1. Connectez-vous à l'interface admin
2. Allez dans **Gestion des Disponibilités**
3. Sélectionnez une date et des heures
4. Choisissez si vous voulez répéter ces créneaux (hebdomadaire, mensuel, etc.)
5. Cliquez sur **Créer les créneaux**
6. ✅ Les créneaux sont créés dans Google Calendar avec le marqueur "🟢 DISPONIBLE"

### Côté Patient

1. Les patients vont sur la page de réservation
2. Ils voient un calendrier avec les dates disponibles en vert
3. Ils sélectionnent une date et voient les créneaux horaires disponibles
4. Ils cliquent sur un créneau et remplissent leurs informations
5. ✅ Le rendez-vous est créé dans Google Calendar
6. 📧 Ils reçoivent une confirmation par email

## 📊 Fonctionnalités

### Créneaux de Disponibilité

- ✅ Création de créneaux simples (une date, une plage horaire)
- ✅ Création de créneaux récurrents (quotidien, hebdomadaire, mensuel)
- ✅ Sélection des jours de la semaine pour la récurrence hebdomadaire
- ✅ Date de fin pour la récurrence
- ✅ Marquage visuel dans Google Calendar (couleur verte)
- ✅ Créneaux "transparents" (ne bloquent pas votre calendrier)

### Rendez-vous

- ✅ Synchronisation automatique dans Google Calendar
- ✅ Informations complètes (nom, email, téléphone, motif)
- ✅ Rappels automatiques (24h et 1h avant)
- ✅ Notifications par email au patient et au praticien
- ✅ Couleur distinctive pour les rendez-vous (vert sauge)

### API disponibles

Le système expose plusieurs endpoints via tRPC :

```typescript
// Créer des disponibilités (Admin)
availability.createSlot(...)
availability.updateSlot(...)
availability.deleteSlot(...)

// Consulter les disponibilités (Public)
availability.getAvailableSlots(...)
availability.checkSlotAvailability(...)
availability.getAvailabilitySummary(...)

// Réserver un créneau (Public)
availability.bookSlot(...)
```

## 🎨 Personnalisation

### Modifier la durée des créneaux

Dans `AvailabilityCalendar.tsx`, ligne ~46 :

```typescript
slotDuration: 30, // 30 minutes par défaut
```

### Modifier les couleurs dans Google Calendar

Dans `googleCalendar.ts` :

```typescript
colorId: '10', // Vert basilic pour les disponibilités
colorId: '2',  // Vert sauge pour les rendez-vous
```

Codes couleur disponibles :
- '1': Lavande, '2': Sauge, '3': Raisin, '4': Flamingo
- '5': Banane, '6': Mandarine, '7': Paon, '8': Graphite
- '9': Myrtille, '10': Basilic, '11': Tomate

### Modifier les rappels

Dans `googleCalendar.ts`, ligne ~98 :

```typescript
reminders: {
  useDefault: false,
  overrides: [
    { method: 'email', minutes: 30 }, // 30 minutes avant
    { method: 'popup', minutes: 30 },
  ],
},
```

## 🐛 Dépannage

### Erreur "Google API initialization failed"

**Cause** : Les credentials ne sont pas correctement configurés

**Solution** :
1. Vérifiez que `GOOGLE_SERVICE_ACCOUNT_EMAIL` est correct
2. Vérifiez que `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` est bien formatée avec les `\n`
3. Vérifiez que vous avez bien partagé votre calendrier avec l'email du service account

### Erreur "Insufficient Permission" ou "403"

**Cause** : Le service account n'a pas les permissions nécessaires

**Solution** :
1. Vérifiez que vous avez bien partagé le calendrier avec le service account
2. Accordez les permissions **Apporter des modifications aux événements**
3. Attendez quelques minutes pour que les permissions se propagent

### Les créneaux ne s'affichent pas côté patient

**Cause** : Aucun créneau de disponibilité n'a été créé

**Solution** :
1. Allez dans l'interface admin
2. Créez des créneaux de disponibilité
3. Vérifiez dans Google Calendar que les événements "🟢 DISPONIBLE" sont bien créés

### Les rendez-vous ne se créent pas dans Google Calendar

**Cause** : Problème de synchronisation

**Solution** :
1. Vérifiez les logs du serveur
2. Vérifiez que l'API Google Calendar est bien activée
3. Testez manuellement avec un appel API

## 🔒 Sécurité

⚠️ **Important** :

- **NE JAMAIS** committer le fichier `.env` contenant les credentials
- Gardez votre clé privée confidentielle
- Utilisez les variables d'environnement de votre plateforme en production
- Ajoutez `.env` à votre `.gitignore`
- Révoque l'accès si vous pensez que les credentials ont été compromis

## 📚 Ressources

- [Documentation Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [Guide Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Google Cloud Console](https://console.cloud.google.com/)
- [googleapis npm package](https://www.npmjs.com/package/googleapis)

## 💡 Astuces

### Tester la connexion

Vous pouvez tester si la connexion fonctionne en démarrant le serveur et en vérifiant les logs :

```bash
npm run dev
```

Cherchez dans les logs :
- `✅ Google Calendar service initialized` = Succès
- `⚠️ Google Calendar non configuré` = Problème de configuration

### Utiliser plusieurs calendriers

Si vous voulez utiliser différents calendriers pour différents types de rendez-vous :

1. Créez plusieurs calendriers dans Google Calendar
2. Partagez-les tous avec le service account
3. Récupérez leurs IDs
4. Passez l'ID approprié dans les appels API

---

**Besoin d'aide ?** Consultez la documentation complète dans les fichiers du serveur :
- `/server/services/googleCalendar.ts`
- `/server/availabilityRouter.ts`
