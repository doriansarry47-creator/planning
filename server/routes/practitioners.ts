import { Router } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db } from "../db";
import { practitioners, insertPractitionerSchema } from "../../shared/schema";
import { authMiddleware } from "../auth";

const router = Router();

// Obtenir tous les praticiens (public)
router.get("/", async (req, res) => {
  try {
    const allPractitioners = await db.select({
      id: practitioners.id,
      firstName: practitioners.firstName,
      lastName: practitioners.lastName,
      specialization: practitioners.specialization,
      biography: practitioners.biography,
      consultationDuration: practitioners.consultationDuration,
    }).from(practitioners)
      .where(eq(practitioners.isActive, true))
      .orderBy(asc(practitioners.lastName));

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
    
    const practitioner = await db.select({
      id: practitioners.id,
      firstName: practitioners.firstName,
      lastName: practitioners.lastName,
      specialization: practitioners.specialization,
      biography: practitioners.biography,
      consultationDuration: practitioners.consultationDuration,
    }).from(practitioners)
      .where(and(eq(practitioners.id, id), eq(practitioners.isActive, true)))
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
    const validatedData = insertPractitionerSchema.parse(req.body);
    
    // Vérifier si l'email existe déjà
    const existingPractitioner = await db.select().from(practitioners)
      .where(eq(practitioners.email, validatedData.email)).limit(1);
    
    if (existingPractitioner.length > 0) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    const newPractitioner = await db.insert(practitioners).values(validatedData).returning();

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
    const validatedData = insertPractitionerSchema.partial().parse(req.body);
    
    const updatedPractitioner = await db.update(practitioners)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(practitioners.id, id))
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
    
    const updatedPractitioner = await db.update(practitioners)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(practitioners.id, id))
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
    const allPractitioners = await db.select().from(practitioners)
      .orderBy(asc(practitioners.createdAt));

    res.json(allPractitioners);
  } catch (error) {
    console.error("Erreur lors de la récupération des praticiens (admin):", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

export default router;