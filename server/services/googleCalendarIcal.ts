import ical from 'node-ical';
import { google } from 'googleapis';

/**
 * Service pour lire les disponibilités depuis Google Calendar via iCal
 * et créer des rendez-vous avec la clé privée
 */

export interface AvailableSlot {
  date: string; // Format ISO date
  startTime: string; // Format HH:mm
  endTime: string; // Format HH:mm
  duration: number; // En minutes
  title: string;
}

export interface AppointmentData {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason?: string;
}

export class GoogleCalendarIcalService {
  private icalUrl: string;
  private privateKey: string;
  private serviceAccountEmail: string;
  private targetCalendarId: string;
  private auth: any;
  private calendar: any;

  constructor(icalUrl: string, privateKey: string, serviceAccountEmail: string, targetCalendarId?: string) {
    this.icalUrl = icalUrl;
    this.privateKey = privateKey;
    this.serviceAccountEmail = serviceAccountEmail;
    this.targetCalendarId = targetCalendarId || serviceAccountEmail; // Par défaut, le calendrier du Service Account

    // Initialiser l'authentification avec la clé privée
    this.auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    // Initialiser l'API Calendar
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  /**
   * Récupérer les disponibilités depuis l'iCal public
   */
  async getAvailableSlots(startDate?: Date, endDate?: Date): Promise<AvailableSlot[]> {
    try {
      console.log('[GoogleCalendarIcal] Récupération des disponibilités depuis iCal URL...');
      console.log('[GoogleCalendarIcal] URL iCal:', this.icalUrl?.substring(0, 100) + '...');
      
      const now = new Date();
      const filterStartDate = startDate || now;
      const filterEndDate = endDate || new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 jours par défaut

      const slots: AvailableSlot[] = [];

      // Parser l'URL iCal
      const events = await ical.async.fromURL(this.icalUrl);
      console.log('[GoogleCalendarIcal] Événements total dans iCal:', Object.keys(events).length);
      
      Object.values(events).forEach((event: any) => {
        // Filtrer uniquement les événements de type VEVENT
        if (event.type !== 'VEVENT') return;

        const title = event.summary?.toLowerCase() || '';
        console.log('[GoogleCalendarIcal] Événement trouvé:', event.summary, '| Disponible?', 
          title.includes('disponible') || title.includes('available') || title.includes('dispo'));
        
        // Filtrer les événements qui marquent les disponibilités
        const isAvailable = 
          title.includes('disponible') || 
          title.includes('available') || 
          title.includes('dispo') ||
          title.includes('🟢') ||
          title.includes('libre') ||
          title.includes('free');

        if (!isAvailable) return;

        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        // Filtrer par date
        if (eventStart < filterStartDate || eventStart > filterEndDate) return;

        // Vérifier que l'événement est dans le futur
        if (eventStart < now) return;

        // Calculer la durée en minutes
        const duration = Math.round((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60));

        // Extraire la date et les heures
        const dateStr = eventStart.toISOString().split('T')[0];
        const startTime = eventStart.toTimeString().slice(0, 5); // HH:mm
        const endTime = eventEnd.toTimeString().slice(0, 5); // HH:mm

        console.log('[GoogleCalendarIcal] ✅ Créneau disponible ajouté:', dateStr, startTime, '-', endTime);
        slots.push({
          date: dateStr,
          startTime,
          endTime,
          duration,
          title: event.summary || 'Disponible',
        });
      });

      console.log(`[GoogleCalendarIcal] ✅ ${slots.length} créneaux disponibles trouvés`);
      
      // Trier par date et heure
      slots.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

      return slots;
    } catch (error) {
      console.error('[GoogleCalendarIcal] Erreur lors de la récupération des disponibilités:', error);
      throw error;
    }
  }

  /**
   * Récupérer les disponibilités groupées par date
   */
  async getAvailableSlotsByDate(startDate?: Date, endDate?: Date): Promise<Record<string, AvailableSlot[]>> {
    const slots = await this.getAvailableSlots(startDate, endDate);
    
    const slotsByDate: Record<string, AvailableSlot[]> = {};
    
    slots.forEach(slot => {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = [];
      }
      slotsByDate[slot.date].push(slot);
    });

    return slotsByDate;
  }

