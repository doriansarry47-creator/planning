import { google } from 'googleapis';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { getGoogleCalendarOAuth2Service } from "./googleCalendarOAuth2";

const TIMEZONE = 'Europe/Paris';

/**
 * Service Google Calendar pour synchroniser les rendez-vous
 * 
 * Supporte désormais OAuth 2.0 (recommandé) et Service Account (fallback).
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
  serviceAccountEmail?: string;
  serviceAccountPrivateKey?: string;
  calendarId: string;
}

/**
 * Classe pour gérer l'intégration avec Google Calendar
 */
export class GoogleCalendarService {
  private auth: any;
  private calendar: any;
  private config: GoogleCalendarConfig;
  private oauth2Service = getGoogleCalendarOAuth2Service();
  public isInitialized: boolean = false;

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
    
    if (this.oauth2Service) {
      console.log("[GoogleCalendar] ✅ Utilisation du service OAuth 2.0");
      this.isInitialized = true;
      return;
    }

    if (!config.serviceAccountEmail || !config.serviceAccountPrivateKey) {
      console.warn("[GoogleCalendar] ⚠️ Configuration OAuth 2.0 absente et Service Account incomplet");
      return;
    }

    // Fallback to Service Account (JWT)
    const privateKey = config.serviceAccountPrivateKey
      .replace(/\\n/g, '\n')
      .replace(/"/g, '')
      .trim();

    this.auth = new google.auth.JWT({
      email: config.serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    this.isInitialized = true;
    console.log("[GoogleCalendar] ✅ Service initialisé avec Service Account");
  }

  /**
   * Créer un événement dans Google Calendar
   */
  async createEvent(appointment: AppointmentData): Promise<string | null> {
    if (this.oauth2Service) {
      const dateStr = formatInTimeZone(appointment.date, TIMEZONE, 'yyyy-MM-dd');
      return this.oauth2Service.createAppointment({
        date: dateStr,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        clientName: appointment.patientName,
        clientEmail: appointment.patientEmail,
        clientPhone: appointment.patientPhone,
        notes: appointment.reason,
      });
    }

    if (!this.isInitialized) return null;

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
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: TIMEZONE,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 }, // Rappel 24h avant
            { method: 'email', minutes: 60 }, // Rappel 1h avant
            { method: 'popup', minutes: 30 }, // Popup 30 minutes avant
          ],
        },
        colorId: '11',
        transparency: 'opaque',
      };

      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event,
        sendUpdates: 'none',
      });

      return response.data.id;
    } catch (error: any) {
      console.error('[GoogleCalendar] Erreur lors de la création:', error.message);
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
    if (!this.isInitialized && !this.oauth2Service) return false;

    try {
      const calendar = this.oauth2Service ? (this.oauth2Service as any).calendar : this.calendar;
      const startDateTime = new Date(appointment.date);
      const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(appointment.date);
      const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const event = {
        summary: `Consultation - ${appointment.patientName}`,
        description: `Rendez-vous avec ${appointment.patientName}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: TIMEZONE,
        },
      };

      await calendar.events.update({
        calendarId: this.config.calendarId,
        eventId: eventId,
        resource: event,
        sendUpdates: 'none',
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Annuler (supprimer) un événement dans Google Calendar
   */
  async cancelEvent(eventId: string): Promise<boolean> {
    if (this.oauth2Service) {
      return this.oauth2Service.deleteAppointment(eventId);
    }

    if (!this.isInitialized) return false;

    try {
      await this.calendar.events.delete({
        calendarId: this.config.calendarId,
        eventId: eventId,
        sendUpdates: 'all',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Vérifier la disponibilité d'un créneau
   */
  async checkAvailability(date: Date, startTime: string, endTime: string): Promise<boolean> {
    if (this.oauth2Service) {
      const dateStr = formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd');
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      const events = await this.oauth2Service.getExistingEvents(dateStr, nextDayStr);
      return this.oauth2Service.checkSlotAvailability(dateStr, startTime, endTime, events);
    }

    if (!this.isInitialized) return false;

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
      return busySlots.length === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupérer les créneaux de disponibilité
   */
  async getAvailabilitySlots(
    startDate: Date,
    endDate: Date,
    slotDuration: number = 60
  ): Promise<Array<{ date: Date; startTime: string; endTime: string; isAvailable: boolean }>> {
    if (!this.isInitialized && !this.oauth2Service) return [];

    try {
      // Utiliser le calendar configuré (soit via JWT soit via OAuth2)
      const calendar = this.oauth2Service ? (this.oauth2Service as any).calendar : this.calendar;
      
      const response = await calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        showDeleted: false,
      });

      const events = response.data.items || [];
      const activeEvents = events.filter((event: any) => 
        event.status !== 'cancelled' && event.status !== 'deleted'
      );
      
      const slots: Array<{ date: Date; startTime: string; endTime: string; isAvailable: boolean }> = [];

      const availabilityEvents = activeEvents.filter(
        (event: any) => 
          event.extendedProperties?.private?.isAvailabilitySlot === 'true' ||
          event.transparency === 'transparent' ||
          event.summary?.includes('DISPONIBLE')
      );
      
      const appointments = activeEvents.filter(
        (event: any) => 
          event.extendedProperties?.private?.isAppointment === 'true' || 
          (event.transparency === 'opaque' && !event.summary?.includes('DISPONIBLE')) ||
          (!event.transparency && !event.summary?.includes('DISPONIBLE'))
      );

      for (const availEvent of availabilityEvents) {
        if (!availEvent.start?.dateTime || !availEvent.end?.dateTime) continue;

        const slotStart = toZonedTime(new Date(availEvent.start.dateTime), TIMEZONE);
        const slotEnd = toZonedTime(new Date(availEvent.end.dateTime), TIMEZONE);

        let currentTime = new Date(slotStart);
        while (currentTime < slotEnd) {
          const nextTime = new Date(currentTime.getTime() + slotDuration * 60000);
          if (nextTime > slotEnd) break;

          const startTimeStr = formatInTimeZone(currentTime, TIMEZONE, 'HH:mm');
          const endTimeStr = formatInTimeZone(nextTime, TIMEZONE, 'HH:mm');
          const dateStrNormalized = formatInTimeZone(currentTime, TIMEZONE, 'yyyy-MM-dd');
          const [year, month, day] = dateStrNormalized.split('-').map(Number);
            
          const isBooked = appointments.some((appt: any) => {
            if (!appt.start?.dateTime || !appt.end?.dateTime) return false;
            const apptStart = new Date(appt.start.dateTime);
            const apptEnd = new Date(appt.end.dateTime);
            return currentTime < apptEnd && nextTime > apptStart;
          });

          slots.push({
            date: new Date(year, month - 1, day),
            startTime: startTimeStr,
            endTime: endTimeStr,
            isAvailable: !isBooked,
          });

          currentTime = nextTime;
        }
      }

      return slots;
    } catch (error: any) {
      console.error('[GoogleCalendar] ❌ Erreur slots:', error.message);
      return [];
    }
  }

  private buildRecurrenceRule(recurrence: AvailabilitySlotData['recurrence']): string | null {
    if (!recurrence) return null;
    let rrule = `RRULE:FREQ=${recurrence.frequency}`;
    if (recurrence.until) {
      const untilStr = recurrence.until.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      rrule += `;UNTIL=${untilStr}`;
    }
    if (recurrence.count) rrule += `;COUNT=${recurrence.count}`;
    if (recurrence.byWeekDay && recurrence.byWeekDay.length > 0) {
      rrule += `;BYDAY=${recurrence.byWeekDay.join(',')}`;
    }
    return rrule;
  }
}

export function createGoogleCalendarService(): GoogleCalendarService | null {
  const envEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const envPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'doriansarry47@gmail.com';

  const config: GoogleCalendarConfig = {
    serviceAccountEmail: envEmail,
    serviceAccountPrivateKey: envPrivateKey,
    calendarId: calendarId,
  };

  return new GoogleCalendarService(config);
}

let calendarServiceInstance: GoogleCalendarService | null = null;

export function getGoogleCalendarService(): GoogleCalendarService | null {
  if (!calendarServiceInstance) {
    calendarServiceInstance = createGoogleCalendarService();
  }
  return calendarServiceInstance;
}