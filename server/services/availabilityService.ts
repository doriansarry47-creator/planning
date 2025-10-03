import { eq, and, gte, lte, between, sql, desc } from "drizzle-orm";
import { db } from "../db.js";
import { availabilitySlots, appointments, practitioners } from "../../shared/schema.js";
import type { AvailabilitySlot, InsertAvailabilitySlot } from "../../shared/schema.js";

export interface AvailableSlot {
  id: string;
  practitionerId: string;
  startTime: string;
  endTime: string;
  duration: number; // en minutes
  isAvailable: boolean;
  capacity: number;
  bookedCount: number;
}

export interface CreateSlotOptions {
  practitionerId: string;
  startTime: Date;
  endTime: Date;
  capacity?: number;
  notes?: string;
  recurringRule?: string; // Format: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR" ou JSON
}

export interface SlotSearchFilters {
  practitionerId?: string;
  date?: string; // Format: YYYY-MM-DD
  startDate?: string;
  endDate?: string;
  availableOnly?: boolean;
}

class AvailabilityService {
  /**
   * Créer un créneau de disponibilité
   */
  async createSlot(options: CreateSlotOptions): Promise<AvailabilitySlot> {
    const slotData: InsertAvailabilitySlot = {
      practitionerId: options.practitionerId,
      startTime: options.startTime,
      endTime: options.endTime,
      capacity: options.capacity || 1,
      notes: options.notes,
      recurringRule: options.recurringRule,
    };

    const [slot] = await db.insert(availabilitySlots)
      .values(slotData)
      .returning();

    return slot;
  }

  /**
   * Créer des créneaux récurrents
   */
  async createRecurringSlots(options: {
    practitionerId: string;
    startDate: Date;
    endDate: Date;
    timeSlots: Array<{ startTime: string; endTime: string; daysOfWeek: number[] }>; // startTime/endTime au format "HH:mm"
    capacity?: number;
    notes?: string;
  }): Promise<AvailabilitySlot[]> {
    const createdSlots: AvailabilitySlot[] = [];
    
    const { practitionerId, startDate, endDate, timeSlots, capacity = 1, notes } = options;
    
    // Génerer tous les créneaux pour la période donnée
    for (const timeSlot of timeSlots) {
      for (const dayOfWeek of timeSlot.daysOfWeek) {
        let currentDate = new Date(startDate);
        
        // Trouver le premier jour correspondant au jour de la semaine
        while (currentDate.getDay() !== dayOfWeek && currentDate <= endDate) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Créer les créneaux pour chaque semaine
        while (currentDate <= endDate) {
          const slotStartTime = new Date(currentDate);
          const slotEndTime = new Date(currentDate);
          
          const [startHour, startMin] = timeSlot.startTime.split(':').map(Number);
          const [endHour, endMin] = timeSlot.endTime.split(':').map(Number);
          
          slotStartTime.setHours(startHour, startMin, 0, 0);
          slotEndTime.setHours(endHour, endMin, 0, 0);
          
          // Vérifier qu'il n'y a pas déjà un créneau à cette heure
          const existingSlot = await db.select()
            .from(availabilitySlots)
            .where(and(
              eq(availabilitySlots.practitionerId, practitionerId),
              eq(availabilitySlots.startTime, slotStartTime),
              eq(availabilitySlots.isActive, true)
            ))
            .limit(1);
          
          if (existingSlot.length === 0) {
            const slot = await this.createSlot({
              practitionerId,
              startTime: slotStartTime,
              endTime: slotEndTime,
              capacity,
              notes,
              recurringRule: `FREQ=WEEKLY;BYDAY=${['SU','MO','TU','WE','TH','FR','SA'][dayOfWeek]}`,
            });
            createdSlots.push(slot);
          }
          
          // Passer à la semaine suivante
          currentDate.setDate(currentDate.getDate() + 7);
        }
      }
    }
    
    return createdSlots;
  }

