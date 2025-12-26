# 🔍 Guide de Diagnostic Google Calendar - Production Vercel

Ce guide vous aidera à résoudre le problème des créneaux Google Calendar qui ne s'affichent pas en production Vercel.

## 📋 Checklist de Diagnostic

### ✅ Étape 1: Vérifier les Variables d'Environnement

Les variables suivantes DOIVENT être configurées sur Vercel:

#### Variables REQUISES:

```bash
DATABASE_URL=postgresql://...                    # URL PostgreSQL (Neon)
GOOGLE_CALENDAR_ICAL_URL=https://calendar...    # URL iCal privée
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam...     # Email Service Account
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."  # Clé privée
GOOGLE_CALENDAR_ID=votre@email.com              # ID du calendrier
NODE_ENV=production
```

#### Variables OPTIONNELLES:

```bash
GOOGLE_CLIENT_ID=...                            # OAuth (optionnel)
GOOGLE_CLIENT_SECRET=...                        # OAuth (optionnel)
GOOGLE_REFRESH_TOKEN=...                        # OAuth (optionnel)
RESEND_API_KEY=...                              # Emails (optionnel)
APP_URL=https://votre-app.vercel.app            # URL prod
DEBUG_TOKEN=debug123                            # Pour /api/debug
```

### 🛠️ Vérification Locale

Exécutez ce script pour vérifier votre configuration locale:

```bash
npm install -g tsx
tsx scripts/verify-vercel-env.ts
```

Ce script va:
- ✅ Vérifier que toutes les variables requises sont définies
- ✅ Valider le format de chaque variable
- ✅ Tester l'accès à l'URL iCal
- ✅ Générer les commandes pour configurer Vercel

### 🚀 Configuration sur Vercel

#### Méthode 1: Dashboard Vercel (Recommandé)

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez chaque variable manuellement:
   - Name: `GOOGLE_CALENDAR_ICAL_URL`
   - Value: Coller la valeur depuis votre `.env`
   - Environment: **Production**
5. Répétez pour toutes les variables

⚠️ **ATTENTION pour `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`:**
- La clé doit contenir les caractères `\n` littéraux (pas de vrais sauts de ligne)
- Format: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`
- Inclure les guillemets doubles

#### Méthode 2: Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Lier le projet
vercel link

# Configurer les variables (depuis le fichier .env)
vercel env pull .env.production
```

Ou utiliser le script généré:

```bash
bash setup-vercel-env-auto.sh
```

### 🧪 Test en Production

Une fois les variables configurées, **redéployez**:

```bash
vercel --prod
```

Puis testez avec la route de diagnostic:

```bash
curl "https://votre-app.vercel.app/api/debug?token=debug123&test=all"
```

Ou ouvrez dans votre navigateur:
```
https://votre-app.vercel.app/api/debug?token=debug123&test=all
```

## 🔬 Tests Disponibles

La route `/api/debug` propose plusieurs tests:

### Test Complet
```
/api/debug?token=debug123&test=all
```

### Tests Individuels
```
/api/debug?token=debug123&test=env        # Variables d'environnement
/api/debug?token=debug123&test=ical       # Accès URL iCal
/api/debug?token=debug123&test=google     # Auth Google Calendar API
/api/debug?token=debug123&test=timezone   # Fuseau horaire serveur
/api/debug?token=debug123&test=db         # Connexion base de données
```

## 📊 Interprétation des Résultats

### ✅ Succès

```json
{
  "success": true,
  "message": "✅ Tous les tests sont passés avec succès",
  "results": [...]
}
```

→ Tout fonctionne ! Si les créneaux ne s'affichent toujours pas, vérifiez:
- Les événements dans Google Calendar ont "DISPONIBLE" dans le titre
- Les créneaux sont dans le futur
- Les créneaux ne sont pas déjà réservés

### ❌ Échec - Variables Manquantes

```json
{
  "test": "Environment Variables",
  "success": false,
  "message": "Variables manquantes: GOOGLE_CALENDAR_ICAL_URL ❌"
}
```

→ Configurez les variables manquantes sur Vercel et redéployez

### ❌ Échec - URL iCal Inaccessible

```json
{
  "test": "iCal URL Access",
  "success": false,
  "message": "Erreur lors de l'accès à l'URL iCal ❌",
  "error": "Request failed with status code 404"
}
```

**Solutions possibles:**

1. **URL iCal expirée ou invalide**
   - Régénérez l'URL iCal depuis Google Calendar:
     - Paramètres → Paramètres de mon calendrier → Intégrer le calendrier
     - Copiez l'URL de "Adresse privée au format iCal"

2. **Blocage CORS/Firewall**
   - Vercel peut bloquer certaines requêtes
   - Vérifiez que l'URL est accessible depuis un serveur (pas seulement votre PC)

3. **URL mal formatée**
   - L'URL doit commencer par `https://calendar.google.com/calendar/ical/`
   - Ne doit PAS contenir d'espaces ou caractères spéciaux non encodés

