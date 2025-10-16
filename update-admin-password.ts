import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from './shared/schema.js';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6aG2wNlTWnsb@ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function updatePassword() {
  try {
    console.log('🔐 Mise à jour du mot de passe admin...');
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql, { schema });
    
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await db.update(schema.admins)
      .set({ password: hashedPassword })
      .where(eq(schema.admins.email, 'doriansarry@yahoo.fr'));
    
    console.log('✅ Mot de passe mis à jour avec succès!');
    console.log('📧 Email: doriansarry@yahoo.fr');
    console.log('🔑 Mot de passe: admin123');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

updatePassword();
