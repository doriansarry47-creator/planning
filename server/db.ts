// Charger les variables d'environnement si pas déjà fait
import dotenv from "dotenv";
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { neon } from "@neondatabase/serverless";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";
import * as schemaSqlite from "../shared/schema-sqlite";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Créer la base de données selon le type
let db: any;

if (process.env.DATABASE_URL.startsWith("file:")) {
  // Utiliser SQLite pour les bases locales (file:)
  const dbPath = process.env.DATABASE_URL.replace("file:", "");
  const sqlite = new Database(dbPath);
  db = drizzleSqlite(sqlite, { schema: schemaSqlite });
  
  // Initialiser les tables SQLite
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
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
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqlite.exec(`
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
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS time_slots (
      id TEXT PRIMARY KEY,
      practitioner_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      practitioner_id TEXT NOT NULL,
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
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
    );
  `);

  console.log("SQLite database initialized");
} else {
  // Utiliser Neon PostgreSQL pour la production
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
}

export { db };
export type Database = typeof db;