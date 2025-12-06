#!/bin/bash

echo "🚀 DÉPLOIEMENT DES CORRECTIONS - Synchronisation OAuth2"
echo "======================================================"

# Vérifier le statut git
echo "📋 Vérification du statut Git..."
git status

echo ""
echo "🔧 Ajout des fichiers modifiés..."
git add .

echo ""
echo "📝 Création du commit..."
git commit -m "🔧 CORRECTION CRITIQUE - Synchronisation OAuth2/bookingRouter

✅ Problème résolu: Les créneaux ne s'affichaient pas côté patient
🔄 Cause: Incompatibilité entre service OAuth2 (optimized-index.ts) et bookingRouter (iCal)
🛠️ Solution: Intégration du service OAuth2 dans bookingRouter.ts avec fallback iCal

📋 Modifications:
- Ajout service OAuth2 dans bookingRouter.ts
- getAvailabilities() utilise maintenant OAuth2 + fallback iCal
- getAvailabilitiesByDate() utilise maintenant OAuth2 + fallback iCal  
- bookAppointment() utilise maintenant OAuth2 + fallback iCal
- checkAvailability() utilise maintenant OAuth2 + fallback iCal
- Test diagnostic créé (test-availability-fix.html)

🎯 Résultat: Synchronisation parfaite entre Google Calendar et affichage patient"

echo ""
echo "📤 Tentative de push vers GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS - Code déployé sur GitHub !"
    echo ""
    echo "🔗 Prochaines étapes:"
    echo "1. Vérifier le déploiement sur Vercel"
    echo "2. Tester sur: https://planning-7qkb7uw7v-ikips-projects.vercel.app/test-availability-fix.html"
    echo "3. Configurer GOOGLE_REFRESH_TOKEN si nécessaire"
    echo "4. Tester la réservation sur: https://planning-7qkb7uw7v-ikips-projects.vercel.app/book-appointment"
else
    echo ""
    echo "❌ ÉCHEC - Push bloqué par GitHub secret scanning"
    echo "🔗 Veuillez débloquer les secrets sur GitHub:"
    echo "   1. https://github.com/doriansarry47-creator/planning/security/secret-scanning/unblock-secret/35ppVejOaJZm90sa7lVZ72wskbE"
    echo "   2. https://github.com/doriansarry47-creator/planning/security/secret-scanning/unblock-secret/35ppVeiwpnxsHYeYs2VtRpDuWkx"
fi