import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema';
import bcrypt from 'bcryptjs';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6aG2wNlTWnsb@ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql, { schema });

    // Test 1: Check tables exist
    console.log('\n📊 Checking tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('Tables:', tables.map(t => t.table_name));

    // Test 2: Check admins
    console.log('\n👤 Checking admins table...');
    const allAdmins = await db.select().from(schema.admins);
    console.log(`Found ${allAdmins.length} admin(s)`);
    
    if (allAdmins.length > 0) {
      console.log('\nAdmin accounts:');
      allAdmins.forEach(admin => {
        console.log(`  - ${admin.email} (ID: ${admin.id}, Name: ${admin.name})`);
      });
    }

    // Test 3: Check specific admin
    console.log('\n🔐 Checking admin: doriansarry@yahoo.fr');
    const targetAdmin = await db
      .select()
      .from(schema.admins)
      .where(eq(schema.admins.email, 'doriansarry@yahoo.fr'))
      .limit(1);

    if (targetAdmin.length > 0) {
      console.log('✅ Admin found!');
      console.log('Email:', targetAdmin[0].email);
      console.log('Name:', targetAdmin[0].name);
      console.log('Password hash:', targetAdmin[0].password.substring(0, 20) + '...');
      
      // Test password
      console.log('\n🔑 Testing password: admin123');
      const isValid = await bcrypt.compare('admin123', targetAdmin[0].password);
      console.log('Password valid:', isValid ? '✅ YES' : '❌ NO');
      
      // Try alternative password
      console.log('\n🔑 Testing password: Admin123');
      const isValid2 = await bcrypt.compare('Admin123', targetAdmin[0].password);
      console.log('Password valid:', isValid2 ? '✅ YES' : '❌ NO');
    } else {
      console.log('❌ Admin NOT found!');
      console.log('\n🔧 Creating admin account...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const newAdmin = await db.insert(schema.admins).values({
        email: 'doriansarry@yahoo.fr',
        password: hashedPassword,
        name: 'Dorian Sarry',
      }).returning();
      
      console.log('✅ Admin created:', newAdmin[0].email);
    }

    // Test 4: Check patients
    console.log('\n👥 Checking patients table...');
    const allPatients = await db.select().from(schema.patients);
    console.log(`Found ${allPatients.length} patient(s)`);
    
    if (allPatients.length > 0) {
      console.log('\nPatient accounts (first 5):');
      allPatients.slice(0, 5).forEach(patient => {
        console.log(`  - ${patient.email} (ID: ${patient.id}, Name: ${patient.firstName} ${patient.lastName})`);
      });
    }

    console.log('\n✅ Database connection test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing database:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

testConnection();
