import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { google } from "googleapis";
import { getGoogleCalendarIcalService } from "./services/googleCalendarIcal";
import { appointments } from "../drizzle/schema";

/**
 * Service Google Calendar utilisant Service Account JWT
 * Accès au calendrier via les credentials du Service Account
 */
class GoogleCalendarJWTClient {
  private calendar: any;
  private auth: any;
  public isInitialized = false;
  private calendarId: string;
  private initPromise: Promise<void>;

  constructor() {
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || "doriansarry47@gmail.com";
    this.initPromise = this.initializeCalendar();
  }

  private async initializeCalendar() {
    try {
      console.log("🔑 Initialisation Google Calendar avec Service Account JWT");
      
      let serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
      let serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "";
      
      // Si les variables d'environnement ne sont pas définies, essayer de charger depuis le fichier JSON
      if (!serviceAccountEmail || !serviceAccountPrivateKey) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const configPath = path.join(__dirname, 'config', 'google-service-account.json');
          
          if (fs.existsSync(configPath)) {
            console.log("📂 Chargement des credentials depuis google-service-account.json");
            const serviceAccount = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            serviceAccountEmail = serviceAccount.client_email;
            serviceAccountPrivateKey = serviceAccount.private_key;
          }
        } catch (fileError) {
          console.warn("⚠️ Impossible de charger le fichier de configuration:", fileError);
        }
      }
      
      if (!serviceAccountEmail || !serviceAccountPrivateKey) {
        console.warn("⚠️ Credentials Service Account manquants");
        console.log(`📍 Service Account Email: ${serviceAccountEmail ? serviceAccountEmail : 'MANQUANT'}`);
        console.log(`📍 Private Key: ${serviceAccountPrivateKey ? 'PRÉSENT' : 'MANQUANT'}`);
        this.isInitialized = false;
        return;
      }
      
      // Traiter la clé privée pour gérer les différents formats
      serviceAccountPrivateKey = serviceAccountPrivateKey.trim();
      if (serviceAccountPrivateKey.startsWith('"')) {
        serviceAccountPrivateKey = serviceAccountPrivateKey.slice(1);
      }
      if (serviceAccountPrivateKey.endsWith('"')) {
        serviceAccountPrivateKey = serviceAccountPrivateKey.slice(0, -1);
      }
      // La clé peut contenir des \n littéraux ou des \\n échappés
      serviceAccountPrivateKey = serviceAccountPrivateKey
        .replace(/\\n/g, '\n')  // Remplacer \\n par newline
        .replace(/\\\\n/g, '\n'); // Remplacer \\\\n par newline
      
      console.log(`📍 Private Key format: ${serviceAccountPrivateKey.startsWith('-----BEGIN') ? 'PEM valide' : 'Format inconnu'}`);
      console.log(`📍 Service Account Email: ${serviceAccountEmail}`);
      
