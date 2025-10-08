import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { mockDb } from '../_lib/mock-db';
import { requireAuth, requirePatientAuth, requireAdminAuth } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    const patientAppointments = await mockDb.findAppointmentsByPatient(payload.userId);
    
    // Enrichir avec les informations du praticien
    const enrichedAppointments = await Promise.all(
      patientAppointments.map(async (appointment) => {
        const practitioner = await mockDb.findPractitionerById(appointment.practitionerId);
        return {
          ...appointment,
          practitioner: practitioner ? {
            id: practitioner.id,
            firstName: practitioner.firstName,
            lastName: practitioner.lastName,
            specialization: practitioner.specialization,
          } : null
        };
      })
    );

    return sendSuccess(res, enrichedAppointments);
    
  } else if (payload.userType === 'admin') {
    // Les admins voient tous les rendez-vous
    const allAppointments = await mockDb.findAllAppointments();
    
    // Enrichir avec les informations du patient et du praticien
    const enrichedAppointments = await Promise.all(
      allAppointments.map(async (appointment) => {
        const patient = await mockDb.findUserById(appointment.patientId);
        const practitioner = await mockDb.findPractitionerById(appointment.practitionerId);
        
        return {
          ...appointment,
          patient: patient ? {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
          } : null,
          practitioner: practitioner ? {
            id: practitioner.id,
            firstName: practitioner.firstName,
            lastName: practitioner.lastName,
            specialization: practitioner.specialization,
          } : null
        };
      })
    );

    return sendSuccess(res, enrichedAppointments);
  }

  return sendError(res, 'Type d\'utilisateur non autorisé', 403);
}

const insertAppointmentSchema = z.object({
  patientId: z.string(),
  practitionerId: z.string(),
  appointmentDate: z.string(),
  startTime: z.string(),
  reason: z.string().optional(),
});

async function createAppointment(req: VercelRequest, res: VercelResponse) {
  const payload = requirePatientAuth(req);
  
  const validationResult = insertAppointmentSchema.safeParse({
    ...req.body,
    patientId: payload.userId, // Utiliser l'ID du patient authentifié
  });
  
  if (!validationResult.success) {
    return sendError(res, 'Données invalides: ' + validationResult.error.issues[0].message, 400);
  }

  const appointmentData = validationResult.data;

  // Vérifier que le praticien existe et est actif
  const practitioner = await mockDb.findPractitionerById(appointmentData.practitionerId);

  if (!practitioner || !practitioner.isActive) {
    return sendError(res, 'Praticien non trouvé ou inactif', 404);
  }

  // Calculer l'heure de fin basée sur la durée de consultation
  const startTime = new Date(`2000-01-01T${appointmentData.startTime}`);
  const endTime = new Date(startTime.getTime() + practitioner.consultationDuration * 60000);
  const endTimeString = endTime.toTimeString().slice(0, 8);

  const newAppointment = await mockDb.createAppointment({
    ...appointmentData,
    endTime: endTimeString,
    status: 'scheduled',
  });

  return sendSuccess(res, newAppointment, 'Rendez-vous créé avec succès', 201);
}