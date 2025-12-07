# Déploiement Vercel avec Google Service Account

## 🚀 Configuration Vercel

Pour déployer l'application avec l'intégration Google Service Account, vous devez configurer les variables d'environnement suivantes dans Vercel.

### Étape 1: Accéder aux paramètres du projet Vercel

1. Allez sur https://vercel.com
2. Sélectionnez votre projet
3. Cliquez sur "Settings"
4. Allez dans "Environment Variables"

### Étape 2: Ajouter les variables d'environnement

Copiez-collez les variables suivantes une par une:

#### Variables de base de données

```
DATABASE_URL
```
Valeur:
```
postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### Variables Google Service Account (OBLIGATOIRES)

```
GOOGLE_SERVICE_ACCOUNT_EMAIL
```
Valeur:
```
planningadmin@apaddicto.iam.gserviceaccount.com
```

```
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
```
⚠️ **IMPORTANT**: Collez exactement cette valeur (avec les guillemets et les \n):
```
"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC466s/UvpWfdv2\nkcCX2jzeshNKCPr2B0ZWLgK8rKOU1V8pShF1H5iZhLDxJohfbNrx8fR9cBTYEGD8\n8exLG14M92RtJ8J68TyO9YZg5+AggPMpBeQgyPI4YPyzArjV1KmNFpsocBpB1OLU\nD6VrS61LeGgKas9hk1OiwwtLjercBvESSE98474b//MCGHoA3LgjhuDGL8MrGjwI\n/EApDVyDd8Z8G8eV12Tu4kaXqFZjf1+/twUJhIwteLDYNmahW27XlgvQs8J1vNzA\nx+2Qr5NDWyaVAr0PPCDe/S+rXdTL3rXGA5zYiCg1MOOuCUtYPrihZv86Bg/7OfkC\nJeBlzccvAgMBAAECggEAWTJ0O+tOjYHQJDNR7u16BwFmhIOoahxANTmkYFX14ci6\nSjRMD27aMNLsdqXbigv74FCRWiBCLaZY4infjKr6xs5eRriy+pJ6X4rW8s9mMMeC\ngvswew/ypndB7ScW+S3HSyLoXK0WPULu1tNlO0gZoxnFNaEnvy1NXmkufZdK/i4X\n7SfDDfBtI/E0nKcEoNoYojoB3W6TW0x0ipo4qiSUU7EP8yxCo40Az1+s04boHWYU\nE2vHtx1qc+HH7S2Xe8KpgiouqDufUkC+1Wp2rvEeEf/b3fSjg7cSggzz8bHkYQIN\n4UgP2dWivBloxyFPKQ5E7OWqe+1t/OvrFpa5pzA5oQKBgQDx7Su4Dgv4TNdxXHUE\ngGxCii0G55Y6YC/uoEzu0vyiup/VWIp0ep6Ahq6IsY4jh+gHWKHBnQjC1dTNnZmd\naEB0v3ECFsL4Szdmi/0pcPxphCwBrkCpRdvARdK1FiJf0ziqiLNNc4G4jgv2LcGL\nVYLvxVWQssHDEjv57W4/dBdTfQKBgQDDrY1yO3jejeZz/p/aX7NWoQG1qLHSkXO2\nubWLBlYwLYqXR43oogLsRoJ8qpEM9K2FvYpexa8dx569HHFG9fhfBgHaUO/rMQgg\nFriXzJTmaM82zMZn8K4qsAoifE6ucehLzbzAfqsNMn8quBN7Yjc/8TMXxIWvl4JJ\n0rfzXkctGwKBgQDiXA9z/3CjuwI6R1AWDjM9bxwCQd4GcMlodQSG0VMgz42NiXLC\n2ZhEmb/kln1wMVGgzgVLqyrvYjPiz3tUFJ96nUWXtsRmnboQcRtHEziZYdnrGKfX\nuk2K8cndNgCjuHZk2dMqvNC7Ze07QkS9oh0JS5Jr+VXit8T2bHmjVXQd4QKBgFSd\nEIPr6Zk6/QL9gLwaE9+K4cVeu/4UvVevOCx0wgI1Py+pVljY7bCj0Lr9uplCmGIz\nksjmbJHRBvg5e1Y2+H6Gh3iS9RvbaOsPSCUD5wM3IRtOMyEw9u8ojklZPWC7irp0\nrYEDhQ3A3zJmxK3ey4tPzkshxLkoJ8OqZbbL9rUvAoGBAI+lcG08Ji7I+uTIyWy+\nH8+gHLRrkmaHGBrimuauduav/dMHbuOcAa6ctKgYL5HWfpZOJiN0mFgObO+qHVG2\n5vpBQGIaES555WGLcEK9I0HVW9TKtcnsL/s1mPr+4nVGN4Np8aLQy3GrShKJzEya\nAQr9mE9XwRq/DgmC1DQMJXBc\n-----END PRIVATE KEY-----\n"
```

```
GOOGLE_CALENDAR_ID
```
Valeur:
```
doriansarry47@gmail.com
```

#### Variables Google Calendar iCal (Fallback)

```
GOOGLE_CALENDAR_ICAL_URL
```
Valeur:
```
https://calendar.google.com/calendar/ical/doriansarry47%40gmail.com/private-2cf662f95113561ce5f879c3be6193c7/basic.ics
```

```
GOOGLE_CALENDAR_EMAIL
```
Valeur:
```
planningadmin@apaddicto.iam.gserviceaccount.com
```

#### Variables Google OAuth (Optionnelles)

```
GOOGLE_CLIENT_ID
```
Valeur:
```
603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com
```

```
GOOGLE_CLIENT_SECRET
```
Valeur:
```
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
```

```
GOOGLE_REDIRECT_URI
```
Valeur (à adapter selon votre domaine Vercel):
```
https://votre-app.vercel.app/oauth/callback
```

```
GOOGLE_REFRESH_TOKEN
```
Valeur:
```
1//036wt8eMutncaCgYIARAAGAMSNwF-L9IrYYVjwaU8Aom2Xu31hFufKfxX8TiMsCqa6Am8bdSzXUYk0hbKilAvYukmI47egIUWd5M
```

#### Variables API et Email

```
GOOGLE_API_KEY
```
Valeur:
```
AQ.Ab8RN6LlJ2_vSoax5RXbetblQX_QeoEDSQexk9_nFMB-OwS-Og
```

```
VITE_GOOGLE_CLIENT_ID
```
Valeur:
```
603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com
```

```
VITE_GOOGLE_API_KEY
```
Valeur:
```
AQ.Ab8RN6LlJ2_vSoax5RXbetblQX_QeoEDSQexk9_nFMB-OwS-Og
```

```
RESEND_API_KEY
```
Valeur:
```
re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd
```

```
APP_URL
```
Valeur (à adapter selon votre domaine Vercel):
```
https://votre-app.vercel.app
```

```
NODE_ENV
```
Valeur:
```
production
```

### Étape 3: Sélectionner les environnements

Pour chaque variable, sélectionnez:
- ✅ Production
- ✅ Preview
- ✅ Development

### Étape 4: Déployer

Une fois toutes les variables configurées:

1. Revenez à l'onglet "Deployments"
2. Cliquez sur "Redeploy" sur le dernier déploiement
3. Attendez que le déploiement se termine

### Étape 5: Vérifier le déploiement

Testez l'intégration Google Calendar:

```bash
curl "https://votre-app.vercel.app/api/trpc/booking.healthCheck?input=%7B%22json%22%3A%7B%7D%7D"
```

Réponse attendue:
```json
{
  "result": {
    "data": {
      "json": {
        "success": true,
        "oauth2Available": true,
        "icalAvailable": false,
        "timestamp": "2025-12-07T14:00:00.000Z"
      }
    }
  }
}
```

Si `oauth2Available` est `true`, l'intégration fonctionne correctement ! 🎉

## 🔧 Troubleshooting

### Problème: oauth2Available est false

**Solution**: Vérifiez que:
1. `GOOGLE_SERVICE_ACCOUNT_EMAIL` est correct
2. `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` contient les guillemets et les `\n`
3. Le Service Account a accès au calendrier `doriansarry47@gmail.com`

### Problème: Erreur "invalid_grant"

**Solution**: 
1. La clé privée est mal formatée
2. Assurez-vous que la clé commence par `"-----BEGIN PRIVATE KEY-----\n` et se termine par `\n-----END PRIVATE KEY-----\n"`
3. Les `\n` doivent être des caractères littéraux `\` suivis de `n`, pas des retours à la ligne réels

### Problème: Erreur "Permission denied"

**Solution**:
1. Allez sur Google Calendar
2. Cliquez sur les paramètres du calendrier `doriansarry47@gmail.com`
3. Dans "Partager avec des personnes spécifiques", ajoutez:
   - Email: `planningadmin@apaddicto.iam.gserviceaccount.com`
   - Permissions: "Apporter des modifications aux événements"

## 📊 Monitoring

Surveillez les logs Vercel pour voir les messages d'initialisation:

```
✅ Service Account JWT autorisé
✅ Google Calendar Service Account JWT initialisé avec succès
📍 Calendrier: doriansarry47@gmail.com
📍 Service Account: planningadmin@apaddicto.iam.gserviceaccount.com
```

## 🔐 Sécurité

- ✅ Les credentials sont stockés en tant que variables d'environnement (sécurisé)
- ✅ Le fichier `.env` n'est pas commité (dans `.gitignore`)
- ✅ Le Service Account a uniquement les permissions nécessaires
- ✅ Les logs ne montrent jamais la clé privée

## ✅ Checklist de déploiement

- [ ] Toutes les variables d'environnement sont configurées dans Vercel
- [ ] Le Service Account a accès au calendrier Google
- [ ] L'API Google Calendar est activée dans Google Cloud Console
- [ ] Le déploiement Vercel est réussi (pas d'erreurs)
- [ ] Le healthCheck retourne `oauth2Available: true`
- [ ] Les tests de réservation fonctionnent

## 📞 Support

En cas de problème, consultez:
- [GOOGLE_SERVICE_ACCOUNT_INTEGRATION.md](./GOOGLE_SERVICE_ACCOUNT_INTEGRATION.md)
- [GOOGLE_CALENDAR_SERVICE_ACCOUNT_SETUP.md](./GOOGLE_CALENDAR_SERVICE_ACCOUNT_SETUP.md)
- Les logs Vercel: `vercel logs --follow`