      // Créer l'authentification JWT avec Service Account
      this.auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: serviceAccountPrivateKey,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar.events'],
      });
      
      // Tester l'accès en authorisant le client
      try {
        await this.auth.authorize();
        console.log(`✅ Service Account JWT autorisé`);
      } catch (authError: any) {
        console.error("❌ Erreur lors de l'autorisation JWT:", authError.message);
        this.isInitialized = false;
        return;
      }
      
      // Configurer l'API Calendar avec JWT
      this.calendar = google.calendar({
        version: 'v3',
        auth: this.auth
      });
      
      this.isInitialized = true;
      console.log("✅ Google Calendar Service Account JWT initialisé avec succès");
      console.log(`📍 Calendrier: ${this.calendarId}`);
      console.log(`📍 Service Account: ${serviceAccountEmail}`);
      
    } catch (error) {
      console.error("❌ Erreur initialisation Google Calendar JWT:", error);
      this.isInitialized = false;
    }
  }

  async ensureInitialized(): Promise<void> {
    await this.initPromise;
  }

  async getAvailableSlots(date: Date, durationMinutes: number = 60): Promise<string[]> {
    if (!this.isInitialized) {
      console.warn("[JWT] Google Calendar non initialisé");
      return [];
    }

    try {
      const targetDateStr = date.toISOString().split('T')[0];
      console.log(`[JWT] Recherche des créneaux pour ${targetDateStr}`);
      
      // Définir la plage horaire pour la journée entière (minuit à minuit)
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      // Récupérer TOUS les événements du calendrier pour cette journée
      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      console.log(`[JWT] ${events.length} événements trouvés pour ${targetDateStr}`);
      
      // Séparer les événements "DISPONIBLE" des événements bloquants
      // et FILTRER uniquement ceux qui sont vraiment pour cette date
      const availableEvents: any[] = [];
      const blockingEvents: any[] = [];
      
      for (const event of events) {
        const eventStartDate = event.start?.dateTime || event.start?.date;
        if (!eventStartDate) continue;
        
        const eventDate = new Date(eventStartDate);
        const eventDateStr = eventDate.toISOString().split('T')[0];
        
        // Ignorer les événements qui ne sont pas pour la date cible
        if (eventDateStr !== targetDateStr) {
          continue;
        }
        
        const title = event.summary?.toLowerCase() || '';
        const isAvailable = 
          title.includes('disponible') || 
          title.includes('available') || 
          title.includes('dispo') ||
          title.includes('🟢');
        
        if (isAvailable) {
          availableEvents.push(event);
          const startTime = eventDate.toTimeString().slice(0, 5);
          const endTime = new Date(event.end?.dateTime || event.end?.date).toTimeString().slice(0, 5);
          console.log(`[JWT] 🟢 Disponible: ${startTime}-${endTime}`);
        } else {
          blockingEvents.push(event);
          const startTime = eventDate.toTimeString().slice(0, 5);
          console.log(`[JWT] 🔴 Bloqué: ${event.summary} (${startTime})`);
        }
      }
      
      // Si aucun événement DISPONIBLE pour cette date, retourner vide
      if (availableEvents.length === 0) {
        console.log(`[JWT] Aucune disponibilité pour ${targetDateStr}`);
        return [];
      }
      
      // Récupérer les rendez-vous confirmés depuis la base de données pour cette date
      const { getDb } = await import("./db");
      const db = await getDb();
      const { appointments } = await import("../drizzle/schema");
      const { and, gte, lt, inArray } = await import("drizzle-orm");
      
      const bookedAppointments = await db
        .select({
          startTime: appointments.startTime,
          endTime: appointments.endTime,
        })
        .from(appointments)
        .where(
          and(
            inArray(appointments.status, ["confirmed", "pending", "scheduled"]),
            gte(appointments.startTime, dayStart),
            lt(appointments.startTime, dayEnd)
          )
        );

      // Créer un ensemble des créneaux occupés depuis la BD
      const bookedSlots = new Set<string>();
      for (const apt of bookedAppointments) {
        const aptStart = new Date(apt.startTime);
        const timeStr = aptStart.toTimeString().slice(0, 5);
        bookedSlots.add(timeStr);
        console.log(`[JWT] ⛔ Créneau réservé en BD: ${timeStr}`);
      }
      
      // Fonction pour vérifier si un créneau chevauche un événement bloquant
      const isSlotBlocked = (slotStart: Date, slotEnd: Date): boolean => {
        for (const blockingEvent of blockingEvents) {
          const eventStart = new Date(blockingEvent.start.dateTime || blockingEvent.start.date);
          const eventEnd = new Date(blockingEvent.end.dateTime || blockingEvent.end.date);
          
          if (slotStart < eventEnd && slotEnd > eventStart) {
            return true;
          }
        }
        return false;
      };
      
      const slots: string[] = [];
      const now = new Date();

      // Générer les créneaux depuis les événements "DISPONIBLE"
      for (const event of availableEvents) {
        const eventStart = new Date(event.start.dateTime || event.start.date);
        const eventEnd = new Date(event.end.dateTime || event.end.date);
        
        // Générer les créneaux avec la durée spécifiée
        let currentTime = new Date(eventStart);
        while (currentTime < eventEnd) {
          const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);
          
          // Vérifier que le créneau est dans les limites et dans le futur
          if (slotEnd <= eventEnd && currentTime > now) {
            const timeStr = currentTime.toTimeString().slice(0, 5);
            
            // Vérifier que le créneau n'est pas déjà dans la liste
            if (!slots.includes(timeStr)) {
              // Vérifier qu'il n'est pas réservé en BD
              if (!bookedSlots.has(timeStr)) {
                // Vérifier qu'il ne chevauche pas un événement bloquant sur Google Calendar
                if (!isSlotBlocked(currentTime, slotEnd)) {
                  slots.push(timeStr);
                  console.log(`[JWT] ✅ Créneau: ${timeStr}`);
                } else {
                  console.log(`[JWT] ⛔ Créneau bloqué: ${timeStr}`);
                }
              } else {
                console.log(`[JWT] ⛔ Créneau réservé BD: ${timeStr}`);
              }
            }
          }
          
          currentTime = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);
        }
      }

      slots.sort();
      console.log(`[JWT] Total: ${slots.length} créneaux pour ${targetDateStr}`);
      return slots;
    } catch (error) {
      console.error("[JWT] Erreur:", error);
      return [];
    }
  }

  async getAllAvailableSlotsForRange(startDate: Date, endDate: Date, durationMinutes: number = 60): Promise<Record<string, string[]>> {
    if (!this.isInitialized) {
      console.warn("[JWT BATCH] Google Calendar non initialisé");
      return {};
    }

    try {
      console.log(`[JWT BATCH] Récupération des créneaux du ${startDate.toISOString().split('T')[0]} au ${endDate.toISOString().split('T')[0]}`);
      
      const rangeStart = new Date(startDate);
      rangeStart.setHours(0, 0, 0, 0);
      
      const rangeEnd = new Date(endDate);
      rangeEnd.setHours(23, 59, 59, 999);

      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: rangeStart.toISOString(),
        timeMax: rangeEnd.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 500,
      });

      const events = response.data.items || [];
      console.log(`[JWT BATCH] ${events.length} événements trouvés pour la période`);
      
      const eventsByDate: Record<string, { available: any[], blocking: any[] }> = {};
      
      for (const event of events) {
        const eventStartDate = event.start?.dateTime || event.start?.date;
        if (!eventStartDate) continue;
        
        const eventDate = new Date(eventStartDate);
        const eventDateStr = eventDate.toISOString().split('T')[0];
        
        if (!eventsByDate[eventDateStr]) {
          eventsByDate[eventDateStr] = { available: [], blocking: [] };
        }
        
        const title = event.summary?.toLowerCase() || '';
        const isAvailable = 
          title.includes('disponible') || 
          title.includes('available') || 
          title.includes('dispo') ||
          title.includes('🟢');
        
        if (isAvailable) {
          eventsByDate[eventDateStr].available.push(event);
        } else {
          eventsByDate[eventDateStr].blocking.push(event);
        }
      }

      const { getDb } = await import("./db");
      const db = await getDb();
      const { appointments } = await import("../drizzle/schema");
      const { and, gte, lt, inArray } = await import("drizzle-orm");
      
      const bookedAppointments = await db
        .select({
          startTime: appointments.startTime,
          endTime: appointments.endTime,
        })
        .from(appointments)
        .where(
          and(
            inArray(appointments.status, ["confirmed", "pending", "scheduled"]),
            gte(appointments.startTime, rangeStart),
            lt(appointments.startTime, rangeEnd)
          )
        );

      const bookedSlotsByDate: Record<string, Set<string>> = {};
      for (const apt of bookedAppointments) {
        const aptStart = new Date(apt.startTime);
        const dateStr = aptStart.toISOString().split('T')[0];
        const timeStr = aptStart.toTimeString().slice(0, 5);
        if (!bookedSlotsByDate[dateStr]) {
          bookedSlotsByDate[dateStr] = new Set();
        }
        bookedSlotsByDate[dateStr].add(timeStr);
        console.log(`[JWT BATCH] ⛔ Créneau réservé en BD: ${dateStr} ${timeStr}`);
      }

      const slotsByDate: Record<string, string[]> = {};
      const now = new Date();

      for (const [dateStr, { available, blocking }] of Object.entries(eventsByDate)) {
        if (available.length === 0) continue;
        
        const bookedSlots = bookedSlotsByDate[dateStr] || new Set();
        const slots: string[] = [];
        
        const isSlotBlocked = (slotStart: Date, slotEnd: Date): boolean => {
          for (const blockingEvent of blocking) {
            const eventStart = new Date(blockingEvent.start.dateTime || blockingEvent.start.date);
            const eventEnd = new Date(blockingEvent.end.dateTime || blockingEvent.end.date);
            if (slotStart < eventEnd && slotEnd > eventStart) {
              return true;
            }
          }
          return false;
        };

        for (const event of available) {
          const eventStart = new Date(event.start.dateTime || event.start.date);
          const eventEnd = new Date(event.end.dateTime || event.end.date);
          
          let currentTime = new Date(eventStart);
          while (currentTime < eventEnd) {
            const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);
            
            if (slotEnd <= eventEnd && currentTime > now) {
              const timeStr = currentTime.toTimeString().slice(0, 5);
              
              if (!slots.includes(timeStr) && !bookedSlots.has(timeStr) && !isSlotBlocked(currentTime, slotEnd)) {
                slots.push(timeStr);
              }
            }
            
            currentTime = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);
          }
        }
        
        if (slots.length > 0) {
          slots.sort();
          slotsByDate[dateStr] = slots;
        }
      }

      console.log(`[JWT BATCH] ${Object.keys(slotsByDate).length} dates avec disponibilités`);
      return slotsByDate;
    } catch (error) {
      console.error("[JWT BATCH] Erreur:", error);
      return {};
    }
  }

  async bookAppointment(appointmentData: any): Promise<string | null> {
    if (!this.isInitialized) {
      throw new Error("Service Google Calendar non initialisé");
    }

    try {
      const { date, startTime, duration, patientName, patientEmail, patientPhone, reason } = appointmentData;
      
      // Construire la date/heure de début
      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      // Calculer l'heure de fin
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

      // ✅ TOUJOURS créer un NOUVEL événement dans Google Calendar
      // Ne pas modifier les événements DISPONIBLE existants
      console.log(`[JWT] Création d'un nouvel événement de rendez-vous dans Google Calendar`);
      
      let description = `📅 Rendez-vous confirmé avec ${patientName}`;
      if (reason) {
        description += `\n\n📋 Motif: ${reason}`;
      }
      description += `\n\n📧 Email: ${patientEmail}`;
      if (patientPhone) {
        description += `\n📱 Téléphone: ${patientPhone}`;
      }

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        resource: {
          summary: `🏥 RDV - ${patientName}`,
          description: description,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'Europe/Paris',
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'Europe/Paris',
          },
          attendees: [
            { email: patientEmail, displayName: patientName }
          ],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 1440 }, // 24h avant
              { method: 'popup', minutes: 60 }, // 1h avant
            ],
          },
          colorId: '11', // Rouge pour les rendez-vous réservés
          transparency: 'opaque', // Bloquer le créneau
          extendedProperties: {
            private: {
              isAppointment: 'true',
              patientName: patientName,
              patientEmail: patientEmail,
              source: 'webapp',
            },
          },
        },
        sendUpdates: 'all', // Notifier les participants par email
      });

      console.log('✅ Rendez-vous créé dans Google Calendar:', response.data.id);
      return response.data.id;
      
    } catch (error) {
      console.error("❌ Erreur lors de la création du rendez-vous:", error);
      throw error;
    }
  }
}

