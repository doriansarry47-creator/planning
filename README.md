# Application de Gestion de Rendez-vous Médicaux

## Vue d'ensemble
- **Nom**: Medical Appointments Manager
- **Objectif**: Application web optimisée de gestion de rendez-vous médicaux pour patients et administrateurs
- **Fonctionnalités principales**: 
  - ✅ Authentification sécurisée (JWT) pour patients et administrateurs
  - ✅ Inscription et connexion des patients
  - ✅ Prise de rendez-vous en ligne avec questionnaire médical
  - ✅ Tableau de bord patient pour consulter ses rendez-vous
  - ✅ Tableau de bord administrateur avec statistiques
  - ✅ Gestion complète des patients (admin)
  - ✅ Gestion des créneaux de disponibilité (admin)
  - ✅ Confirmation et mise à jour des rendez-vous (admin)
  - ✅ Interface moderne avec Tailwind CSS
  - ✅ Architecture API REST avec Hono

## URLs
- **Production**: À déployer sur Cloudflare Pages
- **GitHub**: https://github.com/doriansarry47-creator/planning
- **Local Development**: http://localhost:3000
- **Demo (Sandbox)**: https://3000-ii8nu1jqfeti6wr77g7s6-8f57ffe2.sandbox.novita.ai

## Architecture des Données
- **Base de données**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Connexion**: Via @neondatabase/serverless (optimisée pour edge runtime)

### Modèles principaux
- **Admins**: Administrateurs avec rôles et permissions
- **Patients**: Patients avec questionnaire médical d'accueil
- **Appointments**: Rendez-vous avec motifs et statuts
- **AvailabilitySlots**: Créneaux de disponibilité configurables
- **Notes**: Notes de suivi thérapeutique (privées)
- **Unavailabilities**: Gestion des congés et indisponibilités

## Guide d'utilisation

### Pour les Patients:
1. **S'inscrire** sur la page d'accueil en remplissant le questionnaire médical
2. **Se connecter** avec email et mot de passe
3. **Consulter le tableau de bord** avec ses rendez-vous
4. **Prendre rendez-vous** en choisissant date, type (cabinet/visio) et motif
5. **Consulter son profil** avec ses informations personnelles

### Pour les Administrateurs:
1. **Se connecter** via le bouton "Connexion Admin"
2. **Consulter les statistiques** sur le tableau de bord
3. **Gérer les patients** - voir la liste complète des patients
4. **Gérer les rendez-vous** - confirmer, annuler ou modifier les RDV
5. **Créer des créneaux** de disponibilité pour les prochaines semaines

### Identifiants par défaut (à changer en production)
- **Admin**: admin@example.com / admin123

## Architecture Technique

### Backend (Hono)
- **Framework**: Hono (léger, rapide, pour Cloudflare Workers)
- **Runtime**: Cloudflare Workers/Pages (edge computing)
- **Authentification**: JWT avec bcryptjs pour le hashing
- **Validation**: Zod pour la validation des données
- **Base de données**: PostgreSQL Neon avec Drizzle ORM

### Frontend (Single Page App)
- **Vanilla JavaScript** avec architecture moderne
- **Tailwind CSS** via CDN pour le styling
- **Font Awesome** pour les icônes
- **Axios** pour les requêtes HTTP
- **localStorage** pour la persistance du token JWT

### Routes API

#### Authentification
- `POST /api/auth/patient/register` - Inscription patient
- `POST /api/auth/patient/login` - Connexion patient
- `POST /api/auth/admin/login` - Connexion admin
- `GET /api/auth/me` - Vérifier le token et obtenir l'utilisateur

#### Patient (protégé, authentification requise)
- `GET /api/patient/profile` - Obtenir le profil du patient
- `GET /api/patient/appointments` - Obtenir les rendez-vous du patient
- `POST /api/patient/appointments` - Créer un nouveau rendez-vous

#### Admin (protégé, authentification admin requise)
- `GET /api/admin/statistics` - Statistiques globales
- `GET /api/admin/patients` - Liste de tous les patients
- `GET /api/admin/patients/:id` - Détails d'un patient
- `GET /api/admin/appointments` - Tous les rendez-vous
- `PATCH /api/admin/appointments/:id` - Mettre à jour un rendez-vous
- `POST /api/admin/availability-slots` - Créer un créneau de disponibilité

#### Public
- `GET /api/availability-slots` - Obtenir les créneaux disponibles

## Configuration

### Variables d'environnement

