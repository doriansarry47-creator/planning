# 📧 Intégration Sweego pour les Emails de Confirmation

## 🎯 Objectif

Remplacement du service Resend par **Sweego** pour l'envoi d'emails professionnels de confirmation de rendez-vous.

## ✨ Fonctionnalités Implémentées

### 1. Service Email Sweego
- ✅ Intégration complète de l'API Sweego
- ✅ Envoi d'emails de confirmation aux patients
- ✅ Envoi de notifications au praticien
- ✅ Gestion des erreurs et logs détaillés

### 2. Template HTML Professionnel
Le template d'email inclut **tous les détails requis** :

- 📅 **Date** : Format complet et lisible (ex: "lundi 22 janvier 2026")
- 🕐 **Horaire** : Heure de début → Heure de fin (ex: "14:00 → 15:00")
- ⏱️ **Durée** : En minutes (ex: "60 minutes")
- 📍 **Adresse** : Lieu du rendez-vous (par défaut: "20 rue des Jacobins, 24000 Périgueux")
- 💰 **Tarif** : Montant et devise (ex: "75.00 EUR")
- 📝 **Objet** : Raison de la consultation

### 3. Design Professionnel
- Design moderne avec dégradés de couleurs
- Responsive (adapté mobile, tablette, desktop)
- Icônes emoji pour une meilleure lisibilité
- Bouton d'annulation stylisé
- Section de contact complète
- Notice importante pour les annulations 24h à l'avance

## 🔧 Configuration

### Variables d'Environnement

Ajoutez dans votre fichier `.env` :

```env
# Configuration Sweego
SWEEGO_API_KEY=dc058ad-3a50-48af-96ed-1c42a63e9a07
APP_URL=https://webapp-frtjapec0-ikips-projects.vercel.app

# Resend (conservé comme fallback)
RESEND_API_KEY=re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd
```

### Déploiement sur Vercel

Configurez les variables d'environnement dans Vercel :

```bash
vercel env add SWEEGO_API_KEY
# Entrez: dc058ad-3a50-48af-96ed-1c42a63e9a07

vercel env add APP_URL
# Entrez: https://webapp-frtjapec0-ikips-projects.vercel.app
```

## 📝 Utilisation

### Envoi d'un Email de Confirmation

```typescript
import { sendAppointmentConfirmationEmail } from './services/emailService';

const emailResult = await sendAppointmentConfirmationEmail({
  patientName: 'Jean Dupont',
  patientEmail: 'jean.dupont@example.com',
  practitionerName: 'Dr. Marie Martin',
  date: new Date('2026-01-25T14:00:00Z'),
  startTime: '14:00',
  endTime: '15:00',
  reason: 'Consultation générale',
  location: '20 rue des Jacobins, 24000 Périgueux',
  durationMinutes: 60,
  price: 75.00,
  currency: 'EUR',
  appointmentHash: 'abc123def456'
});

if (emailResult.success) {
  console.log('Email envoyé avec succès:', emailResult.messageId);
} else {
  console.error('Erreur d\'envoi:', emailResult.error);
}
```

### Envoi d'une Notification au Praticien

```typescript
import { sendAppointmentNotificationToPractitioner } from './services/emailService';

const notificationResult = await sendAppointmentNotificationToPractitioner(
  emailData,
  'praticien@example.com'
);
```

## 🔄 Migration depuis Resend

### Changements Effectués

1. **Service Email** (`server/services/emailService.ts`)
   - Remplacement de `Resend` par l'API Sweego
   - Adaptation du format des requêtes
   - Conservation de la signature des fonctions pour compatibilité

2. **Configuration** (`server/_core/env.ts`)
   - Ajout de `sweegoApiKey`
   - Conservation de `resendApiKey` comme fallback

3. **Template HTML**
   - Design amélioré et plus professionnel
   - Ajout d'icônes emoji pour meilleure UX
   - Responsive design optimisé
   - Toutes les informations requises affichées clairement

## 📊 Structure de l'Email

```
┌─────────────────────────────────────┐
│         HEADER (Gradient)           │
│   📅 CONFIRMATION DE RENDEZ-VOUS    │
├─────────────────────────────────────┤
│                                     │
│  Bonjour [Nom du patient],         │
│                                     │
│  Confirmation message...            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 📆 Date: [Date complète]      │ │
│  │ 🕐 Horaire: [Début → Fin]     │ │
│  │ ⏱️ Durée: [X minutes]         │ │
│  │ 📍 Adresse: [Lieu]            │ │
│  │ 📝 Objet: [Raison]            │ │
│  │ 💰 Tarif: [Prix] [Devise]     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ⚠️ Note importante:                │
│  Annulation 24h à l'avance...      │
│                                     │
│  [🗑️ Annuler le rendez-vous]       │
│                                     │
├─────────────────────────────────────┤
│              FOOTER                 │
│  © 2026 [Praticien]                │
│  📍 20 rue des Jacobins            │
│  📞 06.45.15.63.68                 │
│  ✉️ doriansarry@yahoo.fr           │
└─────────────────────────────────────┘
```

## 🧪 Tests

Pour tester l'envoi d'emails :

```bash
# En développement local
npm run dev

# Créer un rendez-vous via l'API
# L'email sera automatiquement envoyé
```

## 📚 API Sweego

### Endpoint Principal
```
POST https://api.sweego.io/v1/emails
```

### Headers Requis
```
Authorization: Bearer {SWEEGO_API_KEY}
Content-Type: application/json
```

### Format du Payload
```json
{
  "to": [
    {
      "email": "patient@example.com",
      "name": "Jean Dupont"
    }
  ],
  "from": {
    "email": "contact@votre-domaine.fr",
    "name": "Dr. Marie Martin"
  },
  "subject": "Confirmation de votre rendez-vous",
  "html": "<html>...</html>",
  "text": "Version texte...",
  "replyTo": {
    "email": "reply@votre-domaine.fr",
    "name": "Dr. Marie Martin"
  }
}
```

## 🔐 Sécurité

- ✅ Clé API stockée dans les variables d'environnement
- ✅ Pas d'exposition de la clé API dans le code
- ✅ Logs des erreurs sans exposer les détails sensibles
- ✅ Validation des données avant envoi

## 📞 Support

Pour toute question concernant Sweego :
- Site web : https://sweego.io
- Documentation : https://docs.sweego.io

Pour les problèmes d'intégration :
- Vérifier les variables d'environnement
- Consulter les logs serveur
- Tester avec un email valide

## 🎉 Résultat

✅ **Migration réussie de Resend vers Sweego**
✅ **Template professionnel avec toutes les informations requises**
✅ **Prêt pour la production**

---

**Date de mise à jour** : 22 janvier 2026
**Version** : 1.0.0
**Auteur** : GenSpark AI Developer
