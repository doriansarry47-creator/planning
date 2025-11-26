# 🔒 Mise à Jour Sécurité - Planning App

## ⚠️ Changements Importants

Cette mise à jour améliore la sécurité de l'application en :

### ✅ Sécurisation des Credentials
- **Avant** : Credentials OAuth2 hardcodés dans le code source
- **Après** : Utilisation exclusive des variables d'environnement

### 🔑 Variables d'Environnement Requises

Le fichier `api/index.ts` utilise maintenant les variables suivantes :

```typescript
// Au lieu de valeurs hardcodées
VITE_GOOGLE_CLIENT_ID    // Client ID OAuth2
GOOGLE_CLIENT_ID         // Client ID (backend)
GOOGLE_CLIENT_SECRET     // Client Secret
GOOGLE_CALENDAR_EMAIL    // Email du calendrier
GOOGLE_REDIRECT_URI      // URL de callback OAuth2
GOOGLE_REFRESH_TOKEN     // Token de rafraîchissement
RESEND_API_KEY          // Clé API Resend
APP_URL                 // URL de l'application
```

## 🚨 Actions Requises

### Pour le Développement Local

1. Copier `.env.example` vers `.env`
```bash
cp .env.example .env
```

2. Remplir les variables avec vos propres valeurs

### Pour Vercel Production

1. Aller dans **Settings > Environment Variables**
2. Ajouter toutes les variables requises
3. Redéployer l'application

## 📋 Checklist de Migration

- [ ] Vérifier que `.env` n'est PAS dans le repository (déjà dans .gitignore)
- [ ] Configurer toutes les variables d'environnement sur Vercel
- [ ] Régénérer le GOOGLE_REFRESH_TOKEN via `/api/oauth/init`
- [ ] Tester l'application après déploiement
- [ ] Révoquer les anciennes credentials si exposées

## 🔄 Workflow de Déploiement

```bash
# 1. Créer/modifier les fichiers sur la branche genspark_ai_developer
git checkout genspark_ai_developer

# 2. Commit immédiat après modification
git add .
git commit -m "security: migrate hardcoded credentials to environment variables"

# 3. Fetch et merge les derniers changements de main
git fetch origin main
git rebase origin/main

# 4. Résoudre les conflits si nécessaire (priorité au code remote)

# 5. Squash tous les commits locaux
git reset --soft HEAD~N  # N = nombre de commits à combiner
git commit -m "security: comprehensive security update for OAuth credentials"

# 6. Push vers GitHub
git push -f origin genspark_ai_developer

# 7. Créer une Pull Request vers main
```

## ⚡ Avantages de cette Approche

1. **Sécurité** : Pas de credentials dans le code source
2. **Flexibilité** : Différentes valeurs par environnement (dev, staging, prod)
3. **Maintenance** : Changement de credentials sans modifier le code
4. **Conformité** : Respect des bonnes pratiques de sécurité

## 🛡️ Bonnes Pratiques

### ✅ À FAIRE
- Utiliser des variables d'environnement pour tous les secrets
- Utiliser `.env.example` comme template
- Ajouter `.env` dans `.gitignore`
- Régénérer les credentials si exposés
- Utiliser des tokens différents pour dev/prod

### ❌ À NE PAS FAIRE
- Hardcoder des credentials dans le code
- Committer `.env` dans Git
- Partager des credentials via email/chat
- Utiliser les mêmes credentials en dev et prod
- Exposer des API keys dans le frontend

## 🔐 Rotation des Credentials

Si des credentials ont été exposés :

1. **Google OAuth2**
   - Révoquer les tokens actuels dans Google Cloud Console
   - Créer de nouveaux credentials OAuth2
   - Mettre à jour les variables d'environnement

2. **Resend API Key**
   - Révoquer la clé actuelle sur Resend
   - Générer une nouvelle clé
   - Mettre à jour `RESEND_API_KEY`

3. **Database**
   - Changer le mot de passe de la base de données
   - Mettre à jour `DATABASE_URL`

## 📞 Support

Pour toute question concernant cette mise à jour de sécurité :
- Consulter `DEPLOYMENT_GUIDE.md` pour le guide complet
- Vérifier les logs Vercel en cas d'erreur
- S'assurer que toutes les variables sont configurées

---

**Type** : Mise à jour de sécurité  
**Criticité** : 🔴 Haute  
**Action** : Déploiement requis avec nouvelles variables d'environnement  
**Date** : 2025-11-23
