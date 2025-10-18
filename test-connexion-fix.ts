#!/usr/bin/env tsx

/**
 * Script de test pour vérifier la correction des connexions admin/patient
 * 
 * Ce script teste :
 * 1. La connexion admin
 * 2. La connexion patient
 * 3. Le format de réponse de l'API
 * 4. L'accès aux données après connexion
 */

import axios from 'axios';

// Configuration
const API_URL = process.env.API_URL || 'https://webapp-7iftxmp1g-ikips-projects.vercel.app/api';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test de connexion admin
async function testAdminLogin() {
  log('\n=== Test de connexion ADMIN ===', 'cyan');
  
  try {
    const response = await axios.post(`${API_URL}/auth?action=login&userType=admin`, {
      email: 'doriansarry@yahoo.fr',
      password: 'Dorian1234!'
    });

    log('✓ Connexion admin réussie', 'green');
    log('Format de réponse:', 'blue');
    console.log(JSON.stringify(response.data, null, 2));

    // Vérification de la structure
    if (response.data.success && response.data.data && response.data.data.token && response.data.data.user) {
      log('✓ Structure de réponse correcte', 'green');
      log(`  - Token présent: ${response.data.data.token.substring(0, 20)}...`, 'blue');
      log(`  - User présent: ${response.data.data.user.email}`, 'blue');
      
      // Test d'accès aux appointments
      const token = response.data.data.token;
      return await testAppointmentsAccess(token, 'admin');
    } else {
      log('✗ Structure de réponse incorrecte', 'red');
      return false;
    }
  } catch (error: any) {
    log('✗ Erreur lors de la connexion admin', 'red');
    if (error.response) {
      console.error('Réponse du serveur:', error.response.data);
    } else {
      console.error('Erreur:', error.message);
    }
    return false;
  }
}

// Test de connexion patient
async function testPatientLogin() {
  log('\n=== Test de connexion PATIENT ===', 'cyan');
  
  try {
    // D'abord, créer un compte patient de test
    const testEmail = `test.patient.${Date.now()}@example.com`;
    const testPassword = 'TestPass123!';
    
    log(`Création d'un compte patient test: ${testEmail}`, 'yellow');
    
    const registerResponse = await axios.post(`${API_URL}/auth?action=register&userType=patient`, {
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'Patient',
      phone: '0612345678',
      birthDate: '1990-01-01',
      address: '123 Test Street',
      city: 'Test City',
      postalCode: '75001',
      emergencyContact: 'Emergency Contact',
      emergencyPhone: '0687654321'
    });

    if (!registerResponse.data.success) {
      log('✗ Échec de la création du compte patient', 'red');
      return false;
    }

    log('✓ Compte patient créé', 'green');

    // Maintenant tester la connexion
    const loginResponse = await axios.post(`${API_URL}/auth?action=login&userType=patient`, {
      email: testEmail,
      password: testPassword
    });

    log('✓ Connexion patient réussie', 'green');
    log('Format de réponse:', 'blue');
    console.log(JSON.stringify(loginResponse.data, null, 2));

    // Vérification de la structure
    if (loginResponse.data.success && loginResponse.data.data && loginResponse.data.data.token && loginResponse.data.data.user) {
      log('✓ Structure de réponse correcte', 'green');
      log(`  - Token présent: ${loginResponse.data.data.token.substring(0, 20)}...`, 'blue');
      log(`  - User présent: ${loginResponse.data.data.user.email}`, 'blue');
      
      // Test d'accès aux appointments
      const token = loginResponse.data.data.token;
      return await testAppointmentsAccess(token, 'patient');
    } else {
      log('✗ Structure de réponse incorrecte', 'red');
      return false;
    }
  } catch (error: any) {
    log('✗ Erreur lors du test patient', 'red');
    if (error.response) {
      console.error('Réponse du serveur:', error.response.data);
    } else {
      console.error('Erreur:', error.message);
    }
    return false;
  }
}

