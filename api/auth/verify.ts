import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db, patients, admins } from '../_lib/db';
import { requireAuth } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError, handleCors } from '../_lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return handleCors(res);
  }

  if (req.method !== 'GET') {
    return sendError(res, 'Méthode non autorisée', 405);
  }

  try {
    const payload = requireAuth(req);
    
    if (payload.userType === 'admin') {
      // Trouver l'utilisateur admin
      const [user] = await db.select().from(admins).where(eq(admins.id, payload.userId)).limit(1);
      
      if (!user) {
        return sendError(res, 'Utilisateur non trouvé', 404);
      }

      const { password: _, ...userWithoutPassword } = user;
      return sendSuccess(res, {
        user: userWithoutPassword,
        userType: 'admin',
      });
      
    } else if (payload.userType === 'patient') {
      // Trouver le patient
      const [patient] = await db.select().from(patients).where(eq(patients.id, payload.userId)).limit(1);
      
      if (!patient) {
        return sendError(res, 'Patient non trouvé', 404);
      }

      const { password: _, ...patientWithoutPassword } = patient;
      return sendSuccess(res, {
        user: patientWithoutPassword,
        userType: 'patient',
      });
    }

    return sendError(res, 'Type d\'utilisateur invalide', 400);
  } catch (error) {
    return handleApiError(res, error);
  }
}