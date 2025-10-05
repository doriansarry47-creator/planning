import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, users, patients, insertUserSchema, insertPatientSchema } from '../_lib/db';
import { hashPassword, generateToken } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError, handleCors } from '../_lib/response';

const registerAdminSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
});

const registerPatientSchema = insertPatientSchema.extend({
  confirmPassword: z.string(),
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
      return await registerAdmin(req, res);
    } else if (userType === 'patient') {
      return await registerPatient(req, res);
    } else {
      return sendError(res, 'Type d\'utilisateur invalide', 400);
    }
  } catch (error) {
    return handleApiError(res, error);
  }
}

async function registerAdmin(req: VercelRequest, res: VercelResponse) {
  const validationResult = registerAdminSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return sendError(res, 'Données invalides', 400);
  }

  const { password, confirmPassword, ...userData } = validationResult.data;

  if (password !== confirmPassword) {
    return sendError(res, 'Les mots de passe ne correspondent pas', 400);
  }

  // Vérifier si l'email existe déjà
  const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
  if (existingUser.length > 0) {
    return sendError(res, 'Cette adresse email est déjà utilisée', 409);
  }

  // Hasher le mot de passe et créer l'utilisateur
  const hashedPassword = await hashPassword(password);
  const [newUser] = await db.insert(users).values({
    ...userData,
    password: hashedPassword,
  }).returning();

  // Générer le token
  const token = generateToken({
    userId: newUser.id,
    email: newUser.email,
    userType: 'admin',
  });

  // Retourner l'utilisateur sans le mot de passe
  const { password: _, ...userWithoutPassword } = newUser;

  return sendSuccess(res, {
    user: userWithoutPassword,
    token,
  }, 'Compte administrateur créé avec succès', 201);
}

async function registerPatient(req: VercelRequest, res: VercelResponse) {
  const validationResult = registerPatientSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return sendError(res, 'Données invalides', 400);
  }

  const { password, confirmPassword, ...patientData } = validationResult.data;

  if (password !== confirmPassword) {
    return sendError(res, 'Les mots de passe ne correspondent pas', 400);
  }

  // Vérifier si l'email existe déjà
  const existingPatient = await db.select().from(patients).where(eq(patients.email, patientData.email)).limit(1);
  if (existingPatient.length > 0) {
    return sendError(res, 'Cette adresse email est déjà utilisée', 409);
  }

  // Hasher le mot de passe et créer le patient
  const hashedPassword = await hashPassword(password);
  const [newPatient] = await db.insert(patients).values({
    ...patientData,
    password: hashedPassword,
  }).returning();

  // Générer le token
  const token = generateToken({
    userId: newPatient.id,
    email: newPatient.email,
    userType: 'patient',
  });

  // Retourner le patient sans le mot de passe
  const { password: _, ...patientWithoutPassword } = newPatient;

  return sendSuccess(res, {
    user: patientWithoutPassword,
    token,
  }, 'Compte patient créé avec succès', 201);
}