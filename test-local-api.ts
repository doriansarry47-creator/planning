import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from './shared/schema.js';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6aG2wNlTWnsb@ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testLogin() {
  try {
    console.log('🧪 Test de connexion admin local...\n');
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql, { schema });
    
    const email = 'doriansarry@yahoo.fr';
    const password = 'admin123';
    
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}\n`);
    
    // Récupérer l'admin
    const admins = await db.select().from(schema.admins).where(eq(schema.admins.email, email));
    
    if (admins.length === 0) {
      console.log('❌ Admin non trouvé!');
      return;
    }
    
    const admin = admins[0];
    console.log(`✅ Admin trouvé: ${admin.name}`);
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (isPasswordValid) {
      console.log('✅ Mot de passe valide!');
      console.log('\n🎉 Connexion réussie!\n');
      console.log('Données admin:');
      console.log(`  - ID: ${admin.id}`);
      console.log(`  - Nom: ${admin.name}`);
      console.log(`  - Email: ${admin.email}`);
      console.log(`  - Créé le: ${admin.createdAt}`);
    } else {
      console.log('❌ Mot de passe invalide!');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testLogin();
