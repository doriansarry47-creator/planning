import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db, admins, patients } from '../_lib/db';
import { generateToken } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError, handleCors } from '../_lib/response';
import { eq } from 'drizzle-orm';

const registerAdminSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  name: z.string().min(2, "Le nom est requis").optional().default("Dorian Sarry"),
});

const registerPatientSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  // Questionnaire thérapie sensorimotrice
  isReferredByProfessional: z.boolean(),
  referringProfessional: z.string().optional(),
  consultationReason: z.string().min(10, "Veuillez détailler votre motif de consultation"),
  symptomsStartDate: z.string().optional(),
  preferredSessionType: z.enum(["cabinet", "visio"], {
    required_error: "Veuillez choisir votre préférence de consultation"
  }),
  // Questions supplémentaires
  hasPhysicalSymptoms: z.boolean().optional(),
  physicalSymptomsDescription: z.string().optional(),
  hasEmotionalDifficulties: z.boolean().optional(),
  emotionalDifficultiesDescription: z.string().optional(),
  previousTherapyExperience: z.boolean().optional(),
  previousTherapyDetails: z.string().optional(),
  currentMedications: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  // Consentement
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

  try {
    // Vérifier si l'email existe déjà
    const existingAdmins = await db.select().from(admins).where(eq(admins.email, userData.email)).limit(1);
    if (existingAdmins.length > 0) {
      return sendError(res, 'Cette adresse email est déjà utilisée', 409);
    }

    // Hasher le mot de passe et créer l'utilisateur admin
    const hashedPassword = await bcrypt.hash(password, 12);
    const newAdmins = await db.insert(admins).values({
      name: userData.name || "Dorian Sarry",
      email: userData.email,
      password: hashedPassword,
    }).returning();

    const newAdmin = newAdmins[0];

    // Générer le token
    const token = generateToken({
      userId: newAdmin.id,
      email: newAdmin.email,
      userType: 'admin',
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...adminWithoutPassword } = newAdmin;

    return sendSuccess(res, {
      user: adminWithoutPassword,
      token,
    }, 'Compte administrateur créé avec succès', 201);
  } catch (error) {
    console.error('Erreur lors de la création du compte admin:', error);
    return sendError(res, 'Erreur interne du serveur', 500);
  }
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

  try {
    // Vérifier si l'email existe déjà
    const existingPatients = await db.select().from(patients).where(eq(patients.email, patientData.email)).limit(1);
    if (existingPatients.length > 0) {
      return sendError(res, 'Cette adresse email est déjà utilisée', 409);
    }

    // Hasher le mot de passe et créer le patient
    const hashedPassword = await bcrypt.hash(password, 12);
    const newPatients = await db.insert(patients).values({
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
  } catch (error) {
    console.error('Erreur lors de la création du compte patient:', error);
    return sendError(res, 'Erreur interne du serveur', 500);
  }
}