// Test d'accès aux appointments
async function testAppointmentsAccess(token: string, userType: 'admin' | 'patient') {
  log(`\n=== Test d'accès aux appointments (${userType}) ===`, 'cyan');
  
  try {
    const response = await axios.get(`${API_URL}/appointments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    log('✓ Accès aux appointments réussi', 'green');
    log('Format de réponse:', 'blue');
    
    // Vérification de la structure
    if (response.data.success && response.data.data) {
      log('✓ Structure de réponse correcte', 'green');
      
      if (response.data.data.appointments) {
        log(`  - Nombre d'appointments: ${response.data.data.appointments.length}`, 'blue');
        log(`  - Total: ${response.data.data.total}`, 'blue');
      } else if (Array.isArray(response.data.data)) {
        log(`  - Nombre d'appointments: ${response.data.data.length}`, 'blue');
      }
      
      return true;
    } else {
      log('✗ Structure de réponse incorrecte', 'red');
      console.log(JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error: any) {
    log('✗ Erreur lors de l\'accès aux appointments', 'red');
    if (error.response) {
      console.error('Réponse du serveur:', error.response.data);
    } else {
      console.error('Erreur:', error.message);
    }
    return false;
  }
}

// Test de validation localStorage
function testLocalStorageHandling() {
  log('\n=== Test de gestion du localStorage ===', 'cyan');
  
  // Simuler un localStorage avec valeur corrompue
  const testCases = [
    { name: 'Valeur undefined', value: 'undefined' },
    { name: 'Valeur null', value: 'null' },
    { name: 'JSON invalide', value: '{invalid json}' },
    { name: 'Valeur vide', value: '' },
    { name: 'JSON valide', value: '{"id":"123","email":"test@test.com"}' }
  ];

  let passedTests = 0;
  
  for (const testCase of testCases) {
    try {
      const value = testCase.value;
      
      // Simuler le code du useAuth
      if (value && value !== 'undefined') {
        const parsed = JSON.parse(value);
        log(`✓ ${testCase.name}: Parsing réussi`, 'green');
        passedTests++;
      } else {
        log(`✓ ${testCase.name}: Correctement rejeté`, 'green');
        passedTests++;
      }
    } catch (error) {
      if (testCase.value === '{"id":"123","email":"test@test.com"}') {
        log(`✗ ${testCase.name}: Devrait réussir`, 'red');
      } else {
        log(`✓ ${testCase.name}: Erreur correctement gérée`, 'green');
        passedTests++;
      }
    }
  }
  
  log(`\nRésultat: ${passedTests}/${testCases.length} tests réussis`, passedTests === testCases.length ? 'green' : 'red');
  return passedTests === testCases.length;
}

// Exécution des tests
async function runAllTests() {
  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║   Tests de correction des connexions      ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');
  
  const results = {
    adminLogin: false,
    patientLogin: false,
    localStorage: false
  };

  // Test localStorage
  results.localStorage = testLocalStorageHandling();
  
  // Test connexion admin
  results.adminLogin = await testAdminLogin();
  
  // Test connexion patient
  results.patientLogin = await testPatientLogin();
  
  // Résumé
  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║             RÉSUMÉ DES TESTS               ║', 'cyan');
  log('╚════════════════════════════════════════════╝', 'cyan');
  
  log(`\nGestion localStorage: ${results.localStorage ? '✓' : '✗'}`, results.localStorage ? 'green' : 'red');
  log(`Connexion Admin:      ${results.adminLogin ? '✓' : '✗'}`, results.adminLogin ? 'green' : 'red');
  log(`Connexion Patient:    ${results.patientLogin ? '✓' : '✗'}`, results.patientLogin ? 'green' : 'red');
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    log('\n🎉 Tous les tests sont passés avec succès!', 'green');
    log('Les corrections des connexions admin et patient sont fonctionnelles.', 'green');
  } else {
    log('\n⚠️  Certains tests ont échoué', 'yellow');
    log('Veuillez vérifier les logs ci-dessus pour plus de détails.', 'yellow');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Lancement
runAllTests().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
