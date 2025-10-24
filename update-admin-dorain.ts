import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement de production
dotenv.config({ path: path.join(process.cwd(), '.env.production') });

async function updateAdminDorain() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL non défini');
      return;
    }

    console.log('🔍 Connexion à la base de données...');
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql, { schema });
    
    // Vérifier si dorainsarry@yahoo.fr existe
    console.log('\n🔍 Vérification du compte dorainsarry@yahoo.fr...');
    const dorainsarryAdmins = await db.select()
      .from(schema.admins)
      .where(eq(schema.admins.email, 'dorainsarry@yahoo.fr'));
    
    if (dorainsarryAdmins.length > 0) {
      console.log('✅ Le compte dorainsarry@yahoo.fr existe déjà');
      console.log('   Réinitialisation du mot de passe...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await db.update(schema.admins)
        .set({
          password: hashedPassword,
          isActive: true,
          loginAttempts: 0,
          lockedUntil: null,
          role: 'super_admin',
          permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
          name: 'Dorian Sarry',
          updatedAt: new Date()
        })
        .where(eq(schema.admins.email, 'dorainsarry@yahoo.fr'));
      
      console.log('✅ Compte mis à jour avec succès!');
      console.log('   Email: dorainsarry@yahoo.fr');
      console.log('   Mot de passe: admin123');
      console.log('   Rôle: super_admin');
      
    } else {
      // Créer le compte s'il n'existe pas
      console.log('⚠️  Le compte dorainsarry@yahoo.fr n\'existe pas');
      console.log('   Vérification du compte doriansarry@yahoo.fr...');
      
      const doriansarryAdmins = await db.select()
        .from(schema.admins)
        .where(eq(schema.admins.email, 'doriansarry@yahoo.fr'));
      
      if (doriansarryAdmins.length > 0) {
        console.log('✅ Le compte doriansarry@yahoo.fr existe');
        console.log('   Mise à jour de l\'email vers dorainsarry@yahoo.fr...');
        
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await db.update(schema.admins)
          .set({
            email: 'dorainsarry@yahoo.fr',
            password: hashedPassword,
            isActive: true,
            loginAttempts: 0,
            lockedUntil: null,
            role: 'super_admin',
            permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
            name: 'Dorian Sarry',
            updatedAt: new Date()
          })
          .where(eq(schema.admins.email, 'doriansarry@yahoo.fr'));
        
        console.log('✅ Compte mis à jour avec succès!');
        console.log('   Nouvel email: dorainsarry@yahoo.fr');
        console.log('   Mot de passe: admin123');
        
      } else {
        // Créer un nouveau compte
        console.log('   Création du compte dorainsarry@yahoo.fr...');
        
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await db.insert(schema.admins).values({
          email: 'dorainsarry@yahoo.fr',
          password: hashedPassword,
          name: 'Dorian Sarry',
          role: 'super_admin',
          permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
          isActive: true,
          loginAttempts: 0
        });
        
        console.log('✅ Compte créé avec succès!');
        console.log('   Email: dorainsarry@yahoo.fr');
        console.log('   Mot de passe: admin123');
      }
    }
    
    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    const finalCheck = await db.select()
      .from(schema.admins)
      .where(eq(schema.admins.email, 'dorainsarry@yahoo.fr'));
    
    if (finalCheck.length > 0) {
      const admin = finalCheck[0];
      console.log('✅ Compte vérifié:');
      console.log('   ID:', admin.id);
      console.log('   Email:', admin.email);
      console.log('   Nom:', admin.name);
      console.log('   Rôle:', admin.role);
      console.log('   Actif:', admin.isActive);
      console.log('   Permissions:', admin.permissions);
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
  }
}

updateAdminDorain();
