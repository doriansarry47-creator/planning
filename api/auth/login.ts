import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { mockDb } from '../_lib/mock-db';
import { generateToken } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError, handleCors } from '../_lib/response';

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

  // Trouver l'utilisateur admin
  const user = await mockDb.findUserByEmail(email);
  
  if (!user) {
    return sendError(res, 'Email ou mot de passe incorrect', 401);
  }

  // Vérifier le mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password);
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
  const patient = await mockDb.findPatientByEmail(email);
  
  if (!patient) {
    return sendError(res, 'Email ou mot de passe incorrect', 401);
  }

  // Vérifier le mot de passe
  const isPasswordValid = await bcrypt.compare(password, patient.password);
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