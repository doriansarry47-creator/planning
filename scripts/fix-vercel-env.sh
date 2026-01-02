#!/bin/bash

# Script pour corriger les variables d'environnement Vercel
# Usage: ./scripts/fix-vercel-env.sh

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

VERCEL_TOKEN="kuDm4VJIQ6l1WYu2ZNNCzweh"
PROJECT_NAME="planning-s6q2"

echo -e "${GREEN}🔧 Correction des variables d'environnement Vercel${NC}"
echo ""

# Récupérer le Project ID
echo -e "${YELLOW}📋 Récupération du Project ID...${NC}"
PROJECT_ID=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_NAME" | jq -r '.id')

if [ "$PROJECT_ID" == "null" ] || [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}❌ Erreur: Impossible de récupérer le Project ID${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Project ID: $PROJECT_ID${NC}"
echo ""

# Lire la clé privée depuis .env et la formater correctement pour Vercel
echo -e "${YELLOW}🔑 Lecture de la clé privée depuis .env...${NC}"

# Extraire la clé privée du fichier .env (entre guillemets)
PRIVATE_KEY=$(grep "^GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=" .env | sed 's/^GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=//' | sed 's/^"//' | sed 's/"$//')

# Vérifier que la clé a été extraite
if [ -z "$PRIVATE_KEY" ]; then
  echo -e "${RED}❌ Erreur: Impossible de lire la clé privée depuis .env${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Clé privée extraite${NC}"

# Fonction pour supprimer une variable
delete_env_var() {
  local var_name=$1
  echo -e "${YELLOW}🗑️  Suppression de $var_name...${NC}"
  
  # Récupérer l'ID de la variable
  ENV_ID=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env" | \
    jq -r ".envs[] | select(.key == \"$var_name\") | .id" | head -1)
  
  if [ ! -z "$ENV_ID" ] && [ "$ENV_ID" != "null" ]; then
    curl -s -X DELETE \
      -H "Authorization: Bearer $VERCEL_TOKEN" \
      "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$ENV_ID" > /dev/null
    echo -e "${GREEN}   ✓ $var_name supprimée${NC}"
  fi
}

# Fonction pour créer une variable
create_env_var() {
  local var_name=$1
  local var_value=$2
  local var_target=${3:-"production,preview,development"}
  
  echo -e "${YELLOW}➕ Création de $var_name...${NC}"
  
  # Échapper les caractères spéciaux pour JSON
  local escaped_value=$(echo "$var_value" | jq -Rs .)
  
  local response=$(curl -s -X POST \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
    -d "{
      \"key\": \"$var_name\",
      \"value\": $escaped_value,
      \"type\": \"encrypted\",
      \"target\": [\"production\", \"preview\", \"development\"]
    }")
  
  if echo "$response" | jq -e '.error' > /dev/null; then
    echo -e "${RED}   ✗ Erreur: $(echo $response | jq -r '.error.message')${NC}"
    return 1
  else
    echo -e "${GREEN}   ✓ $var_name créée${NC}"
  fi
}

echo -e "${GREEN}🚀 Correction des variables...${NC}"
echo ""

# 1. Supprimer l'ancienne GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
delete_env_var "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"

# 2. Créer la nouvelle avec la bonne valeur (les \n sont déjà dans $PRIVATE_KEY)
create_env_var "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY" "$PRIVATE_KEY"

# 3. Corriger DATABASE_URL (enlever le guillemet simple à la fin)
delete_env_var "DATABASE_URL"
create_env_var "DATABASE_URL" "postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# 4. Vérifier les autres variables importantes
echo ""
echo -e "${YELLOW}📝 Vérification des autres variables...${NC}"

# Variables qui doivent exister
declare -A required_vars=(
  ["GOOGLE_SERVICE_ACCOUNT_EMAIL"]="planningadmin@apaddicto.iam.gserviceaccount.com"
  ["GOOGLE_CALENDAR_ID"]="doriansarry47@gmail.com"
  ["GOOGLE_CLIENT_ID"]="603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com"
  ["GOOGLE_CLIENT_SECRET"]="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"
  ["GOOGLE_REFRESH_TOKEN"]="1//038BGdIzAbbjSCgYIARAAGAMSNwF-L9IrVFOUiSh0P4A4PvkAda2AimH1xhTfpGngQCIokTwWUFlOKZZaxB4cN2Xa2j0QlCGXjoY"
  ["GOOGLE_CALENDAR_EMAIL"]="doriansarry47@gmail.com"
  ["GOOGLE_CALENDAR_ICAL_URL"]="https://calendar.google.com/calendar/ical/doriansarry47%40gmail.com/private-2cf662f95113561ce5f879c3be6193c7/basic.ics"
  ["APP_URL"]="https://planning-s6q2.vercel.app"
)

for var_name in "${!required_vars[@]}"; do
  var_value="${required_vars[$var_name]}"
  
  # Vérifier si la variable existe déjà
  existing_value=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env" | \
    jq -r ".envs[] | select(.key == \"$var_name\") | .value" | head -1)
  
  if [ -z "$existing_value" ] || [ "$existing_value" == "null" ]; then
    echo -e "${YELLOW}   ℹ️  $var_name n'existe pas, création...${NC}"
    create_env_var "$var_name" "$var_value"
  else
    echo -e "${GREEN}   ✓ $var_name existe déjà${NC}"
  fi
done

# 5. Supprimer VITE_GOOGLE_API_KEY car elle est invalide
echo ""
echo -e "${YELLOW}🗑️  Suppression des variables invalides...${NC}"
delete_env_var "VITE_GOOGLE_API_KEY"

echo ""
echo -e "${GREEN}✅ Toutes les corrections ont été appliquées !${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Vous devez maintenant redéployer votre application:${NC}"
echo -e "   ${GREEN}vercel --prod${NC}"
echo ""
echo -e "${YELLOW}📝 Variables corrigées:${NC}"
echo "   ✓ GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (format corrigé)"
echo "   ✓ DATABASE_URL (guillemet enlevé)"
echo "   ✗ VITE_GOOGLE_API_KEY (supprimée - invalide)"
echo ""
