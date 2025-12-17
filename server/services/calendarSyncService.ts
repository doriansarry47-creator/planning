import { google } from 'googleapis';
import { eq, and, gte, lte, isNotNull, not, inArray, or } from 'drizzle-orm';

interface SyncConfig {
  serviceAccountEmail: string;
  serviceAccountPrivateKey: string;
  calendarId: string;
}

interface SyncResult {
  synced: number;
  cancelled: number;
  errors: number;
  freedSlots: number;
  details: string[];
}

export class CalendarSyncService {
  private auth: any;
  private calendar: any;
  private config: SyncConfig;

  constructor(config: SyncConfig) {
    this.config = config;
    
    this.auth = new google.auth.JWT({
      email: config.serviceAccountEmail,
      key: config.serviceAccountPrivateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  /**
   * Synchroniser les rendez-vous entre Google Calendar et la base de données
   * Détecte les rendez-vous supprimés sur Google Calendar et les met à jour en BDD
   */
  async syncDeletedAppointments(): Promise<SyncResult> {
    const result: SyncResult = {
      synced: 0,
      cancelled: 0,
      errors: 0,
      freedSlots: 0,
      details: [],
    };

    try {
      const { getDb } = await import('../db');
      const { appointments } = await import('../../drizzle/schema');
      const db = await getDb();

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const activeAppointments = await db
        .select()
        .from(appointments)
        .where(
          and(
            or(
              eq(appointments.status, 'confirmed'),
              eq(appointments.status, 'pending'),
              eq(appointments.status, 'scheduled')
            ),
            isNotNull(appointments.googleEventId),
            gte(appointments.startTime, now),
            lte(appointments.startTime, thirtyDaysFromNow)
          )
        );

      console.log(`[CalendarSync] ${activeAppointments.length} rendez-vous actifs avec googleEventId à vérifier`);

      for (const appointment of activeAppointments) {
        try {
          if (!appointment.googleEventId) continue;

          const eventExists = await this.checkEventExists(appointment.googleEventId);

          if (!eventExists) {
            await db
              .update(appointments)
              .set({
                status: 'cancelled',
                updatedAt: new Date(),
              })
              .where(eq(appointments.id, appointment.id));

            result.cancelled++;
            result.freedSlots++;
            result.details.push(
              `RDV #${appointment.id} (${appointment.customerName}) annulé - événement supprimé sur Google Calendar`
            );

            console.log(
              `[CalendarSync] RDV ${appointment.id} marqué comme annulé - googleEventId ${appointment.googleEventId} supprimé`
            );
          } else {
            result.synced++;
          }
        } catch (error: any) {
          result.errors++;
          result.details.push(
            `Erreur RDV #${appointment.id}: ${error.message}`
          );
          console.error(
            `[CalendarSync] Erreur vérification RDV ${appointment.id}:`,
            error.message
          );
        }
      }

      console.log(`[CalendarSync] Synchronisation terminée:`, result);
      return result;
    } catch (error: any) {
      console.error('[CalendarSync] Erreur globale de synchronisation:', error);
      result.errors++;
      result.details.push(`Erreur globale: ${error.message}`);
      return result;
    }
  }

  /**
   * Vérifier si un événement existe toujours dans Google Calendar
   */
  async checkEventExists(eventId: string): Promise<boolean> {
    try {
      const response = await this.calendar.events.get({
        calendarId: this.config.calendarId,
        eventId: eventId,
      });

      if (response.data.status === 'cancelled') {
        return false;
      }

      return true;
    } catch (error: any) {
      if (error.code === 404 || error.response?.status === 404) {
        return false;
      }
      if (error.code === 410 || error.response?.status === 410) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Récupérer les rendez-vous existants sur Google Calendar
   * et les comparer avec la base de données locale
   */
  async getCalendarAppointments(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        showDeleted: true,
      });

      const events = response.data.items || [];
      
      return events.filter((event: any) => {
        const isAppointment = 
          event.extendedProperties?.private?.isAppointment === 'true' ||
          event.summary?.includes('RDV') ||
          event.summary?.includes('rendez-vous') ||
          event.summary?.includes('Consultation');
        
        return isAppointment;
      });
    } catch (error) {
      console.error('[CalendarSync] Erreur récupération événements:', error);
      return [];
    }
  }

  /**
   * Synchronisation complète: récupère les événements supprimés
   * depuis la dernière synchronisation
   */
  async fullSync(lastSyncTime?: Date): Promise<SyncResult> {
    const result: SyncResult = {
      synced: 0,
      cancelled: 0,
      errors: 0,
      freedSlots: 0,
      details: [],
    };

    try {
      const syncToken = lastSyncTime ? undefined : null;
      
      const response = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        showDeleted: true,
        updatedMin: lastSyncTime?.toISOString(),
        singleEvents: true,
        maxResults: 250,
      });

      const events = response.data.items || [];
      const deletedEvents = events.filter(
        (event: any) => event.status === 'cancelled'
      );

      console.log(
        `[CalendarSync] ${deletedEvents.length} événements supprimés détectés`
      );

      if (deletedEvents.length > 0) {
        const { getDb } = await import('../db');
        const { appointments } = await import('../../drizzle/schema');
        const db = await getDb();

        for (const event of deletedEvents) {
          try {
            const existingAppointment = await db
              .select()
              .from(appointments)
              .where(
                and(
                  eq(appointments.googleEventId, event.id),
                  or(
                    eq(appointments.status, 'confirmed'),
                    eq(appointments.status, 'pending'),
                    eq(appointments.status, 'scheduled')
                  )
                )
              )
              .limit(1);

            if (existingAppointment.length > 0) {
              await db
                .update(appointments)
                .set({
                  status: 'cancelled',
                  updatedAt: new Date(),
                })
                .where(eq(appointments.id, existingAppointment[0].id));

              result.cancelled++;
              result.freedSlots++;
              result.details.push(
                `RDV #${existingAppointment[0].id} annulé suite à suppression Google Calendar`
              );
            }
          } catch (error: any) {
            result.errors++;
            console.error(
              `[CalendarSync] Erreur traitement événement supprimé ${event.id}:`,
              error
            );
          }
        }
      }

      return result;
    } catch (error: any) {
      console.error('[CalendarSync] Erreur fullSync:', error);
      result.errors++;
      result.details.push(`Erreur fullSync: ${error.message}`);
      return result;
    }
  }
}

let syncServiceInstance: CalendarSyncService | null = null;

export function createCalendarSyncService(): CalendarSyncService | null {
  const config = {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    serviceAccountPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '',
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'doriansarry47@gmail.com',
  };

  if (!config.serviceAccountEmail || !config.serviceAccountPrivateKey) {
    console.warn('[CalendarSync] Configuration incomplète. Service désactivé.');
    return null;
  }

  try {
    return new CalendarSyncService(config);
  } catch (error) {
    console.error('[CalendarSync] Erreur initialisation:', error);
    return null;
  }
}

export function getCalendarSyncService(): CalendarSyncService | null {
  if (!syncServiceInstance) {
    syncServiceInstance = createCalendarSyncService();
  }
  return syncServiceInstance;
}
