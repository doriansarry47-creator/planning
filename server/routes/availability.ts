import { Router } from "express";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { availabilitySlots, practitioners, insertAvailabilitySlotSchema } from "../../shared/schema";
import { authMiddleware } from "../auth";
import { availabilityService } from "../services/availabilityService";

const router = Router();

/**
 * GET /api/availability/slots/:practitionerId/:date
 * Obtenir les créneaux disponibles pour un praticien à une date donnée
 */
router.get("/slots/:practitionerId/:date", async (req, res) => {
  try {
    const { practitionerId, date } = req.params;
    const { availableOnly = "true" } = req.query;

    // Valider le format de date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Format de date invalide. Utilisez YYYY-MM-DD" });
    }

    // Vérifier que le praticien existe
    const practitioner = await db.select()
      .from(practitioners)
      .where(and(eq(practitioners.id, practitionerId), eq(practitioners.isActive, true)))
      .limit(1);

    if (practitioner.length === 0) {
      return res.status(404).json({ error: "Praticien introuvable" });
    }

    const availableSlots = await availabilityService.getAvailableSlots({
      practitionerId,
      date,
      availableOnly: availableOnly === "true",
    });

    res.json({
      practitionerId,
      practitionerName: `Dr. ${practitioner[0].firstName} ${practitioner[0].lastName}`,
      date,
      slots: availableSlots,
      totalSlots: availableSlots.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux disponibles:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * GET /api/availability/slots/:practitionerId
 * Obtenir tous les créneaux d'un praticien avec filtres optionnels
 */
router.get("/slots/:practitionerId", async (req, res) => {
  try {
    const { practitionerId } = req.params;
    const { startDate, endDate, availableOnly = "false" } = req.query;

    const slots = await availabilityService.getAvailableSlots({
      practitionerId,
      startDate: startDate as string,
      endDate: endDate as string,
      availableOnly: availableOnly === "true",
    });

    res.json({
      practitionerId,
      slots,
      totalSlots: slots.length,
      filters: { startDate, endDate, availableOnly },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * POST /api/availability/slots
 * Créer un nouveau créneau de disponibilité (admin seulement)
 */
router.post("/slots", authMiddleware(['admin']), async (req, res) => {
  try {
    const validatedData = insertAvailabilitySlotSchema.parse(req.body);

    // Vérifier que le praticien existe
    const practitioner = await db.select()
      .from(practitioners)
      .where(eq(practitioners.id, validatedData.practitionerId))
      .limit(1);

    if (practitioner.length === 0) {
      return res.status(404).json({ error: "Praticien introuvable" });
    }

    const slot = await availabilityService.createSlot({
      practitionerId: validatedData.practitionerId,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      capacity: validatedData.capacity || 1,
      notes: validatedData.notes,
      recurringRule: validatedData.recurringRule,
    });

    res.status(201).json({
      message: "Créneau créé avec succès",
      slot,
    });
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      return res.status(400).json({ error: "Données invalides", details: (error as any).errors });
    }
    console.error("Erreur lors de la création du créneau:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * POST /api/availability/slots/recurring
 * Créer des créneaux récurrents (admin seulement)
 */
router.post("/slots/recurring", authMiddleware(['admin']), async (req, res) => {
  try {
    const {
      practitionerId,
      startDate,
      endDate,
      timeSlots, // [{ startTime: "09:00", endTime: "09:30", daysOfWeek: [1,2,3,4,5] }]
      capacity = 1,
      notes,
    } = req.body;

    // Validation basique
    if (!practitionerId || !startDate || !endDate || !timeSlots || !Array.isArray(timeSlots)) {
      return res.status(400).json({ error: "Données manquantes ou invalides" });
    }

    const createdSlots = await availabilityService.createRecurringSlots({
      practitionerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timeSlots,
      capacity,
      notes,
    });

    res.status(201).json({
      message: `${createdSlots.length} créneaux récurrents créés avec succès`,
      slots: createdSlots,
      totalCreated: createdSlots.length,
    });
  } catch (error) {
    console.error("Erreur lors de la création des créneaux récurrents:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * POST /api/availability/slots/generate
 * Générer automatiquement des créneaux basés sur les horaires de travail (admin seulement)
 */
router.post("/slots/generate", authMiddleware(['admin']), async (req, res) => {
  try {
    const {
      practitionerId,
      startDate,
      endDate,
      workingDays = [1, 2, 3, 4, 5], // Lundi à Vendredi par défaut
      workingHours = { start: "09:00", end: "17:00" },
      slotDuration = 30, // 30 minutes par défaut
      breakTimes = [{ start: "12:00", end: "13:00" }], // Pause déjeuner par défaut
      capacity = 1,
    } = req.body;

    if (!practitionerId || !startDate || !endDate) {
      return res.status(400).json({ error: "practitionerId, startDate et endDate sont requis" });
    }

    const createdSlots = await availabilityService.generateSlotsFromSchedule({
      practitionerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      workingDays,
      workingHours,
      slotDuration,
      breakTimes,
      capacity,
    });

    res.status(201).json({
      message: `${createdSlots.length} créneaux générés automatiquement`,
      slots: createdSlots,
      totalGenerated: createdSlots.length,
      parameters: {
        workingDays,
        workingHours,
        slotDuration,
        breakTimes,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération automatique des créneaux:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * PUT /api/availability/slots/:id
 * Mettre à jour un créneau (admin seulement)
 */
router.put("/slots/:id", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Retirer les champs non autorisés pour la mise à jour
    const { id: _, createdAt, ...allowedUpdates } = updates;

    const updatedSlot = await availabilityService.updateSlot(id, allowedUpdates);

    if (!updatedSlot) {
      return res.status(404).json({ error: "Créneau introuvable" });
    }

    res.json({
      message: "Créneau mis à jour avec succès",
      slot: updatedSlot,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du créneau:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * DELETE /api/availability/slots/:id
 * Supprimer un créneau (admin seulement)
 */
router.delete("/slots/:id", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { force = "false" } = req.query;
    
    const success = await availabilityService.deleteSlot(id, force === "true");

    if (!success) {
      return res.status(404).json({ error: "Créneau introuvable" });
    }

    res.json({
      message: force === "true"
        ? "Créneau supprimé définitivement"
        : "Créneau désactivé avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du créneau:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * GET /api/availability/practitioners/:id/slots
 * Obtenir tous les créneaux d'un praticien (admin)
 */
router.get("/practitioners/:id/slots", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const slots = await availabilityService.getPractitionerSlots(id);

    res.json({
      practitionerId: id,
      slots,
      totalSlots: slots.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux du praticien:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * POST /api/availability/test-connection
 * Tester la connexion Google Calendar (admin seulement)
 */
router.post("/test-connection", authMiddleware(['admin']), async (req, res) => {
  try {
    // Tester la connexion au service Google Calendar
    const { googleCalendarService } = await import("../services/googleCalendar");
    const testResult = await googleCalendarService.testConnection();

    if (testResult.success) {
      res.json({
        message: "Connexion Google Calendar réussie",
        status: "connected"
      });
    } else {
      res.status(500).json({
        message: "Échec de connexion Google Calendar",
        error: testResult.error,
        status: "disconnected"
      });
    }
  } catch (error) {
    console.error("Erreur lors du test de connexion Google Calendar:", error);
    res.status(500).json({
      message: "Erreur lors du test de connexion",
      error: error instanceof Error ? error.message : "Erreur inconnue",
      status: "error"
    });
  }
});

export default router;