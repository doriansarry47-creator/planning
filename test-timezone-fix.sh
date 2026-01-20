#!/bin/bash

# Script de test pour vérifier la correction du timezone
# À exécuter après le déploiement en production

echo "🧪 TEST DE LA CORRECTION TIMEZONE"
echo "=================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de l'API
API_URL="https://webapp-frtjapec0-ikips-projects.vercel.app/api/trpc"

echo "📡 Test 1: Vérification du service (healthCheck)"
echo "------------------------------------------------"

response=$(curl -s -X POST "${API_URL}/booking.healthCheck" \
  -H "Content-Type: application/json" \
  -d '{"input":{}}')

if echo "$response" | grep -q '"status":"ok"'; then
  echo -e "${GREEN}✅ Service opérationnel${NC}"
  echo "$response" | jq '.result.data.json' 2>/dev/null || echo "$response"
else
  echo -e "${RED}❌ Service non disponible${NC}"
  echo "$response"
  exit 1
fi

echo ""
echo "📅 Test 2: Récupération des créneaux disponibles"
echo "------------------------------------------------"

# Date de test (aujourd'hui + 1 jour)
test_date=$(date -d "+1 day" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d 2>/dev/null)
echo "Date de test: $test_date"

response=$(curl -s -X POST "${API_URL}/booking.getAvailableSlots" \
  -H "Content-Type: application/json" \
  -d "{\"input\":{\"date\":\"${test_date}\"}}")

if echo "$response" | grep -q '"success":true'; then
  slot_count=$(echo "$response" | jq '.result.data.json.totalSlots' 2>/dev/null)
  if [ ! -z "$slot_count" ] && [ "$slot_count" -gt 0 ]; then
    echo -e "${GREEN}✅ ${slot_count} créneaux disponibles${NC}"
    echo "$response" | jq '.result.data.json.availableSlots' 2>/dev/null || echo "$response"
  else
    echo -e "${YELLOW}⚠️  Aucun créneau disponible pour cette date${NC}"
    echo "Astuce: Créez un événement 'DISPONIBLE' dans Google Calendar pour cette date"
  fi
else
  echo -e "${RED}❌ Erreur lors de la récupération des créneaux${NC}"
  echo "$response"
fi

echo ""
echo "📋 Test 3: Instructions pour le test manuel"
echo "--------------------------------------------"
echo ""
echo "Pour vérifier que le problème de timezone est résolu :"
echo ""
echo "1. 🗓️  Dans Google Calendar:"
echo "   - Créer un événement 'DISPONIBLE' pour demain à 19:00-20:00"
echo ""
echo "2. 💻 Dans l'application web:"
echo "   - Aller sur https://webapp-frtjapec0-ikips-projects.vercel.app/book-appointment"
echo "   - Sélectionner la date de demain"
echo "   - ${YELLOW}VÉRIFIER: Un créneau 19:00 doit apparaître${NC}"
echo "   - Sélectionner le créneau 19:00"
echo "   - Remplir le formulaire et confirmer"
echo ""
echo "3. 🔍 Vérification dans Google Calendar:"
echo "   - ${GREEN}✅ L'événement créé doit apparaître à 19:00 (PAS à 20:00)${NC}"
echo "   - Le titre doit être '🗓️ RDV - [Nom du patient]'"
echo ""
echo "4. 📊 Vérification des logs Vercel:"
echo "   - Aller sur https://vercel.com/ikips-projects/webapp/logs"
echo "   - Chercher: '[Vercel TRPC OAuth2] 📅 Création événement'"
echo "   - ${GREEN}VÉRIFIER: startDateTime doit être '2026-XX-XXT19:00:00'${NC}"
echo ""
echo "🎯 RÉSULTAT ATTENDU:"
echo "   Heure sélectionnée = Heure dans Calendar = 19:00 ✅"
echo ""
echo "❌ ANCIEN PROBLÈME (avant correction):"
echo "   Heure sélectionnée: 19:00"
echo "   Heure dans Calendar: 20:00 (décalage de +1h)"
echo ""
echo "=================================="
echo "🏁 Tests automatiques terminés"
echo "📝 Effectuez le test manuel ci-dessus pour validation complète"
