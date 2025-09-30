import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, patients, insertUserSchema, insertPatientSchema } from "../../shared/schema";
import { users as usersSqlite, patients as patientsSqlite, insertUserSchema as insertUserSchemaSqlite, insertPatientSchema as insertPatientSchemaSqlite } from "../../shared/schema-sqlite";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "../auth";
import { z } from "zod";
import crypto from "crypto";

const router = Router();

// Schémas de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// Inscription d'un patient
router.post("/register/patient", async (req, res) => {
  try {
    // Détecter le type de base de données
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:");
    const patientsTable = isSqlite ? patientsSqlite : patients;
    const schema = isSqlite ? insertPatientSchemaSqlite : insertPatientSchema;
    
    const validatedData = schema.parse(req.body);
    
    // Vérifier si l'email existe déjà
    const existingPatient = await db.select().from(patientsTable).where(eq(patientsTable.email, validatedData.email)).limit(1);
    if (existingPatient.length > 0) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(validatedData.password);

    // Créer le patient avec ID généré
    const patientData = {
      ...validatedData,
      password: hashedPassword,
    };
    
    // Pour SQLite, générer un ID manuellement
    if (isSqlite) {
      patientData.id = crypto.randomUUID();
    }

    const newPatient = await db.insert(patientsTable).values(patientData).returning();

    // Générer le token
    const token = generateToken({
      id: newPatient[0].id,
      email: newPatient[0].email,
      role: 'patient',
      type: 'patient',
    });

    res.status(201).json({
      message: "Compte patient créé avec succès",
      token,
      user: {
        id: newPatient[0].id,
        email: newPatient[0].email,
        firstName: newPatient[0].firstName,
        lastName: newPatient[0].lastName,
        type: 'patient',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    console.error("Erreur lors de l'inscription du patient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Connexion d'un patient
router.post("/login/patient", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Détecter le type de base de données
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:");
    const patientsTable = isSqlite ? patientsSqlite : patients;

    // Trouver le patient
    const patient = await db.select().from(patientsTable).where(eq(patientsTable.email, email)).limit(1);
    if (patient.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, patient[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier si le compte est actif
    if (!patient[0].isActive) {
      return res.status(401).json({ error: "Compte désactivé" });
    }

    // Générer le token
    const token = generateToken({
      id: patient[0].id,
      email: patient[0].email,
      role: 'patient',
      type: 'patient',
    });

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: patient[0].id,
        email: patient[0].email,
        firstName: patient[0].firstName,
        lastName: patient[0].lastName,
        type: 'patient',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    console.error("Erreur lors de la connexion du patient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Inscription d'un administrateur
router.post("/register/admin", async (req, res) => {
  try {
    // Détecter le type de base de données
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:");
    const usersTable = isSqlite ? usersSqlite : users;
    const schema = isSqlite ? insertUserSchemaSqlite : insertUserSchema;
    
    const validatedData = schema.parse(req.body);
    
    // Vérifier si l'email existe déjà
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, validatedData.email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(validatedData.password);

    // Créer l'utilisateur administrateur avec ID généré
    const userData = {
      ...validatedData,
      password: hashedPassword,
    };
    
    // Pour SQLite, générer un ID manuellement
    if (isSqlite) {
      userData.id = crypto.randomUUID();
    }

    const newUser = await db.insert(usersTable).values(userData).returning();

    // Générer le token
    const token = generateToken({
      id: newUser[0].id,
      email: newUser[0].email,
      role: newUser[0].role,
      type: 'admin',
    });

    res.status(201).json({
      message: "Compte administrateur créé avec succès",
      token,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        username: newUser[0].username,
        fullName: newUser[0].fullName,
        role: newUser[0].role,
        type: 'admin',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    console.error("Erreur lors de l'inscription de l'administrateur:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Connexion d'un administrateur
router.post("/login/admin", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Détecter le type de base de données
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:");
    const usersTable = isSqlite ? usersSqlite : users;

    // Trouver l'utilisateur
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (user.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier si le compte est actif
    if (!user[0].isActive) {
      return res.status(401).json({ error: "Compte désactivé" });
    }

    // Générer le token
    const token = generateToken({
      id: user[0].id,
      email: user[0].email,
      role: user[0].role,
      type: 'admin',
    });

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user[0].id,
        email: user[0].email,
        username: user[0].username,
        fullName: user[0].fullName,
        role: user[0].role,
        type: 'admin',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    console.error("Erreur lors de la connexion de l'administrateur:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Vérification du token
router.get("/verify", async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Token d'accès requis" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyToken(token);
    
    // Détecter le type de base de données
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:");
    const patientsTable = isSqlite ? patientsSqlite : patients;
    const usersTable = isSqlite ? usersSqlite : users;

    // Récupérer les informations utilisateur mises à jour
    if (decoded.type === 'patient') {
      const patient = await db.select().from(patientsTable).where(eq(patientsTable.id, decoded.id)).limit(1);
      if (patient.length === 0 || !patient[0].isActive) {
        return res.status(401).json({ error: "Compte introuvable ou désactivé" });
      }
      
      res.json({
        user: {
          id: patient[0].id,
          email: patient[0].email,
          firstName: patient[0].firstName,
          lastName: patient[0].lastName,
          type: 'patient',
        },
      });
    } else {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id)).limit(1);
      if (user.length === 0 || !user[0].isActive) {
        return res.status(401).json({ error: "Compte introuvable ou désactivé" });
      }
      
      res.json({
        user: {
          id: user[0].id,
          email: user[0].email,
          username: user[0].username,
          fullName: user[0].fullName,
          role: user[0].role,
          type: 'admin',
        },
      });
    }
  } catch (error) {
    return res.status(401).json({ error: "Token invalide" });
  }
});

export default router;