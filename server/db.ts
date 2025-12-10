import { eq, gte, lte, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { 
  InsertUser, users, practitioners, availabilitySlots, appointments, 
  InsertAppointment, InsertAvailabilitySlot, InsertPractitioner, 
  timeOff, InsertTimeOff, adminLogs, InsertAdminLog, 
  specialties, InsertSpecialty,
  services, InsertService,
  serviceCategories, InsertServiceCategory,
  practitionerServices, InsertPractitionerService,
  workingPlans, InsertWorkingPlan,
  blockedPeriods, InsertBlockedPeriod,
  settings, InsertSetting,
  webhooks, InsertWebhook
} from "../drizzle/schema.postgres";
import { ENV } from './_core/env';
import { nanoid } from 'nanoid';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

// Lazily create the drizzle instance for PostgreSQL
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      _db = drizzle(_pool);
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existingUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);

    const values: InsertUser = {
      openId: user.openId,
    };

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
    }
    
    if (user.role !== undefined) {
      values.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (existingUser.length > 0) {
      // Update existing user
      await db.update(users)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(users.openId, user.openId));
    } else {
      // Insert new user
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get user:", error);
    return undefined;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get user by email:", error);
    return undefined;
  }
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all users:", error);
    return [];
  }
}

// Practitioners
export async function createPractitioner(practitioner: InsertPractitioner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(practitioners).values(practitioner).returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to create practitioner:", error);
    throw error;
  }
}

export async function getPractitionerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(practitioners).where(eq(practitioners.id, id)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get practitioner:", error);
    return undefined;
  }
}

export async function getAllPractitioners() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(practitioners).where(eq(practitioners.isActive, true));
  } catch (error) {
    console.error("[Database] Failed to get all practitioners:", error);
    return [];
  }
}

export async function updatePractitioner(id: number, data: Partial<InsertPractitioner>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.update(practitioners)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(practitioners.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to update practitioner:", error);
    throw error;
  }
}

// Appointments
export async function createAppointment(appointment: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Generate cancellation hash
    const cancellationHash = nanoid();
    const result = await db.insert(appointments)
      .values({ ...appointment, cancellationHash })
      .returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to create appointment:", error);
    throw error;
  }
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get appointment:", error);
    return undefined;
  }
}

export async function getAllAppointments() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(appointments).orderBy(desc(appointments.startTime));
  } catch (error) {
    console.error("[Database] Failed to get all appointments:", error);
    return [];
  }
}

export async function getAppointmentsByPractitioner(practitionerId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db.select().from(appointments).where(eq(appointments.practitionerId, practitionerId)) as any;
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(appointments.startTime, startDate),
          lte(appointments.startTime, endDate)
        )
      );
    }
    
    return await query.orderBy(appointments.startTime);
  } catch (error) {
    console.error("[Database] Failed to get appointments by practitioner:", error);
    return [];
  }
}

export async function updateAppointment(id: number, data: Partial<InsertAppointment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.update(appointments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to update appointment:", error);
    throw error;
  }
}

export async function cancelAppointment(cancellationHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.update(appointments)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(appointments.cancellationHash, cancellationHash))
      .returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to cancel appointment:", error);
    throw error;
  }
}

// Services
export async function createService(service: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(services).values(service).returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to create service:", error);
    throw error;
  }
}

export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(services).where(eq(services.isActive, true));
  } catch (error) {
    console.error("[Database] Failed to get all services:", error);
    return [];
  }
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.update(services)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to update service:", error);
    throw error;
  }
}

// Admin Logs
export async function createAdminLog(log: InsertAdminLog) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(adminLogs).values(log);
  } catch (error) {
    console.error("[Database] Failed to create admin log:", error);
  }
}

export async function getAdminLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(adminLogs).orderBy(desc(adminLogs.createdAt)).limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get admin logs:", error);
    return [];
  }
}

// Working Plans
export async function createWorkingPlan(plan: InsertWorkingPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(workingPlans).values(plan).returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to create working plan:", error);
    throw error;
  }
}

export async function getWorkingPlansByPractitioner(practitionerId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(workingPlans)
      .where(and(
        eq(workingPlans.practitionerId, practitionerId),
        eq(workingPlans.isActive, true)
      ));
  } catch (error) {
    console.error("[Database] Failed to get working plans:", error);
    return [];
  }
}

// Settings
export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(settings).where(eq(settings.key, key as any)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get setting:", error);
    return undefined;
  }
}

export async function upsertSetting(setting: InsertSetting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const existing = await getSetting(setting.key as string);
    
    if (existing) {
      const result = await db.update(settings)
        .set({ value: setting.value, updatedAt: new Date() })
        .where(eq(settings.key, setting.key))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(settings).values(setting).returning();
      return result[0];
    }
  } catch (error) {
    console.error("[Database] Failed to upsert setting:", error);
    throw error;
  }
}

// TimeOff functions
export async function createTimeOff(data: InsertTimeOff) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(timeOff).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to create timeOff:", error);
    throw error;
  }
}

export async function getPractitionerTimeOff(practitionerId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get practitioner timeOff: database not available");
    return [];
  }

  try {
    const result = await db.select()
      .from(timeOff)
      .where(eq(timeOff.practitionerId, practitionerId))
      .orderBy(desc(timeOff.startDate));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get practitioner timeOff:", error);
    return [];
  }
}

// Utility functions referenced by routers
export async function getPractitioners() {
  return getAllPractitioners();
}

export async function getUserAppointments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(appointments).where(eq(appointments.customerId, userId));
  } catch (error) {
    console.error("[Database] Failed to get user appointments:", error);
    return [];
  }
}

