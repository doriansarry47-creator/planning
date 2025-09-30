import { Router } from "express";
import { eq, and, asc, desc, gte, lte, between, sql } from "drizzle-orm";
import { db } from "../db";
import { appointments, patients, practitioners, insertAppointmentSchema } from "../../shared/schema";
import { appointments as appointmentsSqlite, patients as patientsSqlite, practitioners as practitionersSqlite, insertAppointmentSchema as insertAppointmentSchemaSqlite } from "../../shared/schema-sqlite";
import { authMiddleware } from "../auth";
import crypto from "crypto";

const router = Router();

// Obtenir les rendez-vous d'un patient
router.get("/patient", authMiddleware(['patient']), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const patientAppointments = await db.select({
      id: appointments.id,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status,
      reason: appointments.reason,
      notes: appointments.notes,
      diagnosis: appointments.diagnosis,
      treatment: appointments.treatment,
      followUpRequired: appointments.followUpRequired,
      followUpDate: appointments.followUpDate,
      createdAt: appointments.createdAt,
      practitioner: {
        id: practitioners.id,
        firstName: practitioners.firstName,
        lastName: practitioners.lastName,
        specialization: practitioners.specialization,
      }
    })
    .from(appointments)
    .innerJoin(practitioners, eq(appointments.practitionerId, practitioners.id))
    .where(eq(appointments.patientId, userId))
    .orderBy(desc(appointments.appointmentDate), desc(appointments.startTime));

    res.json(patientAppointments);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous du patient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Créer un nouveau rendez-vous (patient)
router.post("/", authMiddleware(['patient']), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const appointmentData = { ...req.body, patientId: userId };
    const validatedData = insertAppointmentSchema.parse(appointmentData);
    
    // Vérifier la disponibilité du créneau
    const existingAppointment = await db.select().from(appointments)
      .where(and(
        eq(appointments.practitionerId, validatedData.practitionerId),
        eq(appointments.appointmentDate, validatedData.appointmentDate),
        eq(appointments.startTime, validatedData.startTime),
        eq(appointments.status, "scheduled")
      )).limit(1);

    if (existingAppointment.length > 0) {
      return res.status(400).json({ error: "Ce créneau n'est pas disponible" });
    }

    const newAppointment = await db.insert(appointments).values(validatedData).returning();

    // Récupérer les détails complets du rendez-vous créé
    const appointmentDetails = await db.select({
      id: appointments.id,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status,
      reason: appointments.reason,
      createdAt: appointments.createdAt,
      practitioner: {
        id: practitioners.id,
        firstName: practitioners.firstName,
        lastName: practitioners.lastName,
        specialization: practitioners.specialization,
      }
    })
    .from(appointments)
    .innerJoin(practitioners, eq(appointments.practitionerId, practitioners.id))
    .where(eq(appointments.id, newAppointment[0].id))
    .limit(1);

    res.status(201).json({
      message: "Rendez-vous créé avec succès",
      appointment: appointmentDetails[0],
    });
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      return res.status(400).json({ error: "Données invalides", details: (error as any).errors });
    }
    console.error("Erreur lors de la création du rendez-vous:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Annuler un rendez-vous (patient)
router.put("/:id/cancel", authMiddleware(['patient']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const updatedAppointment = await db.update(appointments)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(and(
        eq(appointments.id, id),
        eq(appointments.patientId, userId),
        eq(appointments.status, "scheduled")
      ))
      .returning();

    if (updatedAppointment.length === 0) {
      return res.status(404).json({ error: "Rendez-vous introuvable ou déjà traité" });
    }

    res.json({ message: "Rendez-vous annulé avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'annulation du rendez-vous:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Obtenir tous les rendez-vous (admin)
router.get("/admin/all", authMiddleware(['admin']), async (req, res) => {
  try {
    const { status, date, practitionerId } = req.query;
    
    let whereConditions: any = [];
    
    if (status) {
      whereConditions.push(eq(appointments.status, status as string));
    }
    
    if (date) {
      whereConditions.push(eq(appointments.appointmentDate, date as string));
    }
    
    if (practitionerId) {
      whereConditions.push(eq(appointments.practitionerId, practitionerId as string));
    }

    const adminAppointments = await db.select({
      id: appointments.id,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status,
      reason: appointments.reason,
      notes: appointments.notes,
      diagnosis: appointments.diagnosis,
      treatment: appointments.treatment,
      followUpRequired: appointments.followUpRequired,
      followUpDate: appointments.followUpDate,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      patient: {
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        email: patients.email,
        phoneNumber: patients.phoneNumber,
      },
      practitioner: {
        id: practitioners.id,
        firstName: practitioners.firstName,
        lastName: practitioners.lastName,
        specialization: practitioners.specialization,
      }
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(practitioners, eq(appointments.practitionerId, practitioners.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(appointments.appointmentDate), desc(appointments.startTime));

    res.json(adminAppointments);
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous (admin):", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Mettre à jour un rendez-vous (admin)
router.put("/:id", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Retirer les champs non autorisés pour la mise à jour
    const { patientId, practitionerId, ...allowedUpdates } = updateData;
    
    const updatedAppointment = await db.update(appointments)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();

    if (updatedAppointment.length === 0) {
      return res.status(404).json({ error: "Rendez-vous introuvable" });
    }

    res.json({
      message: "Rendez-vous mis à jour avec succès",
      appointment: updatedAppointment[0],
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Obtenir les créneaux disponibles pour un praticien à une date donnée
router.get("/available-slots/:practitionerId/:date", async (req, res) => {
  try {
    const { practitionerId, date } = req.params;
    
    // Obtenir les créneaux du praticien pour le jour de la semaine
    const dayOfWeek = new Date(date).getDay();
    
    // Obtenir les rendez-vous existants pour cette date
    const existingAppointments = await db.select({
      startTime: appointments.startTime,
      endTime: appointments.endTime,
    }).from(appointments)
      .where(and(
        eq(appointments.practitionerId, practitionerId),
        eq(appointments.appointmentDate, date),
        eq(appointments.status, "scheduled")
      ));

    // Cette logique devrait être améliorée pour calculer les créneaux disponibles
    // basés sur les time_slots et les rendez-vous existants
    res.json({
      practitionerId,
      date,
      dayOfWeek,
      existingAppointments,
      // TODO: Implémenter la logique de calcul des créneaux disponibles
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des créneaux disponibles:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Statistiques des rendez-vous (admin)
router.get("/admin/stats", authMiddleware(['admin']), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [
      totalAppointments,
      todayAppointments,
      scheduledAppointments,
      completedAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(appointments),
      db.select({ count: sql`count(*)` }).from(appointments).where(eq(appointments.appointmentDate, today)),
      db.select({ count: sql`count(*)` }).from(appointments).where(eq(appointments.status, 'scheduled')),
      db.select({ count: sql`count(*)` }).from(appointments).where(eq(appointments.status, 'completed')),
      db.select({ count: sql`count(*)` }).from(appointments).where(eq(appointments.status, 'cancelled')),
    ]);

    res.json({
      total: Number(totalAppointments[0].count),
      today: Number(todayAppointments[0].count),
      scheduled: Number(scheduledAppointments[0].count),
      completed: Number(completedAppointments[0].count),
      cancelled: Number(cancelledAppointments[0].count),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

export default router;