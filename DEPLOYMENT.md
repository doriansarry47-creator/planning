# 🚀 Guide de Déploiement sur Vercel

## Configuration rapide

### 1. Prérequis
- Compte Vercel connecté à GitHub
- Base de données PostgreSQL (Neon recommandé)

### 2. Déploiement automatique depuis GitHub

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez ce repository GitHub
4. Vercel détectera automatiquement la configuration

### 3. Variables d'environnement obligatoires

Dans les paramètres du projet Vercel, ajoutez ces variables :

```
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-super-secret-session-key-min-32-chars
```

### 4. Base de données Neon (recommandé)

1. Créez un compte sur [Neon](https://neon.tech)
2. Créez une nouvelle base de données
3. Copiez l'URL de connexion dans `DATABASE_URL`

### 5. Test du déploiement

Après déploiement, l'application sera disponible sur :
- Page d'accueil : `https://your-app.vercel.app`
- API de test : `https://your-app.vercel.app/api/auth/verify`

### 6. Initialisation des données

Une fois déployé, utilisez les comptes de test :

**Admin :**
- Email: admin@medplan.fr  
- Password: admin123

**Patient :**
- Email: patient@test.fr
- Password: patient123

### 7. Configuration du domaine (optionnel)

Dans les paramètres Vercel :
1. Allez dans "Domains"
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions de configuration DNS

## Troubleshooting

### Erreur "Internal Server Error"
- Vérifiez que `DATABASE_URL` est correctement configurée
- Vérifiez que la base de données est accessible

### Erreur "JWT Error"
- Vérifiez que `JWT_SECRET` est défini
- Assurez-vous qu'il fait au moins 32 caractères

### Build Error
- Vérifiez que tous les types TypeScript sont corrects
- Relancez le build depuis Vercel

## Support

En cas de problème, consultez les logs Vercel ou ouvrez une issue sur GitHub.