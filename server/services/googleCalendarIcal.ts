import ical from 'node-ical';
import { google } from 'googleapis';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * Service pour lire les disponibilités depuis Google Calendar via iCal
 * et créer des rendez-vous avec la clé privée
 */

const TIMEZONE = 'Europe/Paris';

export interface AvailableSlot {
  date: string; // Format ISO date (YYYY-MM-DD)
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
   * Normaliser une date en Europe/Paris et extraire la clé YYYY-MM-DD à minuit
   * Garantit une comparaison cohérente quelque soit le timezone serveur
   */
  private normalizeDateToMidnightParis(date: Date): Date {
    // Convertir en Europe/Paris
    const zonedDate = toZonedTime(date, TIMEZONE);
    // Extraire YYYY-MM-DD
    const dateStr = formatInTimeZone(zonedDate, TIMEZONE, 'yyyy-MM-dd');
    // Recréer une date à minuit en Europe/Paris
    const [year, month, day] = dateStr.split('-').map(Number);
    const midnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    return toZonedTime(midnight, TIMEZONE);
  }

  /**
   * Récupérer les disponibilités depuis l'iCal public
   * Filtre automatiquement les créneaux déjà réservés (dans iCal ET dans la base de données)
   */
  async getAvailableSlots(startDate?: Date, endDate?: Date): Promise<AvailableSlot[]> {
    try {
      console.log('[GoogleCalendarIcal] 📅 Récupération des disponibilités depuis iCal URL...');
      console.log(`[GoogleCalendarIcal] 🌍 Environnement serveur:`);
      console.log(`  - nodeEnv: ${process.env.NODE_ENV}`);
      console.log(`  - vercelEnv: ${process.env.VERCEL_ENV || 'N/A'}`);
      console.log(`  - timezone système: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
      console.log(`  - serverTime (UTC): ${new Date().toISOString()}`);
      console.log(`  - serverTime (Paris): ${formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss zzz')}`);
      
      // 🔧 CORRECTION CRITIQUE: Normaliser les dates de filtrage en mode "date seule" à minuit Paris
      // Pour éviter les problèmes de timezone entre UTC (Vercel) et Europe/Paris
      const now = new Date();
      const nowZoned = toZonedTime(now, TIMEZONE);
      
      // Si startDate/endDate sont fournis, les normaliser à minuit Paris
      // Sinon utiliser maintenant et +90 jours
      let filterStartDate: Date;
      let filterEndDate: Date;
      
      if (startDate) {
        filterStartDate = this.normalizeDateToMidnightParis(startDate);
      } else {
        // Par défaut: aujourd'hui à minuit Paris
        filterStartDate = this.normalizeDateToMidnightParis(nowZoned);
      }
      
      if (endDate) {
        filterEndDate = this.normalizeDateToMidnightParis(endDate);
        // Ajouter 23h59m59s pour inclure toute la journée
        filterEndDate = new Date(filterEndDate.getTime() + 24 * 60 * 60 * 1000 - 1000);
      } else {
        // Par défaut: +90 jours à 23h59 Paris
        const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        filterEndDate = this.normalizeDateToMidnightParis(future);
        filterEndDate = new Date(filterEndDate.getTime() + 24 * 60 * 60 * 1000 - 1000);
      }

      console.log(`[GoogleCalendarIcal] 🕒 Temps actuel (Paris): ${formatInTimeZone(nowZoned, TIMEZONE, 'yyyy-MM-dd HH:mm:ss')}`);
      console.log(`[GoogleCalendarIcal] 📅 Filtre du ${formatInTimeZone(filterStartDate, TIMEZONE, 'yyyy-MM-dd HH:mm:ss')} au ${formatInTimeZone(filterEndDate, TIMEZONE, 'yyyy-MM-dd HH:mm:ss')}`);
      console.log(`[GoogleCalendarIcal] 🔢 Timestamps: start=${filterStartDate.getTime()}, end=${filterEndDate.getTime()}`);

      const slots: AvailableSlot[] = [];
      const bookedSlots: Set<string> = new Set();

      // Parser l'URL iCal
      const events = await ical.async.fromURL(this.icalUrl);
      console.log('[GoogleCalendarIcal] Événements total dans iCal:', Object.keys(events).length);
      
      // Première passe: collecter les créneaux réservés (rendez-vous)
      let totalEvents = 0;
      let bookedEvents = 0;
      let availableEvents = 0;
      
      Object.values(events).forEach((event: any) => {
        if (event.type !== 'VEVENT') return;
        totalEvents++;

        const summary = event.summary || '';
        const title = summary.toLowerCase();
        
        // Identifier les rendez-vous réservés
        const isBooked = 
          title.includes('réservé') || 
          title.includes('reserve') ||
          title.includes('consultation') ||
          title.includes('rdv') ||
          title.includes('rendez-vous') ||
          title.includes('🔴') ||
          title.includes('🩺') ||
          event.transparency === 'opaque';

        if (isBooked && !title.includes('disponible')) {
          bookedEvents++;
          const eventStart = toZonedTime(new Date(event.start), TIMEZONE);
          const eventEnd = toZonedTime(new Date(event.end), TIMEZONE);
          
          const dateStr = formatInTimeZone(eventStart, TIMEZONE, 'yyyy-MM-dd');
          const startTime = formatInTimeZone(eventStart, TIMEZONE, 'HH:mm');
          const endTime = formatInTimeZone(eventEnd, TIMEZONE, 'HH:mm');
          
          const slotKey = `${dateStr}|${startTime}|${endTime}`;
          bookedSlots.add(slotKey);
          console.log('[GoogleCalendarIcal] 🔴 Bloqué (iCal):', slotKey, `(${summary})`);
        }
      });
      
      console.log(`[GoogleCalendarIcal] 📊 iCal: ${totalEvents} événements, ${bookedEvents} réservés détectés`);

      // Récupérer aussi les rendez-vous confirmés depuis la base de données
      let dbAppointmentsCount = 0;
      try {
        const { getDb } = await import('../db');
        const db = await getDb();
        if (db) {
          const { appointments } = await import('../../drizzle/schema');
          const { inArray, gte, lte, and } = await import('drizzle-orm');
          
          const dbAppointments = await db
            .select({
              startTime: appointments.startTime,
              endTime: appointments.endTime,
              status: appointments.status,
            })
            .from(appointments)
            .where(
              and(
                inArray(appointments.status, ['confirmed', 'pending', 'scheduled']),
                gte(appointments.startTime, filterStartDate),
                lte(appointments.endTime, filterEndDate)
              )
            );

          dbAppointmentsCount = dbAppointments.length;
          for (const apt of dbAppointments) {
            const aptStart = toZonedTime(new Date(apt.startTime), TIMEZONE);
            const aptEnd = toZonedTime(new Date(apt.endTime), TIMEZONE);
            
            const dateStr = formatInTimeZone(aptStart, TIMEZONE, 'yyyy-MM-dd');
            const startTime = formatInTimeZone(aptStart, TIMEZONE, 'HH:mm');
            const endTime = formatInTimeZone(aptEnd, TIMEZONE, 'HH:mm');
            
            const slotKey = `${dateStr}|${startTime}|${endTime}`;
            bookedSlots.add(slotKey);
            console.log('[GoogleCalendarIcal] 🗄️ Créneau réservé (BD):', slotKey);
          }
        }
      } catch (dbError) {
        console.warn('[GoogleCalendarIcal] ⚠️ Impossible de vérifier les rdv en BD:', dbError);
      }
      
      console.log(`[GoogleCalendarIcal] 📊 BD: ${dbAppointmentsCount} rendez-vous confirmés`);

      // Deuxième passe: collecter les créneaux disponibles et filtrer les réservés
      let candidateSlots = 0;
      let outsidePeriod = 0;
      let overlapping = 0;
      let kept = 0;
      
      Object.values(events).forEach((event: any) => {
        if (event.type !== 'VEVENT') return;

        const title = event.summary?.toLowerCase() || '';
        
        // Filtrer les événements qui marquent les disponibilités
        const isAvailable = 
          title.includes('disponible') || 
          title.includes('available') || 
          title.includes('dispo') ||
          title.includes('🟢') ||
          title.includes('libre') ||
          title.includes('free');

        if (!isAvailable) {
          // Log uniquement si c'est un créneau potentiel mais pas marqué dispo
          if (event.transparency === 'transparent') {
            console.log('[GoogleCalendarIcal] ⏭️ Transparent mais pas de mot-clé dispo:', event.summary);
          }
          return;
        }
        
        availableEvents++;
        candidateSlots++;
        console.log(`[GoogleCalendarIcal] 🟢 DISPONIBILITÉ détectée: ${event.summary}`);

        const eventStart = toZonedTime(new Date(event.start), TIMEZONE);
        const eventEnd = toZonedTime(new Date(event.end), TIMEZONE);
        
        const eventStartTs = eventStart.getTime();
        const eventEndTs = eventEnd.getTime();
        const filterStartTs = filterStartDate.getTime();
        const filterEndTs = filterEndDate.getTime();

        // 🔧 CORRECTION CRITIQUE: Vérifier si le créneau chevauche la période demandée
        // Un créneau est dans la période si: début < fin_période ET fin > début_période
        const isInPeriod = eventStartTs < filterEndTs && eventEndTs > filterStartTs;
        
        if (!isInPeriod) {
          outsidePeriod++;
          console.log(`[GoogleCalendarIcal] ⏭️ Disponibilité hors période: ${formatInTimeZone(eventStart, TIMEZONE, 'yyyy-MM-dd HH:mm')}`);
          console.log(`  - Event: start=${eventStartTs} (${formatInTimeZone(eventStart, TIMEZONE, 'yyyy-MM-dd HH:mm')}), end=${eventEndTs}`);
          console.log(`  - Filter: start=${filterStartTs} (${formatInTimeZone(filterStartDate, TIMEZONE, 'yyyy-MM-dd HH:mm')}), end=${filterEndTs}`);
          console.log(`  - Condition: ${eventStartTs} < ${filterEndTs} = ${eventStartTs < filterEndTs}, ${eventEndTs} > ${filterStartTs} = ${eventEndTs > filterStartTs}`);
          return;
        }

        console.log(`[GoogleCalendarIcal] ✅ Créneau dans la période: ${formatInTimeZone(eventStart, TIMEZONE, 'yyyy-MM-dd HH:mm')}`);

        // Calculer la durée en minutes
        const duration = Math.round((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60));

        // Extraire la date et les heures normalisées
        const dateStr = formatInTimeZone(eventStart, TIMEZONE, 'yyyy-MM-dd');
        const startTime = formatInTimeZone(eventStart, TIMEZONE, 'HH:mm');
        const endTime = formatInTimeZone(eventEnd, TIMEZONE, 'HH:mm');

        // Vérifier que ce créneau n'est pas déjà réservé
        const slotKey = `${dateStr}|${startTime}|${endTime}`;
        if (bookedSlots.has(slotKey)) {
          overlapping++;
          console.log('[GoogleCalendarIcal] ❌ Créneau filtré (réservé dans BD):', slotKey);
          return;
        }

        // Vérifier également le chevauchement avec les créneaux réservés
        let isOverlapping = false;
        for (const bookedKey of bookedSlots) {
          const [bookedDate, bookedStart, bookedEnd] = bookedKey.split('|');
          if (bookedDate === dateStr) {
            const slotStartMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
            const slotEndMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
            const bookedStartMinutes = parseInt(bookedStart.split(':')[0]) * 60 + parseInt(bookedStart.split(':')[1]);
            const bookedEndMinutes = parseInt(bookedEnd.split(':')[0]) * 60 + parseInt(bookedEnd.split(':')[1]);
            
            // Vérifier le chevauchement
            if (slotStartMinutes < bookedEndMinutes && slotEndMinutes > bookedStartMinutes) {
              isOverlapping = true;
              overlapping++;
              console.log('[GoogleCalendarIcal] ❌ Créneau filtré (chevauchement):', slotKey, 'avec', bookedKey);
              break;
            }
          }
        }

        if (isOverlapping) return;

        kept++;
        console.log('[GoogleCalendarIcal] ✅ Créneau disponible ajouté:', dateStr, startTime, '-', endTime);
        slots.push({
          date: dateStr,
          startTime,
          endTime,
          duration,
          title: event.summary || 'Disponible',
        });
      });
      
      console.log(`[GoogleCalendarIcal] 📊 Statistiques de filtrage:`);
      console.log(`  - Total événements iCal: ${totalEvents}`);
      console.log(`  - Disponibilités détectées: ${availableEvents}`);
      console.log(`  - Blocages détectés: ${bookedEvents}`);
      console.log(`  - Rendez-vous en BD: ${dbAppointmentsCount}`);
      console.log(`  - Candidats analysés: ${candidateSlots}`);
      console.log(`  - Hors période: ${outsidePeriod}`);
      console.log(`  - Chevauchements: ${overlapping}`);
      console.log(`  - Créneaux conservés: ${kept}`);

      console.log(`[GoogleCalendarIcal] 🎯 RÉSULTAT FINAL: ${slots.length} créneaux bookables trouvés`);
      
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
      // Normaliser les dates pour Google Calendar
      // 🔧 CORRECTION: Utiliser une chaîne de caractères ISO pour éviter le décalage de timezone
      // appointment.date est au format YYYY-MM-DD
      const dateStr = typeof appointment.date === 'string' ? appointment.date : formatInTimeZone(appointment.date, TIMEZONE, 'yyyy-MM-dd');
      const startDateTime = toZonedTime(new Date(`${dateStr}T${appointment.startTime}:00`), TIMEZONE);
      const endDateTime = toZonedTime(new Date(`${dateStr}T${appointment.endTime}:00`), TIMEZONE);

      // Vérifier d'abord que le créneau est disponible
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
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: TIMEZONE,
        },
        // SANS attendees pour éviter l'erreur Domain-Wide Delegation
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 60 }, // 1h avant
          ],
        },
        colorId: '2', // Vert sauge pour les rendez-vous
        transparency: 'opaque', // Bloquer le créneau
      };

      // Créer le rendez-vous dans Google Calendar
      const response = await this.calendar.events.insert({
        calendarId: this.targetCalendarId,
        resource: event,
        sendUpdates: 'none', // Pas de notification automatique via Google
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
      // Construire les dates normalisées pour la recherche
      const startDateTime = toZonedTime(new Date(`${date}T${startTime}:00`), TIMEZONE);
      const endDateTime = toZonedTime(new Date(`${date}T${endTime}:00`), TIMEZONE);

      // Rechercher l'événement de disponibilité correspondant
      const response = await this.calendar.events.list({
        calendarId: this.targetCalendarId,
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        q: 'DISPONIBLE',
        singleEvents: true,
        showDeleted: false, // NE PAS inclure les événements supprimés
      });

      const allEvents = response.data.items || [];
      
      // Filtrer les événements annulés ou supprimés
      const events = allEvents.filter((event: any) => 
        event.status !== 'cancelled' && event.status !== 'deleted'
      );
      
      for (const event of events) {
        if (event.start?.dateTime && event.end?.dateTime) {
          const eventStart = new Date(event.start.dateTime);
          const eventEnd = new Date(event.end.dateTime);
          
          // Vérifier si c'est exactement le bon créneau
          if (eventStart.getTime() === startDateTime.getTime() && 
              eventEnd.getTime() === endDateTime.getTime()) {
            // Supprimer le créneau de disponibilité
            await this.calendar.events.delete({
              calendarId: this.targetCalendarId,
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
        calendarId: this.targetCalendarId,
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
      // 🔧 CORRECTION: Utiliser une chaîne de caractères ISO pour éviter le décalage de timezone
      // appointment.date est au format YYYY-MM-DD
      const dateStr = typeof appointment.date === 'string' ? appointment.date : formatInTimeZone(appointment.date, TIMEZONE, 'yyyy-MM-dd');
      const startDateTime = toZonedTime(new Date(`${dateStr}T${appointment.startTime}:00`), TIMEZONE);
      const endDateTime = toZonedTime(new Date(`${dateStr}T${appointment.endTime}:00`), TIMEZONE);

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
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: TIMEZONE,
        },
        attendees: [
          { email: appointment.patientEmail, displayName: appointment.patientName },
        ],
      };

      await this.calendar.events.update({
        calendarId: this.targetCalendarId,
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
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_CALENDAR_PRIVATE_KEY;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CALENDAR_EMAIL;
  const targetCalendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!icalUrl || !privateKey || !serviceAccountEmail) {
    console.warn('[GoogleCalendarIcal] Configuration incomplète. Variables requises:');
    console.warn('  - GOOGLE_CALENDAR_ICAL_URL:', icalUrl ? 'OK' : 'MANQUANT');
    console.warn('  - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:', privateKey ? 'OK' : 'MANQUANT');
    console.warn('  - GOOGLE_SERVICE_ACCOUNT_EMAIL:', serviceAccountEmail ? 'OK' : 'MANQUANT');
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
