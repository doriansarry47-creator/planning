import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import { sendSuccess, sendError, handleApiError } from '../_lib/response';

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  userType: z.enum(['admin', 'patient']),
});

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return sendError(res, 'Méthode non autorisée', 405);
  }

  try {
    const validationResult = resetPasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(res, 'Données invalides', 400);
    }

    const { token, password, userType } = validationResult.data;

    // Vérifier si le token est valide et n'a pas expiré
    const tokenResults = await sql`
      SELECT email, expires_at, used_at 
      FROM password_resets 
      WHERE token = ${token} AND user_type = ${userType}
      LIMIT 1
    `;

    if (tokenResults.length === 0) {
      return sendError(res, 'Token invalide ou expiré', 400);
    }

    const resetRequest = tokenResults[0];

    // Vérifier si le token a expiré
    if (new Date() > new Date(resetRequest.expires_at)) {
      return sendError(res, 'Token expiré', 400);
    }

    // Vérifier si le token a déjà été utilisé
    if (resetRequest.used_at) {
      return sendError(res, 'Token déjà utilisé', 400);
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe de l'utilisateur
    if (userType === 'admin') {
      await sql`
        UPDATE admins 
        SET password = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP 
        WHERE email = ${resetRequest.email}
      `;
    } else {
      await sql`
        UPDATE patients 
        SET password = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP 
        WHERE email = ${resetRequest.email}
      `;
    }

    // Marquer le token comme utilisé
    await sql`
      UPDATE password_resets 
      SET used_at = CURRENT_TIMESTAMP 
      WHERE token = ${token}
    `;

    return sendSuccess(res, null, 'Mot de passe réinitialisé avec succès');

  } catch (error) {
    console.error('Erreur reset-password:', error);
    return handleApiError(res, error);
  }
}