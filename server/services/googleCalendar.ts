import { google } from 'googleapis';
import type { Appointment, Practitioner, Patient } from '../../shared/schema';

interface CalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

interface GoogleCalendarConfig {
  serviceAccountEmail?: string;
  privateKey?: string;
  clientEmail?: string;
  calendarId?: string;
}

class GoogleCalendarService {
  private calendar: any;
  private auth: any;
  private defaultCalendarId: string;

  constructor(config: GoogleCalendarConfig = {}) {
    // Initialisation de l'authentification
    // Option 1: Service Account (recommandé pour calendrier central)
    if (config.serviceAccountEmail && config.privateKey) {
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: config.serviceAccountEmail,
          private_key: config.privateKey.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
    } else {
      // Fallback: utiliser les variables d'environnement
      const credentials = this.getCredentialsFromEnv();
      if (credentials) {
        this.auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/calendar'],
        });
      }
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    this.defaultCalendarId = config.calendarId || process.env.GOOGLE_CALENDAR_ID || 'primary';
  }

  private getCredentialsFromEnv() {
    const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (serviceAccount) {
      try {
        return JSON.parse(serviceAccount);
      } catch (error) {
        console.error('Erreur lors du parsing des credentials Google:', error);
      }
    }

    // Alternative avec variables séparées
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      return {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
    }

    return null;
  }

  /**
   * Créer un événement dans Google Calendar
   */
  async createEvent(
    appointment: Appointment,
    practitioner: Practitioner,
    patient: Patient,
    calendarId?: string
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      if (!this.calendar || !this.auth) {
        return { 
          success: false, 
          error: 'Google Calendar non configuré. Vérifiez vos variables d\'environnement.' 
        };
      }

      // Construction de l'événement
      const startDateTime = new Date(`${appointment.appointmentDate}T${appointment.startTime}`);
      const endDateTime = new Date(`${appointment.appointmentDate}T${appointment.endTime}`);

      const event: CalendarEvent = {
        summary: `Consultation - ${patient.firstName} ${patient.lastName}`,
        description: [
          `Patient: ${patient.firstName} ${patient.lastName}`,
          `Email: ${patient.email}`,
          patient.phoneNumber ? `Téléphone: ${patient.phoneNumber}` : '',
          `Praticien: Dr. ${practitioner.firstName} ${practitioner.lastName}`,
          `Spécialité: ${practitioner.specialization}`,
          appointment.reason ? `Motif: ${appointment.reason}` : '',
          appointment.notes ? `Notes: ${appointment.notes}` : '',
        ].filter(Boolean).join('\n'),
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
            email: patient.email,
            displayName: `${patient.firstName} ${patient.lastName}`,
          },
          {
            email: practitioner.email,
            displayName: `Dr. ${practitioner.firstName} ${practitioner.lastName}`,
          },
        ],
      };

      // Créer l'événement
      const response = await this.calendar.events.insert({
        calendarId: calendarId || this.defaultCalendarId,
        resource: event,
        sendUpdates: 'all', // Envoie les notifications par email
      });

      return {
        success: true,
        eventId: response.data.id,
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement Google Calendar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Mettre à jour un événement dans Google Calendar
   */
  async updateEvent(
    eventId: string,
    appointment: Appointment,
    practitioner: Practitioner,
    patient: Patient,
    calendarId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.calendar || !this.auth) {
        return { 
          success: false, 
          error: 'Google Calendar non configuré.' 
        };
      }

      const startDateTime = new Date(`${appointment.appointmentDate}T${appointment.startTime}`);
      const endDateTime = new Date(`${appointment.appointmentDate}T${appointment.endTime}`);

      const event: CalendarEvent = {
        summary: `Consultation - ${patient.firstName} ${patient.lastName}`,
        description: [
          `Patient: ${patient.firstName} ${patient.lastName}`,
          `Email: ${patient.email}`,
          patient.phoneNumber ? `Téléphone: ${patient.phoneNumber}` : '',
          `Praticien: Dr. ${practitioner.firstName} ${practitioner.lastName}`,
          `Spécialité: ${practitioner.specialization}`,
          appointment.reason ? `Motif: ${appointment.reason}` : '',
          appointment.notes ? `Notes: ${appointment.notes}` : '',
        ].filter(Boolean).join('\n'),
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
            email: patient.email,
            displayName: `${patient.firstName} ${patient.lastName}`,
          },
          {
            email: practitioner.email,
            displayName: `Dr. ${practitioner.firstName} ${practitioner.lastName}`,
          },
        ],
      };

      await this.calendar.events.update({
        calendarId: calendarId || this.defaultCalendarId,
        eventId,
        resource: event,
        sendUpdates: 'all',
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement Google Calendar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Supprimer un événement dans Google Calendar
   */
  async deleteEvent(
    eventId: string,
    calendarId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.calendar || !this.auth) {
        return { 
          success: false, 
          error: 'Google Calendar non configuré.' 
        };
      }

      await this.calendar.events.delete({
        calendarId: calendarId || this.defaultCalendarId,
        eventId,
        sendUpdates: 'all',
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement Google Calendar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Vérifier la connexion à Google Calendar
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.calendar || !this.auth) {
        return { 
          success: false, 
          error: 'Google Calendar non configuré.' 
        };
      }

      await this.calendar.calendars.get({
        calendarId: this.defaultCalendarId,
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur de connexion Google Calendar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion',
      };
    }
  }
}

// Instance par défaut
export const googleCalendarService = new GoogleCalendarService();

export default GoogleCalendarService;