  /**
   * Obtenir les créneaux disponibles pour un praticien à une date donnée
   */
  async getAvailableSlots(filters: SlotSearchFilters): Promise<AvailableSlot[]> {
    let whereConditions = [eq(availabilitySlots.isActive, true)];
    
    if (filters.practitionerId) {
      whereConditions.push(eq(availabilitySlots.practitionerId, filters.practitionerId));
    }
    
    if (filters.date) {
      const searchDate = new Date(filters.date);
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const dateCondition = and(
        gte(availabilitySlots.startTime, startOfDay),
        lte(availabilitySlots.startTime, endOfDay)
      );
      if (dateCondition) {
        whereConditions.push(dateCondition);
      }
    } else if (filters.startDate && filters.endDate) {
      const rangeCondition = and(
        gte(availabilitySlots.startTime, new Date(filters.startDate)),
        lte(availabilitySlots.startTime, new Date(filters.endDate))
      );
      if (rangeCondition) {
        whereConditions.push(rangeCondition);
      }
    }
    
    const slots = await db.select({
      id: availabilitySlots.id,
      practitionerId: availabilitySlots.practitionerId,
      startTime: availabilitySlots.startTime,
      endTime: availabilitySlots.endTime,
      capacity: availabilitySlots.capacity,
      isBooked: availabilitySlots.isBooked,
      notes: availabilitySlots.notes,
    })
    .from(availabilitySlots)
    .where(and(...whereConditions))
    .orderBy(availabilitySlots.startTime);

    // Pour chaque créneau, calculer le nombre de réservations
    const availableSlots: AvailableSlot[] = [];
    
    for (const slot of slots) {
      const bookedAppointments = await db.select({ count: sql`count(*)` })
        .from(appointments)
        .where(and(
          eq(appointments.slotId, slot.id),
          eq(appointments.status, 'scheduled')
        ));
      
      const bookedCount = Number(bookedAppointments[0]?.count || 0);
      const isAvailable = bookedCount < slot.capacity;
      
      if (!filters.availableOnly || isAvailable) {
        const duration = Math.round((slot.endTime.getTime() - slot.startTime.getTime()) / (1000 * 60));
        
        availableSlots.push({
          id: slot.id,
          practitionerId: slot.practitionerId,
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
          duration,
          isAvailable,
          capacity: slot.capacity,
          bookedCount,
        });
      }
    }
    
    return availableSlots;
  }

  /**
   * Supprimer ou désactiver un créneau
   */
  async deleteSlot(slotId: string, force: boolean = false): Promise<boolean> {
    // Vérifier s'il y a des appointments liés
    const linkedAppointments = await db.select()
      .from(appointments)
      .where(and(
        eq(appointments.slotId, slotId),
        eq(appointments.status, 'scheduled')
      ));
    
    if (linkedAppointments.length > 0 && !force) {
      // Désactiver seulement
      await db.update(availabilitySlots)
        .set({ isActive: false })
        .where(eq(availabilitySlots.id, slotId));
      return true;
    }
    
    // Supprimer complètement
    const result = await db.delete(availabilitySlots)
      .where(eq(availabilitySlots.id, slotId))
      .returning();
    
    return result.length > 0;
  }

  /**
   * Mettre à jour un créneau
   */
  async updateSlot(slotId: string, updates: Partial<InsertAvailabilitySlot>): Promise<AvailabilitySlot | null> {
    const [updatedSlot] = await db.update(availabilitySlots)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(availabilitySlots.id, slotId))
      .returning();
    
