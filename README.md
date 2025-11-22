# Planning & Scheduling App 📅

Application web de gestion de rendez-vous et de planification construite avec React, TypeScript, et déployée sur Vercel.

## 🚀 Déploiement Production

**URL de production** : https://webapp-frtjapec0-ikips-projects.vercel.app

## ✨ Fonctionnalités

- 📅 Réservation de rendez-vous
- 👤 Gestion des utilisateurs
- 🔒 Routes protégées avec authentification
- 📊 Tableau de bord administrateur
- 📱 Design responsive (mobile, tablet, desktop)
- 🎨 Interface moderne avec Radix UI et Tailwind CSS

## 🛠️ Stack Technique

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite 6** - Build tool ultra-rapide
- **Radix UI** - Composants UI accessibles
- **Tailwind CSS** - Styling utility-first
- **Wouter** - Routing léger
- **TanStack Query** - State management serveur

### Backend (À connecter)
- **TRPC** - API type-safe
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Base de données
- **Express** - Server HTTP

### Hébergement
- **Vercel** - Hébergement et CI/CD
- **GitHub** - Version control

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/doriansarry47-creator/planning.git
cd planning

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement
# Éditer le fichier .env avec vos valeurs
```

## 🚀 Démarrage

### Développement Local

```bash
# Lancer le serveur de développement
npm run dev

# L'application sera disponible sur http://localhost:5173
```

### Build de Production

```bash
# Construire l'application
npm run build

# Preview du build
npm run preview
```

## 📁 Structure du Projet

```
planning/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── contexts/     # Contexts React
│   │   ├── hooks/        # Hooks personnalisés
│   │   ├── lib/          # Utilitaires
│   │   ├── App.tsx       # Composant principal
│   │   ├── main.tsx      # Point d'entrée
│   │   └── index.css     # Styles globaux
│   └── index.html        # Template HTML
│
├── server/               # Backend (à développer)
│   ├── _core/           # Core backend
│   ├── routers.ts       # Routers TRPC
│   └── db.ts            # Configuration DB
│
├── shared/              # Code partagé
│   ├── types.ts         # Types TypeScript
│   └── zodSchemas.ts    # Schémas de validation
│
├── drizzle/             # Migrations DB
│   └── schema.ts        # Schéma DB
│
└── dist/                # Build output
    └── public/          # Assets statiques
```

## 🔐 Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
DATABASE_URL=postgresql://username:password@host:port/database
GOOGLE_API_KEY=your_google_api_key_here
NODE_ENV=production
```

## 🌐 Déploiement sur Vercel

### Automatique (Recommandé)

1. Pusher sur la branche `main`
2. Vercel déploiera automatiquement

### Manuel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

## 🧪 Tests

### Tests Automatisés

```bash
# Lancer les tests (à implémenter)
npm test
```

### Tests Manuels

Consulter [RAPPORT_TESTS.md](./RAPPORT_TESTS.md) pour le plan de tests détaillé.

## 📝 Pages Disponibles

| Route | Description | Protection |
|-------|-------------|-----------|
| `/` | Page d'accueil | Public |
| `/book-appointment` | Réservation | Public |
| `/appointments` | Mes rendez-vous | Protégé (user) |
| `/admin` | Dashboard admin | Protégé (admin) |
| `/404` | Page non trouvée | Public |

## 🔒 Authentification

L'authentification est actuellement en mode mock. Pour implémenter une authentification réelle :

1. Intégrer un provider OAuth (Google, GitHub, etc.)
2. Configurer les cookies de session
3. Mettre à jour le hook `useAuth`
4. Configurer les middlewares de protection

## 🐛 Problèmes Connus

- ⚠️ Authentification en mode mock
- ⚠️ Backend non connecté
- ⚠️ Base de données non configurée
- ⚠️ Formulaires de réservation non fonctionnels

## 🚧 Prochaines Étapes

### Priorité Haute
- [ ] Implémenter l'authentification réelle
- [ ] Créer les formulaires fonctionnels
- [ ] Connecter le backend API
- [ ] Configurer la base de données

### Priorité Moyenne
- [ ] Ajouter les variables d'environnement dans Vercel
- [ ] Optimiser les performances (code splitting)
- [ ] Implémenter le système de notifications

### Priorité Basse
- [ ] Tests unitaires et E2E
- [ ] Documentation API
- [ ] Internationalisation (i18n)

## 📚 Documentation

- [Guide de Tests](./TESTS_UTILISATEURS.md)
- [Rapport de Tests](./RAPPORT_TESTS.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

- [@doriansarry47-creator](https://github.com/doriansarry47-creator)

## 🙏 Remerciements

- React Team
- Vercel Team
- Radix UI Team
- Tailwind CSS Team

---

**Status** : ✅ Déployé en Production  
**Version** : 1.0.0  
**Dernière mise à jour** : 2025-11-10
