#!/bin/bash

echo "🚀 Configuration de Vercel pour MedPlan"
echo ""

# Token Vercel
VERCEL_TOKEN="hIcZzJfKyVMFAGh2QVfMzXc6"

# Variables d'environnement à configurer
echo "📝 Configuration des variables d'environnement..."

# DATABASE_URL
npx vercel env add DATABASE_URL production --token $VERCEL_TOKEN --yes << EOF
postgresql://neondb_owner:npg_1zDVUWYjNB4s@ep-young-darkness-abdxzpai-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
EOF

# JWT_SECRET
npx vercel env add JWT_SECRET production --token $VERCEL_TOKEN --yes << EOF
medplan-jwt-secret-key-2025-production-secure
EOF

# SESSION_SECRET
npx vercel env add SESSION_SECRET production --token $VERCEL_TOKEN --yes << EOF
medplan-session-secret-key-2025-production-secure
EOF

# NODE_ENV
npx vercel env add NODE_ENV production --token $VERCEL_TOKEN --yes << EOF
production
EOF

# VITE_API_URL
npx vercel env add VITE_API_URL production --token $VERCEL_TOKEN --yes << EOF
/api
EOF

echo ""
echo "✅ Variables d'environnement configurées"
echo ""
echo "🚀 Déploiement en production..."
npx vercel --prod --token $VERCEL_TOKEN --yes

echo ""
echo "✅ Déploiement terminé!"
