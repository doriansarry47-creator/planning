#!/bin/bash

TOKEN="O3K8wXmidmdiu79odvAz4KuG"
PROJECT_ID="prj_px2UcRuqcze9WorbfxfB563oTSGs"
TEAM_ID="team_u81NHuzzLA66cTYpIrIXjmq0"

# Lire les variables du .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)
JWT_SECRET=$(grep JWT_SECRET .env.production | cut -d '=' -f2-)
SESSION_SECRET=$(grep SESSION_SECRET .env.production | cut -d '=' -f2-)

# Configurer les variables d'environnement Vercel
echo "Configuration des variables d'environnement sur Vercel..."

# DATABASE_URL
vercel env add DATABASE_URL production --token "$TOKEN" --scope "$TEAM_ID" --yes <<< "$DATABASE_URL" || echo "DATABASE_URL déjà configuré"

# JWT_SECRET  
vercel env add JWT_SECRET production --token "$TOKEN" --scope "$TEAM_ID" --yes <<< "$JWT_SECRET" || echo "JWT_SECRET déjà configuré"

# SESSION_SECRET
vercel env add SESSION_SECRET production --token "$TOKEN" --scope "$TEAM_ID" --yes <<< "$SESSION_SECRET" || echo "SESSION_SECRET déjà configuré"

# VITE_API_URL
vercel env add VITE_API_URL production --token "$TOKEN" --scope "$TEAM_ID" --yes <<< "/api" || echo "VITE_API_URL déjà configuré"

# NODE_ENV
vercel env add NODE_ENV production --token "$TOKEN" --scope "$TEAM_ID" --yes <<< "production" || echo "NODE_ENV déjà configuré"

echo "Configuration terminée !"
