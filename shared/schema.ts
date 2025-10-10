import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Table des administrateurs (Dorian Sarry)
export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Dorian Sarry"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des patients pour thérapie sensorimotrice
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  // Questionnaire d'accueil spécifique
  isReferredByProfessional: boolean("is_referred_by_professional").notNull().default(false),
  referringProfessional: text("referring_professional"), // Si référé par un professionnel
  consultationReason: text("consultation_reason").notNull(),
  symptomsStartDate: text("symptoms_start_date"), // Depuis quand ressent le besoin
  preferredSessionType: text("preferred_session_type").notNull(), // "cabinet" ou "visio"
  // Notes privées du thérapeute
  therapistNotes: text("therapist_notes"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des créneaux de disponibilité pour Dorian Sarry
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

// Table des rendez-vous pour thérapie sensorimotrice
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
// Schémas de validation Zod
// export const insertAdminSchema = createInsertSchema(admins).pick({
//   email: true,
//   password: true,
//   name: true,
// });

// export const insertPatientSchema = createInsertSchema(patients).pick({
//   firstName: true,
//   lastName: true,
//   email: true,
//   password: true,
//   phone: true,
//   isReferredByProfessional: true,
//   referringProfessional: true,
//   consultationReason: true,
//   symptomsStartDate: true,
//   preferredSessionType: true,
// }).extend({
//   email: z.string().email("Format d'email invalide").min(1, "L'email est requis"),
//   password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
//   firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
//   lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
//   phone: z.string().optional(),
//   consultationReason: z.string().min(10, "Veuillez détailler votre motif de consultation"),
//   preferredSessionType: z.enum(["cabinet", "visio"], {
//     required_error: "Veuillez choisir votre préférence de consultation"
//   }),
//   symptomsStartDate: z.string().optional(),
//   referringProfessional: z.string().optional(),
// });

// export const insertAvailabilitySlotSchema = createInsertSchema(availabilitySlots).pick({
//   date: true,
//   startTime: true,
//   endTime: true,
//   duration: true,
//   isRecurring: true,
//   recurringPattern: true,
//   dayOfWeek: true,
//   notes: true,
// });

// export const insertAppointmentSchema = createInsertSchema(appointments).pick({
//   patientId: true,
//   slotId: true,
//   date: true,
//   duration: true,
//   type: true,
//   reason: true,
//   isReferredByProfessional: true,
//   referringProfessional: true,
//   symptomsStartDate: true,
// }).extend({
//   reason: z.string().min(10, "Veuillez détailler votre motif de consultation"),
//   type: z.enum(["cabinet", "visio"]),
// });

// export const insertNoteSchema = createInsertSchema(notes).pick({
//   patientId: true,
//   content: true,
//   isPrivate: true,
//   sessionDate: true,
// });

// export const insertUnavailabilitySchema = createInsertSchema(unavailabilities).pick({
//   startDate: true,
//   endDate: true,
//   startTime: true,
//   endTime: true,
//   isFullDay: true,
//   reason: true,
// });

export const insertAdminSchema = createInsertSchema(admins);
export const insertPatientSchema = createInsertSchema(patients);
export const insertAvailabilitySlotSchema = createInsertSchema(availabilitySlots);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const insertNoteSchema = createInsertSchema(notes);
export const insertUnavailabilitySchema = createInsertSchema(unavailabilities);

// Types TypeScript
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAvailabilitySlot = z.infer<typeof insertAvailabilitySlotSchema>;
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertUnavailability = z.infer<typeof insertUnavailabilitySchema>;
export type Unavailability = typeof unavailabilities.$inferSelect;

// Types pour les vues avec jointures
export type AppointmentWithPatient = Appointment & {
  patient?: Patient;
};

export type PatientWithNotes = Patient & {
  notes?: Note[];
  appointments?: Appointment[];
};