Créer un fichier `.dev.vars` pour le développement local:
```
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-secret-key-minimum-32-characters
```

Pour la production sur Cloudflare Pages, configurer via `wrangler secret`:
```bash
wrangler pages secret put DATABASE_URL --project-name webapp
wrangler pages secret put JWT_SECRET --project-name webapp
```

### Initialisation de la base de données

Exécuter le script SQL d'initialisation:
```bash
# Se connecter à PostgreSQL et exécuter
psql -h your-host -U your-user -d your-database -f init-db.sql
```

## Développement Local

### Installation
```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .dev.vars.example .dev.vars
# Éditer .dev.vars avec vos credentials
```

### Lancer le serveur de développement
```bash
# Build d'abord (obligatoire pour Cloudflare Pages)
npm run build

# Méthode 1: Avec PM2 (recommandé pour le sandbox)
pm2 start ecosystem.config.cjs

# Méthode 2: Directement avec wrangler
npm run dev:sandbox

# Tester
curl http://localhost:3000
```

### Commandes utiles
```bash
# Nettoyer le port 3000
npm run clean-port

# Tester l'application
npm run test

# Vérifier les logs PM2
pm2 logs webapp --nostream

# Arrêter PM2
pm2 delete webapp
```

## Déploiement sur Cloudflare Pages

### Prérequis
1. Compte Cloudflare
2. Base de données PostgreSQL Neon configurée
3. Wrangler CLI installé

### Étapes de déploiement
```bash
# 1. Build l'application
npm run build

# 2. Créer le projet Cloudflare Pages (première fois)
npx wrangler pages project create webapp --production-branch main

# 3. Configurer les secrets
npx wrangler pages secret put DATABASE_URL --project-name webapp
npx wrangler pages secret put JWT_SECRET --project-name webapp

# 4. Déployer
npm run deploy

# Ou directement
npx wrangler pages deploy dist --project-name webapp
```

## Sécurité

### Mesures de sécurité implémentées
- ✅ Hashing des mots de passe avec bcryptjs (10 rounds)
- ✅ Authentification JWT avec expiration (7 jours)
- ✅ Validation des données avec Zod
- ✅ Protection CORS configurée
- ✅ Middleware d'authentification pour routes protégées
- ✅ Séparation des rôles (patient/admin)
- ✅ Tentatives de connexion limitées pour admins
- ✅ Verrouillage de compte admin après échecs répétés

### Recommandations de sécurité
1. **Changer les identifiants par défaut** en production
2. **Utiliser un JWT_SECRET fort** (minimum 32 caractères aléatoires)
3. **Configurer HTTPS** sur Cloudflare Pages (automatique)
4. **Activer la validation email** pour les nouveaux patients
5. **Implémenter la récupération de mot de passe** sécurisée
6. **Ajouter du rate limiting** sur les endpoints sensibles
7. **Monitorer les tentatives de connexion** suspectes

## Structure du Projet
```
webapp/
├── src/
│   ├── db/
│   │   ├── index.ts          # Configuration Drizzle ORM
│   │   └── schema.ts         # Schémas de base de données
│   ├── lib/
│   │   ├── auth.ts           # Fonctions d'authentification
│   │   └── middleware.ts     # Middlewares Hono
│   └── index.tsx             # Application Hono principale avec routes et UI
├── public/                   # Assets statiques (si nécessaire)
├── .dev.vars                 # Variables d'environnement locales
├── .gitignore                # Fichiers à ignorer par git
├── ecosystem.config.cjs      # Configuration PM2
├── init-db.sql               # Script d'initialisation DB
├── package.json              # Dépendances et scripts
├── tsconfig.json             # Configuration TypeScript
├── vite.config.ts            # Configuration Vite
├── wrangler.jsonc            # Configuration Cloudflare
└── README.md                 # Ce fichier
```

## Fonctionnalités à venir
- [ ] Système de notifications email
- [ ] Rappels automatiques de rendez-vous
- [ ] Visioconférence intégrée pour les consultations en ligne
- [ ] Export des données en PDF
- [ ] Calendrier interactif avec FullCalendar
- [ ] Historique complet des consultations
- [ ] Paiement en ligne intégré
- [ ] Application mobile (React Native)

## Support et Contact
Pour toute question ou problème, contactez l'administrateur du système.

## Licence
Propriétaire - Tous droits réservés

---

**Dernière mise à jour**: 2025-10-27
**Version**: 1.0.0
**Status**: ✅ Développement actif
