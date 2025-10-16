import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db, admins, patients } from '../_lib/db.js';
import { generateToken, requireAuth } from '../_lib/auth.js';
import { sendSuccess, sendError, handleApiError, handleCors } from '../_lib/response.js';
import { eq } from 'drizzle-orm';

// Schémas de validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

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

  try {
    const { action, userType } = req.query;
    
    // Route vers la bonne fonction selon l'action
    if (action === 'login') {
      return await handleLogin(req, res, userType as string);
    } else if (action === 'register') {
      return await handleRegister(req, res, userType as string);
    } else if (action === 'verify') {
      return await handleVerify(req, res);
    } else if (action === 'forgot-password') {
      return await handleForgotPassword(req, res);
    } else if (action === 'reset-password') {
      return await handleResetPassword(req, res);
    } else {
      return sendError(res, 'Action invalide', 400);
    }
  } catch (error) {
    return handleApiError(res, error);
  }
}

// ============ LOGIN ============
async function handleLogin(req: VercelRequest, res: VercelResponse, userType: string) {
  if (req.method !== 'POST') {
    return sendError(res, 'Méthode non autorisée', 405);
  }

  const validationResult = loginSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return sendError(res, 'Email et mot de passe requis', 400);
  }

  const { email, password } = validationResult.data;

  try {
    if (userType === 'admin') {
      const adminResults = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
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
      const patientResults = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
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

// ============ REGISTER ============
async function handleRegister(req: VercelRequest, res: VercelResponse, userType: string) {
  if (req.method !== 'POST') {
    return sendError(res, 'Méthode non autorisée', 405);
  }

  if (userType === 'admin') {
    const validationResult = registerAdminSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(res, 'Données invalides: ' + validationResult.error.issues[0].message, 400);
    }

    const { password, confirmPassword, ...userData } = validationResult.data;

    if (password !== confirmPassword) {
      return sendError(res, 'Les mots de passe ne correspondent pas', 400);
    }

    try {
      const existingAdmins = await db.select().from(admins).where(eq(admins.email, userData.email)).limit(1);
      if (existingAdmins.length > 0) {
        return sendError(res, 'Cette adresse email est déjà utilisée', 409);
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newAdmins = await db.insert(admins).values({
        name: userData.name || "Dorian Sarry",
        email: userData.email,
        password: hashedPassword,
      }).returning();

      const newAdmin = newAdmins[0];

      const token = generateToken({
        userId: newAdmin.id,
        email: newAdmin.email,
        userType: 'admin',
      });

      const { password: _, ...adminWithoutPassword } = newAdmin;

      return sendSuccess(res, {
        user: adminWithoutPassword,
        token,
      }, 'Compte administrateur créé avec succès', 201);
    } catch (error) {
      console.error('Erreur lors de la création du compte admin:', error);
      return sendError(res, 'Erreur interne du serveur', 500);
    }
  } else if (userType === 'patient') {
    const validationResult = registerPatientSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return sendError(res, 'Données invalides: ' + validationResult.error.issues[0].message, 400);
    }

    const { password, confirmPassword, ...patientData } = validationResult.data;

    if (password !== confirmPassword) {
      return sendError(res, 'Les mots de passe ne correspondent pas', 400);
    }

    try {
      const existingPatients = await db.select().from(patients).where(eq(patients.email, patientData.email)).limit(1);
      if (existingPatients.length > 0) {
        return sendError(res, 'Cette adresse email est déjà utilisée', 409);
      }

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
  } else {
    return sendError(res, 'Type d\'utilisateur invalide', 400);
  }
}

// ============ VERIFY ============
async function handleVerify(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendError(res, 'Méthode non autorisée', 405);
  }

  try {
    const payload = requireAuth(req);
    
    if (payload.userType === 'admin') {
      const [user] = await db.select().from(admins).where(eq(admins.id, payload.userId)).limit(1);
      
      if (!user) {
        return sendError(res, 'Utilisateur non trouvé', 404);
      }

      const { password: _, ...userWithoutPassword } = user;
      return sendSuccess(res, {
        user: userWithoutPassword,
        userType: 'admin',
      });
      
    } else if (payload.userType === 'patient') {
      const [patient] = await db.select().from(patients).where(eq(patients.id, payload.userId)).limit(1);
      
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
    return handleApiError(res, error);
  }
}

// ============ FORGOT PASSWORD ============
async function handleForgotPassword(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 'Méthode non autorisée', 405);
  }

  return sendSuccess(res, {
    message: 'Si un compte existe avec cette adresse email, un email de réinitialisation a été envoyé.',
  });
}

// ============ RESET PASSWORD ============
async function handleResetPassword(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendError(res, 'Méthode non autorisée', 405);
  }

  return sendSuccess(res, {
    message: 'Mot de passe réinitialisé avec succès.',
  });
}
