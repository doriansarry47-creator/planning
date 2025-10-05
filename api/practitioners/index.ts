import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db, practitioners, insertPractitionerSchema } from '../_lib/db';
import { requireAdminAuth } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return handleCors(res);
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
  const allPractitioners = await db.select().from(practitioners).where(eq(practitioners.isActive, true));
  
  return sendSuccess(res, allPractitioners);
}

async function createPractitioner(req: VercelRequest, res: VercelResponse) {
  // Seuls les admins peuvent créer des praticiens
  requireAdminAuth(req);
  
  const validationResult = insertPractitionerSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return sendError(res, 'Données invalides', 400);
  }

  const practitionerData = validationResult.data;

  // Vérifier si l'email existe déjà
  const existingPractitioner = await db.select()
    .from(practitioners)
    .where(eq(practitioners.email, practitionerData.email))
    .limit(1);
    
  if (existingPractitioner.length > 0) {
    return sendError(res, 'Cette adresse email est déjà utilisée', 409);
  }

  const [newPractitioner] = await db.insert(practitioners)
    .values(practitionerData)
    .returning();

  return sendSuccess(res, newPractitioner, 'Praticien créé avec succès', 201);
}