# 🚨 SOLUTION RAPIDE - API Routes Non Accessibles

## 📋 **Situation actuelle :**
✅ Google Calendar OAuth2 : FONCTIONNE  
✅ Health Check : FONCTIONNE  
❌ Routes TRPC : 404 Not Found  
❌ Routes OAuth : 404 Not Found  

## 🔧 **Solution Immédiate :**

### Option 1: Redéploiement Force depuis Vercel
1. **Dashboard Vercel** → Projet 'planning'
2. **Deployments** → **Redeploy** (bouton sur le dernier déploiement)
3. Attendre le rebuild complet

### Option 2: Configuration manuelle du refresh token
Assurez-vous que dans **Vercel Settings** → **Environment Variables** :
- `GOOGLE_REFRESH_TOKEN` = `1//036wt8eMutncaCgYIARAAGAMSNwF-L9IrYYVjwaU8Aom2Xu31hFufKfxX8TiMsCqa6Am8bdSzXUYk0hbKilAvYukmI47egIUWd5M`

## 🧪 **Tests à effectuer après redéploiement :**

1. **Health Check** : `GET https://planning-7qkb7uw7v-ikips-projects.vercel.app/api/health`
   - Doit retourner : `{"status":"ok","googleCalendar":"initialized"}`

2. **TRPC Endpoint** : `POST https://planning-7qkb7uw7v-ikips-projects.vercel.app/api/trpc/booking.getAvailableSlots`
   - Payload : `{"input": {"date": "2025-12-08"}}`
   - Doit retourner les créneaux disponibles

3. **Page Patient** : `https://planning-7qkb7uw7v-ikips-projects.vercel.app/book-appointment`
   - Doit afficher les créneaux de rendez-vous

## 📞 **En cas de problème persistant :**

Si après redéploiement les routes TRPC ne sont toujours pas accessibles, le problème peut être lié à :
1. Configuration Vercel incorrecte
2. Cache de déploiement non vidé
3. Version du fichier API non synchronisée

**Contactez-moi avec :**
- Les logs d'erreur Vercel
- Le résultat du health check après redéploiement
- Les détails de l'erreur TRPC