#!/bin/bash

# Script de test fonctionnel pour le dashboard admin
# Date: 16 Novembre 2025

set -e

echo "🔍 Tests Fonctionnels - Dashboard Admin"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Test 1: Vérification de la structure des fichiers
echo "📁 Test 1: Structure des fichiers..."
FILES=(
    "client/src/App.tsx"
    "client/src/lib/trpc.ts"
    "client/src/pages/AdminDashboard.tsx"
    "client/src/components/admin/StatsCards.tsx"
    "client/src/components/admin/UsersManagement.tsx"
    "client/src/components/admin/ActivityLogs.tsx"
    "client/src/components/admin/AppointmentsManagement.tsx"
    "client/src/components/admin/AvailabilityManagement.tsx"
    "client/src/components/admin/PractitionersManagement.tsx"
    "client/src/components/admin/NotificationsSettings.tsx"
)

MISSING=0
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (manquant)"
        MISSING=$((MISSING + 1))
    fi
done
print_result $MISSING "Structure des fichiers"
echo ""

# Test 2: Vérification de l'intégration tRPC
echo "🔌 Test 2: Intégration tRPC..."
if grep -q "trpc.Provider" client/src/App.tsx && \
   grep -q "QueryClientProvider" client/src/App.tsx; then
    print_result 0 "Provider tRPC intégré"
else
    print_result 1 "Provider tRPC manquant"
fi
echo ""

# Test 3: Vérification TypeScript
echo "📝 Test 3: Validation TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    print_result 0 "Pas d'erreurs TypeScript"
else
    print_result 1 "Erreurs TypeScript détectées"
fi
echo ""

# Test 4: Build Production
echo "🏗️  Test 4: Build de production..."
if npm run build > /dev/null 2>&1; then
    print_result 0 "Build réussi"
    
    # Vérifier la taille du bundle
    if [ -f "dist/public/assets/index-*.js" ]; then
        BUNDLE_SIZE=$(du -h dist/public/assets/index-*.js | cut -f1)
        echo "  📦 Taille du bundle: $BUNDLE_SIZE"
    fi
else
    print_result 1 "Build échoué"
fi
echo ""

# Test 5: Vérification des imports
echo "📦 Test 5: Vérification des imports..."
IMPORT_ERRORS=0

# Vérifier que tous les composants importent correctement
for file in client/src/components/admin/*.tsx; do
    if [ -f "$file" ]; then
        # Vérifier les imports de base
        if ! grep -q "import React" "$file"; then
            echo "  ⚠️  $file: Import React manquant"
            IMPORT_ERRORS=$((IMPORT_ERRORS + 1))
        fi
    fi
done

print_result $IMPORT_ERRORS "Imports des composants"
echo ""

# Test 6: Vérification des dépendances critiques
echo "📚 Test 6: Dépendances critiques..."
DEPS_OK=0

CRITICAL_DEPS=(
    "@trpc/client"
    "@trpc/react-query"
    "@tanstack/react-query"
    "react"
    "react-dom"
    "wouter"
)

for dep in "${CRITICAL_DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo "  ✓ $dep"
    else
        echo "  ✗ $dep (manquant)"
        DEPS_OK=$((DEPS_OK + 1))
    fi
done

print_result $DEPS_OK "Dépendances critiques"
echo ""

# Test 7: Vérification des routes
echo "🛣️  Test 7: Configuration des routes..."
if grep -q "/admin" client/src/App.tsx && \
   grep -q "AdminDashboard" client/src/App.tsx && \
   grep -q "ProtectedRoute" client/src/App.tsx; then
    print_result 0 "Routes admin configurées"
else
    print_result 1 "Routes admin mal configurées"
fi
echo ""

# Test 8: Vérification du contexte d'authentification
echo "🔐 Test 8: Contexte d'authentification..."
if [ -f "client/src/contexts/AuthContext.tsx" ]; then
    if grep -q "AuthProvider" client/src/contexts/AuthContext.tsx && \
       grep -q "useAuth" client/src/contexts/AuthContext.tsx; then
        print_result 0 "AuthContext configuré"
    else
        print_result 1 "AuthContext incomplet"
    fi
else
    print_result 1 "AuthContext manquant"
fi
echo ""

# Test 9: Vérification des marqueurs de conflit Git
echo "⚠️  Test 9: Marqueurs de conflit Git..."
CONFLICTS=$(find client/src -name "*.tsx" -o -name "*.ts" | xargs grep -l "<<<<<<\|======\|>>>>>>" | wc -l)
if [ "$CONFLICTS" -eq 0 ]; then
    print_result 0 "Pas de marqueurs de conflit"
else
    print_result 1 "$CONFLICTS fichier(s) avec des marqueurs de conflit"
fi
echo ""

# Test 10: Vérification des console.log
echo "🐛 Test 10: Débug console.log..."
CONSOLE_LOGS=$(find client/src -name "*.tsx" -o -name "*.ts" | xargs grep -c "console.log" | grep -v ":0$" | wc -l)
if [ "$CONSOLE_LOGS" -gt 10 ]; then
    echo -e "${YELLOW}  ⚠️  $CONSOLE_LOGS fichiers avec console.log (nettoyage recommandé)${NC}"
else
    echo "  ✓ Nombre acceptable de console.log"
fi
echo ""

# Résumé final
echo "=========================================="
echo "📊 RÉSUMÉ DES TESTS"
echo "=========================================="
echo ""
echo "Tests exécutés : 10"
echo ""
echo "Pour tester manuellement:"
echo "  1. npm run dev"
echo "  2. Ouvrir http://localhost:5173/login"
echo "  3. Se connecter: doriansarry@yahoo.fr / admin123"
echo "  4. Vérifier le dashboard admin"
echo ""
echo "Pour déployer:"
echo "  1. git add ."
echo "  2. git commit -m 'fix: correction erreur tRPC context'"
echo "  3. git push origin main"
echo ""
echo "✅ Tests terminés!"
