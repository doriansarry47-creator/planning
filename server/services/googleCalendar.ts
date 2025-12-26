import { google } from 'googleapis';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Europe/Paris';

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
    const privateKey = config.serviceAccountPrivateKey
      .replace(/\\n/g, '\n') // Remplacer les \n littéraux par de vrais sauts de ligne
      .replace(/"/g, '')     // Enlever les guillemets résiduels
      .trim();               // Nettoyer les espaces

    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      console.error('[GoogleCalendar] ❌ Erreur critique: La clé privée semble mal formatée (pas de header PEM)');
    }

    this.auth = new google.auth.JWT({
      email: config.serviceAccountEmail,
      key: privateKey,
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
   * Lit les plages de disponibilité du Google Calendar et génère des créneaux de 60 min
   * Filtre les créneaux déjà réservés
   */
  async getAvailabilitySlots(
    startDate: Date,
    endDate: Date,
    slotDuration: number = 60
  ): Promise<Array<{ date: Date; startTime: string; endTime: string; isAvailable: boolean }>> {
    try {
      console.log(`[GoogleCalendar] 📅 Récupération des créneaux entre ${startDate.toISOString()} et ${endDate.toISOString()}`);
      
      // Récupérer tous les événements (disponibilités + rendez-vous)
      // showDeleted: false pour exclure les événements supprimés
      const response = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        showDeleted: false, // NE PAS inclure les événements supprimés
      });

      const events = response.data.items || [];
      console.log(`[GoogleCalendar] 📋 ${events.length} événements trouvés au total`);
      
      // Filtrer les événements annulés (status !== 'cancelled')
      const activeEvents = events.filter((event: any) => 
        event.status !== 'cancelled' && event.status !== 'deleted'
      );
      console.log(`[GoogleCalendar] ✅ ${activeEvents.length} événements actifs (${events.length - activeEvents.length} annulés/supprimés ignorés)`);
      
      const slots: Array<{ date: Date; startTime: string; endTime: string; isAvailable: boolean }> = [];

      // Séparer les créneaux de disponibilité des rendez-vous
      // Un créneau de disponibilité peut être :
      // 1. Marqué avec extendedProperties.isAvailabilitySlot
      // 2. Transparent (ne bloque pas le calendrier)
      // 3. Contient "DISPONIBLE" dans le titre
      const availabilityEvents = activeEvents.filter(
        (event: any) => 
          event.extendedProperties?.private?.isAvailabilitySlot === 'true' ||
          event.transparency === 'transparent' ||
          event.summary?.includes('DISPONIBLE')
      );
      
      // Les rendez-vous sont les événements qui bloquent vraiment le calendrier
      const appointments = activeEvents.filter(
        (event: any) => 
          event.extendedProperties?.private?.isAppointment === 'true' || 
          (event.transparency === 'opaque' && !event.summary?.includes('DISPONIBLE')) ||
          (!event.transparency && !event.summary?.includes('DISPONIBLE'))
      );

      console.log(`[GoogleCalendar] ✅ ${availabilityEvents.length} plages de disponibilité trouvées`);
      console.log(`[GoogleCalendar] 📌 ${appointments.length} rendez-vous existants`);

      // Pour chaque plage de disponibilité, générer des créneaux de 60 minutes
      for (const availEvent of availabilityEvents) {
        if (!availEvent.start?.dateTime || !availEvent.end?.dateTime) {
          console.log(`[GoogleCalendar] ⚠️ Événement sans date/heure ignoré: ${availEvent.summary}`);
          continue;
        }

        const slotStart = new Date(availEvent.start.dateTime);
        const slotEnd = new Date(availEvent.end.dateTime);

        console.log(`[GoogleCalendar] 🔍 Analyse plage: ${slotStart.toLocaleString('fr-FR')} - ${slotEnd.toLocaleString('fr-FR')}`);

        // Découper la plage en créneaux de 60 minutes
        let currentTime = new Date(slotStart);
        while (currentTime < slotEnd) {
          const nextTime = new Date(currentTime.getTime() + slotDuration * 60000);
          
          // Ne pas créer de créneau qui dépasse la plage de disponibilité
          if (nextTime > slotEnd) {
            console.log(`[GoogleCalendar] ⏩ Créneau incomplet ignoré à ${currentTime.toLocaleTimeString('fr-FR')}`);
            break;
          }

          const startTimeStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
          const endTimeStr = `${nextTime.getHours().toString().padStart(2, '0')}:${nextTime.getMinutes().toString().padStart(2, '0')}`;

            const dateStr = formatInTimeZone(currentTime, TIMEZONE, 'yyyy-MM-dd');
            const slotKey = `${dateStr}|${startTimeStr}|${endTimeStr}`;
            
            const isBooked = appointments.some((appt: any) => {
              if (!appt.start?.dateTime || !appt.end?.dateTime) return false;
              const apptStart = new Date(appt.start.dateTime);
              const apptEnd = new Date(appt.end.dateTime);
              
              // Clé de l'événement réservé pour le log
              const bookedDate = formatInTimeZone(apptStart, TIMEZONE, 'yyyy-MM-dd');
              const bookedStart = formatInTimeZone(apptStart, TIMEZONE, 'HH:mm');
              const bookedEnd = formatInTimeZone(apptEnd, TIMEZONE, 'HH:mm');
              const bookedKey = `${bookedDate}|${bookedStart}|${bookedEnd}`;
              
              // Il y a chevauchement si le début du slot est avant la fin du RDV 
              // ET la fin du slot est après le début du RDV
              const overlaps = currentTime < apptEnd && nextTime > apptStart;
              
              if (overlaps) {
                console.log(`[GoogleCalendar] ⛔ Slot ${slotKey} bloqué par RDV ${bookedKey} (${appt.summary})`);
              }
              
              return overlaps;
            });

        // COMMENTÉ: Filtrage "now" déplacé vers le frontend
        /*
        const now = new Date();
        const nowZoned = toZonedTime(now, TIMEZONE);
        const isPast = nextTime.getTime() <= nowZoned.getTime();
        
        if (!isPast) {
        */
            const isAvailable = !isBooked;
            
            // Extraire la date normalisée (YYYY-MM-DD)
            const dateStr = formatInTimeZone(currentTime, TIMEZONE, 'yyyy-MM-dd');
            const [year, month, day] = dateStr.split('-').map(Number);
            
            slots.push({
              date: new Date(year, month - 1, day),
              startTime: startTimeStr,
              endTime: endTimeStr,
              isAvailable: isAvailable,
            });

            if (isAvailable) {
              console.log(`[GoogleCalendar] ✅ Créneau conservé (filtrage frontend requis): ${startTimeStr} - ${endTimeStr} (${dateStr})`);
            }
        /*
          } else {
            console.log(`[GoogleCalendar] ⏮️ Créneau passé ignoré: ${startTimeStr} (${formatInTimeZone(nextTime, TIMEZONE, 'yyyy-MM-dd HH:mm')})`);
          }
        */

          currentTime = nextTime;
        }
      }

      const availableCount = slots.filter(s => s.isAvailable).length;
      console.log(`[GoogleCalendar] 📊 Résultat: ${slots.length} créneaux générés, ${availableCount} disponibles`);

      return slots;
    } catch (error: any) {
      console.error('[GoogleCalendar] ❌ Erreur lors de la récupération des créneaux:', error.message);
      if (error.response?.data) {
        console.error('[GoogleCalendar] Détails:', error.response.data);
      }
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
 * Supporte deux méthodes de configuration:
 * 1. Variables d'environnement (recommandé pour Vercel/production)
 * 2. Fichier JSON du Service Account (pour développement local)
 * 
 * Variables d'environnement:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Email du Service Account
 * - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: Clé privée du Service Account
 * - GOOGLE_CALENDAR_ID: ID du calendrier (ex: 'primary' ou l'email du calendrier)
 * 
 * OU fichier JSON:
 * - server/google-service-account.json
 */
import * as fs from 'fs';
import * as path from 'path';

const SERVICE_ACCOUNT_JSON_PATH = path.join(process.cwd(), 'server', 'google-service-account.json');

export function createGoogleCalendarService(): GoogleCalendarService | null {
  let config: GoogleCalendarConfig;
  
  // Méthode 1: Essayer d'abord les variables d'environnement (prioritaire pour Vercel)
  const envEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const envPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'doriansarry47@gmail.com';

  if (envEmail && envPrivateKey) {
    console.log('[GoogleCalendar] Utilisation des variables d\'environnement pour la configuration');
    
    // Nettoyer la clé privée des guillemets (le replace des \n est fait dans le constructeur)
    let cleanedPrivateKey = envPrivateKey
      .replace(/^["']|["']$/g, ''); // Enlever les guillemets

    config = {
      serviceAccountEmail: envEmail,
      serviceAccountPrivateKey: cleanedPrivateKey,
      calendarId: calendarId,
    };
  } else {
    // Méthode 2: Essayer de lire le fichier JSON local
    console.log('[GoogleCalendar] Variables d\'environnement non trouvées, tentative de lecture du fichier JSON');
    
    try {
      const jsonContent = fs.readFileSync(SERVICE_ACCOUNT_JSON_PATH, 'utf-8');
      const serviceAccountConfig = JSON.parse(jsonContent);
      
      config = {
        serviceAccountEmail: serviceAccountConfig.client_email || '',
        serviceAccountPrivateKey: serviceAccountConfig.private_key || '',
        calendarId: calendarId,
      };
      
      console.log('[GoogleCalendar] Configuration chargée depuis le fichier JSON');
    } catch (error) {
      console.warn('[GoogleCalendar] ⚠️ Aucune configuration trouvée (ni variables d\'environnement, ni fichier JSON). Synchronisation Google Calendar désactivée.');
      return null;
    }
  }

  // Vérifier que toutes les variables sont définies
  if (!config.serviceAccountEmail || !config.serviceAccountPrivateKey) {
    console.warn('[GoogleCalendar] ⚠️ Configuration incomplète. Synchronisation Google Calendar désactivée.');
    return null;
  }

  try {
    const service = new GoogleCalendarService(config);
    console.log('[GoogleCalendar] ✅ Service Google Calendar initialisé avec succès');
    return service;
  } catch (error: any) {
    console.error('[GoogleCalendar] ❌ Erreur lors de l\'initialisation du service:', error.message);
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
