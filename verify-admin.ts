import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement de production
dotenv.config({ path: path.join(process.cwd(), '.env.production') });

async function verifyAdmin() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL non défini dans .env.production');
      return;
    }

    console.log('🔍 Connexion à la base de données...');
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql, { schema });
    
    console.log('🔍 Recherche du compte admin dorainsarry@yahoo.fr...');
    const admins = await db.select().from(schema.admins).where(eq(schema.admins.email, 'dorainsarry@yahoo.fr'));
    
    if (admins.length > 0) {
      const admin = admins[0];
      console.log('\n✅ Admin trouvé!');
      console.log('   ID:', admin.id);
      console.log('   Nom:', admin.name);
      console.log('   Email:', admin.email);
      console.log('   Rôle:', admin.role);
      console.log('   Permissions:', admin.permissions);
      console.log('   Actif:', admin.isActive);
      console.log('   Tentatives de connexion:', admin.loginAttempts);
      console.log('   Verrouillé jusqu\'à:', admin.lockedUntil);
      console.log('   Dernière connexion:', admin.lastLogin);
      console.log('   Créé le:', admin.createdAt);
      
      // Vérifier si le compte est actif et pas verrouillé
      if (!admin.isActive) {
        console.log('\n⚠️  ATTENTION: Le compte est DÉSACTIVÉ!');
      }
      
      if (admin.lockedUntil) {
        const now = new Date();
        const lockedUntil = new Date(admin.lockedUntil);
        if (now < lockedUntil) {
          console.log('\n⚠️  ATTENTION: Le compte est VERROUILLÉ jusqu\'à', lockedUntil);
        } else {
          console.log('\n✅ Le verrouillage a expiré, le compte sera déverrouillé à la prochaine connexion.');
        }
      }
      
      // Vérifier les autres admins
      console.log('\n🔍 Recherche de tous les admins...');
      const allAdmins = await db.select().from(schema.admins);
      console.log(`   Total d'admins: ${allAdmins.length}`);
      allAdmins.forEach((a, i) => {
        console.log(`   ${i+1}. ${a.email} - ${a.role} - Actif: ${a.isActive}`);
      });
      
    } else {
      console.log('\n❌ Admin dorainsarry@yahoo.fr NON TROUVÉ dans la base de données!');
      console.log('   Vérification des autres admins...');
      
      const allAdmins = await db.select().from(schema.admins);
      if (allAdmins.length > 0) {
        console.log(`   ${allAdmins.length} admin(s) trouvé(s):`);
        allAdmins.forEach((a, i) => {
          console.log(`   ${i+1}. ${a.email} - ${a.role}`);
        });
      } else {
        console.log('   Aucun admin dans la base de données!');
      }
    }
    
    // Vérifier la structure de la table
    console.log('\n🔍 Vérification de la structure de la table admins...');
    const tableCheck = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'admins'
      ORDER BY ordinal_position;
    `;
    console.log('   Colonnes de la table admins:');
    tableCheck.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
  }
}

verifyAdmin();
