import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyToken, extractTokenFromRequest } from '../_lib/auth';
import { mockDb } from '../_lib/mock-db';
import type { MockUser, MockAppointment } from '../_lib/mock-types';
import { sendSuccess, sendError, handleApiError } from '../_lib/response';
import { sendAppointmentConfirmation, sendAppointmentCancellation } from '../_lib/email';

const createAppointmentSchema = z.object({
  slotId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}T/, "Format de date invalide"),
  duration: z.number().min(30).max(120).default(60),
  type: z.enum(["cabinet", "visio"], {
    required_error: "Le type de consultation est requis"
  }),
  reason: z.string().min(10, "Veuillez détailler votre motif de consultation"),
  isReferredByProfessional: z.boolean().default(false),
  referringProfessional: z.string().optional(),
  symptomsStartDate: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      return sendError(res, 'Token d\'authentification requis', 401);
    }
    const authResult = await verifyToken(token);
    const userPayload = authResult;

    switch (req.method) {
      case 'GET':
        return await getAppointments(req, res, userPayload);
      case 'POST':
        return await createAppointment(req, res, userPayload);
      case 'PUT':
        return await updateAppointment(req, res, userPayload);
      case 'DELETE':
        return await cancelAppointment(req, res, userPayload);
      default:
        return sendError(res, 'Méthode non autorisée', 405);
    }
  } catch (error) {
    return handleApiError(res, error);
  }
}

async function getAppointments(req: VercelRequest, res: VercelResponse, user: any) {
  const { status, startDate, endDate } = req.query;
  
  if (user.userType === 'patient') {
    // Les patients ne voient que leurs propres rendez-vous
    let appointments = await mockDb.findAppointmentsByPatient(user.userId);
    
    // Filtrer par statut si spécifié
    if (status && status !== 'all') {
      appointments = appointments.filter(apt => apt.status === status);
    }
    
    // Filtrer par date si spécifiée
    if (startDate) {
      appointments = appointments.filter(apt => (apt.appointmentDate || apt.date || '') >= startDate);
    }
    
    if (endDate) {
      appointments = appointments.filter(apt => (apt.appointmentDate || apt.date || '') <= endDate);
    }
    
    return sendSuccess(res, {
      appointments,
      total: appointments.length
    });
    
  } else if (user.userType === 'admin') {
    // Les admins voient tous les rendez-vous avec informations patient
    let allAppointments = await mockDb.findAllAppointments();
    
    // Enrichir avec les informations du patient
    let enrichedAppointments = await Promise.all(
      allAppointments.map(async (appointment) => {
        const patient = await mockDb.findPatientById(appointment.patientId);
        
        return {
          ...appointment,
          patient: patient ? {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            phone: patient.phone || undefined,
          } : null
        };
      })
    );
    
    // Filtrer par statut si spécifié
    if (status && status !== 'all') {
      enrichedAppointments = enrichedAppointments.filter(apt => apt.status === status);
    }
    
    // Filtrer par date si spécifiée
    if (startDate) {
      enrichedAppointments = enrichedAppointments.filter(apt => (apt.appointmentDate || apt.date || '') >= startDate);
    }
    
    if (endDate) {
      enrichedAppointments = enrichedAppointments.filter(apt => (apt.appointmentDate || apt.date || '') <= endDate);
    }
    
    return sendSuccess(res, {
      appointments: enrichedAppointments,
      total: enrichedAppointments.length
    });
  }

  return sendError(res, 'Type d\'utilisateur non autorisé', 403);
}

async function createAppointment(req: VercelRequest, res: VercelResponse, user: any) {
  // Seuls les patients peuvent créer des rendez-vous
  if (user.userType !== 'patient') {
    return sendError(res, 'Seuls les patients peuvent prendre des rendez-vous', 403);
  }

  const validationResult = createAppointmentSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return sendError(res, 'Données invalides: ' + validationResult.error.issues[0].message, 400);
  }

  const appointmentData = validationResult.data;

  // Vérifier la disponibilité du créneau si un slotId est fourni
  if (appointmentData.slotId) {
    // Ici, vous devriez vérifier la disponibilité du slot dans votre base de données
    // Pour l'instant, nous simulons cette vérification
  }

  // Récupérer les informations du patient
  const patient = await mockDb.findPatientById(user.userId);
  if (!patient) {
    return sendError(res, 'Patient non trouvé', 404);
  }

  const newAppointment = await mockDb.createAppointment({
    patientId: user.userId,
    appointmentDate: appointmentData.date,
    duration: appointmentData.duration,
    status: 'pending', // En attente de confirmation par le thérapeute
    type: appointmentData.type,
    reason: appointmentData.reason,
    isReferredByProfessional: appointmentData.isReferredByProfessional,
    referringProfessional: appointmentData.referringProfessional,
    symptomsStartDate: appointmentData.symptomsStartDate,
    updatedAt: new Date().toISOString(),
  });

  // Envoyer l'email de confirmation
  try {
    const appointmentDate = new Date(appointmentData.date);
    await sendAppointmentConfirmation(
      patient.email,
      `${patient.firstName} ${patient.lastName}`,
      appointmentDate.toLocaleDateString('fr-FR'),
      appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      appointmentData.type,
      newAppointment.id
    );
  } catch (emailError) {
    console.error('Erreur lors de l\'envoi de l\'email:', emailError);
    // On ne fait pas échouer la création du rendez-vous si l'email échoue
  }

  // SMS feature disabled for now
  // TODO: Implement SMS functionality if needed

  return sendSuccess(res, newAppointment, 'Rendez-vous créé avec succès', 201);
}

