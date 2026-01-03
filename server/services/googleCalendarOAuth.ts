import { google } from 'googleapis';

/**
 * Service Google Calendar avec OAuth 2.0
 * Permet la gestion des disponibilités et la synchronisation des rendez-vous
 */

interface AppointmentData {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason?: string;
  practitionerName?: string;
}

interface AvailabilitySlot {
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  eventId?: string;
}

interface GoogleCalendarOAuthConfig {
  clientId: string;
  clientSecret?: string;
  apiKey: string;
  calendarId: string;
}

/**
 * Service pour gérer Google Calendar avec OAuth
 */
export class GoogleCalendarOAuthService {
  private config: GoogleCalendarOAuthConfig;
  private calendar: any;
  private auth: any;

  constructor(config: GoogleCalendarOAuthConfig) {
    this.config = config;
    
    // Initialiser l'auth avec API Key pour les opérations publiques
    this.auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret || '',
      'http://localhost:5173/oauth/callback'
    );

    // Initialiser l'API Calendar
    this.calendar = google.calendar({ 
      version: 'v3', 
      auth: config.apiKey // Utiliser l'API Key pour les requêtes publiques
    });
  }

  /**
   * Récupérer les créneaux disponibles pour une période donnée
   * Lit les plages de disponibilité du Google Calendar et génère des créneaux de 60 min
   * Filtre les créneaux déjà réservés
   */
  async getAvailableSlots(
    startDate: Date,
    endDate: Date,
    workingHours: { start: string; end: string } = { start: '09:00', end: '18:00' },
    slotDuration: number = 60 // durée en minutes (par défaut 60 min pour les séances)
  ): Promise<AvailabilitySlot[]> {
    try {
      console.log(`[GoogleCalendarOAuth] 📅 Récupération des créneaux entre ${startDate.toISOString()} et ${endDate.toISOString()}`);
      
      // Récupérer tous les événements de la période
      const response = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        showDeleted: false, // NE PAS inclure les événements supprimés
      });

      const allEvents = response.data.items || [];
      console.log(`[GoogleCalendarOAuth] 📋 ${allEvents.length} événements trouvés au total`);
      
      // Filtrer les événements annulés ou supprimés
      const events = allEvents.filter((event: any) => 
        event.status !== 'cancelled' && event.status !== 'deleted'
      );
      console.log(`[GoogleCalendarOAuth] ✅ ${events.length} événements actifs (${allEvents.length - events.length} annulés/supprimés ignorés)`);
      
      const slots: AvailabilitySlot[] = [];

      // Séparer les événements de disponibilité des rendez-vous
      const availabilityEvents = events.filter((event: any) => 
        event.summary?.includes('DISPONIBLE') || 
        event.transparency === 'transparent' ||
        event.extendedProperties?.private?.isAvailabilitySlot === 'true'
      );
      
      const appointments = events.filter((event: any) => 
        !event.summary?.includes('DISPONIBLE') && 
        event.transparency !== 'transparent'
      );

      console.log(`[GoogleCalendarOAuth] ✅ ${availabilityEvents.length} plages de disponibilité trouvées`);
      console.log(`[GoogleCalendarOAuth] 📌 ${appointments.length} rendez-vous existants`);

      // Pour chaque événement de disponibilité, générer des créneaux de 60 minutes
      for (const availEvent of availabilityEvents) {
        if (!availEvent.start?.dateTime || !availEvent.end?.dateTime) {
          console.log(`[GoogleCalendarOAuth] ⚠️ Événement sans date/heure ignoré: ${availEvent.summary}`);
          continue;
        }

        const slotStart = new Date(availEvent.start.dateTime);
        const slotEnd = new Date(availEvent.end.dateTime);

        console.log(`[GoogleCalendarOAuth] 🔍 Analyse plage: ${slotStart.toLocaleString('fr-FR')} - ${slotEnd.toLocaleString('fr-FR')}`);

        // Découper la plage en créneaux de 60 minutes
        let currentTime = new Date(slotStart);
        while (currentTime < slotEnd) {
          const nextTime = new Date(currentTime.getTime() + slotDuration * 60000);
          
          // Ne pas créer de créneau qui dépasse la plage de disponibilité
          if (nextTime > slotEnd) {
            console.log(`[GoogleCalendarOAuth] ⏩ Créneau incomplet ignoré à ${currentTime.toLocaleTimeString('fr-FR')}`);
            break;
          }

          const startTimeStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
          const endTimeStr = `${nextTime.getHours().toString().padStart(2, '0')}:${nextTime.getMinutes().toString().padStart(2, '0')}`;

          // Vérifier si ce créneau est libre (pas de rendez-vous qui chevauche)
          const isBooked = appointments.some((appt: any) => {
            if (!appt.start?.dateTime || !appt.end?.dateTime) return false;
            const apptStart = new Date(appt.start.dateTime);
            const apptEnd = new Date(appt.end.dateTime);
            
            // Il y a chevauchement si le début du slot est avant la fin du RDV 
            // ET la fin du slot est après le début du RDV
            const overlaps = currentTime < apptEnd && nextTime > apptStart;
            
            if (overlaps) {
              console.log(`[GoogleCalendarOAuth] ❌ Créneau ${startTimeStr} déjà réservé (RDV: ${appt.summary})`);
            }
            
            return overlaps;
          });

          // Ne pas inclure les créneaux dans le passé
          const now = new Date();
          const isPast = nextTime <= now;
          
          if (isPast) {
            console.log(`[GoogleCalendarOAuth] ⏮️ Créneau passé ignoré: ${startTimeStr}`);
          } else {
            const isAvailable = !isBooked;
            
            slots.push({
              date: new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate()),
              startTime: startTimeStr,
              endTime: endTimeStr,
              isAvailable: isAvailable,
            });

            if (isAvailable) {
              console.log(`[GoogleCalendarOAuth] ✅ Créneau disponible: ${startTimeStr} - ${endTimeStr}`);
            }
          }

          currentTime = nextTime;
        }
      }

      const availableCount = slots.filter(s => s.isAvailable).length;
      console.log(`[GoogleCalendarOAuth] 📊 Résultat: ${slots.length} créneaux générés, ${availableCount} disponibles`);

      return slots;
    } catch (error: any) {
      console.error('[GoogleCalendarOAuth] ❌ Erreur lors de la récupération des créneaux:', error.message);
      if (error.response?.data) {
        console.error('[GoogleCalendarOAuth] Détails:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Créer un événement de rendez-vous dans Google Calendar
   */
  async createAppointment(appointment: AppointmentData): Promise<string | null> {
    try {
      // Construire les dates
      const startDateTime = new Date(appointment.date);
      const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(appointment.date);
      const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Construire la description
      let description = `📋 Rendez-vous avec ${appointment.patientName}\n`;
      description += `📧 Email: ${appointment.patientEmail}\n`;
      if (appointment.patientPhone) {
        description += `📱 Téléphone: ${appointment.patientPhone}\n`;
      }
      if (appointment.reason) {
        description += `\n💬 Motif: ${appointment.reason}`;
      }

      // Créer l'événement
      const event = {
        summary: `🏥 Consultation - ${appointment.patientName}`,
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
          { 
            email: appointment.patientEmail,
            displayName: appointment.patientName,
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 jour avant
            { method: 'email', minutes: 60 },      // 1 heure avant
            { method: 'popup', minutes: 30 },      // 30 minutes avant
          ],
        },
        colorId: '2', // Vert sauge pour les rendez-vous
        status: 'confirmed',
      };

      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event,
        sendUpdates: 'all', // Envoyer les invitations
      });

      console.log('[GoogleCalendarOAuth] Rendez-vous créé:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('[GoogleCalendarOAuth] Erreur lors de la création du rendez-vous:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un rendez-vous existant
   */
  async updateAppointment(
    eventId: string,
    appointment: AppointmentData
  ): Promise<boolean> {
    try {
      const startDateTime = new Date(appointment.date);
      const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(appointment.date);
      const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const event = {
        summary: `🏥 Consultation - ${appointment.patientName}`,
        description: `Rendez-vous avec ${appointment.patientName}\nEmail: ${appointment.patientEmail}${appointment.reason ? '\n\nMotif: ' + appointment.reason : ''}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
      };

      await this.calendar.events.update({
        calendarId: this.config.calendarId,
        eventId: eventId,
        resource: event,
        sendUpdates: 'all',
      });

      console.log('[GoogleCalendarOAuth] Rendez-vous mis à jour:', eventId);
      return true;
    } catch (error) {
      console.error('[GoogleCalendarOAuth] Erreur lors de la mise à jour:', error);
      return false;
    }
  }

  /**
   * Annuler un rendez-vous
   */
  async cancelAppointment(eventId: string): Promise<boolean> {
    try {
      // 1. Récupérer les détails avant suppression
      const event = await this.calendar.events.get({
        calendarId: this.config.calendarId,
        eventId: eventId,
      });

      if (!event.data) return false;

      const startDateTime = event.data.start.dateTime || event.data.start.date;
      const endDateTime = event.data.end.dateTime || event.data.end.date;

      // 2. Supprimer l'événement
      await this.calendar.events.delete({
        calendarId: this.config.calendarId,
        eventId: eventId,
        sendUpdates: 'all',
      });

      console.log('[GoogleCalendarOAuth] Rendez-vous annulé:', eventId);

      // 3. Recréer le créneau de disponibilité
      try {
        const newSlot = {
          summary: '✅ DISPONIBLE',
          description: 'Créneau libéré après annulation',
          start: {
            dateTime: startDateTime,
            timeZone: 'Europe/Paris',
          },
          end: {
            dateTime: endDateTime,
            timeZone: 'Europe/Paris',
          },
          transparency: 'transparent',
          colorId: '10', // Vert
        };

        await this.calendar.events.insert({
          calendarId: this.config.calendarId,
          resource: newSlot,
        });
        console.log('[GoogleCalendarOAuth] ✅ Créneau de disponibilité recréé');
      } catch (slotError) {
        console.warn('[GoogleCalendarOAuth] ⚠️ Impossible de recréer le créneau:', slotError);
      }

      return true;
    } catch (error) {
      console.error('[GoogleCalendarOAuth] Erreur lors de l\'annulation:', error);
      return false;
    }
  }

  /**
   * Marquer un créneau comme disponible en créant un événement "DISPONIBLE"
   */
  async markSlotAsAvailable(
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<string | null> {
    try {
      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const event = {
        summary: '✅ DISPONIBLE',
        description: 'Créneau disponible pour les rendez-vous patients',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        colorId: '10', // Vert pour disponible
        transparency: 'transparent', // Ne compte pas comme occupé
        visibility: 'public',
      };

      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event,
      });

      console.log('[GoogleCalendarOAuth] Créneau marqué comme disponible:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('[GoogleCalendarOAuth] Erreur lors du marquage de disponibilité:', error);
      return null;
    }
  }

  /**
   * Vérifier si un créneau est disponible
   */
  async isSlotAvailable(date: Date, startTime: string, endTime: string): Promise<boolean> {
    try {
      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin: startDateTime.toISOString(),
          timeMax: endDateTime.toISOString(),
          items: [{ id: this.config.calendarId }],
        },
      });

      const busySlots = response.data.calendars[this.config.calendarId]?.busy || [];
      return busySlots.length === 0;
    } catch (error) {
      console.error('[GoogleCalendarOAuth] Erreur lors de la vérification:', error);
      return false;
    }
  }
}

/**
 * Factory pour créer une instance du service OAuth
 */
export function createGoogleCalendarOAuthService(): GoogleCalendarOAuthService | null {
  const config = {
    clientId: process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    apiKey: process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || '',
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  };

  if (!config.clientId || !config.apiKey) {
    console.warn('[GoogleCalendarOAuth] Configuration OAuth incomplète');
    console.warn('[GoogleCalendarOAuth] VITE_GOOGLE_CLIENT_ID et VITE_GOOGLE_API_KEY requis');
    return null;
  }

  try {
    return new GoogleCalendarOAuthService(config);
  } catch (error) {
    console.error('[GoogleCalendarOAuth] Erreur d\'initialisation:', error);
    return null;
  }
}

// Instance singleton
let oauthServiceInstance: GoogleCalendarOAuthService | null = null;

export function getGoogleCalendarOAuthService(): GoogleCalendarOAuthService | null {
  if (!oauthServiceInstance) {
    oauthServiceInstance = createGoogleCalendarOAuthService();
  }
  return oauthServiceInstance;
}
