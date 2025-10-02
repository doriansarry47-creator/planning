#!/usr/bin/env node

/**
 * Script de vérification pré-déploiement
 * Vérifie que tous les éléments nécessaires sont en place pour Vercel
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

console.log('🔍 Vérification pré-déploiement Vercel...\n');

const errors = [];
const warnings = [];
const success = [];

// 1. Vérifier package.json
try {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  
  // Vérifier que better-sqlite3 est supprimé
  if (pkg.dependencies['better-sqlite3'] || pkg.devDependencies?.['better-sqlite3']) {
    errors.push('❌ better-sqlite3 détecté - incompatible avec Vercel');
  } else {
    success.push('✅ better-sqlite3 supprimé');
  }
  
  // Vérifier les dépendances essentielles
  const essentialDeps = ['@neondatabase/serverless', 'drizzle-orm', 'bcryptjs'];
  essentialDeps.forEach(dep => {
    if (pkg.dependencies[dep]) {
      success.push(`✅ ${dep} présent`);
    } else {
      errors.push(`❌ Dépendance manquante: ${dep}`);
    }
  });
  
} catch (error) {
  errors.push('❌ Erreur lecture package.json');
}

// 2. Vérifier vercel.json
try {
  const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));
  
  if (vercelConfig.functions?.['api/index.ts']?.runtime?.includes('@vercel/node')) {
    success.push('✅ Runtime Vercel configuré');
  } else {
    errors.push('❌ Runtime Vercel manquant dans functions');
  }
  
  if (vercelConfig.env?.DATABASE_URL) {
    warnings.push('⚠️ DATABASE_URL dans vercel.json (à déplacer vers dashboard)');
  } else {
    success.push('✅ Variables sensibles externalisées');
  }
  
} catch (error) {
  errors.push('❌ Erreur lecture vercel.json');
}

// 3. Vérifier l'API handler
if (existsSync('api/index.ts')) {
  try {
    const apiContent = readFileSync('api/index.ts', 'utf8');
    
    if (apiContent.includes('better-sqlite3')) {
      errors.push('❌ Référence better-sqlite3 dans api/index.ts');
    } else {
      success.push('✅ api/index.ts nettoyé');
    }
    
    if (apiContent.includes('setTimeout')) {
      success.push('✅ Timeout configuré dans handler');
    } else {
      warnings.push('⚠️ Pas de timeout dans handler');
    }
    
  } catch (error) {
    errors.push('❌ Erreur lecture api/index.ts');
  }
} else {
  errors.push('❌ api/index.ts introuvable');
}

// 4. Vérifier la config DB
if (existsSync('server/db.ts')) {
  try {
    const dbContent = readFileSync('server/db.ts', 'utf8');
    
    if (dbContent.includes('better-sqlite3')) {
      errors.push('❌ Référence better-sqlite3 dans server/db.ts');
    } else {
      success.push('✅ server/db.ts nettoyé');
    }
    
    if (dbContent.includes('@neondatabase/serverless')) {
      success.push('✅ Neon PostgreSQL configuré');
    } else {
      errors.push('❌ Neon PostgreSQL manquant');
    }
    
  } catch (error) {
    errors.push('❌ Erreur lecture server/db.ts');
  }
} else {
  errors.push('❌ server/db.ts introuvable');
}

// 5. Test de build
console.log('🔨 Test du build...');
try {
  const { execSync } = await import('child_process');
  execSync('npm run build', { stdio: 'pipe' });
  success.push('✅ Build réussi');
} catch (error) {
  errors.push(`❌ Erreur de build: ${error.message}`);
}

// Résultats
console.log('\n📋 RÉSULTATS DE LA VÉRIFICATION:\n');

if (success.length > 0) {
  console.log('🟢 SUCCÈS:');
  success.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('🟡 AVERTISSEMENTS:');
  warnings.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('🔴 ERREURS:');
  errors.forEach(msg => console.log(`   ${msg}`));
  console.log('');
  console.log('❌ Déploiement NON RECOMMANDÉ - Corrigez les erreurs d\'abord\n');
  process.exit(1);
} else {
  console.log('🎉 PRÊT POUR LE DÉPLOIEMENT VERCEL!\n');
  console.log('📝 N\'oubliez pas de:');
  console.log('   1. Configurer les variables d\'environnement sur Vercel');
  console.log('   2. DATABASE_URL, JWT_SECRET, SESSION_SECRET');
  console.log('   3. Déployer: git push origin main ou npx vercel --prod\n');
}