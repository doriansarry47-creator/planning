import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db, admins, patients } from '../_lib/db';
import { generateToken } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError, handleCors } from '../_lib/response';
import { eq } from 'drizzle-orm';

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

  try {
    // Trouver l'utilisateur admin dans la base PostgreSQL
    const adminResults = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    const admin = adminResults[0];
    
    if (!admin) {
      return sendError(res, 'Identifiants invalides. Vérifiez votre e-mail ou votre mot de passe.', 401);
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return sendError(res, 'Identifiants invalides. Vérifiez votre e-mail ou votre mot de passe.', 401);
    }

    // Générer le token
    const token = generateToken({
      userId: admin.id,
      email: admin.email,
      userType: 'admin',
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...adminWithoutPassword } = admin;

    return sendSuccess(res, {
      user: adminWithoutPassword,
      token,
    }, 'Connexion réussie');
  } catch (error) {
    console.error('Erreur lors de la connexion admin:', error);
    return sendError(res, 'Erreur interne du serveur', 500);
  }
}

async function loginPatient(req: VercelRequest, res: VercelResponse) {
  const validationResult = loginSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return sendError(res, 'Email et mot de passe requis', 400);
  }

  const { email, password } = validationResult.data;

  try {
    // Trouver le patient dans la base PostgreSQL
    const patientResults = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
    const patient = patientResults[0];
    
    if (!patient) {
      return sendError(res, 'Identifiants invalides. Vérifiez votre e-mail ou votre mot de passe.', 401);
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, patient.password);
    if (!isPasswordValid) {
      return sendError(res, 'Identifiants invalides. Vérifiez votre e-mail ou votre mot de passe.', 401);
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
  } catch (error) {
    console.error('Erreur lors de la connexion patient:', error);
    return sendError(res, 'Erreur interne du serveur', 500);
  }
}