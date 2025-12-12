import { google } from 'googleapis';

/**
 * Service Google Calendar pour synchroniser les rendez-vous
 * 
 * Configuration requise avec Service Account:
 * 1. Créer un projet dans Google Cloud Console
 * 2. Activer l'API Google Calendar
 * 3. Créer un Service Account (compte de service)
 * 4. Télécharger le fichier JSON des credentials du service account
 * 5. Partager votre Google Calendar avec l'email du service account
 * 6. Configurer les variables d'environnement
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

interface AvailabilitySlotData {
  date: Date;
  startTime: string;
  endTime: string;
  title?: string;
  description?: string;
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    until?: Date;
    count?: number;
    byWeekDay?: string[];
  };
}

interface GoogleCalendarConfig {
  serviceAccountEmail: string;
  serviceAccountPrivateKey: string;
  calendarId: string; // ID du calendrier (généralement 'primary' ou l'email du calendrier)
}

/**
 * Classe pour gérer l'intégration avec Google Calendar via Service Account
 */
export class GoogleCalendarService {
  private auth: any;
  private calendar: any;
  private config: GoogleCalendarConfig;

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
    
    // Créer l'authentification avec Service Account (JWT)
    this.auth = new google.auth.JWT({
      email: config.serviceAccountEmail,
      key: config.serviceAccountPrivateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    });