    return updatedSlot || null;
  }

  /**
   * Marquer un créneau comme réservé ou libérer un créneau
   */
  async toggleSlotBooking(slotId: string, isBooked: boolean): Promise<boolean> {
    const result = await db.update(availabilitySlots)
      .set({ isBooked, updatedAt: new Date() })
      .where(eq(availabilitySlots.id, slotId))
      .returning();
    
    return result.length > 0;
  }

  /**
   * Obtenir tous les créneaux d'un praticien
   */
  async getPractitionerSlots(practitionerId: string): Promise<AvailabilitySlot[]> {
    return await db.select()
      .from(availabilitySlots)
      .where(and(
        eq(availabilitySlots.practitionerId, practitionerId),
        eq(availabilitySlots.isActive, true)
      ))
      .orderBy(availabilitySlots.startTime);
  }

  /**
   * Vérifier la disponibilité d'un créneau spécifique
   */
  async isSlotAvailable(slotId: string): Promise<boolean> {
    const slot = await db.select()
      .from(availabilitySlots)
      .where(and(
        eq(availabilitySlots.id, slotId),
        eq(availabilitySlots.isActive, true)
      ))
      .limit(1);
    
    if (slot.length === 0) return false;
    
    const bookedAppointments = await db.select({ count: sql`count(*)` })
      .from(appointments)
      .where(and(
        eq(appointments.slotId, slotId),
        eq(appointments.status, 'scheduled')
      ));
    
    const bookedCount = Number(bookedAppointments[0]?.count || 0);
    return bookedCount < slot[0].capacity;
  }

  /**
   * Générer des créneaux basés sur les horaires de travail d'un praticien
   */
  async generateSlotsFromSchedule(options: {
    practitionerId: string;
    startDate: Date;
    endDate: Date;
    workingDays: number[]; // [1,2,3,4,5] pour Lundi-Vendredi
    workingHours: { start: string; end: string }; // { start: "09:00", end: "17:00" }
    slotDuration: number; // en minutes
    breakTimes?: Array<{ start: string; end: string }>; // Pauses déjeuner, etc.
    capacity?: number;
  }): Promise<AvailabilitySlot[]> {
    const {
      practitionerId,
      startDate,
      endDate,
      workingDays,
      workingHours,
      slotDuration,
      breakTimes = [],
      capacity = 1,
    } = options;

    const createdSlots: AvailabilitySlot[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Vérifier si c'est un jour de travail
      if (workingDays.includes(currentDate.getDay())) {
        // Générer les créneaux pour ce jour
        const [startHour, startMin] = workingHours.start.split(':').map(Number);
        const [endHour, endMin] = workingHours.end.split(':').map(Number);

        let slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMin, 0, 0);
        
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(endHour, endMin, 0, 0);

        while (slotStart < dayEnd) {
          const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
          
          // Vérifier si le créneau ne chevauche pas avec une pause
          const isInBreak = breakTimes.some(breakTime => {
            const [breakStartHour, breakStartMin] = breakTime.start.split(':').map(Number);
            const [breakEndHour, breakEndMin] = breakTime.end.split(':').map(Number);
            
            const breakStart = new Date(currentDate);
            breakStart.setHours(breakStartHour, breakStartMin, 0, 0);
            const breakEnd = new Date(currentDate);
            breakEnd.setHours(breakEndHour, breakEndMin, 0, 0);
            
            return (slotStart >= breakStart && slotStart < breakEnd) ||
                   (slotEnd > breakStart && slotEnd <= breakEnd) ||
                   (slotStart < breakStart && slotEnd > breakEnd);
          });

          if (!isInBreak && slotEnd <= dayEnd) {
            // Vérifier qu'il n'existe pas déjà un créneau à cette heure
            const existingSlot = await db.select()
              .from(availabilitySlots)
              .where(and(
                eq(availabilitySlots.practitionerId, practitionerId),
                eq(availabilitySlots.startTime, slotStart),
                eq(availabilitySlots.isActive, true)
              ))
              .limit(1);
            
            if (existingSlot.length === 0) {
              const slot = await this.createSlot({
                practitionerId,
                startTime: slotStart,
                endTime: slotEnd,
                capacity,
                notes: `Créneau généré automatiquement - ${slotDuration}min`,
              });
              createdSlots.push(slot);
            }
          }

          // Passer au créneau suivant
          slotStart = new Date(slotStart.getTime() + slotDuration * 60000);
        }
      }

      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return createdSlots;
  }
}

export const availabilityService = new AvailabilityService();
export default AvailabilityService;