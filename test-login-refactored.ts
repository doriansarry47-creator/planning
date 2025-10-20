import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const testLogin = async (userType: 'admin' | 'patient', email: string, password_provided: string, expectSuccess: boolean) => {
  console.log(`📝 Testing ${userType} login (${email}) - expecting ${expectSuccess ? 'success' : 'failure'}`);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login?userType=${userType}`,
      {
        email: email,
        password: password_provided
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (expectSuccess) {
      console.log(`✅ ${userType} login successful!`);
      console.log('   - Token present:', !!response.data.data.token);
      console.log('   - User email:', response.data.data.user?.email);
    } else {
      console.log(`❌ Test failed: Expected failure, but got success for ${email}`);
    }
  } catch (error: any) {
    if (expectSuccess) {
      console.log(`❌ Test failed: Expected success, but got error for ${email}`);
      if (error.response) {
        console.log('   - Status:', error.response.status);
        console.log('   - Error:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('   - Error:', error.message);
      }
    } else {
        console.log(`✅ ${userType} login failed as expected!`);
        if (error.response) {
            console.log('   - Status:', error.response.status);
            console.log('   - Error:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('   - Error:', error.message);
        }
    }
  }
  console.log('---');
};

async function runTests() {
  console.log('🧪 Testing Refactored Login API (localhost:5000)\n');

  // Admin tests
  await testLogin('admin', 'doriansarry@yahoo.fr', 'admin123', true);
  await testLogin('admin', 'doriansarry@yahoo.fr', 'wrongpassword', false);
  await testLogin('admin', 'wrong@email.com', 'admin123', false);

  // Patient tests
  await testLogin('patient', 'patient.test@medplan.fr', 'patient123', true);
  await testLogin('patient', 'patient.test@medplan.fr', 'wrongpassword', false);
  await testLogin('patient', 'wrong@email.com', 'patient123', false);

  console.log('\n✅ Refactored Login API Tests completed!');
}

runTests().catch(console.error);
