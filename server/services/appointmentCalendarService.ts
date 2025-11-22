import { google } from 'googleapis';

/**
 * Service avancé de gestion de calendrier Google pour les rendez-vous
 * 
 * Fonctionnalités:
 * - Calendrier dédié secondaire pour les RDV
 * - Créneaux récurrents et ponctuels
 * - Verrouillage des créneaux pendant réservation
 * - Vérification des conflits en temps réel
 * - Gestion de la confidentialité
 */

interface TimeSlot {
  id?: string;
  date: Date;
  startTime: string;
  endTime: string;
  isRecurrent?: boolean;
  recurrenceRule?: string; // Format RRULE
  status: 'available' | 'booked' | 'locked' | 'cancelled';
  lockedUntil?: Date; // Pour le verrouillage temporaire
  bookedBy?: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval?: number; // Ex: every 2 weeks
  daysOfWeek?: number[]; // 0=dimanche, 1=lundi, etc.
  endDate?: Date;
  count?: number; // Nombre d'occurrences
}

interface CalendarConfig {
  clientId: string;
  apiKey: string;
  appointmentCalendarId: string; // Calendrier dédié aux RDV
  mainCalendarId?: string; // Calendrier principal (pour vérification conflits)
}

export class AppointmentCalendarService {
  private config: CalendarConfig;
  private calendar: any;
  private auth: any;
  private pendingLocks: Map<string, Date> = new Map(); // Gestion des verrous en mémoire

  constructor(config: CalendarConfig) {
    this.config = config;
    
    this.auth = new google.auth.OAuth2(
      config.clientId,
      '',
      'http://localhost:5173/oauth/callback'
    );

    this.calendar = google.calendar({ 
      version: 'v3', 
      auth: config.apiKey 
    });
  }

  /**
   * Créer un calendrier dédié aux rendez-vous
   */
  async createAppointmentCalendar(calendarName: string = 'Rendez-vous Patients'): Promise<string> {
    try {
      const response = await this.calendar.calendars.insert({
        requestBody: {
          summary: calendarName,
          description: 'Calendrier dédié à la gestion des rendez-vous patients',
          timeZone: 'Europe/Paris',
        },
      });

      console.log('[AppointmentCalendar] Calendrier créé:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('[AppointmentCalendar] Erreur création calendrier:', error);
      throw error;
    }
  }

  /**
   * Créer des créneaux de disponibilité (ponctuels)
   */
  async createAvailabilitySlot(
    date: Date,
    startTime: string,
    endTime: string,
    isRecurrent: boolean = false,
    recurrence?: RecurrencePattern
  ): Promise<string | null> {
    try {
      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const event: any = {
        summary: '🟢 DISPONIBLE',
        description: 'Créneau disponible pour rendez-vous',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        colorId: '10', // Vert
        transparency: 'transparent', // Ne bloque pas le calendrier
        visibility: 'public',
        extendedProperties: {
          private: {
            type: 'availability_slot',
            status: 'available',
          },
        },
      };

      // Ajouter la récurrence si nécessaire
      if (isRecurrent && recurrence) {
        event.recurrence = [this.buildRecurrenceRule(recurrence)];
      }

      const response = await this.calendar.events.insert({
        calendarId: this.config.appointmentCalendarId,
        resource: event,
      });

      console.log('[AppointmentCalendar] Créneau créé:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('[AppointmentCalendar] Erreur création créneau:', error);
      return null;
    }
  }

  /**
   * Construire une règle de récurrence RRULE
   */
  private buildRecurrenceRule(pattern: RecurrencePattern): string {
    let rule = `RRULE:FREQ=${pattern.frequency.toUpperCase()}`;
    
    if (pattern.interval) {
      rule += `;INTERVAL=${pattern.interval}`;
    }
    
    if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
      const days = pattern.daysOfWeek.map(d => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][d]);
      rule += `;BYDAY=${days.join(',')}`;
    }
    
    if (pattern.endDate) {
      const endDate = pattern.endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      rule += `;UNTIL=${endDate}`;
    } else if (pattern.count) {
      rule += `;COUNT=${pattern.count}`;
    }
    
    return rule;
  }

  /**
   * Créer des créneaux récurrents (ex: tous les lundis 9h-10h)
   */
  async createRecurrentAvailability(
    startDate: Date,
    startTime: string,
    endTime: string,
    recurrence: RecurrencePattern
  ): Promise<string | null> {
    return this.createAvailabilitySlot(startDate, startTime, endTime, true, recurrence);
  }

