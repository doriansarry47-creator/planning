import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db, appointments, patients, admins } from './db';

/**
 * Helper functions for database operations
 */

// Patient operations
export async function findPatientById(id: string) {
  const results = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return results[0] || null;
}

export async function findPatientByEmail(email: string) {
  const results = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
  return results[0] || null;
}

export async function findAllPatients() {
  return await db.select().from(patients).orderBy(desc(patients.createdAt));
}

// Admin operations
export async function findAdminById(id: string) {
  const results = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
  return results[0] || null;
}

export async function findAdminByEmail(email: string) {
  const results = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  return results[0] || null;
}

// Appointment operations
export async function findAppointmentById(id: string) {
  const results = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return results[0] || null;
}

export async function findAppointmentsByPatient(patientId: string) {
  return await db
    .select()
    .from(appointments)
    .where(eq(appointments.patientId, patientId))
    .orderBy(desc(appointments.date));
}

export async function findAllAppointments() {
  return await db.select().from(appointments).orderBy(desc(appointments.date));
}

export async function findAppointmentsByDateRange(startDate: string, endDate: string) {
  return await db
    .select()
    .from(appointments)
    .where(
      and(
        gte(appointments.date, new Date(startDate)),
        lte(appointments.date, new Date(endDate))
      )
    )
    .orderBy(desc(appointments.date));
}

export async function createAppointment(data: {
  patientId: string;
  date: Date;
  duration: number;
  status: string;
  type: string;
  reason: string;
  isReferredByProfessional?: boolean;
  referringProfessional?: string | null;
  symptomsStartDate?: string | null;
}) {
  const results = await db.insert(appointments).values(data).returning();
  return results[0];
}

export async function updateAppointment(id: string, data: Partial<typeof appointments.$inferInsert>) {
  const results = await db
    .update(appointments)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(appointments.id, id))
    .returning();
  return results[0] || null;
}

export async function deleteAppointment(id: string) {
  await db.delete(appointments).where(eq(appointments.id, id));
  return true;
}
