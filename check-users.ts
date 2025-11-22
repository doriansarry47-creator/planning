import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from './drizzle/schema';

const connectionString = 'postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

async function checkUsers() {
  try {
    console.log('🔍 Recherche des utilisateurs...\n');
    
    const allUsers = await db.select().from(users);
    
    console.log(`📊 Total utilisateurs: ${allUsers.length}\n`);
    
    allUsers.forEach(user => {
      console.log(`👤 ${user.name || 'Sans nom'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Actif: ${user.isActive}`);
      console.log('');
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkUsers();
