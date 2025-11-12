import { google } from 'googleapis';

/**
 * Service Google Calendar pour synchroniser les rendez-vous
 * 
 * Configuration requise:
 * 1. Créer un projet dans Google Cloud Console
 * 2. Activer l'API Google Calendar
 * 3. Créer des credentials OAuth 2.0
 * 4. Télécharger le fichier credentials.json
 * 5. Configurer les variables d'environnement
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

interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
  calendarId: string; // ID du calendrier (généralement 'primary' ou l'email)
}

/**
 * Classe pour gérer l'intégration avec Google Calendar
 */
export class GoogleCalendarService {
  private oauth2Client: any;
  private calendar: any;
  private config: GoogleCalendarConfig;

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    // Définir les credentials
    this.oauth2Client.setCredentials({
      refresh_token: config.refreshToken,
    });

    // Initialiser l'API Calendar
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Créer un événement dans Google Calendar
   */
  async createEvent(appointment: AppointmentData): Promise<string | null> {
    try {
      // Construire la date/heure de début
      const startDateTime = new Date(appointment.date);
      const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      // Construire la date/heure de fin
      const endDateTime = new Date(appointment.date);
      const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Construire la description de l'événement
      let description = `Rendez-vous avec ${appointment.patientName}`;
      if (appointment.reason) {
        description += `\n\nMotif: ${appointment.reason}`;
      }
      if (appointment.patientPhone) {
        description += `\nTéléphone: ${appointment.patientPhone}`;
      }
      if (appointment.practitionerName) {
        description += `\nPraticien: ${appointment.practitionerName}`;
      }

      // Créer l'événement
      const event = {
        summary: `Consultation - ${appointment.patientName}`,
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
          { email: appointment.patientEmail },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 jour avant
            { method: 'popup', minutes: 60 }, // 1 heure avant
          ],
        },
        colorId: '10', // Vert (pour les rendez-vous médicaux)
      };

      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event,
        sendUpdates: 'all', // Envoyer des notifications aux participants
      });

      console.log('[GoogleCalendar] Événement créé:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('[GoogleCalendar] Erreur lors de la création de l\'événement:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un événement dans Google Calendar
   */
  async updateEvent(
    eventId: string,
    appointment: AppointmentData
  ): Promise<boolean> {
    try {
      // Construire la date/heure de début
      const startDateTime = new Date(appointment.date);
      const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      // Construire la date/heure de fin
      const endDateTime = new Date(appointment.date);
      const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Construire la description de l'événement
      let description = `Rendez-vous avec ${appointment.patientName}`;
      if (appointment.reason) {
        description += `\n\nMotif: ${appointment.reason}`;
      }
      if (appointment.patientPhone) {
        description += `\nTéléphone: ${appointment.patientPhone}`;
      }
      if (appointment.practitionerName) {
        description += `\nPraticien: ${appointment.practitionerName}`;
      }

      const event = {
        summary: `Consultation - ${appointment.patientName}`,
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
          { email: appointment.patientEmail },
        ],
      };

      await this.calendar.events.update({
        calendarId: this.config.calendarId,
        eventId: eventId,
        resource: event,
        sendUpdates: 'all',
      });

      console.log('[GoogleCalendar] Événement mis à jour:', eventId);
      return true;
    } catch (error) {
      console.error('[GoogleCalendar] Erreur lors de la mise à jour:', error);
      return false;
    }
  }

  /**
   * Annuler (supprimer) un événement dans Google Calendar
   */
  async cancelEvent(eventId: string): Promise<boolean> {
    try {
      await this.calendar.events.delete({
        calendarId: this.config.calendarId,
        eventId: eventId,
        sendUpdates: 'all', // Notifier les participants de l'annulation
      });

      console.log('[GoogleCalendar] Événement annulé:', eventId);
      return true;
    } catch (error) {
      console.error('[GoogleCalendar] Erreur lors de l\'annulation:', error);
      return false;
    }
  }

  /**
   * Vérifier la disponibilité d'un créneau
   */
  async checkAvailability(date: Date, startTime: string, endTime: string): Promise<boolean> {
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

      const busySlots = response.data.calendars[this.config.calendarId].busy;
      return busySlots.length === 0; // Disponible si aucun créneau occupé
    } catch (error) {
      console.error('[GoogleCalendar] Erreur lors de la vérification de disponibilité:', error);
      return false;
    }
  }
}

/**
 * Fonction factory pour créer une instance du service Google Calendar
 * Utilise les variables d'environnement pour la configuration
 */
export function createGoogleCalendarService(): GoogleCalendarService | null {
  const config = {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/oauth/callback',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  };

  // Vérifier que toutes les variables sont définies
  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    console.warn('[GoogleCalendar] Configuration incomplète. Synchronisation Google Calendar désactivée.');
    return null;
  }

  return new GoogleCalendarService(config);
}

/**
 * Instance singleton du service (optionnel)
 */
let calendarServiceInstance: GoogleCalendarService | null = null;

export function getGoogleCalendarService(): GoogleCalendarService | null {
  if (!calendarServiceInstance) {
    calendarServiceInstance = createGoogleCalendarService();
  }
  return calendarServiceInstance;
}
