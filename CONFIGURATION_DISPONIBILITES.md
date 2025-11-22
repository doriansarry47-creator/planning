# 📅 Configuration des Disponibilités Google Calendar

## 🎯 Objectif

Pour que le système de réservation fonctionne, vous devez créer des événements "DISPONIBLE" dans votre Google Calendar qui seront automatiquement détectés et convertis en créneaux de 60 minutes.

## 📋 Étapes de Configuration

### 1. Accéder à Google Calendar

1. Ouvrez [Google Calendar](https://calendar.google.com)
2. Connectez-vous avec : **doriansarry47@gmail.com**

### 2. Créer des Événements de Disponibilité

Pour chaque plage horaire où vous êtes disponible, créez un événement :

#### Format de l'Événement

- **Titre** : Utilisez un des mots-clés suivants (le système les détecte automatiquement) :
  - `DISPONIBLE`
  - `Disponible`
  - `AVAILABLE`
  - `Available`
  - `DISPO`
  - `Dispo`
  - `LIBRE`
  - `Libre`
  - `FREE`
  - `Free`
  - `🟢` (emoji vert)
  - Ou tout titre contenant un de ces mots

- **Date et Heure** : Définissez votre plage de disponibilité
  - Exemple : Lundi 25 novembre 2025, 09:00 - 18:00

- **Répétition** (optionnel) : 
  - Si vous voulez répéter ces disponibilités chaque semaine
  - Exemple : "Tous les lundis" ou "Du lundi au vendredi"

#### Exemple de Création

```
Titre : DISPONIBLE
Date : 25 novembre 2025
Heure de début : 09:00
Heure de fin : 18:00
Répéter : Tous les lundis (optionnel)
```

### 3. Comment le Système Traite les Disponibilités

Le système va automatiquement :

1. **Lire** tous les événements "DISPONIBLE" de votre calendrier
2. **Diviser** chaque plage en créneaux de **60 minutes exactement**
3. **Afficher** ces créneaux aux patients sur la page de réservation

#### Exemple de Conversion

Si vous créez :
```
DISPONIBLE : 09:00 - 13:00 (4 heures)
```

Le système génère automatiquement :
- Créneau 1 : 09:00 - 10:00
- Créneau 2 : 10:00 - 11:00
- Créneau 3 : 11:00 - 12:00
- Créneau 4 : 12:00 - 13:00

**Total : 4 créneaux de 60 minutes**

### 4. Recommandations

#### Pour une Semaine Type

Voici un exemple de configuration hebdomadaire :

**Lundi**
- 09:00 - 12:00 : DISPONIBLE (3 créneaux)
- 14:00 - 18:00 : DISPONIBLE (4 créneaux)

**Mardi**
- 09:00 - 12:00 : DISPONIBLE (3 créneaux)
- 14:00 - 18:00 : DISPONIBLE (4 créneaux)

**Mercredi**
- 09:00 - 12:00 : DISPONIBLE (3 créneaux)

**Jeudi**
- 14:00 - 18:00 : DISPONIBLE (4 créneaux)

**Vendredi**
- 09:00 - 12:00 : DISPONIBLE (3 créneaux)

**Total : 24 créneaux de 60 minutes par semaine**

#### Conseils Pratiques

1. **Durée Minimale** : Créez des plages d'au moins 60 minutes
   - Si vous créez une plage de 30 minutes, elle sera ignorée

2. **Horaires Standards** : Utilisez des heures rondes (09:00, 10:00, etc.)
   - Évitez 09:15, 10:30 pour une meilleure lisibilité

3. **Répétition** : Utilisez la fonction "Répéter" de Google Calendar
   - Gagnez du temps en configurant une semaine type

4. **Jours Fériés** : Supprimez ou ajustez les disponibilités pour les jours fériés

5. **Vacances** : Supprimez les événements DISPONIBLE pendant vos périodes de congés

### 5. Vérifier que ça Fonctionne

Après avoir créé vos événements :

1. **Attendre 1-2 minutes** (cache Google Calendar)
2. **Ouvrir la page de réservation** :
   - https://3000-iisnhv0y3m2aoqwpcatom-d0b9e1e2.sandbox.novita.ai/book-appointment
3. **Vérifier** que les dates avec disponibilités apparaissent en couleur
4. **Cliquer** sur une date pour voir les créneaux de 60 minutes

### 6. Exemple Complet : Créer une Disponibilité

#### Via l'Interface Web Google Calendar

1. Cliquez sur une date/heure dans le calendrier
2. Remplissez :
   ```
   Titre : DISPONIBLE
   Date : [Choisir la date]
   De : 09:00
   À : 18:00
   ```
3. (Optionnel) Cliquez sur "Ne se répète pas" et choisissez une récurrence
4. Cliquez sur "Enregistrer"

#### Via Google Calendar Mobile

1. Ouvrez l'application Google Calendar
2. Appuyez sur "+" (en bas à droite)
3. Sélectionnez "Événement"
4. Remplissez :
   ```
   Titre : DISPONIBLE
   Date et heure de début : [Choisir]
   Date et heure de fin : [Choisir]
   ```
5. Appuyez sur "Enregistrer"

### 7. Gestion des Réservations

#### Que se passe-t-il quand un patient réserve ?

1. **Le créneau DISPONIBLE est supprimé** (automatique)
2. **Un nouveau événement "🩺 Consultation - [Nom Patient]" est créé**
3. **Le patient reçoit un email** de confirmation
4. **Vous recevez une notification** Google Calendar

#### Annulation d'un Rendez-vous

Si un patient annule :
1. L'événement de consultation est supprimé
2. Vous devez **recréer manuellement** l'événement DISPONIBLE si vous souhaitez libérer ce créneau

### 8. Exemple de Configuration Rapide (Test)

Pour tester rapidement le système, créez :

```
Événement 1
Titre : DISPONIBLE
Date : [Demain]
Heure : 10:00 - 12:00

Événement 2
Titre : DISPONIBLE
Date : [Demain]
Heure : 14:00 - 17:00
```

Cela créera :
- 2 créneaux le matin (10:00-11:00, 11:00-12:00)
- 3 créneaux l'après-midi (14:00-15:00, 15:00-16:00, 16:00-17:00)

**Total : 5 créneaux de test**

## ⚠️ Points Importants

1. **Mots-clés Obligatoires** : Le titre DOIT contenir un des mots-clés listés
2. **Créneaux de 60 minutes** : Durée fixe, non modifiable
3. **Calendrier Privé** : L'URL iCal privée est utilisée (sécurisé)
4. **Synchronisation** : Peut prendre 1-2 minutes (cache Google)
5. **Événements Futurs Uniquement** : Les dates passées sont ignorées

## 🔍 Dépannage

### "Aucune disponibilité trouvée"

- Vérifiez que vos événements contiennent un mot-clé valide
- Vérifiez que les dates sont dans le futur
- Attendez 1-2 minutes et rechargez la page
- Vérifiez que l'URL iCal privée est correcte dans le .env

### "Les créneaux ne s'affichent pas"

- Vérifiez que la durée de l'événement est d'au moins 60 minutes
- Vérifiez que le serveur est démarré
- Consultez les logs serveur pour voir les erreurs

### "Créneau déjà réservé"

- Un autre patient a peut-être réservé en même temps
- Le créneau DISPONIBLE a peut-être été supprimé manuellement

## 📞 Support Technique

Si vous rencontrez des problèmes :

1. Vérifiez que le serveur est démarré : `npm run dev`
2. Consultez les logs dans la console
3. Vérifiez que l'URL iCal est accessible
4. Testez manuellement l'URL iCal avec curl

---

**Date de création** : 2025-11-22
**Version** : 1.0
**Contact** : GenSpark AI Developer
