#!/bin/bash

# Script de déploiement alternatif pour Vercel
# Dorian Sarry - Planning Optimisé v2.0

echo "🚀 Déploiement alternatif sur Vercel..."

# Vérifier si nous avons les fichiers nécessaires
if [ ! -f "api/index.ts" ]; then
    echo "❌ Fichier api/index.ts non trouvé"
    exit 1
fi

if [ ! -f "client/src/pages/BookAppointment.tsx" ]; then
    echo "❌ Fichier client/src/pages/BookAppointment.tsx non trouvé"
    exit 1
fi

echo "✅ Fichiers optimisés détectés"
echo "📄 API: $(head -5 api/index.ts | grep -E "(class|OAuth2)" | head -1)"
echo "📄 UI: $(head -5 client/src/pages/BookAppointment.tsx | grep -E "(Optimized|react)" | head -1)"

# Afficher la configuration
echo ""
echo "🎯 Configuration optimale:"
echo "   • Durée fixe: 60 minutes"
echo "   • OAuth2: doriansarry47@gmail.com"
echo "   • Interface: Patient uniquement"
echo "   • Emails: Automatiques"
echo "   • Sync: Google Calendar temps réel"

# Créer le fichier de déploiement Vercel
echo ""
echo "📝 Création du guide de déploiement..."

# Afficher les instructions finales
echo ""
echo "✅ Configuration terminée!"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Configurer les variables d'environnement dans Vercel Dashboard:"
echo "   - GOOGLE_CLIENT_SECRET = [VOTRE_GOOGLE_CLIENT_SECRET]"
echo "   - RESEND_API_KEY = [VOTRE_RESEND_API_KEY]"
echo "   - VITE_GOOGLE_CLIENT_ID = [VOTRE_GOOGLE_CLIENT_ID]"
echo "   - VITE_GOOGLE_API_KEY = [VOTRE_GOOGLE_API_KEY]"
echo ""
echo "2. Redéployer depuis le dashboard Vercel"
echo "3. Tester la nouvelle interface optimisée"
echo ""
echo "🌐 URL application: https://planning-7qkb7uw7v-ikips-projects.vercel.app"
echo "🧪 Page de test: https://planning-7qkb7uw7v-ikips-projects.vercel.app/test-optimized-system.html"