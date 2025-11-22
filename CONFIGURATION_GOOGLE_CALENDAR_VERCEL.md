# Configuration Google Calendar - Vercel
## Guide de Configuration Post-Déploiement

### 🔧 Étapes de Configuration

#### 1. Accéder au Dashboard Vercel
1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet "planning"
3. Cliquer sur **Settings** onglet

#### 2. Configurer les Variables d'Environnement
Aller dans **Environment Variables** et ajouter ces variables :

```
GOOGLE_SERVICE_ACCOUNT_EMAIL
planningadmin@apaddicto.iam.gserviceaccount.com
```

```
GOOGLE_PRIVATE_KEY
-----BEGIN PRIVATE KEY-----
[INSÉRRER LA VRAIE CLÉ PRIVÉE DU SERVICE ACCOUNT ICI]
-----END PRIVATE KEY-----
```

```
GOOGLE_CALENDAR_ID
primary
```

```
GOOGLE_CLIENT_ID
603850749287-8c0hrol8l5gulsal23mna3raeolmd2l2.apps.googleusercontent.com
```

```
GOOGLE_CLIENT_SECRET
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
```

```
VITE_GOOGLE_CLIENT_ID
603850749287-8c0hrol8l5gulsal23mna3raeolmd2l2.apps.googleusercontent.com
```

```
VITE_GOOGLE_API_KEY
d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939
```

#### 3. Redéployer l'Application
1. Aller dans l'onglet **Deployments**
2. Cliquer sur **Redeploy** pour re-déployer avec les nouvelles variables
3. Attendre que le déploiement se termine (2-3 minutes)

### ✅ Vérification de la Configuration

Après le redéploiement, l'application devrait afficher :
- ✅ Google Calendar initialized successfully

Si vous voyez des erreurs comme :
- ❌ Google service account credentials not found
- ❌ Invalid private key format

Vérifiez que les variables d'environnement sont correctement configurées.

### 🔐 Configuration Service Account Google

Assurez-vous que le Service Account a les bonnes permissions :
1. Aller sur https://console.cloud.google.com/iam-admin/serviceaccounts
2. Sélectionner `planningadmin@apaddicto.iam.gserviceaccount.com`
3. Ajouter le rôle **Service Account Token Creator**
4. Ajouter le rôle **Cloud Calendar Admin**

### 📧 Variables pour les Invitations Patients

L'application est configurée pour envoyer des invitations via email lors de la création de créneaux. Le champ "Email patient" dans le formulaire permettra d'inviter automatiquement les patients à vos événements Google Calendar.

### 🧪 Test de la Configuration

1. Créer un nouveau créneau de disponibilité
2. Ajouter un email patient de test
3. Vérifier dans Google Calendar si l'événement apparaît
4. Vérifier si l'email d'invitation est envoyé au patient

---
**Date**: 22 Novembre 2025 - 22:12 UTC
**Status**: Guide de configuration post-déploiement
