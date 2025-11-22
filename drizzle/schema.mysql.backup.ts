import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date, time, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  /** Password hash for local authentication (nullable for OAuth users) */
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "practitioner", "secretary"]).default("user").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  zipCode: varchar("zipCode", { length: 20 }),
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  language: varchar("language", { length: 10 }).default("en"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Table des praticiens
export const practitioners = mysqlTable("practitioners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  specialization: varchar("specialization", { length: 200 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  biography: text("biography"),
  consultationDuration: int("consultationDuration").default(30).notNull(), // en minutes
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Practitioner = typeof practitioners.$inferSelect;
export type InsertPractitioner = typeof practitioners.$inferInsert;

// Table des créneaux de disponibilité
export const availabilitySlots = mysqlTable("availabilitySlots", {
  id: int("id").autoincrement().primaryKey(),
  practitionerId: int("practitionerId").notNull().references(() => practitioners.id),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  capacity: int("capacity").default(1).notNull(),
  isBooked: boolean("isBooked").default(false).notNull(),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type InsertAvailabilitySlot = typeof availabilitySlots.$inferInsert;

// Table des rendez-vous (Enhanced avec fonctionnalités EasyAppointments)
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  practitionerId: int("practitionerId").notNull().references(() => practitioners.id),
  serviceId: int("serviceId").references(() => services.id),
  slotId: int("slotId").references(() => availabilitySlots.id),
  bookDatetime: timestamp("bookDatetime").defaultNow().notNull(), // Date de réservation
  startDatetime: timestamp("startDatetime").notNull(), // Date et heure de début
  endDatetime: timestamp("endDatetime").notNull(), // Date et heure de fin
  appointmentDate: date("appointmentDate").notNull(), // Date du rendez-vous (pour requêtes)
  startTime: time("startTime").notNull(),
  endTime: time("endTime").notNull(),
  location: varchar("location", { length: 255 }),
  color: varchar("color", { length: 20 }),
  status: mysqlEnum("status", ["scheduled", "confirmed", "completed", "cancelled", "no_show"]).default("scheduled").notNull(),
  hash: varchar("hash", { length: 255 }).unique(), // Hash unique pour l'annulation
  reason: text("reason"),
  notes: text("notes"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  followUpRequired: boolean("followUpRequired").default(false).notNull(),
  followUpDate: date("followUpDate"),
  isUnavailability: boolean("isUnavailability").default(false).notNull(), // Pour les périodes d'indisponibilité
  googleCalendarId: varchar("googleCalendarId", { length: 255 }),
  caldavCalendarId: varchar("caldavCalendarId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// Table des exceptions d'horaires (congés)
export const timeOff = mysqlTable("timeOff", {
  id: int("id").autoincrement().primaryKey(),
  practitionerId: int("practitionerId").notNull().references(() => practitioners.id),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimeOff = typeof timeOff.$inferSelect;
export type InsertTimeOff = typeof timeOff.$inferInsert;

// Table des logs d'activité admin
export const adminLogs = mysqlTable("adminLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }), // 'user', 'appointment', 'practitioner', etc.
  entityId: int("entityId"),
  details: text("details"), // JSON string with additional details
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

// Table des spécialités médicales
export const specialties = mysqlTable("specialties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = typeof specialties.$inferInsert;

// Table des catégories de services (inspiré d'EasyAppointments)
export const serviceCategories = mysqlTable("serviceCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = typeof serviceCategories.$inferInsert;

// Table des services (inspiré d'EasyAppointments)
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  duration: int("duration").default(30).notNull(), // en minutes
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("EUR"),
  location: varchar("location", { length: 255 }),
  color: varchar("color", { length: 20 }).default("#3788d8"),
  availabilitiesType: mysqlEnum("availabilitiesType", ["flexible", "fixed"]).default("flexible"),
  attendantsNumber: int("attendantsNumber").default(1).notNull(),
  isPrivate: boolean("isPrivate").default(false).notNull(),
  categoryId: int("categoryId").references(() => serviceCategories.id),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// Table de liaison services-practitioners
export const practitionerServices = mysqlTable("practitionerServices", {
  id: int("id").autoincrement().primaryKey(),
  practitionerId: int("practitionerId").notNull().references(() => practitioners.id),
  serviceId: int("serviceId").notNull().references(() => services.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PractitionerService = typeof practitionerServices.$inferSelect;
export type InsertPractitionerService = typeof practitionerServices.$inferInsert;

// Table des plages horaires de travail hebdomadaires
export const workingPlans = mysqlTable("workingPlans", {
  id: int("id").autoincrement().primaryKey(),
  practitionerId: int("practitionerId").notNull().references(() => practitioners.id),
  dayOfWeek: mysqlEnum("dayOfWeek", ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).notNull(),
  startTime: time("startTime").notNull(),
  endTime: time("endTime").notNull(),
  breakStartTime: time("breakStartTime"),
  breakEndTime: time("breakEndTime"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkingPlan = typeof workingPlans.$inferSelect;
export type InsertWorkingPlan = typeof workingPlans.$inferInsert;

// Table des périodes bloquées (inspiré d'EasyAppointments)
export const blockedPeriods = mysqlTable("blockedPeriods", {
  id: int("id").autoincrement().primaryKey(),
  practitionerId: int("practitionerId").references(() => practitioners.id),
  startDatetime: timestamp("startDatetime").notNull(),
  endDatetime: timestamp("endDatetime").notNull(),
  reason: text("reason"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlockedPeriod = typeof blockedPeriods.$inferSelect;
export type InsertBlockedPeriod = typeof blockedPeriods.$inferInsert;

// Table des paramètres globaux (settings)
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  value: text("value"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

// Table des webhooks (pour les notifications)
export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  actions: text("actions"), // JSON array des actions qui déclenchent le webhook
  secretToken: varchar("secretToken", { length: 512 }),
  isSslVerified: boolean("isSslVerified").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

// Table pour stocker les identifiants Google Calendar
export const googleCalendarSync = mysqlTable("googleCalendarSync", {
  id: int("id").autoincrement().primaryKey(),
  appointmentId: int("appointmentId").notNull().references(() => appointments.id),
  googleEventId: varchar("googleEventId", { length: 255 }).notNull(),
  googleCalendarId: varchar("googleCalendarId", { length: 255 }),
  syncStatus: mysqlEnum("syncStatus", ["synced", "pending", "failed"]).default("synced").notNull(),
  lastSyncAt: timestamp("lastSyncAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GoogleCalendarSync = typeof googleCalendarSync.$inferSelect;
export type InsertGoogleCalendarSync = typeof googleCalendarSync.$inferInsert;