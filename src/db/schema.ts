import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, date, time } from "drizzle-orm/pg-core";
import { z } from "zod";

// Table des administrateurs avec rôles et permissions
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Admin"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"), // "super_admin", "admin", "moderator"
  permissions: text("permissions").array().notNull().default(sql`ARRAY['read', 'write', 'delete']::text[]`),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  loginAttempts: integer("login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des patients
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  // Questionnaire d'accueil spécifique
  isReferredByProfessional: boolean("is_referred_by_professional").notNull().default(false),
  referringProfessional: text("referring_professional"),
  consultationReason: text("consultation_reason").notNull(),
  symptomsStartDate: text("symptoms_start_date"),
  preferredSessionType: text("preferred_session_type").notNull(), // "cabinet" ou "visio"
  // Notes privées du thérapeute
  therapistNotes: text("therapist_notes"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des créneaux de disponibilité
export const availabilitySlots = pgTable("availability_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  duration: integer("duration").notNull().default(60), // durée en minutes
  isAvailable: boolean("is_available").notNull().default(true),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringPattern: text("recurring_pattern"), // ex: "weekly", "monthly"
  dayOfWeek: integer("day_of_week"), // pour créneaux récurrents
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des rendez-vous
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  slotId: varchar("slot_id").references(() => availabilitySlots.id),
  date: timestamp("date", { withTimezone: true }).notNull(),
  duration: integer("duration").notNull().default(60), // durée en minutes
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "cancelled", "completed"
  type: text("type").notNull(), // "cabinet" ou "visio"
  reason: text("reason").notNull(), // Motif de consultation
  isReferredByProfessional: boolean("is_referred_by_professional").notNull().default(false),
  referringProfessional: text("referring_professional"),
  symptomsStartDate: text("symptoms_start_date"),
  // Notes et suivi du thérapeute (privé)
  therapistNotes: text("therapist_notes"),
  sessionSummary: text("session_summary"), // Résumé de séance visible par le patient
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des notes de suivi thérapeutique
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  content: text("content").notNull(),
  isPrivate: boolean("is_private").notNull().default(true), // visible uniquement par le thérapeute
  sessionDate: date("session_date"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des indisponibilités (congés, fermetures)
export const unavailabilities = pgTable("unavailabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  isFullDay: boolean("is_full_day").notNull().default(true),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Schémas de validation Zod
export const insertAdminSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["super_admin", "admin", "moderator"]).optional().default("admin"),
  permissions: z.array(z.string()).optional().default(["read", "write"]),
  isActive: z.boolean().optional().default(true),
});

export const insertPatientSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  phone: z.string().optional(),
  isReferredByProfessional: z.boolean().optional(),
  referringProfessional: z.string().optional(),
  consultationReason: z.string().min(10, "Veuillez détailler votre motif de consultation"),
  symptomsStartDate: z.string().optional(),
  preferredSessionType: z.enum(["cabinet", "visio"]),
  therapistNotes: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const insertAppointmentSchema = z.object({
  patientId: z.string(),
  slotId: z.string().optional(),
  date: z.string(),
  duration: z.number().default(60),
  status: z.string().default("pending"),
  type: z.enum(["cabinet", "visio"]),
  reason: z.string().min(10, "Veuillez détailler votre motif de consultation"),
  isReferredByProfessional: z.boolean().optional(),
  referringProfessional: z.string().optional(),
  symptomsStartDate: z.string().optional(),
  therapistNotes: z.string().optional(),
  sessionSummary: z.string().optional(),
});

export const insertAvailabilitySlotSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number().default(60),
  isAvailable: z.boolean().default(true),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
  dayOfWeek: z.number().optional(),
  notes: z.string().optional(),
});

// Types TypeScript
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAvailabilitySlot = z.infer<typeof insertAvailabilitySlotSchema>;
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Unavailability = typeof unavailabilities.$inferSelect;

// Types pour les vues avec jointures
export type AppointmentWithPatient = Appointment & {
  patient?: Patient;
};

export type PatientWithNotes = Patient & {
  notes?: Note[];
  appointments?: Appointment[];
};
