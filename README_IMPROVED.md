# 🏥 Application de Prise de Rendez-vous Médicaux - Version Professionnelle

Une application web moderne et complète pour la gestion des rendez-vous médicaux, comparée à Doctolib, construite avec React, TypeScript, Node.js et PostgreSQL.

## 🚀 Fonctionnalités Principales

### 👥 Espace Patient
- **Assistant de réservation en 3 étapes** : Interface intuitive pour sélectionner praticien → créneau → confirmation
- **Calendrier interactif** : Sélection visuelle des dates avec affichage des créneaux disponibles en temps réel
- **Gestion complète du profil** : Informations personnelles, historique médical, allergies, médicaments
- **Annulation intelligente** : Possibilité d'annuler jusqu'à 24h avant le rendez-vous
- **Historique des consultations** : Vue d'ensemble de tous les rendez-vous passés et à venir
- **Interface responsive** : Optimisée pour mobile, tablette et desktop

### 🔒 Espace Administrateur
- **Tableau de bord avancé** : Statistiques en temps réel et métriques de performance
- **Gestionnaire de disponibilités** : Création de créneaux récurrents ou ponctuels
- **Gestion des praticiens** : Profils détaillés avec spécialisations et informations professionnelles
- **Vue patients** : Liste complète avec historiques de consultations
- **Planning du jour** : Affichage en temps réel des rendez-vous de la journée
- **Statistiques détaillées** : Répartition par spécialisation, taux d'occupation, etc.

## 🏗️ Architecture Technique

### Frontend
- **React 18** + **TypeScript** - Interface moderne et typée
- **Tailwind CSS** + **Radix UI** - Design system professionnel
- **TanStack Query** - Gestion d'état et cache optimisés
- **date-fns** + **react-day-picker** - Gestion des dates avec localisation française
- **Wouter** - Routage client-side léger
- **Framer Motion** - Animations fluides

### Backend
- **Node.js** + **Express.js** - Serveur REST API
- **PostgreSQL** + **Drizzle ORM** - Base de données relationnelle avec ORM moderne
- **JWT Authentication** - Authentification sécurisée séparée (admin/patient)
- **bcryptjs** - Chiffrement des mots de passe
- **Zod** - Validation des données côté serveur
- **CORS** - Configuration sécurisée pour les requêtes cross-origin

### Infrastructure
- **Vercel** - Déploiement et hébergement
- **Neon Database** - PostgreSQL serverless en production
- **Vite** - Build tool ultra-rapide
- **ESM** - Modules ES6 natifs

## 📦 Installation et Démarrage

### Prérequis
```bash
Node.js 18+
npm ou yarn
Base de données PostgreSQL (Neon recommandé)
```

### 1. Cloner et installer
```bash
git clone https://github.com/votre-username/medical-appointment-app.git
cd medical-appointment-app
npm install
```

### 2. Configuration
```bash
cp .env.example .env
```

Configurez vos variables d'environnement :
```env
# Base de données
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Authentification
JWT_SECRET="votre-clé-jwt-super-secrète"
SESSION_SECRET="votre-clé-session-secrète"

# Environnement
NODE_ENV=development
PORT=5000
```

### 3. Base de données
```bash
# Initialiser le schéma
npm run db:push

# Insérer des données de test (optionnel)
npm run db:seed
```

### 4. Lancement
```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

L'application sera accessible sur `http://localhost:5000`

## 🌐 Déploiement sur Vercel

### 1. Préparation
```bash
npm run build
```

### 2. Déploiement
```bash
# Avec Vercel CLI
npm install -g vercel
vercel --prod

# Ou connecter votre repository GitHub à Vercel
```

### 3. Variables d'environnement Vercel
Ajoutez dans le dashboard Vercel :
- `DATABASE_URL` - URL de votre base PostgreSQL
- `JWT_SECRET` - Clé secrète JWT
- `SESSION_SECRET` - Clé secrète session
- `NODE_ENV=production`

## 👤 Comptes de Démonstration

