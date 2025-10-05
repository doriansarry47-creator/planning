import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, users, patients } from '../_lib/db';
import { comparePassword, generateToken } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError, handleCors } from '../_lib/response';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return handleCors(res);
  }

  if (req.method !== 'POST') {
    return sendError(res, 'Méthode non autorisée', 405);
  }

  try {
    const { userType } = req.query;
    
    if (userType === 'admin') {
      return await loginAdmin(req, res);
    } else if (userType === 'patient') {
      return await loginPatient(req, res);
    } else {
      return sendError(res, 'Type d\'utilisateur invalide', 400);
    }
  } catch (error) {
    return handleApiError(res, error);
  }
}

async function loginAdmin(req: VercelRequest, res: VercelResponse) {
  const validationResult = loginSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return sendError(res, 'Email et mot de passe requis', 400);
  }

  const { email, password } = validationResult.data;

  // Trouver l'utilisateur
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user) {
    return sendError(res, 'Email ou mot de passe incorrect', 401);
  }

  if (!user.isActive) {
    return sendError(res, 'Compte désactivé', 401);
  }

  // Vérifier le mot de passe
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return sendError(res, 'Email ou mot de passe incorrect', 401);
  }

  // Générer le token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    userType: 'admin',
  });

  // Retourner l'utilisateur sans le mot de passe
  const { password: _, ...userWithoutPassword } = user;

  return sendSuccess(res, {
    user: userWithoutPassword,
    token,
  }, 'Connexion réussie');
}

async function loginPatient(req: VercelRequest, res: VercelResponse) {
  const validationResult = loginSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return sendError(res, 'Email et mot de passe requis', 400);
  }

  const { email, password } = validationResult.data;

  // Trouver le patient
  const [patient] = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
  
  if (!patient) {
    return sendError(res, 'Email ou mot de passe incorrect', 401);
  }

  if (!patient.isActive) {
    return sendError(res, 'Compte désactivé', 401);
  }

  // Vérifier le mot de passe
  const isPasswordValid = await comparePassword(password, patient.password);
  if (!isPasswordValid) {
    return sendError(res, 'Email ou mot de passe incorrect', 401);
  }

  // Générer le token
  const token = generateToken({
    userId: patient.id,
    email: patient.email,
    userType: 'patient',
  });

  // Retourner le patient sans le mot de passe
  const { password: _, ...patientWithoutPassword } = patient;

  return sendSuccess(res, {
    user: patientWithoutPassword,
    token,
  }, 'Connexion réussie');
}