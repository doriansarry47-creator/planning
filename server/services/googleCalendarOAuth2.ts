/**
 * ============================================================================
 * GOOGLE CALENDAR OAUTH 2.0 SERVICE
 * ============================================================================
 * 
 * Service robuste pour Google Calendar utilisant OAuth 2.0 avec refresh token.
 * 100% compatible Vercel (serverless, production).
 * 
 * ✅ Utilise refresh token pour obtenir automatiquement des access tokens
 * ✅ Gère l'expiration automatique des tokens
 * ✅ Pas de Service Account
 * ✅ Pas de dépendance iCal
 * ✅ Timezone explicite (Europe/Paris)
 * ✅ Compatible avec l'environnement stateless de Vercel
 * 
 * @author Claude - Senior Full-Stack Engineer
 * @date 2025-12-27
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { toZonedTime } from 'date-fns-tz';

/**
 * Configuration OAuth 2.0 pour Google Calendar
 */
interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarId: string;
  timezone: string;
}

/**
 * Créneau horaire disponible
 */
export interface TimeSlot {
  date: string;          // Format ISO 8601 (YYYY-MM-DD)
  startTime: string;     // Format HH:mm (ex: "09:00")
  endTime: string;       // Format HH:mm (ex: "10:00")
  duration: number;      // En minutes (ex: 60)
}

/**
 * Événement Google Calendar existant
 */
interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  status: string;
}

/**
 * Règles de travail (horaires d'ouverture)
 */
export interface WorkingHoursRules {
  timezone: string;                           // "Europe/Paris"
  workingDays: number[];                      // 1 = Lundi, 7 = Dimanche (ISO 8601)
  startHour: number;                          // Heure de début (ex: 9 pour 9h)
  startMinute: number;                        // Minute de début (ex: 0)
  endHour: number;                            // Heure de fin (ex: 18 pour 18h)
  endMinute: number;                          // Minute de fin (ex: 0)
  slotDuration: number;                       // Durée d'un créneau en minutes (ex: 60)
  minAdvanceBookingMinutes: number;           // Délai minimum de réservation (ex: 120 = 2h)
  maxAdvanceBookingDays: number;              // Fenêtre de réservation max (ex: 30 jours)
}

/**
 * Données pour créer un rendez-vous
 */
export interface AppointmentData {
  date: string;          // Format ISO 8601 (YYYY-MM-DD)
  startTime: string;     // Format HH:mm
  endTime: string;       // Format HH:mm
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
}

/**
 * Service Google Calendar OAuth 2.0
 * 
 * Utilise un refresh token pour obtenir automatiquement des access tokens.
 * Stateless et compatible Vercel.
 */
export class GoogleCalendarOAuth2Service {
  private oauth2Client: OAuth2Client;
  private calendar: any;
  private config: GoogleOAuthConfig;

  constructor(config: GoogleOAuthConfig) {
    this.config = config;

    // Créer le client OAuth 2.0
    // Le redirect URI doit correspondre à celui configuré dans Google Cloud Console
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      redirectUri // Redirect URI configuré dans Google Cloud Console
    );

    // Définir les credentials avec le refresh token
    this.oauth2Client.setCredentials({
      refresh_token: config.refreshToken,
    });

