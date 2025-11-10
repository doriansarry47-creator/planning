import { z } from "zod";

// Schéma de base pour la création d'un créneau de disponibilité
export const createAvailabilitySlotSchema = z.object({
  practitionerId: z.number().int().positive(),
  startTime: z.string().datetime(), // Utiliser une chaîne de date/heure ISO pour la transmission
  endTime: z.string().datetime(),   // Utiliser une chaîne de date/heure ISO pour la transmission
  capacity: z.number().int().positive().default(1).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
});

// Schéma pour la mise à jour d'un créneau de disponibilité
export const updateAvailabilitySlotSchema = z.object({
  id: z.number().int().positive(),
  practitionerId: z.number().int().positive().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  capacity: z.number().int().positive().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Schéma pour la suppression ou la récupération par ID
export const slotIdSchema = z.number().int().positive();

// Schéma pour la récupération des créneaux d'un praticien
export const practitionerIdSchema = z.number().int().positive();

// Schéma pour la récupération des créneaux disponibles dans une plage de dates
export const getAvailableSlotsSchema = z.object({
  practitionerId: z.number().int().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// Schéma pour la création d'un praticien
export const createPractitionerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  specialization: z.string().min(1, "La spécialisation est requise"),
  email: z.string().email("Format d'email invalide"),
  phoneNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  biography: z.string().optional(),
  consultationDuration: z.number().int().positive().default(30),
});

// Schéma pour la création d'une exception d'horaire (congé)
export const createTimeOffSchema = z.object({
  practitionerId: z.number().int().positive(),
  startDate: z.string().date(), // Format 'YYYY-MM-DD'
  endDate: z.string().date(),   // Format 'YYYY-MM-DD'
  reason: z.string().optional(),
});
