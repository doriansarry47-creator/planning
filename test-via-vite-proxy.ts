import axios from 'axios';

const API_BASE_URL = 'http://localhost:5174/api';

async function testViaViteProxy() {
  console.log('🧪 Testing API via Vite Proxy (localhost:5174)\n');
  
  // Test 1: Admin Login
  console.log('📝 Test 1: Admin Login via Vite Proxy');
  console.log('URL: http://localhost:5174/api/auth?action=login&userType=admin');
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
    console.log('Success:', adminResponse.data.success);
    console.log('Message:', adminResponse.data.message);
    console.log('Token present:', !!adminResponse.data.data?.token);
    console.log('User email:', adminResponse.data.data?.user?.email);
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
  
  // Test 2: Patient Login
  console.log('📝 Test 2: Patient Login via Vite Proxy');
  console.log('URL: http://localhost:5174/api/auth?action=login&userType=patient');
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
    console.log('Success:', patientResponse.data.success);
    console.log('Message:', patientResponse.data.message);
    console.log('Token present:', !!patientResponse.data.data?.token);
    console.log('User email:', patientResponse.data.data?.user?.email);
  } catch (error: any) {
    console.log('❌ Patient login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
  
  console.log('\n✅ Vite Proxy Tests completed!');
}

testViaViteProxy().catch(console.error);
