import { Router } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db } from "../db";
import { timeSlots, insertTimeSlotSchema } from "../../shared/schema";
import { authMiddleware } from "../auth";

const router = Router();

// Obtenir tous les créneaux d'un praticien (public)
router.get("/practitioner/:practitionerId", async (req, res) => {
  try {
    const { practitionerId } = req.params;
    
    const slots = await db.select().from(timeSlots)
      .where(and(
        eq(timeSlots.practitionerId, practitionerId),
        eq(timeSlots.isActive, true)
      ))
      .orderBy(asc(timeSlots.dayOfWeek), asc(timeSlots.startTime));

    res.json(slots);
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Créer un nouveau créneau (admin seulement)
router.post("/", authMiddleware(['admin']), async (req, res) => {
  try {
    const validatedData = insertTimeSlotSchema.parse(req.body);
    
    const newTimeSlot = await db.insert(timeSlots).values(validatedData).returning();

    res.status(201).json({
      message: "Créneau créé avec succès",
      timeSlot: newTimeSlot[0],
    });
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      return res.status(400).json({ error: "Données invalides", details: (error as any).errors });
    }
    console.error("Erreur lors de la création du créneau:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Créer plusieurs créneaux pour un praticien (admin seulement)
router.post("/bulk", authMiddleware(['admin']), async (req, res) => {
  try {
    const { practitionerId, slots } = req.body;
    
    if (!practitionerId || !Array.isArray(slots)) {
      return res.status(400).json({ error: "practitionerId et slots (array) sont requis" });
    }

    const validatedSlots = slots.map(slot => 
      insertTimeSlotSchema.parse({ ...slot, practitionerId })
    );

    const newTimeSlots = await db.insert(timeSlots).values(validatedSlots).returning();

    res.status(201).json({
      message: `${newTimeSlots.length} créneaux créés avec succès`,
      timeSlots: newTimeSlots,
    });
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      return res.status(400).json({ error: "Données invalides", details: (error as any).errors });
    }
    console.error("Erreur lors de la création des créneaux en lot:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Mettre à jour un créneau (admin seulement)
router.put("/:id", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertTimeSlotSchema.partial().parse(req.body);
    
    const updatedTimeSlot = await db.update(timeSlots)
      .set(validatedData)
      .where(eq(timeSlots.id, id))
      .returning();

    if (updatedTimeSlot.length === 0) {
      return res.status(404).json({ error: "Créneau introuvable" });
    }

    res.json({
      message: "Créneau mis à jour avec succès",
      timeSlot: updatedTimeSlot[0],
    });
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      return res.status(400).json({ error: "Données invalides", details: (error as any).errors });
    }
    console.error("Erreur lors de la mise à jour du créneau:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Supprimer un créneau (désactivation) (admin seulement)
router.delete("/:id", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedTimeSlot = await db.update(timeSlots)
      .set({ isActive: false })
      .where(eq(timeSlots.id, id))
      .returning();

    if (updatedTimeSlot.length === 0) {
      return res.status(404).json({ error: "Créneau introuvable" });
    }

    res.json({ message: "Créneau désactivé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du créneau:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Obtenir tous les créneaux avec détails (admin seulement)
router.get("/admin/all", authMiddleware(['admin']), async (req, res) => {
  try {
    const allTimeSlots = await db.select().from(timeSlots)
      .orderBy(asc(timeSlots.practitionerId), asc(timeSlots.dayOfWeek), asc(timeSlots.startTime));

    res.json(allTimeSlots);
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux (admin):", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

export default router;