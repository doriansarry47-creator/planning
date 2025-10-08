import { config } from 'dotenv';

// Charger les variables d'environnement depuis .env
config({ path: '.env' });

import { users, patients, practitioners } from '../shared/sqlite-schema';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { hashPassword } from '../api/_lib/auth';

const sqlite = new Database('./dev.sqlite');
const db = drizzle(sqlite);

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

    // Créer le compte admin de Dorian Sarry
    const hashedDorianPassword = await hashPassword('admin123');
    await db.insert(users).values({
      username: 'doriansarry',
      email: 'doriansarry47@gmail.com',
      password: hashedDorianPassword,
      fullName: 'Dorian Sarry',
      role: 'admin',
    }).onConflictDoNothing();

    console.log('✅ Administrateurs créés');

    // Créer des patients de test
    const hashedPatientPassword = await hashPassword('patient123');
    await db.insert(patients).values([
      {
        email: 'patient@test.fr',
        password: hashedPatientPassword,
        firstName: 'Marie',
        lastName: 'Sereine',
        phoneNumber: '0123456789',
        dateOfBirth: '1985-06-15',
        address: 'Paris, France',
      },
      {
        email: 'test.patient2@example.com',
        password: hashedPatientPassword,
        firstName: 'Paul',
        lastName: 'Bienêtre',
        phoneNumber: '0123456788',
        dateOfBirth: '1990-03-20',
        address: 'Lyon, France',
      },
    ]).onConflictDoNothing();

    console.log('✅ Patients de test créés');

    // Créer Dorian Sarry comme praticien principal
    await db.insert(practitioners).values([
      {
        firstName: 'Dorian',
        lastName: 'Sarry',
        specialization: 'Thérapie sensori-motrice',
        email: 'doriansarry47@gmail.com',
        phoneNumber: 'Sur rendez-vous uniquement',
        licenseNumber: 'TSM001',
        biography: 'Thérapeute spécialisé en stabilisation émotionnelle et traitement du psycho-traumatisme. Approche holistique alliant thérapie sensori-motrice et accompagnement bienveillant.',
        consultationDuration: 60,
      },
    ]).onConflictDoNothing();

    console.log('✅ Praticiens créés');
    console.log('🎉 Seeding terminé avec succès !');

    sqlite.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur pendant le seeding:', error);
    sqlite.close();
    process.exit(1);
  }
}

seed();