    // Initialiser l'API Calendar avec authentification OAuth
    this.calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });

    console.info('[GoogleCalendarOAuth2] ✅ Service initialisé avec OAuth 2.0');
  }

  /**
   * Obtenir un access token valide (refresh automatique si expiré)
   * 
   * Cette méthode est appelée automatiquement par la librairie googleapis.
   * Elle utilise le refresh token pour obtenir un nouveau access token si nécessaire.
   */
  private async ensureValidAccessToken(): Promise<void> {
    try {
      // La librairie googleapis gère automatiquement le refresh
      // On appelle getAccessToken() pour forcer un refresh si nécessaire
      const { token } = await this.oauth2Client.getAccessToken();
      
      if (!token) {
        throw new Error('Failed to obtain access token');
      }

      console.info('[GoogleCalendarOAuth2] ✅ Access token valide obtenu');
    } catch (error: any) {
      console.error('[GoogleCalendarOAuth2] ❌ Erreur lors du refresh du token:', error.message);
      throw new Error(`OAuth token refresh failed: ${error.message}`);
    }
  }

  /**
   * Récupérer tous les événements existants dans une période donnée
   * 
   * @param startDate Date de début (ISO 8601)
   * @param endDate Date de fin (ISO 8601)
   * @returns Liste des événements
   */
  async getExistingEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      console.info(`[GoogleCalendarOAuth2] 📅 Récupération des événements entre ${startDate} et ${endDate}`);

      // S'assurer que le token est valide
      await this.ensureValidAccessToken();

      // Récupérer les événements
      const response = await this.calendar.events.list({
        calendarId: this.config.calendarId,
        timeMin: toZonedTime(new Date(startDate), this.config.timezone).toISOString(),
        timeMax: toZonedTime(new Date(endDate), this.config.timezone).toISOString(),
        singleEvents: true,          // Déplier les événements récurrents
        orderBy: 'startTime',
        timeZone: this.config.timezone,
        showDeleted: true,            // Inclure les événements supprimés pour gérer la libération des créneaux
        maxResults: 2500,             // Maximum d'événements à récupérer
      });

      const events = response.data.items || [];
      
      // Filtrer uniquement les événements actifs (non annulés)
      const activeEvents = events.filter((event: any) => 
        event.status !== 'cancelled' && 
        event.start?.dateTime &&
        event.end?.dateTime
      ) as CalendarEvent[];

      console.info(`[GoogleCalendarOAuth2] ✅ ${activeEvents.length} événements actifs récupérés (${events.length - activeEvents.length} ignorés)`);

      return activeEvents;
    } catch (error: any) {
      console.error('[GoogleCalendarOAuth2] ❌ Erreur lors de la récupération des événements:', error.message);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  /**
   * Créer un événement (rendez-vous) dans Google Calendar
   * 
   * @param appointment Données du rendez-vous
   * @returns ID de l'événement créé
   */
  async createAppointment(appointment: AppointmentData): Promise<string> {
    try {
      console.info(`[GoogleCalendarOAuth2] 📝 Création d'un rendez-vous pour ${appointment.clientName}`);

      // S'assurer que le token est valide
      await this.ensureValidAccessToken();

      // Construire les dates/heures au format ISO 8601 en utilisant la timezone
      const startDateTime = toZonedTime(new Date(`${appointment.date}T${appointment.startTime}:00`), this.config.timezone).toISOString();
      const endDateTime = toZonedTime(new Date(`${appointment.date}T${appointment.endTime}:00`), this.config.timezone).toISOString();

      // Construire la description
      let description = `Client: ${appointment.clientName}\n`;
      description += `Email: ${appointment.clientEmail}\n`;
      if (appointment.clientPhone) {
        description += `Téléphone: ${appointment.clientPhone}\n`;
      }
      if (appointment.notes) {
        description += `\nNotes: ${appointment.notes}`;
      }
      description += `\n\n✅ Réservé via l'application web`;

      // Créer l'événement
      const event = {
        summary: `🗓️ ${appointment.clientName}`,
        description: description,
        start: {
          dateTime: startDateTime,
          timeZone: this.config.timezone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: this.config.timezone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },  // 24h avant
            { method: 'popup', minutes: 60 },        // 1h avant
          ],
        },
        colorId: '11', // Rouge pour les rendez-vous clients
      };

      const response = await this.calendar.events.insert({
        calendarId: this.config.calendarId,
        resource: event,
        sendUpdates: 'none', // Ne pas envoyer de notifications Google (l'app gère ses propres notifs)
      });

      const eventId = response.data.id;
      console.info(`[GoogleCalendarOAuth2] ✅ Rendez-vous créé avec succès: ${eventId}`);

      return eventId;
    } catch (error: any) {
      console.error('[GoogleCalendarOAuth2] ❌ Erreur lors de la création du rendez-vous:', error.message);
      throw new Error(`Failed to create appointment: ${error.message}`);
    }
  }

  /**
   * Supprimer un événement (annulation de rendez-vous)
   * 
   * @param eventId ID de l'événement Google Calendar
   * @returns Succès de la suppression
   */
  async deleteAppointment(eventId: string): Promise<boolean> {
    try {
      console.info(`[GoogleCalendarOAuth2] 🗑️ Suppression de l'événement ${eventId}`);

      // S'assurer que le token est valide
      await this.ensureValidAccessToken();

      await this.calendar.events.delete({
        calendarId: this.config.calendarId,
        eventId: eventId,
        sendUpdates: 'none',
      });

      console.info(`[GoogleCalendarOAuth2] ✅ Événement supprimé avec succès`);
      return true;
    } catch (error: any) {
      console.error('[GoogleCalendarOAuth2] ❌ Erreur lors de la suppression:', error.message);
      return false;
    }
  }

  /**
   * Vérifier si un créneau est disponible
   * 
   * @param date Date au format YYYY-MM-DD
   * @param startTime Heure de début au format HH:mm
   * @param endTime Heure de fin au format HH:mm
   * @param existingEvents Liste des événements existants (pour éviter de refetch)
   * @returns true si le créneau est libre
   */
  checkSlotAvailability(
    date: string,
    startTime: string,
    endTime: string,
    existingEvents: CalendarEvent[]
  ): boolean {
    const slotStart = toZonedTime(new Date(`${date}T${startTime}:00`), this.config.timezone);
    const slotEnd = toZonedTime(new Date(`${date}T${endTime}:00`), this.config.timezone);

    // Vérifier qu'aucun événement ne chevauche ce créneau
    for (const event of existingEvents) {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      // Détection de chevauchement :
      // Le créneau chevauche si : début du slot < fin de l'événement ET fin du slot > début de l'événement
      const overlaps = slotStart < eventEnd && slotEnd > eventStart;

      if (overlaps) {
        return false; // Créneau occupé
      }
    }

    return true; // Créneau disponible
  }
}

