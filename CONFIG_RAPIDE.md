# 🚀 Configuration Rapide Google Calendar

## ✅ Votre clé API est déjà intégrée

Votre clé `d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939` a été ajoutée au fichier `.env` comme **VITE_GOOGLE_API_KEY**.

## ❌ Ce qui manque : OAuth2

Pour que ça fonctionne, vous devez obtenir **2 éléments supplémentaires** depuis Google Cloud Console :

### 🔑 1. Client ID OAuth2
**Format** : `xxxxxxxxx.apps.googleusercontent.com`
**Comment l'obtenir** :
1. Allez sur https://console.cloud.google.com/
2. Créez un projet ou sélectionnez-en un
3. API et services > Identifiants
4. "Créer des identifiants" > "ID client OAuth 2.0"
5. Type : "Application Web"
6. URI de redirection : `http://localhost:5173/oauth/callback`
7. Notez le **Client ID** et **Client Secret**

### 🛡️ 2. Client Secret OAuth2
**Format** : `xxxxxxxxxxxxxxxxxxxxxxxx`
**Obtenu en même temps que le Client ID**

## ⚙️ Configuration finale

Dans votre fichier `.env`, remplacez :
```env
VITE_GOOGLE_CLIENT_ID=votre_vrai_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_vrai_client_secret
```

## 🚀 Test immédiat

Une fois configuré :
```bash
npm run dev
# Allez sur http://localhost:5173/admin
# Paramètres > Google Calendar > Connecter
```

## 📊 Fonctionnement avec vos credentials

- ✅ **Votre clé API** : Backup + authentification de base
- ✅ **OAuth2 Client ID** : Connexion côté admin
- ✅ **OAuth2 Client Secret** : Autorisation complète
- 🔄 **Synchronisation** : Automatique via Service Account (optionnel)

---

## 🎯 EN RÉSUMÉ

**Seulement 2 choses à obtenir** :
1. **Client ID** (xxxxxxxx.apps.googleusercontent.com)
2. **Client Secret** (xxxxxxxxxxxxxxxxxxxxxxxx)

**Votre clé API** : ✅ Déjà configurée comme backup

**L'application** : ✅ Déjà prête à fonctionner

**Temps estimé** : 5 minutes pour obtenir les credentials Google Cloud 🎉