import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../shared/schema-sqlite";

// Utiliser une base SQLite pour le développement local
const sqlite = new Database("dev.db");
export const db = drizzle(sqlite, { schema });

export type Database = typeof db;

// Fonction pour initialiser les tables
export function initializeDatabase() {
  // Créer les tables si elles n'existent pas
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
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
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS practitioners (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone_number TEXT,
      license_number TEXT,
      biography TEXT,
      consultation_duration INTEGER NOT NULL DEFAULT 30,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS time_slots (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      practitioner_id TEXT NOT NULL REFERENCES practitioners(id),
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      patient_id TEXT NOT NULL REFERENCES patients(id),
      practitioner_id TEXT NOT NULL REFERENCES practitioners(id),
      appointment_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      reason TEXT,
      notes TEXT,
      diagnosis TEXT,
      treatment TEXT,
      follow_up_required INTEGER NOT NULL DEFAULT 0,
      follow_up_date TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS schedule_exceptions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      practitioner_id TEXT NOT NULL REFERENCES practitioners(id),
      exception_date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      is_full_day INTEGER NOT NULL DEFAULT 0,
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Database initialized successfully");
}