#!/bin/bash

# Script de déploiement de la version optimisée de prise de rendez-vous
# Dorian Sarry - Planning System v2.0

echo "🚀 Déploiement de la version optimisée..."
echo "📅 Durée fixe: 60 minutes"
echo "📧 Intégration Google Calendar OAuth2"
echo "🎯 Interface patient optimisée"

# Étape 1: Sauvegarder l'ancienne API
echo "💾 Sauvegarde de l'API actuelle..."
if [ -f "api/index.ts" ]; then
    cp api/index.ts api/index-backup-$(date +%Y%m%d-%H%M%S).ts
    echo "✅ Ancienne API sauvegardée"
fi

# Étape 2: Remplacer par la version optimisée
echo "🔄 Remplacement par l'API optimisée..."
cp api/optimized-index.ts api/index.ts
echo "✅ API optimisée déployée"

# Étape 3: Copier la page optimisée
echo "🎨 Déploiement de la page optimisée..."
if [ -f "client/src/pages/BookAppointment.tsx" ]; then
    cp client/src/pages/BookAppointment.tsx client/src/pages/BookAppointment-backup-$(date +%Y%m%d-%H%M%S).tsx
    echo "✅ Ancienne page sauvegardée"
fi

# Remplacer par la version optimisée
cp client/src/pages/OptimizedBookAppointment.tsx client/src/pages/BookAppointment.tsx
echo "✅ Page optimisée déployée"

# Étape 4: Configuration des variables d'environnement
echo "⚙️ Configuration des variables d'environnement..."
echo "📋 Variables à configurer dans Vercel Dashboard:"
echo "   - GOOGLE_CLIENT_SECRET: [VOTRE_GOOGLE_CLIENT_SECRET]"
echo "   - RESEND_API_KEY: [VOTRE_RESEND_API_KEY]"
echo "   - VITE_GOOGLE_CLIENT_ID: [VOTRE_GOOGLE_CLIENT_ID]"
echo "   - VITE_GOOGLE_API_KEY: [VOTRE_GOOGLE_API_KEY]"

# Étape 5: Déployer sur Vercel
echo "🌐 Déploiement sur Vercel..."
read -p "Confirmer le déploiement sur Vercel avec le token? (y/n): " confirm
if [ "$confirm" = "y" ]; then
    npx vercel deploy --token elLE0T1tO8NW3WJhErL4GRh4 --prod --yes
else
    echo "❌ Déploiement annulé"
    exit 1
fi

echo "✅ Déploiement terminé!"
echo ""
echo "🎉 Version optimisée déployée avec succès!"
echo ""
echo "📋 Nouvelles fonctionnalités:"
echo "   ✓ Intégration Google Calendar OAuth2 pour doriansarry47@gmail.com"
echo "   ✓ Durée fixe de 60 minutes pour tous les RDV"
echo "   ✓ Interface patient uniquement (pas d'admin)"
echo "   ✓ Synchronisation automatique avec Google Agenda"
echo "   ✓ Envoi automatique d'emails de confirmation"
echo "   ✓ Rappel 24h avant le rendez-vous"
echo "   ✓ Design moderne et fluide"
echo "   ✓ Créneaux basés sur les vraies disponibilités"
echo ""
echo "🔗 Votre nouvelle page: https://planning-7qkb7uw7v-ikips-projects.vercel.app"
echo ""
echo "⚠️ IMPORTANT: Configurez les variables d'environnement dans Vercel Dashboard avant utilisation!"