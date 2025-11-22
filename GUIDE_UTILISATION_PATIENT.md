# 📅 Guide d'utilisation - Système de réservation Patient

## 🎯 Vue d'ensemble

Ce système permet aux patients de réserver des rendez-vous directement depuis les disponibilités gérées dans votre Google Calendar personnel, **sans interface administrateur**.

## 🔑 Fonctionnement

### Comment ça marche ?

1. **Vous gérez vos disponibilités dans Google Calendar** (votre calendrier normal)
2. **Les patients voient automatiquement vos créneaux disponibles**
3. **Ils réservent directement** depuis l'interface web
4. **Le rendez-vous apparaît automatiquement dans votre Google Calendar**

## 📝 Comment créer des disponibilités ?

### Méthode simple : Créer un événement dans Google Calendar

1. Ouvrez [Google Calendar](https://calendar.google.com)
2. Cliquez sur un créneau horaire (exemple : Lundi 10h-11h)
3. Donnez un titre qui contient l'un de ces mots :
   - `DISPONIBLE`
   - `🟢 DISPONIBLE`
   - `DISPO`
   - `LIBRE`
   - `FREE`
   - `AVAILABLE`
4. Enregistrez l'événement

**Exemple de titre :**
- `🟢 DISPONIBLE - Consultation`
- `DISPO 30min`
- `Créneau LIBRE`

### Créer des disponibilités récurrentes

Pour créer des créneaux qui se répètent chaque semaine :

1. Créez un événement dans Google Calendar
2. Titre : `🟢 DISPONIBLE`
3. Cliquez sur **"Ne se répète pas"** → Sélectionnez **"Personnalisé"**
4. Choisissez :
   - **Fréquence** : Hebdomadaire
   - **Jours** : Lundi, Mercredi, Vendredi (par exemple)
   - **Se termine** : Le 31 décembre 2025 (par exemple)
5. Enregistrez

**Résultat :** Un créneau disponible sera créé automatiquement chaque lundi, mercredi et vendredi.

## 👥 Côté Patient

### Interface de réservation

Les patients accèdent à la page `/simple-booking` où ils peuvent :

1. **Voir un calendrier** avec les dates disponibles (en vert)
2. **Sélectionner une date** disponible
3. **Choisir un créneau horaire** parmi ceux disponibles ce jour-là
4. **Remplir leurs informations** :
   - Nom complet (obligatoire)
   - Email (obligatoire)
   - Téléphone (optionnel)
   - Motif de consultation (optionnel)
5. **Confirmer le rendez-vous**

### Ce qui se passe après la réservation

✅ Le rendez-vous est créé dans votre Google Calendar  
✅ Le patient reçoit un email de confirmation  
✅ Le créneau disponible est automatiquement supprimé  
✅ Le nouveau rendez-vous affiche les infos du patient  

## 🔧 Configuration

### Variables d'environnement requises

Dans votre fichier `.env` (ou dans les variables Vercel) :

```env
# URL iCal publique de votre Google Calendar
GOOGLE_CALENDAR_ICAL_URL=https://calendar.google.com/calendar/ical/VOTRE_EMAIL/public/basic.ics

# Votre email Google Calendar
GOOGLE_CALENDAR_EMAIL=votre.email@gmail.com

# Clé privée du Service Account (pour créer des événements)
GOOGLE_CALENDAR_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Comment obtenir l'URL iCal ?

1. Ouvrez [Google Calendar](https://calendar.google.com)
2. Cliquez sur les **trois points** à côté de votre calendrier
3. Sélectionnez **"Paramètres et partage"**
4. Descendez jusqu'à **"Intégrer le calendrier"**
5. Copiez l'**"Adresse publique au format iCal"**

**Important :** Votre calendrier doit être **public** pour que l'URL iCal fonctionne.

### Comment obtenir la clé privée ?

Vous utilisez déjà la clé privée fournie dans votre configuration :
- Email : `doriansarry47@gmail.com`
- Clé privée : Déjà configurée dans `.env`

## 📊 Exemples d'utilisation

### Exemple 1 : Consultations standard

**Objectif :** Proposer des consultations de 30 minutes, du lundi au vendredi, de 9h à 18h

**Solution :**
1. Créez un événement récurrent dans Google Calendar
2. Titre : `🟢 DISPONIBLE - Consultation 30min`
3. Heure : 9h00 - 9h30
4. Récurrence : Hebdomadaire, Lundi-Vendredi
5. Répétez pour chaque créneau (9h30-10h, 10h-10h30, etc.)

### Exemple 2 : Créneaux ponctuels

**Objectif :** Ouvrir des créneaux exceptionnels le samedi

**Solution :**
1. Créez un événement simple dans Google Calendar
2. Titre : `🟢 DISPO - Consultation exceptionnelle`
3. Date : Samedi 30 novembre 2024
4. Heure : 10h00 - 11h00

### Exemple 3 : Bloquer un créneau

**Objectif :** Vous avez un empêchement et devez bloquer un créneau

**Solution :**
1. Trouvez l'événement `🟢 DISPONIBLE` dans votre calendrier
2. **Supprimez-le** ou **changez le titre** (enlevez le mot "DISPONIBLE")
3. Le créneau disparaîtra automatiquement de l'interface patient

## 🎨 Personnalisation

### Modifier la durée par défaut des consultations

Dans le code frontend (`SimpleBooking.tsx`), vous pouvez ajuster :
- L'affichage des créneaux
- Les couleurs
- Les textes

### Modifier les informations affichées

Dans `patientBookingRouter.ts`, vous pouvez personnaliser :
- Le nom du praticien affiché dans les emails
- L'adresse du cabinet
- Les rappels automatiques

## 🔒 Sécurité et Confidentialité

### Données sensibles

⚠️ **Important :**
- Ne jamais committer le fichier `.env`
- Garder la clé privée confidentielle
- Utiliser les variables d'environnement Vercel en production

### Calendrier public

Votre calendrier iCal est public, mais :
- Seuls les événements marqués "DISPONIBLE" sont affichés
- Les détails des rendez-vous pris ne sont pas visibles publiquement
- Les informations des patients sont sécurisées

## 🐛 Résolution de problèmes

### Les créneaux n'apparaissent pas

**Vérifications :**
1. ✅ Votre calendrier est-il public ?
2. ✅ Les événements contiennent-ils le mot "DISPONIBLE" ?
3. ✅ L'URL iCal est-elle correcte dans `.env` ?
4. ✅ Les événements sont-ils dans le futur ?

### Les rendez-vous ne se créent pas

**Vérifications :**
1. ✅ La clé privée est-elle correcte ?
2. ✅ L'email du calendrier est-il correct ?
3. ✅ Le service account a-t-il les permissions ?

### Les emails ne sont pas envoyés

**Vérifications :**
1. ✅ La clé API Resend est-elle configurée ?
2. ✅ Le service email est-il actif ?
3. ✅ L'adresse email du patient est-elle valide ?

## 📚 Routes disponibles

| Route | Description | Public |
|-------|-------------|--------|
| `/` | Page d'accueil | ✅ Oui |
| `/simple-booking` | Réservation patient | ✅ Oui |
| `/admin` | Interface admin (legacy) | ❌ Admin uniquement |

## 🚀 Déploiement

### En développement local

```bash
# Installer les dépendances
npm install

# Lancer le serveur
npm run dev
```

### En production (Vercel)

1. Pusher le code sur GitHub
2. Configurer les variables d'environnement dans Vercel :
   - `GOOGLE_CALENDAR_ICAL_URL`
   - `GOOGLE_CALENDAR_EMAIL`
   - `GOOGLE_CALENDAR_PRIVATE_KEY`
   - `RESEND_API_KEY`
3. Déployer automatiquement

## 💡 Astuces

### Optimiser votre planning

- **Créez des créneaux par lot** : Utilisez la récurrence pour gagner du temps
- **Utilisez des couleurs** : Donnez des couleurs différentes dans Google Calendar pour mieux visualiser
- **Ajoutez des emojis** : Les emojis (🟢) rendent les créneaux plus visibles

### Gérer les urgences

Si vous devez libérer un créneau en urgence :
1. Créez simplement un nouvel événement "🟢 DISPONIBLE"
2. Il apparaîtra immédiatement sur l'interface patient

### Suivre vos rendez-vous

Tous les rendez-vous réservés apparaissent dans votre Google Calendar avec :
- 🩺 Icône consultation
- Nom du patient
- Email et téléphone
- Motif de consultation
- Rappels automatiques

---

**Questions ou problèmes ?**  
Contactez le support technique ou consultez la documentation complète dans le dossier du projet.
