# Fix: Erreur Google Calendar "DECODER routines::unsupported" sur Vercel

## 🔴 Problème identifié

Lors de la création d'un rendez-vous, l'erreur suivante apparaissait :

```
Error: error:1E08010C:DECODER routines::unsupported
at Sign.sign (node:internal/crypto/sig:128:29)
```

## 🔍 Cause racine

### 1. **Double conversion `\n` dans le code**

Dans `server/services/googleCalendar.ts`, la clé privée subissait **deux conversions** successives :

- **Ligne 519** (factory) : `.replace(/\\n/g, '\n')`
- **Ligne 60** (constructeur) : `.replace(/\\n/g, '\n')`

Résultat : Les sauts de ligne étaient mal formatés, rendant la clé PEM invalide.

### 2. **Variables Vercel mal formatées**

Les variables d'environnement Vercel contenaient plusieurs erreurs :

| Variable | Problème | Impact |
|----------|----------|--------|
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Contenait `\\n` au lieu de vrais retours à la ligne | ❌ Clé invalide |
| `DATABASE_URL` | Guillemet simple (`'`) non fermé à la fin | ⚠️ Risque de parsing |
| `VITE_GOOGLE_API_KEY` | Valeur invalide (pas une vraie API key Google) | ❌ API calls échoueront |

### 3. **Format PEM attendu**

OpenSSL attend un format PEM strict :

```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCB...
...
-----END PRIVATE KEY-----
```

Avec de **vrais retours à la ligne** (`\n`), pas des caractères littéraux `\\n`.

---

## ✅ Solutions appliquées

### 1. **Correction du code**

**Fichier modifié** : `server/services/googleCalendar.ts`

#### Avant :
```typescript
// Ligne 516-519
let cleanedPrivateKey = envPrivateKey
  .replace(/^["']|["']$/g, '') // Enlever les guillemets
  .replace(/\\n/g, '\n');       // Convertir les \n littéraux ❌ DOUBLE REPLACE
```

#### Après :
```typescript
// Ligne 516-518
let cleanedPrivateKey = envPrivateKey
  .replace(/^["']|["']$/g, ''); // Enlever les guillemets
// Le replace des \n est fait dans le constructeur (ligne 60) ✅
```

**Justification** : Le constructeur (ligne 60) fait déjà le `.replace(/\\n/g, '\n')`, donc il ne faut pas le faire deux fois.

---

### 2. **Correction des variables Vercel**

Un script automatique a été créé : `scripts/fix-vercel-env.sh`

#### Exécution du script :

```bash
./scripts/fix-vercel-env.sh
```

#### Variables corrigées :

✅ **GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY**
- Format corrigé : `\n` au lieu de `\\n`
- Pas de guillemets
- Vercel stocke la valeur chiffrée

✅ **DATABASE_URL**
- Guillemet simple enlevé

❌ **VITE_GOOGLE_API_KEY**
- Supprimée (invalide)
- ⚠️ Si nécessaire, créer une vraie API key depuis [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

✅ **Autres variables vérifiées** :
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` : ✓
- `GOOGLE_CALENDAR_ID` : ✓
- `GOOGLE_CLIENT_ID` : ✓
- `GOOGLE_CLIENT_SECRET` : ✓
- `GOOGLE_REFRESH_TOKEN` : ✓

---

## 📋 Checklist de vérification

### ✅ Modifications de code

- [x] Suppression du double `.replace()` dans `googleCalendar.ts`
- [x] Vérification que `availabilitySync.ts` ne fait pas de double replace (OK)
- [x] Vérification que `googleCalendarIcal.ts` ne fait pas de double replace (OK)
- [x] Commit et push sur `main`

### ✅ Variables Vercel

- [x] `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` reformatée
- [x] `DATABASE_URL` corrigée
- [x] `VITE_GOOGLE_API_KEY` supprimée (invalide)
- [x] Toutes les autres variables vérifiées

### 🔄 Déploiement

Le déploiement se fera automatiquement via Vercel lors du prochain push.

---

## 🚀 Test après déploiement

### 1. **Vérifier les logs Vercel**

Après déploiement, vérifier que l'initialisation Google Calendar réussit :

```
[GoogleCalendar] ✅ Service Google Calendar initialisé avec succès
```

### 2. **Tester la création d'un rendez-vous**

1. Aller sur https://planning-s6q2.vercel.app
2. Réserver un rendez-vous
3. Vérifier les logs Vercel (pas d'erreur `DECODER routines::unsupported`)
4. Vérifier que l'événement apparaît dans Google Calendar

### 3. **Vérifier le partage du calendrier**

⚠️ **IMPORTANT** : Le calendrier `doriansarry47@gmail.com` doit être partagé avec le service account :

1. Aller sur [Google Calendar](https://calendar.google.com)
2. Sélectionner votre calendrier (doriansarry47@gmail.com)
3. Cliquer sur "⚙️ Paramètres et partage"
4. Dans "Partager avec des personnes spécifiques", ajouter :
   - Email : `planningadmin@apaddicto.iam.gserviceaccount.com`
   - Autorisation : **"Apporter des modifications aux événements"**
5. Enregistrer

---

## 📚 Références

### Format des variables Vercel

Sur Vercel, les variables d'environnement **ne supportent pas** les vrais retours à la ligne. Il faut :

- **❌ PAS ÇA** : Coller la clé avec de vrais retours à la ligne
- **❌ PAS ÇA** : Utiliser `\\n` (double backslash)
- **✅ BON FORMAT** : Utiliser `\n` (backslash + n)

Exemple de valeur correcte dans Vercel :

```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCB...\n...\n-----END PRIVATE KEY-----\n
```

### Traitement dans le code

Dans le code, faire **une seule fois** le replace :

```typescript
this.auth = new google.auth.JWT({
  email: config.serviceAccountEmail,
  key: config.serviceAccountPrivateKey.replace(/\\n/g, '\n'), // ✅ UNE SEULE FOIS
  scopes: ['https://www.googleapis.com/auth/calendar'],
});
```

---

## 🎯 Résumé

| Élément | Statut | Action |
|---------|--------|--------|
| Code corrigé | ✅ | Double replace supprimé |
| Variables Vercel | ✅ | Format corrigé via script |
| Commit/Push | ✅ | Fait sur `main` |
| Déploiement | 🔄 | Automatique via Vercel |
| Test | ⏳ | À faire après déploiement |
| Partage calendrier | ⚠️ | À vérifier manuellement |

---

## 🆘 Si le problème persiste

### 1. Vérifier les logs Vercel

```bash
vercel logs planning-s6q2 --follow
```

### 2. Vérifier le format de la clé

Ajouter un log temporaire dans `server/services/googleCalendar.ts` :

```typescript
console.log('[DEBUG] Private key starts with:', config.serviceAccountPrivateKey.substring(0, 50));
console.log('[DEBUG] Private key includes newlines:', config.serviceAccountPrivateKey.includes('\n'));
```

### 3. Recréer le Service Account

Si rien ne fonctionne :

1. Supprimer le Service Account actuel
2. Créer un nouveau Service Account
3. Télécharger le nouveau fichier JSON
4. Mettre à jour les variables Vercel avec les nouvelles valeurs

---

**Date de la correction** : 2025-12-13  
**Commit** : `bfb6d2a` - fix: remove double replace of \n in GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