// Instance singleton du service JWT
let googleCalendarServiceInstance: GoogleCalendarJWTClient | null = null;

export function getGoogleCalendarService(): GoogleCalendarJWTClient | null {
  if (!googleCalendarServiceInstance) {
    googleCalendarServiceInstance = new GoogleCalendarJWTClient();
  }
  return googleCalendarServiceInstance;
}

// Export function to initialize on server startup
export async function initializeGoogleCalendarService(): Promise<void> {
  const service = getGoogleCalendarService();
  if (service) {
    await service.ensureInitialized();
  }
}

/**
 * Router pour la réservation de rendez-vous patient
 * Utilise Google Calendar Service Account JWT pour lire les disponibilités
 * et créer les rendez-vous avec une durée fixe de 60 minutes
 */

// Schéma de validation pour la réservation
// Compatible avec le format envoyé par OptimizedBookAppointment.tsx
const bookAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"), // Format YYYY-MM-DD
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide (HH:mm)"), // Format HH:mm
  patientInfo: z.object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(8, "Numéro de téléphone invalide (min 8 caractères)"),
    reason: z.string().optional(),
  }),
});

// Schéma pour récupérer les disponibilités
const getAvailabilitiesSchema = z.object({
  startDate: z.string().optional(), // Format YYYY-MM-DD
  endDate: z.string().optional(),   // Format YYYY-MM-DD
});

