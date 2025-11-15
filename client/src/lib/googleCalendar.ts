/**
 * Utilitaires pour l'intégration Google Calendar
 * Version améliorée avec support OAuth complet
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
  colorId?: string;
  transparency?: 'opaque' | 'transparent';
}

export interface OAuth2Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

/**
 * Configuration Google OAuth
 */
export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '407408718192.apps.googleusercontent.com',
  CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',
  DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  SCOPES: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
  ].join(' '),
  REDIRECT_URI: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground',
};

// Stockage des tokens OAuth
let oauthTokens: OAuth2Tokens | null = null;

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
            console.log('Google Calendar API initialized');
            resolve();
          })
          .catch((error: any) => {
            console.error('Error initializing Google API:', error);
            reject(error);
          });
      });
    };
    script.onerror = (error) => {
      console.error('Failed to load Google API script:', error);
      reject(error);
    };
    document.body.appendChild(script);
  });
};

/**
 * Définir les tokens OAuth manuellement
 */
export const setOAuthTokens = (tokens: OAuth2Tokens): void => {
  oauthTokens = tokens;
  // Stocker dans localStorage pour persistance
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('google_oauth_tokens', JSON.stringify(tokens));
  }
  console.log('OAuth tokens set successfully');
};

/**
 * Récupérer les tokens OAuth depuis le stockage
 */
export const getStoredOAuthTokens = (): OAuth2Tokens | null => {
  if (oauthTokens) return oauthTokens;
  
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('google_oauth_tokens');
    if (stored) {
      try {
        oauthTokens = JSON.parse(stored);
        return oauthTokens;
      } catch (e) {
        console.error('Failed to parse stored OAuth tokens:', e);
      }
    }
  }
  
  return null;
};

/**
 * Supprimer les tokens OAuth
 */
export const clearOAuthTokens = (): void => {
  oauthTokens = null;
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('google_oauth_tokens');
  }
};

/**
 * Authentification Google
 */
export const signInToGoogle = async (): Promise<boolean> => {
  try {
    const auth = window.gapi.auth2.getAuthInstance();
    if (!auth.isSignedIn.get()) {
      const result = await auth.signIn({
        scope: GOOGLE_CONFIG.SCOPES,
        prompt: 'consent',
      });
      
      // Extraire les tokens
      const authResponse = result.getAuthResponse();
      if (authResponse) {
        const tokens: OAuth2Tokens = {
          access_token: authResponse.access_token,
          refresh_token: '', // À récupérer du backend
          expires_in: authResponse.expires_in,
          token_type: 'Bearer',
          scope: authResponse.scope,
        };
        setOAuthTokens(tokens);
      }
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
    clearOAuthTokens();
    console.log('Signed out from Google Calendar');
  } catch (error) {
    console.error('Error signing out from Google:', error);
  }
};

/**
 * Vérifier si l'utilisateur est connecté
 */
export const isSignedIn = (): boolean => {
  try {
    // Vérifier d'abord les tokens OAuth stockés
    const tokens = getStoredOAuthTokens();
    if (tokens && tokens.access_token) {
      return true;
    }
    
    // Sinon vérifier l'état de gapi
    if (typeof window.gapi === 'undefined') return false;
    const auth = window.gapi.auth2.getAuthInstance();
    return auth?.isSignedIn.get() || false;
  } catch {
    return false;
  }
};

/**
 * Obtenir le token d'accès actuel
 */
const getAccessToken = (): string | null => {
  // Priorité aux tokens OAuth stockés
  const tokens = getStoredOAuthTokens();
  if (tokens && tokens.access_token) {
    return tokens.access_token;
  }
  
  // Sinon récupérer depuis gapi
  try {
    if (typeof window.gapi !== 'undefined') {
      const auth = window.gapi.auth2.getAuthInstance();
      if (auth && auth.isSignedIn.get()) {
        const user = auth.currentUser.get();
        const authResponse = user.getAuthResponse();
        return authResponse.access_token;
      }
    }
  } catch (error) {
    console.error('Error getting access token:', error);
  }
  
  return null;
};

/**
 * Créer un événement dans Google Calendar avec gestion d'erreur améliorée
 */
export const createGoogleCalendarEvent = async (
  event: GoogleCalendarEvent
): Promise<any> => {
  try {
    const accessToken = getAccessToken();
    
    if (accessToken) {
      // Utiliser l'API REST directement avec le token
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Error from Google Calendar API:', error);
        throw new Error(error.error?.message || 'Failed to create event');
      }
      
      return await response.json();
    } else {
      // Fallback sur gapi.client
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
      return response.result;
    }
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
    const accessToken = getAccessToken();
    
    if (accessToken) {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update event');
      }
      
      return await response.json();
    } else {
      const response = await window.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });
      return response.result;
    }
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
    const accessToken = getAccessToken();
    
    if (accessToken) {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete event');
      }
    } else {
      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    }
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
    const accessToken = getAccessToken();
    
    if (accessToken) {
      const params = new URLSearchParams({
        timeMin,
        timeMax,
        showDeleted: 'false',
        singleEvents: 'true',
        orderBy: 'startTime',
      });
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch events');
      }
      
      const data = await response.json();
      return data.items || [];
    } else {
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return response.result.items || [];
    }
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

  const consultationType = slot.consultationType || 'Consultation classique';
  const patientName = slot.patientName || 'Créneau disponible';

  return {
    summary: slot.patientName 
      ? `Consultation - ${slot.patientName}` 
      : 'Créneau disponible',
    description: `Type: ${consultationType}${slot.notes ? `\n\nNotes: ${slot.notes}` : ''}`,
    location: location,
    start: {
      dateTime: startDateTime,
      timeZone: 'Europe/Paris',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Europe/Paris',
    },
    colorId: slot.patientName ? '9' : '2', // Bleu pour réservé, vert pour disponible
    transparency: slot.patientName ? 'opaque' : 'transparent',
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
): Promise<{ success: number; failed: number; errors: string[] }> => {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const slot of slots) {
    try {
      // Ne synchroniser que les créneaux réservés
      if (slot.status === 'booked') {
        const event = convertSlotToGoogleEvent(slot);
        await createGoogleCalendarEvent(event);
        success++;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error syncing slot:', slot, error);
      errors.push(`${slot.date} ${slot.startTime}: ${errorMessage}`);
      failed++;
    }
  }

  return { success, failed, errors };
};

/**
 * Tester la connexion à Google Calendar
 */
export const testGoogleCalendarConnection = async (): Promise<{
  connected: boolean;
  calendars?: any[];
  error?: string;
}> => {
  try {
    const accessToken = getAccessToken();
    
    if (!accessToken) {
      return {
        connected: false,
        error: 'No access token available',
      };
    }
    
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      return {
        connected: false,
        error: error.error?.message || 'Failed to fetch calendars',
      };
    }
    
    const data = await response.json();
    return {
      connected: true,
      calendars: data.items || [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      connected: false,
      error: errorMessage,
    };
  }
};

// Déclaration des types pour window.gapi
declare global {
  interface Window {
    gapi: any;
  }
}
