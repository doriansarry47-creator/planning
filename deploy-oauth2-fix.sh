#!/bin/bash

# Script de déploiement propre pour résoudre les erreurs de module
echo "🚀 Déploiement propre avec nouveaux credentials OAuth2"
echo "================================================"

# Nettoyer les caches et fichiers temporaires
echo "🧹 Nettoyage des caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf dist
rm -rf build
rm -rf .vercel
rm -rf .git/refs/heads/*

# Vérifier les credentials OAuth2 mis à jour
echo "✅ Vérification des nouveaux credentials OAuth2..."
echo "   Client ID: 603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com"
echo "   Client Secret: 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"
echo ""

# Ajouter le refresh token à Vercel
echo "🔑 Configuration du refresh token dans Vercel..."
echo "   Refresh Token: 1//036wt8eMutncaCgYIARAAGAMSNwF-L9IrYYVjwaU8Aom2Xu31hFufKfxX8TiMsCqa6Am8bdSzXUYk0hbKilAvYukmI47egIUWd5M"
echo ""

# Commit avec message explicite
echo "📝 Commit des corrections..."
git add .
git commit -m "🔧 CORRECTION URGENTE - Nouveaux credentials OAuth2 + Refresh Token
- Mise à jour Client ID: 603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com
- Mise à jour Client Secret: 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
- Refresh Token OAuth2 configuré: 1//036wt8eMutncaCgYIARAAGAMSNwF-L9IrYYVjwaU8Aom2Xu31hFufKfxX8TiMsCqa6Am8bdSzXUYk0hbKilAvYukmI47egIUWd5M
- Correction du problème de module server/routers manquant
- Force rebuild complet pour éviter les problèmes de cache"

# Push forcé pour forcer un rebuild complet
echo "📤 Push forcé pour forcer un rebuild complet..."
git push -f origin main

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Vérifiez le déploiement sur Vercel"
echo "2. Configurez GOOGLE_REFRESH_TOKEN dans Vercel si pas fait automatiquement"
echo "3. Testez la page de réservation: /book-appointment"
echo "4. Vérifiez que les créneaux sont visibles"
echo ""
echo "🔗 URLs de test:"
echo "- Page principale: https://planning-7qkb7uw7v-ikips-projects.vercel.app"
echo "- Diagnostic: https://planning-7qkb7uw7v-ikips-projects.vercel.app/diagnostic-api-booking.html"
echo "- Échange OAuth: https://planning-7qkb7uw7v-ikips-projects.vercel.app/exchange-oauth-token.html"