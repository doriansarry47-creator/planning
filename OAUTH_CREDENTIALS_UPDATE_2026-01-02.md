# 🔧 Mise à jour des credentials Google OAuth2
**Date:** 2026-01-02  
**Raison:** Fix de l'erreur `deleted_client` lors de l'accès à l'API Google Calendar

---

## 🚨 Problème identifié

L'application rencontrait l'erreur suivante lors de la récupération des disponibilités:

```
[Vercel TRPC OAuth2] ❌ Erreur lors de la récupération des événements: deleted_client
[Vercel TRPC OAuth2] ⚠️ Aucun événement récupéré depuis Google Calendar
[Vercel TRPC OAuth2] 🎯 RÉSULTAT FINAL: 0 créneaux bookables trouvés
```

**Cause:** Les anciennes credentials OAuth2 ont été supprimées ou révoquées dans la Google Cloud Console.

---

## ✅ Solution appliquée

### 1. Nouvelles credentials générées

De nouvelles credentials OAuth2 ont été créées dans Google Cloud Console:

| Variable | Ancienne valeur | Nouvelle valeur |
|----------|----------------|-----------------|
| `GOOGLE_CLIENT_ID` | `603850749287-208mpcdm3pb...` | `603850749287-hfhpia7cd34s...` |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-wrcPJ8Etp1Tz...` | `GOCSPX-4QnkYR_aWaSDze...` |
| `GOOGLE_REFRESH_TOKEN` | `1//036wt8eMutncaCgYI...` | `1//03FMgG83B75DkCgYI...` |

### 2. Valeurs des nouvelles credentials

⚠️ **Les nouvelles credentials sont déjà configurées dans le fichier `.env` local.**

Pour les déployer sur Vercel, utilisez le script automatique ou suivez les instructions manuelles ci-dessous.

### 3. Scopes OAuth2 requis

Assurez-vous que les scopes suivants sont configurés:

```
https://www.googleapis.com/auth/calendar.readonly
```

Ou si vous avez besoin d'écrire dans le calendrier:

```
https://www.googleapis.com/auth/calendar
```

### 4. Configuration du Redirect URI

```
Production: https://ton-app.vercel.app/api/oauth2callback
Local: http://localhost:3000/oauth2callback
```

---

## 📝 Fichiers modifiés

### `.env`

```diff
- GOOGLE_CLIENT_ID=603850749287-XXXXXXXX...
+ GOOGLE_CLIENT_ID=603850749287-YYYYYYYY... (nouvelle valeur)

- GOOGLE_CLIENT_SECRET=GOCSPX-XXXXXXXX...
+ GOOGLE_CLIENT_SECRET=GOCSPX-YYYYYYYY... (nouvelle valeur)

- GOOGLE_REFRESH_TOKEN=1//03XXXXXXXX...
+ GOOGLE_REFRESH_TOKEN=1//03YYYYYYYY... (nouvelle valeur)

- VITE_GOOGLE_CLIENT_ID=603850749287-XXXXXXXX...
+ VITE_GOOGLE_CLIENT_ID=603850749287-YYYYYYYY... (nouvelle valeur)
```

⚠️ **Note:** Les valeurs réelles sont stockées localement dans `.env` (protégé par `.gitignore`)

---

## 🚀 Déploiement sur Vercel

### Option 1: Script automatique

Un script de mise à jour automatique a été créé:

```bash
chmod +x update-oauth-vercel-2026-01-02.sh
./update-oauth-vercel-2026-01-02.sh
```

### Option 2: Mise à jour manuelle via Vercel CLI

```bash
# 1. Lire les valeurs depuis le fichier .env local
source .env

# 2. Supprimer et recréer GOOGLE_CLIENT_ID
vercel env rm GOOGLE_CLIENT_ID production --yes
echo "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID production

# 3. Supprimer et recréer GOOGLE_CLIENT_SECRET
vercel env rm GOOGLE_CLIENT_SECRET production --yes
echo "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production

# 4. Supprimer et recréer GOOGLE_REFRESH_TOKEN
vercel env rm GOOGLE_REFRESH_TOKEN production --yes
echo "$GOOGLE_REFRESH_TOKEN" | vercel env add GOOGLE_REFRESH_TOKEN production

# 5. Supprimer et recréer VITE_GOOGLE_CLIENT_ID (frontend)
vercel env rm VITE_GOOGLE_CLIENT_ID production --yes
echo "$VITE_GOOGLE_CLIENT_ID" | vercel env add VITE_GOOGLE_CLIENT_ID production

# 6. Redéployer
vercel --prod
```

**Alternative:** Utilisez le script automatique `./update-oauth-vercel-2026-01-02.sh` qui fait tout cela automatiquement.

### Option 3: Via l'interface Vercel Dashboard

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings** → **Environment Variables**
4. Mettre à jour les 4 variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `VITE_GOOGLE_CLIENT_ID`
5. Redéployer le projet

---

## ✅ Vérification post-déploiement

Après le redéploiement, vérifiez que:

1. **Les logs ne montrent plus l'erreur `deleted_client`**
   ```
   [Vercel TRPC OAuth2] ✅ Client OAuth2 initialisé avec succès
   [Vercel TRPC OAuth2] 📅 Récupération des événements Google Calendar...
   [Vercel TRPC OAuth2] ✅ X événements récupérés
   ```

2. **Les créneaux disponibles s'affichent correctement**
   ```
   [Vercel TRPC OAuth2] 🎯 RÉSULTAT FINAL: X créneaux bookables trouvés
   ```

3. **Les utilisateurs peuvent réserver des rendez-vous**

---

## 📊 Impact

### Avant la mise à jour
- ❌ `deleted_client` error
- ❌ 0 créneaux disponibles
- ❌ Impossibilité de réserver

### Après la mise à jour
- ✅ Client OAuth2 initialisé avec succès
- ✅ Événements Google Calendar récupérés
- ✅ Créneaux disponibles visibles
- ✅ Réservations fonctionnelles

---

## 🔒 Sécurité

⚠️ **IMPORTANT**: Ces credentials sont sensibles et ne doivent **JAMAIS** être commitées dans Git.

Le fichier `.env` est déjà dans `.gitignore`, mais assurez-vous que:
- Les credentials ne sont jamais hardcodées dans le code
- Les variables d'environnement sont utilisées partout
- Le fichier `.env` reste privé

---

## 📞 Support

Si vous rencontrez des problèmes après la mise à jour:

1. Vérifiez les logs Vercel: `vercel logs`
2. Vérifiez les variables d'environnement: `vercel env ls`
3. Assurez-vous que les scopes OAuth2 sont corrects dans Google Cloud Console
4. Vérifiez que le Calendar ID est correct: `GOOGLE_CALENDAR_ID=doriansarry47@gmail.com`

---

## 📚 Références

- [Google Calendar API - OAuth 2.0](https://developers.google.com/calendar/api/guides/auth)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

---

**Commit associé:** `fix: update Google OAuth2 credentials to fix deleted_client error`  
**Date de mise à jour:** 2026-01-02
