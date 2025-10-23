# 🏥 MedPlan v3.0 - Plateforme de Réservation Professionnelle

Une application web moderne pour la prise de rendez-vous destinée aux professionnels de la santé et du bien-être, optimisée pour Vercel avec une architecture serverless.

## 🎯 Dernière Mise à Jour - v3.0 (23 Oct 2025)

**🚀 Améliorations Majeures : Interface Moderne + Roadmap Stratégique !**

Cette version 3.0 apporte des améliorations significatives et une vision stratégique sur 15 mois :

### 📚 Documentation Stratégique
- 🗺️ **[AMELIORATIONS_STRATEGIQUES.md](./AMELIORATIONS_STRATEGIQUES.md)** - Plan stratégique complet (UI/UX, fonctionnalités, roadmap 3 phases)
- 🚀 **[INSTRUCTIONS_DEPLOIEMENT.md](./INSTRUCTIONS_DEPLOIEMENT.md)** - Guide de déploiement pas-à-pas
- ⚡ **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Déploiement rapide (5 minutes)
- 📖 **[DEPLOYMENT_GUIDE_V3.md](./DEPLOYMENT_GUIDE_V3.md)** - Guide complet avancé
- 📊 **[RESUME_AMELIORATIONS_V3.md](./RESUME_AMELIORATIONS_V3.md)** - Résumé des améliorations

### 🎨 Nouveaux Composants UI
- ✅ **Calendrier interactif** avec code couleur (disponible/limité/complet)
- ✅ **Mode sombre** avec support système/light/dark
- ✅ **Profils praticiens enrichis** (schéma DB étendu)
- ✅ **Messagerie intégrée** (architecture prête)
- ✅ **Notifications multi-canal** (email, SMS, push)

## ✨ Fonctionnalités

### 👥 Pour les Patients
- **Inscription et connexion sécurisées** - Création de compte patient avec authentification JWT
- **Prise de rendez-vous en ligne** - Interface intuitive pour réserver des consultations
- **Tableau de bord personnel** - Vue d'ensemble des rendez-vous à venir et historique
- **Gestion du profil médical** - Historique médical, allergies, médicaments

### 🔒 Pour les Administrateurs
- **Tableau de bord complet** - Vue d'ensemble de l'activité de la clinique
- **Gestion des praticiens** - Ajout, modification des médecins et spécialistes
- **Gestion des patients** - Administration des profils patients
- **Gestion des rendez-vous** - Supervision et modification des consultations
- **Statistiques en temps réel** - Métriques de performance de la clinique

## 🚀 Technologies Utilisées

### Frontend
- **React 18** - Interface utilisateur moderne avec hooks
- **TypeScript** - Typage statique pour une meilleure fiabilité
- **Tailwind CSS** - Framework CSS utilitaire pour un design moderne
- **Wouter** - Routage client-side léger et performant
- **React Query** - Gestion des états et cache des requêtes API
- **React Hook Form** - Gestion des formulaires avec validation
- **Vite** - Build tool ultra-rapide

### Backend API Serverless
- **Vercel Functions** - Runtime serverless avec @vercel/node
- **Express.js** - Framework web pour structurer l'API
- **PostgreSQL** - Base de données relationnelle (Neon recommandé)
- **Drizzle ORM** - ORM TypeScript moderne et type-safe
- **JWT** - Authentification par tokens sécurisés
- **bcryptjs** - Chiffrement des mots de passe
- **Zod** - Validation des données côté serveur

## 🛠️ Installation et Configuration

### Prérequis
- Node.js 18+
- Base de données PostgreSQL (Neon recommandé pour la compatibilité Vercel)
- Compte Vercel (pour le déploiement)

### 1. Cloner le projet
```bash
git clone <votre-repository>
cd medplan-vercel
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à partir de `.env.example` :
```bash
cp .env.example .env
```

Configurez vos variables d'environnement :
```env
# Base de données Neon PostgreSQL
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Clés de sécurité (générez des clés uniques en production)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
SESSION_SECRET="your-super-secret-session-key-change-in-production"

# Environnement
NODE_ENV="development"

# API URL pour le client
VITE_API_URL="/api"
```

### 4. Développement local
```bash
# Démarrer le serveur de développement
npm run dev

