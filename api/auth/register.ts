import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { mockDb } from '../_lib/mock-db';
import { generateToken } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError, handleCors } from '../_lib/response';

const registerAdminSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  username: z.string().min(2, "Le nom d'utilisateur est requis"),
  fullName: z.string().min(2, "Le nom complet est requis"),
  role: z.string().optional().default('admin'),
});

const registerPatientSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Le mot de passe doit contenir au moins une lettre minuscule, une majuscule et un chiffre"
  ),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phoneNumber: z.string().optional(),
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
    return sendError(res, 'Données invalides: ' + validationResult.error.issues[0].message, 400);
  }

  const { password, confirmPassword, ...userData } = validationResult.data;

  if (password !== confirmPassword) {
    return sendError(res, 'Les mots de passe ne correspondent pas', 400);
  }

  // Vérifier si l'email existe déjà
  const existingUser = await mockDb.findUserByEmail(userData.email);
  if (existingUser) {
    return sendError(res, 'Cette adresse email est déjà utilisée', 409);
  }

  // Hasher le mot de passe et créer l'utilisateur
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await mockDb.createUser({
    ...userData,
    password: hashedPassword,
  });

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
    return sendError(res, 'Données invalides: ' + validationResult.error.issues[0].message, 400);
  }

  const { password, confirmPassword, ...patientData } = validationResult.data;

  if (password !== confirmPassword) {
    return sendError(res, 'Les mots de passe ne correspondent pas', 400);
  }

  // Vérifier si l'email existe déjà
  const existingPatient = await mockDb.findPatientByEmail(patientData.email);
  if (existingPatient) {
    return sendError(res, 'Cette adresse email est déjà utilisée', 409);
  }

  // Hasher le mot de passe et créer le patient
  const hashedPassword = await bcrypt.hash(password, 10);
  const newPatient = await mockDb.createPatient({
    ...patientData,
    password: hashedPassword,
  });

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