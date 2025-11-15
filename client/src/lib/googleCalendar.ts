/**
 * Utilitaires pour l'intégration Google Calendar
 */

export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

/**
 * Configuration Google OAuth
 */
export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',
  DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  SCOPES: 'https://www.googleapis.com/auth/calendar.events',
};

/**
 * Charger l'API Google Calendar
 */
export const loadGoogleCalendarAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window.gapi !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        window.gapi.client
          .init({
            apiKey: GOOGLE_CONFIG.API_KEY,
            clientId: GOOGLE_CONFIG.CLIENT_ID,
            discoveryDocs: GOOGLE_CONFIG.DISCOVERY_DOCS,
            scope: GOOGLE_CONFIG.SCOPES,
          })
          .then(() => {
            resolve();
          })
          .catch((error: any) => {
            console.error('Error initializing Google API:', error);
            reject(error);
          });
      });
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

/**
 * Authentification Google
 */
export const signInToGoogle = async (): Promise<boolean> => {
  try {
    const auth = window.gapi.auth2.getAuthInstance();
    if (!auth.isSignedIn.get()) {
      await auth.signIn();
    }
    return auth.isSignedIn.get();
  } catch (error) {
    console.error('Error signing in to Google:', error);
    return false;
  }
};

/**
 * Déconnexion Google
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    const auth = window.gapi.auth2.getAuthInstance();
    if (auth.isSignedIn.get()) {
      await auth.signOut();
    }
  } catch (error) {
    console.error('Error signing out from Google:', error);
  }
};

/**
 * Vérifier si l'utilisateur est connecté
 */
export const isSignedIn = (): boolean => {
  try {
    if (typeof window.gapi === 'undefined') return false;
    const auth = window.gapi.auth2.getAuthInstance();
    return auth?.isSignedIn.get() || false;
  } catch {
    return false;
  }
};

/**
 * Créer un événement dans Google Calendar
 */
export const createGoogleCalendarEvent = async (
  event: GoogleCalendarEvent
): Promise<any> => {
  try {
    const response = await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    return response.result;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
};

/**
 * Mettre à jour un événement dans Google Calendar
 */
export const updateGoogleCalendarEvent = async (
  eventId: string,
  event: GoogleCalendarEvent
): Promise<any> => {
  try {
    const response = await window.gapi.client.calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event,
    });
    return response.result;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw error;
  }
};

/**
 * Supprimer un événement de Google Calendar
 */
export const deleteGoogleCalendarEvent = async (eventId: string): Promise<void> => {
  try {
    await window.gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw error;
  }
};

/**
 * Récupérer les événements de Google Calendar
 */
export const getGoogleCalendarEvents = async (
  timeMin: string,
  timeMax: string
): Promise<any[]> => {
  try {
    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return response.result.items || [];
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};

/**
 * Convertir un créneau en événement Google Calendar
 */
export const convertSlotToGoogleEvent = (
  slot: {
    date: string;
    startTime: string;
    endTime: string;
    patientName?: string;
    consultationType?: string;
    notes?: string;
  },
  location: string = '20 rue des Jacobins, 24000 Périgueux'
): GoogleCalendarEvent => {
  const startDateTime = `${slot.date}T${slot.startTime}:00`;
  const endDateTime = `${slot.date}T${slot.endTime}:00`;

  return {
    summary: slot.patientName 
      ? `Consultation - ${slot.patientName}` 
      : 'Créneau disponible',
    description: `Type: ${slot.consultationType || 'Consultation classique'}\n${slot.notes ? `Notes: ${slot.notes}` : ''}`,
    location: location,
    start: {
      dateTime: startDateTime,
      timeZone: 'Europe/Paris',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Europe/Paris',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 jour avant
        { method: 'popup', minutes: 30 }, // 30 minutes avant
      ],
    },
  };
};

/**
 * Synchroniser tous les créneaux avec Google Calendar
 */
export const syncSlotsWithGoogle = async (
  slots: Array<{
    date: string;
    startTime: string;
    endTime: string;
    status: 'available' | 'booked' | 'cancelled';
    patientName?: string;
    consultationType?: string;
    notes?: string;
  }>
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const slot of slots) {
    try {
      // Ne synchroniser que les créneaux réservés
      if (slot.status === 'booked') {
        const event = convertSlotToGoogleEvent(slot);
        await createGoogleCalendarEvent(event);
        success++;
      }
    } catch (error) {
      console.error('Error syncing slot:', slot, error);
      failed++;
    }
  }

  return { success, failed };
};

// Déclaration des types pour window.gapi
declare global {
  interface Window {
    gapi: any;
  }
}