# Dans un autre terminal, si vous voulez tester l'API localement
# (Optionnel - Vercel Dev peut être utilisé à la place)
```

L'application sera accessible sur `http://localhost:5173`

## 🚀 Déploiement sur Vercel

### 1. Préparer le déploiement
```bash
# Construire l'application
npm run build
```

### 2. Déployer avec Vercel CLI
```bash
# Installer Vercel CLI (si nécessaire)
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

### 3. Configuration des variables d'environnement sur Vercel

Dans le dashboard Vercel, ajoutez les variables :
- `DATABASE_URL` - URL de votre base de données PostgreSQL
- `JWT_SECRET` - Clé secrète pour les tokens JWT
- `SESSION_SECRET` - Clé secrète pour les sessions

## 👥 Comptes de Test

Après avoir lancé le script de seed :

### Administrateur
- **Email:** admin@medplan.fr
- **Mot de passe:** admin123

### Patient de test
- **Email:** patient@test.fr
- **Mot de passe:** patient123

## 📚 Structure de l'API

### Authentification
- `POST /api/auth/register?userType=patient` - Inscription patient
- `POST /api/auth/register?userType=admin` - Inscription administrateur  
- `POST /api/auth/login?userType=patient` - Connexion patient
- `POST /api/auth/login?userType=admin` - Connexion administrateur
- `GET /api/auth/verify` - Vérification du token

### Gestion des Praticiens
- `GET /api/practitioners` - Liste publique des praticiens
- `POST /api/practitioners` - Créer un praticien (admin uniquement)

### Gestion des Rendez-vous
- `GET /api/appointments` - Rendez-vous (filtrés selon le type d'utilisateur)
- `POST /api/appointments` - Créer un rendez-vous (patients)

## 🏗️ Architecture du Projet

```
medplan-vercel/
├── api/                        # API Serverless Functions (Vercel)
│   ├── _lib/                   # Utilitaires partagés API
│   │   ├── auth.ts             # Authentification JWT
│   │   ├── db.ts               # Configuration base de données
│   │   └── response.ts         # Utilitaires de réponse
│   ├── auth/                   # Routes d'authentification
│   │   ├── login.ts
│   │   ├── register.ts
│   │   └── verify.ts
│   ├── appointments/           # Routes des rendez-vous
│   │   └── index.ts
│   └── practitioners/          # Routes des praticiens
│       └── index.ts
├── src/                        # Frontend React
│   ├── components/             # Composants React
│   │   ├── ui/                 # Composants UI de base
│   │   └── auth/               # Composants d'authentification
│   ├── pages/                  # Pages de l'application
│   ├── lib/                    # Utilitaires et services
│   ├── hooks/                  # Hooks React personnalisés
│   └── types/                  # Types TypeScript
├── shared/                     # Code partagé
│   └── schema.ts               # Schéma de base de données Drizzle
├── scripts/                    # Scripts utilitaires
│   └── seed.ts                 # Initialisation de la base de données
└── public/                     # Assets statiques
```

## 🔒 Sécurité

- **Authentification JWT** - Tokens sécurisés avec expiration
- **Chiffrement des mots de passe** - bcrypt avec salt de niveau 12
- **Validation des données** - Zod pour la validation côté serveur et client
- **Variables d'environnement** - Séparation des secrets
- **CORS configuré** - Protection contre les requêtes non autorisées
- **Headers de sécurité** - Configuration Vercel avec headers sécurisés

## ⚡ Performance

- **Serverless Functions** - Scalabilité automatique avec Vercel
- **Chunking intelligent** - Séparation vendor/utils pour un cache optimal
- **Tree shaking** - Élimination du code non utilisé
- **Compression gzip** - Assets compressés automatiquement
- **CDN global** - Distribution mondiale avec Vercel Edge Network

## 🐛 Dépannage

### Erreur de base de données
Vérifiez que votre `DATABASE_URL` est correcte et que la base est accessible.

### Erreur de build Vercel
Assurez-vous que tous les types TypeScript sont corrects et que les dépendances sont installées.

### Erreur d'authentification
Vérifiez que `JWT_SECRET` est défini dans les variables d'environnement Vercel.

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajouter une nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour améliorer l'expérience patient et faciliter la gestion des cabinets médicaux.**