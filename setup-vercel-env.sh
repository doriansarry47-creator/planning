#!/bin/bash

# Script pour configurer toutes les variables d'environnement sur Vercel
# Usage: ./setup-vercel-env.sh

VERCEL_TOKEN="4eR6qMjv73upx7CXVoHnK2Qr"

echo "🚀 Configuration des variables d'environnement sur Vercel..."
echo ""

# Fonction pour ajouter une variable d'environnement
add_env() {
    local name=$1
    local value=$2
    local environments=$3  # "production,preview,development"
    
    echo "📝 Ajout de $name..."
    
    # Pour chaque environnement
    IFS=',' read -ra ENVS <<< "$environments"
    for env in "${ENVS[@]}"; do
        echo "  → $env"
        echo "$value" | npx vercel env add "$name" "$env" --token "$VERCEL_TOKEN" --force 2>&1 | grep -v "Vercel CLI" || true
    done
    echo "  ✅ $name ajouté"
    echo ""
}

# 1. DATABASE_URL
add_env "DATABASE_URL" \
    "postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
    "production,preview,development"

# 2. GOOGLE_SERVICE_ACCOUNT_EMAIL
add_env "GOOGLE_SERVICE_ACCOUNT_EMAIL" \
    "planningadmin@apaddicto.iam.gserviceaccount.com" \
    "production,preview,development"

# 3. GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (la plus importante!)
add_env "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY" \
    "-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC466s/UvpWfdv2
kcCX2jzeshNKCPr2B0ZWLgK8rKOU1V8pShF1H5iZhLDxJohfbNrx8fR9cBTYEGD8
8exLG14M92RtJ8J68TyO9YZg5+AggPMpBeQgyPI4YPyzArjV1KmNFpsocBpB1OLU
D6VrS61LeGgKas9hk1OiwwtLjercBvESSE98474b//MCGHoA3LgjhuDGL8MrGjwI
/EApDVyDd8Z8G8eV12Tu4kaXqFZjf1+/twUJhIwteLDYNmahW27XlgvQs8J1vNzA
x+2Qr5NDWyaVAr0PPCDe/S+rXdTL3rXGA5zYiCg1MOOuCUtYPrihZv86Bg/7OfkC
JeBlzccvAgMBAAECggEAWTJ0O+tOjYHQJDNR7u16BwFmhIOoahxANTmkYFX14ci6
SjRMD27aMNLsdqXbigv74FCRWiBCLaZY4infjKr6xs5eRriy+pJ6X4rW8s9mMMeC
gvswew/ypndB7ScW+S3HSyLoXK0WPULu1tNlO0gZoxnFNaEnvy1NXmkufZdK/i4X
7SfDDfBtI/E0nKcEoNoYojoB3W6TW0x0ipo4qiSUU7EP8yxCo40Az1+s04boHWYU
E2vHtx1qc+HH7S2Xe8KpgiouqDufUkC+1Wp2rvEeEf/b3fSjg7cSggzz8bHkYQIN
4UgP2dWivBloxyFPKQ5E7OWqe+1t/OvrFpa5pzA5oQKBgQDx7Su4Dgv4TNdxXHUE
gGxCii0G55Y6YC/uoEzu0vyiup/VWIp0ep6Ahq6IsY4jh+gHWKHBnQjC1dTNnZmd
aEB0v3ECFsL4Szdmi/0pcPxphCwBrkCpRdvARdK1FiJf0ziqiLNNc4G4jgv2LcGL
VYLvxVWQssHDEjv57W4/dBdTfQKBgQDDrY1yO3jejeZz/p/aX7NWoQG1qLHSkXO2
ubWLBlYwLYqXR43oogLsRoJ8qpEM9K2FvYpexa8dx569HHFG9fhfBgHaUO/rMQgg
FriXzJTmaM82zMZn8K4qsAoifE6ucehLzbzAfqsNMn8quBN7Yjc/8TMXxIWvl4JJ
0rfzXkctGwKBgQDiXA9z/3CjuwI6R1AWDjM9bxwCQd4GcMlodQSG0VMgz42NiXLC
2ZhEmb/kln1wMVGgzgVLqyrvYjPiz3tUFJ96nUWXtsRmnboQcRtHEziZYdnrGKfX
uk2K8cndNgCjuHZk2dMqvNC7Ze07QkS9oh0JS5Jr+VXit8T2bHmjVXQd4QKBgFSd
EIPr6Zk6/QL9gLwaE9+K4cVeu/4UvVevOCx0wgI1Py+pVljY7bCj0Lr9uplCmGIz
ksjmbJHRBvg5e1Y2+H6Gh3iS9RvbaOsPSCUD5wM3IRtOMyEw9u8ojklZPWC7irp0
rYEDhQ3A3zJmxK3ey4tPzkshxLkoJ8OqZbbL9rUvAoGBAI+lcG08Ji7I+uTIyWy+
H8+gHLRrkmaHGBrimuauduav/dMHbuOcAa6ctKgYL5HWfpZOJiN0mFgObO+qHVG2
5vpBQGIaES555WGLcEK9I0HVW9TKtcnsL/s1mPr+4nVGN4Np8aLQy3GrShKJzEya
AQr9mE9XwRq/DgmC1DQMJXBc
-----END PRIVATE KEY-----" \
    "production,preview,development"

# 4. GOOGLE_CALENDAR_ID
add_env "GOOGLE_CALENDAR_ID" \
    "doriansarry47@gmail.com" \
    "production,preview,development"

# 5. RESEND_API_KEY
add_env "RESEND_API_KEY" \
    "re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd" \
    "production,preview,development"

# 6. APP_URL
add_env "APP_URL" \
    "https://webapp-frtjapec0-ikips-projects.vercel.app" \
    "production,preview,development"

# 7. NODE_ENV
add_env "NODE_ENV" \
    "production" \
    "production,preview"

# 8. ENABLE_AUTO_SYNC (optionnel mais recommandé)
add_env "ENABLE_AUTO_SYNC" \
    "true" \
    "production,preview,development"

echo "✅ Toutes les variables d'environnement ont été configurées!"
echo ""
echo "🔄 Maintenant, redéployez votre application:"
echo "   npx vercel --prod --token $VERCEL_TOKEN"
echo ""
