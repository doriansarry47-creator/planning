import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db-sqlite.js";
import { users, patients, insertUserSchema, insertPatientSchema } from "../../shared/schema-sqlite.js";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "../auth.js";
import { z } from "zod";

const router = Router();

// Schémas de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// Inscription d'un patient
router.post("/register/patient", async (req, res) => {
  try {
    console.log("🔐 Tentative d'inscription patient:", req.body.email);
    const validatedData = insertPatientSchema.parse(req.body);
    
    // Vérifier si l'email existe déjà
    const existingPatient = await db.select().from(patients).where(eq(patients.email, validatedData.email)).limit(1);
    if (existingPatient.length > 0) {
      console.log("❌ Email déjà utilisé:", validatedData.email);
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(validatedData.password);

    // Créer le patient avec ID généré
    const patientData = {
      ...validatedData,
      password: hashedPassword,
    };

    const newPatient = await db.insert(patients).values(patientData).returning();
    console.log("✅ Patient créé avec succès:", newPatient[0].email);

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
      console.log("❌ Erreur de validation:", error.errors);
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    console.error("❌ Erreur lors de l'inscription du patient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Connexion d'un patient
router.post("/login/patient", async (req, res) => {
  try {
    console.log("🔐 Tentative de connexion patient:", req.body.email);
    const { email, password } = loginSchema.parse(req.body);

    // Trouver le patient
    const patient = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
    if (patient.length === 0) {
      console.log("❌ Patient non trouvé:", email);
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, patient[0].password);
    if (!isValidPassword) {
      console.log("❌ Mot de passe incorrect pour:", email);
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier si le compte est actif
    if (!patient[0].isActive) {
      console.log("❌ Compte désactivé:", email);
      return res.status(401).json({ error: "Compte désactivé" });
    }

    console.log("✅ Connexion patient réussie:", email);

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
      console.log("❌ Erreur de validation:", error.errors);
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    console.error("❌ Erreur lors de la connexion du patient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Inscription d'un administrateur
router.post("/register/admin", async (req, res) => {
  try {
    console.log("🔐 Tentative d'inscription admin:", req.body.email);
    const validatedData = insertUserSchema.parse(req.body);
    
    // Vérifier si l'email existe déjà
    const existingUser = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1);
    if (existingUser.length > 0) {
      console.log("❌ Email admin déjà utilisé:", validatedData.email);
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(validatedData.password);

    // Créer l'utilisateur administrateur avec ID généré
    const userData = {
      ...validatedData,
      password: hashedPassword,
    };

    const newUser = await db.insert(users).values(userData).returning();
    console.log("✅ Admin créé avec succès:", newUser[0].email);

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
      console.log("❌ Erreur de validation admin:", error.errors);
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    console.error("❌ Erreur lors de l'inscription de l'administrateur:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Connexion d'un administrateur
router.post("/login/admin", async (req, res) => {
  try {
    console.log("🔐 Tentative de connexion admin:", req.body.email);
    const { email, password } = loginSchema.parse(req.body);

    // Trouver l'utilisateur
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user.length === 0) {
      console.log("❌ Admin non trouvé:", email);
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user[0].password);
    if (!isValidPassword) {
      console.log("❌ Mot de passe admin incorrect pour:", email);
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Vérifier si le compte est actif
    if (!user[0].isActive) {
      console.log("❌ Compte admin désactivé:", email);
      return res.status(401).json({ error: "Compte désactivé" });
    }

    console.log("✅ Connexion admin réussie:", email);

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
      console.log("❌ Erreur de validation admin:", error.errors);
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    console.error("❌ Erreur lors de la connexion de l'administrateur:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Vérification du token
router.get("/verify", async (req, res) => {
  try {
    console.log("🔐 Vérification de token");
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("❌ Token manquant ou format incorrect");
      return res.status(401).json({ error: "Token d'accès requis" });
    }

    const token = authHeader.substring(7);

    if (!token) {
      console.log("❌ Token vide");
      return res.status(401).json({ error: "Token manquant" });
    }

    const decoded = verifyToken(token);
    console.log("🔍 Token décodé pour:", decoded.email, "type:", decoded.type);
    
    // Récupérer les informations utilisateur mises à jour
    if (decoded.type === 'patient') {
      const patient = await db.select().from(patients).where(eq(patients.id, decoded.id)).limit(1);
      if (patient.length === 0 || !patient[0].isActive) {
        console.log("❌ Patient non trouvé ou désactivé:", decoded.id);
        return res.status(401).json({ error: "Compte introuvable ou désactivé" });
      }
      
      console.log("✅ Token patient valide:", patient[0].email);
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
      const user = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
      if (user.length === 0 || !user[0].isActive) {
        console.log("❌ Admin non trouvé ou désactivé:", decoded.id);
        return res.status(401).json({ error: "Compte introuvable ou désactivé" });
      }
      
      console.log("✅ Token admin valide:", user[0].email);
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
    console.error("❌ Erreur lors de la vérification du token:", error);
    return res.status(401).json({ 
      error: "Token invalide",
      timestamp: new Date().toISOString()
    });
  }
});

export default router;