import axios from 'axios';

const API_BASE_URL = 'http://localhost:5173/api';

async function testLogin() {
  console.log('🧪 Testing API Login Endpoints\n');
  
  // Test 1: Admin Login
  console.log('📝 Test 1: Admin Login');
  console.log('Email: doriansarry@yahoo.fr');
  console.log('Password: admin123');
  
  try {
    const adminResponse = await axios.post(
      `${API_BASE_URL}/auth?action=login&userType=admin`,
      {
        email: 'doriansarry@yahoo.fr',
        password: 'admin123'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Admin login successful!');
    console.log('Response:', JSON.stringify(adminResponse.data, null, 2));
    console.log('Token:', adminResponse.data.token ? '✅ Present' : '❌ Missing');
  } catch (error: any) {
    console.log('❌ Admin login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
  
  console.log('\n---\n');
  
  // Test 2: Patient Login
  console.log('📝 Test 2: Patient Login');
  console.log('Email: patient.test@medplan.fr');
  console.log('Password: patient123');
  
  try {
    const patientResponse = await axios.post(
      `${API_BASE_URL}/auth?action=login&userType=patient`,
      {
        email: 'patient.test@medplan.fr',
        password: 'patient123'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Patient login successful!');
    console.log('Response:', JSON.stringify(patientResponse.data, null, 2));
    console.log('Token:', patientResponse.data.token ? '✅ Present' : '❌ Missing');
  } catch (error: any) {
    console.log('❌ Patient login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
  
  console.log('\n---\n');
  
  // Test 3: Invalid Login
  console.log('📝 Test 3: Invalid Login (should fail)');
  console.log('Email: wrong@example.com');
  console.log('Password: wrongpassword');
  
  try {
    await axios.post(
      `${API_BASE_URL}/auth?action=login&userType=admin`,
      {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }
    );
    console.log('⚠️ Unexpected success!');
  } catch (error: any) {
    console.log('✅ Correctly rejected invalid credentials');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error message:', error.response.data.message || error.response.data);
    }
  }
  
  console.log('\n✅ API Tests completed!');
}

testLogin().catch(console.error);
