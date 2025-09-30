import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Table des utilisateurs (administrateurs)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("admin"), // "admin" ou "practitioner"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des patients
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  medications: text("medications"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des praticiens
export const practitioners = pgTable("practitioners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  specialization: text("specialization").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"),
  licenseNumber: text("license_number"),
  biography: text("biography"),
  consultationDuration: integer("consultation_duration").notNull().default(30), // en minutes
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des créneaux horaires disponibles (récurrents par jour de semaine)
export const timeSlots = pgTable("time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  practitionerId: varchar("practitioner_id").notNull().references(() => practitioners.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Dimanche, 1 = Lundi, etc.
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des créneaux de disponibilité spécifiques (Doctolib-like)
export const availabilitySlots = pgTable("availability_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  practitionerId: varchar("practitioner_id").notNull().references(() => practitioners.id),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  recurringRule: text("recurring_rule"), // JSON ou RRULE format pour récurrence
  capacity: integer("capacity").notNull().default(1), // nombre de patients par créneau
  isBooked: boolean("is_booked").notNull().default(false),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des rendez-vous
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  practitionerId: varchar("practitioner_id").notNull().references(() => practitioners.id),
  slotId: varchar("slot_id").references(() => availabilitySlots.id), // référence au créneau réservé
  appointmentDate: date("appointment_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  status: text("status").notNull().default("scheduled"), // "scheduled", "completed", "cancelled", "no_show"
  reason: text("reason"),
  notes: text("notes"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  followUpRequired: boolean("follow_up_required").notNull().default(false),
  followUpDate: date("follow_up_date"),
  googleEventId: text("google_event_id"), // ID de l'événement Google Calendar
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Table des exceptions d'horaires (congés, fermetures exceptionnelles)
export const scheduleExceptions = pgTable("schedule_exceptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  practitionerId: varchar("practitioner_id").notNull().references(() => practitioners.id),
  exceptionDate: date("exception_date").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  isFullDay: boolean("is_full_day").notNull().default(false),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
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
