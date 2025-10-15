#!/bin/bash

# Script de démarrage du développement MedPlan
# Ce script démarre l'API et le Frontend en parallèle

echo "═══════════════════════════════════════════════════════"
echo "   🏥  MedPlan - Démarrage Développement"
echo "═══════════════════════════════════════════════════════"
echo ""

# Vérifier que node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
fi

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env manquant!"
    echo "   Création à partir de .env.example..."
    cp .env.example .env
    echo "   ⚠️  IMPORTANT: Configurez DATABASE_URL dans .env"
    echo ""
fi

echo "🚀 Démarrage des services..."
echo ""
echo "   📋 Comptes de test:"
echo "   👤 Admin:  doriansarry@yahoo.fr / admin123"
echo "   👥 Patient: patient.test@medplan.fr / patient123"
echo ""
echo "   🌐 URLs:"
echo "   • Frontend: http://localhost:5173"
echo "   • API: http://localhost:5000"
echo ""
echo "   📝 Pour arrêter: Ctrl+C"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Démarrer avec concurrently
npm run dev:full
