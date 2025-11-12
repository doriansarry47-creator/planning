import { eq, gte, lte, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, practitioners, availabilitySlots, appointments, InsertAppointment, InsertAvailabilitySlot, InsertPractitioner, timeOff, InsertTimeOff, adminLogs, InsertAdminLog, specialties, InsertSpecialty } from "../drizzle/schema";
import { ENV } from './_core/env';
import bcrypt from 'bcryptjs';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
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

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Récupérer tous les praticiens actifs
export async function getPractitioners() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(practitioners).where(eq(practitioners.isActive, true));
  return result;
}

// Créer un nouveau praticien
export async function createPractitioner(data: InsertPractitioner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(practitioners).values(data);
  return result;
}

// Récupérer un praticien par ID
export async function getPractitionerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(practitioners).where(eq(practitioners.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Récupérer les créneaux disponibles pour un praticien
export async function createAvailabilitySlot(data: InsertAvailabilitySlot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(availabilitySlots).values(data);
  return result;
}

export async function updateAvailabilitySlot(slotId: number, data: Partial<InsertAvailabilitySlot>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(availabilitySlots).set(data).where(eq(availabilitySlots.id, slotId));
  return result;
}

export async function deleteAvailabilitySlot(slotId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.delete(availabilitySlots).where(eq(availabilitySlots.id, slotId));
  return result;
}

export async function getPractitionerSlots(practitionerId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select()
    .from(availabilitySlots)
    .where(eq(availabilitySlots.practitionerId, practitionerId))
    .orderBy(availabilitySlots.startTime);
  return result;
}

// Récupérer les créneaux disponibles pour un praticien
export async function getAvailableSlots(practitionerId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select()
    .from(availabilitySlots)
    .where(
      and(
        eq(availabilitySlots.practitionerId, practitionerId),
        gte(availabilitySlots.startTime, startDate),
        lte(availabilitySlots.endTime, endDate),
        eq(availabilitySlots.isActive, true)
      )
    );
  return result;
}

// Créer un rendez-vous
export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appointments).values(data);
  return result;
}

// Récupérer les rendez-vous d'un utilisateur
export async function getUserAppointments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select()
    .from(appointments)
    .innerJoin(practitioners, eq(appointments.practitionerId, practitioners.id))
    .where(eq(appointments.userId, userId))
    .orderBy(appointments.appointmentDate);
  return result;
}

// Récupérer tous les rendez-vous (pour les admins)
export async function getAllAppointments() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select()
    .from(appointments)
    .innerJoin(practitioners, eq(appointments.practitionerId, practitioners.id))
    .innerJoin(users, eq(appointments.userId, users.id))
    .orderBy(appointments.appointmentDate);
  return result;
}

// Annuler un rendez-vous
export async function cancelAppointment(appointmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(appointments)
    .set({ status: "cancelled" })
    .where(eq(appointments.id, appointmentId));
  return result;
}

// Ajouter une exception d'horaire (congé)
export async function createTimeOff(data: InsertTimeOff) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(timeOff).values(data);
  return result;
}

// Récupérer les exceptions d'horaires pour un praticien
export async function getPractitionerTimeOff(practitionerId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select()
    .from(timeOff)
    .where(eq(timeOff.practitionerId, practitionerId))
    .orderBy(timeOff.startDate);
  return result;
}

// ============= AUTHENTIFICATION ADMIN =============

/**
 * Authentifier un utilisateur avec email et mot de passe
 */
export async function authenticateUser(email: string, password: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot authenticate: database not available");
    return null;
  }

  try {
    // Récupérer l'utilisateur par email
    const result = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      return null; // Utilisateur non trouvé
    }

    const user = result[0];

    // Vérifier que l'utilisateur a un mot de passe défini
    if (!user.password) {
      return null; // Pas d'authentification locale pour cet utilisateur
    }

    // Vérifier que le compte est actif
    if (!user.isActive) {
      return null; // Compte désactivé
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null; // Mot de passe incorrect
    }

    // Mettre à jour la dernière connexion
    await db.update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, user.id));

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("[Database] Authentication error:", error);
    return null;
  }
}

/**
 * Changer le mot de passe d'un utilisateur
 */
export async function changeUserPassword(userId: number, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await db.update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId));
}

/**
 * Récupérer tous les utilisateurs (pour les admins)
 */
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    id: users.id,
    openId: users.openId,
    name: users.name,
    email: users.email,
    loginMethod: users.loginMethod,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users);
  
  return result;
}

/**
 * Suspendre/activer un utilisateur
 */
export async function toggleUserStatus(userId: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({ isActive })
    .where(eq(users.id, userId));
}

/**
 * Supprimer un utilisateur
 */
export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(users).where(eq(users.id, userId));
}

// ============= LOGS D'ACTIVITÉ ADMIN =============

/**
 * Créer un log d'activité admin
 */
export async function createAdminLog(log: InsertAdminLog) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create admin log: database not available");
    return;
  }

  try {
    await db.insert(adminLogs).values(log);
  } catch (error) {
    console.error("[Database] Failed to create admin log:", error);
  }
}

/**
 * Récupérer les logs d'activité admin
 */
export async function getAdminLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select()
    .from(adminLogs)
    .innerJoin(users, eq(adminLogs.userId, users.id))
    .orderBy(desc(adminLogs.createdAt))
    .limit(limit);
  
  return result;
}

// ============= SPÉCIALITÉS MÉDICALES =============

/**
 * Récupérer toutes les spécialités
 */
export async function getSpecialties() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select()
    .from(specialties)
    .where(eq(specialties.isActive, true));
  
  return result;
}

/**
 * Créer une spécialité
 */
export async function createSpecialty(data: InsertSpecialty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(specialties).values(data);
  return result;
}

/**
 * Mettre à jour une spécialité
 */
export async function updateSpecialty(id: number, data: Partial<InsertSpecialty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(specialties)
    .set(data)
    .where(eq(specialties.id, id));
}

/**
 * Supprimer une spécialité
 */
export async function deleteSpecialty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(specialties).where(eq(specialties.id, id));
}
