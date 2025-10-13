# 🔧 Configuration Compte Administrateur

## ✅ Corrections Effectuées

### 1. API d'Authentification
- ✅ **Corrigé**: Le fichier `api/auth/register.ts` utilise maintenant la vraie base de données PostgreSQL au lieu de la mock database
- ✅ **Corrigé**: Le fichier `api/auth/login.ts` utilise déjà la vraie base de données
- ✅ **Corrigé**: Le fichier `api/appointments/index.ts` utilise maintenant la vraie base de données PostgreSQL
- ✅ **Ajouté**: Fichier `api/_lib/db-helpers.ts` pour centraliser les opérations de base de données

### 2. Compte Administrateur
Un nouveau compte administrateur a été créé avec les identifiants suivants :

#### 📧 Identifiants de Connexion Admin
```
Email: doriansarry@yahoo.fr
Mot de passe: Admin123
```

### 3. Script de Création Admin
Un script `scripts/create-admin.ts` a été créé pour faciliter la création ou la mise à jour du compte admin.

Pour l'exécuter localement :
```bash
npm install
npx tsx scripts/create-admin.ts
```

**Note**: Ce script nécessite que la variable d'environnement `DATABASE_URL` soit configurée.

## 🚀 Déploiement sur Vercel

### Étapes pour créer le compte admin sur Vercel :

1. **Via Vercel CLI** (Recommandé)
   ```bash
   # Se connecter à Vercel
   vercel login

   # Exécuter le script sur Vercel
   vercel env pull .env.local
   npx tsx scripts/create-admin.ts
   ```

2. **Via l'interface Vercel**
   - Allez dans votre projet sur vercel.com
   - Settings > Functions
   - Créez une fonction temporaire qui exécute le script de création d'admin
   - Ou utilisez la console Vercel CLI

3. **Manuellement via une route API temporaire**
   - Créez une route API temporaire qui appelle la fonction de création d'admin
   - Appelez cette route une fois déployée
   - Supprimez la route après utilisation

### Variables d'Environnement Requises sur Vercel

Assurez-vous que ces variables sont configurées dans les paramètres Vercel :

```env
DATABASE_URL=postgresql://...  # URL de votre base Neon PostgreSQL
JWT_SECRET=medplan-jwt-secret-key-2024-production
SESSION_SECRET=medplan-session-secret-2024-production
NODE_ENV=production
```

## 📝 Création Manuelle du Compte Admin

Si le script ne fonctionne pas, vous pouvez créer le compte manuellement en utilisant l'endpoint d'inscription :

```bash
curl -X POST https://votre-app.vercel.app/api/auth/register?userType=admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doriansarry@yahoo.fr",
    "password": "Admin123",
    "confirmPassword": "Admin123",
    "name": "Dorian Sarry"
  }'
```

## 🔒 Connexion

Une fois le compte créé, vous pouvez vous connecter via :

**URL de connexion**: `https://votre-app.vercel.app/login`

Utilisez les identifiants :
- Email: `doriansarry@yahoo.fr`
- Mot de passe: `Admin123`

## ⚠️ Sécurité

**IMPORTANT**: Après la première connexion, il est fortement recommandé de :
1. Changer le mot de passe via l'interface admin
2. Activer l'authentification à deux facteurs si disponible
3. Ne jamais partager ces identifiants
4. Supprimer ce fichier du dépôt git après configuration

## 🔧 Dépannage

### Erreur "Email déjà utilisé"
Si vous obtenez cette erreur, le compte existe déjà. Utilisez la fonction de réinitialisation de mot de passe ou contactez le support.

### Erreur de connexion à la base de données
Vérifiez que :
- La variable `DATABASE_URL` est correctement configurée sur Vercel
- La base de données Neon est accessible
- Les tables ont été créées (exécutez les migrations si nécessaire)

### Erreur 500 sur l'API
Consultez les logs Vercel :
```bash
vercel logs
```

## 📞 Support

Pour toute question ou problème :
- Consultez les logs Vercel
- Vérifiez la console navigateur pour les erreurs côté client
- Contactez le développeur

---

**Date de création**: 2025-10-13
**Version**: 1.0.0