export async function createAppointmentWithHash(appointment: InsertAppointment) {
  return createAppointment(appointment);
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get service:", error);
    return undefined;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get user:", error);
    return undefined;
  }
}

export async function getAppointmentByHash(hash: string) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(appointments).where(eq(appointments.cancellationHash, hash)).limit(1);
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get appointment by hash:", error);
    return undefined;
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  
  // Simple authentication - in production, use proper password hashing
  return user;
}

export async function changeUserPassword(userId: number, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.update(users)
      .set({ updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to change password:", error);
    throw error;
  }
}

export async function toggleUserStatus(userId: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to toggle user status:", error);
    throw error;
  }
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(users).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to delete user:", error);
    throw error;
  }
}

// Specialties functions
export async function getSpecialties() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(specialties).where(eq(specialties.isActive, true));
  } catch (error) {
    console.error("[Database] Failed to get specialties:", error);
    return [];
  }
}

export async function createSpecialty(specialty: InsertSpecialty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(specialties).values(specialty).returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to create specialty:", error);
    throw error;
  }
}

export async function updateSpecialty(id: number, data: Partial<InsertSpecialty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.update(specialties)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(specialties.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to update specialty:", error);
    throw error;
  }
}

export async function deleteSpecialty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(specialties).where(eq(specialties.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete specialty:", error);
    throw error;
  }
}

// Service categories functions
export async function getServiceCategories() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(serviceCategories).where(eq(serviceCategories.isActive, true));
  } catch (error) {
    console.error("[Database] Failed to get service categories:", error);
    return [];
  }
}

export async function createServiceCategory(category: InsertServiceCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(serviceCategories).values(category).returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to create service category:", error);
    throw error;
  }
}

// Enhanced services functions
export async function getServices() {
  return getAllServices();
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(services).where(eq(services.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete service:", error);
    throw error;
  }
}

export async function getPractitionerServices(practitionerId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(practitionerServices)
      .where(eq(practitionerServices.practitionerId, practitionerId));
  } catch (error) {
    console.error("[Database] Failed to get practitioner services:", error);
    return [];
  }
}

export async function addServiceToPractitioner(data: InsertPractitionerService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(practitionerServices).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to add service to practitioner:", error);
    throw error;
  }
}

// Enhanced working plan functions
export async function getPractitionerWorkingPlan(practitionerId: number) {
  return getWorkingPlansByPractitioner(practitionerId);
}

export async function updateWorkingPlan(id: number, data: Partial<InsertWorkingPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.update(workingPlans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workingPlans.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to update working plan:", error);
    throw error;
  }
}

// Blocked periods functions
export async function getPractitionerBlockedPeriods(practitionerId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select()
      .from(blockedPeriods)
      .where(eq(blockedPeriods.practitionerId, practitionerId));
  } catch (error) {
    console.error("[Database] Failed to get practitioner blocked periods:", error);
    return [];
  }
}

export async function createBlockedPeriod(data: InsertBlockedPeriod) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(blockedPeriods).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to create blocked period:", error);
    throw error;
  }
}

export async function deleteBlockedPeriod(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(blockedPeriods).where(eq(blockedPeriods.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete blocked period:", error);
    throw error;
  }
}

// End of utility functions

// AvailabilitySlots functions
export async function createAvailabilitySlot(data: InsertAvailabilitySlot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(availabilitySlots).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to create availabilitySlot:", error);
    throw error;
  }
}

export async function updateAvailabilitySlot(id: number, data: Partial<InsertAvailabilitySlot>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.update(availabilitySlots)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(availabilitySlots.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to update availabilitySlot:", error);
    throw error;
  }
}

export async function deleteAvailabilitySlot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(availabilitySlots).where(eq(availabilitySlots.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete availabilitySlot:", error);
    throw error;
  }
}

export async function getPractitionerSlots(practitionerId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get practitioner slots: database not available");
    return [];
  }

  try {
    // Construire les conditions dynamiquement
    const conditions = [eq(availabilitySlots.practitionerId, practitionerId)];
    
    if (startDate && endDate) {
      conditions.push(gte(availabilitySlots.startTime, startDate));
      conditions.push(lte(availabilitySlots.startTime, endDate));
    }
    
    const result = await db.select()
      .from(availabilitySlots)
      .where(and(...conditions))
      .orderBy(availabilitySlots.startTime);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get practitioner slots:", error);
    return [];
  }
}

export async function getAvailableSlots(practitionerId?: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get available slots: database not available");
    return [];
  }

  try {
    let conditions = [];
    
    if (practitionerId) {
      conditions.push(eq(availabilitySlots.practitionerId, practitionerId));
    }
    
    if (startDate && endDate) {
      conditions.push(gte(availabilitySlots.startTime, startDate));
      conditions.push(lte(availabilitySlots.startTime, endDate));
    }
    
    const query = conditions.length > 0 
      ? db.select().from(availabilitySlots).where(and(...conditions))
      : db.select().from(availabilitySlots);
    
    const result = await query.orderBy(availabilitySlots.startTime);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get available slots:", error);
    return [];
  }
}

export {
  users, practitioners, availabilitySlots, appointments, timeOff, 
  adminLogs, specialties, services, serviceCategories, 
  practitionerServices, workingPlans, blockedPeriods, settings,
  webhooks
};

export type {
  InsertUser, InsertPractitioner, InsertAvailabilitySlot, 
  InsertAppointment, InsertTimeOff, InsertAdminLog, InsertSpecialty,
  InsertService, InsertServiceCategory, InsertPractitionerService,
  InsertWorkingPlan, InsertBlockedPeriod, InsertSetting,
  InsertWebhook
};