  /**
   * Vérifier si un créneau spécifique est disponible
   */
  async isSlotAvailable(date: string, startTime: string, endTime: string): Promise<boolean> {
    try {
      const slots = await this.getAvailableSlots();
      
      return slots.some(slot => 
        slot.date === date && 
        slot.startTime === startTime && 
        slot.endTime === endTime
      );
    } catch (error) {
      console.error('[GoogleCalendarIcal] Erreur lors de la vérification de disponibilité:', error);
      return false;
    }
  }

  /**
   * Créer un rendez-vous dans Google Calendar
   * Cette fonction remplace le créneau disponible par un rendez-vous réel
   */
  async bookAppointment(appointment: AppointmentData): Promise<string | null> {
    try {
      // Construire la date/heure de début
      const startDateTime = new Date(appointment.date);
      const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      // Construire la date/heure de fin
      const endDateTime = new Date(appointment.date);
      const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Vérifier d'abord que le créneau est disponible
      const dateStr = appointment.date.toISOString().split('T')[0];
      const isAvailable = await this.isSlotAvailable(dateStr, appointment.startTime, appointment.endTime);
      
      if (!isAvailable) {
        console.warn('[GoogleCalendarIcal] Le créneau demandé n\'est plus disponible');
        return null;
      }

      // Construire la description de l'événement
      let description = `📅 Rendez-vous confirmé avec ${appointment.patientName}`;
      if (appointment.reason) {
        description += `\n\n📋 Motif: ${appointment.reason}`;
      }
      description += `\n\n📧 Email: ${appointment.patientEmail}`;
      if (appointment.patientPhone) {
        description += `\n📱 Téléphone: ${appointment.patientPhone}`;
      }

      // Créer l'événement de rendez-vous
      const event = {
        summary: `🩺 Consultation - ${appointment.patientName}`,
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
          { email: appointment.patientEmail, displayName: appointment.patientName },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 1440 }, // 24h avant
            { method: 'popup', minutes: 60 }, // 1h avant
          ],
        },
        colorId: '2', // Vert sauge pour les rendez-vous
        transparency: 'opaque', // Bloquer le créneau
      };

      // Créer le rendez-vous dans Google Calendar
      const response = await this.calendar.events.insert({
        calendarId: this.calendarEmail,
        resource: event,
        sendUpdates: 'all', // Envoyer des notifications aux participants
      });

      console.log('[GoogleCalendarIcal] Rendez-vous créé avec succès:', response.data.id);

      // Essayer de supprimer le créneau de disponibilité correspondant
      await this.removeAvailabilitySlot(dateStr, appointment.startTime, appointment.endTime);

      return response.data.id;
    } catch (error) {
      console.error('[GoogleCalendarIcal] Erreur lors de la création du rendez-vous:', error);
      return null;
    }
  }

  /**
   * Supprimer ou marquer comme réservé le créneau de disponibilité
   * (Optionnel - peut être géré manuellement dans Google Calendar)
   */
  private async removeAvailabilitySlot(date: string, startTime: string, endTime: string): Promise<void> {
    try {
      // Construire les dates
      const startDateTime = new Date(date + 'T' + startTime + ':00');
      const endDateTime = new Date(date + 'T' + endTime + ':00');

      // Rechercher l'événement de disponibilité correspondant
      const response = await this.calendar.events.list({
        calendarId: this.calendarEmail,
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        q: 'DISPONIBLE',
        singleEvents: true,
      });

      const events = response.data.items || [];
      
      for (const event of events) {
        if (event.start?.dateTime && event.end?.dateTime) {
          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);
          
          // Vérifier si c'est exactement le bon créneau
          if (eventStart.getTime() === startDateTime.getTime() && 
              eventEnd.getTime() === endDateTime.getTime()) {
            // Supprimer le créneau de disponibilité
            await this.calendar.events.delete({
              calendarId: this.calendarEmail,
              eventId: event.id,
            });
            console.log('[GoogleCalendarIcal] Créneau de disponibilité supprimé:', event.id);
            break;
          }
        }
      }
    } catch (error) {
      console.warn('[GoogleCalendarIcal] Impossible de supprimer le créneau de disponibilité:', error);
      // Ne pas faire échouer la réservation si on ne peut pas supprimer le créneau
    }
  }

  /**
   * Annuler un rendez-vous
   */
  async cancelAppointment(eventId: string): Promise<boolean> {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarEmail,
        eventId: eventId,
        sendUpdates: 'all', // Notifier les participants
      });

      console.log('[GoogleCalendarIcal] Rendez-vous annulé:', eventId);
      return true;
    } catch (error) {
      console.error('[GoogleCalendarIcal] Erreur lors de l\'annulation:', error);
      return false;
    }
  }

  /**
   * Mettre à jour un rendez-vous
   */
  async updateAppointment(eventId: string, appointment: AppointmentData): Promise<boolean> {
    try {
      const startDateTime = new Date(appointment.date);
      const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(appointment.date);
      const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      let description = `📅 Rendez-vous confirmé avec ${appointment.patientName}`;
      if (appointment.reason) {
        description += `\n\n📋 Motif: ${appointment.reason}`;
      }
      description += `\n\n📧 Email: ${appointment.patientEmail}`;
      if (appointment.patientPhone) {
        description += `\n📱 Téléphone: ${appointment.patientPhone}`;
      }

      const event = {
        summary: `🩺 Consultation - ${appointment.patientName}`,
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
          { email: appointment.patientEmail, displayName: appointment.patientName },
        ],
      };

      await this.calendar.events.update({
        calendarId: this.calendarEmail,
        eventId: eventId,
        resource: event,
        sendUpdates: 'all',
      });

      console.log('[GoogleCalendarIcal] Rendez-vous mis à jour:', eventId);
      return true;
    } catch (error) {
      console.error('[GoogleCalendarIcal] Erreur lors de la mise à jour:', error);
      return false;
    }
  }
}

