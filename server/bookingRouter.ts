import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { google } from "googleapis";
import { getGoogleCalendarIcalService } from "./services/googleCalendarIcal";

/**
 * Service Google Calendar utilisant JWT du Service Account
 * Lecture directe du calendrier personnel en tant que Service Account
 */
class GoogleCalendarServiceAccount {
  private calendar: any;
  private auth: any;
  public isInitialized = false;
  private calendarEmail = "doriansarry47@gmail.com";
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initializeCalendar();
  }

  private async initializeCalendar() {
    try {
      console.log("🔑 Initialisation Google Calendar avec Service Account JWT");
      
      // Try both possible private key variable names
      let privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY || "";
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
      
      if (!privateKey || !serviceAccountEmail) {
        console.warn("⚠️ Clé privée ou email Service Account manquant");
        this.isInitialized = false;
        return;
      }
      
      // Nettoyer le format de la clé
      privateKey = privateKey
        .replace(/^["']|["']$/g, '') // Remove quotes if present
        .replace(/\\n/g, '\n') // Convert escaped newlines
        .trim();
      
      console.log(`📍 Clé privée length: ${privateKey.length}, starts with: ${privateKey.substring(0, 30)}`);
      
      // Créer un client JWT avec la clé privée du Service Account
      this.auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar'], // Accès complet (lecture/écriture)
      });
      
      // Configuration pour calendrier
      this.calendar = google.calendar({
        version: 'v3',
        auth: this.auth
      });
      
      this.isInitialized = true;
      console.log("✅ Google Calendar Service Account JWT initialisé avec succès");
      console.log(`📍 Service Account: ${serviceAccountEmail}`);
      console.log(`📍 Calendrier: ${this.calendarEmail}`);
      
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
      console.warn("⚠️ Google Calendar Service Account non initialisé");
      return [];
    }

    try {
      console.log(`[ServiceAccount] Recherche des créneaux disponibles pour ${date.toISOString().split('T')[0]}`);
      
      // Définir la plage horaire (7h-22h pour inclure les créneaux du soir)
      const dayStart = new Date(date);
      dayStart.setHours(7, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(22, 0, 0, 0);

      // Récupérer les événements du calendrier
      const response = await this.calendar.events.list({
        calendarId: this.calendarEmail,
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        singleEvents: true,
      });

      const events = response.data.items || [];
      console.log(`[ServiceAccount] ${events.length} événements trouvés`);
      
      const slots: string[] = [];

      // Chercher les événements marqués comme "DISPONIBLE"
      for (const event of events) {
        const title = event.summary?.toLowerCase() || '';
        const isAvailable = 
          title.includes('disponible') || 
          title.includes('available') || 
          title.includes('dispo');

        if (isAvailable) {
          const eventStart = new Date(event.start.dateTime || event.start.date);
          const eventEnd = new Date(event.end.dateTime || event.end.date);
          
          // Générer les créneaux de 60 minutes dans ce créneau disponible
          let currentTime = new Date(eventStart);
          while (currentTime < eventEnd) {
            const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);
            if (slotEnd <= eventEnd) {
              const timeStr = currentTime.toTimeString().slice(0, 5);
              if (!slots.includes(timeStr)) {
                slots.push(timeStr);
                console.log(`[ServiceAccount] ✅ Créneau ajouté: ${timeStr} (${event.summary})`);
              }
            }
            currentTime.setMinutes(currentTime.getMinutes() + 60);
          }
        }
      }

      slots.sort();
      console.log(`[ServiceAccount] Total: ${slots.length} créneaux disponibles`);
      return slots;
    } catch (error) {
      console.error("⚠️ Erreur ServiceAccount:", error);
      return [];
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

      // Vérifier que le créneau est toujours libre (ignorer les événements "DISPONIBLE")
      const events = await this.calendar.events.list({
        calendarId: this.calendarEmail,
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        singleEvents: true,
      });

      // Filtrer pour voir s'il y a d'autres événements (pas juste "DISPONIBLE")
      const blockedEvents = events.data.items?.filter(e => {
        const title = (e.summary || '').toLowerCase();
        const isAvailable = title.includes('disponible') || title.includes('available') || title.includes('dispo');
        return !isAvailable;
      });

      if (blockedEvents && blockedEvents.length > 0) {
        throw new Error("Ce créneau n'est plus disponible");
      }

      // Construire la description de l'événement
      let description = `📅 Rendez-vous confirmé avec ${patientName}`;
      if (reason) {
        description += `\n\n📋 Motif: ${reason}`;
      }
      description += `\n\n📧 Email: ${patientEmail}`;
      if (patientPhone) {
        description += `\n📱 Téléphone: ${patientPhone}`;
      }

      // Créer l'événement (sans attendees car le Service Account n'a pas les permissions Domain-Wide Delegation)
      const event = {
        summary: `🩺 Consultation - ${patientName}`,
        description: description,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 }, // 24h avant
            { method: 'popup', minutes: 60 }, // 1h avant
          ],
        },
        colorId: '2', // Vert pour les rendez-vous
        transparency: 'opaque', // Bloquer le créneau
      };

      // Créer le rendez-vous (sendUpdates n'enverra pas de notifications aux attendees car on n'en a pas)
      const response = await this.calendar.events.insert({
        calendarId: this.calendarEmail,
        resource: event,
        sendUpdates: 'all', // Notifier les participants
      });

      console.log('✅ Rendez-vous créé:', response.data.id);
      return response.data.id;
      
    } catch (error) {
      console.error("❌ Erreur lors de la création du rendez-vous:", error);
      throw error;
    }
  }
}

