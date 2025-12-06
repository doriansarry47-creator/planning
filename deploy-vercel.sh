#!/bin/bash

# Script de Déploiement Vercel
# Date: 21 Novembre 2025

set -e  # Arrêter en cas d'erreur

echo "======================================"
echo "  Déploiement Planning App - Vercel  "
echo "======================================"
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VERCEL_TOKEN="${VERCEL_TOKEN:-1AV6yo1uRL6VT5xPZitq7S5p}"
PROJECT_DIR="/home/user/webapp"

cd "$PROJECT_DIR"

# Étape 1: Vérification de l'environnement
echo -e "${YELLOW}[1/6]${NC} Vérification de l'environnement..."
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}✗${NC} Vercel CLI n'est pas installé"
    echo -e "${YELLOW}→${NC} Installation de Vercel CLI..."
    npm install -g vercel
    echo -e "${GREEN}✓${NC} Vercel CLI installé"
else
    echo -e "${GREEN}✓${NC} Vercel CLI trouvé: $(vercel --version)"
fi
echo ""

# Étape 2: Vérification du code
echo -e "${YELLOW}[2/6]${NC} Vérification du code..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json trouvé"
else
    echo -e "${RED}✗${NC} package.json manquant"
    exit 1
fi

if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC} vercel.json trouvé"
else
    echo -e "${RED}✗${NC} vercel.json manquant"
    exit 1
fi
echo ""

# Étape 3: Test du build local (optionnel)
echo -e "${YELLOW}[3/6]${NC} Test du build local..."
echo -e "${YELLOW}→${NC} Cette étape peut être ignorée si vous voulez deployer directement"
read -p "Voulez-vous tester le build localement? (o/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${YELLOW}→${NC} Nettoyage de l'ancien build..."
    rm -rf client/dist
    echo -e "${YELLOW}→${NC} Exécution de 'npm run build'..."
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Build local réussi"
        echo -e "${GREEN}→${NC} Fichiers générés dans client/dist/"
        ls -lh client/dist/
    else
        echo -e "${RED}✗${NC} Build local échoué"
        exit 1
    fi
else
    echo -e "${YELLOW}→${NC} Build local ignoré"
fi
echo ""

# Étape 4: Vérification Git
echo -e "${YELLOW}[4/6]${NC} Vérification Git..."
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✓${NC} Pas de changements non committés"
else
    echo -e "${RED}✗${NC} Il y a des changements non committés"
    echo -e "${YELLOW}→${NC} Veuillez committer vos changements avant de déployer"
    git status --short
    exit 1
fi
echo ""

# Étape 5: Configuration du token Vercel
echo -e "${YELLOW}[5/6]${NC} Configuration du token Vercel..."
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}✗${NC} VERCEL_TOKEN n'est pas défini"
    echo -e "${YELLOW}→${NC} Définissez-le avec: export VERCEL_TOKEN=votre-token"
    exit 1
else
    echo -e "${GREEN}✓${NC} Token Vercel configuré"
fi
echo ""

# Étape 6: Déploiement
echo -e "${YELLOW}[6/6]${NC} Déploiement sur Vercel..."
echo -e "${YELLOW}→${NC} Environnement: ${GREEN}PRODUCTION${NC}"
echo -e "${YELLOW}→${NC} Branche: $(git branch --show-current)"
echo -e "${YELLOW}→${NC} Commit: $(git rev-parse --short HEAD)"
echo ""

read -p "Continuer le déploiement en PRODUCTION? (o/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${YELLOW}→${NC} Déploiement en cours..."
    echo ""
    
    # Déploiement avec token
    vercel --prod --token "$VERCEL_TOKEN" --yes
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓✓✓ DÉPLOIEMENT RÉUSSI ✓✓✓${NC}"
        echo ""
        echo -e "${GREEN}→${NC} Votre application est maintenant déployée!"
        echo ""
        echo "Prochaines étapes:"
        echo "1. Vérifier l'URL fournie ci-dessus"
        echo "2. Tester /api/health"
        echo "3. Vérifier que l'application se charge"
        echo "4. Configurer les variables d'environnement si nécessaire"
        echo ""
    else
        echo ""
        echo -e "${RED}✗✗✗ DÉPLOIEMENT ÉCHOUÉ ✗✗✗${NC}"
        echo ""
        echo "Consultez les logs ci-dessus pour plus de détails"
        echo "Ou visitez: https://vercel.com/dashboard"
        exit 1
    fi
else
    echo -e "${YELLOW}→${NC} Déploiement annulé"
    echo ""
    echo "Alternatives:"
    echo "1. Déploiement preview: vercel --token \$VERCEL_TOKEN"
    echo "2. Déploiement via Dashboard: https://vercel.com/dashboard"
    exit 0
fi

echo ""
echo "======================================"
echo "  Déploiement terminé avec succès!   "
echo "======================================"
