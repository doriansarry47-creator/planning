# 🔧 Correction de l'erreur serveur 500 - TypeScript

## ❌ Problèmes identifiés

### 1. Erreur TypeScript sur Vercel
```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts" for /var/task/server/routes/auth.ts
```

**Cause**: Les importations dans `api/index.ts` utilisaient `.ts` au lieu de `.js`

### 2. Compte admin manquant
Le compte admin avec l'email `doriansarry47@gmail.com` n'était pas configuré.

## ✅ Solutions appliquées

### 1. Correction des importations TypeScript

**Avant** (❌):
```typescript
import authRoutes from '../server/routes/auth.ts';
import practitionersRoutes from '../server/routes/practitioners.ts';
```

**Après** (✅):
```typescript
// Importations dynamiques pour éviter les erreurs de compilation
async function loadRoutes() {
  const { default: authRoutes } = await import('../server/routes/auth.js');
  const { default: practitionersRoutes } = await import('../server/routes/practitioners.js');
  // ...
}
```

### 2. Configuration du compte administrateur

Créé le script `scripts/create-admin.ts` qui:
- ✅ Crée le compte admin avec email: `doriansarry47@gmail.com`
- ✅ Configure le mot de passe: `admin123`
- ✅ Active le compte automatiquement
- ✅ Met à jour si le compte existe déjà

### 3. Script de déploiement

Créé `scripts/deploy-setup.ts` pour:
- ✅ Vérifier la connexion DB
- ✅ Créer/mettre à jour l'admin
- ✅ Tester les endpoints
- ✅ Confirmer la configuration

## 🚀 Déploiement sur Vercel

### Commandes à exécuter après déploiement:

```bash
# 1. Configurer les variables d'environnement sur Vercel
DATABASE_URL=postgresql://...
JWT_SECRET=medplan-jwt-secret-key-2024-production
SESSION_SECRET=medplan-session-secret-2024-production
NODE_ENV=production

# 2. Après le déploiement, exécuter le setup
npm run deploy:setup
```

### Variables d'environnement requises sur Vercel:

```env
DATABASE_URL=postgresql://neondb_owner:password@ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=medplan-jwt-secret-key-2024-production
SESSION_SECRET=medplan-session-secret-2024-production
NODE_ENV=production
```

## 📡 Endpoints API corrigés

Après correction, ces endpoints sont disponibles:

### Authentification
- `POST /api/auth/register/patient` - Inscription patient
- `POST /api/auth/register/admin` - Inscription admin (protégé)
- `POST /api/auth/login/patient` - Connexion patient
- `POST /api/auth/login/admin` - Connexion admin
- `GET /api/auth/verify` - Vérification token

### Gestion
- `GET /api/health` - Status de l'API
- `GET /api/practitioners` - Liste des praticiens
- `GET /api/appointments` - Rendez-vous
- `GET /api/patients` - Patients (protégé)

## 🔑 Informations de connexion admin

```
Email: doriansarry47@gmail.com
Mot de passe: admin123
```

## 🧪 Tests post-déploiement

### 1. Test de santé de l'API
```bash
curl https://votre-app.vercel.app/api/health
```

### 2. Test de connexion admin
```bash
curl -X POST https://votre-app.vercel.app/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"email":"doriansarry47@gmail.com","password":"admin123"}'
```

### 3. Test d'inscription patient
```bash
curl -X POST https://votre-app.vercel.app/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPassword123",
    "firstName":"Test",
    "lastName":"User"
  }'
```

## 🔧 Fichiers modifiés

1. ✅ `api/index.ts` - Importations dynamiques
2. ✅ `scripts/create-admin.ts` - Script de création admin
3. ✅ `scripts/deploy-setup.ts` - Script de setup déploiement  
4. ✅ `package.json` - Nouvelles commandes
5. ✅ `.env` - Variables d'environnement

## ⚠️ Notes importantes

1. **Base de données**: Assurez-vous que `DATABASE_URL` est correctement configuré sur Vercel
2. **Sécurité**: Changez les secrets JWT en production
3. **Admin**: Le compte admin est automatiquement activé
4. **CORS**: Configuré pour accepter toutes les origines en production Vercel

## 📞 Support

Si les erreurs persistent après ces corrections:

1. Vérifiez les logs Vercel
2. Testez la connexion à la base de données
3. Vérifiez les variables d'environnement
4. Exécutez `npm run deploy:setup` après le déploiement