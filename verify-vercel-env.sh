#!/bin/bash

VERCEL_TOKEN="AifGaSeceQ8k5D75qjyRAjKZ"
PROJECT_ID="prj_Sm6mAh6xa9FlTLo9nFweWroZqeXt"

echo "🔍 Vérification des variables d'environnement Vercel..."
echo ""

REQUIRED_VARS=(
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "GOOGLE_REFRESH_TOKEN"
  "GOOGLE_REDIRECT_URI"
  "GOOGLE_CALENDAR_ID"
  "VITE_GOOGLE_CLIENT_ID"
)

for VAR_NAME in "${REQUIRED_VARS[@]}"; do
  EXISTS=$(curl -s -X GET \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" | \
    grep -o "\"key\":\"$VAR_NAME\"" | wc -l)
  
  if [ "$EXISTS" -gt 0 ]; then
    echo "✅ $VAR_NAME: Configuré ($EXISTS instance(s))"
  else
    echo "❌ $VAR_NAME: Manquant"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Vérification terminée!"
