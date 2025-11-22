-- PostgreSQL Schema Initialization for Planning App
-- Run this script manually on your Neon database

-- Drop existing tables if they exist (be careful!)
DROP TABLE IF EXISTS "googleCalendarSync" CASCADE;
DROP TABLE IF EXISTS "webhooks" CASCADE;
DROP TABLE IF EXISTS "settings" CASCADE;
DROP TABLE IF EXISTS "blockedPeriods" CASCADE;
DROP TABLE IF EXISTS "workingPlans" CASCADE;
DROP TABLE IF EXISTS "practitionerServices" CASCADE;
DROP TABLE IF EXISTS "adminLogs" CASCADE;
DROP TABLE IF EXISTS "appointments" CASCADE;
DROP TABLE IF EXISTS "timeOff" CASCADE;
DROP TABLE IF EXISTS "availabilitySlots" CASCADE;
DROP TABLE IF EXISTS "services" CASCADE;
DROP TABLE IF EXISTS "serviceCategories" CASCADE;
DROP TABLE IF EXISTS "specialties" CASCADE;
DROP TABLE IF EXISTS "practitioners" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop existing enums if they exist
DROP TYPE IF EXISTS "setting_key" CASCADE;
DROP TYPE IF EXISTS "day_of_week" CASCADE;
DROP TYPE IF EXISTS "appointment_status" CASCADE;
DROP TYPE IF EXISTS "role" CASCADE;

-- Create enums
CREATE TYPE "role" AS ENUM ('user', 'admin', 'practitioner', 'secretary');
CREATE TYPE "appointment_status" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE "day_of_week" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
CREATE TYPE "setting_key" AS ENUM ('company_name', 'company_email', 'company_phone', 'company_address', 'timezone', 'date_format', 'time_format', 'currency', 'booking_window_days', 'cancellation_hours', 'require_confirmation', 'enable_google_calendar', 'enable_notifications');

-- Create users table
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) UNIQUE,
  "name" TEXT,
  "email" VARCHAR(320) UNIQUE,
  "password" VARCHAR(255),
  "loginMethod" VARCHAR(64),
  "role" "role" DEFAULT 'user' NOT NULL,
  "phoneNumber" VARCHAR(20),
  "address" TEXT,
  "city" VARCHAR(100),
  "zipCode" VARCHAR(20),
  "timezone" VARCHAR(100) DEFAULT 'UTC',
  "language" VARCHAR(10) DEFAULT 'en',
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create practitioners table
CREATE TABLE "practitioners" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id"),
  "firstName" VARCHAR(100) NOT NULL,
  "lastName" VARCHAR(100) NOT NULL,
  "specialization" VARCHAR(200) NOT NULL,
  "phoneNumber" VARCHAR(20),
  "licenseNumber" VARCHAR(100),
  "biography" TEXT,
  "consultationDuration" INTEGER DEFAULT 30 NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create specialties table
