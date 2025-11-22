#!/bin/bash

echo "🧹 Nettoyage des secrets de sécurité"
echo "===================================="

# Motifs de secrets à masquer
SECRET_CLIENT_ID="603850749287-8c0hrol8l5gulsal23mna3raeolmd2l2.apps.googleusercontent.com"
SECRET_CLIENT_SECRET="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"
SECRET_API_KEY="d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939"
SECRET_RESEND="re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd"

# Fichiers à nettoyer
FILES=(
  "RESUME_EXECUTIF_FINAL.md"
  "GUIDE_OPTIMISATION_COMPLETE.md"
  "deploy-oauth-fixed.sh"
  "deploy-optimized.sh"
  "test-optimized-system.html"
)

echo "🔧 Nettoyage des fichiers..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Nettoyage de: $file"
    
    # Masquer les secrets
    sed -i "s/$SECRET_CLIENT_ID/[VOTRE_GOOGLE_CLIENT_ID]/g" "$file"
    sed -i "s/$SECRET_CLIENT_SECRET/[VOTRE_GOOGLE_CLIENT_SECRET]/g" "$file"
    sed -i "s/$SECRET_API_KEY/[VOTRE_GOOGLE_API_KEY]/g" "$file"
    sed -i "s/$SECRET_RESEND/[VOTRE_RESEND_API_KEY]/g" "$file"
    
    echo "✅ $file nettoyé"
  else
    echo "⚠️  Fichier non trouvé: $file"
  fi
done

echo ""
echo "🎯 Nettoyage terminé! Secrets masqués avec des placeholders sécurisés."
echo "📝 Les variables d'environnement doivent être configurées dans Vercel Dashboard."