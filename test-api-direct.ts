import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testApiDirect() {
  console.log('🧪 Testing Direct API (localhost:5000)\n');
  
  // Test 1: Health check
  console.log('📝 Test 1: Health Check');
  try {
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check passed');
    console.log('Response:', healthResponse.data);
  } catch (error: any) {
    console.log('❌ Health check failed:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Admin Login
  console.log('📝 Test 2: Admin Login');
  console.log('Email: doriansarry@yahoo.fr');
  console.log('Password: admin123');
  
  try {
    const adminResponse = await axios.post(
      `${API_BASE_URL}/auth/login?userType=admin`,
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
    console.log('Response data keys:', Object.keys(adminResponse.data));
    console.log('Success:', adminResponse.data.success);
    console.log('Message:', adminResponse.data.message);
    if (adminResponse.data.data) {
      console.log('Token present:', !!adminResponse.data.data.token);
      console.log('User email:', adminResponse.data.data.user?.email);
    }
  } catch (error: any) {
    console.log('❌ Admin login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
  
  console.log('\n---\n');
  
  // Test 3: Patient Login
  console.log('📝 Test 3: Patient Login');
  console.log('Email: patient.test@medplan.fr');
  console.log('Password: patient123');
  
  try {
    const patientResponse = await axios.post(
      `${API_BASE_URL}/auth/login?userType=patient`,
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
    console.log('Response data keys:', Object.keys(patientResponse.data));
    console.log('Success:', patientResponse.data.success);
    console.log('Message:', patientResponse.data.message);
    if (patientResponse.data.data) {
      console.log('Token present:', !!patientResponse.data.data.token);
      console.log('User email:', patientResponse.data.data.user?.email);
    }
  } catch (error: any) {
    console.log('❌ Patient login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
  
  console.log('\n✅ Direct API Tests completed!');
}

testApiDirect().catch(console.error);