CREATE TABLE "specialties" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "color" VARCHAR(7),
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create service categories table
CREATE TABLE "serviceCategories" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "displayOrder" INTEGER DEFAULT 0 NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create services table
CREATE TABLE "services" (
  "id" SERIAL PRIMARY KEY,
  "categoryId" INTEGER REFERENCES "serviceCategories"("id"),
  "name" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "duration" INTEGER NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "currency" VARCHAR(3) DEFAULT 'EUR' NOT NULL,
  "color" VARCHAR(7),
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "availableOnline" BOOLEAN DEFAULT true NOT NULL,
  "requiresApproval" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create practitioner services table
CREATE TABLE "practitionerServices" (
  "id" SERIAL PRIMARY KEY,
  "practitionerId" INTEGER NOT NULL REFERENCES "practitioners"("id"),
  "serviceId" INTEGER NOT NULL REFERENCES "services"("id"),
  "customPrice" DECIMAL(10, 2),
  "customDuration" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create working plans table
CREATE TABLE "workingPlans" (
  "id" SERIAL PRIMARY KEY,
  "practitionerId" INTEGER NOT NULL REFERENCES "practitioners"("id"),
  "dayOfWeek" "day_of_week" NOT NULL,
  "startTime" TIME NOT NULL,
  "endTime" TIME NOT NULL,
  "breakStartTime" TIME,
  "breakEndTime" TIME,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create blocked periods table
CREATE TABLE "blockedPeriods" (
  "id" SERIAL PRIMARY KEY,
  "practitionerId" INTEGER NOT NULL REFERENCES "practitioners"("id"),
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "reason" TEXT,
  "isRecurring" BOOLEAN DEFAULT false NOT NULL,
  "recurrencePattern" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create availability slots table
CREATE TABLE "availabilitySlots" (
  "id" SERIAL PRIMARY KEY,
  "practitionerId" INTEGER NOT NULL REFERENCES "practitioners"("id"),
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TIME NOT NULL,
  "endTime" TIME NOT NULL,
  "isAvailable" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create time off table
CREATE TABLE "timeOff" (
  "id" SERIAL PRIMARY KEY,
  "practitionerId" INTEGER NOT NULL REFERENCES "practitioners"("id"),
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create appointments table
CREATE TABLE "appointments" (
  "id" SERIAL PRIMARY KEY,
  "practitionerId" INTEGER NOT NULL REFERENCES "practitioners"("id"),
  "serviceId" INTEGER NOT NULL REFERENCES "services"("id"),
  "userId" INTEGER REFERENCES "users"("id"),
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP NOT NULL,
  "status" "appointment_status" DEFAULT 'pending' NOT NULL,
  "customerName" VARCHAR(200) NOT NULL,
  "customerEmail" VARCHAR(320) NOT NULL,
  "customerPhone" VARCHAR(20),
  "notes" TEXT,
  "cancellationHash" VARCHAR(64),
  "googleEventId" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create admin logs table
CREATE TABLE "adminLogs" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id"),
  "action" VARCHAR(100) NOT NULL,
  "entityType" VARCHAR(100),
  "entityId" INTEGER,
  "details" TEXT,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create settings table
CREATE TABLE "settings" (
  "id" SERIAL PRIMARY KEY,
  "key" "setting_key" NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "isPublic" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create webhooks table
CREATE TABLE "webhooks" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(200) NOT NULL,
  "url" TEXT NOT NULL,
  "events" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "secret" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create Google Calendar sync table
CREATE TABLE "googleCalendarSync" (
  "id" SERIAL PRIMARY KEY,
  "practitionerId" INTEGER NOT NULL UNIQUE REFERENCES "practitioners"("id"),
  "calendarId" VARCHAR(255) NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "tokenExpiry" TIMESTAMP NOT NULL,
  "syncEnabled" BOOLEAN DEFAULT true NOT NULL,
  "lastSyncAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_openId" ON "users"("openId");
CREATE INDEX "idx_practitioners_userId" ON "practitioners"("userId");
CREATE INDEX "idx_appointments_practitioner" ON "appointments"("practitionerId");
CREATE INDEX "idx_appointments_service" ON "appointments"("serviceId");
CREATE INDEX "idx_appointments_user" ON "appointments"("userId");
CREATE INDEX "idx_appointments_status" ON "appointments"("status");
CREATE INDEX "idx_appointments_startTime" ON "appointments"("startTime");
CREATE INDEX "idx_appointments_cancellationHash" ON "appointments"("cancellationHash");

-- Insert default settings
INSERT INTO "settings" ("key", "value", "description", "isPublic") VALUES
  ('company_name', 'Planning App', 'Nom de l''entreprise', true),
  ('timezone', 'Europe/Paris', 'Fuseau horaire par défaut', true),
  ('date_format', 'DD/MM/YYYY', 'Format de date', true),
  ('time_format', 'HH:mm', 'Format d''heure', true),
  ('currency', 'EUR', 'Devise par défaut', true),
  ('booking_window_days', '30', 'Nombre de jours de réservation à l''avance', true),
  ('cancellation_hours', '24', 'Heures minimales avant annulation', true),
  ('require_confirmation', 'true', 'Requiert confirmation admin', false);