/**
 * Convertir un créneau de disponibilité en créneaux de 60 minutes
 */
function splitSlotInto60MinSlots(slot: any): any[] {
  const slotStart = new Date(`${slot.date}T${slot.startTime}:00`);
  const slotEnd = new Date(`${slot.date}T${slot.endTime}:00`);
  const durationMs = slotEnd.getTime() - slotStart.getTime();
  const durationMinutes = durationMs / (1000 * 60);
  
  const slots: any[] = [];
  const slotDuration = 60; // Durée fixe de 60 minutes
  
  // Générer les créneaux de 60 minutes
  for (let offset = 0; offset + slotDuration <= durationMinutes; offset += slotDuration) {
    const start = new Date(slotStart.getTime() + offset * 60 * 1000);
    const end = new Date(start.getTime() + slotDuration * 60 * 1000);
    
    slots.push({
      date: slot.date,
      startTime: start.toTimeString().slice(0, 5), // HH:mm
      endTime: end.toTimeString().slice(0, 5), // HH:mm
      duration: slotDuration,
      title: `Disponible (${slotDuration} min)`,
    });
  }
  
  return slots;
}

/**
 * Configuration des horaires de disponibilité par défaut du praticien
 * Utilisé comme fallback quand Google Calendar n'est pas configuré
 */
