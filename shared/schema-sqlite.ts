import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Table des utilisateurs (administrateurs)
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("admin"), // "admin" ou "practitioner"
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des patients
export const patients = sqliteTable("patients", {
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  dateOfBirth: text("date_of_birth"), // Format YYYY-MM-DD
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  medications: text("medications"),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des praticiens
export const practitioners = sqliteTable("practitioners", {
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  specialization: text("specialization").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"),
  licenseNumber: text("license_number"),
  biography: text("biography"),
  consultationDuration: integer("consultation_duration").notNull().default(30), // en minutes
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des créneaux horaires disponibles (récurrents par jour de semaine)
export const timeSlots = sqliteTable("time_slots", {
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
  practitionerId: text("practitioner_id").notNull().references(() => practitioners.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Dimanche, 1 = Lundi, etc.
  startTime: text("start_time").notNull(), // Format HH:MM
  endTime: text("end_time").notNull(), // Format HH:MM
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des créneaux de disponibilité spécifiques (Doctolib-like)
export const availabilitySlots = sqliteTable("availability_slots", {
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
  practitionerId: text("practitioner_id").notNull().references(() => practitioners.id),
  startTime: text("start_time").notNull(), // ISO format avec timezone
  endTime: text("end_time").notNull(), // ISO format avec timezone
  recurringRule: text("recurring_rule"), // JSON ou RRULE format pour récurrence
  capacity: integer("capacity").notNull().default(1), // nombre de patients par créneau
  isBooked: integer("is_booked", { mode: 'boolean' }).notNull().default(false),
  notes: text("notes"),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des rendez-vous
export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
  patientId: text("patient_id").notNull().references(() => patients.id),
  practitionerId: text("practitioner_id").notNull().references(() => practitioners.id),
  slotId: text("slot_id").references(() => availabilitySlots.id), // référence au créneau réservé
  appointmentDate: text("appointment_date").notNull(), // Format YYYY-MM-DD
  startTime: text("start_time").notNull(), // Format HH:MM
  endTime: text("end_time").notNull(), // Format HH:MM
  status: text("status").notNull().default("scheduled"), // "scheduled", "completed", "cancelled", "no_show"
  reason: text("reason"),
  notes: text("notes"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  followUpRequired: integer("follow_up_required", { mode: 'boolean' }).notNull().default(false),
  followUpDate: text("follow_up_date"), // Format YYYY-MM-DD
  googleEventId: text("google_event_id"), // ID de l'événement Google Calendar
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des exceptions d'horaires (congés, fermetures exceptionnelles)
export const scheduleExceptions = sqliteTable("schedule_exceptions", {
  id: text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`),
  practitionerId: text("practitioner_id").notNull().references(() => practitioners.id),
  exceptionDate: text("exception_date").notNull(), // Format YYYY-MM-DD
  startTime: text("start_time"), // Format HH:MM
  endTime: text("end_time"), // Format HH:MM
  isFullDay: integer("is_full_day", { mode: 'boolean' }).notNull().default(false),
  reason: text("reason"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Schémas de validation Zod
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  dateOfBirth: true,
  address: true,
  emergencyContact: true,
  emergencyPhone: true,
}).extend({
  email: z.string().email("Format d'email invalide").min(1, "L'email est requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Le mot de passe doit contenir au moins une lettre minuscule, une majuscule et un chiffre"
  ),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  phoneNumber: z.string().optional().refine(
    (phone) => !phone || /^(?:\+33|0)[1-9](?:[0-9]{8})$/.test(phone.replace(/\s/g, '')),
    "Format de téléphone invalide (format français attendu)"
  ),
});

export const insertPractitionerSchema = createInsertSchema(practitioners).pick({
  firstName: true,
  lastName: true,
  specialization: true,
  email: true,
  phoneNumber: true,
  licenseNumber: true,
  biography: true,
  consultationDuration: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  patientId: true,
  practitionerId: true,
  appointmentDate: true,
  startTime: true,
  endTime: true,
  reason: true,
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).pick({
  practitionerId: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
});

export const insertAvailabilitySlotSchema = createInsertSchema(availabilitySlots).pick({
  practitionerId: true,
  startTime: true,
  endTime: true,
  recurringRule: true,
  capacity: true,
  notes: true,
});

// Types TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPractitioner = z.infer<typeof insertPractitionerSchema>;
export type Practitioner = typeof practitioners.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertAvailabilitySlot = z.infer<typeof insertAvailabilitySlotSchema>;
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type ScheduleException = typeof scheduleExceptions.$inferSelect;