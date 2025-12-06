# 🔑 Obtenir votre Refresh Token Google OAuth2

## ⚡ Méthode Rapide (1 minute)

### Option 1: URL d'Autorisation Directe

1. **Cliquez sur ce lien** (remplacez YOUR_CLIENT_ID si nécessaire) :
   
   ```
   https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/calendar&access_type=offline&include_granted_scopes=true&response_type=code&redirect_uri=https%3A//planning-7qkb7uw7v-ikips-projects.vercel.app/api/oauth/callback&client_id=603850749287-8c0hrol8l5gulsal23mna3raeolmd2l2.apps.googleusercontent.com&prompt=consent&state=calendar_auth
   ```

2. **Connectez-vous** avec le compte `doriansarry47@gmail.com`

3. **Autorisez** l'accès au calendrier

4. **Google vous redirige** vers une URL qui contient un `code`

5. **Copiez ce code** depuis l'URL (tout ce qui est après `code=` et avant `&`)

### Option 2: Page Interactive de Diagnostic

**Utilisez cette page** : https://planning-7qkb7uw7v-ikips-projects.vercel.app/get-google-refresh-token.html

Cette page vous guide étape par étape pour :
- Générer l'URL d'autorisation
- Obtenir le refresh token
- Configurer dans Vercel

## 🔧 Configuration dans Vercel

Une fois le refresh token obtenu :

1. **Allez sur** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Sélectionnez** : `planning-7qkb7uw7v-ikips-projects`
3. **Settings** → **Environment Variables**
4. **Ajoutez** :
   - **Nom** : `GOOGLE_REFRESH_TOKEN`
   - **Valeur** : Votre refresh token
5. **Save** et **redéployez**

## ✅ Test Final

Après configuration, testez :
- **Page patient** : https://planning-7qkb7uw7v-ikips-projects.vercel.app/book-appointment
- **API de santé** : https://planning-7qkb7uw7v-ikips-projects.vercel.app/api/health

## 📋 Résultat Attendu

✅ **Avant** : Page patient montre "Chargement des disponibilités..." avec dates grisées  
✅ **Après** : Les dates 15, 16, 18, 19 novembre sont actives avec créneaux à 17:30 visibles

## 🆘 Si Problèmes

1. **Refresh token non reçu** : Réessayez avec `prompt=consent`
2. **Erreur 404 API** : Attendez 2-3 minutes après le redéploiement Vercel
3. **Token invalide** : Vérifiez que c'est bien `doriansarry47@gmail.com`

## 📞 Support

Si vous rencontrez des difficultés, utilisez :
- La page de diagnostic interactive
- Le script Python fourni (`get_refresh_token.py`)
- Vérifiez l'API health : `/api/health`

**Le système sera fonctionnel dès que `GOOGLE_REFRESH_TOKEN` sera configuré dans Vercel.**