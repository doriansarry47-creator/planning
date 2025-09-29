import { Router } from "express";
import { eq, asc, desc, like, or } from "drizzle-orm";
import { db } from "../db";
import { patients } from "../../shared/schema";
import { authMiddleware } from "../auth";

const router = Router();

// Obtenir le profil du patient connecté
router.get("/profile", authMiddleware(['patient']), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const patient = await db.select({
      id: patients.id,
      email: patients.email,
      firstName: patients.firstName,
      lastName: patients.lastName,
      phoneNumber: patients.phoneNumber,
      dateOfBirth: patients.dateOfBirth,
      address: patients.address,
      emergencyContact: patients.emergencyContact,
      emergencyPhone: patients.emergencyPhone,
      medicalHistory: patients.medicalHistory,
      allergies: patients.allergies,
      medications: patients.medications,
      createdAt: patients.createdAt,
    }).from(patients)
      .where(eq(patients.id, userId))
      .limit(1);

    if (patient.length === 0) {
      return res.status(404).json({ error: "Profil patient introuvable" });
    }

    res.json(patient[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil patient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Mettre à jour le profil du patient connecté
router.put("/profile", authMiddleware(['patient']), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      address,
      emergencyContact,
      emergencyPhone,
      medicalHistory,
      allergies,
      medications,
    } = req.body;

    const updatedPatient = await db.update(patients)
      .set({
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        address,
        emergencyContact,
        emergencyPhone,
        medicalHistory,
        allergies,
        medications,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, userId))
      .returning({
        id: patients.id,
        email: patients.email,
        firstName: patients.firstName,
        lastName: patients.lastName,
        phoneNumber: patients.phoneNumber,
        dateOfBirth: patients.dateOfBirth,
        address: patients.address,
        emergencyContact: patients.emergencyContact,
        emergencyPhone: patients.emergencyPhone,
        medicalHistory: patients.medicalHistory,
        allergies: patients.allergies,
        medications: patients.medications,
      });

    if (updatedPatient.length === 0) {
      return res.status(404).json({ error: "Profil patient introuvable" });
    }

    res.json({
      message: "Profil mis à jour avec succès",
      patient: updatedPatient[0],
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil patient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Obtenir tous les patients (admin seulement)
router.get("/admin/all", authMiddleware(['admin']), async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = db.select({
      id: patients.id,
      email: patients.email,
      firstName: patients.firstName,
      lastName: patients.lastName,
      phoneNumber: patients.phoneNumber,
      dateOfBirth: patients.dateOfBirth,
      isActive: patients.isActive,
      createdAt: patients.createdAt,
    }).from(patients);

    // Recherche
    if (search && typeof search === 'string') {
      const searchTerm = `%${search}%`;
      query = query.where(or(
        like(patients.firstName, searchTerm),
        like(patients.lastName, searchTerm),
        like(patients.email, searchTerm)
      )) as any;
    }

    // Tri
    const sortColumn = patients[sortBy as keyof typeof patients] || patients.createdAt;
    const orderFn = sortOrder === 'asc' ? asc : desc;
    query = query.orderBy(orderFn(sortColumn)) as any;

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query.limit(Number(limit)).offset(offset) as any;

    const allPatients = await query;

    // Compter le total pour la pagination
    let countQuery = db.select({ count: patients.id }).from(patients);
    if (search && typeof search === 'string') {
      const searchTerm = `%${search}%`;
      countQuery = countQuery.where(or(
        like(patients.firstName, searchTerm),
        like(patients.lastName, searchTerm),
        like(patients.email, searchTerm)
      )) as any;
    }

    res.json({
      patients: allPatients,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        // total: totalCount[0].count,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des patients (admin):", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Obtenir un patient par ID (admin seulement)
router.get("/admin/:id", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await db.select().from(patients)
      .where(eq(patients.id, id))
      .limit(1);

    if (patient.length === 0) {
      return res.status(404).json({ error: "Patient introuvable" });
    }

    res.json(patient[0]);
  } catch (error) {
    console.error("Erreur lors de la récupération du patient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Mettre à jour un patient (admin seulement)
router.put("/admin/:id", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Retirer les champs non autorisés pour la mise à jour par l'admin
    const { password, ...allowedUpdates } = updateData;
    
    const updatedPatient = await db.update(patients)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();

    if (updatedPatient.length === 0) {
      return res.status(404).json({ error: "Patient introuvable" });
    }

    res.json({
      message: "Patient mis à jour avec succès",
      patient: updatedPatient[0],
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du patient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Désactiver un patient (admin seulement)
router.put("/admin/:id/deactivate", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedPatient = await db.update(patients)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();

    if (updatedPatient.length === 0) {
      return res.status(404).json({ error: "Patient introuvable" });
    }

    res.json({ message: "Patient désactivé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la désactivation du patient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Réactiver un patient (admin seulement)
router.put("/admin/:id/activate", authMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedPatient = await db.update(patients)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();

    if (updatedPatient.length === 0) {
      return res.status(404).json({ error: "Patient introuvable" });
    }

    res.json({ message: "Patient réactivé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la réactivation du patient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

export default router;