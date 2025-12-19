#!/usr/bin/env node

/**
 * Script pour configurer toutes les variables d'environnement sur Vercel
 * Usage: node scripts/setup-vercel-env.js
 */

const { execSync } = require('child_process');

const VERCEL_TOKEN = '4eR6qMjv73upx7CXVoHnK2Qr';

// Variables d'environnement à configurer
const envVars = [
  {
    name: 'DATABASE_URL',
    value: 'postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    envs: ['production', 'preview', 'development']
  },
  {
    name: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    value: 'planningadmin@apaddicto.iam.gserviceaccount.com',
    envs: ['production', 'preview', 'development']
  },
  {
    name: 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
    value: `-----BEGIN PRIVATE KEY-----
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
-----END PRIVATE KEY-----`,
    envs: ['production', 'preview', 'development']
  },
  {
    name: 'GOOGLE_CALENDAR_ID',
    value: 'doriansarry47@gmail.com',
    envs: ['production', 'preview', 'development']
  },
  {
    name: 'RESEND_API_KEY',
    value: 're_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd',
    envs: ['production', 'preview', 'development']
  },
  {
    name: 'APP_URL',
    value: 'https://webapp-frtjapec0-ikips-projects.vercel.app',
    envs: ['production', 'preview', 'development']
  },
  {
    name: 'NODE_ENV',
    value: 'production',
    envs: ['production', 'preview']
  },
  {
    name: 'ENABLE_AUTO_SYNC',
    value: 'true',
    envs: ['production', 'preview', 'development']
  }
];

console.log('🚀 Configuration des variables d\'environnement sur Vercel...\n');

let success = 0;
let errors = 0;

for (const envVar of envVars) {
  console.log(`📝 Configuration de ${envVar.name}...`);
  
  for (const env of envVar.envs) {
    try {
      console.log(`  → ${env}`);
      
      // Créer un fichier temporaire avec la valeur
      const fs = require('fs');
      const tmpFile = `/tmp/env_value_${Date.now()}.txt`;
      fs.writeFileSync(tmpFile, envVar.value);
      
      // Ajouter la variable via vercel env add
      const cmd = `cat ${tmpFile} | npx vercel env add ${envVar.name} ${env} --token ${VERCEL_TOKEN} --force --yes`;
      execSync(cmd, { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      // Supprimer le fichier temporaire
      fs.unlinkSync(tmpFile);
      
      success++;
    } catch (error) {
      console.error(`  ❌ Erreur pour ${env}:`, error.message);
      errors++;
    }
  }
  
  console.log(`  ✅ ${envVar.name} configuré\n`);
}

console.log('\n═══════════════════════════════════════════════════');
console.log(`✅ Configuration terminée!`);
console.log(`   ${success} variables ajoutées avec succès`);
if (errors > 0) {
  console.log(`   ${errors} erreurs`);
}
console.log('═══════════════════════════════════════════════════\n');

console.log('🔄 Prochaines étapes:');
console.log('   1. Vérifier les variables: npx vercel env ls --token ' + VERCEL_TOKEN);
console.log('   2. Redéployer: npx vercel --prod --token ' + VERCEL_TOKEN);
console.log('');
