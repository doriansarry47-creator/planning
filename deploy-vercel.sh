#!/bin/bash

# Script de Déploiement Automatique Vercel - MedPlan v3.0
# Usage: ./deploy-vercel.sh

set -e

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Token Vercel
VERCEL_TOKEN="hIcZzJfKyVMFAGh2QVfMzXc6"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                    ║${NC}"
echo -e "${BLUE}║         DÉPLOIEMENT VERCEL - MEDPLAN V3.0                        ║${NC}"
echo -e "${BLUE}║                                                                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    log_error "Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

log_info "Vérification de l'environnement..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé. Installez Node.js 20.x"
    exit 1
fi
log_success "Node.js $(node -v) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi
log_success "npm $(npm -v) détecté"

# Installer Vercel CLI si nécessaire
if ! command -v vercel &> /dev/null; then
    log_info "Installation de Vercel CLI..."
    npm install -g vercel
    log_success "Vercel CLI installé"
else
    log_success "Vercel CLI $(vercel -v) détecté"
fi

# Installer les dépendances
log_info "Installation des dépendances..."
npm install
log_success "Dépendances installées"

# Test du build
log_info "Test du build de production..."
npm run build
log_success "Build réussi"

# Nettoyage
log_info "Nettoyage des fichiers temporaires..."
rm -rf .vercel 2>/dev/null || true
log_success "Nettoyage terminé"

echo ""
log_info "Configuration du token Vercel..."
export VERCEL_TOKEN="$VERCEL_TOKEN"

echo ""
log_warning "IMPORTANT: Variables d'environnement requises sur Vercel:"
echo ""
echo "  1. DATABASE_URL - URL PostgreSQL Neon"
echo "  2. JWT_SECRET - Clé secrète JWT (générez avec: openssl rand -base64 32)"
echo "  3. SESSION_SECRET - Clé secrète session (générez avec: openssl rand -base64 32)"
echo "  4. NODE_ENV=production"
echo ""

read -p "Avez-vous configuré toutes les variables d'environnement sur Vercel? (o/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    log_warning "Configurez d'abord vos variables d'environnement sur Vercel:"
    echo "  https://vercel.com/dashboard"
    echo ""
    log_info "Ou utilisez la CLI:"
    echo "  vercel env add DATABASE_URL production --token $VERCEL_TOKEN"
    echo "  vercel env add JWT_SECRET production --token $VERCEL_TOKEN"
    echo "  vercel env add SESSION_SECRET production --token $VERCEL_TOKEN"
    exit 1
fi

echo ""
log_info "Déploiement sur Vercel..."
vercel --prod --token "$VERCEL_TOKEN" --yes

if [ $? -eq 0 ]; then
    echo ""
    log_success "Déploiement réussi!"
    echo ""
    
    log_info "Prochaines étapes:"
    echo ""
    echo "  1. Récupérer l'URL de déploiement:"
    echo "     vercel ls --token $VERCEL_TOKEN"
    echo ""
    echo "  2. Migrer la base de données:"
    echo "     npm run db:migrate"
    echo ""
    echo "  3. Initialiser le compte super admin:"
    echo "     npm run db:init-admin"
    echo ""
    echo "  4. Tester la connexion admin:"
    echo "     https://votre-domaine.vercel.app/login/admin"
    echo "     Email: admin@medplan.fr"
    echo "     Mot de passe: Admin2024!Secure"
    echo ""
    echo "  5. IMPORTANT: Changez le mot de passe admin après la première connexion!"
    echo ""
    
    log_success "Déploiement terminé avec succès! 🎉"
else
    echo ""
    log_error "Erreur lors du déploiement"
    log_info "Consultez les logs avec:"
    echo "  vercel logs --follow --token $VERCEL_TOKEN"
    exit 1
fi
