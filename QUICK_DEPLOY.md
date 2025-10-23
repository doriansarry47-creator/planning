# 🚀 Déploiement Rapide sur Vercel

## Méthode 1 : Déploiement via Interface Web Vercel (Recommandé)

### Étape 1 : Connecter votre Repo GitHub à Vercel

1. **Aller sur Vercel** : https://vercel.com/new
2. **Importer votre projet Git** :
   - Sélectionner "Import Git Repository"
   - Autoriser Vercel à accéder à GitHub
   - Sélectionner le repo : `doriansarry47-creator/planning`

3. **Configurer le projet** :
   - **Project Name** : `medplan-app` (ou autre nom)
   - **Framework Preset** : `Vite`
   - **Root Directory** : `./` (laisser par défaut)
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

4. **Ajouter les Variables d'Environnement** :

Cliquer sur "Environment Variables" et ajouter :

```
DATABASE_URL = postgresql://votre-connection-string-neon
JWT_SECRET = votre-secret-jwt-32-caracteres-minimum
SESSION_SECRET = votre-secret-session-32-caracteres-minimum
NODE_ENV = production
```

**Pour générer des secrets sécurisés** :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. **Déployer** :
   - Cliquer sur "Deploy"
   - Attendre 2-3 minutes
   - ✅ Votre app est live !

---

## Méthode 2 : Déploiement via CLI (Alternative)

### Prérequis
```bash
npm install -g vercel
```

### Étapes

1. **Se connecter à Vercel**
```bash
vercel login
```

2. **Déployer**
```bash
cd /home/user/webapp
vercel
```

3. **Questions à répondre** :
```
? Set up and deploy "~/webapp"? [Y/n] Y
? Which scope? <votre-compte-vercel>
? Link to existing project? [y/N] N
? What's your project's name? medplan-app
? In which directory is your code located? ./
```

4. **Configurer les variables d'environnement** :
```bash
vercel env add DATABASE_URL
# Coller votre URL de connexion Neon

vercel env add JWT_SECRET
# Coller votre secret JWT

vercel env add SESSION_SECRET
# Coller votre secret de session
```

5. **Déployer en production** :
```bash
vercel --prod
```

---

## 🗄️ Configuration de la Base de Données Neon

1. **Créer un compte Neon** : https://neon.tech
2. **Créer un nouveau projet** :
   - Nom : `MedPlan Production`
   - Région : Europe (eu-central-1) recommandé
3. **Copier la Connection String** :
   ```
   postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **Initialiser le schéma** :
   
   Option A : Via Drizzle (si configuré)
   ```bash
   npx drizzle-kit push:pg
   ```
   
   Option B : Manuellement via SQL
   - Aller dans l'interface Neon
   - Ouvrir le Query Editor
   - Copier/coller le schéma depuis `shared/schema.ts` ou `shared/schema-enhanced.ts`

5. **Créer un utilisateur admin** :
   ```sql
   INSERT INTO admins (email, password, name)
   VALUES ('admin@medplan.fr', '$2a$12$...', 'Dorian Sarry');
   ```
   
   Ou utiliser le script :
   ```bash
   npm run db:reset-admin
   ```

---

## ✅ Vérification Post-Déploiement

Une fois déployé, vérifiez :

1. **Page d'accueil** : `https://medplan-app.vercel.app`
2. **API Health** : `https://medplan-app.vercel.app/api/health`
3. **Connexion admin** : `https://medplan-app.vercel.app/login/admin`
   - Email : `admin@medplan.fr`
   - Password : celui défini lors de la création

---

## 🔧 Dépannage Rapide

### Erreur 500 après déploiement
- Vérifier que toutes les variables d'environnement sont définies
- Vérifier les logs : `vercel logs https://medplan-app.vercel.app`

### Build Failed
- Vérifier localement : `npm run build`
- Corriger les erreurs TypeScript
- Re-commit et re-déployer

### Base de données inaccessible
- Vérifier que `DATABASE_URL` est correct
- Vérifier que Neon DB est dans la même région (préférablement EU)
- Tester la connexion : `psql $DATABASE_URL`

---

## 📚 Documentation Complète

Pour plus de détails, voir :
- **Guide complet** : [DEPLOYMENT_GUIDE_V3.md](./DEPLOYMENT_GUIDE_V3.md)
- **Améliorations stratégiques** : [AMELIORATIONS_STRATEGIQUES.md](./AMELIORATIONS_STRATEGIQUES.md)

---

## 🎉 Félicitations !

Votre application MedPlan est maintenant en ligne !

**URL de production** : `https://medplan-app.vercel.app`

**Prochaines étapes** :
1. Configurer un domaine personnalisé (ex: `rdv.medplan-sarry.fr`)
2. Activer Vercel Analytics
3. Configurer les emails SMTP pour les notifications
4. Ajouter les SMS via Twilio (optionnel)

---

*Guide de déploiement rapide - MedPlan v3.0*
