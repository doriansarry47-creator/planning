import { Router } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db";
import * as schema from "../../shared/schema-sqlite";
import { authMiddleware } from "../auth";

const router = Router();

// Obtenir les rendez-vous d'un patient
router.get("/patient", authMiddleware(['patient']), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const patientAppointments = await db.select({
      id: schema.appointments.id,
      appointmentDate: schema.appointments.appointmentDate,
      startTime: schema.appointments.startTime,
      endTime: schema.appointments.endTime,
      status: schema.appointments.status,
      reason: schema.appointments.reason,
      notes: schema.appointments.notes,
      diagnosis: schema.appointments.diagnosis,
      treatment: schema.appointments.treatment,
      followUpRequired: schema.appointments.followUpRequired,
      followUpDate: schema.appointments.followUpDate,
      createdAt: schema.appointments.createdAt,
      practitioner: {
        id: schema.practitioners.id,
        firstName: schema.practitioners.firstName,
        lastName: schema.practitioners.lastName,
        specialization: schema.practitioners.specialization,
      }
    })
    .from(schema.appointments)
    .innerJoin(schema.practitioners, eq(schema.appointments.practitionerId, schema.practitioners.id))
    .where(eq(schema.appointments.patientId, userId))
    .orderBy(desc(schema.appointments.appointmentDate), desc(schema.appointments.startTime));

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
    const validatedData = schema.insertAppointmentSchema.parse(appointmentData);
    
    // Vérification classique par heure
    const existingAppointment = await db.select().from(schema.appointments)
      .where(and(
        eq(schema.appointments.practitionerId, validatedData.practitionerId),
        eq(schema.appointments.appointmentDate, validatedData.appointmentDate),
        eq(schema.appointments.startTime, validatedData.startTime),
        eq(schema.appointments.status, "scheduled")
      )).limit(1);

    if (existingAppointment.length > 0) {
      return res.status(409).json({ error: "Ce créneau n'est pas disponible" });
    }

    // Générer un ID unique
    const appointmentId = "apt-" + Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 9);
    
    // Créer le rendez-vous avec un ID explicite
    const appointmentToInsert = {
      id: appointmentId,
      ...validatedData,
    };

    await db.insert(schema.appointments).values(appointmentToInsert);
    
    // Récupérer les détails complets du rendez-vous créé
    const appointmentDetails = await db.select({
      id: schema.appointments.id,
      appointmentDate: schema.appointments.appointmentDate,
      startTime: schema.appointments.startTime,
      endTime: schema.appointments.endTime,
      status: schema.appointments.status,
      reason: schema.appointments.reason,
      notes: schema.appointments.notes,
      createdAt: schema.appointments.createdAt,
      practitioner: {
        id: schema.practitioners.id,
        firstName: schema.practitioners.firstName,
        lastName: schema.practitioners.lastName,
        specialization: schema.practitioners.specialization,
      }
    })
    .from(schema.appointments)
    .innerJoin(schema.practitioners, eq(schema.appointments.practitionerId, schema.practitioners.id))
    .where(eq(schema.appointments.id, appointmentId))
    .limit(1);

    const appointment = appointmentDetails[0];

    res.status(201).json({
      message: "Rendez-vous créé avec succès",
      appointment,
    });
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      return res.status(400).json({ error: "Données invalides", details: (error as any).errors });
    }
    console.error("Erreur lors de la création du rendez-vous:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Erreur interne du serveur" });
  }
});

// Annuler un rendez-vous (patient)
router.put("/:id/cancel", authMiddleware(['patient']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    // Récupérer les détails du rendez-vous avant annulation
    const appointmentToCancel = await db.select()
      .from(schema.appointments)
      .where(and(
        eq(schema.appointments.id, id),
        eq(schema.appointments.patientId, userId),
        eq(schema.appointments.status, "scheduled")
      ))
      .limit(1);

    if (appointmentToCancel.length === 0) {
      return res.status(404).json({ error: "Rendez-vous introuvable ou déjà traité" });
    }
    
    await db.update(schema.appointments)
      .set({ status: "cancelled" })
      .where(eq(schema.appointments.id, id));

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
      whereConditions.push(eq(schema.appointments.status, status as string));
    }
    
    if (date) {
      whereConditions.push(eq(schema.appointments.appointmentDate, date as string));
    }
    
    if (practitionerId) {
      whereConditions.push(eq(schema.appointments.practitionerId, practitionerId as string));
    }

    const adminAppointments = await db.select({
      id: schema.appointments.id,
      appointmentDate: schema.appointments.appointmentDate,
      startTime: schema.appointments.startTime,
      endTime: schema.appointments.endTime,
      status: schema.appointments.status,
      reason: schema.appointments.reason,
      notes: schema.appointments.notes,
      diagnosis: schema.appointments.diagnosis,
      treatment: schema.appointments.treatment,
      followUpRequired: schema.appointments.followUpRequired,
      followUpDate: schema.appointments.followUpDate,
      createdAt: schema.appointments.createdAt,
      updatedAt: schema.appointments.updatedAt,
      patient: {
        id: schema.patients.id,
        firstName: schema.patients.firstName,
        lastName: schema.patients.lastName,
        email: schema.patients.email,
        phoneNumber: schema.patients.phoneNumber,
      },
      practitioner: {
        id: schema.practitioners.id,
        firstName: schema.practitioners.firstName,
        lastName: schema.practitioners.lastName,
        specialization: schema.practitioners.specialization,
      }
    })
    .from(schema.appointments)
    .innerJoin(schema.patients, eq(schema.appointments.patientId, schema.patients.id))
    .innerJoin(schema.practitioners, eq(schema.appointments.practitionerId, schema.practitioners.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(schema.appointments.appointmentDate), desc(schema.appointments.startTime));

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
    
    await db.update(schema.appointments)
      .set(allowedUpdates)
      .where(eq(schema.appointments.id, id));

    // Récupérer le rendez-vous mis à jour
    const updatedAppointment = await db.select().from(schema.appointments).where(eq(schema.appointments.id, id)).limit(1);

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
      db.select({ count: sql`count(*)` }).from(schema.appointments),
      db.select({ count: sql`count(*)` }).from(schema.appointments).where(eq(schema.appointments.appointmentDate, today)),
      db.select({ count: sql`count(*)` }).from(schema.appointments).where(eq(schema.appointments.status, 'scheduled')),
      db.select({ count: sql`count(*)` }).from(schema.appointments).where(eq(schema.appointments.status, 'completed')),
      db.select({ count: sql`count(*)` }).from(schema.appointments).where(eq(schema.appointments.status, 'cancelled')),
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