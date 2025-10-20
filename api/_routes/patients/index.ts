import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, patients } from '../../_lib/db';
import { requireAuth } from '../../_lib/auth';
import { sendSuccess, sendError, handleApiError } from '../../_lib/response';
import { eq, desc, like, or } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Vérifier l'authentification et que c'est un admin
    const payload = requireAuth(req);
    
    if (payload.userType !== 'admin') {
      return sendError(res, 'Accès non autorisé - Réservé aux administrateurs', 403);
    }

    switch (req.method) {
      case 'GET':
        return await handleGetPatients(req, res);
      case 'PUT':
        return await handleUpdatePatient(req, res);
      case 'DELETE':
        return await handleDeletePatient(req, res);
      default:
        return sendError(res, 'Méthode non autorisée', 405);
    }
  } catch (error) {
    return handleApiError(res, error);
  }
}

// Récupérer tous les patients avec filtres et recherche
async function handleGetPatients(req: VercelRequest, res: VercelResponse) {
  try {
    const { search, limit = '50', offset = '0' } = req.query;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    let query = db.select({
      id: patients.id,
      firstName: patients.firstName,
      lastName: patients.lastName,
      email: patients.email,
      phone: patients.phone,
      isReferredByProfessional: patients.isReferredByProfessional,
      referringProfessional: patients.referringProfessional,
      consultationReason: patients.consultationReason,
      symptomsStartDate: patients.symptomsStartDate,
      preferredSessionType: patients.preferredSessionType,
      createdAt: patients.createdAt,
    }).from(patients);

    // Ajouter la recherche si fournie
    if (search && typeof search === 'string') {
      const searchPattern = `%${search}%`;
      query = query.where(
        or(
          like(patients.firstName, searchPattern),
          like(patients.lastName, searchPattern),
          like(patients.email, searchPattern)
        )
      ) as any;
    }

    // Trier par date de création (plus récents en premier)
    query = query.orderBy(desc(patients.createdAt));

    // Appliquer la pagination
    query = query.limit(limitNum).offset(offsetNum);

    const result = await query;

    // Compter le total pour la pagination
    const countResult = await db.select().from(patients);
    const total = countResult.length;

    return sendSuccess(res, {
      patients: result,
      total,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des patients:', error);
    return sendError(res, 'Erreur lors de la récupération des patients', 500);
  }
}

// Mettre à jour un patient
async function handleUpdatePatient(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return sendError(res, 'ID patient requis', 400);
    }

    const updateData = req.body;
    
    // Ne pas permettre la mise à jour du mot de passe par cette route
    delete updateData.password;
    delete updateData.id;
    delete updateData.createdAt;

    const [updatedPatient] = await db
      .update(patients)
      .set(updateData)
      .where(eq(patients.id, id))
      .returning();

    if (!updatedPatient) {
      return sendError(res, 'Patient non trouvé', 404);
    }

    const { password: _, ...patientWithoutPassword } = updatedPatient;

    return sendSuccess(res, {
      patient: patientWithoutPassword,
    }, 'Patient mis à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du patient:', error);
    return sendError(res, 'Erreur lors de la mise à jour du patient', 500);
  }
}

// Supprimer un patient
async function handleDeletePatient(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return sendError(res, 'ID patient requis', 400);
    }

    const [deletedPatient] = await db
      .delete(patients)
      .where(eq(patients.id, id))
      .returning();

    if (!deletedPatient) {
      return sendError(res, 'Patient non trouvé', 404);
    }

    return sendSuccess(res, {
      message: 'Patient supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du patient:', error);
    return sendError(res, 'Erreur lors de la suppression du patient', 500);
  }
}
