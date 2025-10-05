import { config } from 'dotenv';
import { db, users, patients, practitioners } from '../shared/schema';
import { hashPassword } from '../api/_lib/auth';

config();

async function seed() {
  try {
    console.log('🌱 Début du seeding...');

    // Créer un admin par défaut
    const hashedAdminPassword = await hashPassword('admin123');
    await db.insert(users).values({
      username: 'admin',
      email: 'admin@medplan.fr',
      password: hashedAdminPassword,
      fullName: 'Administrateur Principal',
      role: 'admin',
    }).onConflictDoNothing();

    console.log('✅ Administrateur créé');

    // Créer un patient de test
    const hashedPatientPassword = await hashPassword('patient123');
    await db.insert(patients).values({
      email: 'patient@test.fr',
      password: hashedPatientPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      phoneNumber: '0123456789',
      dateOfBirth: '1985-06-15',
      address: '123 Rue de la Santé, 75001 Paris',
    }).onConflictDoNothing();

    console.log('✅ Patient de test créé');

    // Créer des praticiens de test
    await db.insert(practitioners).values([
      {
        firstName: 'Marie',
        lastName: 'Martin',
        specialization: 'Médecine générale',
        email: 'marie.martin@medplan.fr',
        phoneNumber: '0123456790',
        licenseNumber: 'MED001',
        biography: 'Médecin généraliste avec 15 ans d\'expérience.',
        consultationDuration: 30,
      },
      {
        firstName: 'Pierre',
        lastName: 'Durand',
        specialization: 'Cardiologie',
        email: 'pierre.durand@medplan.fr',
        phoneNumber: '0123456791',
        licenseNumber: 'CARD001',
        biography: 'Cardiologue spécialisé dans les pathologies cardiovasculaires.',
        consultationDuration: 45,
      },
      {
        firstName: 'Sophie',
        lastName: 'Leroy',
        specialization: 'Dermatologie',
        email: 'sophie.leroy@medplan.fr',
        phoneNumber: '0123456792',
        licenseNumber: 'DERM001',
        biography: 'Dermatologue experte en dermatologie esthétique et médicale.',
        consultationDuration: 30,
      },
    ]).onConflictDoNothing();

    console.log('✅ Praticiens créés');
    console.log('🎉 Seeding terminé avec succès !');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur pendant le seeding:', error);
    process.exit(1);
  }
}

seed();