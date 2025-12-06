import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionString = 'postgresql://neondb_owner:npg_Im7fQZ8sNUdX@ep-fancy-king-abfajg7o-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connexion à la base de données réussie!');
    
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Heure serveur:', result.rows[0].now);
    
    // Vérifier les tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables dans la base de données:');
    tables.rows.forEach(row => console.log('  -', row.table_name));
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    process.exit(1);
  }
}

testConnection();
