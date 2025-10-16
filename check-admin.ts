import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema.js';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6aG2wNlTWnsb@ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkAdmin() {
  try {
    console.log('🔍 Recherche de l\'admin doriansarry@yahoo.fr...');
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql, { schema });
    
    const admins = await db.select().from(schema.admins).where(eq(schema.admins.email, 'doriansarry@yahoo.fr'));
    
    if (admins.length > 0) {
      const admin = admins[0];
      console.log('✅ Admin trouvé!');
      console.log('   ID:', admin.id);
      console.log('   Nom:', admin.name);
      console.log('   Email:', admin.email);
      console.log('   Créé le:', admin.createdAt);
    } else {
      console.log('❌ Admin non trouvé. Nous devons le créer.');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkAdmin();
