# 🔧 Correctifs Google Calendar - Debug Production Vercel

## 📝 Résumé des Changements

Ce commit ajoute des outils de diagnostic complets pour résoudre le problème des créneaux Google Calendar qui ne s'affichent pas en production Vercel.

## ✨ Nouveautés

### 1. Route API de Diagnostic (`/api/debug`)

Nouvelle route API complète pour tester tous les aspects de la configuration:

```
GET /api/debug?token=debug123&test=all
```

**Tests disponibles:**
- `test=env` - Vérifier les variables d'environnement
- `test=ical` - Tester l'accès à l'URL iCal
- `test=google` - Tester l'authentification Google Calendar API
- `test=timezone` - Vérifier le fuseau horaire du serveur
- `test=db` - Tester la connexion à la base de données
- `test=all` - Exécuter tous les tests

**Exemple de réponse:**

```json
{
  "success": true,
  "message": "✅ Tous les tests sont passés avec succès",
  "environment": {
    "nodeEnv": "production",
    "vercelEnv": "production",
    "region": "iad1"
  },
  "results": [
    {
      "test": "Environment Variables",
      "success": true,
      "message": "Toutes les variables d'environnement sont configurées ✅"
    },
    {
      "test": "iCal URL Access",
      "success": true,
      "message": "URL iCal accessible - 42 événements trouvés ✅",
      "details": {
        "availableEvents": 15,
        "bookedEvents": 8,
        "futureAvailable": 12
      }
    }
  ]
}
```

### 2. Script de Vérification Locale (`scripts/verify-vercel-env.ts`)

Script interactif pour vérifier et préparer la configuration:

```bash
npx tsx scripts/verify-vercel-env.ts
```

**Fonctionnalités:**
- ✅ Vérifie que toutes les variables requises sont définies
- ✅ Valide le format de chaque variable (URL, email, clés)
- ✅ Teste l'accès à l'URL iCal
- ✅ Génère les commandes Vercel CLI
- ✅ Crée un script bash auto-exécutable
- ✅ Fournit des recommandations claires

**Sortie:**

```
🔍 Vérification des variables d'environnement Vercel
================================================================================

✅ DATABASE_URL: OK (postgresql://...)
✅ GOOGLE_CALENDAR_ICAL_URL: OK (https://calendar.google.com/...)
✅ GOOGLE_SERVICE_ACCOUNT_EMAIL: planningadmin@...
✅ GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: OK ("-----BEGIN PRIVATE KEY-----\n...)
✅ GOOGLE_CALENDAR_ID: doriansarry47@gmail.com

✅ Toutes les variables requises sont correctement configurées

📝 Commandes pour configurer Vercel:
[Génère automatiquement les commandes vercel env add]

✅ Script shell généré: setup-vercel-env-auto.sh
🧪 Test de connexion iCal: ✅ URL iCal accessible (HTTP 200)
```

### 3. Logs Améliorés dans `/api/trpc.ts`

Ajout de logs détaillés pour faciliter le debugging:

**Avant:**
```javascript
console.log('[Vercel TRPC] Evenements total dans iCal:', count);
```

**Après:**
```javascript
console.log('[Vercel TRPC] 📅 Recuperation des disponibilites depuis iCal URL...');
console.log('[Vercel TRPC] 🌍 Environnement:', {
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  serverTime: new Date().toISOString(),
});
console.log('[Vercel TRPC] 🔗 iCal URL (tronqué):', icalUrl.substring(0, 50) + '...');
console.log('[Vercel TRPC] ✅ Fetch iCal réussi en', fetchDuration, 'ms');
console.log('[Vercel TRPC] 📋 Evenements total dans iCal:', Object.keys(events).length);

// Si aucun créneau trouvé
console.warn('[Vercel TRPC] ⚠️ AUCUN créneau disponible trouvé - Vérifier:');
console.warn('  1. Les événements iCal contiennent "disponible" ou "available"');
console.warn('  2. Les créneaux sont dans le futur');
console.warn('  3. Les créneaux ne sont pas déjà réservés');

// En cas d'erreur
console.error('[Vercel TRPC] ❌ Erreur:', error);
console.error('[Vercel TRPC] Type:', error.constructor.name);
console.error('[Vercel TRPC] Message:', error.message);
console.error('[Vercel TRPC] Stack:', error.stack);
```

