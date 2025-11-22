# Déploiement Vercel avec PostgreSQL (Neon)

## ✅ Migrations effectuées

Le projet a été migré de MySQL vers PostgreSQL pour être compatible avec Neon.

### Fichiers créés/modifiés :

1. **drizzle/schema.postgres.ts** - Schéma PostgreSQL
2. **drizzle/schema.ts** - Remplacé par la version PostgreSQL
3. **server/db.postgres.ts** - Adaptateur PostgreSQL
4. **server/db.ts** - Remplacé par la version PostgreSQL
5. **api/index.ts** - Point d'entrée serverless pour Vercel
6. **vercel.json** - Configuration Vercel mise à jour
7. **scripts/init-postgres.sql** - Script d'initialisation SQL

## 📋 Étapes de déploiement

### 1. Initialiser la base de données Neon

Connectez-vous à votre base de données Neon et exécutez le script :

```bash
# Option A : Depuis votre terminal local
psql 'postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require' < scripts/init-postgres.sql

# Option B : Depuis l'interface web Neon
# Copiez le contenu de scripts/init-postgres.sql et exécutez-le dans la console SQL de Neon
```

### 2. Configurer les variables d'environnement sur Vercel

Allez dans votre dashboard Vercel et ajoutez ces variables :

```
DATABASE_URL=postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/oauth/callback
```

### 3. Déployer sur Vercel

```bash
# Avec le token Vercel
npx vercel --token inWLdNocyfFPh8GA2AAquuxh --prod

# Ou simplement push sur main si connecté à GitHub
git push origin main
```

## 🔧 Architecture Serverless

L'application utilise maintenant :

- **Frontend** : Build statique Vite déployé sur Vercel CDN
- **Backend API** : Serverless functions dans `/api`
- **Database** : PostgreSQL sur Neon (compatible serverless)

### Points d'entrée :

- **Frontend** : `https://your-app.vercel.app/`
- **API** : `https://your-app.vercel.app/api/trpc/*`
- **OAuth** : `https://your-app.vercel.app/api/oauth/callback`
- **Health Check** : `https://your-app.vercel.app/api/health`

## 🗄️ Base de données

### Tables créées :

1. **users** - Utilisateurs de l'application
2. **practitioners** - Praticiens
3. **specialties** - Spécialités médicales
4. **serviceCategories** - Catégories de services
5. **services** - Services offerts
6. **practitionerServices** - Liaison praticiens-services
7. **workingPlans** - Plans de travail des praticiens
8. **blockedPeriods** - Périodes bloquées
9. **availabilitySlots** - Créneaux de disponibilité
10. **timeOff** - Congés
11. **appointments** - Rendez-vous
12. **adminLogs** - Logs d'activité admin
13. **settings** - Paramètres de l'application
14. **webhooks** - Webhooks
15. **googleCalendarSync** - Synchronisation Google Calendar

### Données par défaut :

Le script SQL insère automatiquement les paramètres par défaut de l'application.

## ✅ Vérification post-déploiement

Après le déploiement, vérifiez :

1. **Frontend accessible** : `https://your-app.vercel.app/`
2. **API Health Check** : `https://your-app.vercel.app/api/health`
3. **Connexion DB** : Vérifiez les logs Vercel pour les erreurs de connexion
4. **Routes protégées** : Testez l'authentification

## 🐛 Troubleshooting

### Erreur : "Database connection failed"

**Solution** : Vérifiez que :
- La variable `DATABASE_URL` est correctement définie dans Vercel
- Le script SQL a été exécuté avec succès
- Les tables existent dans votre base Neon

### Erreur : "Function timeout"

**Solution** : Les fonctions Vercel ont un timeout de 10s (gratuit) ou 60s (pro). Pour les opérations longues, utilisez :
- Edge Functions pour les requêtes rapides
- Background jobs pour les tâches longues

### Erreur : "Module not found"

**Solution** : Vérifiez que toutes les dépendances sont dans `package.json` :
```bash
npm install
```

## 📊 Monitoring

### Logs Vercel

Consultez les logs en temps réel :
```bash
npx vercel logs --token inWLdNocyfFPh8GA2AAquuxh
```

Ou via le dashboard Vercel : **Deployments → Functions → View Logs**

### Analytics

Activez Vercel Analytics dans le dashboard pour suivre :
- Performances
- Erreurs
- Trafic
- Core Web Vitals

## 🚀 Optimisations

### Performance

1. **Edge Functions** : Les routes légères peuvent être déployées sur Edge
2. **Caching** : Configurez les headers de cache dans `vercel.json`
3. **Code Splitting** : Déjà configuré dans Vite

### Coûts

**Vercel Hobby (Gratuit)** :
- 100 GB bandwidth/mois
- Serverless Functions : 100 heures/mois
- Edge Functions : 500k invocations/mois

**Neon Free Tier** :
- 512 MB stockage
- 10 branches
- Toujours disponible (pas de pause)

## 🔐 Sécurité

### Variables sensibles

❌ **Ne jamais commiter** :
- `.env`
- Tokens
- Credentials

✅ **Toujours utiliser** :
- Variables d'environnement Vercel
- `.env.example` pour la documentation

### HTTPS

Vercel fournit automatiquement :
- Certificat SSL gratuit
- HTTPS obligatoire
- Protection DDoS

## 📝 Prochaines étapes

1. ✅ Initialiser la base de données
2. ✅ Déployer sur Vercel
3. ⬜ Créer un utilisateur admin
4. ⬜ Configurer Google Calendar (optionnel)
5. ⬜ Ajouter des praticiens et services
6. ⬜ Tester les réservations

## 📞 Support

En cas de problème :
1. Consultez les logs Vercel
2. Vérifiez la connexion DB
3. Testez localement avec `npm run dev`
4. Créez une issue sur GitHub

---

**Date de migration** : 2025-11-15  
**Version** : PostgreSQL/Neon  
**Statut** : ✅ Prêt pour déploiement
