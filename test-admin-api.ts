import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(process.cwd(), '.env.production') });

// Configuration de l'API
const API_BASE_URL = process.env.VITE_API_URL || '/api';
const VERCEL_URL = 'https://planning-jade.vercel.app'; // Modifier selon votre URL Vercel

// Compte de test admin
const ADMIN_EMAIL = 'dorainsarry@yahoo.fr';
const ADMIN_PASSWORD = 'admin123';

interface TestResult {
  name: string;
  status: 'success' | 'error';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
  results.push(result);
  const icon = result.status === 'success' ? '✅' : '❌';
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.details) {
    console.log('   Details:', JSON.stringify(result.details, null, 2));
  }
}

async function testHealthEndpoint() {
  try {
    const response = await axios.get(`${VERCEL_URL}${API_BASE_URL}/health`, {
      timeout: 10000,
    });
    
    if (response.status === 200) {
      logResult({
        name: 'Health Endpoint',
        status: 'success',
        message: 'API is healthy',
        details: response.data,
      });
    } else {
      logResult({
        name: 'Health Endpoint',
        status: 'error',
        message: `Unexpected status: ${response.status}`,
      });
    }
  } catch (error: any) {
    logResult({
      name: 'Health Endpoint',
      status: 'error',
      message: error.message,
    });
  }
}

async function testAdminLogin() {
  try {
    const response = await axios.post(
      `${VERCEL_URL}${API_BASE_URL}/auth/login?userType=admin`,
      {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.status === 200 && response.data.success) {
      logResult({
        name: 'Admin Login',
        status: 'success',
        message: 'Login successful',
        details: {
          userId: response.data.data.user.id,
          email: response.data.data.user.email,
          role: response.data.data.user.role,
          token: response.data.data.token ? 'Present' : 'Missing',
        },
      });
      return response.data.data.token;
    } else {
      logResult({
        name: 'Admin Login',
        status: 'error',
        message: 'Login failed',
        details: response.data,
      });
      return null;
    }
  } catch (error: any) {
    logResult({
      name: 'Admin Login',
      status: 'error',
      message: error.response?.data?.message || error.message,
      details: error.response?.data,
    });
    return null;
  }
}

async function testVerifyToken(token: string) {
  try {
    const response = await axios.get(
      `${VERCEL_URL}${API_BASE_URL}/auth/verify`,
      {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (response.status === 200 && response.data.success) {
      logResult({
        name: 'Verify Token',
        status: 'success',
        message: 'Token verification successful',
        details: response.data.data,
      });
    } else {
      logResult({
        name: 'Verify Token',
        status: 'error',
        message: 'Token verification failed',
        details: response.data,
      });
    }
  } catch (error: any) {
    logResult({
      name: 'Verify Token',
      status: 'error',
      message: error.response?.data?.message || error.message,
    });
  }
}

async function testGetPatients(token: string) {
  try {
    const response = await axios.get(
      `${VERCEL_URL}${API_BASE_URL}/patients`,
      {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (response.status === 200) {
      logResult({
        name: 'Get Patients',
        status: 'success',
        message: `Retrieved ${response.data.data?.length || 0} patients`,
        details: {
          count: response.data.data?.length || 0,
        },
      });
    } else {
      logResult({
        name: 'Get Patients',
        status: 'error',
        message: `Unexpected status: ${response.status}`,
      });
    }
  } catch (error: any) {
    logResult({
      name: 'Get Patients',
      status: 'error',
      message: error.response?.data?.message || error.message,
    });
  }
}

async function testGetAppointments(token: string) {
  try {
    const response = await axios.get(
      `${VERCEL_URL}${API_BASE_URL}/appointments`,
      {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (response.status === 200) {
      logResult({
        name: 'Get Appointments',
        status: 'success',
        message: `Retrieved ${response.data.data?.length || 0} appointments`,
        details: {
          count: response.data.data?.length || 0,
        },
      });
    } else {
      logResult({
        name: 'Get Appointments',
        status: 'error',
        message: `Unexpected status: ${response.status}`,
      });
    }
  } catch (error: any) {
    logResult({
      name: 'Get Appointments',
      status: 'error',
      message: error.response?.data?.message || error.message,
    });
  }
}

async function testGetAvailabilitySlots(token: string) {
  try {
    const response = await axios.get(
      `${VERCEL_URL}${API_BASE_URL}/availability-slots`,
      {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (response.status === 200) {
      logResult({
        name: 'Get Availability Slots',
        status: 'success',
        message: `Retrieved ${response.data.data?.length || 0} slots`,
        details: {
          count: response.data.data?.length || 0,
        },
      });
    } else {
      logResult({
        name: 'Get Availability Slots',
        status: 'error',
        message: `Unexpected status: ${response.status}`,
      });
    }
  } catch (error: any) {
    logResult({
      name: 'Get Availability Slots',
      status: 'error',
      message: error.response?.data?.message || error.message,
    });
  }
}

async function runTests() {
  console.log('\n🧪 Démarrage des tests API Admin...\n');
  console.log(`📍 URL de test: ${VERCEL_URL}${API_BASE_URL}`);
  console.log(`👤 Admin: ${ADMIN_EMAIL}\n`);
  
  // Test 1: Health endpoint
  await testHealthEndpoint();
  
  // Test 2: Admin login
  const token = await testAdminLogin();
  
  if (token) {
    // Test 3: Verify token
    await testVerifyToken(token);
    
    // Test 4: Get patients
    await testGetPatients(token);
    
    // Test 5: Get appointments
    await testGetAppointments(token);
    
    // Test 6: Get availability slots
    await testGetAvailabilitySlots(token);
  } else {
    console.log('\n⚠️  Login échoué, tests suivants ignorés\n');
  }
  
  // Résumé
  console.log('\n📊 Résumé des tests:\n');
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`✅ Réussis: ${successCount}`);
  console.log(`❌ Échoués: ${errorCount}`);
  console.log(`📝 Total: ${results.length}\n`);
  
  if (errorCount > 0) {
    console.log('❌ Erreurs détectées:\n');
    results.filter(r => r.status === 'error').forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`);
    });
  }
  
  return errorCount === 0;
}

// Exécution des tests
runTests()
  .then((success) => {
    if (success) {
      console.log('\n✅ Tous les tests ont réussi!\n');
      process.exit(0);
    } else {
      console.log('\n❌ Certains tests ont échoué.\n');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Erreur lors de l\'exécution des tests:', error);
    process.exit(1);
  });
