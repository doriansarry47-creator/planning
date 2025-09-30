import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const db = new Database("dev.db");

// Fonction pour initialiser les tables
function initializeDatabase() {
  console.log("Initializing development database...");

  // Supprimer les tables existantes
  db.exec("DROP TABLE IF EXISTS schedule_exceptions");
  db.exec("DROP TABLE IF EXISTS appointments");
  db.exec("DROP TABLE IF EXISTS time_slots");
  db.exec("DROP TABLE IF EXISTS practitioners");
  db.exec("DROP TABLE IF EXISTS patients");
  db.exec("DROP TABLE IF EXISTS users");

  // Créer les tables
  db.exec(`
    CREATE TABLE users (
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

  db.exec(`
    CREATE TABLE patients (
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

  db.exec(`
    CREATE TABLE practitioners (
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

  db.exec(`
    CREATE TABLE time_slots (
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

  db.exec(`
    CREATE TABLE appointments (
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

  db.exec(`
    CREATE TABLE schedule_exceptions (
      id TEXT PRIMARY KEY,
      practitioner_id TEXT NOT NULL,
      exception_date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      is_full_day INTEGER NOT NULL DEFAULT 0,
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
    );
  `);

  console.log("Tables created successfully");
}

// Fonction pour insérer des données de test
async function seedDatabase() {
  console.log("Seeding database with test data...");

  // Hash des mots de passe
  const adminPassword = await bcrypt.hash("admin123", 10);
  const patientPassword = await bcrypt.hash("patient123", 10);

  // Insérer un administrateur de test
  const adminId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO users (id, username, password, email, full_name, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(adminId, "admin", adminPassword, "admin@medical.fr", "Administrateur Test", "admin", 1);

  // Insérer un patient de test
  const patientId = crypto.randomUUID();
  db.prepare(`
    INSERT INTO patients (id, email, password, first_name, last_name, phone_number, date_of_birth, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(patientId, "patient@test.fr", patientPassword, "Jean", "Dupont", "0612345678", "1990-01-15", 1);

  // Insérer des praticiens de test
  const practitionerId1 = crypto.randomUUID();
  const practitionerId2 = crypto.randomUUID();
  
  db.prepare(`
    INSERT INTO practitioners (id, first_name, last_name, specialization, email, phone_number, license_number, biography, consultation_duration, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    practitionerId1, 
    "Dr. Marie", 
    "Martin", 
    "Médecine générale", 
    "marie.martin@medical.fr", 
    "0123456789", 
    "12345678", 
    "Médecin généraliste avec 15 ans d'expérience", 
    30, 
    1
  );

  db.prepare(`
    INSERT INTO practitioners (id, first_name, last_name, specialization, email, phone_number, license_number, biography, consultation_duration, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    practitionerId2, 
    "Dr. Pierre", 
    "Durand", 
    "Cardiologie", 
    "pierre.durand@medical.fr", 
    "0123456790", 
    "12345679", 
    "Cardiologue spécialisé dans les maladies cardiovasculaires", 
    45, 
    1
  );

  // Insérer des créneaux horaires de test
  const timeSlots = [
    { practitionerId: practitionerId1, dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
    { practitionerId: practitionerId1, dayOfWeek: 1, startTime: "14:00", endTime: "17:00" },
    { practitionerId: practitionerId1, dayOfWeek: 2, startTime: "09:00", endTime: "12:00" },
    { practitionerId: practitionerId1, dayOfWeek: 2, startTime: "14:00", endTime: "17:00" },
    { practitionerId: practitionerId1, dayOfWeek: 3, startTime: "09:00", endTime: "12:00" },
    { practitionerId: practitionerId1, dayOfWeek: 3, startTime: "14:00", endTime: "17:00" },
    { practitionerId: practitionerId1, dayOfWeek: 4, startTime: "09:00", endTime: "12:00" },
    { practitionerId: practitionerId1, dayOfWeek: 4, startTime: "14:00", endTime: "17:00" },
    { practitionerId: practitionerId1, dayOfWeek: 5, startTime: "09:00", endTime: "12:00" },
    
    { practitionerId: practitionerId2, dayOfWeek: 1, startTime: "10:00", endTime: "13:00" },
    { practitionerId: practitionerId2, dayOfWeek: 1, startTime: "15:00", endTime: "18:00" },
    { practitionerId: practitionerId2, dayOfWeek: 3, startTime: "10:00", endTime: "13:00" },
    { practitionerId: practitionerId2, dayOfWeek: 3, startTime: "15:00", endTime: "18:00" },
    { practitionerId: practitionerId2, dayOfWeek: 5, startTime: "10:00", endTime: "13:00" },
  ];

  for (const slot of timeSlots) {
    const slotId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO time_slots (id, practitioner_id, day_of_week, start_time, end_time, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(slotId, slot.practitionerId, slot.dayOfWeek, slot.startTime, slot.endTime, 1);
  }

  console.log("Database seeded successfully");
  console.log("Test accounts:");
  console.log("Admin: admin@medical.fr / admin123");
  console.log("Patient: patient@test.fr / patient123");
}

// Exécuter l'initialisation
async function main() {
  try {
    initializeDatabase();
    await seedDatabase();
    db.close();
    console.log("Development database setup complete!");
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

main();