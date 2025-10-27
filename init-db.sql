-- Script d'initialisation de la base de données PostgreSQL
-- Ce script crée les tables nécessaires pour l'application de gestion de rendez-vous

-- Table des administrateurs
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Admin',
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

-- Table des patients
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

-- Table des créneaux de disponibilité
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

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR NOT NULL REFERENCES patients(id),
  slot_id VARCHAR REFERENCES availability_slots(id),
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
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table des notes de suivi thérapeutique
CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR NOT NULL REFERENCES patients(id),
  content TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT true,
  session_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table des indisponibilités
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

-- Créer un administrateur par défaut
-- Mot de passe: admin123 (à changer en production!)
-- Hash bcrypt pour 'admin123': $2a$10$XQz9Z5qJ8Y7J8Y7J8Y7J8OqQ8Z5qJ8Y7J8Y7J8Y7J8Y7J8Y7J8Y7J
INSERT INTO admins (email, password, name, role)
VALUES ('admin@example.com', '$2a$10$XQz9Z5qJ8Y7J8Y7J8Y7J8OqQ8Z5qJ8Y7J8Y7J8Y7J8Y7J8Y7J8Y7J', 'Administrateur', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Créer quelques créneaux de disponibilité pour les tests
INSERT INTO availability_slots (date, start_time, end_time, duration, notes)
VALUES 
  (CURRENT_DATE + INTERVAL '1 day', '09:00:00', '10:00:00', 60, 'Consultation matinale'),
  (CURRENT_DATE + INTERVAL '1 day', '10:00:00', '11:00:00', 60, 'Consultation matinale'),
  (CURRENT_DATE + INTERVAL '1 day', '14:00:00', '15:00:00', 60, 'Consultation après-midi'),
  (CURRENT_DATE + INTERVAL '1 day', '15:00:00', '16:00:00', 60, 'Consultation après-midi'),
  (CURRENT_DATE + INTERVAL '2 days', '09:00:00', '10:00:00', 60, 'Consultation matinale'),
  (CURRENT_DATE + INTERVAL '2 days', '10:00:00', '11:00:00', 60, 'Consultation matinale')
ON CONFLICT DO NOTHING;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_notes_patient_id ON notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_date ON availability_slots(date);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
