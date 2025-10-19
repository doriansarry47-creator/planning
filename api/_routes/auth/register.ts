import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../../../shared/schema.js';

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

const registerPatientSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  isReferredByProfessional: z.boolean(),
  referringProfessional: z.string().optional(),
  consultationReason: z.string().min(10, "Veuillez détailler votre motif de consultation"),
  symptomsStartDate: z.string().optional(),
  preferredSessionType: z.enum(["cabinet", "visio"], {
    required_error: "Veuillez choisir votre préférence de consultation"
  }),
  hasPhysicalSymptoms: z.boolean().optional(),
  physicalSymptomsDescription: z.string().optional(),
  hasEmotionalDifficulties: z.boolean().optional(),
  emotionalDifficultiesDescription: z.string().optional(),
  previousTherapyExperience: z.boolean().optional(),
  previousTherapyDetails: z.string().optional(),
  currentMedications: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  consentToTreatment: z.boolean().refine(val => val === true, "Vous devez accepter le consentement au traitement"),
  consentToDataProcessing: z.boolean().refine(val => val === true, "Vous devez accepter le traitement des données"),
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
    
    if (userType !== 'patient') {
      return sendError(res, 'Seules les inscriptions patient sont autorisées', 400);
    }

    const validationResult = registerPatientSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(res, 'Données invalides: ' + validationResult.error.issues[0].message, 400);
    }

    const { password, confirmPassword, ...patientData } = validationResult.data;

    if (password !== confirmPassword) {
      return sendError(res, 'Les mots de passe ne correspondent pas', 400);
    }

    const db = getDB();

    const existingPatients = await db.select().from(schema.patients).where(eq(schema.patients.email, patientData.email)).limit(1);
    if (existingPatients.length > 0) {
      return sendError(res, 'Cette adresse email est déjà utilisée', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newPatients = await db.insert(schema.patients).values({
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      email: patientData.email,
      password: hashedPassword,
      phone: patientData.phone || null,
      isReferredByProfessional: patientData.isReferredByProfessional || false,
      referringProfessional: patientData.referringProfessional || null,
      consultationReason: patientData.consultationReason,
      symptomsStartDate: patientData.symptomsStartDate || null,
      preferredSessionType: patientData.preferredSessionType,
    }).returning();

    const newPatient = newPatients[0];

    const token = generateToken({
      userId: newPatient.id,
      email: newPatient.email,
      userType: 'patient',
    });

    const { password: _, ...patientWithoutPassword } = newPatient;

    return sendSuccess(res, {
      user: patientWithoutPassword,
      token,
    }, 'Compte patient créé avec succès', 201);
  } catch (error) {
    console.error('Erreur lors de la création du compte patient:', error);
    return sendError(res, 'Erreur interne du serveur', 500);
  }
}