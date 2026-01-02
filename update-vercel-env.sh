#!/bin/bash

# Script pour mettre à jour les variables d'environnement sur Vercel
# Token Vercel: NIEpYRYD6NDp3oqnOXorRNbV

VERCEL_TOKEN="NIEpYRYD6NDp3oqnOXorRNbV"
PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)

echo "🔧 Mise à jour des variables d'environnement sur Vercel..."
echo "Project ID: $PROJECT_ID"

# Variables OAuth 2.0 Google Calendar
VARS=(
  "GOOGLE_CLIENT_ID:603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com"
  "GOOGLE_CLIENT_SECRET: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"
  "GOOGLE_REFRESH_TOKEN:1//038BGdIzAbbjSCgYIARAAGAMSNwF-L9IrVFOUiSh0P4A4PvkAda2AimH1xhTfpGngQCIokTwWUFlOKZZaxB4cN2Xa2j0QlCGXjoY"
  "GOOGLE_CALENDAR_ID:doriansarry47@gmail.com"
)

for VAR in "${VARS[@]}"; do
  KEY=$(echo $VAR | cut -d':' -f1)
  VALUE=$(echo $VAR | cut -d':' -f2-)
  
  echo "📝 Configuration de $KEY..."
  
  # Supprimer l'ancienne variable si elle existe
  curl -X DELETE \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$KEY" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    2>/dev/null
  
  # Ajouter la nouvelle variable
  curl -X POST \
    "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"key\": \"$KEY\",
      \"value\": \"$VALUE\",
      \"type\": \"encrypted\",
      \"target\": [\"production\", \"preview\", \"development\"]
    }"
  
  echo ""
done

echo "✅ Variables d'environnement mises à jour avec succès!"
