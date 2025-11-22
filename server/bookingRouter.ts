import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { google } from "googleapis";

/**
 * Service Google Calendar OAuth2 pour doriansarry47@gmail.com
 * Utilise OAuth2 avec refresh token pour lire/écrire dans Google Calendar
 */
class OptimizedGoogleCalendarService {
  private calendar: any;
  private auth: any;
  private isInitialized = false;
  
  // Configuration OAuth2 pour doriansarry47@gmail.com
  public clientId = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
  public clientSecret = process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET";
  public redirectUri = "https://planning-7qkb7uw7v-ikips-projects.vercel.app/api/oauth/callback";
  private calendarEmail = "doriansarry47@gmail.com";

  constructor() {
    this.initializeCalendar();
  }

  private async initializeCalendar() {
    try {
      console.log("🔑 Initialisation Google Calendar OAuth2 pour doriansarry47@gmail.com");
      
      // Initialiser OAuth2 client
      this.auth = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
      
      // Configuration pour calendrier de doriansarry47@gmail.com
      this.calendar = google.calendar({
        version: 'v3',
        auth: this.auth
      });
      
      // Tentative d'authentification avec le refresh token stocké
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
      if (!refreshToken) {
        console.log("⚠️ GOOGLE_REFRESH_TOKEN manquant - OAuth2 requis");
        this.isInitialized = false;
        return;
      }
      
      this.auth.setCredentials({
        refresh_token: refreshToken
      });
      
      // Générer un access token valide
      const { credentials } = await this.auth.refreshAccessToken();
      this.auth.setCredentials(credentials);
      
      console.log("✅ Google Calendar OAuth2 initialisé pour doriansarry47@gmail.com");
      this.isInitialized = true;
      
    } catch (error) {
      console.error("❌ Erreur initialisation Google Calendar OAuth2:", error);
      this.isInitialized = false;
    }
  }

  async getAvailableSlots(date: Date, durationMinutes: number = 60): Promise<string[]> {
    if (!this.isInitialized) {
      console.warn("⚠️ Google Calendar non initialisé - utilisation des créneaux par défaut");
      return this.getDefaultAvailableSlots(date);
    }

    try {
      // Définir la plage horaire (9h-17h)
      const dayStart = new Date(date);
      dayStart.setHours(9, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(17, 0, 0, 0);

      // Récupérer les événements existants pour ce jour
      const events = await this.calendar.events.list({
        calendarId: this.calendarEmail,
        timeMin: dayStart.toISOString(),
        timeMax: dayEnd.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });

      // Créer une liste de tous les créneaux possibles (9h-17h, toutes les heures)
      const allPossibleSlots = [];
      for (let hour = 9; hour < 17; hour++) {
        allPossibleSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      }

      // Filtrer les créneaux pris par des événements existants
      const busySlots = events.data.items?.map(event => {
        const startTime = event.start.dateTime || event.start.date;
        return new Date(startTime).getHours();
      }) || [];

      // Retourner les créneaux libres
      return allPossibleSlots.filter(slot => !busySlots.includes(parseInt(slot.split(':')[0])));
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des créneaux:", error);
      return this.getDefaultAvailableSlots(date);
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
      
      if (!service || !service.isInitialized) {
        console.error("[BookingRouter] Service OAuth2 non initialisé - GOOGLE_REFRESH_TOKEN manquant");
        throw new Error("Service de réservation temporairement indisponible");
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
      
      if (!service || !service.isInitialized) {
        console.error("[BookingRouter] Service OAuth2 non initialisé - GOOGLE_REFRESH_TOKEN manquant");
        throw new Error("Service de réservation temporairement indisponible");
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
      
      if (!service || !service.isInitialized) {
        throw new Error("Service de réservation temporairement indisponible");
      }
      
      try {
        // Calculer l'heure de fin (60 minutes après le début)
        const appointmentDate = new Date(input.date);
        const [hours, minutes] = input.startTime.split(':').map(Number);
        const startDateTime = new Date(appointmentDate);
        startDateTime.setHours(hours, minutes, 0, 0);
        
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +60 minutes
        const endTime = endDateTime.toTimeString().slice(0, 5); // HH:mm

        // Créer le rendez-vous avec le service OAuth2
        const eventId = await service.bookAppointment({
          date: appointmentDate,
          startTime: input.startTime,
          duration: 60,
          patientName: `${input.firstName} ${input.lastName}`,
          patientEmail: input.email,
          patientPhone: input.phone,
          reason: input.reason,
        });

        if (!eventId) {
          throw new Error("Impossible de créer le rendez-vous");
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
      
      if (!service || !service.isInitialized) {
        throw new Error("Service de vérification indisponible");
      }
      
      try {
        const availableSlots = await service.getAvailableSlots(new Date(input.date), 60);
        const isAvailable = availableSlots.includes(input.startTime);
        
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
