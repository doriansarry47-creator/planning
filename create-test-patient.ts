import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema';
import bcrypt from 'bcryptjs';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6aG2wNlTWnsb@ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function createOrUpdateTestPatient() {
  try {
    console.log('🔧 Creating/updating test patient...');
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql, { schema });

    const email = 'patient.test@medplan.fr';
    const password = 'patient123';

    // Check if patient exists
    const existing = await db
      .select()
      .from(schema.patients)
      .where(eq(schema.patients.email, email))
      .limit(1);

    const hashedPassword = await bcrypt.hash(password, 12);

    if (existing.length > 0) {
      console.log('📝 Updating existing patient...');
      const updated = await db
        .update(schema.patients)
        .set({ password: hashedPassword })
        .where(eq(schema.patients.email, email))
        .returning();

      console.log('✅ Patient updated!');
      console.log('\n📋 Login credentials:');
      console.log('Email:', email);
      console.log('Password:', password);
    } else {
      console.log('➕ Creating new patient...');
      const created = await db
        .insert(schema.patients)
        .values({
          firstName: 'Jean',
          lastName: 'Patient',
          email: email,
          password: hashedPassword,
          phone: '0612345678',
          isReferredByProfessional: false,
          consultationReason: 'Test account for application testing',
          preferredSessionType: 'cabinet',
        })
        .returning();

      console.log('✅ Patient created!');
      console.log('\n📋 Login credentials:');
      console.log('Email:', email);
      console.log('Password:', password);
    }

    // Verify
    console.log('\n🔍 Verifying password...');
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('Password verification:', isValid ? '✅ SUCCESS' : '❌ FAILED');
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
}

createOrUpdateTestPatient();
