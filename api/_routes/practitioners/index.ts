import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { mockDb } from '../../_lib/mock-db';
import { requireAdminAuth } from '../../_lib/auth';
import { sendSuccess, sendError, handleApiError, handleCors } from '../../_lib/response';

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
        return await getPractitioners(req, res);
      case 'POST':
        return await createPractitioner(req, res);
      default:
        return sendError(res, 'Méthode non autorisée', 405);
    }
  } catch (error) {
    return handleApiError(res, error);
  }
}

async function getPractitioners(req: VercelRequest, res: VercelResponse) {
  // Les praticiens peuvent être consultés par tous (patients et admins)
  const allPractitioners = await mockDb.findAllPractitioners();
  
  return sendSuccess(res, allPractitioners);
}

const insertPractitionerSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  specialization: z.string().min(2, "La spécialisation est requise"),
  email: z.string().email("Format d'email invalide"),
  phoneNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  biography: z.string().optional(),
  consultationDuration: z.number().min(15).max(180).default(60),
});

async function createPractitioner(req: VercelRequest, res: VercelResponse) {
  // Seuls les admins peuvent créer des praticiens
  requireAdminAuth(req);
  
  const validationResult = insertPractitionerSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return sendError(res, 'Données invalides: ' + validationResult.error.issues[0].message, 400);
  }

  const practitionerData = validationResult.data;

  const newPractitioner = await mockDb.createPractitioner({
    ...practitionerData,
    isActive: true,
  });

  return sendSuccess(res, newPractitioner, 'Praticien créé avec succès', 201);
}