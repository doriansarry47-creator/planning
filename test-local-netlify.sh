#!/bin/bash

# Script de test local pour vérifier la configuration Netlify
# Usage: ./test-local-netlify.sh

set -e

echo "🧪 Test de la Configuration Netlify Locale"
echo "=========================================="
echo ""

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher un succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher une erreur
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour afficher un warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test 1: Vérifier que netlify.toml existe
echo "Test 1: Vérification de netlify.toml"
if [ -f "netlify.toml" ]; then
    success "netlify.toml trouvé"
else
    error "netlify.toml manquant"
    exit 1
fi
echo ""

# Test 2: Vérifier que client/_redirects existe
echo "Test 2: Vérification de client/_redirects"
if [ -f "client/_redirects" ]; then
    success "client/_redirects trouvé"
else
    error "client/_redirects manquant"
    exit 1
fi
echo ""

# Test 3: Vérifier la configuration du build dans package.json
echo "Test 3: Vérification de package.json"
if grep -q '"build"' package.json; then
    success "Script 'build' trouvé dans package.json"
else
    error "Script 'build' manquant dans package.json"
    exit 1
fi
echo ""

# Test 4: Installer les dépendances si nécessaire
echo "Test 4: Vérification des dépendances"
if [ ! -d "node_modules" ]; then
    warning "node_modules manquant, installation en cours..."
    npm install
    success "Dépendances installées"
else
    success "node_modules existe"
fi
echo ""

# Test 5: Lancer le build
echo "Test 5: Build de l'application"
npm run build
if [ $? -eq 0 ]; then
    success "Build réussi"
else
    error "Build échoué"
    exit 1
fi
echo ""

# Test 6: Vérifier que le dossier client/dist existe
echo "Test 6: Vérification du dossier de build"
if [ -d "client/dist" ]; then
    success "client/dist existe"
else
    error "client/dist manquant"
    exit 1
fi
echo ""

# Test 7: Vérifier que _redirects a été copié dans dist
echo "Test 7: Vérification de _redirects dans dist"
if [ -f "client/dist/_redirects" ]; then
    success "_redirects copié dans client/dist"
    echo "   Contenu:"
    cat client/dist/_redirects | sed 's/^/   /'
else
    error "_redirects manquant dans client/dist"
    exit 1
fi
echo ""

# Test 8: Vérifier que index.html existe dans dist
echo "Test 8: Vérification de index.html"
if [ -f "client/dist/index.html" ]; then
    success "index.html trouvé dans client/dist"
else
    error "index.html manquant dans client/dist"
    exit 1
fi
echo ""

# Test 9: Vérifier les assets
echo "Test 9: Vérification des assets"
if [ -d "client/dist/assets" ]; then
    ASSET_COUNT=$(ls -1 client/dist/assets | wc -l)
    success "Dossier assets trouvé avec $ASSET_COUNT fichier(s)"
else
    error "Dossier assets manquant"
    exit 1
fi
echo ""

# Test 10: Vérifier les fonctions Netlify
echo "Test 10: Vérification des fonctions Netlify"
if [ -d "netlify/functions" ]; then
    FUNC_COUNT=$(ls -1 netlify/functions/*.ts 2>/dev/null | wc -l)
    if [ $FUNC_COUNT -gt 0 ]; then
        success "Fonctions Netlify trouvées: $FUNC_COUNT"
        ls -1 netlify/functions/*.ts | sed 's/^/   - /'
    else
        warning "Aucune fonction TypeScript trouvée"
    fi
else
    warning "Dossier netlify/functions manquant (optionnel)"
fi
echo ""

# Test 11: Vérifier la taille du build
echo "Test 11: Analyse de la taille du build"
BUILD_SIZE=$(du -sh client/dist | cut -f1)
success "Taille totale du build: $BUILD_SIZE"
echo ""

# Test 12: Lister les fichiers dans dist
echo "Test 12: Contenu de client/dist"
echo "   Fichiers principaux:"
ls -lh client/dist | grep -v "^d" | awk '{print "   - " $9 " (" $5 ")"}'
echo ""

# Résumé final
echo "=========================================="
echo "🎉 Tous les tests sont passés !"
echo ""
echo "📊 Résumé:"
echo "   - Configuration Netlify: OK"
echo "   - Build: OK"
echo "   - Fichier _redirects: OK"
echo "   - Taille du build: $BUILD_SIZE"
echo ""
echo "🚀 Prochaines étapes:"
echo "   1. Installer Netlify CLI: npm install -g netlify-cli"
echo "   2. Se connecter: netlify login"
echo "   3. Déployer: netlify deploy --prod"
echo ""
echo "   OU via l'interface web:"
echo "   https://app.netlify.com/start"
echo ""
echo "📖 Consulter le guide: NETLIFY_DEPLOYMENT_GUIDE.md"
echo "=========================================="
