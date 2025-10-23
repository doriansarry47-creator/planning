import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration pour Neon serverless
neonConfig.fetchConnectionCache = true;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL non définie');
  process.exit(1);
}

async function migrateAdminSchema() {
  console.log('🔄 Migration du schéma admin...\n');

  try {
    const connection = neon(DATABASE_URL);
    const db = drizzle(connection);

    // Ajouter les nouvelles colonnes si elles n'existent pas
    console.log('📝 Ajout des colonnes role, permissions, isActive, lastLogin, loginAttempts, lockedUntil...');
    
    await connection`
      DO $$ 
      BEGIN
        -- Ajouter la colonne role
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='role') THEN
          ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'admin';
        END IF;

        -- Ajouter la colonne permissions
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='permissions') THEN
          ALTER TABLE admins ADD COLUMN permissions TEXT[] NOT NULL DEFAULT ARRAY['read', 'write']::TEXT[];
        END IF;

        -- Ajouter la colonne is_active
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='is_active') THEN
          ALTER TABLE admins ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        END IF;

        -- Ajouter la colonne last_login
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='last_login') THEN
          ALTER TABLE admins ADD COLUMN last_login TIMESTAMP;
        END IF;

        -- Ajouter la colonne login_attempts
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='login_attempts') THEN
          ALTER TABLE admins ADD COLUMN login_attempts INTEGER NOT NULL DEFAULT 0;
        END IF;

        -- Ajouter la colonne locked_until
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admins' AND column_name='locked_until') THEN
          ALTER TABLE admins ADD COLUMN locked_until TIMESTAMP;
        END IF;
      END $$;
    `;

    console.log('✅ Migration terminée avec succès!\n');

    // Mettre à jour les admins existants avec les valeurs par défaut
    console.log('🔄 Mise à jour des comptes admin existants...');
    
    await connection`
      UPDATE admins 
      SET 
        role = COALESCE(role, 'admin'),
        permissions = COALESCE(permissions, ARRAY['read', 'write']::TEXT[]),
        is_active = COALESCE(is_active, true),
        login_attempts = COALESCE(login_attempts, 0)
      WHERE role IS NULL OR permissions IS NULL OR is_active IS NULL;
    `;

    console.log('✅ Mise à jour des comptes existants terminée!\n');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécution du script
migrateAdminSchema()
  .then(() => {
    console.log('✨ Migration terminée avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
