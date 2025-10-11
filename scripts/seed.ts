import { config } from 'dotenv';
import { db, admins, patients } from '../shared/schema';
import { hashPassword } from '../api/_lib/auth';

config();

async function seed() {
  try {
    console.log('🌱 Début du seeding...');

    // Créer un admin par défaut (Dorian Sarry)
    const hashedAdminPassword = await hashPassword('admin123');
    await db.insert(admins).values({
      name: 'Dorian Sarry',
      email: 'admin@doriansarry.fr',
      password: hashedAdminPassword,
    }).onConflictDoNothing();

    console.log('✅ Administrateur créé');

    // Créer un patient de test
    const hashedPatientPassword = await hashPassword('patient123');
    await db.insert(patients).values({
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'patient@test.fr',
      password: hashedPatientPassword,
      phone: '06 45 15 63 68',
      consultationReason: 'Stress post-traumatique suite à un accident de voiture. Je ressens des flashbacks et de l\'anxiété.',
      preferredSessionType: 'cabinet',
      isReferredByProfessional: false,
      symptomsStartDate: 'Depuis 3 mois',
    }).onConflictDoNothing();

    console.log('✅ Patient de test créé');

    console.log('🎉 Seeding terminé avec succès !');
    console.log('📧 Connexion admin: admin@doriansarry.fr / admin123');
    console.log('📧 Connexion patient: patient@test.fr / patient123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur pendant le seeding:', error);
    process.exit(1);
  }
}

seed();