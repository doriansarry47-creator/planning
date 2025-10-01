import axios from 'axios';

const baseURL = process.argv[2] || 'http://localhost:5000';

async function testAppointmentFlow() {
  console.log('🧪 Test du flux complet de prise de rendez-vous');
  console.log('=' .repeat(50));

  try {
    // 1. Connexion patient
    console.log('1️⃣ Connexion du patient...');
    const patientLogin = await axios.post(`${baseURL}/api/auth/login/patient`, {
      email: 'patient@test.fr',
      password: 'patient123'
    });

    if (!patientLogin.data.token) {
      throw new Error('Échec de la connexion patient');
    }

    const patientToken = patientLogin.data.token;
    const patient = patientLogin.data.user;
    console.log(`✅ Patient connecté: ${patient.firstName} ${patient.lastName}`);

    // 2. Récupération des praticiens
    console.log('\\n2️⃣ Récupération des praticiens disponibles...');
    const practitioners = await axios.get(`${baseURL}/api/practitioners`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });

    if (!practitioners.data.length) {
      throw new Error('Aucun praticien trouvé');
    }

    const practitioner = practitioners.data[0];
    console.log(`✅ Praticien trouvé: ${practitioner.firstName} ${practitioner.lastName} (${practitioner.specialization})`);

    // 3. Vérification des créneaux horaires
    console.log('\\n3️⃣ Vérification des créneaux horaires...');
    const timeSlots = await axios.get(`${baseURL}/api/practitioners/${practitioner.id}/time-slots`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });

    console.log(`✅ Créneaux disponibles: ${timeSlots.data.length} jours configurés`);

    // 4. Tentative de création de rendez-vous
    console.log('\\n4️⃣ Création d\'un nouveau rendez-vous...');
    
    // Date dans 3 jours (pour éviter les conflits)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const appointmentDate = futureDate.toISOString().split('T')[0];

    const newAppointment = {
      practitionerId: practitioner.id,
      appointmentDate: appointmentDate,
      startTime: '14:30',
      endTime: '15:15',
      reason: 'Consultation de suivi - Test automatique'
    };

    const appointmentResult = await axios.post(`${baseURL}/api/appointments`, newAppointment, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });

    if (appointmentResult.status === 201) {
      console.log(`✅ Rendez-vous créé avec succès: ${appointmentDate} à ${newAppointment.startTime}`);
    } else {
      console.log(`⚠️ Résultat inattendu: ${appointmentResult.status}`);
    }

    // 5. Vérification des rendez-vous du patient
    console.log('\\n5️⃣ Vérification des rendez-vous du patient...');
    const patientAppointments = await axios.get(`${baseURL}/api/appointments/patient`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });

    console.log(`✅ Rendez-vous du patient: ${patientAppointments.data.length} au total`);
    patientAppointments.data.forEach((apt: any, index: number) => {
      console.log(`   ${index + 1}. ${apt.appointmentDate} ${apt.startTime} - ${apt.reason}`);
    });

    // 6. Test connexion admin et visualisation
    console.log('\\n6️⃣ Test de la vue administrateur...');
    const adminLogin = await axios.post(`${baseURL}/api/auth/login/admin`, {
      email: 'admin@medical.fr',
      password: 'admin123'
    });

    const adminToken = adminLogin.data.token;
    const adminAppointments = await axios.get(`${baseURL}/api/appointments/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log(`✅ Vue admin: ${adminAppointments.data.length} rendez-vous dans le système`);

    console.log('\\n🎉 Test complet réussi !');
    return true;

  } catch (error: any) {
    console.error('❌ Erreur pendant le test:', error.response?.data || error.message);
    return false;
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAppointmentFlow().then(success => {
    process.exit(success ? 0 : 1);
  });
}