const DEFAULT_AVAILABILITY_CONFIG = {
  workDays: [1, 2, 3, 4, 5], // Lundi à vendredi (0 = dimanche, 6 = samedi)
  morningStart: "09:00",
  morningEnd: "12:00",
  afternoonStart: "14:00", 
  afternoonEnd: "18:00",
  slotDuration: 60, // minutes
};

/**
 * Générer les créneaux de disponibilité par défaut pour une date donnée
 * Utilisé comme fallback quand Google Calendar n'est pas disponible
 */
function generateDefaultSlotsForDate(date: Date): string[] {
  const dayOfWeek = date.getDay();
  const slots: string[] = [];
  const now = new Date();
  
  // Vérifier si c'est un jour de travail
  if (!DEFAULT_AVAILABILITY_CONFIG.workDays.includes(dayOfWeek)) {
    return [];
  }
  
  const dateStr = date.toISOString().split('T')[0];
  
  // Générer les créneaux du matin
  let [hours, minutes] = DEFAULT_AVAILABILITY_CONFIG.morningStart.split(':').map(Number);
  const [endMorningHours] = DEFAULT_AVAILABILITY_CONFIG.morningEnd.split(':').map(Number);
  
  while (hours < endMorningHours) {
    const slotTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const slotDateTime = new Date(`${dateStr}T${slotTime}:00`);
    
    // Ne pas inclure les créneaux passés
    if (slotDateTime > now) {
      slots.push(slotTime);
    }
    
    hours += 1; // Créneaux de 60 minutes
  }
  
  // Générer les créneaux de l'après-midi
  [hours, minutes] = DEFAULT_AVAILABILITY_CONFIG.afternoonStart.split(':').map(Number);
  const [endAfternoonHours] = DEFAULT_AVAILABILITY_CONFIG.afternoonEnd.split(':').map(Number);
  
  while (hours < endAfternoonHours) {
    const slotTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const slotDateTime = new Date(`${dateStr}T${slotTime}:00`);
    
    // Ne pas inclure les créneaux passés
    if (slotDateTime > now) {
      slots.push(slotTime);
    }
    
    hours += 1; // Créneaux de 60 minutes
  }
  
  return slots;
}

