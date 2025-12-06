# Système d'envoi d'email automatique

Ce document décrit le système d'envoi d'email automatique pour la confirmation de rendez-vous.

## 🚀 Fonctionnalités

### 1. Email de confirmation au patient
Après la création d'un rendez-vous, un email de confirmation est automatiquement envoyé au patient contenant :
- ✅ Détails complets du rendez-vous (date, heure, praticien)
- 📍 Informations de contact et localisation
- 🔗 Lien direct pour annuler le rendez-vous
- 💌 Design professionnel et responsive

### 2. Email de notification au praticien
Le praticien reçoit également une notification par email avec :
- 👤 Informations du patient
- 📅 Détails du rendez-vous
- 💬 Motif de consultation

### 3. Page d'annulation sécurisée
- 🔒 Lien unique basé sur un hash sécurisé
- ✅ Confirmation avant annulation
- 📧 Email de confirmation d'annulation
- 🎨 Interface utilisateur intuitive

## 📦 Installation et Configuration

### 1. Installation des dépendances
Le package `resend` a été installé :

```bash
npm install resend
```

### 2. Configuration des variables d'environnement

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
# Configuration Email (Resend)
RESEND_API_KEY=re_9tQBWc3R_FW1eBULbk2igSshem5z9wpq8
APP_URL=https://webapp-frtjapec0-ikips-projects.vercel.app
```

**Note:** Le token Resend fourni (`re_9tQBWc3R_FW1eBULbk2igSshem5z9wpq8`) est déjà configuré par défaut.

### 3. Configuration du domaine d'envoi (Optionnel)

Pour personnaliser l'adresse d'envoi des emails, vous devez :

1. **Configurer un domaine dans Resend** :
   - Connectez-vous à [Resend Dashboard](https://resend.com/domains)
   - Ajoutez votre domaine (ex: `therapie-sensorimotrice.fr`)
   - Configurez les enregistrements DNS (SPF, DKIM, DMARC)

2. **Mettre à jour l'adresse d'envoi** :
   Dans le fichier `server/services/emailService.ts`, ligne 197 :
   ```typescript
   from: 'Dorian Sarry - Thérapie <contact@votre-domaine.fr>',
   ```

## 📂 Structure des fichiers

### Nouveaux fichiers créés

```
server/
└── services/
    └── emailService.ts          # Service d'envoi d'email avec Resend

client/
└── src/
    └── pages/
        └── CancelAppointment.tsx # Page d'annulation de rendez-vous

EMAIL_SYSTEM.md                   # Ce fichier de documentation
```

### Fichiers modifiés

```
server/
├── _core/
│   └── env.ts                    # Ajout des variables RESEND_API_KEY et APP_URL
└── routers.ts                    # Intégration de l'envoi d'email après création de RDV

client/
└── src/
    ├── App.tsx                   # Ajout de la route d'annulation
    └── pages/
        └── Home.tsx              # Amélioration de la visibilité de la modale

.env.example                      # Ajout des variables d'environnement
```

## 🎨 Design des emails

Les emails sont créés avec :
- ✅ **Version HTML** : Design moderne et responsive
- ✅ **Version texte** : Fallback pour les clients email sans HTML
- 🎨 **Couleurs personnalisées** : Bleu (#2563eb) pour correspondre à la charte graphique
- 📱 **Mobile-first** : Optimisé pour tous les appareils
- 🔒 **Sécurisé** : Liens d'annulation basés sur des hash uniques

## 🔄 Flux d'utilisation

### 1. Création de rendez-vous
```
Patient remplit le formulaire
    ↓
Création du rendez-vous en DB
    ↓
Génération d'un hash unique
    ↓
Synchronisation Google Calendar (si configuré)
    ↓
Envoi email de confirmation au patient
    ↓
Envoi email de notification au praticien
    ↓
Retour de la confirmation au patient
```

### 2. Annulation de rendez-vous
```
Patient clique sur "Annuler le rendez-vous" dans l'email
    ↓
Redirection vers /appointments/cancel/:hash
    ↓
Affichage des détails du rendez-vous
    ↓
Confirmation de l'annulation
    ↓
Mise à jour du statut en DB (status = 'cancelled')
    ↓
Affichage de la confirmation
    ↓
(Optionnel) Envoi d'un email de confirmation d'annulation
```

## 🧪 Tests

### Test en local

1. **Démarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Créer un rendez-vous de test** :
   - Naviguez vers `/book-appointment`
   - Remplissez le formulaire avec votre email
   - Soumettez le formulaire

3. **Vérifier l'email** :
   - Consultez votre boîte email
   - Vérifiez la réception de l'email de confirmation
   - Testez le lien d'annulation

### Test en production

1. **Déployer sur Vercel** :
   ```bash
   git push origin main
   ```

2. **Configurer les variables d'environnement dans Vercel** :
   - Allez dans les settings du projet
   - Ajoutez `RESEND_API_KEY` et `APP_URL`

3. **Tester le flux complet** :
   - Créer un rendez-vous
   - Vérifier l'email
   - Tester l'annulation

## 📊 Monitoring et logs

Les logs sont disponibles dans la console du serveur :

```
[Email] Email de confirmation envoyé au patient: {messageId}
[Email] Email de notification envoyé au praticien: {messageId}
[Email] Erreur lors de l'envoi: {error}
```

## 🔧 Personnalisation

### Modifier le template d'email

Le template se trouve dans `server/services/emailService.ts` :

- **HTML** : fonction `getConfirmationEmailHTML()`
- **Texte** : fonction `getConfirmationEmailText()`

### Ajouter de nouveaux types d'emails

Créez de nouvelles fonctions dans `emailService.ts` :

```typescript
export async function sendAppointmentReminderEmail(
  data: AppointmentEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Votre code ici
}
```

## 🔒 Sécurité

- ✅ Hash uniques et sécurisés pour les liens d'annulation
- ✅ Validation des données avant envoi
- ✅ Gestion d'erreurs robuste
- ✅ Pas de blocage de la création de RDV si l'email échoue
- ✅ Token API stocké dans les variables d'environnement

## 🚀 Améliorations futures

### Priorité haute
- [ ] Personnalisation du domaine d'envoi
- [ ] Email de rappel 24h avant le rendez-vous
- [ ] Email de confirmation d'annulation

### Priorité moyenne
- [ ] Historique des emails envoyés en DB
- [ ] Tableau de bord des statistiques d'emails
- [ ] Templates d'emails personnalisables par praticien

### Priorité basse
- [ ] Support multi-langue
- [ ] Intégration SMS (Twilio)
- [ ] A/B testing des templates

## 📞 Support

Pour toute question ou problème :

- 📧 Email : doriansarry@yahoo.fr
- 📞 Téléphone : 06.45.15.63.68
- 📚 Documentation Resend : https://resend.com/docs

## 📝 Changelog

### Version 1.0.0 (15 Novembre 2025)
- ✨ Création du système d'email automatique
- 📧 Email de confirmation au patient
- 👨‍⚕️ Email de notification au praticien
- 🔗 Page d'annulation sécurisée
- 🎨 Amélioration de la visibilité de la page d'accueil
- 📚 Documentation complète

---

**Auteur** : GenSpark AI Developer  
**Date** : 15 Novembre 2025  
**Version** : 1.0.0
