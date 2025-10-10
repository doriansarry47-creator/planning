#!/bin/bash

# Script pour configurer les variables d'environnement Vercel
# Usage: ./scripts/setup-vercel-env.sh [VERCEL_TOKEN]

VERCEL_TOKEN=${1:-"3kz9fNzT1uuXw0qtqKjMUIO6"}

echo "Configuration des variables d'environnement Vercel..."

# Variables d'environnement critiques
echo "Configuration des variables critiques..."

# Base de données
echo "postgresql://neondb_owner:npg_b3x4u5v6w7x8y9z0@ep-rapid-flower-a4b5c6d7.us-east-1.aws.neon.tech/neondb?sslmode=require" | npx vercel --token $VERCEL_TOKEN env add DATABASE_URL production

# JWT Secret
echo "medplan-jwt-secret-key-2024-production" | npx vercel --token $VERCEL_TOKEN env add JWT_SECRET production

# Frontend URL
echo "https://webapp-6cwdticp7-ikips-projects.vercel.app" | npx vercel --token $VERCEL_TOKEN env add VITE_FRONTEND_URL production

# SMTP Configuration
echo "smtp.gmail.com" | npx vercel --token $VERCEL_TOKEN env add SMTP_HOST production
echo "587" | npx vercel --token $VERCEL_TOKEN env add SMTP_PORT production
echo "doriansarry@yahoo.fr" | npx vercel --token $VERCEL_TOKEN env add SMTP_USER production
echo "your-smtp-password-here" | npx vercel --token $VERCEL_TOKEN env add SMTP_PASS production

# Cron secret
echo "cron-secret-2024-medplan" | npx vercel --token $VERCEL_TOKEN env add CRON_SECRET production

echo "✅ Configuration terminée !"
echo "🌐 Application disponible à : https://webapp-6cwdticp7-ikips-projects.vercel.app"
echo ""
echo "📝 N'oubliez pas de :"
echo "   1. Configurer le mot de passe SMTP dans Vercel Dashboard"
echo "   2. Vérifier la configuration de la base de données"
echo "   3. Tester les API endpoints"