/**
 * Factory pour créer une instance du service OAuth 2.0
 * 
 * Utilise les variables d'environnement :
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REFRESH_TOKEN
 * - GOOGLE_CALENDAR_ID
 */
export function createGoogleCalendarOAuth2Service(): GoogleCalendarOAuth2Service | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
  const timezone = 'Europe/Paris';

  // Vérifier que toutes les variables sont définies
  if (!clientId || !clientSecret || !refreshToken) {
    console.error('[GoogleCalendarOAuth2] ❌ Configuration OAuth incomplète. Variables requises:');
    console.error('  - GOOGLE_CLIENT_ID:', clientId ? '✅' : '❌');
    console.error('  - GOOGLE_CLIENT_SECRET:', clientSecret ? '✅' : '❌');
    console.error('  - GOOGLE_REFRESH_TOKEN:', refreshToken ? '✅' : '❌');
    console.error('  - GOOGLE_CALENDAR_ID:', calendarId);
    return null;
  }

  try {
    const service = new GoogleCalendarOAuth2Service({
      clientId,
      clientSecret,
      refreshToken,
      calendarId,
      timezone,
    });

    console.info('[GoogleCalendarOAuth2] ✅ Service OAuth 2.0 créé avec succès');
    return service;
  } catch (error: any) {
    console.error('[GoogleCalendarOAuth2] ❌ Erreur lors de la création du service:', error.message);
    return null;
  }
}

/**
 * Instance singleton (lazy initialization)
 */
let serviceInstance: GoogleCalendarOAuth2Service | null = null;

export function getGoogleCalendarOAuth2Service(): GoogleCalendarOAuth2Service | null {
  if (!serviceInstance) {
    serviceInstance = createGoogleCalendarOAuth2Service();
  }
  return serviceInstance;
}