### 4. Documentation Complète (`DIAGNOSTIC_GOOGLE_CALENDAR.md`)

Guide détaillé de diagnostic et résolution:

**Contenu:**
- ✅ Checklist de diagnostic étape par étape
- ✅ Configuration des variables d'environnement Vercel
- ✅ Tests disponibles et interprétation des résultats
- ✅ Problèmes courants et solutions
- ✅ Workflow de résolution complet
- ✅ Exemples de commandes curl pour tester
- ✅ Checklist finale avant de contacter le support

## 🚀 Utilisation

### En Développement Local

1. **Vérifier la configuration:**
   ```bash
   npx tsx scripts/verify-vercel-env.ts
   ```

2. **Tester localement:**
   ```bash
   npm run dev
   # Puis: curl "http://localhost:5173/api/debug?token=debug123&test=all"
   ```

### En Production Vercel

1. **Configurer les variables d'environnement:**
   
   **Option A - Dashboard Vercel:**
   - Settings → Environment Variables
   - Ajoutez chaque variable manuellement
   
   **Option B - Vercel CLI:**
   ```bash
   bash setup-vercel-env-auto.sh
   ```

2. **Redéployer:**
   ```bash
   vercel --prod
   ```

3. **Tester en production:**
   ```bash
   curl "https://votre-app.vercel.app/api/debug?token=debug123&test=all"
   ```

4. **Vérifier les logs:**
   ```bash
   vercel logs --follow
   ```

## 🔍 Diagnostic des Problèmes

### Problème: Variables d'environnement manquantes

**Symptômes:**
```json
{
  "test": "Environment Variables",
  "success": false,
  "message": "Variables manquantes: GOOGLE_CALENDAR_ICAL_URL ❌"
}
```

**Solution:**
1. Exécutez `npx tsx scripts/verify-vercel-env.ts`
2. Configurez les variables manquantes sur Vercel
3. Redéployez

### Problème: URL iCal inaccessible

**Symptômes:**
```json
{
  "test": "iCal URL Access",
  "success": false,
  "error": "Request failed with status code 404"
}
```

**Solutions:**
1. Régénérez l'URL iCal depuis Google Calendar
2. Vérifiez que l'URL n'a pas expiré
3. Testez l'URL avec curl: `curl -I "URL_ICAL"`

### Problème: Authentification Google échouée

**Symptômes:**
```json
{
  "test": "Google Calendar Auth",
  "success": false,
  "error": "Invalid JWT Signature"
}
```

