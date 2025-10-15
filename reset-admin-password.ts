import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema';
import bcrypt from 'bcryptjs';

const DATABASE_URL = 'postgresql://neondb_owner:npg_6aG2wNlTWnsb@ep-autumn-bar-abt09oc2-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function resetAdminPassword() {
  try {
    console.log('🔧 Resetting admin password...');
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql, { schema });

    const email = 'doriansarry@yahoo.fr';
    const newPassword = 'admin123';

    // Hash the new password
    console.log(`🔐 Hashing new password: ${newPassword}`);
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the admin password
    console.log(`📝 Updating admin password for: ${email}`);
    const updated = await db
      .update(schema.admins)
      .set({ password: hashedPassword })
      .where(eq(schema.admins.email, email))
      .returning();

    if (updated.length > 0) {
      console.log('✅ Password updated successfully!');
      console.log('\n📋 Login credentials:');
      console.log('Email:', email);
      console.log('Password:', newPassword);
      
      // Verify the password
      console.log('\n🔍 Verifying password...');
      const isValid = await bcrypt.compare(newPassword, hashedPassword);
      console.log('Password verification:', isValid ? '✅ SUCCESS' : '❌ FAILED');
    } else {
      console.log('❌ Admin not found');
    }
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
}

resetAdminPassword();
