#!/bin/bash

# Script pour forcer un redéploiement sur Vercel
# après la mise à jour des variables d'environnement OAuth2
# Date: 2026-01-02

VERCEL_TOKEN="${VERCEL_TOKEN:-AifGaSeceQ8k5D75qjyRAjKZ}"
PROJECT_ID=$(cat .vercel/project.json 2>/dev/null | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Erreur: Impossible de récupérer le PROJECT_ID depuis .vercel/project.json"
  exit 1
fi

echo "🚀 Déclenchement d'un redéploiement sur Vercel..."
echo "Project ID: $PROJECT_ID"
echo ""

# Récupérer le dernier commit de la branche main
LATEST_COMMIT=$(git rev-parse HEAD)
echo "Latest commit: $LATEST_COMMIT"
echo ""

# Récupérer le repoId du projet
REPO_ID=$(curl -s -X GET \
  "https://api.vercel.com/v9/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | \
  grep -o '"repoId":[0-9]*' | cut -d':' -f2)

echo "Repository ID: $REPO_ID"
echo ""

# Forcer un nouveau déploiement en production
echo "📦 Création d'un nouveau déploiement..."

RESPONSE=$(curl -s -X POST \
  "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"webapp\",
    \"project\": \"$PROJECT_ID\",
    \"target\": \"production\",
    \"gitSource\": {
      \"type\": \"github\",
      \"repoId\": $REPO_ID,
      \"ref\": \"main\",
      \"sha\": \"$LATEST_COMMIT\"
    }
  }")

# Extraire l'URL du déploiement
DEPLOY_URL=$(echo "$RESPONSE" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
DEPLOY_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$DEPLOY_URL" ]; then
  echo "❌ Échec du déploiement"
  echo "Réponse de l'API:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

echo "✅ Déploiement créé avec succès!"
echo ""
echo "🔗 URL du déploiement: https://$DEPLOY_URL"
echo "📊 ID du déploiement: $DEPLOY_ID"
echo ""
echo "⏳ Le déploiement peut prendre quelques minutes..."
echo ""
echo "🔍 Pour suivre le déploiement:"
echo "   https://vercel.com/ikips-projects/webapp/deployments/$DEPLOY_ID"
echo ""
echo "📝 Une fois déployé, vérifiez les logs:"
echo "   curl -s https://api.vercel.com/v2/deployments/$DEPLOY_ID/events \\
     -H 'Authorization: Bearer $VERCEL_TOKEN' | jq"
