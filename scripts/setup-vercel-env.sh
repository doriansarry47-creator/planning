#!/bin/bash
###############################################################################
# Script de Configuration Automatique des Variables d'Environnement Vercel
# 
# Ce script configure automatiquement toutes les variables d'environnement
# nécessaires sur Vercel pour votre application de planning
###############################################################################

set -e  # Arrêter en cas d'erreur

echo "🚀 Configuration des Variables d'Environnement Vercel"
echo "======================================================"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Erreur: Fichier .env introuvable${NC}"
    echo "Assurez-vous d'être dans le répertoire racine du projet"
    exit 1
fi

echo "📋 Lecture du fichier .env..."
echo ""

# Charger les variables depuis .env
source .env

# Vérifier que les variables essentielles sont présentes
if [ -z "$GOOGLE_SERVICE_ACCOUNT_EMAIL" ]; then
    echo -e "${RED}❌ GOOGLE_SERVICE_ACCOUNT_EMAIL manquante dans .env${NC}"
    exit 1
fi

if [ -z "$GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY" ]; then
    echo -e "${RED}❌ GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY manquante dans .env${NC}"
    exit 1
fi

if [ -z "$GOOGLE_CALENDAR_ID" ]; then
    echo -e "${RED}❌ GOOGLE_CALENDAR_ID manquante dans .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Variables essentielles trouvées${NC}"
echo ""

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI n'est pas installé${NC}"
    echo "Installation de Vercel CLI..."
    npm install -g vercel
fi

echo "🔐 Configuration des variables sur Vercel..."
echo ""

# Liste des variables à configurer
declare -A VARS=(
    ["GOOGLE_SERVICE_ACCOUNT_EMAIL"]="$GOOGLE_SERVICE_ACCOUNT_EMAIL"
    ["GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"]="$GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
    ["GOOGLE_CALENDAR_ID"]="$GOOGLE_CALENDAR_ID"
    ["DATABASE_URL"]="$DATABASE_URL"
    ["RESEND_API_KEY"]="$RESEND_API_KEY"
    ["APP_URL"]="$APP_URL"
    ["NODE_ENV"]="production"
)

# Compteurs
SUCCESS=0
FAILED=0

# Configurer chaque variable
for VAR_NAME in "${!VARS[@]}"; do
    VAR_VALUE="${VARS[$VAR_NAME]}"
    
    if [ -z "$VAR_VALUE" ]; then
        echo -e "${YELLOW}⏩ $VAR_NAME: Valeur vide, ignorée${NC}"
        continue
    fi
    
    echo -n "   Configuring $VAR_NAME... "
    
    # Ajouter la variable sur Vercel (production, preview, development)
    if vercel env add "$VAR_NAME" production <<< "$VAR_VALUE" &> /dev/null; then
        vercel env add "$VAR_NAME" preview <<< "$VAR_VALUE" &> /dev/null
        vercel env add "$VAR_NAME" development <<< "$VAR_VALUE" &> /dev/null
        echo -e "${GREEN}✅${NC}"
        ((SUCCESS++))
    else
        # Si la variable existe déjà, la mettre à jour
        if vercel env rm "$VAR_NAME" production --yes &> /dev/null; then
            vercel env add "$VAR_NAME" production <<< "$VAR_VALUE" &> /dev/null
            vercel env add "$VAR_NAME" preview <<< "$VAR_VALUE" &> /dev/null
            vercel env add "$VAR_NAME" development <<< "$VAR_VALUE" &> /dev/null
            echo -e "${YELLOW}🔄 (mise à jour)${NC}"
            ((SUCCESS++))
        else
            echo -e "${RED}❌${NC}"
            ((FAILED++))
        fi
    fi
done

echo ""
echo "======================================================"
echo -e "${GREEN}✅ Configuration terminée${NC}"
echo ""
echo "📊 Résumé:"
echo "   - Variables configurées: $SUCCESS"
echo "   - Échecs: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Certaines variables n'ont pas pu être configurées${NC}"
    echo "Veuillez les configurer manuellement sur vercel.com"
    exit 1
fi

echo "🎯 Prochaines étapes:"
echo "   1. Redéployer l'application: vercel --prod"
echo "   2. Vérifier que les créneaux s'affichent"
echo "   3. Tester la réservation d'un rendez-vous"
echo ""
echo "💡 Pour voir les variables configurées:"
echo "   vercel env ls"
echo ""
