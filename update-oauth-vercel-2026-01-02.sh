#!/bin/bash

# Script pour mettre à jour les credentials Google OAuth2 sur Vercel
# Date: 2026-01-02
# Raison: Fix de l'erreur "deleted_client" lors de l'accès à Google Calendar API

echo "🔧 Mise à jour des credentials Google OAuth2 sur Vercel..."
echo ""

# Charger les credentials depuis le fichier .env local
if [ ! -f .env ]; then
    echo "❌ Fichier .env introuvable !"
    echo "   Assurez-vous d'être dans le répertoire racine du projet."
    exit 1
fi

source .env

NEW_CLIENT_ID="$GOOGLE_CLIENT_ID"
NEW_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
NEW_REFRESH_TOKEN="$GOOGLE_REFRESH_TOKEN"

echo "📋 Credentials chargées depuis .env:"
echo "  CLIENT_ID: ${NEW_CLIENT_ID:0:20}..."
echo "  CLIENT_SECRET: ${NEW_CLIENT_SECRET:0:15}..."
echo "  REFRESH_TOKEN: ${NEW_REFRESH_TOKEN:0:15}..."
echo ""

# Vérifier si vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé."
    echo "   Installez-le avec: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI détecté"
echo ""

# Mettre à jour les variables d'environnement sur Vercel
echo "🚀 Mise à jour des variables sur Vercel..."
echo ""

# GOOGLE_CLIENT_ID
echo "1️⃣ Mise à jour de GOOGLE_CLIENT_ID..."
vercel env rm GOOGLE_CLIENT_ID production --yes 2>/dev/null || true
echo "$NEW_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID production

# GOOGLE_CLIENT_SECRET
echo "2️⃣ Mise à jour de GOOGLE_CLIENT_SECRET..."
vercel env rm GOOGLE_CLIENT_SECRET production --yes 2>/dev/null || true
echo "$NEW_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production

# GOOGLE_REFRESH_TOKEN
echo "3️⃣ Mise à jour de GOOGLE_REFRESH_TOKEN..."
vercel env rm GOOGLE_REFRESH_TOKEN production --yes 2>/dev/null || true
echo "$NEW_REFRESH_TOKEN" | vercel env add GOOGLE_REFRESH_TOKEN production

# VITE_GOOGLE_CLIENT_ID (frontend)
echo "4️⃣ Mise à jour de VITE_GOOGLE_CLIENT_ID (frontend)..."
vercel env rm VITE_GOOGLE_CLIENT_ID production --yes 2>/dev/null || true
echo "$NEW_CLIENT_ID" | vercel env add VITE_GOOGLE_CLIENT_ID production

echo ""
echo "✅ Variables d'environnement mises à jour sur Vercel"
echo ""
echo "📦 Redéploiement nécessaire pour prendre effet..."
echo "   Exécutez: vercel --prod"
echo ""
echo "🔍 Pour vérifier les variables:"
echo "   vercel env ls"
echo ""
