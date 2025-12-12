import { google } from 'googleapis';
import { sendAppointmentConfirmationEmail, sendAppointmentNotificationToPractitioner } from './emailService';
import { nanoid } from 'nanoid';

/**
 * Service de synchronisation des disponibilités avec Google Calendar
 * 
 * Fonctionnalités:
 * - Synchronise les créneaux de disponibilité avec Google Calendar
 * - Masque automatiquement les créneaux déjà pris
 * - Ne retourne que les créneaux disponibles aux utilisateurs
 * - Marque les créneaux réservés comme "busy" dans Google Calendar
 * - Envoie des emails de confirmation automatiques
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
        // Un créneau de disponibilité doit avoir la propriété isAvailabilitySlot = true
        // OU contenir des mots-clés dans le titre ET être transparent
        const isSlot = event.extendedProperties?.private?.isAvailabilitySlot === 'true';
        const summary = event.summary?.toLowerCase() || '';
        const isTransparent = event.transparency === 'transparent';
        const hasAvailabilityKeyword = summary.includes('disponible') || summary.includes('🟢') || summary.includes('free') || summary.includes('available');
        
        return isSlot || (isTransparent && hasAvailabilityKeyword);
      });

      const bookedEvents = events.filter((event: any) => {
        // Un rendez-vous est tout événement qui N'EST PAS un créneau de disponibilité
        // ET qui bloque le calendrier (opaque)
        const isSlot = event.extendedProperties?.private?.isAvailabilitySlot === 'true';
        const isAppointment = event.extendedProperties?.private?.isAppointment === 'true';
        const summary = event.summary?.toLowerCase() || '';
        const isOpaque = event.transparency !== 'transparent';
        const hasAppointmentKeyword = summary.includes('rdv') || 
                                      summary.includes('rendez-vous') || 
                                      summary.includes('consultation') ||
                                      summary.includes('🏥') ||
                                      summary.includes('appointment');
        
        // Retourner vrai si c'est clairement un rendez-vous ou si c'est opaque et pas un slot
        return !isSlot && (isAppointment || isOpaque || hasAppointmentKeyword);
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
      console.log('[AvailabilitySync] Tentative de réservation:', { date, startTime, endTime, patientInfo });
      
      // D'abord, vérifier qu'il n'y a pas de conflit
      const isAvailable = await this.checkAvailability(date, startTime, endTime);
      
      if (!isAvailable) {
        console.log('[AvailabilitySync] ❌ Créneau déjà pris');
        return null;
      }

      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Générer un hash unique pour l'annulation
      const appointmentHash = nanoid();

      let description = `📋 Rendez-vous avec ${patientInfo.name}\n`;
      description += `📧 Email: ${patientInfo.email}\n`;
      if (patientInfo.phone) {
        description += `📱 Téléphone: ${patientInfo.phone}\n`;
      }
      if (patientInfo.reason) {
        description += `\n💬 Motif: ${patientInfo.reason}`;
      }
      description += `\n\n🔑 Code d'annulation: ${appointmentHash}`;

      // Préparer l'événement Google Calendar
      // Note: Service accounts ne peuvent pas inviter des participants (attendees)
      // sans Domain-Wide Delegation. Les informations du patient sont dans la description
      // et les propriétés étendues.
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
        // Les attendees sont désactivés car le service account nécessiterait
        // la Domain-Wide Delegation pour les inviter
        // attendees: [
        //   { 
        //     email: patientInfo.email, 
        //     displayName: patientInfo.name,
        //   },
        // ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24h avant (pour le praticien)
            { method: 'popup', minutes: 30 },      // 30min avant (pour le praticien)
          ],
        },
        extendedProperties: {
          private: {
            isAvailabilitySlot: 'false',
            isAppointment: 'true',
            patientName: patientInfo.name,
            patientEmail: patientInfo.email,
            patientPhone: patientInfo.phone || '',
            appointmentHash: appointmentHash,
            bookedBy: 'availabilitySync',
            bookedAt: new Date().toISOString(),
          },
        },
      };

      console.log('[AvailabilitySync] 📤 Envoi du rendez-vous vers Google Calendar...');
      
      // Créer l'événement dans Google Calendar
      // sendUpdates: 'none' car on gère les notifications par email nous-mêmes
      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event,
        sendUpdates: 'none', // Pas de notifications Google (on envoie nos propres emails)
      });

      const eventId = response.data.id;
      console.log('[AvailabilitySync] ✅ Rendez-vous créé dans Google Calendar:', eventId);

      // Envoyer l'email de confirmation au patient
      try {
        console.log('[AvailabilitySync] 📧 Envoi de l\'email de confirmation au patient...');
        const emailResult = await sendAppointmentConfirmationEmail({
          patientName: patientInfo.name,
          patientEmail: patientInfo.email,
          practitionerName: 'Dorian Sarry',
          date: date,
          startTime: startTime,
          endTime: endTime,
          reason: patientInfo.reason || 'Consultation',
          location: '20 rue des Jacobins, 24000 Périgueux',
          appointmentHash: appointmentHash,
        });

        if (emailResult.success) {
          console.log('[AvailabilitySync] ✅ Email de confirmation envoyé au patient:', emailResult.messageId);
        } else {
          console.error('[AvailabilitySync] ⚠️ Échec d\'envoi de l\'email au patient:', emailResult.error);
          console.log('[AvailabilitySync] ℹ️ Note: This is expected behavior when using a Resend trial account.');
        }
      } catch (emailError) {
        console.error('[AvailabilitySync] ⚠️ Erreur lors de l\'envoi de l\'email au patient:', emailError);
        // Ne pas faire échouer la réservation si l'email échoue
      }

      // Envoyer une notification au praticien
      try {
        console.log('[AvailabilitySync] 📧 Envoi de notification au praticien...');
        const notifResult = await sendAppointmentNotificationToPractitioner(
          {
            patientName: patientInfo.name,
            patientEmail: patientInfo.email,
            practitionerName: 'Dorian Sarry',
            date: date,
            startTime: startTime,
            endTime: endTime,
            reason: patientInfo.reason || 'Consultation',
            location: '20 rue des Jacobins, 24000 Périgueux',
            appointmentHash: appointmentHash,
          },
          'doriansarry47@gmail.com'
        );

        if (notifResult.success) {
          console.log('[AvailabilitySync] ✅ Notification envoyée au praticien:', notifResult.messageId);
        } else {
          console.error('[AvailabilitySync] ⚠️ Échec d\'envoi de la notification au praticien:', notifResult.error);
        }
      } catch (emailError) {
        console.error('[AvailabilitySync] ⚠️ Erreur lors de l\'envoi de la notification au praticien:', emailError);
      }

      console.log('[AvailabilitySync] 🎉 Réservation complète avec succès!');
      return eventId;
    } catch (error: any) {
      console.error('[AvailabilitySync] ❌ Erreur lors de la réservation:', error.message || error);
      if (error.response?.data) {
        console.error('[AvailabilitySync] Détails de l\'erreur API:', error.response.data);
      }
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
