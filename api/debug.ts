import { VercelRequest, VercelResponse } from "@vercel/node";
import ical from 'node-ical';
import { google } from 'googleapis';

/**
 * Route de diagnostic pour débugger Google Calendar en production Vercel
 * 
 * Accessible via: https://votre-app.vercel.app/api/debug?test=all
 * 
 * Tests disponibles:
 * - ?test=env : Vérifier les variables d'environnement
 * - ?test=ical : Tester l'accès à l'URL iCal
 * - ?test=google : Tester l'auth Google Calendar API
 * - ?test=timezone : Vérifier le fuseau horaire serveur
 * - ?test=all : Tous les tests
 */

interface DiagnosticResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

async function testEnvironmentVariables(): Promise<DiagnosticResult> {
  const requiredVars = {
    'GOOGLE_CALENDAR_ICAL_URL': process.env.GOOGLE_CALENDAR_ICAL_URL,
    'GOOGLE_SERVICE_ACCOUNT_EMAIL': process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY': process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    'GOOGLE_CALENDAR_ID': process.env.GOOGLE_CALENDAR_ID,
    'DATABASE_URL': process.env.DATABASE_URL,
  };

  const missingVars: string[] = [];
  const presentVars: Record<string, string> = {};

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      missingVars.push(key);
    } else {
      // Masquer les valeurs sensibles
      if (key.includes('PRIVATE_KEY')) {
        presentVars[key] = value.substring(0, 50) + '... (truncated)';
      } else if (key.includes('URL') || key.includes('EMAIL') || key.includes('ID')) {
        presentVars[key] = value.substring(0, 30) + '...';
      } else {
        presentVars[key] = 'SET';
      }
    }
  }

  return {
    test: 'Environment Variables',
    success: missingVars.length === 0,
    message: missingVars.length === 0 
      ? 'Toutes les variables d\'environnement sont configurées ✅'
      : `Variables manquantes: ${missingVars.join(', ')} ❌`,
    details: {
      missing: missingVars,
      present: presentVars,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    }
  };
}

