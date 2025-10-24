import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL non définie');
  process.exit(1);
}

async function initCompleteDatabase() {
  console.log('🚀 Initialisation complète de la base de données...\n');

  const sql = neon(DATABASE_URL);

  try {
    // 1. Créer toutes les tables
    console.log('📝 Création des tables...');

    // Table admins
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL DEFAULT 'Dorian Sarry',
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        permissions TEXT[] NOT NULL DEFAULT ARRAY['read', 'write', 'delete']::TEXT[],
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_login TIMESTAMP,
        login_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Table admins créée');

    // Table patients
    await sql`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    console.log('✅ Table patients créée');

    // Table availability_slots
    await sql`
      CREATE TABLE IF NOT EXISTS availability_slots (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    console.log('✅ Table availability_slots créée');

    // Table appointments
    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
        CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      );
    `;
    console.log('✅ Table appointments créée');

    // Table notes
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        patient_id VARCHAR NOT NULL,
        content TEXT NOT NULL,
        is_private BOOLEAN NOT NULL DEFAULT true,
        session_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_patient_notes FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      );
    `;
    console.log('✅ Table notes créée');

    // Table unavailabilities
    await sql`
      CREATE TABLE IF NOT EXISTS unavailabilities (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        is_full_day BOOLEAN NOT NULL DEFAULT true,
        reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Table unavailabilities créée');

    // 2. Créer un compte administrateur par défaut
    console.log('\n👤 Création du compte administrateur...');
    
    const adminPassword = await bcrypt.hash('Admin@2025!', 12);
    
    // Vérifier si un admin existe déjà
    const existingAdmins = await sql`SELECT COUNT(*) as count FROM admins`;
    
    if (existingAdmins[0].count === '0' || existingAdmins[0].count === 0) {
      await sql`
        INSERT INTO admins (name, email, password, role, permissions, is_active)
        VALUES (
          'Dorian Sarry',
          'dorian@medplan.fr',
          ${adminPassword},
          'super_admin',
          ARRAY['read', 'write', 'delete', 'manage_users']::TEXT[],
          true
        )
        ON CONFLICT (email) DO UPDATE SET
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          permissions = EXCLUDED.permissions,
          updated_at = CURRENT_TIMESTAMP;
      `;
      console.log('✅ Administrateur créé avec succès');
      console.log('📧 Email: dorian@medplan.fr');
      console.log('🔑 Mot de passe: Admin@2025!');
    } else {
      console.log('⚠️  Un administrateur existe déjà, création ignorée');
    }

    // 3. Créer quelques créneaux de disponibilité
    console.log('\n📅 Création de créneaux de disponibilité...');
    
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    for (let i = 1; i <= 5; i++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + i);
      
      // Créneaux matin (9h-12h)
      await sql`
        INSERT INTO availability_slots (date, start_time, end_time, duration, is_available)
        VALUES 
          (${slotDate.toISOString().split('T')[0]}, '09:00', '10:00', 60, true),
          (${slotDate.toISOString().split('T')[0]}, '10:00', '11:00', 60, true),
          (${slotDate.toISOString().split('T')[0]}, '11:00', '12:00', 60, true)
        ON CONFLICT DO NOTHING;
      `;
      
      // Créneaux après-midi (14h-18h)
      await sql`
        INSERT INTO availability_slots (date, start_time, end_time, duration, is_available)
        VALUES 
          (${slotDate.toISOString().split('T')[0]}, '14:00', '15:00', 60, true),
          (${slotDate.toISOString().split('T')[0]}, '15:00', '16:00', 60, true),
          (${slotDate.toISOString().split('T')[0]}, '16:00', '17:00', 60, true),
          (${slotDate.toISOString().split('T')[0]}, '17:00', '18:00', 60, true)
        ON CONFLICT DO NOTHING;
      `;
    }
    console.log('✅ Créneaux de disponibilité créés pour les 5 prochains jours');

    console.log('\n✨ Initialisation complète de la base de données terminée avec succès!');
    console.log('\n📋 Résumé:');
    console.log('  - Tables créées: admins, patients, appointments, availability_slots, notes, unavailabilities');
    console.log('  - Compte admin: dorian@medplan.fr / Admin@2025!');
    console.log('  - Créneaux de disponibilité: 35 créneaux pour les 5 prochains jours');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  }
}

// Exécution du script
initCompleteDatabase()
  .then(() => {
    console.log('\n🎉 Base de données prête à l\'emploi!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
