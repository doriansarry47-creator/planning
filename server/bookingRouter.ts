import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { google } from "googleapis";
import { getGoogleCalendarIcalService } from "./services/googleCalendarIcal";

/**
 * Service Google Calendar OAuth2 pour doriansarry47@gmail.com
 * Utilise OAuth2 avec refresh token pour lire/écrire dans Google Calendar
 */
class OptimizedGoogleCalendarService {
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
      console.log("🔑 Initialisation Google Calendar OAuth2 pour doriansarry47@gmail.com");
      
      // Configuration OAuth2 avec refresh token
      const clientId = "407408718192.apps.googleusercontent.com";
      const clientSecret = "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"; // OAuth2 client secret
      const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
      
      if (!refreshToken) {
        console.warn("⚠️ GOOGLE_CALENDAR_REFRESH_TOKEN manquant");
        this.isInitialized = false;
        return;
      }
      
      console.log("📝 Refresh token trouvé, création du client OAuth2...");
      
      // Initialiser OAuth2 client avec credentials
      this.auth = new google.auth.OAuth2(clientId, clientSecret);
      
      // Utiliser le refresh token directement
      this.auth.setCredentials({
        refresh_token: refreshToken
      });
      
      // Configuration pour calendrier - l'auth lib gérera automatiquement les refresh
      this.calendar = google.calendar({
        version: 'v3',
        auth: this.auth
      });
      
