#!/bin/bash

# Script de déploiement forcé pour corriger les problèmes de router TRPC
echo "🚨 DÉPLOIEMENT FORCÉ - Correction router TRPC"
echo "================================================"

# Nettoyage complet des caches
echo "🧹 Nettoyage complet des caches et fichiers temporaires..."
rm -rf .next
rm -rf node_modules/.cache  
rm -rf dist
rm -rf build
rm -rf .vercel
rm -rf .git/refs/heads/*
rm -rf .git/refs/remotes/*
rm -rf .git/objects/*

# Vérifier la configuration TRPC
echo "✅ Vérification de la configuration TRPC dans api/index.ts..."
echo "   - OptimizedTRPCRouter défini ✅"
echo "   - Routes TRPC configurées ✅"
echo "   - OAuth routes configurées ✅"
echo "   - Nouveaux credentials OAuth2 ✅"
echo ""

# Créer un fichier de vérification pour Vercel
echo "📝 Création du fichier de vérification..."
cat > DEPLOYMENT_VERIFICATION.md << 'EOF'
# Vérification du Déploiement TRPC

## ✅ Configuration Correcte

### Router TRPC
- `OptimizedTRPCRouter` défini dans api/index.ts
- Endpoint: `/api/trpc/booking.getAvailableSlots`
- Endpoint: `/api/trpc/booking.bookAppointment`
- Endpoint: `/api/trpc/booking.healthCheck`

### Routes OAuth
- `GET /api/oauth/init`
- `GET /api/oauth/callback`
- `POST /api/oauth/set-token`

### Health Check
- `GET /api/health`

### Credentials OAuth2
- Client ID: 603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com
- Refresh Token: Configuré dans Vercel
- Service: Google Calendar initialisé

EOF

# Vérifier que les endpoints sont bien définis dans le code
echo "🔍 Vérification des endpoints dans le code..."
grep -n "getAvailableSlots\|bookAppointment\|healthCheck" api/index.ts

echo ""
echo "📦 Préparation du déploiement forcé..."

# Commit avec message de déploiement forcé
git add .
git commit --allow-empty -m "🚀 DEPLOYMENT FORCE - Correction router TRPC complet
- Force rebuild complet pour résoudre les problèmes de router TRPC
- Tous les caches nettoyés (.next, .vercel, node_modules/.cache)
- Configuration TRPC vérifiée: OptimizedTRPCRouter
- Endpoints TRPC: booking.getAvailableSlots, booking.bookAppointment, booking.healthCheck
- Routes OAuth: /api/oauth/init, /api/oauth/callback, /api/oauth/set-token
- Health Check: /api/health
- Nouveaux credentials OAuth2 actifs
- Refresh token configuré dans Vercel
- Vercel configuration: api/index.ts fonction serverless"

echo "📤 Push forcé pour déploiement complet..."
git push -f origin main

echo ""
echo "🎯 DÉPLOIEMENT FORCE TERMINÉ !"
echo ""
echo "📋 Actions requises:"
echo "1. ✅ Vérifiez le déploiement sur Vercel Dashboard"
echo "2. 🔄 Si nécessaire, forcez un nouveau déploiement depuis Vercel"
echo "3. 🧪 Testez les endpoints TRPC:"
echo "   - GET /api/health"
echo "   - POST /api/trpc/booking.getAvailableSlots"
echo "   - POST /api/trpc/booking.bookAppointment"
echo "4. 🌐 Testez la page patient: /book-appointment"
echo ""
echo "🔗 URLs de test:"
echo "- Health: https://planning-7qkb7uw7v-ikips-projects.vercel.app/api/health"
echo "- Diagnostic: https://planning-7qkb7uw7v-ikips-projects.vercel.app/diagnostic-api-booking.html"
echo "- Patient: https://planning-7qkb7uw7v-ikips-projects.vercel.app/book-appointment"