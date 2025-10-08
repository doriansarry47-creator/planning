// Simple test script to verify authentication works
import fetch from 'node-fetch';

const BASE_URL = 'https://5173-i24eacjc6ct9sjnrcru5v-6532622b.e2b.dev';

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login...');
    
    const response = await fetch(`${BASE_URL}/api/auth/login?userType=admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'doriansarry47@gmail.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login successful!');
      console.log('User:', data.data.user);
      return data.data.token;
    } else {
      console.log('❌ Admin login failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Admin login error:', error);
    return null;
  }
}

async function testPatientRegistration() {
  try {
    console.log('📝 Testing patient registration...');
    
    const response = await fetch(`${BASE_URL}/api/auth/register?userType=patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@patient.fr',
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        firstName: 'Marie',
        lastName: 'Test',
        phoneNumber: '0123456789'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Patient registration successful!');
      console.log('User:', data.data.user);
      return data.data.token;
    } else {
      console.log('❌ Patient registration failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Patient registration error:', error);
    return null;
  }
}

async function testPatientLogin() {
  try {
    console.log('🔐 Testing patient login...');
    
    const response = await fetch(`${BASE_URL}/api/auth/login?userType=patient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'patient@test.fr',
        password: 'patient123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Patient login successful!');
      console.log('User:', data.data.user);
      return data.data.token;
    } else {
      console.log('❌ Patient login failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Patient login error:', error);
    return null;
  }
}

async function testPractitioners(token) {
  try {
    console.log('👩‍⚕️ Testing practitioners endpoint...');
    
    const response = await fetch(`${BASE_URL}/api/practitioners`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Practitioners fetch successful!');
      console.log('Practitioners:', data.data);
      return data.data;
    } else {
      console.log('❌ Practitioners fetch failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Practitioners fetch error:', error);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Starting authentication tests...\n');
  
  // Test admin login
  const adminToken = await testAdminLogin();
  console.log('');
  
  // Test patient login with existing account
  const patientToken = await testPatientLogin();
  console.log('');
  
  // Test patient registration with new account
  const newPatientToken = await testPatientRegistration();
  console.log('');
  
  // Test practitioners endpoint
  await testPractitioners();
  console.log('');
  
  console.log('🏁 Tests completed!');
}

runTests().catch(console.error);