import { Router } from "express";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { db } from "../db";
import { availabilitySlots, practitioners, appointments } from "../../shared/schema";
import { requireAuth } from "../auth";
import { z } from "zod";

const router = Router();

// Schema de validation pour les créneaux de disponibilité
const createAvailabilitySlotSchema = z.object({
  practitionerId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  capacity: z.number().min(1).default(1),
  notes: z.string().optional(),
});

const updateAvailabilitySlotSchema = createAvailabilitySlotSchema.partial();

// GET /api/availability/slots/:practitionerId - Récupérer les créneaux disponibles pour un praticien à une date donnée
router.get("/slots/:practitionerId", async (req, res) => {
  try {
    const { practitionerId } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: "Date requise" });
    }

    // Vérifier que le praticien existe
    const practitioner = await db.select()
      .from(practitioners)
      .where(and(eq(practitioners.id, practitionerId), eq(practitioners.isActive, true)))
      .limit(1);

    if (practitioner.length === 0) {
      return res.status(404).json({ error: "Praticien non trouvé" });
    }

    // Calculer la plage de dates pour le jour demandé
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Récupérer les créneaux de disponibilité pour cette date
    const slots = await db.select({
      id: availabilitySlots.id,
      startTime: availabilitySlots.startTime,
      endTime: availabilitySlots.endTime,
      capacity: availabilitySlots.capacity,
      isBooked: availabilitySlots.isBooked,
      notes: availabilitySlots.notes,
    })
    .from(availabilitySlots)
    .where(
      and(
        eq(availabilitySlots.practitionerId, practitionerId),
        eq(availabilitySlots.isActive, true),
        gte(availabilitySlots.startTime, startOfDay.toISOString()),
        lte(availabilitySlots.startTime, endOfDay.toISOString())
      )
    )
    .orderBy(availabilitySlots.startTime);

    // Pour chaque créneau, calculer le nombre de réservations existantes
    const slotsWithBookingCount = await Promise.all(
      slots.map(async (slot) => {
        const bookingCount = await db.select({ count: appointments.id })
          .from(appointments)
          .where(
            and(
              eq(appointments.slotId, slot.id),
              eq(appointments.status, "scheduled")
            )
          );

        const bookedCount = bookingCount.length;
        const isFullyBooked = bookedCount >= slot.capacity;

        return {
          ...slot,
          startTime: new Date(slot.startTime).toTimeString().slice(0, 5), // Format HH:MM
          endTime: new Date(slot.endTime).toTimeString().slice(0, 5), // Format HH:MM
          bookedCount,
          isBooked: isFullyBooked,
        };
      })
    );

    res.json(slotsWithBookingCount);
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/availability/practitioner/:practitionerId - Récupérer tous les créneaux d'un praticien (admin)
router.get("/practitioner/:practitionerId", requireAuth, async (req, res) => {
  try {
    const { practitionerId } = req.params;
    const { date } = req.query;

    // Vérifier que l'utilisateur est admin
    if (req.user?.type !== "admin") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    let whereCondition = and(
      eq(availabilitySlots.practitionerId, practitionerId),
      eq(availabilitySlots.isActive, true)
    );

    // Si une date est spécifiée, filtrer par cette date
    if (date && typeof date === 'string') {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereCondition = and(
        whereCondition,
        gte(availabilitySlots.startTime, startOfDay.toISOString()),
        lte(availabilitySlots.startTime, endOfDay.toISOString())
      );
    }

    const slots = await db.select()
      .from(availabilitySlots)
      .where(whereCondition)
      .orderBy(availabilitySlots.startTime);

    res.json(slots);
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/availability - Créer un nouveau créneau de disponibilité
router.post("/", requireAuth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user?.type !== "admin") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const validatedData = createAvailabilitySlotSchema.parse(req.body);

    // Vérifier que le praticien existe
    const practitioner = await db.select()
      .from(practitioners)
      .where(eq(practitioners.id, validatedData.practitionerId))
      .limit(1);

    if (practitioner.length === 0) {
      return res.status(404).json({ error: "Praticien non trouvé" });
    }

    // Valider les heures
    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);

    if (startTime >= endTime) {
      return res.status(400).json({ error: "L'heure de début doit être antérieure à l'heure de fin" });
    }

    // Vérifier les conflits avec des créneaux existants
    const conflicts = await db.select()
      .from(availabilitySlots)
      .where(
        and(
          eq(availabilitySlots.practitionerId, validatedData.practitionerId),
          eq(availabilitySlots.isActive, true),
          // Vérifier les chevauchements
          // Un créneau chevauche s'il commence avant la fin du nouveau et finit après le début du nouveau
          and(
            lte(availabilitySlots.startTime, validatedData.endTime),
            gte(availabilitySlots.endTime, validatedData.startTime)
          )
        )
      );

    if (conflicts.length > 0) {
      return res.status(400).json({ error: "Ce créneau chevauche avec un créneau existant" });
    }

    // Créer le créneau
    const [newSlot] = await db.insert(availabilitySlots)
      .values({
        practitionerId: validatedData.practitionerId,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        capacity: validatedData.capacity,
        notes: validatedData.notes,
      })
      .returning();

    res.status(201).json(newSlot);
  } catch (error) {
    console.error("Erreur lors de la création du créneau:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /api/availability/:id - Modifier un créneau de disponibilité
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'utilisateur est admin
    if (req.user?.type !== "admin") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const validatedData = updateAvailabilitySlotSchema.parse(req.body);

    // Vérifier que le créneau existe
    const existingSlot = await db.select()
      .from(availabilitySlots)
      .where(eq(availabilitySlots.id, id))
      .limit(1);

    if (existingSlot.length === 0) {
      return res.status(404).json({ error: "Créneau non trouvé" });
    }

    // Valider les heures si elles sont fournies
    if (validatedData.startTime && validatedData.endTime) {
      const startTime = new Date(validatedData.startTime);
      const endTime = new Date(validatedData.endTime);

      if (startTime >= endTime) {
        return res.status(400).json({ error: "L'heure de début doit être antérieure à l'heure de fin" });
      }
    }

    // Mettre à jour le créneau
    const [updatedSlot] = await db.update(availabilitySlots)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(availabilitySlots.id, id))
      .returning();

    res.json(updatedSlot);
  } catch (error) {
    console.error("Erreur lors de la modification du créneau:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Données invalides", details: error.errors });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /api/availability/:id - Supprimer un créneau de disponibilité
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'utilisateur est admin
    if (req.user?.type !== "admin") {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Vérifier que le créneau existe
    const existingSlot = await db.select()
      .from(availabilitySlots)
      .where(eq(availabilitySlots.id, id))
      .limit(1);

    if (existingSlot.length === 0) {
      return res.status(404).json({ error: "Créneau non trouvé" });
    }

    // Vérifier s'il y a des rendez-vous liés à ce créneau
    const linkedAppointments = await db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.slotId, id),
          eq(appointments.status, "scheduled")
        )
      );

    if (linkedAppointments.length > 0) {
      return res.status(400).json({ 
        error: "Impossible de supprimer ce créneau car il y a des rendez-vous programmés" 
      });
    }

    // Supprimer (désactiver) le créneau
    await db.update(availabilitySlots)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(availabilitySlots.id, id));

    res.json({ message: "Créneau supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du créneau:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export { router as availabilityRouter };