#!/bin/bash
# Script de configuration et déploiement Vercel
# Application de Thérapie Sensorimotrice - Dorian Sarry

set -e

echo "🚀 Configuration et Déploiement Vercel"
echo "======================================"
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher des messages colorés
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    warning "Vercel CLI n'est pas installé. Installation en cours..."
    npm install -g vercel
    success "Vercel CLI installé avec succès"
else
    success "Vercel CLI est déjà installé"
fi

echo ""
echo "📋 Étapes de configuration :"
echo ""

# Étape 1 : Login Vercel
echo "1️⃣  Connexion à Vercel..."
echo "   Vous allez être redirigé vers votre navigateur pour vous authentifier."
echo ""
read -p "   Appuyez sur Entrée pour continuer..."

if vercel login; then
    success "Connexion réussie à Vercel"
else
    error "Échec de la connexion à Vercel"
    exit 1
fi

echo ""

# Étape 2 : Configuration du projet
echo "2️⃣  Configuration du projet..."
echo ""

if vercel link; then
    success "Projet lié avec succès"
else
    error "Échec de la liaison du projet"
    exit 1
fi

echo ""

# Étape 3 : Configuration des variables d'environnement
echo "3️⃣  Configuration des variables d'environnement"
echo ""
warning "Vous devez configurer les variables suivantes dans Vercel Dashboard :"
echo ""
echo "   Variables OBLIGATOIRES :"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   • DATABASE_URL           (URL de votre base Neon)"
echo "   • JWT_SECRET             (Clé secrète pour les tokens)"
echo "   • SESSION_SECRET         (Clé secrète pour les sessions)"
echo "   • VITE_FRONTEND_URL      (URL de votre app Vercel)"
echo "   • VITE_API_URL           (valeur: /api)"
echo ""
echo "   Variables OPTIONNELLES :"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   • SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  (pour emails)"
echo "   • TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN       (pour SMS)"
echo "   • CRON_SECRET                                 (pour tâches cron)"
echo ""

read -p "Avez-vous déjà configuré ces variables dans Vercel Dashboard ? (o/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]]; then
    success "Variables d'environnement configurées"
else
    warning "Configurez les variables avant de déployer !"
    echo ""
    echo "   Accédez à : https://vercel.com/dashboard"
    echo "   → Sélectionnez votre projet"
    echo "   → Settings → Environment Variables"
    echo ""
    read -p "Appuyez sur Entrée une fois les variables configurées..."
fi

echo ""

# Étape 4 : Test de build local
echo "4️⃣  Test de build local..."
echo ""

if npm run build; then
    success "Build local réussi !"
else
    error "Échec du build local"
    exit 1
fi

echo ""

# Étape 5 : Déploiement
echo "5️⃣  Déploiement sur Vercel..."
echo ""

read -p "Voulez-vous déployer maintenant ? (o/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo ""
    echo "Choisissez le type de déploiement :"
    echo "1) Preview (déploiement de test)"
    echo "2) Production (déploiement final)"
    echo ""
    read -p "Votre choix (1 ou 2) : " -n 1 -r choice
    echo ""
    echo ""
    
    if [[ $choice == "1" ]]; then
        if vercel; then
            success "Déploiement Preview réussi !"
            echo ""
            warning "N'oubliez pas d'initialiser la base de données :"
            echo "   → Accédez à : https://votre-url-preview.vercel.app/api/init-db"
        else
            error "Échec du déploiement Preview"
            exit 1
        fi
    elif [[ $choice == "2" ]]; then
        if vercel --prod; then
            success "Déploiement Production réussi !"
            echo ""
            warning "N'oubliez pas d'initialiser la base de données :"
            echo "   → Accédez à : https://votre-url-prod.vercel.app/api/init-db"
            echo ""
            warning "Ensuite, connectez-vous en tant qu'admin :"
            echo "   → URL : https://votre-url-prod.vercel.app/login/admin"
            echo "   → Email : doriansarry@yahoo.fr"
            echo "   → Mot de passe : DoraineAdmin2024!"
            echo "   → ⚠️  CHANGEZ LE MOT DE PASSE IMMÉDIATEMENT !"
        else
            error "Échec du déploiement Production"
            exit 1
        fi
    else
        warning "Choix invalide. Déploiement annulé."
        exit 1
    fi
else
    warning "Déploiement annulé"
    echo ""
    echo "Pour déployer plus tard, utilisez :"
    echo "  • vercel          (pour preview)"
    echo "  • vercel --prod   (pour production)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "Configuration terminée !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Ressources utiles :"
echo "   • Dashboard Vercel : https://vercel.com/dashboard"
echo "   • Documentation : voir VERCEL_DEPLOYMENT_FINAL.md"
echo "   • Logs en temps réel : vercel logs"
echo ""
success "Bonne utilisation de votre application ! 🎉"
echo ""
