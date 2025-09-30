import { Router } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db } from "../db";
import { practitioners, insertPractitionerSchema } from "../../shared/schema";
import { practitioners as practitionersSqlite, insertPractitionerSchema as insertPractitionerSchemaSqlite } from "../../shared/schema-sqlite";
import { authMiddleware } from "../auth";
import crypto from "crypto";

const router = Router();

// Obtenir tous les praticiens (public)
router.get("/", async (req, res) => {
  try {
    // Détecter le type de base de données
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:");
    const practitionersTable = isSqlite ? practitionersSqlite : practitioners;
    const activeValue = isSqlite ? 1 : true; // SQLite utilise 1/0, PostgreSQL true/false
    
    const allPractitioners = await db.select({
      id: practitionersTable.id,
      firstName: practitionersTable.firstName,
      lastName: practitionersTable.lastName,
      specialization: practitionersTable.specialization,
      biography: practitionersTable.biography,
      consultationDuration: practitionersTable.consultationDuration,
    }).from(practitionersTable)
      .where(eq(practitionersTable.isActive, activeValue))
      .orderBy(asc(practitionersTable.lastName));

    res.json(allPractitioners);
  } catch (error) {
    console.error("Erreur lors de la récupération des praticiens:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Obtenir un praticien par ID (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Détecter le type de base de données
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:");
    const practitionersTable = isSqlite ? practitionersSqlite : practitioners;
    const activeValue = isSqlite ? 1 : true;
    
    const practitioner = await db.select({
      id: practitionersTable.id,
      firstName: practitionersTable.firstName,
      lastName: practitionersTable.lastName,
      specialization: practitionersTable.specialization,
      biography: practitionersTable.biography,
      consultationDuration: practitionersTable.consultationDuration,
    }).from(practitionersTable)
      .where(and(eq(practitionersTable.id, id), eq(practitionersTable.isActive, activeValue)))
      .limit(1);

    if (practitioner.length === 0) {
      return res.status(404).json({ error: "Praticien introuvable" });
    }

    res.json(practitioner[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du praticien:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Créer un nouveau praticien (admin seulement)
router.post("/", authMiddleware(['admin']), async (req, res) => {
  try {
    // Détecter le type de base de données
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:");
    const practitionersTable = isSqlite ? practitionersSqlite : practitioners;
    const schema = isSqlite ? insertPractitionerSchemaSqlite : insertPractitionerSchema;
    
    const validatedData = schema.parse(req.body);
    
    // Vérifier si l'email existe déjà
    const existingPractitioner = await db.select().from(practitionersTable)
      .where(eq(practitionersTable.email, validatedData.email)).limit(1);
    
    if (existingPractitioner.length > 0) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // Pour SQLite, générer un ID manuellement
    const practitionerData = { ...validatedData };
    if (isSqlite) {
      practitionerData.id = crypto.randomUUID();
    }

    const newPractitioner = await db.insert(practitionersTable).values(practitionerData).returning();

    res.status(201).json({
      message: "Praticien créé avec succès",
      practitioner: newPractitioner[0],
    });
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      return res.status(400).json({ error: "Données invalides", details: (error as any).errors });
    }
    console.error("Erreur lors de la création du praticien:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Mettre à jour un praticien (admin seulement)
router.put("/:id", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Détecter le type de base de données
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:");
    const practitionersTable = isSqlite ? practitionersSqlite : practitioners;
    const schema = isSqlite ? insertPractitionerSchemaSqlite : insertPractitionerSchema;
    
    const validatedData = schema.partial().parse(req.body);
    
    // Pour SQLite, utiliser une string pour updatedAt
    const updateData = isSqlite 
      ? { ...validatedData, updatedAt: new Date().toISOString() }
      : { ...validatedData, updatedAt: new Date() };
    
    const updatedPractitioner = await db.update(practitionersTable)
      .set(updateData)
      .where(eq(practitionersTable.id, id))
      .returning();

    if (updatedPractitioner.length === 0) {
      return res.status(404).json({ error: "Praticien introuvable" });
    }

    res.json({
      message: "Praticien mis à jour avec succès",
      practitioner: updatedPractitioner[0],
    });
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      return res.status(400).json({ error: "Données invalides", details: (error as any).errors });
    }
    console.error("Erreur lors de la mise à jour du praticien:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Supprimer un praticien (désactivation) (admin seulement)
router.delete("/:id", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Détecter le type de base de données
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:");
    const practitionersTable = isSqlite ? practitionersSqlite : practitioners;
    
    // Pour SQLite, utiliser 0 pour false et string pour date
    const updateData = isSqlite 
      ? { isActive: 0, updatedAt: new Date().toISOString() }
      : { isActive: false, updatedAt: new Date() };
    
    const updatedPractitioner = await db.update(practitionersTable)
      .set(updateData)
      .where(eq(practitionersTable.id, id))
      .returning();

    if (updatedPractitioner.length === 0) {
      return res.status(404).json({ error: "Praticien introuvable" });
    }

    res.json({ message: "Praticien désactivé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du praticien:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Obtenir tous les praticiens avec détails complets (admin seulement)
router.get("/admin/all", authMiddleware(['admin']), async (req, res) => {
  try {
    // Détecter le type de base de données
    const isSqlite = process.env.DATABASE_URL?.startsWith("file:");
    const practitionersTable = isSqlite ? practitionersSqlite : practitioners;
    
    const allPractitioners = await db.select().from(practitionersTable)
      .orderBy(asc(practitionersTable.createdAt));

    res.json(allPractitioners);
  } catch (error) {
    console.error("Erreur lors de la récupération des praticiens (admin):", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

export default router;