### ❌ Échec - Authentification Google

```json
{
  "test": "Google Calendar Auth",
  "success": false,
  "message": "Erreur d'authentification Google Calendar ❌",
  "error": "Invalid JWT Signature"
}
```

**Solutions:**

1. **Clé privée mal formatée**
   - Vérifiez que la clé contient bien `-----BEGIN PRIVATE KEY-----`
   - Les `\n` doivent être littéraux (pas de vrais sauts de ligne dans Vercel)
   - Utilisez des guillemets doubles autour de la valeur complète

2. **Service Account non autorisé**
   - Dans Google Calendar, partagez votre calendrier avec l'email du Service Account
   - Donnez les permissions "Apporter des modifications aux événements"

3. **API Google Calendar désactivée**
   - Allez sur [Google Cloud Console](https://console.cloud.google.com)
   - Activez "Google Calendar API"

## 🐛 Problèmes Courants

### Problème 1: "Aucun créneau disponible"

**Symptômes:** L'API fonctionne mais retourne `slots: {}`

**Causes possibles:**

1. **Aucun événement "DISPONIBLE" dans le calendrier**
   - Vérifiez que vos créneaux contiennent un de ces mots dans le titre:
     - "disponible", "available", "dispo", "libre", "free", "🟢"

2. **Tous les créneaux sont dans le passé**
   - Le backend filtre automatiquement les créneaux passés
   - Vérifiez le fuseau horaire du serveur avec `/api/debug?test=timezone`

3. **Créneaux déjà réservés**
   - Les créneaux marqués comme réservés sont filtrés
   - Mots-clés de réservation: "réservé", "rdv", "consultation", "🔴"

### Problème 2: Fuseau Horaire Incorrect

**Symptômes:** Les créneaux s'affichent aux mauvaises heures

**Solution:**

Le serveur Vercel est en UTC. Les conversions sont gérées automatiquement:
- Backend: Utilise `Europe/Paris` pour tout
- Les dates sont normalisées avec `date-fns-tz`

Vérifiez avec:
```
/api/debug?token=debug123&test=timezone
```

### Problème 3: Logs Vercel

Pour voir les logs en temps réel:

```bash
# Installer Vercel CLI
npm install -g vercel

# Voir les logs
vercel logs --follow

# Logs d'une fonction spécifique
vercel logs --follow api/trpc
```

Les logs montrent maintenant:
- ✅ Fetch iCal réussi avec durée
- 📋 Nombre d'événements
- 🔍 Analyse détaillée de chaque créneau
- ⚠️ Warnings si aucun créneau trouvé

## 🔄 Workflow de Résolution

1. **Vérifier localement**
   ```bash
   tsx scripts/verify-vercel-env.ts
   ```

2. **Configurer Vercel**
   - Dashboard ou CLI
   - Vérifier TOUTES les variables requises

3. **Redéployer**
   ```bash
   vercel --prod
   ```

4. **Tester l'API de debug**
   ```
   https://votre-app.vercel.app/api/debug?token=debug123&test=all
   ```

5. **Vérifier les logs**
   ```bash
   vercel logs --follow
   ```

6. **Tester les créneaux**
   ```bash
   curl "https://votre-app.vercel.app/api/trpc/booking.getAvailabilities" \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"startDate":"2024-12-26","endDate":"2025-01-26"}'
   ```

## 📝 Checklist Finale

Avant de contacter le support, vérifiez:

- [ ] Toutes les variables d'environnement sont configurées sur Vercel
- [ ] L'URL iCal est accessible (test avec curl ou `/api/debug`)
- [ ] Le Service Account est autorisé sur le calendrier Google
- [ ] L'API Google Calendar est activée sur Google Cloud
- [ ] Les événements "disponibles" existent dans le calendrier
- [ ] Les événements sont dans le futur
- [ ] Les logs Vercel ne montrent pas d'erreur
- [ ] Le test `/api/debug?test=all` passe avec succès

## 🆘 Support

Si le problème persiste après avoir suivi ce guide:

1. **Capturez les résultats de diagnostic:**
   ```bash
   curl "https://votre-app.vercel.app/api/debug?token=debug123&test=all" > diagnostic.json
   ```

2. **Capturez les logs:**
   ```bash
   vercel logs > vercel-logs.txt
   ```

3. **Partagez:**
   - Le fichier `diagnostic.json`
   - Les logs `vercel-logs.txt`
   - Votre configuration Google Calendar (captures d'écran)

## 🎯 Résumé

**Le problème le plus courant:** Variables d'environnement non configurées sur Vercel

**Solution rapide:**
1. Vérifiez avec `tsx scripts/verify-vercel-env.ts`
2. Configurez sur Vercel Dashboard
3. Redéployez avec `vercel --prod`
4. Testez avec `/api/debug?token=debug123&test=all`

**En cas de doute:** Suivez le workflow de résolution étape par étape ci-dessus.