      this.isInitialized = true;
      console.log("✅ Google Calendar OAuth2 initialisé avec succès");
      console.log("📍 Calendrier configuré: doriansarry47@gmail.com");
      
    } catch (error) {
      console.error("❌ Erreur initialisation Google Calendar OAuth2:", error);
      this.isInitialized = false;
    }
  }

  async ensureInitialized(): Promise<void> {
    await this.initPromise;
  }

  async getAvailableSlots(date: Date, durationMinutes: number = 60): Promise<string[]> {
    if (!this.isInitialized) {
      console.warn("⚠️ Google Calendar non initialisé");
      return [];
    }

    try {
      console.log(`[OAuth2] Recherche des créneaux disponibles pour ${date.toISOString().split('T')[0]}`);
      
      // Définir la plage horaire (9h-17h)
      const dayStart = new Date(date);
      dayStart.setHours(9, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(17, 0, 0, 0);

      // Récupérer les événements du calendrier
      const response = await this.calendar.events.list({
        calendarId: this.calendarEmail,
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        singleEvents: true,
      });

      const events = response.data.items || [];
      console.log(`[OAuth2] ${events.length} événements trouvés`);
      
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
                console.log(`[OAuth2] ✅ Créneau ajouté: ${timeStr} (${event.summary})`);
              }
            }
            currentTime.setMinutes(currentTime.getMinutes() + 60);
          }
        }
      }

      slots.sort();
      console.log(`[OAuth2] Total: ${slots.length} créneaux disponibles`);
      return slots;
    } catch (error) {
      console.error("⚠️ Erreur OAuth2:", error);
      return [];
    }
  }

  private getDefaultAvailableSlots(date: Date): string[] {
    // Créneaux par défaut si OAuth2 n'est pas configuré
    return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  }

  async bookAppointment(appointmentData: any): Promise<string | null> {
    if (!this.isInitialized) {
      throw new Error("Service Google Calendar OAuth2 non initialisé");
    }

    try {
      const { date, startTime, duration, patientName, patientEmail, patientPhone, reason } = appointmentData;
      
      // Construire la date/heure de début
      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      // Calculer l'heure de fin
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

      // Vérifier que le créneau est toujours libre
      const events = await this.calendar.events.list({
        calendarId: this.calendarEmail,
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        singleEvents: true,
      });

      if (events.data.items && events.data.items.length > 0) {
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

      // Créer l'événement
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
        attendees: [
          { email: patientEmail, displayName: patientName },
        ],
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

      // Créer le rendez-vous
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

// Instance singleton du service OAuth2
let optimizedServiceInstance: OptimizedGoogleCalendarService | null = null;

function getOptimizedGoogleCalendarService(): OptimizedGoogleCalendarService | null {
  if (!optimizedServiceInstance) {
    optimizedServiceInstance = new OptimizedGoogleCalendarService();
  }
  return optimizedServiceInstance;
}

// Export function to initialize on server startup
export async function initializeGoogleCalendarService(): Promise<void> {
  const service = getOptimizedGoogleCalendarService();
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
const bookAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Format YYYY-MM-DD
  startTime: z.string().regex(/^\d{2}:\d{2}$/), // Format HH:mm
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  reason: z.string().optional(),
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
    .query(async ({ input }) => {
      const service = getOptimizedGoogleCalendarService();
      
      if (service) {
        await service.ensureInitialized();
      }
      
      if (!service || !service.isInitialized) {
        console.warn("[BookingRouter] Service OAuth2 non initialisé, utilisation service iCal fallback");
        // Fallback vers l'ancien service iCal
        const fallbackService = getGoogleCalendarIcalService();
        if (!fallbackService) {
          throw new Error("Aucun service Google Calendar configuré");
        }

        try {
          const startDate = input.startDate ? new Date(input.startDate) : undefined;
          const endDate = input.endDate ? new Date(input.endDate) : undefined;

          const availableSlots = await fallbackService.getAvailableSlots(startDate, endDate);
          
          const slots60Min: any[] = [];
          for (const slot of availableSlots) {
            const minuteSlots = splitSlotInto60MinSlots(slot);
            slots60Min.push(...minuteSlots);
          }

          return {
            success: true,
            slots: slots60Min,
          };
        } catch (error: any) {
          console.error("[BookingRouter] Erreur service iCal fallback:", error);
          throw new Error(`Impossible de récupérer les disponibilités: ${error.message}`);
        }
      }

      try {
        const startDate = input.startDate ? new Date(input.startDate) : new Date();
        const endDate = input.endDate ? new Date(input.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

        const slots60Min: any[] = [];
        
        // Parcourir chaque jour de la période
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const availableSlots = await service.getAvailableSlots(new Date(currentDate), 60);
          
          for (const slotTime of availableSlots) {
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

        console.log(`[BookingRouter OAuth2] ${slots60Min.length} créneaux de 60min trouvés`);

        return {
          success: true,
          slots: slots60Min,
        };
      } catch (error: any) {
        console.error("[BookingRouter OAuth2] Erreur lors de la récupération des disponibilités:", error);
        throw new Error(`Impossible de récupérer les disponibilités: ${error.message}`);
      }
    }),

  /**
   * Récupérer les disponibilités groupées par date (OAuth2)
   * Retourne un objet avec les dates comme clés et les créneaux comme valeurs
   */
  getAvailabilitiesByDate: publicProcedure
    .input(getAvailabilitiesSchema)
    .query(async ({ input }) => {
      const service = getOptimizedGoogleCalendarService();
      
      if (service) {
        await service.ensureInitialized();
      }
      
      if (!service || !service.isInitialized) {
        console.warn("[BookingRouter] Service OAuth2 non initialisé, utilisation service iCal fallback");
        // Fallback vers l'ancien service iCal
        const fallbackService = getGoogleCalendarIcalService();
        if (!fallbackService) {
          throw new Error("Aucun service Google Calendar configuré");
        }

        try {
          const startDate = input.startDate ? new Date(input.startDate) : undefined;
          const endDate = input.endDate ? new Date(input.endDate) : undefined;

          const availableSlots = await fallbackService.getAvailableSlots(startDate, endDate);
          
          const slotsByDate: Record<string, any[]> = {};
          
          for (const slot of availableSlots) {
            const minuteSlots = splitSlotInto60MinSlots(slot);
            
            for (const minSlot of minuteSlots) {
              if (!slotsByDate[minSlot.date]) {
                slotsByDate[minSlot.date] = [];
              }
              slotsByDate[minSlot.date].push(minSlot);
            }
          }

          Object.keys(slotsByDate).forEach(date => {
            slotsByDate[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
          });

          return {
            success: true,
            slotsByDate,
            availableDates: Object.keys(slotsByDate).sort(),
          };
        } catch (error: any) {
          console.error("[BookingRouter] Erreur service iCal fallback:", error);
          throw new Error(`Impossible de récupérer les disponibilités: ${error.message}`);
        }
      }

      try {
        const startDate = input.startDate ? new Date(input.startDate) : new Date();
        const endDate = input.endDate ? new Date(input.endDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

        const slotsByDate: Record<string, any[]> = {};
        
        // Parcourir chaque jour de la période
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const availableSlots = await service.getAvailableSlots(new Date(currentDate), 60);
          
          const dateStr = currentDate.toISOString().split('T')[0];
          slotsByDate[dateStr] = [];
          
          for (const slotTime of availableSlots) {
            const startHour = parseInt(slotTime.split(':')[0]);
            const endHour = startHour + 1;
            
            slotsByDate[dateStr].push({
              date: dateStr,
              startTime: slotTime,
              endTime: `${endHour.toString().padStart(2, '0')}:00`,
              duration: 60,
              title: "Disponible (60 min)",
            });
          }
          
          // Trier les créneaux de la journée
          slotsByDate[dateStr].sort((a, b) => a.startTime.localeCompare(b.startTime));
          
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Supprimer les dates sans créneaux
        Object.keys(slotsByDate).forEach(date => {
          if (slotsByDate[date].length === 0) {
            delete slotsByDate[date];
          }
        });

        console.log(`[BookingRouter OAuth2] Disponibilités groupées pour ${Object.keys(slotsByDate).length} dates`);

        return {
          success: true,
          slotsByDate,
          availableDates: Object.keys(slotsByDate).sort(),
        };
      } catch (error: any) {
        console.error("[BookingRouter OAuth2] Erreur lors de la récupération des disponibilités:", error);
        throw new Error(`Impossible de récupérer les disponibilités: ${error.message}`);
      }
    }),

  /**
   * Réserver un rendez-vous (OAuth2 avec fallback)
   * Crée un événement dans Google Calendar et envoie les emails de confirmation
   */
  bookAppointment: publicProcedure
    .input(bookAppointmentSchema)
    .mutation(async ({ input }) => {
      const service = getOptimizedGoogleCalendarService();
      const fallbackService = getGoogleCalendarIcalService();
      
      try {
        // Calculer l'heure de fin (60 minutes après le début)
        const appointmentDate = new Date(input.date);
        const [hours, minutes] = input.startTime.split(':').map(Number);
        const startDateTime = new Date(appointmentDate);
        startDateTime.setHours(hours, minutes, 0, 0);
        
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +60 minutes
        const endTime = endDateTime.toTimeString().slice(0, 5); // HH:mm

        let eventId: string | null = null;

        // Essayer avec le service OAuth2 d'abord
        if (service && service.isInitialized) {
          try {
            console.log("[BookingRouter] Tentative de réservation avec service OAuth2...");
            
            eventId = await service.bookAppointment({
              date: appointmentDate,
              startTime: input.startTime,
              duration: 60,
              patientName: `${input.firstName} ${input.lastName}`,
              patientEmail: input.email,
              patientPhone: input.phone,
              reason: input.reason,
            });

            if (eventId) {
              console.log("[BookingRouter] ✅ Rendez-vous créé avec OAuth2:", eventId);
            }
          } catch (oauthError: any) {
            console.warn("[BookingRouter] ⚠️ Erreur OAuth2, tentative fallback iCal:", oauthError.message);
          }
        }

        // Fallback vers l'ancien service iCal si OAuth2 échoue
        if (!eventId && fallbackService) {
          try {
            console.log("[BookingRouter] Tentative de réservation avec service iCal fallback...");
            
            eventId = await fallbackService.bookAppointment({
              patientName: `${input.firstName} ${input.lastName}`,
              patientEmail: input.email,
              patientPhone: input.phone,
              date: appointmentDate,
              startTime: input.startTime,
              endTime: endTime,
              reason: input.reason,
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
            patientName: `${input.firstName} ${input.lastName}`,
            patientEmail: input.email,
            practitionerName: "Dorian Sarry",
            date: appointmentDate,
            startTime: input.startTime,
            endTime: endTime,
            reason: input.reason || "",
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
            startTime: input.startTime,
            endTime: endTime,
            duration: 60,
            patientName: `${input.firstName} ${input.lastName}`,
            patientEmail: input.email,
          },
        };
      } catch (error: any) {
        console.error("[BookingRouter] Erreur lors de la réservation:", error);
        throw new Error(error.message || "Impossible de réserver le rendez-vous");
      }
    }),

  /**
   * Vérifier si un créneau spécifique est disponible (OAuth2 avec fallback)
   */
  checkAvailability: publicProcedure
    .input(z.object({
      date: z.string(),
      startTime: z.string(),
    }))
    .query(async ({ input }) => {
      const service = getOptimizedGoogleCalendarService();
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
});