/**
 * Factory function pour créer le service
 */
export function createGoogleCalendarIcalService(): GoogleCalendarIcalService | null {
  const icalUrl = process.env.GOOGLE_CALENDAR_ICAL_URL;
  const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY;
  const serviceAccountEmail = process.env.GOOGLE_CALENDAR_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const targetCalendarId = process.env.GOOGLE_CALENDAR_ID; // Calendrier personnel de l'utilisateur

  if (!icalUrl || !privateKey || !serviceAccountEmail) {
    console.warn('[GoogleCalendarIcal] Configuration incomplète. Variables requises:');
    console.warn('  - GOOGLE_CALENDAR_ICAL_URL');
    console.warn('  - GOOGLE_CALENDAR_PRIVATE_KEY');
    console.warn('  - GOOGLE_CALENDAR_EMAIL ou GOOGLE_SERVICE_ACCOUNT_EMAIL');
    return null;
  }

  try {
    console.log('[GoogleCalendarIcal] Service initialisé avec:');
    console.log('  - Service Account:', serviceAccountEmail);
    console.log('  - Calendrier cible:', targetCalendarId || 'défaut (Service Account)');
    return new GoogleCalendarIcalService(icalUrl, privateKey, serviceAccountEmail, targetCalendarId || undefined);
  } catch (error) {
    console.error('[GoogleCalendarIcal] Erreur lors de l\'initialisation:', error);
    return null;
  }
}

// Instance singleton
let calendarIcalServiceInstance: GoogleCalendarIcalService | null = null;

export function getGoogleCalendarIcalService(): GoogleCalendarIcalService | null {
  if (!calendarIcalServiceInstance) {
    calendarIcalServiceInstance = createGoogleCalendarIcalService();
  }
  return calendarIcalServiceInstance;
}
