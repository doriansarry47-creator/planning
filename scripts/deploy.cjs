#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Préparation du déploiement Vercel...');

// Vérifier que les fichiers nécessaires existent
const requiredFiles = [
  'package.json',
  'vercel.json',
  'vite.config.cjs',
  'api/index.ts'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Fichier manquant: ${file}`);
    allFilesExist = false;
  } else {
    console.log(`✅ ${file}`);
  }
});

// Vérifier la structure client
const clientDir = path.resolve(__dirname, '..', 'client');
if (!fs.existsSync(clientDir)) {
  console.error('❌ Répertoire client/ manquant');
  allFilesExist = false;
} else {
  console.log('✅ client/');
}

// Vérifier les variables d'environnement nécessaires
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const envFile = path.resolve(__dirname, '..', '.env.production');

if (fs.existsSync(envFile)) {
  console.log('✅ .env.production trouvé');
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} configuré`);
    } else {
      console.warn(`⚠️  ${envVar} manquant dans .env.production`);
    }
  });
} else {
  console.warn('⚠️  .env.production non trouvé');
}

if (allFilesExist) {
  console.log('\n🎉 Tous les fichiers nécessaires sont présents!');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Vérifiez vos variables d\'environnement sur Vercel');
  console.log('2. Lancez: vercel --prod');
  console.log('3. Ou commitez et poussez vers votre repository GitHub connecté');
} else {
  console.log('\n❌ Certains fichiers sont manquants. Veuillez les créer avant de déployer.');
  process.exit(1);
}