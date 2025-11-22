#!/bin/bash

echo "🚀 Déploiement optimisé du système de prise de rendez-vous"
echo "========================================================"

# Vérifier si on est dans le bon répertoire
if [ ! -f "api/index.ts" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis le répertoire planning/"
    echo "Navigatez vers le répertoire planning/ et exécutez ce script à nouveau."
    exit 1
fi

# Sauvegarder l'index actuel
echo "💾 Sauvegarde de l'index actuel..."
cp api/index.ts "api/index-backup-$(date +%Y%m%d-%H%M%S).ts"

# Remplacer par la version optimisée
echo "🔄 Remplacement par la version optimisée..."
cp api/optimized-index.ts api/index.ts

echo "✅ Déploiement optimisé préparé!"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Configurez les variables d'environnement dans Vercel Dashboard:"
echo "   - GOOGLE_CLIENT_SECRET = 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"
echo "   - RESEND_API_KEY = re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd"
echo "   - VITE_GOOGLE_CLIENT_ID = 603850749287-8c0hrol8l5gulsal23mna3raeolmd2l2.apps.googleusercontent.com"
echo "   - VITE_GOOGLE_API_KEY = d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939"
echo "   - GOOGLE_SERVICE_ACCOUNT_EMAIL = planningadmin@apaddicto.iam.gserviceaccount.com"
echo "   - GOOGLE_PRIVATE_KEY = [votre_clé_privée]"
echo "   - GOOGLE_REFRESH_TOKEN = [à_obtenir_avec_oauth2]"
echo ""
echo "2. Obtenez le refresh token OAuth2:"
echo "   - Visitez: https://planning-7qkb7uw7v-ikips-projects.vercel.app/oauth-test.html"
echo "   - Suivez les instructions pour obtenir le refresh token"
echo ""
echo "3. Ajoutez GOOGLE_REFRESH_TOKEN dans les variables d'environnement"
echo ""
echo "4. Redéployez depuis Vercel Dashboard"
echo ""
echo "5. Testez à: https://planning-7qkb7uw7v-ikips-projects.vercel.app"