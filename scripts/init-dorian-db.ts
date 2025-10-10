import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import bcrypt from 'bcryptjs';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

// Charger les variables d'environnement
config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function initializeDorianDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données pour Dorian Sarry...');

    // Créer toutes les tables nécessaires selon le schéma
    console.log('📋 Création des tables...');
    
    // Table admins
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL DEFAULT 'Dorian Sarry',
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Table patients
    await sql`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT,
        is_referred_by_professional BOOLEAN NOT NULL DEFAULT false,
        referring_professional TEXT,
        consultation_reason TEXT NOT NULL,
        symptoms_start_date TEXT,
        preferred_session_type TEXT NOT NULL,
        therapist_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Table availability_slots
    await sql`
      CREATE TABLE IF NOT EXISTS availability_slots (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        duration INTEGER NOT NULL DEFAULT 60,
        is_available BOOLEAN NOT NULL DEFAULT true,
        is_recurring BOOLEAN NOT NULL DEFAULT false,
        recurring_pattern TEXT,
        day_of_week INTEGER,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Table appointments
    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR NOT NULL,
        slot_id VARCHAR,
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        duration INTEGER NOT NULL DEFAULT 60,
        status TEXT NOT NULL DEFAULT 'pending',
        type TEXT NOT NULL,
        reason TEXT NOT NULL,
        is_referred_by_professional BOOLEAN NOT NULL DEFAULT false,
        referring_professional TEXT,
        symptoms_start_date TEXT,
        therapist_notes TEXT,
        session_summary TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      );
    `;

    // Table notes
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR NOT NULL,
        content TEXT NOT NULL,
        is_private BOOLEAN NOT NULL DEFAULT true,
        session_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      );
    `;

    // Table unavailabilities
    await sql`
      CREATE TABLE IF NOT EXISTS unavailabilities (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        is_full_day BOOLEAN NOT NULL DEFAULT true,
        reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('✅ Tables créées avec succès.');

    // Vérifier si l'admin Dorian Sarry existe déjà
    const existingAdmin = await db.select().from(schema.admins)
      .where(eq(schema.admins.email, 'doriansarry@yahoo.fr')).limit(1);

    if (existingAdmin.length === 0) {
      console.log('👤 Création de l\'administrateur Dorian Sarry...');
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash('Dorian010195', 12);
      
      // Insérer l'admin Dorian Sarry
      await db.insert(schema.admins).values({
        name: 'Dorian Sarry',
        email: 'doriansarry@yahoo.fr',
        password: hashedPassword,
      });

      console.log('✅ Administrateur Dorian Sarry créé avec succès.');
    } else {
      console.log('ℹ️ L\'administrateur Dorian Sarry existe déjà.');
      
      // Mettre à jour le mot de passe au cas où
      console.log('🔄 Mise à jour du mot de passe...');
      const hashedPassword = await bcrypt.hash('Dorian010195', 12);
      
      await db.update(schema.admins)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(schema.admins.email, 'doriansarry@yahoo.fr'));
      
      console.log('✅ Mot de passe mis à jour.');
    }

    // Créer un patient de test si nécessaire
    const existingPatient = await db.select().from(schema.patients)
      .where(eq(schema.patients.email, 'patient.test@example.com')).limit(1);

    if (existingPatient.length === 0) {
      console.log('👤 Création d\'un patient de test...');
      
      const patientPassword = await bcrypt.hash('Patient123', 12);
      
      await db.insert(schema.patients).values({
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'patient.test@example.com',
        password: patientPassword,
        phone: '0123456789',
        consultationReason: 'Séance de thérapie sensorimotrice pour gestion du stress',
        preferredSessionType: 'cabinet',
        isReferredByProfessional: false,
      });

      console.log('✅ Patient de test créé avec succès.');
    }

    console.log('🎉 Initialisation terminée avec succès !');
    console.log('');
    console.log('📋 Comptes créés :');
    console.log('🔑 Admin - Email: doriansarry@yahoo.fr | Mot de passe: Dorian010195');
    console.log('👤 Patient test - Email: patient.test@example.com | Mot de passe: Patient123');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  }
}

// Exécuter le script seulement si appelé directement
if (require.main === module) {
  initializeDorianDatabase()
    .then(() => {
      console.log('🏁 Script terminé.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export { initializeDorianDatabase };