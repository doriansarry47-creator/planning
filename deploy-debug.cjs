#!/usr/bin/env node

// Script de debug pour le déploiement Vercel
console.log('=== VERCEL DEPLOY DEBUG ===');
console.log('Node Version:', process.version);
console.log('Platform:', process.platform);
console.log('Working Directory:', process.cwd());

// Vérification des fichiers de config
const fs = require('fs');
const path = require('path');

console.log('\n=== CONFIG FILES ===');
console.log('vite.config.js exists:', fs.existsSync('vite.config.js'));
console.log('vite.config.cjs exists:', fs.existsSync('vite.config.cjs'));
console.log('package.json exists:', fs.existsSync('package.json'));
console.log('vercel.json exists:', fs.existsSync('vercel.json'));

// Vérification des dépendances
console.log('\n=== DEPENDENCIES CHECK ===');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasViteInDeps = 'vite' in (packageJson.dependencies || {});
  const hasViteInDevDeps = 'vite' in (packageJson.devDependencies || {});
  
  console.log('Vite in dependencies:', hasViteInDeps);
  console.log('Vite in devDependencies:', hasViteInDevDeps);
  console.log('Build script:', packageJson.scripts['build:client']);
  console.log('Vercel build script:', packageJson.scripts['vercel-build']);
} catch (e) {
  console.log('Error reading package.json:', e.message);
}

// Vérification de la structure des dossiers
console.log('\n=== DIRECTORY STRUCTURE ===');
console.log('client/ exists:', fs.existsSync('client'));
console.log('api/ exists:', fs.existsSync('api'));
console.log('server/ exists:', fs.existsSync('server'));
console.log('public/ exists:', fs.existsSync('public'));

if (fs.existsSync('client')) {
  console.log('client/src/ exists:', fs.existsSync('client/src'));
}

if (fs.existsSync('public')) {
  console.log('public files:', fs.readdirSync('public'));
}

console.log('\n=== DEBUG END ===');