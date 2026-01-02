# 🚀 Guide de Déploiement sur Vercel

## 📋 Prérequis

- Compte Vercel configuré
- Token Vercel valide
- Variables d'environnement configurées sur Vercel

## 🔧 Variables d'environnement requises

Assurez-vous que ces variables sont configurées dans votre projet Vercel :

```env
# Base de données
DATABASE_URL=postgresql://username:password@host:port/database

# Google Calendar Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=votre-service-account@projet.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com

# Email (si configuré)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-app-password

# SMS (si configuré)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+33xxxxxx

# Environnement
NODE_ENV=production

# Synchronisation automatique (optionnel, activé par défaut en production)
ENABLE_AUTO_SYNC=true
```

## 🚀 Méthode 1 : Déploiement automatique via GitHub (Recommandé)

### Étape 1 : Merger la Pull Request

1. Accédez à la PR : https://github.com/doriansarry47-creator/planning/pull/45
2. Vérifiez les changements
3. Cliquez sur "Merge pull request"
4. Confirmez le merge

### Étape 2 : Vercel déploie automatiquement

- Vercel détecte le push sur la branche `main`
- Le déploiement démarre automatiquement
- Surveillez les logs sur https://vercel.com/dashboard

### Étape 3 : Vérifier le déploiement

1. Accédez à votre URL de production
2. Vérifiez les logs de déploiement :
   ```
   [AutoSync] 🚀 Démarrage du polling automatique (toutes les 2 minutes)
   [AutoSync] ✅ Service de synchronisation automatique initialisé
   ```

## 🚀 Méthode 2 : Déploiement manuel via Vercel CLI

### Étape 1 : Se connecter à Vercel

```bash
npx vercel login
```

Suivez les instructions pour vous authentifier.

### Étape 2 : Lier le projet (première fois uniquement)

```bash
npx vercel link
```

Sélectionnez votre projet existant ou créez-en un nouveau.

### Étape 3 : Déployer en production

```bash
npx vercel --prod
```

Ou depuis la branche `genspark_ai_developer` :

```bash
git checkout genspark_ai_developer
npx vercel --prod
```

## 🧪 Tests après déploiement

### Test 1 : Vérifier l'état du service

1. Accédez à l'interface admin
2. Naviguez vers le composant "Synchronisation Google Calendar"
3. Vérifiez que :
   - Google Calendar : ✅ Connecté
   - Service de Sync : ✅ Actif
   - Polling automatique : ✅ Actif (2 min)

### Test 2 : Tester la synchronisation manuelle

1. Dans l'interface admin, cliquez sur "Synchroniser maintenant"
2. Vérifiez les statistiques :
   - RDV vérifiés
   - RDV annulés
   - Créneaux libérés

### Test 3 : Tester le scénario complet

1. **Créer un RDV** :
   - Accédez à la page de réservation
   - Sélectionnez un créneau disponible
   - Remplissez le formulaire et réservez
   - Vérifiez que le RDV apparaît sur Google Calendar

2. **Supprimer le RDV sur Google Calendar** :
   - Ouvrez Google Calendar
   - Trouvez le RDV créé (🏥 RDV - ...)
   - Supprimez l'événement