async function testICalAccess(): Promise<DiagnosticResult> {
  const icalUrl = process.env.GOOGLE_CALENDAR_ICAL_URL;
  
  if (!icalUrl) {
    return {
      test: 'iCal URL Access',
      success: false,
      message: 'GOOGLE_CALENDAR_ICAL_URL non défini ❌',
    };
  }

  try {
    console.log('[Debug] Tentative de connexion à l\'URL iCal:', icalUrl.substring(0, 50) + '...');
    
    const startTime = Date.now();
    const events = await ical.async.fromURL(icalUrl);
    const duration = Date.now() - startTime;
    
    const eventCount = Object.keys(events).length;
    const eventTypes = Object.values(events).reduce((acc: any, event: any) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    // Analyser les événements
    const availableEvents = Object.values(events).filter((event: any) => {
      if (event.type !== 'VEVENT') return false;
      const title = event.summary?.toLowerCase() || '';
      return title.includes('disponible') || title.includes('available') || title.includes('dispo') || title.includes('🟢');
    });

    const bookedEvents = Object.values(events).filter((event: any) => {
      if (event.type !== 'VEVENT') return false;
      const title = event.summary?.toLowerCase() || '';
      return title.includes('réservé') || title.includes('reserve') || title.includes('rdv') || title.includes('🔴');
    });

    const now = new Date();
    const futureAvailable = availableEvents.filter((event: any) => {
      return new Date(event.start) > now;
    });

    return {
      test: 'iCal URL Access',
      success: true,
      message: `URL iCal accessible - ${eventCount} événements trouvés ✅`,
      details: {
        url: icalUrl.substring(0, 50) + '...',
        responseTime: `${duration}ms`,
        totalEvents: eventCount,
        eventTypes,
        availableEvents: availableEvents.length,
        bookedEvents: bookedEvents.length,
        futureAvailable: futureAvailable.length,
        sampleEvents: Object.values(events).slice(0, 3).map((event: any) => ({
          type: event.type,
          summary: event.summary,
          start: event.start?.toISOString?.() || event.start,
          end: event.end?.toISOString?.() || event.end,
        }))
      }
    };
  } catch (error: any) {
    return {
      test: 'iCal URL Access',
      success: false,
      message: 'Erreur lors de l\'accès à l\'URL iCal ❌',
      error: error.message,
      details: {
        url: icalUrl.substring(0, 50) + '...',
        errorType: error.constructor.name,
        errorCode: error.code,
      }
    };
  }
}

async function testGoogleCalendarAuth(): Promise<DiagnosticResult> {
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_CALENDAR_PRIVATE_KEY;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CALENDAR_EMAIL;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!privateKey || !serviceAccountEmail) {
    return {
      test: 'Google Calendar Auth',
      success: false,
      message: 'Configuration Google Calendar incomplète ❌',
      details: {
        hasPrivateKey: !!privateKey,
        hasServiceAccountEmail: !!serviceAccountEmail,
        hasCalendarId: !!calendarId,
      }
    };
  }

  try {
    console.log('[Debug] Test d\'authentification Google Calendar...');
    
    // Nettoyer la clé privée
    const cleanKey = privateKey.replace(/\\n/g, '\n').replace(/"/g, '').trim();
    
    if (!cleanKey.includes('-----BEGIN PRIVATE KEY-----')) {
      return {
        test: 'Google Calendar Auth',
        success: false,
        message: 'Format de clé privée invalide ❌',
        details: {
          keyStart: privateKey.substring(0, 30),
          hasPemHeader: false,
        }
      };
    }

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: cleanKey,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Tester l'authentification en listant les calendriers
    const startTime = Date.now();
    const response = await calendar.events.list({
      calendarId: calendarId || serviceAccountEmail,
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    });
    const duration = Date.now() - startTime;

    const events = response.data.items || [];

    return {
      test: 'Google Calendar Auth',
      success: true,
      message: `Authentification Google Calendar réussie ✅`,
      details: {
        serviceAccountEmail: serviceAccountEmail.substring(0, 30) + '...',
        calendarId: calendarId?.substring(0, 30) + '...',
        responseTime: `${duration}ms`,
        eventsFound: events.length,
        sampleEvents: events.slice(0, 3).map(event => ({
          summary: event.summary,
          start: event.start?.dateTime || event.start?.date,
          status: event.status,
        }))
      }
    };
  } catch (error: any) {
    return {
      test: 'Google Calendar Auth',
      success: false,
      message: 'Erreur d\'authentification Google Calendar ❌',
      error: error.message,
      details: {
        errorType: error.constructor.name,
        errorCode: error.code,
        statusCode: error.response?.status,
        errorDetails: error.response?.data?.error,
      }
    };
  }
}

async function testTimezone(): Promise<DiagnosticResult> {
  const now = new Date();
  
  return {
    test: 'Timezone & Date',
    success: true,
    message: 'Informations de fuseau horaire du serveur ✅',
    details: {
      serverTime: now.toISOString(),
      serverTimeString: now.toString(),
      serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      serverUTCOffset: now.getTimezoneOffset(),
      parisTime: now.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
      nodeVersion: process.version,
      platform: process.platform,
    }
  };
}

async function testDatabase(): Promise<DiagnosticResult> {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    return {
      test: 'Database Connection',
      success: false,
      message: 'DATABASE_URL non défini ❌',
    };
  }

  try {
    const { neon } = await import('@neondatabase/serverless');
    
    // Nettoyer l'URL
    let cleanUrl = dbUrl.trim();
    if (cleanUrl.startsWith('psql ')) {
      cleanUrl = cleanUrl.replace(/^psql\s+/, '');
    }
    cleanUrl = cleanUrl.replace(/^['"]/, '').replace(/['"]$/, '');
    
    const sql = neon(cleanUrl);
    
    const startTime = Date.now();
    const result = await sql`SELECT NOW() as server_time, version() as pg_version`;
    const duration = Date.now() - startTime;

    return {
      test: 'Database Connection',
      success: true,
      message: 'Connexion à la base de données réussie ✅',
      details: {
        dbUrl: cleanUrl.substring(0, 40) + '...',
        responseTime: `${duration}ms`,
        serverTime: result[0]?.server_time,
        pgVersion: result[0]?.pg_version,
      }
    };
  } catch (error: any) {
    return {
      test: 'Database Connection',
      success: false,
      message: 'Erreur de connexion à la base de données ❌',
      error: error.message,
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Sécurité: Ajouter un token simple (optionnel)
  const debugToken = req.query.token;
  const expectedToken = process.env.DEBUG_TOKEN || 'debug123'; // Configurer dans Vercel
  
  if (debugToken !== expectedToken) {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Token de debug invalide. Ajoutez ?token=xxx à l\'URL',
    });
  }

  const testType = (req.query.test as string) || 'all';
  const results: DiagnosticResult[] = [];

  try {
    console.log('[Debug] Début des tests de diagnostic...');

    if (testType === 'all' || testType === 'env') {
      results.push(await testEnvironmentVariables());
    }

    if (testType === 'all' || testType === 'timezone') {
      results.push(await testTimezone());
    }

    if (testType === 'all' || testType === 'ical') {
      results.push(await testICalAccess());
    }

    if (testType === 'all' || testType === 'google') {
      results.push(await testGoogleCalendarAuth());
    }

    if (testType === 'all' || testType === 'db') {
      results.push(await testDatabase());
    }

    const allSuccess = results.every(r => r.success);
    const failedTests = results.filter(r => !r.success);

    return res.status(allSuccess ? 200 : 500).json({
      success: allSuccess,
      message: allSuccess 
        ? '✅ Tous les tests sont passés avec succès'
        : `❌ ${failedTests.length} test(s) échoué(s)`,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        region: process.env.VERCEL_REGION,
      },
      results,
      failedTests: failedTests.map(t => t.test),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Debug] Erreur lors des tests:', error);
    return res.status(500).json({
      error: 'Erreur lors de l\'exécution des tests',
      message: error.message,
      stack: error.stack,
    });
  }
}
