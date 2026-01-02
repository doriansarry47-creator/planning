# 🔐 Mise à jour des Credentials OAuth2 Google Calendar

## 📋 Problème Résolu

L'erreur `deleted_client` lors de l'accès à Google Calendar API a été résolue en mettant à jour les credentials OAuth2.

### Symptômes
```
[Vercel TRPC OAuth2] ❌ Erreur lors de la récupération des événements: deleted_client
⚠️ Aucun événement récupéré depuis Google Calendar
```

## ✅ Solution Appliquée

### 1. Nouvelles Credentials OAuth2

Les anciennes credentials ont été remplacées par les nouvelles :

**Anciennes credentials (supprimées)** :
- Client ID: `603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com`

**Nouvelles credentials (actives)** :
- **Client ID**: `603850749287-hfhpia7c***kie4crp6r6uhgmbemdk7.apps.googleusercontent.com` (masqué pour sécurité)
- **Client Secret**: `GOCSPX-4QnkYR_***aSDzeV5DWtDVLe8OSI5` (masqué pour sécurité)
- **Refresh Token**: `1//03FMgG83B75***[TOKEN_MASQUÉ]***4KCrV20E` (masqué pour sécurité)
- **Redirect URI**: `http://localhost:3000/oauth2callback`
- **Calendar ID**: `doriansarry47@gmail.com`

### 2. Variables d'Environnement Mises à Jour

Les variables suivantes ont été mises à jour sur Vercel :

```bash
GOOGLE_CLIENT_ID=603850749287-hfhpia7c***[MASKED]
GOOGLE_CLIENT_SECRET=GOCSPX-4Qn***[MASKED]
GOOGLE_REFRESH_TOKEN=1//03FMg***[MASKED]
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GOOGLE_CALENDAR_ID=doriansarry47@gmail.com
VITE_GOOGLE_CLIENT_ID=603850749287-hfhpia7c***[MASKED]
```

⚠️ **Note** : Les valeurs réelles des credentials sont configurées sur Vercel et ne doivent jamais être exposées publiquement.

### 3. Script de Mise à Jour

Un script automatisé a été utilisé pour mettre à jour les variables :

```bash
VERCEL_TOKEN="AifGaSeceQ8k5D75qjyRAjKZ" ./update-vercel-env-new-oauth.sh
```

**Résultat** :
```
✅ Variables configurées avec succès: 6
❌ Variables échouées: 0
```

## 🚀 Déploiement

Pour appliquer les changements, Vercel doit redéployer l'application. Vous pouvez :

1. **Déclencher un redéploiement automatique** en pushant un commit
2. **Redéployer manuellement** depuis le dashboard Vercel
3. **Attendre le prochain déploiement automatique**

## 🔍 Vérification

Après le déploiement, vérifiez que l'application peut accéder à Google Calendar :

1. Accédez à votre application sur Vercel
2. Essayez de récupérer les disponibilités
3. Vérifiez les logs Vercel pour confirmer l'absence d'erreur `deleted_client`

### Logs attendus après correction

```
[Vercel TRPC OAuth2] ✅ Client OAuth2 initialisé avec succès
[GoogleCalendarOAuth2] ✅ Access token valide obtenu
[GoogleCalendarOAuth2] ✅ X événements actifs récupérés
```

## 📝 Notes Importantes

1. **Sécurité** : Les credentials OAuth2 sont sensibles et ne doivent JAMAIS être committées dans Git
2. **Refresh Token** : Le refresh token permet d'obtenir automatiquement de nouveaux access tokens
3. **Expiration** : Les access tokens expirent, mais le refresh token reste valide (sauf révocation manuelle)
4. **Service** : L'application utilise le service `GoogleCalendarOAuth2Service` pour gérer l'authentification

## 🔗 Ressources

- [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 📅 Historique

- **2026-01-02** : Mise à jour des credentials OAuth2 pour résoudre l'erreur `deleted_client`
- **2026-01-02** : Installation de la dépendance manquante `node-ical`

## 🆘 Troubleshooting

### Problème : Erreur `deleted_client` persiste

**Solution** :
1. Vérifiez que les nouvelles credentials sont bien configurées sur Vercel
2. Redéployez l'application pour forcer la lecture des nouvelles variables
3. Vérifiez que le projet Google Cloud est actif

### Problème : Erreur `invalid_grant`

**Solution** :
1. Le refresh token a peut-être expiré ou été révoqué
2. Générez un nouveau refresh token via le script `get-refresh-token.ts`
3. Mettez à jour la variable `GOOGLE_REFRESH_TOKEN` sur Vercel

### Problème : Aucun événement récupéré

**Solution** :
1. Vérifiez que `GOOGLE_CALENDAR_ID` correspond bien à votre calendrier
2. Vérifiez que le compte Google a bien accès au calendrier
3. Vérifiez que l'API Google Calendar est activée dans Google Cloud Console

## ✅ Checklist de Vérification

- [x] Dépendance `node-ical` installée
- [x] Nouvelles credentials OAuth2 configurées dans `.env` local
- [x] Variables d'environnement mises à jour sur Vercel (6/6)
- [ ] Application redéployée sur Vercel
- [ ] Tests de récupération des disponibilités réussis
- [ ] Logs Vercel vérifiés (pas d'erreur `deleted_client`)

---

**Auteur** : Claude AI Assistant  
**Date** : 2026-01-02  
**Status** : ✅ Configuration terminée, en attente de redéploiement