    // Initialiser l'API Calendar
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
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
        summary: `🏥 RDV - ${appointment.patientName}`,
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
            { method: 'email', minutes: 1440 }, // Rappel 24h avant
            { method: 'email', minutes: 60 }, // Rappel 1h avant
            { method: 'popup', minutes: 30 }, // Popup 30 minutes avant
          ],
        },
        colorId: '11', // Rouge (pour les rendez-vous réservés)
        transparency: 'opaque', // Bloquer le créneau
        extendedProperties: {
          private: {
            isAppointment: 'true',
            patientName: appointment.patientName,
            patientEmail: appointment.patientEmail,
            source: 'webapp',
          },
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event,
        sendUpdates: 'none', // Ne pas envoyer de notifications via Google Calendar (l'application envoie ses propres emails)
      });

      console.log('[GoogleCalendar] Événement créé:', response.data.id);
      return response.data.id;
    } catch (error: any) {
      console.error('[GoogleCalendar] Erreur lors de la création de l\'événement:', error.message);
      if (error.response?.data?.error) {
        console.error('[GoogleCalendar] Détails de l\'erreur Google:', error.response.data.error);
      }
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

      };

      await this.calendar.events.update({
        calendarId: this.config.calendarId,
        eventId: eventId,
        resource: event,
        sendUpdates: 'none',
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

  /**
   * Créer un créneau de disponibilité
   */
  async createAvailabilitySlot(slotData: AvailabilitySlotData): Promise<string | null> {
    try {
      const startDateTime = new Date(slotData.date);
      const [startHours, startMinutes] = slotData.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(slotData.date);
      const [endHours, endMinutes] = slotData.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const event: any = {
        summary: slotData.title || 'Disponibilité',
        description: slotData.description || 'Créneau de disponibilité pour prise de rendez-vous',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        transparency: 'transparent', // N'affecte pas la disponibilité
        colorId: '2', // Sage (couleur pour les disponibilités)
        extendedProperties: {
          private: {
            isAvailabilitySlot: 'true',
          },
        },
      };

      // Ajouter la récurrence si spécifiée
      if (slotData.recurrence) {
        const rrule = this.buildRecurrenceRule(slotData.recurrence);
        if (rrule) {
          event.recurrence = [rrule];
        }
      }

      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event,
      });

      console.log('[GoogleCalendar] Créneau de disponibilité créé:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('[GoogleCalendar] Erreur lors de la création du créneau:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un créneau de disponibilité
   */
  async updateAvailabilitySlot(eventId: string, slotData: AvailabilitySlotData): Promise<boolean> {
    try {
      const startDateTime = new Date(slotData.date);
      const [startHours, startMinutes] = slotData.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(slotData.date);
      const [endHours, endMinutes] = slotData.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const event: any = {
        summary: slotData.title || 'Disponibilité',
        description: slotData.description || 'Créneau de disponibilité pour prise de rendez-vous',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        transparency: 'transparent',
        colorId: '2',
        extendedProperties: {
          private: {
            isAvailabilitySlot: 'true',
          },
        },
      };

      if (slotData.recurrence) {
        const rrule = this.buildRecurrenceRule(slotData.recurrence);
        if (rrule) {
          event.recurrence = [rrule];
        }
      }

      await this.calendar.events.update({
        calendarId: this.config.calendarId,
        eventId: eventId,
        resource: event,
      });

      console.log('[GoogleCalendar] Créneau de disponibilité mis à jour:', eventId);
      return true;
    } catch (error) {
      console.error('[GoogleCalendar] Erreur lors de la mise à jour du créneau:', error);
      return false;
    }
  }

  /**
   * Supprimer un créneau de disponibilité
   */
  async deleteAvailabilitySlot(eventId: string): Promise<boolean> {
    try {
      await this.calendar.events.delete({
        calendarId: this.config.calendarId,
        eventId: eventId,
      });

      console.log('[GoogleCalendar] Créneau de disponibilité supprimé:', eventId);
      return true;
    } catch (error) {
      console.error('[GoogleCalendar] Erreur lors de la suppression du créneau:', error);
      return false;
    }
  }

  /**
   * Récupérer les créneaux de disponibilité
   */
  async getAvailabilitySlots(
    startDate: Date,
    endDate: Date,
    slotDuration: number = 30
  ): Promise<Array<{ date: Date; startTime: string; endTime: string; isAvailable: boolean }>> {
    try {
      // Récupérer tous les événements (disponibilités + rendez-vous)
      const response = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      const slots: Array<{ date: Date; startTime: string; endTime: string; isAvailable: boolean }> = [];

      // Séparer les créneaux de disponibilité des rendez-vous
      const availabilityEvents = events.filter(
        (event: any) => event.extendedProperties?.private?.isAvailabilitySlot === 'true'
      );
      const appointments = events.filter(
        (event: any) => event.extendedProperties?.private?.isAvailabilitySlot !== 'true'
      );

      // Pour chaque créneau de disponibilité, découper en petits slots
      for (const availEvent of availabilityEvents) {
        if (!availEvent.start?.dateTime || !availEvent.end?.dateTime) continue;

        const slotStart = new Date(availEvent.start.dateTime);
        const slotEnd = new Date(availEvent.end.dateTime);

        // Découper en créneaux de la durée spécifiée
        let currentTime = new Date(slotStart);
        while (currentTime < slotEnd) {
          const nextTime = new Date(currentTime.getTime() + slotDuration * 60000);
          if (nextTime > slotEnd) break;

          const startTimeStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
          const endTimeStr = `${nextTime.getHours().toString().padStart(2, '0')}:${nextTime.getMinutes().toString().padStart(2, '0')}`;

          // Vérifier si ce créneau est libre (pas de rendez-vous)
          const isBooked = appointments.some((appt: any) => {
            if (!appt.start?.dateTime || !appt.end?.dateTime) return false;
            const apptStart = new Date(appt.start.dateTime);
            const apptEnd = new Date(appt.end.dateTime);
            return currentTime < apptEnd && nextTime > apptStart;
          });

          slots.push({
            date: new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate()),
            startTime: startTimeStr,
            endTime: endTimeStr,
            isAvailable: !isBooked,
          });

          currentTime = nextTime;
        }
      }

      return slots;
    } catch (error) {
      console.error('[GoogleCalendar] Erreur lors de la récupération des créneaux:', error);
      return [];
    }
  }

  /**
   * Construire une règle de récurrence (RRULE)
   */
  private buildRecurrenceRule(recurrence: AvailabilitySlotData['recurrence']): string | null {
    if (!recurrence) return null;

    let rrule = `RRULE:FREQ=${recurrence.frequency}`;

    if (recurrence.until) {
      const untilStr = recurrence.until.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      rrule += `;UNTIL=${untilStr}`;
    }

    if (recurrence.count) {
      rrule += `;COUNT=${recurrence.count}`;
    }

    if (recurrence.byWeekDay && recurrence.byWeekDay.length > 0) {
      rrule += `;BYDAY=${recurrence.byWeekDay.join(',')}`;
    }

    return rrule;
  }
}

/**
 * Fonction factory pour créer une instance du service Google Calendar
 * Utilise les variables d'environnement pour la configuration avec Service Account
 * 
 * Variables d'environnement requises:
 * - GOOGLE_SERVICE_ACCOUNT_JSON_PATH: Chemin vers le fichier JSON du Service Account (ex: ./google-service-account.json)
 * - GOOGLE_CALENDAR_ID: ID du calendrier (ex: 'primary' ou l'email du calendrier)
 */
import * as fs from 'fs';
import * as path from 'path';

const SERVICE_ACCOUNT_JSON_PATH = path.join(process.cwd(), 'server', 'google-service-account.json');

export function createGoogleCalendarService(): GoogleCalendarService | null {
  let serviceAccountConfig: any;
  try {
    const jsonContent = fs.readFileSync(SERVICE_ACCOUNT_JSON_PATH, 'utf-8');
    serviceAccountConfig = JSON.parse(jsonContent);
  } catch (error) {
    console.warn(`[GoogleCalendar] Fichier Service Account non trouvé ou invalide à ${SERVICE_ACCOUNT_JSON_PATH}. Synchronisation Google Calendar désactivée.`);
    return null;
  }

  const config = {
    serviceAccountEmail: serviceAccountConfig.client_email || '',
    serviceAccountPrivateKey: serviceAccountConfig.private_key || '',
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'doriansarry47@gmail.com',
  };

  // Vérifier que toutes les variables sont définies
  if (!config.serviceAccountEmail || !config.serviceAccountPrivateKey) {
    console.warn('[GoogleCalendar] Configuration incomplète dans le fichier JSON. Synchronisation Google Calendar désactivée.');
    return null;
  }

  try {
    return new GoogleCalendarService(config);
  } catch (error) {
    console.error('[GoogleCalendar] Erreur lors de l\'initialisation du service:', error);
    return null;
  }
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