  /**
   * Verrouiller un créneau temporairement (pendant qu'un patient réserve)
   */
  async lockSlot(slotId: string, durationMinutes: number = 5): Promise<boolean> {
    try {
      const lockUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
      this.pendingLocks.set(slotId, lockUntil);

      // Mettre à jour l'événement dans Google Calendar
      const event = await this.calendar.events.get({
        calendarId: this.config.appointmentCalendarId,
        eventId: slotId,
      });

      if (!event.data) return false;

      event.data.summary = '🟡 RÉSERVATION EN COURS...';
      event.data.colorId = '5'; // Jaune
      event.data.extendedProperties = {
        ...event.data.extendedProperties,
        private: {
          ...event.data.extendedProperties?.private,
          status: 'locked',
          lockedUntil: lockUntil.toISOString(),
        },
      };

      await this.calendar.events.update({
        calendarId: this.config.appointmentCalendarId,
        eventId: slotId,
        resource: event.data,
      });

      // Auto-déverrouiller après expiration
      setTimeout(() => {
        this.unlockSlot(slotId);
      }, durationMinutes * 60 * 1000);

      console.log(`[AppointmentCalendar] Créneau ${slotId} verrouillé jusqu'à`, lockUntil);
      return true;
    } catch (error) {
      console.error('[AppointmentCalendar] Erreur verrouillage:', error);
      return false;
    }
  }

  /**
   * Déverrouiller un créneau
   */
  async unlockSlot(slotId: string): Promise<boolean> {
    try {
      this.pendingLocks.delete(slotId);

      const event = await this.calendar.events.get({
        calendarId: this.config.appointmentCalendarId,
        eventId: slotId,
      });

      if (!event.data) return false;

      // Vérifier si le créneau n'a pas été réservé entre-temps
      const status = event.data.extendedProperties?.private?.status;
      if (status === 'booked') {
        return true; // Déjà réservé, ne rien faire
      }

      event.data.summary = '🟢 DISPONIBLE';
      event.data.colorId = '10'; // Vert
      event.data.extendedProperties = {
        ...event.data.extendedProperties,
        private: {
          ...event.data.extendedProperties?.private,
          status: 'available',
          lockedUntil: null,
        },
      };

      await this.calendar.events.update({
        calendarId: this.config.appointmentCalendarId,
        eventId: slotId,
        resource: event.data,
      });

      console.log(`[AppointmentCalendar] Créneau ${slotId} déverrouillé`);
      return true;
    } catch (error) {
      console.error('[AppointmentCalendar] Erreur déverrouillage:', error);
      return false;
    }
  }

  /**
   * Vérifier si un créneau est verrouillé
   */
  isSlotLocked(slotId: string): boolean {
    const lockUntil = this.pendingLocks.get(slotId);
    if (!lockUntil) return false;
    
    if (new Date() > lockUntil) {
      this.pendingLocks.delete(slotId);
      return false;
    }
    
    return true;
  }

