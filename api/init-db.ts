import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import bcrypt from 'bcryptjs';
import * as schema from '../shared/schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Créer les tables (avec CREATE TABLE IF NOT EXISTS)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone_number TEXT,
        date_of_birth DATE,
        address TEXT,
        emergency_contact TEXT,
        emergency_phone TEXT,
        medical_history TEXT,
        allergies TEXT,
        medications TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS practitioners (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        specialization TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone_number TEXT,
        license_number TEXT,
        biography TEXT,
        consultation_duration INTEGER NOT NULL DEFAULT 30,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Vérifier si les données existent déjà
    const existingAdmins = await db.select().from(schema.admins).limit(1);
    
    if (existingAdmins.length === 0) {
      // Créer un administrateur de test
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.insert(schema.admins).values({
        name: 'Dorian Sarry',
        email: 'doriansarry@yahoo.fr',
        password: hashedPassword
      });

      // Créer un patient de test
      const patientPassword = await bcrypt.hash('patient123', 10);
      await db.insert(schema.patients).values({
        email: 'patient@test.fr',
        password: patientPassword,
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '0123456789',
        isReferredByProfessional: false,
        consultationReason: 'Test de consultation pour thérapie sensorimotrice',
        preferredSessionType: 'cabinet'
      });

      // Pas de praticiens pour cette application de thérapie sensorimotrice

      return res.status(200).json({ 
        message: 'Base de données initialisée avec succès',
        testAccounts: {
          admin: {
            name: 'Dorian Sarry',
            password: 'admin123',
            email: 'doriansarry@yahoo.fr'
          },
          patient: {
            email: 'patient@test.fr',
            password: 'patient123',
            name: 'Marie Dupont'
          }
        }
      });
    } else {
      return res.status(200).json({ 
        message: 'Base de données déjà initialisée',
        testAccounts: {
          admin: {
            name: 'Dorian Sarry',
            password: 'admin123',
            email: 'doriansarry@yahoo.fr'
          },
          patient: {
            email: 'patient@test.fr',
            password: 'patient123',
            name: 'Marie Dupont'
          }
        }
      });
    }

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    return res.status(500).json({ 
      message: 'Erreur lors de l\'initialisation de la base de données',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}