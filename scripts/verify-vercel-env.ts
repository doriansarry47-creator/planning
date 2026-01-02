#!/usr/bin/env tsx
/**
 * Script pour vérifier et configurer les variables d'environnement Vercel
 * 
 * Usage:
 * npm run tsx scripts/verify-vercel-env.ts
 * 
 * Ce script:
 * 1. Lit les variables depuis .env
 * 2. Vérifie qu'elles sont correctement configurées
 * 3. Génère une commande pour les configurer sur Vercel
 * 4. Peut optionnellement les uploader automatiquement
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface EnvVar {
  key: string;
  value: string;
  required: boolean;
  description: string;
}

const REQUIRED_ENV_VARS: EnvVar[] = [
  {
    key: 'DATABASE_URL',
    value: '',
    required: true,
    description: 'URL de connexion PostgreSQL (Neon)',
  },
  {
    key: 'GOOGLE_CALENDAR_ICAL_URL',
    value: '',
    required: true,
    description: 'URL iCal privée de votre Google Calendar',
  },
  {
    key: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    value: '',
    required: true,
    description: 'Email du Service Account Google',
  },
  {
    key: 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
    value: '',
    required: true,
    description: 'Clé privée du Service Account (format PEM)',
  },
  {
    key: 'GOOGLE_CALENDAR_ID',
    value: '',
    required: true,
    description: 'ID du calendrier Google (ex: votre@email.com)',
  },
  {
    key: 'GOOGLE_CLIENT_ID',
    value: '',
    required: false,
    description: 'Client ID OAuth Google (optionnel)',
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    value: '',
    required: false,
    description: 'Client Secret OAuth Google (optionnel)',
  },
  {
    key: 'GOOGLE_REFRESH_TOKEN',
    value: '',
    required: false,
    description: 'Refresh Token OAuth Google (optionnel)',
  },
  {
    key: 'NODE_ENV',
    value: 'production',
    required: true,
    description: 'Environnement Node.js',
  },
  {
    key: 'RESEND_API_KEY',
    value: '',
    required: false,
    description: 'Clé API Resend pour l\'envoi d\'emails',
  },
  {
    key: 'APP_URL',
    value: '',
    required: false,
    description: 'URL de l\'application en production',
  },
  {
    key: 'DEBUG_TOKEN',
    value: 'debug123',
    required: false,
    description: 'Token pour accéder à /api/debug',
  },
];

function loadEnvFile(filePath: string): Record<string, string> {
  const envVars: Record<string, string> = {};
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Fichier ${filePath} non trouvé`);
    return envVars;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    // Ignorer les commentaires et lignes vides
    if (line.trim().startsWith('#') || !line.trim()) continue;

    // Parser KEY=VALUE (gérer les valeurs multilignes)
    const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Nettoyer les guillemets
      let cleanValue = value.trim();
      if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
          (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
        cleanValue = cleanValue.slice(1, -1);
      }
      envVars[key] = cleanValue;
    }
  }

  return envVars;
}

function checkEnvVar(key: string, value: string, required: boolean): { ok: boolean; message: string } {
  if (!value || value.trim() === '') {
    if (required) {
      return { ok: false, message: `❌ ${key}: MANQUANT (REQUIS)` };
    }
    return { ok: true, message: `⚠️  ${key}: Non défini (optionnel)` };
  }

  // Vérifications spécifiques
  if (key === 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY') {
    if (!value.includes('-----BEGIN PRIVATE KEY-----')) {
      return { ok: false, message: `❌ ${key}: Format invalide (manque header PEM)` };
    }
    return { ok: true, message: `✅ ${key}: OK (${value.substring(0, 30)}...)` };
  }

  if (key === 'GOOGLE_CALENDAR_ICAL_URL') {
    if (!value.startsWith('https://calendar.google.com/calendar/ical/')) {
      return { ok: false, message: `❌ ${key}: URL invalide (doit commencer par https://calendar.google.com/calendar/ical/)` };
    }
    return { ok: true, message: `✅ ${key}: OK (${value.substring(0, 50)}...)` };
  }

  if (key === 'DATABASE_URL') {
    if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
      return { ok: false, message: `❌ ${key}: URL invalide (doit commencer par postgresql://)` };
    }
    return { ok: true, message: `✅ ${key}: OK (${value.substring(0, 40)}...)` };
  }

  if (key.includes('EMAIL')) {
    if (!value.includes('@')) {
      return { ok: false, message: `❌ ${key}: Email invalide` };
    }
    return { ok: true, message: `✅ ${key}: ${value}` };
  }

  // Valeurs courtes affichées en entier
  if (value.length < 50) {
    return { ok: true, message: `✅ ${key}: ${value}` };
  }

  // Valeurs longues tronquées
  return { ok: true, message: `✅ ${key}: OK (${value.substring(0, 30)}...)` };
}

function escapeShellValue(value: string): string {
  // Échapper les caractères spéciaux pour bash
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')
    .replace(/\n/g, '\\n');
}

function main() {
  console.log('🔍 Vérification des variables d\'environnement Vercel\n');
  console.log('=' .repeat(80));

  // Charger le fichier .env
  const envFilePath = path.join(process.cwd(), '.env');
  const envVars = loadEnvFile(envFilePath);

  console.log(`\n📁 Fichier .env chargé: ${Object.keys(envVars).length} variables trouvées\n`);

  // Vérifier chaque variable requise
  const results: Array<{ key: string; ok: boolean; message: string; value: string }> = [];
  let hasErrors = false;

  for (const envVar of REQUIRED_ENV_VARS) {
    const value = envVars[envVar.key] || envVar.value;
    const result = checkEnvVar(envVar.key, value, envVar.required);
    
    results.push({
      key: envVar.key,
      ok: result.ok,
      message: result.message,
      value: value,
    });

    console.log(result.message);
    console.log(`   ${envVar.description}`);
    console.log();

    if (!result.ok && envVar.required) {
      hasErrors = true;
    }
  }

  console.log('=' .repeat(80));

  if (hasErrors) {
    console.log('\n❌ ERREURS DÉTECTÉES - Corrigez le fichier .env avant de continuer\n');
    process.exit(1);
  }

  console.log('\n✅ Toutes les variables requises sont correctement configurées\n');

  // Générer les commandes Vercel CLI
  console.log('=' .repeat(80));
  console.log('\n📝 Commandes pour configurer Vercel (avec vercel-cli):\n');

  const validVars = results.filter(r => r.value && r.value.trim() !== '');
  
  for (const { key, value } of validVars) {
    const escapedValue = escapeShellValue(value);
    console.log(`vercel env add ${key} production <<< "${escapedValue}"`);
  }

  console.log('\n' + '=' .repeat(80));
  console.log('\n💡 Pour configurer toutes les variables automatiquement:\n');
  console.log('   1. Installez Vercel CLI: npm install -g vercel');
  console.log('   2. Connectez-vous: vercel login');
  console.log('   3. Liez le projet: vercel link');
  console.log('   4. Exécutez les commandes ci-dessus ou utilisez le dashboard Vercel\n');

  // Générer un fichier shell script
  const scriptPath = path.join(process.cwd(), 'setup-vercel-env-auto.sh');
  let scriptContent = '#!/bin/bash\n\n';
  scriptContent += '# Script généré automatiquement pour configurer Vercel\n';
  scriptContent += '# Usage: bash setup-vercel-env-auto.sh\n\n';
  scriptContent += 'echo "🔧 Configuration des variables d\'environnement Vercel..."\n\n';

  for (const { key, value } of validVars) {
    const escapedValue = escapeShellValue(value);
    scriptContent += `echo "Configuring ${key}..."\n`;
    scriptContent += `vercel env add ${key} production <<< "${escapedValue}"\n\n`;
  }

  scriptContent += 'echo "✅ Configuration terminée"\n';

  fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });
  console.log(`✅ Script shell généré: ${scriptPath}`);
  console.log('   Exécutez: bash setup-vercel-env-auto.sh\n');

  // Test de connexion iCal
  console.log('=' .repeat(80));
  console.log('\n🧪 Test de connexion iCal...\n');
  
  const icalUrl = envVars['GOOGLE_CALENDAR_ICAL_URL'];
  if (icalUrl) {
    try {
      console.log('Tentative de connexion à l\'URL iCal...');
      const output = execSync(`curl -sS -o /dev/null -w "%{http_code}" "${icalUrl}"`, { 
        encoding: 'utf-8',
        timeout: 10000,
      }).trim();
      
      if (output === '200') {
        console.log('✅ URL iCal accessible (HTTP 200)\n');
      } else {
        console.log(`⚠️  URL iCal retourne HTTP ${output}\n`);
      }
    } catch (error: any) {
      console.log(`❌ Erreur lors du test: ${error.message}\n`);
    }
  }

  console.log('=' .repeat(80));
  console.log('\n🎯 Prochaines étapes:\n');
  console.log('   1. Configurez les variables sur Vercel (dashboard ou CLI)');
  console.log('   2. Déployez: vercel --prod');
  console.log('   3. Testez avec: https://votre-app.vercel.app/api/debug?token=debug123&test=all');
  console.log('   4. Vérifiez les logs: vercel logs --follow\n');
}

main();
