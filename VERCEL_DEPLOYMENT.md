# Guide de Déploiement Vercel - MedPlan

## 🚀 Application Déployée

**URL de l'application :** https://webapp-ochre-theta.vercel.app

## 📱 Comptes de Test

### Administrateur
- **Email :** admin@medplan.fr
- **Mot de passe :** admin123
- **URL de connexion :** https://webapp-ochre-theta.vercel.app/login/admin

### Patient
- **Email :** patient@test.fr
- **Mot de passe :** patient123
- **URL de connexion :** https://webapp-ochre-theta.vercel.app/login/patient

## ⚙️ Configuration Requise sur Vercel

Pour que l'application fonctionne correctement, vous devez configurer ces variables d'environnement dans le dashboard Vercel :

```bash
DATABASE_URL="postgresql://neondb_owner:Xt4A2tjN6jEv@ep-misty-butterfly-a2w6ocgr.eu-central-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="production-jwt-secret-key-change-this-in-production"
SESSION_SECRET="production-session-secret-key-change-this-in-production"
NODE_ENV="production"
```

## 🛠️ Initialisation de la Base de Données

Une fois l'application déployée, initialisez la base de données en faisant une requête POST à :

```
POST https://webapp-ochre-theta.vercel.app/api/init-db
```

Cela créera automatiquement :
- Les tables nécessaires
- Un compte administrateur de test
- Un compte patient de test  
- Des praticiens de test

## 🔧 Structure du Projet

- **Frontend :** React + TypeScript + Tailwind CSS (Vite)
- **Backend :** API Routes Vercel (Node.js)
- **Base de données :** PostgreSQL (Neon)
- **Authentification :** JWT + bcrypt
- **ORM :** Drizzle ORM

## 📂 Architecture

```
/
├── api/                    # API Routes Vercel
│   ├── auth/              # Authentification
│   ├── appointments/      # Gestion des RDV
│   ├── practitioners/     # Gestion des praticiens
│   └── init-db.ts        # Initialisation DB
├── src/                   # Frontend React
│   ├── components/        # Composants UI
│   ├── pages/            # Pages de l'application
│   ├── hooks/            # Hooks React
│   └── lib/              # Utilitaires
├── shared/               # Code partagé
│   └── schema.ts        # Schémas Drizzle
└── vercel.json          # Configuration Vercel
```

## 🎯 Fonctionnalités Testables

### En tant qu'Administrateur :
1. Connexion au dashboard admin
2. Gestion des praticiens
3. Visualisation des rendez-vous
4. Gestion des patients

### En tant que Patient :
1. Inscription/Connexion patient
2. Prise de rendez-vous
3. Visualisation de l'historique médical
4. Modification du profil

## 🐛 Debug et Logs

- **API Test :** https://webapp-ochre-theta.vercel.app/api/test
- **Vercel Dashboard :** https://vercel.com/ikips-projects/webapp
- **GitHub Repo :** https://github.com/doriansarry47-creator/planning

## 💡 Améliorations Futures

1. **Notification par email** (intégration SendGrid/Resend)
2. **Calendrier intégré** (Google Calendar API)
3. **Paiements en ligne** (Stripe)
4. **Téléconsultation** (WebRTC)
5. **Application mobile** (React Native)
6. **Multi-langue** (i18n)

---

✅ **Application prête pour les tests utilisateurs !**