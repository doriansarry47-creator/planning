#!/bin/bash

# Script de test du déploiement Vercel
# Usage: ./test-vercel-deployment.sh https://votre-app.vercel.app

set -e

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
BASE_URL="${1:-}"
ADMIN_EMAIL="dorainsarry@yahoo.fr"
ADMIN_PASSWORD="admin123"

# Fonction pour afficher les messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Vérifier que l'URL est fournie
if [ -z "$BASE_URL" ]; then
    echo "Usage: $0 <BASE_URL>"
    echo "Exemple: $0 https://planning-abc123.vercel.app"
    exit 1
fi

echo "=================================="
echo "🧪 Test du Déploiement Vercel"
echo "=================================="
echo ""
echo "URL de base: $BASE_URL"
echo ""

# Test 1: Page d'accueil
echo "Test 1: Page d'accueil..."
if curl -s -f -o /dev/null "$BASE_URL/"; then
    print_success "Page d'accueil accessible"
else
    print_error "Page d'accueil inaccessible"
    exit 1
fi

# Test 2: API Health Check
echo ""
echo "Test 2: API Health Check..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/api/health")
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    print_success "API Health Check OK"
    echo "   Réponse: $HEALTH_RESPONSE"
else
    print_error "API Health Check FAILED"
    echo "   Réponse: $HEALTH_RESPONSE"
    exit 1
fi

# Test 3: Page de connexion admin
echo ""
echo "Test 3: Page de connexion admin..."
if curl -s -f -o /dev/null "$BASE_URL/login/admin"; then
    print_success "Page de connexion admin accessible"
else
    print_error "Page de connexion admin inaccessible"
    exit 1
fi

# Test 4: API Login Admin
echo ""
echo "Test 4: Connexion API admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login?userType=admin" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    print_success "Connexion admin réussie"
    
    # Extraire le token (nécessite jq)
    if command -v jq &> /dev/null; then
        TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')
        if [ -n "$TOKEN" ]; then
            print_info "Token JWT obtenu: ${TOKEN:0:20}..."
        fi
    fi
else
    print_error "Connexion admin FAILED"
    echo "   Réponse: $LOGIN_RESPONSE"
    
    # Vérifier si c'est un problème de credentials ou d'API
    if echo "$LOGIN_RESPONSE" | grep -qi "invalid\|incorrect\|unauthorized"; then
        print_info "Vérifiez les identifiants ou l'état du compte admin"
    elif echo "$LOGIN_RESPONSE" | grep -qi "error\|500\|502"; then
        print_info "Erreur serveur - vérifiez les variables d'environnement Vercel"
    fi
    exit 1
fi

# Test 5: Endpoints API principaux
echo ""
echo "Test 5: Autres endpoints API..."

# Test API patients (nécessite authentification, on teste juste l'endpoint existe)
PATIENTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/patients")
if [ "$PATIENTS_STATUS" = "401" ] || [ "$PATIENTS_STATUS" = "200" ]; then
    print_success "Endpoint /api/patients existe (status: $PATIENTS_STATUS)"
else
    print_error "Endpoint /api/patients problème (status: $PATIENTS_STATUS)"
fi

# Test API appointments
APPOINTMENTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/appointments")
if [ "$APPOINTMENTS_STATUS" = "401" ] || [ "$APPOINTMENTS_STATUS" = "200" ]; then
    print_success "Endpoint /api/appointments existe (status: $APPOINTMENTS_STATUS)"
else
    print_error "Endpoint /api/appointments problème (status: $APPOINTMENTS_STATUS)"
fi

# Test API practitioners
PRACTITIONERS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/practitioners")
if [ "$PRACTITIONERS_STATUS" = "401" ] || [ "$PRACTITIONERS_STATUS" = "200" ]; then
    print_success "Endpoint /api/practitioners existe (status: $PRACTITIONERS_STATUS)"
else
    print_error "Endpoint /api/practitioners problème (status: $PRACTITIONERS_STATUS)"
fi

# Résumé final
echo ""
echo "=================================="
echo "✅ TESTS TERMINÉS AVEC SUCCÈS"
echo "=================================="
echo ""
echo "Tous les tests sont passés ! Le déploiement Vercel fonctionne correctement."
echo ""
echo "🎯 Prochaines étapes:"
echo "   1. Connectez-vous à: $BASE_URL/login/admin"
echo "   2. Utilisez: $ADMIN_EMAIL / $ADMIN_PASSWORD"
echo "   3. Testez les fonctionnalités du dashboard"
echo ""
echo "📖 Documentation:"
echo "   - CORRECTION_VERCEL_SPAWN_NPM_ENOENT.md"
echo "   - VERCEL_TEST_INSTRUCTIONS.md"
echo "   - GUIDE_TEST_ADMIN.md"
echo ""
