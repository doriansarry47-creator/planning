/**
 * Tests d'Acceptation Utilisateurs - MedPlan v3.0
 * 
 * Ce script teste toutes les fonctionnalités critiques de l'application
 * du point de vue de l'utilisateur (admin et patient).
 */

import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5173/api';
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'http://localhost:5173';

// Créer une instance axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Utilitaires de log
function logSection(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);
}

function logTest(name: string) {
  console.log(`${colors.blue}▶${colors.reset} ${name}...`);
}

function logSuccess(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message: string) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logInfo(message: string) {
  console.log(`${colors.yellow}ℹ${colors.reset} ${message}`);
}

// Variables globales pour les tests
let adminToken: string;
let patientToken: string;
let testPatientId: string;
let testAppointmentId: string;

// Test 1: Connexion Admin
async function testAdminLogin() {
  logTest('Test de connexion administrateur');
  
  try {
    const response = await api.post('/auth/login?userType=admin', {
      email: 'admin@medplan.fr',
      password: 'Admin2024!Secure',
    });

    if (response.data.success && response.data.data.token) {
      adminToken = response.data.data.token;
      logSuccess(`Connexion admin réussie - Token reçu`);
      logInfo(`Admin: ${response.data.data.user.name || response.data.data.user.email}`);
      return true;
    } else {
      logError('Connexion admin échouée - Token manquant');
      return false;
    }
  } catch (error: any) {
    logError(`Connexion admin échouée: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 2: Inscription Patient
async function testPatientRegistration() {
  logTest('Test d\'inscription patient');
  
  const timestamp = Date.now();
  const testPatient = {
    firstName: 'Jean',
    lastName: 'Test',
    email: `jean.test.${timestamp}@example.com`,
    password: 'TestPassword123!',
    phone: '0612345678',
    consultationReason: 'Test de douleurs chroniques pour validation du système',
    preferredSessionType: 'cabinet',
    isReferredByProfessional: false,
  };

  try {
    const response = await api.post('/auth/register?userType=patient', testPatient);

    if (response.data.success) {
      testPatientId = response.data.data.patient.id;
      logSuccess('Inscription patient réussie');
      logInfo(`Patient ID: ${testPatientId}`);
      logInfo(`Email: ${testPatient.email}`);
      return true;
    } else {
      logError('Inscription patient échouée');
      return false;
    }
  } catch (error: any) {
    logError(`Inscription patient échouée: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 3: Connexion Patient
async function testPatientLogin() {
  logTest('Test de connexion patient');
  
  const timestamp = Date.now() - 1000; // Utiliser l'email du patient créé précédemment
  
  try {
    const response = await api.post('/auth/login?userType=patient', {
      email: `jean.test.${timestamp}@example.com`,
      password: 'TestPassword123!',
    });

    if (response.data.success && response.data.data.token) {
      patientToken = response.data.data.token;
      logSuccess('Connexion patient réussie');
      return true;
    } else {
      logError('Connexion patient échouée');
      return false;
    }
  } catch (error: any) {
    logError(`Connexion patient échouée: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 4: Récupération des créneaux disponibles
async function testGetAvailableSlots() {
  logTest('Test de récupération des créneaux disponibles');
  
  try {
    const response = await api.get('/availability-slots', {
      headers: {
        Authorization: `Bearer ${patientToken}`,
      },
    });

    if (response.data.success || Array.isArray(response.data)) {
      const slots = response.data.data || response.data;
      logSuccess(`Créneaux disponibles récupérés: ${slots.length} créneaux`);
      return true;
    } else {
      logError('Échec de récupération des créneaux');
      return false;
    }
  } catch (error: any) {
    logError(`Erreur de récupération des créneaux: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 5: Création d'un rendez-vous
async function testCreateAppointment() {
  logTest('Test de création de rendez-vous');
  
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7); // Dans 7 jours
  
  const appointmentData = {
    date: futureDate.toISOString(),
    duration: 60,
    type: 'cabinet',
    reason: 'Consultation de suivi - Test automatisé',
    isReferredByProfessional: false,
  };

  try {
    const response = await api.post('/appointments', appointmentData, {
      headers: {
        Authorization: `Bearer ${patientToken}`,
      },
    });

    if (response.data.success) {
      testAppointmentId = response.data.data.id;
      logSuccess('Rendez-vous créé avec succès');
      logInfo(`Rendez-vous ID: ${testAppointmentId}`);
      logInfo(`Date: ${futureDate.toLocaleDateString('fr-FR')}`);
      return true;
    } else {
      logError('Échec de création du rendez-vous');
      return false;
    }
  } catch (error: any) {
    logError(`Erreur de création du rendez-vous: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 6: Récupération des rendez-vous admin
async function testAdminGetAppointments() {
  logTest('Test de récupération des rendez-vous (admin)');
  
  try {
    const response = await api.get('/appointments', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (response.data.success || Array.isArray(response.data)) {
      const appointments = response.data.data?.appointments || response.data.data || response.data;
      logSuccess(`Rendez-vous récupérés: ${appointments.length} rendez-vous`);
      return true;
    } else {
      logError('Échec de récupération des rendez-vous');
      return false;
    }
  } catch (error: any) {
    logError(`Erreur de récupération des rendez-vous: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 7: Récupération des patients (admin)
async function testAdminGetPatients() {
  logTest('Test de récupération des patients (admin)');
  
  try {
    const response = await api.get('/patients', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (response.data.success || Array.isArray(response.data)) {
      const patients = response.data.data?.patients || response.data.data || response.data;
      logSuccess(`Patients récupérés: ${patients.length} patients`);
      return true;
    } else {
      logError('Échec de récupération des patients');
      return false;
    }
  } catch (error: any) {
    logError(`Erreur de récupération des patients: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 8: Vérification du token admin
async function testAdminTokenVerification() {
  logTest('Test de vérification du token admin');
  
  try {
    const response = await api.get('/auth/verify', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (response.data.success && response.data.data.user) {
      logSuccess('Token admin vérifié avec succès');
      logInfo(`Type: ${response.data.data.user.userType}`);
      return true;
    } else {
      logError('Échec de vérification du token');
      return false;
    }
  } catch (error: any) {
    logError(`Erreur de vérification du token: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 9: Tentative d'accès non autorisé
async function testUnauthorizedAccess() {
  logTest('Test d\'accès non autorisé (sécurité)');
  
  try {
    await api.get('/patients'); // Sans token
    logError('ATTENTION: Accès non autorisé permis!');
    return false;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      logSuccess('Accès non autorisé correctement bloqué');
      return true;
    } else {
      logError(`Comportement de sécurité inattendu: ${error.message}`);
      return false;
    }
  }
}

// Test 10: Test des erreurs de validation
async function testValidationErrors() {
  logTest('Test de validation des données');
  
  try {
    await api.post('/auth/register?userType=patient', {
      firstName: 'A', // Trop court
      lastName: 'B', // Trop court
      email: 'invalid-email', // Email invalide
      password: '123', // Mot de passe trop court
    });
    logError('ATTENTION: Validation des données inefficace!');
    return false;
  } catch (error: any) {
    if (error.response?.status === 400) {
      logSuccess('Validation des données fonctionne correctement');
      return true;
    } else {
      logError(`Comportement de validation inattendu: ${error.message}`);
      return false;
    }
  }
}

// Fonction principale pour exécuter tous les tests
async function runAllTests() {
  console.log(`${colors.bright}${colors.green}`);
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                    ║');
  console.log('║         TESTS D\'ACCEPTATION UTILISATEURS - MEDPLAN V3.0          ║');
  console.log('║                                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  logInfo(`API Base URL: ${API_BASE_URL}`);
  logInfo(`Frontend URL: ${FRONTEND_URL}`);
  
  const results: { [key: string]: boolean } = {};

  // Tests d'authentification
  logSection('TESTS D\'AUTHENTIFICATION');
  results.adminLogin = await testAdminLogin();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.patientRegistration = await testPatientRegistration();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.patientLogin = await testPatientLogin();
  await new Promise(resolve => setTimeout(resolve, 500));

  // Tests de fonctionnalités
  logSection('TESTS DE FONCTIONNALITÉS');
  results.availableSlots = await testGetAvailableSlots();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.createAppointment = await testCreateAppointment();
  await new Promise(resolve => setTimeout(resolve, 500));

  // Tests admin
  logSection('TESTS ADMINISTRATION');
  results.adminGetAppointments = await testAdminGetAppointments();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.adminGetPatients = await testAdminGetPatients();
  await new Promise(resolve => setTimeout(resolve, 500));

  // Tests de sécurité
  logSection('TESTS DE SÉCURITÉ');
  results.tokenVerification = await testAdminTokenVerification();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.unauthorizedAccess = await testUnauthorizedAccess();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.validationErrors = await testValidationErrors();

  // Résumé des résultats
  logSection('RÉSUMÉ DES TESTS');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r === true).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log(`${colors.bright}Tests réussis:${colors.reset} ${colors.green}${passedTests}${colors.reset}/${totalTests}`);
  console.log(`${colors.bright}Tests échoués:${colors.reset} ${colors.red}${failedTests}${colors.reset}/${totalTests}`);
  console.log(`${colors.bright}Taux de réussite:${colors.reset} ${successRate}%\n`);

  // Détail des résultats
  console.log('Détail des tests:');
  Object.entries(results).forEach(([name, passed]) => {
    const icon = passed ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`  ${icon} ${name}`);
  });

  console.log();

  if (passedTests === totalTests) {
    console.log(`${colors.green}${colors.bright}🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS! 🎉${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠️  CERTAINS TESTS ONT ÉCHOUÉ - VÉRIFIEZ LA CONFIGURATION ⚠️${colors.reset}\n`);
    process.exit(1);
  }
}

// Exécution des tests
runAllTests().catch((error) => {
  console.error(`${colors.red}Erreur fatale lors de l'exécution des tests:${colors.reset}`, error);
  process.exit(1);
});