### Administrateur
```
Email: admin@medical.fr
Mot de passe: admin123
```

### Patient
```
Email: patient@test.fr
Mot de passe: patient123
```

## 📊 API Documentation

### Authentification
- `POST /api/auth/login/patient` - Connexion patient
- `POST /api/auth/login/admin` - Connexion administrateur
- `POST /api/auth/register/patient` - Inscription patient
- `GET /api/auth/verify` - Vérification token

### Praticiens
- `GET /api/practitioners` - Liste publique des praticiens
- `GET /api/practitioners/:id` - Détails d'un praticien
- `POST /api/practitioners` - Créer un praticien (admin)
- `PUT /api/practitioners/:id` - Modifier un praticien (admin)
- `DELETE /api/practitioners/:id` - Supprimer un praticien (admin)

### Rendez-vous
- `GET /api/appointments/patient` - Rendez-vous du patient
- `POST /api/appointments` - Créer un rendez-vous
- `PUT /api/appointments/:id/cancel` - Annuler un rendez-vous
- `GET /api/appointments/admin/all` - Tous les rendez-vous (admin)

### Créneaux de Disponibilité
- `GET /api/availability/slots/:practitionerId` - Créneaux disponibles
- `POST /api/availability` - Créer un créneau (admin)
- `PUT /api/availability/:id` - Modifier un créneau (admin)
- `DELETE /api/availability/:id` - Supprimer un créneau (admin)

### Horaires Récurrents
- `GET /api/timeslots/practitioner/:id` - Horaires d'un praticien
- `POST /api/timeslots` - Créer un horaire récurrent (admin)
- `PUT /api/timeslots/:id` - Modifier un horaire (admin)
- `DELETE /api/timeslots/:id` - Supprimer un horaire (admin)

## 🔒 Sécurité

- **Authentification JWT** - Tokens sécurisés avec expiration
- **Chiffrement bcrypt** - Mots de passe avec salt aléatoire
- **Validation Zod** - Validation stricte côté serveur
- **CORS configuré** - Protection contre les requêtes malveillantes
- **Headers sécurisés** - XSS, CSRF et autres protections
- **Variables d'environnement** - Séparation des secrets

## 🧪 Tests et Qualité

### Tests unitaires
```bash
npm run test
```

### Linting et formatage
```bash
npm run lint
npm run format
```

### Vérification TypeScript
```bash
npm run check
```

## 🚀 Nouvelles Fonctionnalités Implémentées

### Interface Utilisateur
- ✅ Design moderne inspiré de Doctolib
- ✅ Navigation intuitive avec breadcrumbs
- ✅ Composants réutilisables et accessibles
- ✅ Animations et micro-interactions
- ✅ Messages de feedback en temps réel
- ✅ Interface responsive multi-device

### Système de Réservation
- ✅ Assistant de réservation en 3 étapes
- ✅ Calendrier interactif avec disponibilités
- ✅ Sélection de praticien avec filtres
- ✅ Gestion des capacités par créneau
- ✅ Validation temps réel des créneaux

### Gestion Administrative
- ✅ Tableau de bord avec KPIs
- ✅ Créneaux récurrents et ponctuels
- ✅ Statistiques avancées
- ✅ Gestion des conflits d'horaires
- ✅ Export des données

### Performance et Optimisation
- ✅ Lazy loading des composants
- ✅ Cache intelligent des requêtes
- ✅ Optimisation des images
- ✅ Minification et compression
- ✅ Service Worker (PWA ready)

## 📈 Métriques et Analytics

L'application inclut un système de métriques intégré :
- Nombre de rendez-vous par jour/mois
- Taux d'occupation des praticiens
- Répartition par spécialisation
- Taux d'annulation
- Pics d'affluence

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation API
- Contacter l'équipe de développement

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ pour révolutionner la prise de rendez-vous médicaux**

🎯 **Objectif atteint** : Une application de niveau Doctolib avec toutes les fonctionnalités modernes attendues par les patients et professionnels de santé.