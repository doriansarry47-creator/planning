#!/bin/bash

VERCEL_TOKEN="AifGaSeceQ8k5D75qjyRAjKZ"
PROJECT_ID="prj_Sm6mAh6xa9FlTLo9nFweWroZqeXt"

echo "🔧 Correction de GOOGLE_CALENDAR_ID sur Vercel..."

# Récupérer tous les IDs de la variable GOOGLE_CALENDAR_ID
echo "📋 Récupération de toutes les instances de GOOGLE_CALENDAR_ID..."
ENV_IDS=$(curl -s -X GET \
  "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" | \
  grep -o '"id":"[^"]*","key":"GOOGLE_CALENDAR_ID"' | \
  grep -o '"id":"[^"]*"' | \
  cut -d'"' -f4)

# Supprimer toutes les instances
if [ ! -z "$ENV_IDS" ]; then
  echo "$ENV_IDS" | while read ENV_ID; do
    if [ ! -z "$ENV_ID" ]; then
      echo "  🗑️  Suppression de l'instance ID: $ENV_ID..."
      curl -s -X DELETE \
        "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$ENV_ID" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" > /dev/null
      sleep 1
    fi
  done
fi

# Attendre un peu pour que les suppressions soient propagées
sleep 2

# Ajouter la nouvelle variable
echo "📝 Ajout de la nouvelle valeur..."
RESPONSE=$(curl -s -X POST \
  "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "GOOGLE_CALENDAR_ID",
    "value": "doriansarry47@gmail.com",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
  }')

if echo "$RESPONSE" | grep -q '"id"'; then
  echo "✅ GOOGLE_CALENDAR_ID configuré avec succès"
else
  echo "❌ Échec de la configuration"
  echo "Réponse: $RESPONSE"
  exit 1
fi

echo "✅ Terminé!"
