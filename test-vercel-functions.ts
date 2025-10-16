#!/usr/bin/env tsx

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  data?: any;
}

async function runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
  try {
    const data = await testFn();
    console.log(`✅ ${name} - Success`);
    return { name, success: true, data };
  } catch (error: any) {
    console.log(`❌ ${name} - Failed: ${error.message}`);
    return { name, success: false, error: error.message };
  }
}

async function testHealthCheck() {
  const response = await axios.get(`${API_BASE_URL}/health`);
  return response.data;
}

async function testAdminLogin() {
  const response = await axios.post(`${API_BASE_URL}/auth/login?userType=admin`, {
    email: 'doriansarry@yahoo.fr',
    password: 'admin123'
  });
  return response.data;
}

async function testPatientLogin() {
  const response = await axios.post(`${API_BASE_URL}/auth/login?userType=patient`, {
    email: 'patient.test@medplan.fr',
    password: 'patient123'
  });
  return response.data;
}

async function testTokenVerification(token: string, userType: string) {
  const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

async function main() {
  console.log('🧪 Testing New Vercel Functions Structure\n');

  const results: TestResult[] = [];

  // Test Health Check
  results.push(await runTest('Health Check', testHealthCheck));

  // Test Admin Login
  const adminLoginResult = await runTest('Admin Login', testAdminLogin);
  results.push(adminLoginResult);

  // Test Patient Login
  const patientLoginResult = await runTest('Patient Login', testPatientLogin);
  results.push(patientLoginResult);

  // Test Token Verification
  if (adminLoginResult.success && adminLoginResult.data?.data?.token) {
    results.push(await runTest('Admin Token Verification', () => 
      testTokenVerification(adminLoginResult.data.data.token, 'admin')
    ));
  }

  if (patientLoginResult.success && patientLoginResult.data?.data?.token) {
    results.push(await runTest('Patient Token Verification', () => 
      testTokenVerification(patientLoginResult.data.data.token, 'patient')
    ));
  }

  console.log('\n📊 Test Results Summary:');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`✅ Passed: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);

  if (successCount === totalCount) {
    console.log('\n🎉 All tests passed! API is ready for Vercel deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the errors above.');
  }
}

main().catch(console.error);