// Instance singleton du service Service Account
let googleCalendarServiceInstance: GoogleCalendarServiceAccount | null = null;

export function getGoogleCalendarService(): GoogleCalendarServiceAccount | null {
  if (!googleCalendarServiceInstance) {
    googleCalendarServiceInstance = new GoogleCalendarServiceAccount();
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
 * Utilise Google Calendar OAuth2 pour lire les disponibilités
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

export const bookingRouter = router({
  /**
   * Récupérer les disponibilités depuis Google Calendar OAuth2
   * Retourne les créneaux de 60 minutes disponibles
   */
  getAvailabilities: publicProcedure
    .input(getAvailabilitiesSchema)
    .mutation(async ({ input }) => {
      console.log("[BookingRouter] Récupération des disponibilités via Service Account JWT");
      const service = getGoogleCalendarService();
      
      if (!service || !service.isInitialized) {
        console.warn("[BookingRouter] Service Account non initialisé");
        throw new Error("Service Google Calendar non disponible");
      }

      try {
        const startDate = input.startDate ? new Date(input.startDate) : new Date();
        const endDate = input.endDate ? new Date(input.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

        const slots60Min: any[] = [];
        
        // Parcourir chaque jour de la période
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const daySlots = await service.getAvailableSlots(new Date(currentDate), 60);
          
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
        console.error("[BookingRouter] Erreur Service Account:", error);
        throw new Error(`Impossible de récupérer les disponibilités: ${error.message}`);
      }
    }),

  /**
   * Récupérer les disponibilités groupées par date (Service Account JWT)
   * Retourne un objet avec les dates comme clés et les créneaux comme valeurs
   */
  getAvailabilitiesByDate: publicProcedure
    .input(getAvailabilitiesSchema)
    .mutation(async ({ input }) => {
      console.log("[BookingRouter] Récupération des disponibilités groupées par date via Service Account JWT");
      const service = getGoogleCalendarService();
      
      if (!service || !service.isInitialized) {
        console.warn("[BookingRouter] Service Account non initialisé");
        throw new Error("Service Google Calendar non disponible");
      }

      try {
        const startDate = input.startDate ? new Date(input.startDate) : new Date();
        const endDate = input.endDate ? new Date(input.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

        const slotsByDate: Record<string, any[]> = {};
        
        // Parcourir chaque jour de la période
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const daySlots = await service.getAvailableSlots(new Date(currentDate), 60);
          
          if (daySlots.length > 0) {
            const dateStr = currentDate.toISOString().split('T')[0];
            slotsByDate[dateStr] = [];
            
            for (const slotTime of daySlots) {
              slotsByDate[dateStr].push({
                date: dateStr,
                startTime: slotTime,
                endTime: `${(parseInt(slotTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
                duration: 60,
                title: "Disponible (60 min)",
              });
            }
            
            slotsByDate[dateStr].sort((a, b) => a.startTime.localeCompare(b.startTime));
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(`[BookingRouter] ${Object.keys(slotsByDate).length} dates avec disponibilités trouvées`);

        return {
          success: true,
          slotsByDate,
          availableDates: Object.keys(slotsByDate).sort(),
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur Service Account:", error);
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

        if (!eventId) {
          throw new Error("Impossible de créer le rendez-vous avec aucun des services disponibles");
        }

        // Envoyer l'email de confirmation
        try {
          const { sendAppointmentConfirmationEmail } = await import("./services/emailService");
          
          const emailResult = await sendAppointmentConfirmationEmail({
            patientName: `${firstName} ${lastName}`,
            patientEmail: email,
            practitionerName: "Dorian Sarry",
            date: appointmentDate,
            startTime: startTime,
            endTime: endTime,
            reason: reason || "",
            location: "Cabinet - Voir email pour l'adresse exacte",
            appointmentHash: eventId, // Utiliser l'eventId comme hash pour l'annulation
          });

          if (!emailResult.success) {
            console.warn("[BookingRouter] ⚠️ Email de confirmation non envoyé:", emailResult.error);
          } else {
            console.log("[BookingRouter] ✅ Email de confirmation envoyé:", emailResult.messageId);
          }
        } catch (emailError: any) {
          console.error("[BookingRouter] ❌ Erreur lors de l'envoi de l'email:", emailError);
          // Ne pas bloquer la réservation si l'email échoue
        }

        return {
          success: true,
          eventId,
          message: "Rendez-vous confirmé ! Un email de confirmation vous a été envoyé.",
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