**Solutions:**
1. Vérifiez le format de `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
2. La clé doit contenir `\n` littéraux (pas de vrais sauts de ligne)
3. Utilisez des guillemets doubles: `"-----BEGIN PRIVATE KEY-----\n..."`
4. Partagez le calendrier avec le Service Account

### Problème: Aucun créneau disponible

**Symptômes:**
- L'API fonctionne mais retourne `slots: {}`
- Tous les tests passent mais aucun créneau affiché

**Vérifications:**
1. Les événements contiennent "DISPONIBLE" ou "disponible" dans le titre
2. Les créneaux sont dans le futur (pas dans le passé)
3. Les créneaux ne sont pas déjà réservés
4. Le fuseau horaire est correct (Europe/Paris)

**Test:**
```bash
curl "https://votre-app.vercel.app/api/debug?token=debug123&test=ical"
```

Vérifiez `details.availableEvents` et `details.futureAvailable`

## 📊 Variables d'Environnement Requises

| Variable | Requis | Description |
|----------|--------|-------------|
| `DATABASE_URL` | ✅ | URL PostgreSQL (Neon) |
| `GOOGLE_CALENDAR_ICAL_URL` | ✅ | URL iCal privée Google Calendar |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | ✅ | Email du Service Account |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | ✅ | Clé privée (format PEM avec `\n`) |
| `GOOGLE_CALENDAR_ID` | ✅ | ID du calendrier (email) |
| `NODE_ENV` | ✅ | `production` |
| `DEBUG_TOKEN` | ⚠️ | Token pour `/api/debug` (défaut: `debug123`) |
| `GOOGLE_CLIENT_ID` | ❌ | OAuth (optionnel) |
| `GOOGLE_CLIENT_SECRET` | ❌ | OAuth (optionnel) |
| `GOOGLE_REFRESH_TOKEN` | ❌ | OAuth (optionnel) |
| `RESEND_API_KEY` | ❌ | Emails (optionnel) |
| `APP_URL` | ❌ | URL prod (optionnel) |

## 🎯 Checklist de Déploiement

Avant de déployer en production:

- [ ] Toutes les variables requises sont configurées localement (`.env`)
- [ ] Le script `verify-vercel-env.ts` passe sans erreur
- [ ] L'URL iCal est accessible (HTTP 200)
- [ ] Les variables sont configurées sur Vercel
- [ ] Le token `DEBUG_TOKEN` est défini sur Vercel
- [ ] Le déploiement est effectué: `vercel --prod`
- [ ] Le test `/api/debug?token=xxx&test=all` passe
- [ ] Les logs Vercel ne montrent pas d'erreur
- [ ] Les créneaux s'affichent correctement

## 📚 Fichiers Modifiés/Ajoutés

### Nouveaux Fichiers

- `api/debug.ts` - Route API de diagnostic complète
- `scripts/verify-vercel-env.ts` - Script de vérification locale
- `DIAGNOSTIC_GOOGLE_CALENDAR.md` - Documentation de diagnostic
- `FIXES_GOOGLE_CALENDAR_DEBUG.md` - Ce fichier (résumé des changements)

### Fichiers Modifiés

- `api/trpc.ts` - Ajout de logs détaillés dans `getAvailableSlotsFromIcal`

### Scripts Générés Automatiquement

- `setup-vercel-env-auto.sh` - Script bash pour configurer Vercel (généré par `verify-vercel-env.ts`)

## 🔗 Liens Utiles

- [Guide de diagnostic complet](./DIAGNOSTIC_GOOGLE_CALENDAR.md)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [Google Service Account](https://cloud.google.com/iam/docs/service-accounts)

## 🤝 Support

En cas de problème:

1. Lisez [DIAGNOSTIC_GOOGLE_CALENDAR.md](./DIAGNOSTIC_GOOGLE_CALENDAR.md)
2. Exécutez `npx tsx scripts/verify-vercel-env.ts`
3. Testez avec `/api/debug?token=debug123&test=all`
4. Capturez les logs: `vercel logs > logs.txt`
5. Partagez les résultats de diagnostic

## ✅ Tests Effectués

- ✅ Script `verify-vercel-env.ts` fonctionne localement
- ✅ Toutes les variables sont correctement validées
- ✅ URL iCal accessible (HTTP 200)
- ✅ Logs améliorés dans `api/trpc.ts`
- ✅ Documentation complète rédigée
- ✅ Commandes Vercel CLI générées correctement

## 🚧 Prochaines Étapes (Utilisateur)

1. **Configurer les variables sur Vercel:**
   ```bash
   bash setup-vercel-env-auto.sh
   # OU via le dashboard Vercel
   ```

2. **Déployer:**
   ```bash
   vercel --prod
   ```

3. **Tester:**
   ```bash
   curl "https://votre-app.vercel.app/api/debug?token=debug123&test=all"
   ```

4. **Vérifier les créneaux:**
   - Ouvrez l'application
   - Allez sur la page de réservation
   - Vérifiez que les créneaux s'affichent

5. **En cas de problème:**
   - Consultez [DIAGNOSTIC_GOOGLE_CALENDAR.md](./DIAGNOSTIC_GOOGLE_CALENDAR.md)
   - Vérifiez les logs: `vercel logs --follow`

---

**Auteur:** Claude (Assistant IA)  
**Date:** 2025-12-26  
**Version:** 1.0.0  
**Statut:** ✅ Prêt pour déploiement
