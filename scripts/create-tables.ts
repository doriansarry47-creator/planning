import { config } from 'dotenv';

// Charger les variables d'environnement depuis .env
config({ path: '.env' });

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../shared/sqlite-schema';

const sqlite = new Database('./dev.sqlite');
const db = drizzle(sqlite, { schema });

async function createTables() {
  try {
    console.log('📦 Création des tables SQLite avec Drizzle...');

    // Utiliser Drizzle pour créer les tables
    // En SQLite, nous devons créer les tables avec du SQL natif
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `;
    
    const createPatientsTable = `
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone_number TEXT,
        date_of_birth TEXT,
        address TEXT,
        emergency_contact TEXT,
        emergency_phone TEXT,
        medical_history TEXT,
        allergies TEXT,
        medications TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `;
    
    const createPractitionersTable = `
      CREATE TABLE IF NOT EXISTS practitioners (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        specialization TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone_number TEXT,
        license_number TEXT,
        biography TEXT,
        consultation_duration INTEGER NOT NULL DEFAULT 30,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `;
    
    sqlite.exec(createUsersTable);
    sqlite.exec(createPatientsTable);
    sqlite.exec(createPractitionersTable);

    console.log('✅ Tables SQLite créées avec succès !');
    sqlite.close();

  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    sqlite.close();
    process.exit(1);
  }
}

createTables();