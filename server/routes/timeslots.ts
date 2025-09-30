import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { timeSlots, practitioners } from "../../shared/schema";
import { requireAuth } from "../auth";
import { z } from "zod";

const router = Router();

// Schema de validation pour les créneaux horaires récurrents
const createTimeSlotSchema = z.object({
  practitionerId: z.string(),
  dayOfWeek: z.number().min(0).max(6), // 0 = Dimanche, 6 = Samedi
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
});

const updateTimeSlotSchema = createTimeSlotSchema.partial();

// GET /api/timeslots/practitioner/:practitionerId - Récupérer les créneaux horaires d'un praticien
router.get("/practitioner/:practitionerId", requireAuth, async (req, res) => {
  try {
    const { practitionerId } = req.params;
    
    // Vérifier que l'utilisateur est admin
    if (req.user?.type !== "admin") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Vérifier que le praticien existe
    const practitioner = await db.select()
      .from(practitioners)
      .where(eq(practitioners.id, practitionerId))
      .limit(1);

    if (practitioner.length === 0) {
      return res.status(404).json({ error: "Praticien non trouvé" });
    }

    // Récupérer tous les créneaux horaires du praticien
    const slots = await db.select()
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.practitionerId, practitionerId),
          eq(timeSlots.isActive, true)
        )
      )
      .orderBy(timeSlots.dayOfWeek, timeSlots.startTime);

    res.json(slots);
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux horaires:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/timeslots - Récupérer tous les créneaux horaires (admin)
router.get("/", requireAuth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user?.type !== "admin") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const slots = await db.select({
      id: timeSlots.id,
      practitionerId: timeSlots.practitionerId,
      dayOfWeek: timeSlots.dayOfWeek,
      startTime: timeSlots.startTime,
      endTime: timeSlots.endTime,
      isActive: timeSlots.isActive,
      createdAt: timeSlots.createdAt,
      practitioner: {
        id: practitioners.id,
        firstName: practitioners.firstName,
        lastName: practitioners.lastName,
        specialization: practitioners.specialization,
      }
    })
    .from(timeSlots)
    .leftJoin(practitioners, eq(timeSlots.practitionerId, practitioners.id))
    .where(eq(timeSlots.isActive, true))
    .orderBy(timeSlots.dayOfWeek, timeSlots.startTime);

    res.json(slots);
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux horaires:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/timeslots - Créer un nouveau créneau horaire récurrent
router.post("/", requireAuth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user?.type !== "admin") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const validatedData = createTimeSlotSchema.parse(req.body);

    // Vérifier que le praticien existe
    const practitioner = await db.select()
      .from(practitioners)
      .where(eq(practitioners.id, validatedData.practitionerId))
      .limit(1);

    if (practitioner.length === 0) {
      return res.status(404).json({ error: "Praticien non trouvé" });
    }

    // Valider que l'heure de début est avant l'heure de fin
    const [startHour, startMin] = validatedData.startTime.split(':').map(Number);
    const [endHour, endMin] = validatedData.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return res.status(400).json({ error: "L'heure de début doit être antérieure à l'heure de fin" });
    }

    // Vérifier les conflits avec des créneaux existants pour le même jour et praticien
    const conflicts = await db.select()
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.practitionerId, validatedData.practitionerId),
          eq(timeSlots.dayOfWeek, validatedData.dayOfWeek),
          eq(timeSlots.isActive, true)
        )
      );

    // Vérifier les chevauchements d'horaires
    for (const conflict of conflicts) {
      const [conflictStartHour, conflictStartMin] = conflict.startTime.split(':').map(Number);
      const [conflictEndHour, conflictEndMin] = conflict.endTime.split(':').map(Number);
      
      const conflictStartMinutes = conflictStartHour * 60 + conflictStartMin;
      const conflictEndMinutes = conflictEndHour * 60 + conflictEndMin;

      // Vérifier le chevauchement
      if (
        (startMinutes < conflictEndMinutes && endMinutes > conflictStartMinutes)
      ) {
        return res.status(400).json({ 
          error: "Ce créneau chevauche avec un créneau existant" 
        });
      }
    }

    // Créer le créneau horaire
    const [newTimeSlot] = await db.insert(timeSlots)
      .values({
        practitionerId: validatedData.practitionerId,
        dayOfWeek: validatedData.dayOfWeek,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
      })
      .returning();

    res.status(201).json(newTimeSlot);
  } catch (error) {
    console.error("Erreur lors de la création du créneau horaire:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/timeslots/:id - Modifier un créneau horaire
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'utilisateur est admin
    if (req.user?.type !== "admin") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const validatedData = updateTimeSlotSchema.parse(req.body);

    // Vérifier que le créneau existe
    const existingSlot = await db.select()
      .from(timeSlots)
      .where(eq(timeSlots.id, id))
      .limit(1);

    if (existingSlot.length === 0) {
      return res.status(404).json({ error: "Créneau horaire non trouvé" });
    }

    // Valider les heures si elles sont fournies
    if (validatedData.startTime && validatedData.endTime) {
      const [startHour, startMin] = validatedData.startTime.split(':').map(Number);
      const [endHour, endMin] = validatedData.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        return res.status(400).json({ error: "L'heure de début doit être antérieure à l'heure de fin" });
      }
    }

    // Mettre à jour le créneau
    const [updatedSlot] = await db.update(timeSlots)
      .set(validatedData)
      .where(eq(timeSlots.id, id))
      .returning();

    res.json(updatedSlot);
  } catch (error) {
    console.error("Erreur lors de la modification du créneau horaire:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /api/timeslots/:id - Supprimer un créneau horaire
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'utilisateur est admin
    if (req.user?.type !== "admin") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Vérifier que le créneau existe
    const existingSlot = await db.select()
      .from(timeSlots)
      .where(eq(timeSlots.id, id))
      .limit(1);

    if (existingSlot.length === 0) {
      return res.status(404).json({ error: "Créneau horaire non trouvé" });
    }

    // Désactiver le créneau au lieu de le supprimer complètement
    await db.update(timeSlots)
      .set({
        isActive: false,
      })
      .where(eq(timeSlots.id, id));

    res.json({ message: "Créneau horaire supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du créneau horaire:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/timeslots/:id - Récupérer un créneau horaire spécifique
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'utilisateur est admin
    if (req.user?.type !== "admin") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const slot = await db.select({
      id: timeSlots.id,
      practitionerId: timeSlots.practitionerId,
      dayOfWeek: timeSlots.dayOfWeek,
      startTime: timeSlots.startTime,
      endTime: timeSlots.endTime,
      isActive: timeSlots.isActive,
      createdAt: timeSlots.createdAt,
      practitioner: {
        id: practitioners.id,
        firstName: practitioners.firstName,
        lastName: practitioners.lastName,
        specialization: practitioners.specialization,
      }
    })
    .from(timeSlots)
    .leftJoin(practitioners, eq(timeSlots.practitionerId, practitioners.id))
    .where(eq(timeSlots.id, id))
    .limit(1);

    if (slot.length === 0) {
      return res.status(404).json({ error: "Créneau horaire non trouvé" });
    }

    res.json(slot[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du créneau horaire:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export { router as timeSlotsRouter };