3. **Vérifier la synchronisation** :
   - Attendez max 2 minutes (ou forcez la synchro dans l'admin)
   - Retournez sur la page de réservation
   - Vérifiez que le créneau est à nouveau disponible

4. **Vérifier la base de données** :
   - Le RDV doit avoir le statut "cancelled"
   - Le créneau est libéré

### Test 4 : Vérifier les logs

Surveillez les logs Vercel pour :

```
[AutoSync] 🚀 Démarrage du polling automatique (toutes les 2 minutes)
[AutoSync] 🔄 Synchronisation des RDV supprimés...
[AutoSync] ✅ Synchronisation terminée: 1 RDV annulé, 1 créneau libéré

[BookingRouter] 🔄 Synchronisation automatique avant affichage des créneaux...
[BookingRouter] ✅ 1 RDV annulé, 1 créneau libéré
```

## 🔍 Dépannage

### Problème : "Google Calendar non connecté"

**Cause** : Variables d'environnement manquantes ou incorrectes

**Solution** :
1. Vérifiez dans Vercel Dashboard → Project → Settings → Environment Variables
2. Assurez-vous que ces variables sont définies :
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `GOOGLE_CALENDAR_ID`
3. Redéployez si vous avez modifié les variables

### Problème : "Polling automatique inactif"

**Cause** : Variable `NODE_ENV` non définie ou `ENABLE_AUTO_SYNC` à false

**Solution** :
1. Vérifiez `NODE_ENV=production` dans les variables d'environnement
2. Ou ajoutez `ENABLE_AUTO_SYNC=true`
3. Redéployez

### Problème : "Les créneaux ne se libèrent pas"

**Cause** : Synchronisation pas encore exécutée

**Solution** :
1. Attendez max 2 minutes (polling automatique)
2. Ou forcez la synchronisation via l'interface admin
3. Vérifiez les logs pour voir si la synchronisation s'est exécutée

### Problème : "Erreur lors de la vérification de disponibilité"

**Cause** : Clé privée Google mal formatée

**Solution** :
1. La clé privée doit contenir `\\n` (double backslash)
2. Exemple : `"-----BEGIN PRIVATE KEY-----\\nMIIEvQI...\\n-----END PRIVATE KEY-----\\n"`
3. Vérifiez que toute la clé est sur une seule ligne

## 📊 Surveillance en production

### Logs importants à surveiller

```bash
# Démarrage du polling
[AutoSync] 🚀 Démarrage du polling automatique (toutes les 2 minutes)

# Synchronisation réussie
[AutoSync] ✅ Synchronisation terminée: 2 RDV annulés, 2 créneaux libérés

# Synchronisation avec cache
[AutoSync] ✅ Cache valide, synchronisation ignorée

# Erreur
[AutoSync] ❌ Erreur synchronisation: [message d'erreur]
```

### Métriques à surveiller

1. **Fréquence de synchronisation** : Toutes les 2 minutes en production
2. **Taux de réussite** : Devrait être proche de 100%
3. **Nombre de RDV annulés** : Dépend de votre activité
4. **Temps de synchronisation** : Devrait être < 5 secondes

### Vercel Dashboard

1. Accédez à https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Onglet "Deployments" : Voir les déploiements récents
4. Onglet "Logs" : Voir les logs en temps réel
5. Onglet "Analytics" : Voir les performances

## 📝 Checklist de déploiement

Avant de déployer :

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Google Calendar partagé avec le Service Account
- [ ] API Google Calendar activée dans Google Cloud Console
- [ ] Base de données accessible depuis Vercel
- [ ] Build local réussi (`npm run build`)
- [ ] Tests locaux passés

Après déploiement :

- [ ] Service Google Calendar : Connecté
- [ ] Polling automatique : Actif
- [ ] Test de synchronisation manuelle réussi
- [ ] Test du scénario complet réussi
- [ ] Logs de production vérifiés
- [ ] Créneaux disponibles affichés correctement

## 🎉 Résultat attendu

Après un déploiement réussi :

✅ **Synchronisation automatique active** : Polling toutes les 2 minutes
✅ **Créneaux toujours à jour** : Synchronisation avant chaque affichage
✅ **Suppression détectée** : RDV supprimés sur Google Calendar annulés en BDD
✅ **Créneaux libérés** : Disponibles immédiatement pour réservation
✅ **Interface admin** : Contrôle total sur la synchronisation
✅ **Performance optimale** : Cache de 30 secondes, pas de sync répétées

---

**Date de création** : 2024-12-17  
**Version** : 1.0.0  
**URL de la PR** : https://github.com/doriansarry47-creator/planning/pull/45
