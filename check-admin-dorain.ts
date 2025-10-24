import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const checkAndCreateAdmin = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL non définie');
      process.exit(1);
    }

    console.log('🔍 Connexion à la base de données...');
    const sql = neon(databaseUrl);
    const db = drizzle(sql, { schema });

    const email = 'dorainsarry@yahoo.fr';
    console.log(`\n🔎 Recherche de l'admin: ${email}`);

    // Chercher l'admin
    const admins = await db.select().from(schema.admins).where(eq(schema.admins.email, email));
    
    if (admins.length > 0) {
      const admin = admins[0];
      console.log('\n✅ Admin trouvé:');
      console.log('  - ID:', admin.id);
      console.log('  - Email:', admin.email);
      console.log('  - Nom:', admin.name);
      console.log('  - Rôle:', admin.role);
      console.log('  - Actif:', admin.isActive);
      console.log('  - Dernière connexion:', admin.lastLogin);
      console.log('  - Tentatives de connexion:', admin.loginAttempts);
      console.log('  - Verrouillé jusqu\'à:', admin.lockedUntil);
      
      // Vérifier le mot de passe
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, admin.password);
      console.log(`\n🔑 Test mot de passe "${testPassword}":`, isValid ? '✅ VALIDE' : '❌ INVALIDE');
      
      // Si le compte est verrouillé, le déverrouiller
      if (admin.lockedUntil) {
        console.log('\n🔓 Déverrouillage du compte...');
        await db.update(schema.admins)
          .set({ 
            loginAttempts: 0, 
            lockedUntil: null,
            isActive: true 
          })
          .where(eq(schema.admins.email, email));
        console.log('✅ Compte déverrouillé');
      }
      
      // Si le compte est inactif, l'activer
      if (!admin.isActive) {
        console.log('\n🔓 Activation du compte...');
        await db.update(schema.admins)
          .set({ isActive: true })
          .where(eq(schema.admins.email, email));
        console.log('✅ Compte activé');
      }
      
      // Si le mot de passe n'est pas valide, le réinitialiser
      if (!isValid) {
        console.log('\n🔑 Réinitialisation du mot de passe à "admin123"...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.update(schema.admins)
          .set({ 
            password: hashedPassword,
            loginAttempts: 0, 
            lockedUntil: null 
          })
          .where(eq(schema.admins.email, email));
        console.log('✅ Mot de passe réinitialisé');
      }
    } else {
      console.log('\n❌ Admin non trouvé, création...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await db.insert(schema.admins).values({
        email: email,
        password: hashedPassword,
        name: 'Dorian Sarry',
        role: 'super_admin',
        permissions: ['read', 'write', 'delete', 'manage_users'],
        isActive: true,
        loginAttempts: 0,
        lockedUntil: null,
      }).returning();
      
      console.log('\n✅ Admin créé avec succès:');
      console.log('  - Email:', email);
      console.log('  - Mot de passe: admin123');
      console.log('  - Rôle: super_admin');
    }
    
    console.log('\n✨ Opération terminée avec succès!');
    console.log('\n📋 Identifiants de connexion:');
    console.log('  Email:', email);
    console.log('  Mot de passe: admin123');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkAndCreateAdmin();
