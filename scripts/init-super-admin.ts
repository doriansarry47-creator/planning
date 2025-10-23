import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neon, neonConfig } from '@neondatabase/serverless';
import { admins } from '../shared/schema';
import { hashPassword } from '../api/_lib/auth';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration pour Neon serverless
neonConfig.fetchConnectionCache = true;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL non définie');
  process.exit(1);
}

async function initSuperAdmin() {
  console.log('🔧 Initialisation du compte Super Admin...\n');

  try {
    // Connexion à la base de données
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql);

    // Données du super admin
    const superAdminEmail = 'admin@medplan.fr';
    const superAdminPassword = 'Admin2024!Secure';
    const hashedPassword = await hashPassword(superAdminPassword);

    // Vérifier si le super admin existe déjà
    const existingAdmin = await db.select().from(admins).where(eq(admins.email, superAdminEmail)).limit(1);

    if (existingAdmin.length > 0) {
      console.log('ℹ️  Le compte super admin existe déjà.');
      
      // Mise à jour avec les nouvelles permissions
      await db.update(admins)
        .set({
          role: 'super_admin',
          permissions: ['all', 'read', 'write', 'delete', 'manage_users', 'manage_settings'],
          isActive: true,
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(admins.email, superAdminEmail));

      console.log('✅ Compte super admin mis à jour avec succès!\n');
    } else {
      // Création du super admin
      await db.insert(admins).values({
        name: 'Dorian Sarry (Super Admin)',
        email: superAdminEmail,
        password: hashedPassword,
        role: 'super_admin',
        permissions: ['all', 'read', 'write', 'delete', 'manage_users', 'manage_settings'],
        isActive: true,
      });

      console.log('✅ Compte super admin créé avec succès!\n');
    }

    console.log('📝 Informations de connexion:');
    console.log('━'.repeat(50));
    console.log(`Email:        ${superAdminEmail}`);
    console.log(`Mot de passe: ${superAdminPassword}`);
    console.log(`Rôle:         Super Admin`);
    console.log(`Permissions:  Toutes (all)`);
    console.log('━'.repeat(50));
    console.log('\n⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!\n');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

// Exécution du script
initSuperAdmin()
  .then(() => {
    console.log('✨ Initialisation terminée avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
