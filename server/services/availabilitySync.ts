import { google } from 'googleapis';

/**
 * Service de synchronisation des disponibilités avec Google Calendar
 * 
 * Fonctionnalités:
 * - Synchronise les créneaux de disponibilité avec Google Calendar
 * - Masque automatiquement les créneaux déjà pris
 * - Ne retourne que les créneaux disponibles aux utilisateurs
 * - Marque les créneaux réservés comme "busy" dans Google Calendar
 */

interface SyncConfig {
  serviceAccountEmail: string;
  serviceAccountPrivateKey: string;
  calendarId: string;
}

interface AvailabilitySlot {
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  eventId?: string;
  title?: string;
}

export class AvailabilitySyncService {
  private auth: any;
  private calendar: any;
  private config: SyncConfig;

  constructor(config: SyncConfig) {
    this.config = config;
    
    // Créer l'authentification avec Service Account (JWT)
    this.auth = new google.auth.JWT({
      email: config.serviceAccountEmail,
      key: config.serviceAccountPrivateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    // Initialiser l'API Calendar
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  /**
   * Récupérer tous les créneaux disponibles (masque les créneaux pris)
   * Cette méthode ne retourne QUE les créneaux libres
   */
  async getAvailableSlots(
    startDate: Date,
    endDate: Date,
    slotDuration: number = 30
  ): Promise<AvailabilitySlot[]> {
    try {
      console.log('[AvailabilitySync] Récupération des créneaux disponibles...');
      
      // Récupérer tous les événements du calendrier
      const response = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      console.log(`[AvailabilitySync] ${events.length} événements trouvés dans le calendrier`);

      // Séparer les créneaux de disponibilité des rendez-vous
      const availabilityEvents = events.filter((event: any) => {
        const isSlot = event.extendedProperties?.private?.isAvailabilitySlot === 'true';
        const summary = event.summary?.toLowerCase() || '';
        return isSlot || summary.includes('disponible') || summary.includes('🟢');
      });

      const bookedEvents = events.filter((event: any) => {
        const isBooked = event.extendedProperties?.private?.isAvailabilitySlot !== 'true';
        const summary = event.summary?.toLowerCase() || '';
        const isAppointment = summary.includes('rdv') || 
                             summary.includes('rendez-vous') || 
                             summary.includes('consultation') ||
                             summary.includes('🏥');
        return isBooked && (event.transparency !== 'transparent' || isAppointment);
      });

      console.log(`[AvailabilitySync] ${availabilityEvents.length} créneaux de disponibilité`);
      console.log(`[AvailabilitySync] ${bookedEvents.length} rendez-vous réservés`);

      const availableSlots: AvailabilitySlot[] = [];

      // Pour chaque créneau de disponibilité, découper en slots
      for (const availEvent of availabilityEvents) {
        if (!availEvent.start?.dateTime || !availEvent.end?.dateTime) continue;

        const slotStart = new Date(availEvent.start.dateTime);
        const slotEnd = new Date(availEvent.end.dateTime);

        // Découper en créneaux de la durée spécifiée
        let currentTime = new Date(slotStart);
        while (currentTime < slotEnd) {
          const nextTime = new Date(currentTime.getTime() + slotDuration * 60000);
          if (nextTime > slotEnd) break;

          // Vérifier si ce créneau est occupé par un rendez-vous
          const isBooked = bookedEvents.some((appt: any) => {
            if (!appt.start?.dateTime || !appt.end?.dateTime) return false;
            const apptStart = new Date(appt.start.dateTime);
            const apptEnd = new Date(appt.end.dateTime);
            
            // Vérifier s'il y a chevauchement
            return currentTime < apptEnd && nextTime > apptStart;
          });

          // NE PAS INCLURE les créneaux réservés dans la liste
          if (!isBooked) {
            const startTimeStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
            const endTimeStr = `${nextTime.getHours().toString().padStart(2, '0')}:${nextTime.getMinutes().toString().padStart(2, '0')}`;

            availableSlots.push({
              date: new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate()),
              startTime: startTimeStr,
              endTime: endTimeStr,
              isAvailable: true,
              eventId: availEvent.id,
              title: availEvent.summary,
            });
          }

          currentTime = nextTime;
        }
      }

      console.log(`[AvailabilitySync] ${availableSlots.length} créneaux disponibles (créneaux pris masqués)`);
      return availableSlots;
    } catch (error) {
      console.error('[AvailabilitySync] Erreur lors de la récupération des créneaux:', error);
      throw error;
    }
  }

  /**
   * Créer un créneau de disponibilité dans Google Calendar
   */
  async createAvailabilitySlot(
    date: Date,
    startTime: string,
    endTime: string,
    title?: string
  ): Promise<string | null> {
    try {
      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      const event = {
        summary: title || '🟢 DISPONIBLE',
        description: 'Créneau disponible pour rendez-vous',
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        transparency: 'transparent', // N'affecte pas la disponibilité
        colorId: '10', // Vert
        extendedProperties: {
          private: {
            isAvailabilitySlot: 'true',
            createdBy: 'availabilitySync',
          },
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event,
      });

      console.log('[AvailabilitySync] Créneau de disponibilité créé:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('[AvailabilitySync] Erreur lors de la création du créneau:', error);
      return null;
    }
  }

  /**
   * Réserver un créneau (transformer une disponibilité en rendez-vous)
   */
  async bookSlot(
    date: Date,
    startTime: string,
    endTime: string,
    patientInfo: {
      name: string;
      email: string;
      phone?: string;
      reason?: string;
    }
  ): Promise<string | null> {
    try {
      // D'abord, vérifier qu'il n'y a pas de conflit
      const isAvailable = await this.checkAvailability(date, startTime, endTime);
      
      if (!isAvailable) {
        console.log('[AvailabilitySync] Créneau déjà pris');
        return null;
      }

      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      let description = `📋 Rendez-vous avec ${patientInfo.name}\n`;
      description += `📧 Email: ${patientInfo.email}\n`;
      if (patientInfo.phone) {
        description += `📱 Téléphone: ${patientInfo.phone}\n`;
      }
      if (patientInfo.reason) {
        description += `\n💬 Motif: ${patientInfo.reason}`;
      }

      const event = {
        summary: `🏥 RDV - ${patientInfo.name}`,
        description: description,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        transparency: 'opaque', // Bloque le calendrier (créneau pris)
        colorId: '2', // Bleu pour les RDV
        attendees: [
          { email: patientInfo.email, displayName: patientInfo.name },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24h avant
            { method: 'email', minutes: 60 },      // 1h avant
            { method: 'popup', minutes: 30 },      // 30min avant
          ],
        },
        extendedProperties: {
          private: {
            isAvailabilitySlot: 'false',
            isAppointment: 'true',
            patientName: patientInfo.name,
            patientEmail: patientInfo.email,
            bookedBy: 'availabilitySync',
          },
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event,
        sendUpdates: 'all', // Envoyer des notifications
      });

      console.log('[AvailabilitySync] Rendez-vous créé:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('[AvailabilitySync] Erreur lors de la réservation:', error);
      return null;
    }
  }

  /**
   * Vérifier la disponibilité d'un créneau
   */
  async checkAvailability(
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

      // Utiliser l'API freebusy pour vérifier les conflits
      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin: startDateTime.toISOString(),
          timeMax: endDateTime.toISOString(),
          items: [{ id: this.config.calendarId }],
        },
      });

      const busySlots = response.data.calendars[this.config.calendarId]?.busy || [];
      const isAvailable = busySlots.length === 0;

      console.log(`[AvailabilitySync] Vérification disponibilité: ${isAvailable ? 'LIBRE' : 'OCCUPÉ'}`);
      return isAvailable;
    } catch (error) {
      console.error('[AvailabilitySync] Erreur lors de la vérification:', error);
      return false;
    }
  }

  /**
   * Synchroniser les créneaux de disponibilité pour une période
   * Crée des créneaux récurrents automatiquement
   */
  async syncAvailabilityPeriod(
    startDate: Date,
    endDate: Date,
    workingHours: {
      start: string;
      end: string;
    },
    daysOfWeek: number[], // 0=dimanche, 1=lundi, etc.
    slotDuration: number = 60
  ): Promise<{ created: number; errors: number }> {
    const stats = { created: 0, errors: 0 };
    
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    
    const finalDate = new Date(endDate);
    finalDate.setHours(23, 59, 59, 999);

    console.log(`[AvailabilitySync] Synchronisation du ${currentDate.toLocaleDateString()} au ${finalDate.toLocaleDateString()}`);

    while (currentDate <= finalDate) {
      const dayOfWeek = currentDate.getDay();
      
      // Vérifier si ce jour fait partie des jours de travail
      if (daysOfWeek.includes(dayOfWeek)) {
        const [startHour, startMin] = workingHours.start.split(':').map(Number);
        const [endHour, endMin] = workingHours.end.split(':').map(Number);
        
        let slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMin, 0, 0);
        
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(endHour, endMin, 0, 0);
        
        while (slotStart < dayEnd) {
          const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
          
          if (slotEnd <= dayEnd) {
            const startTimeStr = `${slotStart.getHours().toString().padStart(2, '0')}:${slotStart.getMinutes().toString().padStart(2, '0')}`;
            const endTimeStr = `${slotEnd.getHours().toString().padStart(2, '0')}:${slotEnd.getMinutes().toString().padStart(2, '0')}`;
            
            const eventId = await this.createAvailabilitySlot(
              new Date(slotStart),
              startTimeStr,
              endTimeStr
            );
            
            if (eventId) {
              stats.created++;
            } else {
              stats.errors++;
            }
          }
          
          slotStart = slotEnd;
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`[AvailabilitySync] Synchronisation terminée: ${stats.created} créneaux créés, ${stats.errors} erreurs`);
    return stats;
  }
}

/**
 * Factory pour créer le service de synchronisation
 */
export function createAvailabilitySyncService(): AvailabilitySyncService | null {
  const config = {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    serviceAccountPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '',
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  };

  if (!config.serviceAccountEmail || !config.serviceAccountPrivateKey) {
    console.warn('[AvailabilitySync] Configuration incomplète. Service désactivé.');
    return null;
  }

  try {
    return new AvailabilitySyncService(config);
  } catch (error) {
    console.error('[AvailabilitySync] Erreur lors de l\'initialisation:', error);
    return null;
  }
}

// Instance singleton
let syncServiceInstance: AvailabilitySyncService | null = null;

export function getAvailabilitySyncService(): AvailabilitySyncService | null {
  if (!syncServiceInstance) {
    syncServiceInstance = createAvailabilitySyncService();
  }
  return syncServiceInstance;
}