  /**
   * Vérifier les conflits avec le calendrier principal
   */
  async checkConflicts(
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const calendarsToCheck = [this.config.appointmentCalendarId];
      if (this.config.mainCalendarId) {
        calendarsToCheck.push(this.config.mainCalendarId);
      }

      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin: startDateTime.toISOString(),
          timeMax: endDateTime.toISOString(),
          items: calendarsToCheck.map(id => ({ id })),
        },
      });

      // Vérifier si des créneaux sont occupés
      for (const calendarId of calendarsToCheck) {
        const busy = response.data.calendars[calendarId]?.busy || [];
        if (busy.length > 0) {
          console.log(`[AppointmentCalendar] Conflit détecté sur calendrier ${calendarId}`);
          return true; // Il y a un conflit
        }
      }

      return false; // Pas de conflit
    } catch (error) {
      console.error('[AppointmentCalendar] Erreur vérification conflits:', error);
      return true; // En cas d'erreur, on suppose qu'il y a conflit par sécurité
    }
  }

  /**
   * Réserver un créneau (transformation de disponibilité en RDV)
   */
  async bookSlot(
    slotId: string,
    patientInfo: {
      name: string;
      email: string;
      phone?: string;
      reason?: string;
    }
  ): Promise<boolean> {
    try {
      // Vérifier si le créneau est verrouillé par quelqu'un d'autre
      if (this.isSlotLocked(slotId)) {
        console.log('[AppointmentCalendar] Créneau verrouillé par un autre utilisateur');
        return false;
      }

      // Récupérer l'événement de disponibilité
      const event = await this.calendar.events.get({
        calendarId: this.config.appointmentCalendarId,
        eventId: slotId,
      });

      if (!event.data) return false;

      // Vérifier le statut
      const status = event.data.extendedProperties?.private?.status;
      if (status === 'booked') {
        console.log('[AppointmentCalendar] Créneau déjà réservé');
        return false;
      }

      // Vérifier les conflits une dernière fois
      const startTime = new Date(event.data.start.dateTime);
      const endTime = new Date(event.data.end.dateTime);
      const hasConflict = await this.checkConflicts(
        startTime,
        startTime.toTimeString().slice(0, 5),
        endTime.toTimeString().slice(0, 5)
      );

      if (hasConflict) {
        console.log('[AppointmentCalendar] Conflit détecté, réservation annulée');
        return false;
      }

      // Transformer en rendez-vous
      event.data.summary = `🏥 RDV - ${patientInfo.name}`;
      event.data.description = `📋 Rendez-vous patient
📧 Email: ${patientInfo.email}
${patientInfo.phone ? `📱 Téléphone: ${patientInfo.phone}` : ''}
${patientInfo.reason ? `\n💬 Motif: ${patientInfo.reason}` : ''}`;
      
      event.data.colorId = '2'; // Bleu pour les RDV réservés
      event.data.transparency = 'opaque'; // Bloque le calendrier
      event.data.attendees = [
        {
          email: patientInfo.email,
          displayName: patientInfo.name,
          responseStatus: 'accepted',
        },
      ];
      
      event.data.reminders = {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 jour avant
          { method: 'email', minutes: 60 },      // 1 heure avant
          { method: 'popup', minutes: 30 },      // 30 min avant
        ],
      };

      event.data.extendedProperties = {
        ...event.data.extendedProperties,
        private: {
          ...event.data.extendedProperties?.private,
          type: 'appointment',
          status: 'booked',
          patientName: patientInfo.name,
          patientEmail: patientInfo.email,
          patientPhone: patientInfo.phone || '',
        },
      };

      await this.calendar.events.update({
        calendarId: this.config.appointmentCalendarId,
        eventId: slotId,
        resource: event.data,
        sendUpdates: 'all', // Envoyer notifications
      });

      // Supprimer le verrou s'il existe
      this.pendingLocks.delete(slotId);

      console.log(`[AppointmentCalendar] Créneau ${slotId} réservé par ${patientInfo.name}`);
      return true;
    } catch (error) {
      console.error('[AppointmentCalendar] Erreur réservation:', error);
      return false;
    }
  }

  /**
   * Récupérer tous les créneaux disponibles
   */
  async getAvailableSlots(
    startDate: Date,
    endDate: Date
  ): Promise<TimeSlot[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: this.config.appointmentCalendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const slots: TimeSlot[] = [];
      const events = response.data.items || [];

      for (const event of events) {
        const status = event.extendedProperties?.private?.status || 'available';
        const type = event.extendedProperties?.private?.type || 'availability_slot';

        // Ne retourner que les créneaux disponibles
        if (type === 'availability_slot' && status === 'available') {
          const startTime = new Date(event.start.dateTime || event.start.date);
          const endTime = new Date(event.end.dateTime || event.end.date);

          slots.push({
            id: event.id,
            date: startTime,
            startTime: startTime.toTimeString().slice(0, 5),
            endTime: endTime.toTimeString().slice(0, 5),
            status: 'available',
            isRecurrent: !!event.recurrence,
          });
        }
      }

      console.log(`[AppointmentCalendar] ${slots.length} créneaux disponibles trouvés`);
      return slots;
    } catch (error) {
      console.error('[AppointmentCalendar] Erreur récupération créneaux:', error);
      return [];
    }
  }

  /**
   * Annuler un rendez-vous (remettre le créneau en disponible)
   */
  async cancelAppointment(appointmentId: string): Promise<boolean> {
    try {
      const event = await this.calendar.events.get({
        calendarId: this.config.appointmentCalendarId,
        eventId: appointmentId,
      });

      if (!event.data) return false;

      // Remettre en disponible
      event.data.summary = '🟢 DISPONIBLE';
      event.data.description = 'Créneau disponible pour rendez-vous';
      event.data.colorId = '10';
      event.data.transparency = 'transparent';
      event.data.attendees = [];
      event.data.extendedProperties = {
        ...event.data.extendedProperties,
        private: {
          type: 'availability_slot',
          status: 'available',
        },
      };

      await this.calendar.events.update({
        calendarId: this.config.appointmentCalendarId,
        eventId: appointmentId,
        resource: event.data,
        sendUpdates: 'all', // Notifier l'annulation
      });

      console.log(`[AppointmentCalendar] Rendez-vous ${appointmentId} annulé`);
      return true;
    } catch (error) {
      console.error('[AppointmentCalendar] Erreur annulation:', error);
      return false;
    }
  }

  /**
   * Supprimer un créneau de disponibilité
   */
  async deleteAvailabilitySlot(slotId: string): Promise<boolean> {
    try {
      await this.calendar.events.delete({
        calendarId: this.config.appointmentCalendarId,
        eventId: slotId,
      });

      console.log(`[AppointmentCalendar] Créneau ${slotId} supprimé`);
      return true;
    } catch (error) {
      console.error('[AppointmentCalendar] Erreur suppression:', error);
      return false;
    }
  }
}

/**
 * Factory pour créer le service
 */
export function createAppointmentCalendarService(): AppointmentCalendarService | null {
  const config: CalendarConfig = {
    clientId: process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
    apiKey: process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || '',
    appointmentCalendarId: process.env.GOOGLE_APPOINTMENT_CALENDAR_ID || 'primary',
    mainCalendarId: process.env.GOOGLE_MAIN_CALENDAR_ID,
  };

  if (!config.clientId || !config.apiKey) {
    console.warn('[AppointmentCalendar] Configuration incomplète');
    return null;
  }

  try {
    return new AppointmentCalendarService(config);
  } catch (error) {
    console.error('[AppointmentCalendar] Erreur initialisation:', error);
    return null;
  }
}

// Instance singleton
let serviceInstance: AppointmentCalendarService | null = null;

export function getAppointmentCalendarService(): AppointmentCalendarService | null {
  if (!serviceInstance) {
    serviceInstance = createAppointmentCalendarService();
  }
  return serviceInstance;
}
