# 🚀 Configuration Refresh Token dans Vercel

## Étapes de configuration

### 1. Dashboard Vercel
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet **planning**
3. Cliquez sur **Settings** → **Environment Variables**

### 2. Ajouter la variable d'environnement
4. Cliquez sur **Add New** → **Environment Variable**
5. Remplissez les champs :
   - **Name**: `GOOGLE_REFRESH_TOKEN`
   - **Value**: `1//036wt8eMutncaCgYIARAAGAMSNwF-L9IrYYVjwaU8Aom2Xu31hFufKfxX8TiMsCqa6Am8bdSzXUYk0hbKilAvYukmI47egIUWd5M`
   - **Environments**: Sélectionnez **Production**, **Preview**, et **Development**

### 3. Redéployer
6. Cliquez sur **Save**
7. Allez dans l'onglet **Deployments**
8. Cliquez sur le bouton **Redeploy** sur le déploiement le plus récent

## 🔗 URLs de test après configuration

- **Page principale**: https://planning-7qkb7uw7v-ikips-projects.vercel.app
- **Réservation patient**: https://planning-7qkb7uw7v-ikips-projects.vercel.app/book-appointment
- **Diagnostic API**: https://planning-7qkb7uw7v-ikips-projects.vercel.app/diagnostic-api-booking.html
- **Health Check**: https://planning-7qkb7uw7v-ikips-projects.vercel.app/api/health

## ✅ Vérification du bon fonctionnement

Après la configuration, vérifiez que :
1. Les créneaux de rendez-vous sont visibles sur la page patient
2. La sélection de date ne grise plus tous les jours
3. L'API health check retourne `"googleCalendar": "initialized"`

## 🔧 En cas de problème

Si les créneaux ne s'affichent toujours pas :
1. Vérifiez les logs Vercel dans l'onglet **Functions**
2. Testez l'endpoint `/api/health`
3. Consultez le diagnostic : `/diagnostic-api-booking.html`