import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
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

// Fonction utilitaire pour générer le token JWT
const generateToken = (payload: { userId: string; email: string; userType: string }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
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

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

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
    const { userType } = req.query;
    
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(res, 'Email et mot de passe requis', 400);
    }

    const { email, password } = validationResult.data;

    const db = getDB();
    
    if (userType === 'admin') {
      const adminResults = await db.select().from(schema.admins).where(eq(schema.admins.email, email)).limit(1);
      const admin = adminResults[0];
      
      if (!admin) {
        return sendError(res, 'Identifiants invalides. Vérifiez votre e-mail ou votre mot de passe.', 401);
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return sendError(res, 'Identifiants invalides. Vérifiez votre e-mail ou votre mot de passe.', 401);
      }

      const token = generateToken({
        userId: admin.id,
        email: admin.email,
        userType: 'admin',
      });

      const { password: _, ...adminWithoutPassword } = admin;

      return sendSuccess(res, {
        user: adminWithoutPassword,
        token,
      }, 'Connexion réussie');
      
    } else if (userType === 'patient') {
      const patientResults = await db.select().from(schema.patients).where(eq(schema.patients.email, email)).limit(1);
      const patient = patientResults[0];
      
      if (!patient) {
        return sendError(res, 'Identifiants invalides. Vérifiez votre e-mail ou votre mot de passe.', 401);
      }

      const isPasswordValid = await bcrypt.compare(password, patient.password);
      if (!isPasswordValid) {
        return sendError(res, 'Identifiants invalides. Vérifiez votre e-mail ou votre mot de passe.', 401);
      }

      const token = generateToken({
        userId: patient.id,
        email: patient.email,
        userType: 'patient',
      });

      const { password: _, ...patientWithoutPassword } = patient;

      return sendSuccess(res, {
        user: patientWithoutPassword,
        token,
      }, 'Connexion réussie');
      
    } else {
      return sendError(res, 'Type d\'utilisateur invalide', 400);
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return sendError(res, 'Erreur interne du serveur', 500);
  }
}