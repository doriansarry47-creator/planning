import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import bcrypt from 'bcryptjs';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

// Configuration de la base de données
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function createAdmin() {
  try {
    console.log('🔧 Création du compte administrateur...\n');

    const adminEmail = 'doriansarry@yahoo.fr';
    const adminPassword = 'Admin123';
    const adminName = 'Dorian Sarry';

    // Vérifier si l'admin existe déjà
    const existingAdmins = await db
      .select()
      .from(schema.admins)
      .where(eq(schema.admins.email, adminEmail))
      .limit(1);

    if (existingAdmins.length > 0) {
      console.log('⚠️  Un administrateur avec cet email existe déjà.');
      console.log('🔄 Mise à jour du mot de passe...\n');

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Mettre à jour le mot de passe
      await db
        .update(schema.admins)
        .set({ 
          password: hashedPassword,
          name: adminName,
          updatedAt: new Date()
        })
        .where(eq(schema.admins.email, adminEmail));

      console.log('✅ Mot de passe mis à jour avec succès!\n');
    } else {
      // Créer le nouveau compte admin
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const newAdmins = await db.insert(schema.admins).values({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
      }).returning();

      console.log('✅ Compte administrateur créé avec succès!\n');
      console.log('📧 Email:', newAdmins[0].email);
      console.log('👤 Nom:', newAdmins[0].name);
    }

    console.log('\n🔑 Informations de connexion:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔐 Mot de passe: ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✨ Vous pouvez maintenant vous connecter avec ces identifiants.\n');

  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error);
    process.exit(1);
  }
}

// Exécuter le script
createAdmin()
  .then(() => {
    console.log('✅ Script terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
