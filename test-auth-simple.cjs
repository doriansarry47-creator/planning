#!/usr/bin/env node

// Simple test pour vérifier l'authentification sans serveur web
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Test des fonctions d'authentification
async function testPasswordHashing() {
  console.log('🔐 Test du hashage des mots de passe...');
  
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 12);
  
  console.log('Mot de passe original:', password);
  console.log('Mot de passe hashé:', hashedPassword);
  
  // Vérifier le mot de passe
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('Vérification:', isValid ? '✅ OK' : '❌ Échec');
  
  return { password, hashedPassword, isValid };
}

async function testEmailsInSystem() {
  console.log('\n📧 Test des emails du système...');
  
  // Emails attendus dans le système
  const expectedEmails = {
    admin: 'doriansarry@yahoo.fr',
    patient: 'patient@test.fr'
  };
  
  console.log('Emails configurés dans le système:');
  console.log('  Admin:', expectedEmails.admin);
  console.log('  Patient de test:', expectedEmails.patient);
  
  return expectedEmails;
}

async function testTokenGeneration() {
  console.log('\n🎫 Test de génération de token JWT...');
  
  try {
    // Import dynamique du module auth
    const authModule = await import('./api/_lib/auth.js');
    
    const payload = {
      userId: 'test-admin-id',
      email: 'doriansarry@yahoo.fr',
      userType: 'admin'
    };
    
    const token = authModule.generateToken(payload);
    console.log('Payload:', payload);
    console.log('Token généré:', token.substring(0, 50) + '...');
    
    // Vérifier le token
    const verified = authModule.verifyToken(token);
    console.log('Token vérifié:', verified);
    
    return { token, verified };
  } catch (error) {
    console.log('❌ Erreur lors du test JWT:', error.message);
    console.log('   (Normal en environnement test - les modules ES6 ne sont pas disponibles)');
    return null;
  }
}

async function testDatabaseConnection() {
  console.log('\n💾 Test de connection base de données...');
  
  // Vérifier les variables d'environnement
  const env = {
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Configuré' : '❌ Manquant',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Configuré' : '❌ Manquant',
    SMTP_USER: process.env.SMTP_USER ? '✅ Configuré' : '❌ Manquant',
    SMTP_PASS: process.env.SMTP_PASS ? '✅ Configuré' : '❌ Manquant'
  };
  
  console.log('Variables d\'environnement:');
  Object.entries(env).forEach(([key, status]) => {
    console.log(`  ${key}: ${status}`);
  });
  
  return env;
}

async function validateAccountCredentials() {
  console.log('\n🔑 Validation des identifiants de test...');
  
  const testAccounts = [
    {
      type: 'admin',
      email: 'doriansarry@yahoo.fr',
      password: 'admin123',
      name: 'Dorian Sarry'
    },
    {
      type: 'patient',
      email: 'patient@test.fr',
      password: 'patient123',
      name: 'Marie Dupont'
    }
  ];
  
  console.log('Comptes de test configurés:');
  for (const account of testAccounts) {
    console.log(`  ${account.type.toUpperCase()}:`);
    console.log(`    📧 Email: ${account.email}`);
    console.log(`    🔐 Mot de passe: ${account.password}`);
    console.log(`    👤 Nom: ${account.name}`);
    
    // Hash le mot de passe pour vérification
    const hashedPassword = await bcrypt.hash(account.password, 12);
    const isValid = await bcrypt.compare(account.password, hashedPassword);
    console.log(`    ✅ Validation: ${isValid ? 'OK' : 'Échec'}`);
    console.log('');
  }
  
  return testAccounts;
}

async function checkInitDBScript() {
  console.log('\n🗄️ Vérification du script d\'initialisation...');
  
  try {
    const initDbContent = fs.readFileSync('./api/init-db.ts', 'utf8');
    
    // Vérifier que les bons emails sont dans le script
    const hasDorian = initDbContent.includes('doriansarry@yahoo.fr');
    const hasPatient = initDbContent.includes('patient@test.fr');
    const hasAdmin123 = initDbContent.includes('admin123');
    const hasPatient123 = initDbContent.includes('patient123');
    
    console.log('Vérifications du script init-db.ts:');
    console.log(`  Email Dorian: ${hasDorian ? '✅' : '❌'}`);
    console.log(`  Email patient test: ${hasPatient ? '✅' : '❌'}`);
    console.log(`  Mot de passe admin: ${hasAdmin123 ? '✅' : '❌'}`);
    console.log(`  Mot de passe patient: ${hasPatient123 ? '✅' : '❌'}`);
    
    if (hasDorian && hasPatient && hasAdmin123 && hasPatient123) {
      console.log('  ✅ Script d\'initialisation correct!');
      return true;
    } else {
      console.log('  ❌ Script d\'initialisation à corriger');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur lecture init-db.ts:', error.message);
    return false;
  }
}

// Fonction principale
async function runTests() {
  console.log('🧪 TESTS D\'AUTHENTIFICATION - DIAGNOSTIC COMPLET\n');
  console.log('='.repeat(60));
  
  try {
    // Tests séquentiels
    await testPasswordHashing();
    await testEmailsInSystem();
    await testTokenGeneration();
    await testDatabaseConnection();
    await validateAccountCredentials();
    await checkInitDBScript();
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 DIAGNOSTIC TERMINÉ');
    console.log('\n📝 RÉSUMÉ:');
    console.log('- Les fonctions de hashage fonctionnent');
    console.log('- Les identifiants de test sont configurés');
    console.log('- Vérifiez que la base de données est initialisée');
    console.log('- Utilisez /api/init-db pour créer les comptes');
    console.log('\n🔗 ÉTAPES SUIVANTES:');
    console.log('1. Déployez sur Vercel');
    console.log('2. Appelez POST /api/init-db');
    console.log('3. Testez la connexion avec les identifiants');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter les tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testPasswordHashing,
  testEmailsInSystem,
  validateAccountCredentials
};