# 🔐 Instructions de Configuration Vercel

## ✅ Corrections Effectuées

### Erreurs TypeScript (14 erreurs corrigées)
Toutes les erreurs TypeScript ont été corrigées dans les fichiers :
- `api/index.ts` (4 erreurs)
- `api/index-backup-20251123-052244.ts` (2 erreurs)
- `api/index-backup-20251123-053225.ts` (4 erreurs)
- `api/optimized-index.ts` (4 erreurs)

### Configuration Google Calendar OAuth2
L'application est maintenant configurée pour se connecter à votre Google Calendar : **doriansarry47@gmail.com**

## 📋 Étapes de Configuration Vercel

### 1. Accéder aux Variables d'Environnement

1. Connectez-vous à [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet **planning**
3. Allez dans **Settings** > **Environment Variables**

### 2. Ajouter les Variables Google Calendar

Copiez-collez ces variables **EXACTEMENT** comme indiqué :

```bash
# Google Calendar OAuth Configuration
GOOGLE_CLIENT_ID=603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALENDAR_EMAIL=doriansarry47@gmail.com
GOOGLE_REFRESH_TOKEN=1//036wt8eMutncaCgYIARAAGAMSNwF-L9IrYYVjwaU8Aom2Xu31hFufKfxX8TiMsCqa6Am8bdSzXUYk0hbKilAvYukmI47egIUWd5M
GOOGLE_REDIRECT_URI=https://votre-url-vercel.vercel.app/api/oauth/callback
```

**⚠️ IMPORTANT** : Remplacez `votre-url-vercel.vercel.app` par votre URL Vercel actuelle.

### 3. Ajouter les Variables Email (Resend)

```bash
RESEND_API_KEY=re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd
APP_URL=https://votre-url-vercel.vercel.app
```

**⚠️ IMPORTANT** : Remplacez `votre-url-vercel.vercel.app` par votre URL Vercel actuelle.

### 4. Configuration Optionnelle (Service Account)

Si vous souhaitez utiliser la méthode Service Account en plus de OAuth2 :

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=planningadmin@apaddicto.iam.gserviceaccount.com
```

### 5. Environnements à Configurer

Pour chaque variable, sélectionnez les environnements :
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

## 🔄 Redéploiement

Après avoir configuré les variables :

1. Allez dans l'onglet **Deployments**
2. Cliquez sur **Redeploy** pour le dernier déploiement
3. Ou mergez la Pull Request #32 qui déclenchera automatiquement un nouveau déploiement

## ✅ Vérification du Déploiement

### 1. Build TypeScript
Le build devrait maintenant passer **sans erreurs TypeScript**.

### 2. Test de l'API
Visitez : `https://votre-url-vercel.vercel.app/api/health`

Vous devriez voir :
```json
{
  "status": "ok",
  "timestamp": "2025-12-03T...",
  "googleCalendar": "initialized",
  "service": "Optimized Booking System",
  "version": "2.0"
}
```

### 3. Test Google Calendar
1. Visitez : `https://votre-url-vercel.vercel.app`
2. Choisissez une date
3. Les créneaux disponibles devraient s'afficher automatiquement depuis votre Google Calendar

## 🐛 Dépannage

### Problème : "googleCalendar": "not initialized"

**Solution** :
1. Vérifiez que toutes les variables d'environnement sont correctement configurées
2. Vérifiez que `GOOGLE_REDIRECT_URI` correspond exactement à votre URL Vercel
3. Redéployez l'application

### Problème : "Aucune disponibilité pour le moment"

**Causes possibles** :
1. Le refresh token n'est pas valide
2. Les permissions Google Calendar ne sont pas correctes
3. Le calendrier `doriansarry47@gmail.com` n'est pas accessible

**Solution** :
1. Générer un nouveau refresh token :
   - Visitez : `https://votre-url-vercel.vercel.app/api/oauth/init`
   - Autorisez l'accès au calendrier
   - Copiez le nouveau refresh token
   - Mettez à jour `GOOGLE_REFRESH_TOKEN` dans Vercel
   - Redéployez

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de déploiement Vercel
2. Vérifiez les logs d'exécution (Runtime Logs)
3. Assurez-vous que l'URL de redirection est configurée dans Google Cloud Console

## 🎯 Pull Request

La Pull Request avec toutes ces corrections est disponible ici :
**https://github.com/doriansarry47-creator/planning/pull/32**

---

✅ **Toutes les erreurs TypeScript sont corrigées**
✅ **Configuration Google Calendar prête**
✅ **Application prête pour le déploiement**
