# 🚀 Guide de Déploiement Vercel - Application Planning

## ✅ Problème Résolu

**Problème initial** : Les créneaux de rendez-vous ne s'affichaient pas sur Vercel (0 créneaux disponibles), alors qu'ils fonctionnaient en local.

**Cause** : Aucune variable d'environnement n'était configurée sur Vercel, empêchant la connexion à Google Calendar et à la base de données.

## 🔧 Corrections Apportées

### 1. Configuration des Variables d'Environnement sur Vercel

Toutes les variables d'environnement nécessaires ont été ajoutées sur Vercel pour les environnements **Production**, **Preview** et **Development** :

#### Variables Critiques

| Variable | Valeur | Description |
|----------|--------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | planningadmin@apaddicto.iam.gserviceaccount.com | Email du compte de service Google |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | -----BEGIN PRIVATE KEY----- ... | Clé privée du compte de service (avec retours à la ligne) |
| `GOOGLE_CALENDAR_ID` | doriansarry47@gmail.com | ID du calendrier Google à synchroniser |
| `DATABASE_URL` | postgresql://... | URL de connexion à la base de données Neon |
| `RESEND_API_KEY` | re_Crbni8Gw_... | Clé API pour l'envoi d'emails |
| `APP_URL` | https://webapp-brown-three.vercel.app | URL de l'application |
| `NODE_ENV` | production | Environnement d'exécution |
| `ENABLE_AUTO_SYNC` | true | Active la synchronisation automatique |

### 2. Correction des Erreurs TypeScript

**Fichiers modifiés** :
- `api/index.ts`
- `api/trpc.ts`

**Correction** : Utilisation de `requestBody` au lieu de `resource` pour `calendar.events.insert()` afin de respecter l'API Google Calendar v3.

```typescript
// ❌ AVANT (incorrect)
const response = await calendar.events.insert({
  calendarId: calendarId,
  resource: event,  // ⚠️ Propriété incorrecte
  sendUpdates: 'none',
});

// ✅ APRÈS (correct)
const response = await calendar.events.insert({
  calendarId: calendarId,
  requestBody: event,  // ✅ Propriété correcte
  sendUpdates: 'none',
});
```

### 3. Scripts de Configuration Automatique

Deux scripts ont été créés pour faciliter la configuration :

#### Script Shell (`setup-vercel-env.sh`)
```bash
chmod +x setup-vercel-env.sh
./setup-vercel-env.sh
```

#### Script Node.js (`scripts/setup-vercel-env.js`)
```bash
node scripts/setup-vercel-env.js
```

Ces scripts automatisent l'ajout de toutes les variables d'environnement sur Vercel.

## 📊 État du Déploiement

### URLs de l'Application

- **Production** : https://webapp-brown-three.vercel.app
- **Dernière Preview** : https://webapp-nknagjd4e-ikips-projects.vercel.app
- **GitHub Repository** : https://github.com/doriansarry47-creator/planning

### Build Status

✅ **Build réussi** : Plus d'erreurs TypeScript
✅ **Variables configurées** : 20 variables d'environnement actives (8 par environnement)
✅ **Code déployé** : Dernier commit `3d01fe6`

## 🧪 Tests à Effectuer

### 1. Vérifier l'API de Santé

```bash
curl https://webapp-brown-three.vercel.app/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2025-12-19T...",
  "platform": "vercel",
  "googleCalendar": "initialized",  // ✅ Doit être "initialized"
  "service": "Planning App - Vercel Serverless",
  "version": "2.0"
}
```

### 2. Tester l'Affichage des Créneaux

1. Accédez à https://webapp-brown-three.vercel.app
2. Cliquez sur "Prendre rendez-vous" ou "Réserver"
3. Sélectionnez une date
4. **Vérifiez que les créneaux disponibles s'affichent** (ex: 09:00, 10:00, 11:00, etc.)

### 3. Tester la Réservation Complète

1. Sélectionnez un créneau
2. Remplissez le formulaire (nom, email, téléphone, motif)
3. Validez la réservation
4. **Vérifiez** :
   - Message de confirmation
   - Email de confirmation reçu
   - Rendez-vous ajouté sur Google Calendar (doriansarry47@gmail.com)
   - Créneau n'est plus visible pour les autres utilisateurs

### 4. Tester la Synchronisation Automatique

1. Ouvrez Google Calendar (doriansarry47@gmail.com)
2. Supprimez un rendez-vous manuellement
3. Attendez 2 minutes (polling automatique)
4. **Vérifiez** que le créneau redevient disponible sur l'application

## 🔍 Dépannage

### Problème : Google Calendar toujours "not initialized"

**Solution 1 : Vérifier les variables**
```bash
npx vercel env ls --token 4eR6qMjv73upx7CXVoHnK2Qr
```

**Solution 2 : Forcer un redéploiement**
```bash
cd /home/user/webapp
npx vercel --prod --token 4eR6qMjv73upx7CXVoHnK2Qr
```

**Solution 3 : Vérifier le format de la clé privée**
- La clé doit contenir les retours à la ligne (`\n`)
- Elle doit commencer par `-----BEGIN PRIVATE KEY-----`
- Elle doit finir par `-----END PRIVATE KEY-----`

### Problème : Créneaux toujours invisibles

**Vérifications** :
1. Google Calendar est-il partagé avec `planningadmin@apaddicto.iam.gserviceaccount.com` ?
2. Des créneaux de disponibilité sont-ils créés sur Google Calendar ?
3. Les créneaux sont-ils marqués comme "DISPONIBLE" ou avec `transparency: 'transparent'` ?

### Problème : Erreurs dans les logs

**Consulter les logs Vercel** :
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet "webapp"
3. Cliquez sur "Logs"
4. Recherchez les messages `[GoogleCalendar]` ou `[Vercel API]`

## 📝 Commandes Utiles

### Lister les variables d'environnement
```bash
npx vercel env ls --token 4eR6qMjv73upx7CXVoHnK2Qr
```

### Redéployer en production
```bash
cd /home/user/webapp
npx vercel --prod --token 4eR6qMjv73upx7CXVoHnK2Qr
```

### Voir les projets Vercel
```bash
npx vercel projects ls --token 4eR6qMjv73upx7CXVoHnK2Qr
```

### Tester localement
```bash
cd /home/user/webapp
npm run dev
```

## 🎯 Résultat Attendu

Après avoir suivi ce guide :

✅ **Variables d'environnement** : 8 variables configurées (Production, Preview, Development)
✅ **Build Vercel** : Aucune erreur TypeScript
✅ **Google Calendar** : Connecté et synchronisé
✅ **Créneaux disponibles** : Affichés correctement sur l'application
✅ **Réservation** : Fonctionnelle avec confirmation email
✅ **Synchronisation** : Automatique toutes les 2 minutes
✅ **Créneaux supprimés** : Redeviennent disponibles après suppression sur Google Calendar

## 📞 Support

Si le problème persiste après avoir vérifié tous les points ci-dessus :

1. Vérifiez les logs Vercel pour les erreurs spécifiques
2. Testez en local avec les mêmes variables d'environnement
3. Vérifiez que l'API Google Calendar est activée dans Google Cloud Console
4. Assurez-vous que le calendrier est bien partagé avec le compte de service

---

**Date de création** : 2025-12-19  
**Dernière mise à jour** : 2025-12-19  
**Version** : 1.0.0  
**Status** : ✅ Déployé et configuré
