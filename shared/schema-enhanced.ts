import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, date, time, decimal, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod";

// ========================================
// TABLES EXISTANTES (maintenues)
// ========================================

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("Dorian Sarry"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  // Questionnaire d'accueil
  isReferredByProfessional: boolean("is_referred_by_professional").notNull().default(false),
  referringProfessional: text("referring_professional"),
  consultationReason: text("consultation_reason").notNull(),
  symptomsStartDate: text("symptoms_start_date"),
  preferredSessionType: text("preferred_session_type").notNull(),
  // Notes privées thérapeute
  therapistNotes: text("therapist_notes"),
  
  // 🆕 AMÉLIORATIONS
  photoUrl: text("photo_url"), // Photo de profil patient
  language: text("language").default("fr"), // Langue préférée (fr, en, es, de, ar)
  notificationPreferences: jsonb("notification_preferences").default({
    email: true,
    sms: true,
    push: true,
    reminderTiming: [7, 2, 1] // jours avant RDV
  }), // Préférences de notifications
  loyaltyPoints: integer("loyalty_points").default(0), // 🎁 Programme fidélité
  
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  slotId: varchar("slot_id").references(() => availabilitySlots.id),
  date: timestamp("date", { withTimezone: true }).notNull(),
  duration: integer("duration").notNull().default(60),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed, no_show
  type: text("type").notNull(), // cabinet, visio, atelier
  reason: text("reason").notNull(),
  isReferredByProfessional: boolean("is_referred_by_professional").notNull().default(false),
  referringProfessional: text("referring_professional"),
  symptomsStartDate: text("symptoms_start_date"),
  therapistNotes: text("therapist_notes"),
  sessionSummary: text("session_summary"),
  
  // 🆕 AMÉLIORATIONS
  isRecurring: boolean("is_recurring").default(false), // 🔁 RDV récurrent
  recurringPattern: text("recurring_pattern"), // weekly, biweekly, monthly
  recurringEndDate: date("recurring_end_date"),
  parentAppointmentId: varchar("parent_appointment_id"), // Référence à la série de RDV
  
  reminderSent: jsonb("reminder_sent").default({
    days7: false,
    days2: false,
    day1: false,
    hours2: false
  }), // 🔔 Suivi des rappels envoyés
  
  confirmed: boolean("confirmed").default(false), // ✅ Patient a confirmé sa présence
  confirmedAt: timestamp("confirmed_at"),
  
  // 💳 Paiement
  paymentStatus: text("payment_status").default("pending"), // pending, paid, refunded, cancelled
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  paymentMethod: text("payment_method"), // stripe, paypal, cash
  paymentIntentId: text("payment_intent_id"), // ID Stripe
  
  // 📋 Formulaire pré-consultation
  preConsultationFormFilled: boolean("pre_consultation_form_filled").default(false),
  preConsultationData: jsonb("pre_consultation_data"),
  
  // 📝 Notes et évaluation
  patientFeedback: text("patient_feedback"), // Retour du patient
  patientRating: integer("patient_rating"), // Note de 1 à 5
  
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const availabilitySlots = pgTable("availability_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  duration: integer("duration").notNull().default(60),
  isAvailable: boolean("is_available").notNull().default(true),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringPattern: text("recurring_pattern"),
  dayOfWeek: integer("day_of_week"),
  notes: text("notes"),
  
  // 🆕 AMÉLIORATIONS
  capacity: integer("capacity").default(1), // Pour ateliers de groupe
  bookedCount: integer("booked_count").default(0), // Nombre de réservations
  isUrgencySlot: boolean("is_urgency_slot").default(false), // 🚨 Créneau urgence
  price: decimal("price", { precision: 10, scale: 2 }), // 💰 Prix variable par créneau
  
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  content: text("content").notNull(),
  isPrivate: boolean("is_private").notNull().default(true),
  sessionDate: date("session_date"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

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

// ========================================
// 🆕 NOUVELLES TABLES POUR AMÉLIORATIONS
// ========================================

// 👥 Table des praticiens (multi-praticiens)
export const practitioners = pgTable("practitioners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  
  // Profil enrichi
  photoUrl: text("photo_url"),
  bio: text("bio"), // Biographie courte (max 500 caractères)
  specialty: text("specialty").notNull(), // Spécialité principale
  specialties: text("specialties").array(), // Spécialités multiples
  yearsOfExperience: integer("years_of_experience"),
  certifications: text("certifications").array(),
  languages: text("languages").array().default(["fr"]),
  
  // Badges et statut
  isVerified: boolean("is_verified").default(false),
  badge: text("badge"), // "top_rated", "quick_response", "expert"
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  
  // Configuration
  defaultAppointmentDuration: integer("default_appointment_duration").default(60),
  defaultPrice: decimal("default_price", { precision: 10, scale: 2 }),
  acceptsOnlinePayment: boolean("accepts_online_payment").default(false),
  acceptsTeleconsultation: boolean("accepts_teleconsultation").default(false),
  
  // Adresse cabinet
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default("France"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 💬 Messagerie praticien-patient
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  senderType: text("sender_type").notNull(), // "patient", "practitioner", "admin"
  receiverId: varchar("receiver_id").notNull(),
  receiverType: text("receiver_type").notNull(),
  
  content: text("content").notNull(),
  attachments: text("attachments").array(), // URLs des fichiers joints
  
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  
  appointmentId: varchar("appointment_id").references(() => appointments.id), // Message lié à un RDV
  
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 📋 Templates de formulaires pré-consultation
export const formTemplates = pgTable("form_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  practitionerId: varchar("practitioner_id").references(() => practitioners.id),
  name: text("name").notNull(),
  description: text("description"),
  
  fields: jsonb("fields").notNull(), // Configuration des champs du formulaire
  // Exemple: [{ type: "text", label: "Symptômes", required: true }, ...]
  
  appointmentTypes: text("appointment_types").array(), // Types de RDV concernés
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ⭐ Avis et recommandations
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  practitionerId: varchar("practitioner_id").notNull().references(() => practitioners.id),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  appointmentId: varchar("appointment_id").notNull().references(() => appointments.id),
  
  rating: integer("rating").notNull(), // 1 à 5
  comment: text("comment"),
  
  isVerified: boolean("is_verified").default(true), // Vérifié = après RDV confirmé
  isPublic: boolean("is_public").default(true), // Visible publiquement
  
  practitionerResponse: text("practitioner_response"),
  practitionerRespondedAt: timestamp("practitioner_responded_at"),
  
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 🔔 Historique des notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  userType: text("user_type").notNull(), // "patient", "practitioner", "admin"
  
  type: text("type").notNull(), // "reminder", "confirmation", "cancellation", "message", etc.
  channel: text("channel").notNull(), // "email", "sms", "push"
  
  title: text("title").notNull(),
  content: text("content").notNull(),
  
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  
  status: text("status").notNull().default("pending"), // pending, sent, failed, delivered
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 🎁 Programme de fidélité
export const loyaltyRewards = pgTable("loyalty_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  
  type: text("type").notNull(), // "appointment_completed", "referral", "birthday", "custom"
  points: integer("points").notNull(),
  description: text("description").notNull(),
  
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  referredPatientId: varchar("referred_patient_id").references(() => patients.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 🎟️ Codes promo et offres
export const promoCodes = pgTable("promo_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description"),
  
  discountType: text("discount_type").notNull(), // "percentage", "fixed_amount", "free_appointment"
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
  
  maxUses: integer("max_uses"), // Nombre maximum d'utilisations
  usedCount: integer("used_count").default(0),
  
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 🎬 Sessions de téléconsultation
export const teleconsultations = pgTable("teleconsultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").notNull().references(() => appointments.id),
  
  roomId: text("room_id").notNull().unique(), // ID de la salle vidéo (Daily.co, Whereby, etc.)
  roomUrl: text("room_url").notNull(),
  
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"), // minutes
  
  isRecorded: boolean("is_recorded").default(false),
  recordingUrl: text("recording_url"),
  
  connectionLogs: jsonb("connection_logs"), // Logs de connexion pour debugging
  
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 🏥 Cabinets et salles (pour multi-praticiens)
export const clinics = pgTable("clinics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").default("France"),
  
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  
  photoUrls: text("photo_urls").array(),
  
  // Configuration
  openingHours: jsonb("opening_hours"), // Par jour de la semaine
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clinicId: varchar("clinic_id").notNull().references(() => clinics.id),
  name: text("name").notNull(),
  number: text("number"),
  
  capacity: integer("capacity").default(1),
  equipment: text("equipment").array(), // Liste des équipements disponibles
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// 🔗 Association praticien-cabinet
export const practitionerClinics = pgTable("practitioner_clinics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  practitionerId: varchar("practitioner_id").notNull().references(() => practitioners.id),
  clinicId: varchar("clinic_id").notNull().references(() => clinics.id),
  
  role: text("role").notNull().default("practitioner"), // "owner", "admin", "practitioner", "secretary"
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ========================================
// SCHÉMAS DE VALIDATION ZOD
// ========================================

export const insertPractitionerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  photoUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  specialty: z.string().min(2),
  specialties: z.array(z.string()).optional(),
  yearsOfExperience: z.number().min(0).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).default(["fr"]),
  defaultAppointmentDuration: z.number().default(60),
  defaultPrice: z.number().optional(),
  acceptsOnlinePayment: z.boolean().default(false),
  acceptsTeleconsultation: z.boolean().default(false),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("France"),
});

export const insertMessageSchema = z.object({
  senderId: z.string(),
  senderType: z.enum(["patient", "practitioner", "admin"]),
  receiverId: z.string(),
  receiverType: z.enum(["patient", "practitioner", "admin"]),
  content: z.string().min(1),
  attachments: z.array(z.string().url()).optional(),
  appointmentId: z.string().optional(),
});

export const insertReviewSchema = z.object({
  practitionerId: z.string(),
  patientId: z.string(),
  appointmentId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  isPublic: z.boolean().default(true),
});

export const insertNotificationSchema = z.object({
  userId: z.string(),
  userType: z.enum(["patient", "practitioner", "admin"]),
  type: z.string(),
  channel: z.enum(["email", "sms", "push", "whatsapp"]),
  title: z.string(),
  content: z.string(),
  appointmentId: z.string().optional(),
});

export const insertPromoCodeSchema = z.object({
  code: z.string().min(3).max(20),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed_amount", "free_appointment"]),
  discountValue: z.number().positive(),
  maxUses: z.number().positive().optional(),
  validFrom: z.date(),
  validUntil: z.date(),
});

// Types TypeScript
export type Practitioner = typeof practitioners.$inferSelect;
export type InsertPractitioner = z.infer<typeof insertPractitionerSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type Teleconsultation = typeof teleconsultations.$inferSelect;
export type Clinic = typeof clinics.$inferSelect;
export type Room = typeof rooms.$inferSelect;

// Ré-export des types existants
export type Admin = typeof admins.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Unavailability = typeof unavailabilities.$inferSelect;

// Types avec jointures
export type AppointmentWithPatient = Appointment & {
  patient?: Patient;
};

export type AppointmentWithPractitioner = Appointment & {
  practitioner?: Practitioner;
};

export type PractitionerWithReviews = Practitioner & {
  reviews?: Review[];
};
