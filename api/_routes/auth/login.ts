import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../../../shared/schema';

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

// Fonction de connexion générique
const loginUser = async (db: any, userType: string, email: string, password_provided: string) => {
  let userTable;
  if (userType === 'admin') {
    userTable = schema.admins;
  } else if (userType === 'patient') {
    userTable = schema.patients;
  } else {
    throw new Error('Type d\'utilisateur invalide');
  }

  const userResults = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
  const user = userResults[0];

  if (!user) {
    throw new Error('Identifiants invalides. Vérifiez votre e-mail ou votre mot de passe.');
  }

  const isPasswordValid = await bcrypt.compare(password_provided, user.password);
  if (!isPasswordValid) {
    throw new Error('Identifiants invalides. Vérifiez votre e-mail ou votre mot de passe.');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    userType,
  });

  const { password, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};


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

    if (typeof userType !== 'string' || !['admin', 'patient'].includes(userType)) {
      return sendError(res, 'Type d\'utilisateur invalide', 400);
    }

    const db = getDB();
    const result = await loginUser(db, userType, email, password);
    
    return sendSuccess(res, result, 'Connexion réussie');

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    if (error instanceof Error && error.message.startsWith('Identifiants invalides')) {
      return sendError(res, error.message, 401);
    }
    return sendError(res, 'Erreur interne du serveur', 500);
  }
}