async function updateAppointment(req: VercelRequest, res: VercelResponse, user: any) {
  const { appointmentId } = req.query;
  const updateData = req.body;

  if (!appointmentId) {
    return sendError(res, 'ID du rendez-vous requis', 400);
  }

  const appointment = await mockDb.findAppointmentById(appointmentId as string);
  if (!appointment) {
    return sendError(res, 'Rendez-vous non trouvé', 404);
  }

  // Vérifier les permissions
  if (user.userType === 'patient' && appointment.patientId !== user.userId) {
    return sendError(res, 'Vous ne pouvez pas modifier ce rendez-vous', 403);
  }

  // Pour les admins, permettre de mettre à jour le statut et les notes
  const allowedUpdates = user.userType === 'admin' 
    ? ['status', 'therapistNotes', 'sessionSummary']
    : ['status']; // Les patients peuvent seulement annuler

  const updatedFields: any = {
    updatedAt: new Date().toISOString()
  };

  // Filtrer les champs autorisés
  Object.keys(updateData).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updatedFields[key] = updateData[key];
    }
  });

  const updatedAppointment = await mockDb.updateAppointment(appointmentId as string, updatedFields);

  return sendSuccess(res, updatedAppointment, 'Rendez-vous mis à jour avec succès');
}

async function cancelAppointment(req: VercelRequest, res: VercelResponse, user: any) {
  const { appointmentId } = req.query;
  const { reason } = req.body;

  if (!appointmentId) {
    return sendError(res, 'ID du rendez-vous requis', 400);
  }

  const appointment = await mockDb.findAppointmentById(appointmentId as string);
  if (!appointment) {
    return sendError(res, 'Rendez-vous non trouvé', 404);
  }

  // Vérifier les permissions
  if (user.userType === 'patient' && appointment.patientId !== user.userId) {
    return sendError(res, 'Vous ne pouvez pas annuler ce rendez-vous', 403);
  }

  // Mettre à jour le statut au lieu de supprimer
  const cancelledAppointment = await mockDb.updateAppointment(appointmentId as string, {
    status: 'cancelled',
    updatedAt: new Date().toISOString()
  });

  // Envoyer l'email d'annulation
  try {
    const patient = await mockDb.findPatientById(appointment.patientId);
    if (patient) {
      const appointmentDate = new Date(appointment.appointmentDate || appointment.date || '');
      await sendAppointmentCancellation(
        patient.email,
        `${patient.firstName} ${patient.lastName}`,
        appointmentDate.toLocaleDateString('fr-FR'),
        appointmentDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        reason || 'Aucune raison spécifiée'
      );
    }
  } catch (emailError) {
    console.error('Erreur lors de l\'envoi de l\'email d\'annulation:', emailError);
  }

  return sendSuccess(res, cancelledAppointment, 'Rendez-vous annulé avec succès');
}

// Nouvelles fonctions spécifiques à la thérapie sensorimotrice

async function getStatistics(req: VercelRequest, res: VercelResponse, user: any) {
  if (user.userType !== 'admin') {
    return sendError(res, 'Accès non autorisé', 403);
  }

  const { period = 'month' } = req.query;
  
  // Calculer les statistiques selon la période
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default: // month
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const allAppointments = await mockDb.findAllAppointments();
  const allPatients = await mockDb.findAllPatients();
  
  // Filtrer par période
  const periodAppointments = allAppointments.filter(
    apt => new Date(apt.appointmentDate || apt.date || '') >= startDate
  );

  const statistics = {
    totalAppointments: periodAppointments.length,
    totalPatients: allPatients.length,
    newPatients: allPatients.filter(
      patient => new Date(patient.createdAt) >= startDate
    ).length,
    cancellationRate: periodAppointments.length > 0 
      ? (periodAppointments.filter(apt => apt.status === 'cancelled').length / periodAppointments.length) * 100
      : 0,
    sessionTypes: [
      {
        type: 'cabinet',
        count: periodAppointments.filter(apt => (apt as any).type === 'cabinet').length,
        color: '#0d9488'
      },
      {
        type: 'visio',
        count: periodAppointments.filter(apt => (apt as any).type === 'visio').length,
        color: '#3b82f6'
      }
    ],
    appointmentStatus: [
      {
        status: 'pending',
        count: periodAppointments.filter(apt => apt.status === 'pending').length,
        color: '#f59e0b'
      },
      {
        status: 'confirmed',
        count: periodAppointments.filter(apt => apt.status === 'confirmed').length,
        color: '#10b981'
      },
      {
        status: 'completed',
        count: periodAppointments.filter(apt => apt.status === 'completed').length,
        color: '#6366f1'
      },
      {
        status: 'cancelled',
        count: periodAppointments.filter(apt => apt.status === 'cancelled').length,
        color: '#ef4444'
      }
    ],
    referralSources: [
      {
        source: 'Médecin traitant',
        count: allPatients.filter(p => (p as any).isReferredByProfessional && (p as any).referringProfessional?.includes('Médecin')).length
      },
      {
        source: 'Psychologue',
        count: allPatients.filter(p => (p as any).isReferredByProfessional && (p as any).referringProfessional?.includes('Psychologue')).length
      },
      {
        source: 'Recherche personnelle',
        count: allPatients.filter(p => !(p as any).isReferredByProfessional).length
      },
      {
        source: 'Bouche à oreille',
        count: Math.floor(allPatients.length * 0.2) // Estimation
      }
    ]
  };

  return sendSuccess(res, statistics, 'Statistiques récupérées avec succès');
}

// Fonction utilitaire
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}