#!/bin/bash

# Script pour mettre à jour les variables d'environnement sur Vercel
# avec les nouvelles credentials OAuth Google
# Date: 2026-01-02
#
# USAGE:
#   Ce script lit les credentials depuis le fichier .env
#   Assurez-vous que .env contient les valeurs correctes avant d'exécuter
#
# SECURITE:
#   Ne jamais commit les secrets dans Git
#   Les credentials sont configurés localement via .env

VERCEL_TOKEN="${VERCEL_TOKEN:-AifGaSeceQ8k5D75qjyRAjKZ}"
PROJECT_ID=$(cat .vercel/project.json 2>/dev/null | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Erreur: Impossible de récupérer le PROJECT_ID depuis .vercel/project.json"
  echo "Assurez-vous que le projet Vercel est correctement configuré."
  exit 1
fi

echo "🔧 Mise à jour des variables d'environnement sur Vercel..."
echo "Project ID: $PROJECT_ID"
echo ""

# Variables OAuth 2.0 Google Calendar
# Mise à jour le 2026-01-02
# NOTE: Les valeurs réelles doivent être fournies via les variables d'environnement
# ou en modifiant ce fichier localement (ne pas commit les secrets)

# Nouvelles credentials OAuth2 Google Calendar (mise à jour 2026-01-02)
# Ces valeurs remplacent les anciennes credentials qui causaient l'erreur "deleted_client"
# ⚠️ SÉCURITÉ: Avant d'utiliser ce script, configurez ces variables localement
# ou via les variables d'environnement. Ne jamais commit les secrets dans Git.

# Option 1: Charger depuis .env (recommandé)
if [ -f .env ]; then
  source <(grep -v '^#' .env | grep -E 'GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|GOOGLE_REFRESH_TOKEN|GOOGLE_CALENDAR_ID' | sed 's/^/export /')
fi

# Option 2: Définir manuellement (à utiliser localement uniquement)
# GOOGLE_CLIENT_ID="votre_client_id_ici"
# GOOGLE_CLIENT_SECRET="votre_client_secret_ici"
# GOOGLE_REFRESH_TOKEN="votre_refresh_token_ici"
# GOOGLE_CALENDAR_ID="doriansarry47@gmail.com"

VARS=(
  "GOOGLE_CLIENT_ID:${GOOGLE_CLIENT_ID}"
  "GOOGLE_CLIENT_SECRET:${GOOGLE_CLIENT_SECRET}"
  "GOOGLE_REFRESH_TOKEN:${GOOGLE_REFRESH_TOKEN}"
  "GOOGLE_REDIRECT_URI:http://localhost:3000/oauth2callback"
  "GOOGLE_CALENDAR_ID:${GOOGLE_CALENDAR_ID}"
  "VITE_GOOGLE_CLIENT_ID:${GOOGLE_CLIENT_ID}"
)

# Variables à supprimer (anciennes)
OLD_VARS=(
  "603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for VAR in "${VARS[@]}"; do
  KEY=$(echo $VAR | cut -d':' -f1)
  VALUE=$(echo $VAR | cut -d':' -f2-)
  
  echo "📝 Configuration de $KEY..."
  
  # Récupérer l'ID de la variable existante si elle existe
  ENV_ID=$(curl -s -X GET \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" | \
    grep -o "\"id\":\"[^\"]*\",\"key\":\"$KEY\"" | \
    grep -o "\"id\":\"[^\"]*\"" | \
    cut -d'"' -f4 | head -n1)
  
  # Supprimer l'ancienne variable si elle existe
  if [ ! -z "$ENV_ID" ]; then
    echo "  🗑️  Suppression de l'ancienne valeur (ID: $ENV_ID)..."
    curl -s -X DELETE \
      "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$ENV_ID" \
      -H "Authorization: Bearer $VERCEL_TOKEN" \
      -H "Content-Type: application/json" > /dev/null
  fi
  
  # Ajouter la nouvelle variable
  RESPONSE=$(curl -s -X POST \
    "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"key\": \"$KEY\",
      \"value\": \"$VALUE\",
      \"type\": \"encrypted\",
      \"target\": [\"production\", \"preview\", \"development\"]
    }")
  
  # Vérifier si la requête a réussi
  if echo "$RESPONSE" | grep -q '"id"'; then
    echo "  ✅ $KEY configuré avec succès"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "  ❌ Échec de la configuration de $KEY"
    echo "  Réponse: $RESPONSE"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Résumé:"
echo "  ✅ Variables configurées avec succès: $SUCCESS_COUNT"
echo "  ❌ Variables échouées: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo "✅ Toutes les variables d'environnement ont été mises à jour avec succès!"
  echo ""
  echo "🔄 Pour appliquer les changements:"
  echo "   1. Redéployez votre application sur Vercel"
  echo "   2. Ou attendez le prochain déploiement automatique"
  echo ""
  echo "🔗 Vérifier sur Vercel:"
  echo "   https://vercel.com/dashboard/~/settings/environment-variables"
else
  echo "⚠️  Certaines variables n'ont pas pu être configurées."
  echo "   Veuillez vérifier les erreurs ci-dessus."
  exit 1
fi
