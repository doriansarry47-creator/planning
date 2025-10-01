import axios from 'axios';

const baseURL = process.argv[2] || 'http://localhost:5000';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message?: string;
  data?: any;
}

class AppTester {
  private results: TestResult[] = [];

  private log(test: string, status: 'PASS' | 'FAIL', message?: string, data?: any) {
    this.results.push({ test, status, message, data });
    const statusIcon = status === 'PASS' ? '✅' : '❌';
    console.log(`${statusIcon} ${test}: ${message || status}`);
    if (data && process.env.DEBUG) {
      console.log('   Data:', JSON.stringify(data, null, 2));
    }
  }

  async testServerHealth() {
    try {
      const response = await axios.get(`${baseURL}/`);
      if (response.status === 200) {
        this.log('Server Health', 'PASS', 'Server is responsive');
      } else {
        this.log('Server Health', 'FAIL', `Unexpected status: ${response.status}`);
      }
    } catch (error: any) {
      this.log('Server Health', 'FAIL', `Server unreachable: ${error.message}`);
    }
  }

  async testPatientLogin() {
    try {
      const loginData = {
        email: 'patient@test.fr',
        password: 'patient123'
      };

      const response = await axios.post(`${baseURL}/api/auth/login/patient`, loginData);
      
      if (response.status === 200 && response.data.user) {
        this.log('Patient Login', 'PASS', 'Patient can login successfully', {
          userId: response.data.user.id,
          name: `${response.data.user.firstName} ${response.data.user.lastName}`
        });
        return response.data.token;
      } else {
        this.log('Patient Login', 'FAIL', 'Invalid login response', response.data);
      }
    } catch (error: any) {
      this.log('Patient Login', 'FAIL', `Login failed: ${error.response?.data?.message || error.message}`);
    }
    return null;
  }

  async testAdminLogin() {
    try {
      const loginData = {
        email: 'admin@medical.fr',
        password: 'admin123'
      };

      const response = await axios.post(`${baseURL}/api/auth/login/admin`, loginData);
      
      if (response.status === 200 && response.data.user) {
        this.log('Admin Login', 'PASS', 'Admin can login successfully', {
          userId: response.data.user.id,
          name: response.data.user.fullName,
          role: response.data.user.role
        });
        return response.data.token;
      } else {
        this.log('Admin Login', 'FAIL', 'Invalid login response', response.data);
      }
    } catch (error: any) {
      this.log('Admin Login', 'FAIL', `Login failed: ${error.response?.data?.message || error.message}`);
    }
    return null;
  }

  async testPractitionersAPI(token?: string) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${baseURL}/api/practitioners`, { headers });
      
      if (response.status === 200 && Array.isArray(response.data)) {
        this.log('Practitioners API', 'PASS', `Found ${response.data.length} practitioner(s)`, {
          count: response.data.length,
          practitioners: response.data.map(p => `${p.firstName} ${p.lastName} (${p.specialization})`)
        });
      } else {
        this.log('Practitioners API', 'FAIL', 'Invalid practitioners response', response.data);
      }
    } catch (error: any) {
      this.log('Practitioners API', 'FAIL', `API failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async testPatientAppointments(patientToken?: string) {
    if (!patientToken) {
      this.log('Patient Appointments', 'FAIL', 'No patient token available for testing');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${patientToken}` };
      const response = await axios.get(`${baseURL}/api/appointments/patient`, { headers });
      
      if (response.status === 200 && Array.isArray(response.data)) {
        this.log('Patient Appointments', 'PASS', `Found ${response.data.length} appointment(s)`, {
          count: response.data.length,
          appointments: response.data.map(a => `${a.appointmentDate} ${a.startTime} - ${a.reason || 'No reason'}`)
        });
      } else {
        this.log('Patient Appointments', 'FAIL', 'Invalid appointments response', response.data);
      }
    } catch (error: any) {
      this.log('Patient Appointments', 'FAIL', `API failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async testAdminAppointments(adminToken?: string) {
    if (!adminToken) {
      this.log('Admin Appointments', 'FAIL', 'No admin token available for testing');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const response = await axios.get(`${baseURL}/api/appointments/admin/all`, { headers });
      
      if (response.status === 200 && Array.isArray(response.data)) {
        this.log('Admin Appointments', 'PASS', `Found ${response.data.length} appointment(s)`, {
          count: response.data.length,
          appointments: response.data.map(a => `${a.appointmentDate} ${a.startTime} - Patient: ${a.patient?.firstName} ${a.patient?.lastName}`)
        });
      } else {
        this.log('Admin Appointments', 'FAIL', 'Invalid appointments response', response.data);
      }
    } catch (error: any) {
      this.log('Admin Appointments', 'FAIL', `API failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async runAllTests() {
    console.log(`🧪 Starting application tests for: ${baseURL}`);
    console.log('=' .repeat(60));

    await this.testServerHealth();
    
    const patientToken = await this.testPatientLogin();
    const adminToken = await this.testAdminLogin();
    
    await this.testPractitionersAPI();
    await this.testPatientAppointments(patientToken);
    await this.testAdminAppointments(adminToken);

    console.log('=' .repeat(60));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
      console.log('❌ Failed tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`   - ${r.test}: ${r.message}`);
      });
    } else {
      console.log('🎉 All tests passed!');
    }
    
    return failed === 0;
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AppTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}