export const bookingRouter = router({
  /**
   * Récupérer les disponibilités depuis Google Calendar OAuth2
   * Retourne les créneaux de 60 minutes disponibles
   * Utilise un fallback avec les horaires par défaut si Google Calendar n'est pas configuré
   */
  getAvailabilities: publicProcedure
    .input(getAvailabilitiesSchema)
    .mutation(async ({ input }) => {
      console.log("[BookingRouter] Récupération des disponibilités");
      const service = getGoogleCalendarService();
      const useGoogleCalendar = service && service.isInitialized;
      
      if (!useGoogleCalendar) {
        console.log("[BookingRouter] Google Calendar non configuré, utilisation des créneaux par défaut");
      }

      try {
        const startDate = input.startDate ? new Date(input.startDate) : new Date();
        const endDate = input.endDate ? new Date(input.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

        const slots60Min: any[] = [];
        
        // Parcourir chaque jour de la période
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          let daySlots: string[];
          
          if (useGoogleCalendar) {
            // Utiliser Google Calendar si disponible
            daySlots = await service.getAvailableSlots(new Date(currentDate), 60);
          } else {
            // Utiliser les créneaux par défaut
            daySlots = generateDefaultSlotsForDate(new Date(currentDate));
          }
          
          for (const slotTime of daySlots) {
            slots60Min.push({
              date: currentDate.toISOString().split('T')[0],
              startTime: slotTime,
              endTime: `${(parseInt(slotTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
              duration: 60,
              title: "Disponible (60 min)",
            });
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(`[BookingRouter] ${slots60Min.length} créneaux trouvés`);

        return {
          success: true,
          slots: slots60Min,
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur:", error);
        throw new Error(`Impossible de récupérer les disponibilités: ${error.message}`);
      }
    }),

  /**
   * Récupérer les disponibilités groupées par date (OPTIMISE avec batch)
   * Filtre les créneaux déjà réservés par d'autres patients
   */
  getAvailabilitiesByDate: publicProcedure
    .input(getAvailabilitiesSchema)
    .mutation(async ({ input }) => {
      console.log("[BookingRouter BATCH] Récupération des disponibilités groupées par date");
      const service = getGoogleCalendarService();
      const useGoogleCalendar = service && service.isInitialized;
      
      if (!useGoogleCalendar) {
        console.log("[BookingRouter] Google Calendar non configuré, utilisation des créneaux par défaut");
      }

      try {
        const startDate = input.startDate ? new Date(input.startDate) : new Date();
        const endDate = input.endDate ? new Date(input.endDate) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        const slotsByDate: Record<string, any[]> = {};
        
        if (useGoogleCalendar) {
          const rawSlotsByDate = await service.getAllAvailableSlotsForRange(startDate, endDate, 60);
          
          for (const [dateStr, slots] of Object.entries(rawSlotsByDate)) {
            slotsByDate[dateStr] = slots.map(slotTime => ({
              date: dateStr,
              startTime: slotTime,
              endTime: `${(parseInt(slotTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
              duration: 60,
              title: "Disponible (60 min)",
            }));
          }
        } else {
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const daySlots = generateDefaultSlotsForDate(new Date(currentDate));
            
            if (daySlots.length > 0) {
              const dateStr = currentDate.toISOString().split('T')[0];
              slotsByDate[dateStr] = daySlots.map(slotTime => ({
                date: dateStr,
                startTime: slotTime,
                endTime: `${(parseInt(slotTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
                duration: 60,
                title: "Disponible (60 min)",
              }));
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }

        console.log(`[BookingRouter BATCH] ✅ ${Object.keys(slotsByDate).length} dates disponibles`);

        return {
          success: true,
          slotsByDate,
          availableDates: Object.keys(slotsByDate).sort(),
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur:", error);
        throw new Error(`Impossible de récupérer les disponibilités: ${error.message}`);
      }
    }),

  /**
   * Réserver un rendez-vous (Service Account JWT avec fallback)
   * Crée un événement dans Google Calendar et envoie les emails de confirmation
   */
  bookAppointment: publicProcedure
    .input(bookAppointmentSchema)
    .mutation(async ({ input }) => {
      console.log('[BookingRouter] 📥 Données reçues pour réservation:', JSON.stringify(input, null, 2));
      
      const service = getGoogleCalendarService();
      const fallbackService = getGoogleCalendarIcalService();
      
      // Extraire les données du patientInfo
      const { firstName, lastName, email, phone, reason } = input.patientInfo;
      const startTime = input.time; // Renommer 'time' en 'startTime' pour cohérence
      
      try {
        // Calculer l'heure de fin (60 minutes après le début)
        const appointmentDate = new Date(input.date);
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDateTime = new Date(appointmentDate);
        startDateTime.setHours(hours, minutes, 0, 0);
        
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +60 minutes
        const endTime = endDateTime.toTimeString().slice(0, 5); // HH:mm

        let eventId: string | null = null;

        // Essayer avec le service Service Account JWT d'abord
        if (service && service.isInitialized) {
          try {
            console.log("[BookingRouter] Tentative de réservation avec service JWT...");
            
            eventId = await service.bookAppointment({
              date: appointmentDate,
              startTime: startTime,
              duration: 60,
              patientName: `${firstName} ${lastName}`,
              patientEmail: email,
              patientPhone: phone,
              reason: reason,
            });

            if (eventId) {
              console.log("[BookingRouter] ✅ Rendez-vous créé avec JWT:", eventId);
            }
          } catch (jwtError: any) {
            console.warn("[BookingRouter] ⚠️ Erreur JWT, tentative fallback iCal:", jwtError.message);
          }
        }

        // Fallback vers l'ancien service iCal si OAuth2 échoue
        if (!eventId && fallbackService) {
          try {
            console.log("[BookingRouter] Tentative de réservation avec service iCal fallback...");
            
            eventId = await fallbackService.bookAppointment({
              patientName: `${firstName} ${lastName}`,
              patientEmail: email,
              patientPhone: phone,
              date: appointmentDate,
              startTime: startTime,
              endTime: endTime,
              reason: reason,
            });

            if (eventId) {
              console.log("[BookingRouter] ✅ Rendez-vous créé avec iCal fallback:", eventId);
            }
          } catch (icalError: any) {
            console.error("[BookingRouter] ❌ Erreur service iCal fallback:", icalError);
          }
        }

        // Si aucun service Google Calendar n'est disponible, générer un ID local
        if (!eventId) {
          console.log("[BookingRouter] Aucun service Google Calendar disponible, création d'un ID local");
          // Générer un ID unique basé sur la date et l'heure
          const timestamp = Date.now();
          const randomPart = Math.random().toString(36).substring(2, 9);
          eventId = `local_${timestamp}_${randomPart}`;
          console.log("[BookingRouter] ✅ Rendez-vous créé localement avec ID:", eventId);
        }

        // ✅ SAUVEGARDER LE RENDEZ-VOUS EN BASE DE DONNÉES
        try {
          const { getDb } = await import("./db");
          const db = await getDb();
          const { appointments } = await import("../drizzle/schema");
          
          const result = await db
            .insert(appointments)
            .values({
              practitionerId: 1,
              serviceId: 1,
              startTime: startDateTime,
              endTime: endDateTime,
              status: "confirmed",
              customerName: `${firstName} ${lastName}`,
              customerEmail: email,
              customerPhone: phone,
              notes: reason || "",
              googleEventId: eventId,
            });
          
          console.log(`[BookingRouter] ✅ Rendez-vous CONFIRMÉ en BD: ${startDateTime.toISOString()} - ${email}`);
        } catch (dbError: any) {
          console.error("[BookingRouter] ❌ Erreur sauvegarde BD:", dbError.message);
          throw new Error(`Erreur lors de la sauvegarde: ${dbError.message}`);
        }

        // Envoyer les notifications selon la préférence du patient
        const sendNotifications = input.sendNotifications || 'both';
        const notificationResults: { email?: string; sms?: string } = {};

        // Envoyer l'email si demandé
        if (sendNotifications === 'email' || sendNotifications === 'both') {
          try {
            const { sendAppointmentConfirmationEmail } = await import("./services/emailService");
            
            const emailResult = await sendAppointmentConfirmationEmail({
              patientName: `${input.firstName} ${input.lastName}`,
              patientEmail: input.email,
              practitionerName: "Dorian Sarry",
              date: appointmentDate,
              startTime: input.startTime,
              endTime: endTime,
              reason: input.reason || "",
              location: "Cabinet - Voir email pour l'adresse exacte",
              appointmentHash: eventId,
            });

            if (!emailResult.success) {
              console.warn("[BookingRouter] ⚠️ Email de confirmation non envoyé:", emailResult.error);
              notificationResults.email = `Erreur: ${emailResult.error}`;
            } else {
              console.log("[BookingRouter] ✅ Email de confirmation envoyé:", emailResult.messageId);
              notificationResults.email = "✅ Email envoyé";
            }
          } catch (emailError: any) {
            console.error("[BookingRouter] ❌ Erreur lors de l'envoi de l'email:", emailError);
            notificationResults.email = `Erreur: ${emailError.message}`;
          }
        }

        // Envoyer le SMS si demandé
        if (sendNotifications === 'sms' || sendNotifications === 'both') {
          try {
            const { sendAppointmentSMS } = await import("./services/smsService");
            
            const smsResult = await sendAppointmentSMS({
              patientName: `${input.firstName} ${input.lastName}`,
              patientPhone: input.phone,
              date: appointmentDate,
              startTime: input.startTime,
              endTime: endTime,
              practitionerName: "Dorian Sarry",
            });

            if (!smsResult.success) {
              console.warn("[BookingRouter] ⚠️ SMS de confirmation non envoyé:", smsResult.error);
              notificationResults.sms = `Erreur: ${smsResult.error}`;
            } else {
              console.log("[BookingRouter] ✅ SMS de confirmation envoyé:", smsResult.messageId);
              notificationResults.sms = "✅ SMS envoyé";
            }
          } catch (smsError: any) {
            console.error("[BookingRouter] ❌ Erreur lors de l'envoi du SMS:", smsError);
            notificationResults.sms = `Erreur: ${smsError.message}`;
          }
        }

        return {
          success: true,
          eventId,
          message: "Rendez-vous confirmé ! Vous allez recevoir une confirmation.",
          notificationStatus: notificationResults,
          appointmentDetails: {
            date: input.date,
            startTime: startTime,
            endTime: endTime,
            duration: 60,
            patientName: `${firstName} ${lastName}`,
            patientEmail: email,
          },
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur lors de la réservation:", error);
        throw new Error(error.message || "Impossible de réserver le rendez-vous");
      }
    }),

  /**
   * Vérifier si un créneau spécifique est disponible (Service Account JWT avec fallback)
   */
  checkAvailability: publicProcedure
    .input(z.object({
      date: z.string(),
      startTime: z.string(),
    }))
    .query(async ({ input }) => {
      const service = getGoogleCalendarService();
      const fallbackService = getGoogleCalendarIcalService();
      
      try {
        // Calculer l'heure de fin (60 minutes)
        const [hours, minutes] = input.startTime.split(':').map(Number);
        const startDateTime = new Date(`${input.date}T${input.startTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
        const endTime = endDateTime.toTimeString().slice(0, 5);

        let isAvailable = false;

        // Essayer avec le service OAuth2 d'abord
        if (service && service.isInitialized) {
          try {
            const availableSlots = await service.getAvailableSlots(startDateTime, 60);
            isAvailable = availableSlots.includes(input.startTime);
            
            if (isAvailable) {
              console.log("[BookingRouter] Créneau disponible confirmé via OAuth2");
            }
          } catch (oauthError: any) {
            console.warn("[BookingRouter] Erreur vérification OAuth2:", oauthError.message);
          }
        }

        // Fallback vers l'ancien service iCal si OAuth2 échoue ou si pas disponible
        if (!isAvailable && fallbackService) {
          try {
            isAvailable = await fallbackService.isSlotAvailable(input.date, input.startTime, endTime);
            
            if (isAvailable) {
              console.log("[BookingRouter] Créneau disponible confirmé via iCal fallback");
            }
          } catch (icalError: any) {
            console.error("[BookingRouter] Erreur vérification iCal fallback:", icalError);
          }
        }

        return {
          success: true,
          available: isAvailable,
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur lors de la vérification:", error);
        return {
          success: false,
          available: false,
          error: error.message,
        };
      }
    }),

  /**
   * Health check pour vérifier l'état du service
   */
  healthCheck: publicProcedure
    .input(z.object({}))
    .query(async () => {
      const service = getGoogleCalendarService();
      const fallbackService = getGoogleCalendarIcalService();

      return {
        success: true,
        oauth2Available: service?.isInitialized || false,
        icalAvailable: !!fallbackService,
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Récupérer les créneaux disponibles pour une date spécifique
   */
  getAvailableSlots: publicProcedure
    .input(z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Format YYYY-MM-DD
    }))
    .query(async ({ input }) => {
      const service = getGoogleCalendarService();
      const fallbackService = getGoogleCalendarIcalService();

      try {
        const targetDate = new Date(input.date);
        let availableSlots: string[] = [];

        // Essayer avec OAuth2 d'abord
        if (service && service.isInitialized) {
          try {
            availableSlots = await service.getAvailableSlots(targetDate, 60);
            console.log(`[BookingRouter] OAuth2: ${availableSlots.length} créneaux trouvés pour ${input.date}`);
          } catch (oauthError: any) {
            console.warn("[BookingRouter] Erreur OAuth2, utilisation fallback iCal:", oauthError.message);
          }
        }

        // Fallback vers iCal si OAuth2 échoue
        if (availableSlots.length === 0 && fallbackService) {
          try {
            const dayStart = new Date(targetDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(targetDate);
            dayEnd.setHours(23, 59, 59, 999);

            const slots = await fallbackService.getAvailableSlots(dayStart, dayEnd);
            availableSlots = slots
              .filter(slot => slot.date === input.date)
              .map(slot => slot.startTime);

            console.log(`[BookingRouter] iCal: ${availableSlots.length} créneaux trouvés pour ${input.date}`);
          } catch (icalError: any) {
            console.error("[BookingRouter] Erreur iCal fallback:", icalError);
          }
        }

        return {
          success: true,
          availableSlots,
          date: input.date,
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur lors de la récupération des créneaux:", error);
        return {
          success: false,
          availableSlots: [],
          error: error.message,
        };
      }
    }),
});
