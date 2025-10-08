import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Table des utilisateurs (administrateurs)
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("admin"), // "admin" ou "practitioner"
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Table des patients
export const patients = sqliteTable("patients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number"),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  medicalHistory: text("medical_history"),
  allergies: text("allergies"),
  medications: text("medications"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Table des praticiens
export const practitioners = sqliteTable("practitioners", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  specialization: text("specialization").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"),
  licenseNumber: text("license_number"),
  biography: text("biography"),
  consultationDuration: integer("consultation_duration").notNull().default(30), // en minutes
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Table des rendez-vous
export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  patientId: text("patient_id").notNull().references(() => patients.id),
  practitionerId: text("practitioner_id").notNull().references(() => practitioners.id),
  appointmentDate: text("appointment_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  status: text("status").notNull().default("scheduled"), // "scheduled", "completed", "cancelled", "no_show"
  reason: text("reason"),
  notes: text("notes"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  followUpRequired: integer("follow_up_required", { mode: "boolean" }).notNull().default(false),
  followUpDate: text("follow_up_date"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Table des créneaux horaires disponibles (récurrents par jour de semaine)
export const timeSlots = sqliteTable("time_slots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  practitionerId: text("practitioner_id").notNull().references(() => practitioners.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Dimanche, 1 = Lundi, etc.
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Table des créneaux de disponibilité spécifiques
export const availabilitySlots = sqliteTable("availability_slots", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  practitionerId: text("practitioner_id").notNull().references(() => practitioners.id),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  recurringRule: text("recurring_rule"), // JSON ou RRULE format pour récurrence
  capacity: integer("capacity").notNull().default(1), // nombre de patients par créneau
  isBooked: integer("is_booked", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Table des exceptions d'horaires (congés, fermetures exceptionnelles)
export const scheduleExceptions = sqliteTable("schedule_exceptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  practitionerId: text("practitioner_id").notNull().references(() => practitioners.id),
  exceptionDate: text("exception_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  isFullDay: integer("is_full_day", { mode: "boolean" }).notNull().default(false),
  reason: text("reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});