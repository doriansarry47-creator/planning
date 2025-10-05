import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq, and } from 'drizzle-orm';
import { db, appointments, patients, practitioners, insertAppointmentSchema } from '../_lib/db';
import { requireAuth, requirePatientAuth, requireAdminAuth } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return handleCors(res);
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getAppointments(req, res);
      case 'POST':
        return await createAppointment(req, res);
      default:
        return sendError(res, 'Méthode non autorisée', 405);
    }
  } catch (error) {
    return handleApiError(res, error);
  }
}

async function getAppointments(req: VercelRequest, res: VercelResponse) {
  const payload = requireAuth(req);
  
  if (payload.userType === 'patient') {
    // Les patients ne voient que leurs propres rendez-vous
    const patientAppointments = await db.select({
      id: appointments.id,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status,
      reason: appointments.reason,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
      practitioner: {
        id: practitioners.id,
        firstName: practitioners.firstName,
        lastName: practitioners.lastName,
        specialization: practitioners.specialization,
      },
    })
    .from(appointments)
    .innerJoin(practitioners, eq(appointments.practitionerId, practitioners.id))
    .where(eq(appointments.patientId, payload.userId))
    .orderBy(appointments.appointmentDate, appointments.startTime);

    return sendSuccess(res, patientAppointments);
    
  } else if (payload.userType === 'admin') {
    // Les admins voient tous les rendez-vous
    const allAppointments = await db.select({
      id: appointments.id,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status,
      reason: appointments.reason,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
      patient: {
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        email: patients.email,
      },
      practitioner: {
        id: practitioners.id,
        firstName: practitioners.firstName,
        lastName: practitioners.lastName,
        specialization: practitioners.specialization,
      },
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(practitioners, eq(appointments.practitionerId, practitioners.id))
    .orderBy(appointments.appointmentDate, appointments.startTime);

    return sendSuccess(res, allAppointments);
  }

  return sendError(res, 'Type d\'utilisateur non autorisé', 403);
}

async function createAppointment(req: VercelRequest, res: VercelResponse) {
  const payload = requirePatientAuth(req);
  
  const validationResult = insertAppointmentSchema.safeParse({
    ...req.body,
    patientId: payload.userId, // Utiliser l'ID du patient authentifié
  });
  
  if (!validationResult.success) {
    return sendError(res, 'Données invalides', 400);
  }

  const appointmentData = validationResult.data;

  // Vérifier que le praticien existe et est actif
  const [practitioner] = await db.select()
    .from(practitioners)
    .where(and(
      eq(practitioners.id, appointmentData.practitionerId),
      eq(practitioners.isActive, true)
    ))
    .limit(1);

  if (!practitioner) {
    return sendError(res, 'Praticien non trouvé ou inactif', 404);
  }

  // Vérifier qu'il n'y a pas déjà un rendez-vous à ce créneau
  const existingAppointment = await db.select()
    .from(appointments)
    .where(and(
      eq(appointments.practitionerId, appointmentData.practitionerId),
      eq(appointments.appointmentDate, appointmentData.appointmentDate),
      eq(appointments.startTime, appointmentData.startTime),
      eq(appointments.status, 'scheduled')
    ))
    .limit(1);

  if (existingAppointment.length > 0) {
    return sendError(res, 'Ce créneau n\'est plus disponible', 409);
  }

  // Calculer l'heure de fin basée sur la durée de consultation
  const startTime = new Date(`2000-01-01T${appointmentData.startTime}`);
  const endTime = new Date(startTime.getTime() + practitioner.consultationDuration * 60000);
  const endTimeString = endTime.toTimeString().slice(0, 8);

  const [newAppointment] = await db.insert(appointments)
    .values({
      ...appointmentData,
      endTime: endTimeString,
    })
    .returning();

  return sendSuccess(res, newAppointment, 'Rendez-vous créé avec succès', 201);
}