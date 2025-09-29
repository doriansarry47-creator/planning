# 🏥 Application de Gestion de Rendez-vous Médicaux

Une application web moderne et complète pour la gestion des rendez-vous médicaux, construite avec React, TypeScript, Node.js et PostgreSQL.

## ✨ Fonctionnalités

### 👥 Pour les Patients
- **Inscription et connexion sécurisées** - Création de compte patient avec authentification
- **Prise de rendez-vous en ligne** - Interface intuitive pour réserver des consultations
- **Gestion du profil médical** - Historique médical, allergies, médicaments
- **Suivi des rendez-vous** - Visualisation et annulation des rendez-vous
- **Historique médical** - Accès aux consultations passées

### 🔒 Pour les Administrateurs
- **Tableau de bord complet** - Vue d'ensemble de l'activité de la clinique
- **Gestion des praticiens** - Ajout, modification des médecins et spécialistes
- **Gestion des patients** - Administration des profils patients
- **Gestion des rendez-vous** - Supervision et modification des consultations
- **Configuration des créneaux** - Définition des disponibilités des praticiens
- **Statistiques en temps réel** - Métriques de performance de la clinique

## 🚀 Technologies Utilisées

### Frontend
- **React 18** - Interface utilisateur moderne
- **TypeScript** - Typage statique pour une meilleure fiabilité
- **Tailwind CSS** - Framework CSS utilitaire
- **Radix UI** - Composants accessibles et personnalisables
- **Wouter** - Routage client-side léger
- **TanStack Query** - Gestion des états et cache des requêtes

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web minimaliste
- **PostgreSQL** - Base de données relationnelle
- **Drizzle ORM** - ORM TypeScript moderne
- **JWT** - Authentification par tokens
- **bcryptjs** - Chiffrement des mots de passe

### Infrastructure
- **Neon Database** - PostgreSQL serverless
- **Vercel** - Hébergement et déploiement
- **Vite** - Build tool et serveur de développement

## 🛠️ Installation et Configuration

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Base de données PostgreSQL (Neon recommandé)

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/medical-appointment-app.git
cd medical-appointment-app
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
```bash
cp .env.example .env
```

Modifiez le fichier `.env` avec vos configurations :
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
JWT_SECRET="votre-clé-secrète-jwt"
SESSION_SECRET="votre-clé-session"
NODE_ENV=development
PORT=5000
```

### 4. Initialiser la base de données
```bash
# Pousser le schéma vers la base de données
npm run db:push

# Insérer les données de test (optionnel)
npm run db:seed
```

### 5. Lancer l'application
```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

L'application sera accessible sur `http://localhost:5000`

## 👥 Comptes de Test

### Administrateur
- **Email:** admin@medical.fr
- **Mot de passe:** admin123

### Patient
- **Email:** patient@test.fr
- **Mot de passe:** patient123

## 📚 API Documentation

### Authentification
- `POST /api/auth/register/patient` - Inscription patient
- `POST /api/auth/login/patient` - Connexion patient
- `POST /api/auth/register/admin` - Inscription administrateur
- `POST /api/auth/login/admin` - Connexion administrateur
- `GET /api/auth/verify` - Vérification du token

### Gestion des Praticiens
- `GET /api/practitioners` - Liste publique des praticiens
- `GET /api/practitioners/:id` - Détails d'un praticien
- `POST /api/practitioners` - Créer un praticien (admin)
- `PUT /api/practitioners/:id` - Modifier un praticien (admin)
- `DELETE /api/practitioners/:id` - Supprimer un praticien (admin)

### Gestion des Rendez-vous
- `GET /api/appointments/patient` - Rendez-vous du patient connecté
- `POST /api/appointments` - Créer un rendez-vous (patient)
- `PUT /api/appointments/:id/cancel` - Annuler un rendez-vous (patient)
- `GET /api/appointments/admin/all` - Tous les rendez-vous (admin)
- `PUT /api/appointments/:id` - Modifier un rendez-vous (admin)

### Gestion des Patients
- `GET /api/patients/profile` - Profil du patient connecté
- `PUT /api/patients/profile` - Modifier le profil patient
- `GET /api/patients/admin/all` - Liste des patients (admin)
- `PUT /api/patients/admin/:id` - Modifier un patient (admin)

## 🚀 Déploiement sur Vercel

### 1. Préparer l'application
```bash
# Build de l'application
npm run build
```

### 2. Déployer sur Vercel
```bash
# Installation de Vercel CLI (si nécessaire)
npm install -g vercel

# Déploiement
vercel --prod
```

### 3. Configuration des variables d'environnement sur Vercel
Dans le dashboard Vercel, ajoutez :
- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_SECRET`
- `NODE_ENV=production`

## 🏗️ Architecture du Projet

```
medical-appointment-app/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── contexts/       # Contextes React (Auth)
│   │   ├── pages/          # Pages de l'application
│   │   ├── lib/           # Utilitaires et services
│   │   └── main.tsx       # Point d'entrée
├── server/                 # Backend Node.js
│   ├── routes/            # Routes API
│   ├── auth.ts            # Authentification
│   ├── db.ts              # Configuration base de données
│   └── index.ts           # Serveur Express
├── shared/                 # Code partagé
│   └── schema.ts          # Schéma de base de données
├── scripts/               # Scripts utilitaires
│   └── seed.ts            # Script d'initialisation
└── package.json           # Dépendances et scripts
```

## 🔒 Sécurité

- **Authentification JWT** - Tokens sécurisés pour l'authentification
- **Chiffrement des mots de passe** - bcrypt avec salt
- **Validation des données** - Zod pour la validation côté serveur
- **Protection CORS** - Configuration sécurisée
- **Variables d'environnement** - Séparation des secrets

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajouter une nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Développé avec ❤️ pour améliorer l'expérience patient et faciliter la gestion des cabinets médicaux.**