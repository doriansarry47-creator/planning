import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6aG2wNlTWnsb@ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
  try {
    console.log('🔗 Connexion à la base de données...');
    const sql = neon(DATABASE_URL);
    
    // Test simple
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connexion réussie!');
    console.log('⏰ Heure actuelle:', result[0].current_time);
    
    // Vérifier les tables existantes
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\n📊 Tables dans la base de données:');
    tables.forEach(t => console.log('  -', t.table_name));
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    process.exit(1);
  }
}

testConnection();
