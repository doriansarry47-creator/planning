# 🚀 Quick Start - Déploiement Vercel

## Étape Rapide: Configurer Vercel en 5 Minutes

### 1. Se connecter à Vercel

Allez sur: https://vercel.com/doriansarry47-creator/planning/settings/environment-variables

### 2. Copier-Coller ces Variables

Cliquez sur "Add New" pour chaque variable ci-dessous:

#### Variables OBLIGATOIRES (4 variables minimum)

**Variable 1**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
```
planningadmin@apaddicto.iam.gserviceaccount.com
```

**Variable 2**: `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
```
"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC466s/UvpWfdv2\nkcCX2jzeshNKCPr2B0ZWLgK8rKOU1V8pShF1H5iZhLDxJohfbNrx8fR9cBTYEGD8\n8exLG14M92RtJ8J68TyO9YZg5+AggPMpBeQgyPI4YPyzArjV1KmNFpsocBpB1OLU\nD6VrS61LeGgKas9hk1OiwwtLjercBvESSE98474b//MCGHoA3LgjhuDGL8MrGjwI\n/EApDVyDd8Z8G8eV12Tu4kaXqFZjf1+/twUJhIwteLDYNmahW27XlgvQs8J1vNzA\nx+2Qr5NDWyaVAr0PPCDe/S+rXdTL3rXGA5zYiCg1MOOuCUtYPrihZv86Bg/7OfkC\nJeBlzccvAgMBAAECggEAWTJ0O+tOjYHQJDNR7u16BwFmhIOoahxANTmkYFX14ci6\nSjRMD27aMNLsdqXbigv74FCRWiBCLaZY4infjKr6xs5eRriy+pJ6X4rW8s9mMMeC\ngvswew/ypndB7ScW+S3HSyLoXK0WPULu1tNlO0gZoxnFNaEnvy1NXmkufZdK/i4X\n7SfDDfBtI/E0nKcEoNoYojoB3W6TW0x0ipo4qiSUU7EP8yxCo40Az1+s04boHWYU\nE2vHtx1qc+HH7S2Xe8KpgiouqDufUkC+1Wp2rvEeEf/b3fSjg7cSggzz8bHkYQIN\n4UgP2dWivBloxyFPKQ5E7OWqe+1t/OvrFpa5pzA5oQKBgQDx7Su4Dgv4TNdxXHUE\ngGxCii0G55Y6YC/uoEzu0vyiup/VWIp0ep6Ahq6IsY4jh+gHWKHBnQjC1dTNnZmd\naEB0v3ECFsL4Szdmi/0pcPxphCwBrkCpRdvARdK1FiJf0ziqiLNNc4G4jgv2LcGL\nVYLvxVWQssHDEjv57W4/dBdTfQKBgQDDrY1yO3jejeZz/p/aX7NWoQG1qLHSkXO2\nubWLBlYwLYqXR43oogLsRoJ8qpEM9K2FvYpexa8dx569HHFG9fhfBgHaUO/rMQgg\nFriXzJTmaM82zMZn8K4qsAoifE6ucehLzbzAfqsNMn8quBN7Yjc/8TMXxIWvl4JJ\n0rfzXkctGwKBgQDiXA9z/3CjuwI6R1AWDjM9bxwCQd4GcMlodQSG0VMgz42NiXLC\n2ZhEmb/kln1wMVGgzgVLqyrvYjPiz3tUFJ96nUWXtsRmnboQcRtHEziZYdnrGKfX\nuk2K8cndNgCjuHZk2dMqvNC7Ze07QkS9oh0JS5Jr+VXit8T2bHmjVXQd4QKBgFSd\nEIPr6Zk6/QL9gLwaE9+K4cVeu/4UvVevOCx0wgI1Py+pVljY7bCj0Lr9uplCmGIz\nksjmbJHRBvg5e1Y2+H6Gh3iS9RvbaOsPSCUD5wM3IRtOMyEw9u8ojklZPWC7irp0\nrYEDhQ3A3zJmxK3ey4tPzkshxLkoJ8OqZbbL9rUvAoGBAI+lcG08Ji7I+uTIyWy+\nH8+gHLRrkmaHGBrimuauduav/dMHbuOcAa6ctKgYL5HWfpZOJiN0mFgObO+qHVG2\n5vpBQGIaES555WGLcEK9I0HVW9TKtcnsL/s1mPr+4nVGN4Np8aLQy3GrShKJzEya\nAQr9mE9XwRq/DgmC1DQMJXBc\n-----END PRIVATE KEY-----\n"
```
⚠️ **IMPORTANT**: Copier toute la valeur avec les guillemets et les `\n`

**Variable 3**: `GOOGLE_CALENDAR_ID`
```
doriansarry47@gmail.com
```

**Variable 4**: `DATABASE_URL`
```
postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### Variables Recommandées

**Variable 5**: `RESEND_API_KEY` (pour les emails)
```
re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd
```

**Variable 6**: `APP_URL` (adapter à votre URL Vercel)
```
https://webapp-frtjapec0-ikips-projects.vercel.app
```

**Variable 7**: `NODE_ENV`
```
production
```

### 3. Sélectionner les Environnements

Pour CHAQUE variable, cochez:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 4. Redéployer

1. Allez dans l'onglet "Deployments"
2. Cliquez sur les 3 points (...) du dernier déploiement
3. Cliquez sur "Redeploy"
4. Attendez ~2 minutes

### 5. Vérifier que ça Marche

Ouvrez cette URL (remplacez par votre domaine Vercel):
```
https://webapp-frtjapec0-ikips-projects.vercel.app/api/trpc/booking.healthCheck?input=%7B%22json%22%3A%7B%7D%7D
```

Vous devriez voir:
```json
{
  "result": {
    "data": {
      "json": {
        "success": true,
        "oauth2Available": true,
        ...
      }
    }
  }
}
```

Si `oauth2Available` est `true` → ✅ **C'est bon !**

## 🆘 En cas de problème

### Si oauth2Available est false

1. Vérifiez que `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` contient bien les guillemets au début et à la fin
2. Vérifiez que les `\n` sont bien présents (pas des vraies nouvelles lignes)
3. Allez sur Google Calendar et partagez `doriansarry47@gmail.com` avec `planningadmin@apaddicto.iam.gserviceaccount.com`

### Si erreur "invalid_grant"

La clé privée est mal formatée. Elle doit commencer par:
```
"-----BEGIN PRIVATE KEY-----\n
```
Et finir par:
```
\n-----END PRIVATE KEY-----\n"
```

### Autres problèmes

Consultez les logs Vercel:
```bash
vercel logs --follow
```

Ou lisez la documentation complète:
- [VERCEL_DEPLOYMENT_GOOGLE_SA.md](./VERCEL_DEPLOYMENT_GOOGLE_SA.md)
- [INTEGRATION_COMPLETE_SUMMARY.md](./INTEGRATION_COMPLETE_SUMMARY.md)

## ✅ C'est Tout !

Une fois le déploiement terminé et le healthCheck validé, votre intégration Google Calendar est opérationnelle ! 🎉

Les rendez-vous seront automatiquement synchronisés avec votre Google Calendar.
