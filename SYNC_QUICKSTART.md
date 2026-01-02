# 🚀 Guide Rapide : Synchronisation Google Calendar

Ce guide vous permet de démarrer rapidement avec la synchronisation Google Calendar.

## ⚡ Démarrage Rapide (5 minutes)

### Étape 1 : Vérifier les credentials

Vos credentials Google Service Account sont déjà configurés dans le fichier `.env` :

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com
```

✅ **Les credentials sont déjà en place !**

### Étape 2 : Partager votre calendrier

1. Ouvrez [Google Calendar](https://calendar.google.com/)
2. Cliquez sur les 3 points à côté de votre calendrier principal
3. Sélectionnez **"Paramètres et partage"**
4. Dans **"Partager avec des personnes spécifiques"** :
   - Cliquez sur **"Ajouter des personnes"**
   - Entrez : `planningadmin@apaddicto.iam.gserviceaccount.com`
   - Accordez les droits : **"Apporter des modifications aux événements"**
   - Cliquez sur **"Envoyer"**

⏱️ **Attendez 2-3 minutes** après le partage pour que les permissions se propagent.

### Étape 3 : Lancer la synchronisation

```bash
# Synchroniser les créneaux de disponibilité
npm run sync:availability
```

Ce script va créer des créneaux de disponibilité pour les 3 prochains mois :
- **Horaires** : 9h00 - 18h00
- **Jours** : Lundi au vendredi
- **Durée** : 60 minutes par créneau

### Étape 4 : Vérifier dans Google Calendar

1. Ouvrez votre Google Calendar
2. Vous devriez voir des événements **🟢 DISPONIBLE** en vert
3. Ces créneaux sont maintenant disponibles pour réservation

## 🎨 Comment ça fonctionne ?

### Créneaux de disponibilité
- Apparaissent en **VERT** (🟢)
- Marqués comme **"transparent"** (n'affectent pas votre disponibilité)
- Titre : **"🟢 DISPONIBLE"**

### Rendez-vous réservés
- Apparaissent en **BLEU** (🔵)
- Marqués comme **"opaque"** (bloquent le calendrier)
- Titre : **"🏥 RDV - Nom du patient"**
- Contiennent les informations du patient

### Masquage automatique
- ✅ Les créneaux **disponibles** sont visibles sur l'application
- ❌ Les créneaux **réservés** sont automatiquement **masqués**
- 🔒 Les utilisateurs ne voient que les créneaux libres

## ⚙️ Personnalisation

Pour modifier la configuration, éditez `scripts/sync-availability.ts` :

```typescript
const config = {
  // Période de synchronisation
  startDate: new Date(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 mois
  
  // Horaires de travail
  workingHours: {
    start: '09:00',  // Modifier ici
    end: '18:00',    // Modifier ici
  },
  
  // Jours de travail (0=dimanche, 1=lundi, ..., 6=samedi)
  daysOfWeek: [1, 2, 3, 4, 5], // Lundi à vendredi
  
  // Durée de chaque créneau (en minutes)
  slotDuration: 60, // Modifier ici
};
```

Exemples :
- **Créneaux de 30 min** : `slotDuration: 30`
- **Travail le samedi** : `daysOfWeek: [1, 2, 3, 4, 5, 6]`
- **Horaires étendus** : `start: '08:00', end: '20:00'`

## 🧪 Tester la fonctionnalité

### 1. Démarrer le serveur
```bash
npm run dev
```

### 2. Ouvrir l'application
Allez sur la page de réservation : `http://localhost:5173/book-appointment`

### 3. Sélectionner une date
Choisissez une date dans le calendrier

### 4. Vérifier les créneaux
- Vous devriez voir uniquement les créneaux **disponibles**
- Les créneaux déjà pris ne s'affichent pas

### 5. Réserver un créneau
1. Sélectionnez un créneau
2. Remplissez vos informations
3. Validez la réservation

### 6. Vérifier dans Google Calendar
- Le créneau devient **🔵 BLEU**
- Il n'apparaît plus dans la liste des disponibilités
- Vous recevez un email de confirmation

## 🔍 Dépannage Express

### ❌ "Service Google Calendar non configuré"
**Solution** : Vérifiez que les variables sont dans `.env` et redémarrez le serveur

### ❌ "401 Unauthorized"
**Solution** : 
1. Vérifiez que le calendrier est partagé avec le service account
2. Attendez 2-3 minutes après le partage
3. Vérifiez l'email : `planningadmin@apaddicto.iam.gserviceaccount.com`

### ❌ "403 Forbidden"
**Solution** : 
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Library
3. Recherchez "Google Calendar API"
4. Cliquez sur "Enable"

### ❌ Les créneaux pris s'affichent encore
**Solution** : 
1. Videz le cache du navigateur
2. Redémarrez le serveur : `npm run dev`
3. Vérifiez les logs : `[AvailabilitySync] X créneaux disponibles (créneaux pris masqués)`

## 📊 Exemple de logs

Lors d'une synchronisation réussie :
```
🔄 SYNCHRONISATION DES DISPONIBILITÉS AVEC GOOGLE CALENDAR
✅ Service de synchronisation initialisé
📅 Configuration:
   Période: du 08/12/2024 au 08/03/2025
   Horaires: de 09:00 à 18:00
   Jours: Lun, Mar, Mer, Jeu, Ven
   Durée par créneau: 60 minutes
📊 Nombre estimé de créneaux à créer: 585
🚀 Démarrage de la synchronisation...
[AvailabilitySync] Créneau de disponibilité créé: abc123...
✅ SYNCHRONISATION TERMINÉE
   Créneaux créés: 585
   Erreurs: 0
   Durée: 45.23 secondes
```

## 💡 Astuces

1. **Synchronisation régulière** : Lancez `npm run sync:availability` chaque début de mois
2. **Vérification visuelle** : Consultez Google Calendar pour voir les créneaux créés
3. **Tests progressifs** : Commencez avec une semaine, puis étendez à 3 mois
4. **Nettoyage** : Supprimez les créneaux passés dans Google Calendar

## 📚 Documentation complète

Pour plus de détails, consultez [GOOGLE_CALENDAR_SYNC.md](./GOOGLE_CALENDAR_SYNC.md)

## ✅ Checklist de démarrage

- [ ] Partager le calendrier avec `planningadmin@apaddicto.iam.gserviceaccount.com`
- [ ] Attendre 2-3 minutes après le partage
- [ ] Lancer `npm run sync:availability`
- [ ] Vérifier les créneaux dans Google Calendar
- [ ] Démarrer le serveur avec `npm run dev`
- [ ] Tester une réservation
- [ ] Vérifier que le créneau est masqué après réservation
- [ ] Vérifier l'email de confirmation

---

**Besoin d'aide ?** Consultez la [documentation complète](./GOOGLE_CALENDAR_SYNC.md) ou les logs du serveur.
