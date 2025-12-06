import { pgTable, serial, text, timestamp, varchar, boolean, integer, decimal, date, time, pgEnum } from "drizzle-orm/pg-core";

/**
 * PostgreSQL Schema for Planning App
 * Converted from MySQL schema to work with Neon PostgreSQL
 */

// Enums
export const roleEnum = pgEnum("role", ["user", "admin", "practitioner", "secretary"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["pending", "confirmed", "cancelled", "completed", "no_show"]);
export const dayOfWeekEnum = pgEnum("day_of_week", ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]);
export const settingKeyEnum = pgEnum("setting_key", ["company_name", "company_email", "company_phone", "company_address", "timezone", "date_format", "time_format", "currency", "booking_window_days", "cancellation_hours", "require_confirmation", "enable_google_calendar", "enable_notifications"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  zipCode: varchar("zipCode", { length: 20 }),
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  language: varchar("language", { length: 10 }).default("en"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Table des praticiens
export const practitioners = pgTable("practitioners", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  specialization: varchar("specialization", { length: 200 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  biography: text("biography"),
  consultationDuration: integer("consultationDuration").default(30).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Practitioner = typeof practitioners.$inferSelect;
export type InsertPractitioner = typeof practitioners.$inferInsert;

// Table des spécialités
export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = typeof specialties.$inferInsert;

// Table des catégories de services
export const serviceCategories = pgTable("serviceCategories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  displayOrder: integer("displayOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = typeof serviceCategories.$inferInsert;

// Table des services
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  categoryId: integer("categoryId").references(() => serviceCategories.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  duration: integer("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  color: varchar("color", { length: 7 }),
  isActive: boolean("isActive").default(true).notNull(),
  availableOnline: boolean("availableOnline").default(true).notNull(),
  requiresApproval: boolean("requiresApproval").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// Table de liaison praticiens-services
export const practitionerServices = pgTable("practitionerServices", {
  id: serial("id").primaryKey(),
  practitionerId: integer("practitionerId").notNull().references(() => practitioners.id),
  serviceId: integer("serviceId").notNull().references(() => services.id),
  customPrice: decimal("customPrice", { precision: 10, scale: 2 }),
  customDuration: integer("customDuration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PractitionerService = typeof practitionerServices.$inferSelect;
export type InsertPractitionerService = typeof practitionerServices.$inferInsert;

// Table des plans de travail
export const workingPlans = pgTable("workingPlans", {
  id: serial("id").primaryKey(),
  practitionerId: integer("practitionerId").notNull().references(() => practitioners.id),
  dayOfWeek: dayOfWeekEnum("dayOfWeek").notNull(),
  startTime: time("startTime").notNull(),
  endTime: time("endTime").notNull(),
  breakStartTime: time("breakStartTime"),
  breakEndTime: time("breakEndTime"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type WorkingPlan = typeof workingPlans.$inferSelect;
export type InsertWorkingPlan = typeof workingPlans.$inferInsert;

// Table des périodes bloquées
export const blockedPeriods = pgTable("blockedPeriods", {
  id: serial("id").primaryKey(),
  practitionerId: integer("practitionerId").notNull().references(() => practitioners.id),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  reason: text("reason"),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurrencePattern: text("recurrencePattern"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type BlockedPeriod = typeof blockedPeriods.$inferSelect;
export type InsertBlockedPeriod = typeof blockedPeriods.$inferInsert;

// Table des créneaux de disponibilité
export const availabilitySlots = pgTable("availabilitySlots", {
  id: serial("id").primaryKey(),
  practitionerId: integer("practitionerId").notNull().references(() => practitioners.id),
  dayOfWeek: integer("dayOfWeek").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(), // Actif/Inactif
  isRecurring: boolean("isRecurring").default(false).notNull(), // Créneau récurrent
  recurrenceEndDate: date("recurrenceEndDate"), // Date de fin de récurrence
  consultationType: varchar("consultationType", { length: 100 }), // Type de consultation
  capacity: integer("capacity").default(1).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type InsertAvailabilitySlot = typeof availabilitySlots.$inferInsert;

// Table des congés
export const timeOff = pgTable("timeOff", {
  id: serial("id").primaryKey(),
  practitionerId: integer("practitionerId").notNull().references(() => practitioners.id),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TimeOff = typeof timeOff.$inferSelect;
export type InsertTimeOff = typeof timeOff.$inferInsert;

// Table des rendez-vous
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  practitionerId: integer("practitionerId").notNull().references(() => practitioners.id),
  serviceId: integer("serviceId").notNull().references(() => services.id),
  userId: integer("userId").references(() => users.id),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  status: appointmentStatusEnum("status").default("pending").notNull(),
  customerName: varchar("customerName", { length: 200 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }),
  notes: text("notes"),
  internalNotes: text("internalNotes"), // Notes internes visibles uniquement par l'admin
  cancellationReason: text("cancellationReason"), // Motif d'annulation
  cancellationHash: varchar("cancellationHash", { length: 64 }),
  googleEventId: varchar("googleEventId", { length: 255 }),
  reminderSent: boolean("reminderSent").default(false).notNull(), // Rappel envoyé
  reminderSentAt: timestamp("reminderSentAt"), // Date d'envoi du rappel
  confirmationSent: boolean("confirmationSent").default(false).notNull(), // Confirmation envoyée
  confirmationSentAt: timestamp("confirmationSentAt"), // Date d'envoi de la confirmation
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// Table des logs admin
export const adminLogs = pgTable("adminLogs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: integer("entityId"),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

// Table des paramètres
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: settingKeyEnum("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

// Table des webhooks
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  url: text("url").notNull(),
  events: text("events").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  secret: varchar("secret", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

// Table de synchronisation Google Calendar
export const googleCalendarSync = pgTable("googleCalendarSync", {
  id: serial("id").primaryKey(),
  practitionerId: integer("practitionerId").notNull().unique().references(() => practitioners.id),
  calendarId: varchar("calendarId", { length: 255 }).notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken").notNull(),
  tokenExpiry: timestamp("tokenExpiry").notNull(),
  syncEnabled: boolean("syncEnabled").default(true).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GoogleCalendarSync = typeof googleCalendarSync.$inferSelect;
export type InsertGoogleCalendarSync = typeof googleCalendarSync.$inferInsert;

// Table des patients
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id), // Lien optionnel avec un compte utilisateur
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  dateOfBirth: date("dateOfBirth"),
  gender: varchar("gender", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  zipCode: varchar("zipCode", { length: 20 }),
  emergencyContactName: varchar("emergencyContactName", { length: 200 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 20 }),
  medicalHistory: text("medicalHistory"), // Résumé de l'historique médical
  allergies: text("allergies"), // Allergies connues
  medications: text("medications"), // Médicaments actuels
  internalNotes: text("internalNotes"), // Notes internes (non visibles par le patient)
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastVisit: timestamp("lastVisit"),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

// Table des notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointmentId").references(() => appointments.id),
  type: varchar("type", { length: 50 }).notNull(), // 'sms', 'email', 'both'
  channel: varchar("channel", { length: 50 }).notNull(), // 'confirmation', 'reminder_24h', 'reminder_48h', 'cancellation', 'modification'
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  recipientPhone: varchar("recipientPhone", { length: 20 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'sent', 'failed', 'delivered'
  sentAt: timestamp("sentAt"),
  deliveredAt: timestamp("deliveredAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
