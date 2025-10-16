import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';

// Configuration de la base de données directe
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }
  return url;
};

// Fonction utilitaire pour créer la connexion DB
const getDB = () => {
  const sql = neon(getDatabaseUrl());
  return drizzle(sql, { schema });
};

// Fonction utilitaire pour envoyer une réponse de succès
const sendSuccess = (res: VercelResponse, data: any, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
};

// Fonction utilitaire pour envoyer une erreur
const sendError = (res: VercelResponse, message: string, status = 500) => {
  return res.status(status).json({
    success: false,
    error: message,
    message,
  });
};

// Fonction pour vérifier l'authentification
const requireAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token d\'authentification manquant');
  }

  const token = authHeader.substring(7);
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }

  try {
    return jwt.verify(token, secret) as { userId: string; email: string; userType: string };
  } catch (error) {
    throw new Error('Token d\'authentification invalide');
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return sendError(res, 'Méthode non autorisée', 405);
  }

  try {
    const payload = requireAuth(req);
    const db = getDB();
    
    if (payload.userType === 'admin') {
      const [user] = await db.select().from(schema.admins).where(eq(schema.admins.id, payload.userId)).limit(1);
      
      if (!user) {
        return sendError(res, 'Utilisateur non trouvé', 404);
      }

      const { password: _, ...userWithoutPassword } = user;
      return sendSuccess(res, {
        user: userWithoutPassword,
        userType: 'admin',
      });
      
    } else if (payload.userType === 'patient') {
      const [patient] = await db.select().from(schema.patients).where(eq(schema.patients.id, payload.userId)).limit(1);
      
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
    console.error('Erreur lors de la vérification:', error);
    return sendError(res, error.message || 'Erreur interne du serveur', 401);
  }
}