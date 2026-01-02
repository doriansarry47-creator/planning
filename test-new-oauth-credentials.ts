/**
 * Script de test pour vérifier les nouvelles credentials OAuth2 Google Calendar
 * 
 * Ce script teste :
 * 1. L'initialisation du client OAuth2
 * 2. L'obtention d'un access token valide
 * 3. La récupération des événements Google Calendar
 * 
 * Usage:
 *   npx tsx test-new-oauth-credentials.ts
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

interface TestResult {
  step: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

function logResult(step: string, status: 'success' | 'error', message: string, data?: any) {
  const emoji = status === 'success' ? '✅' : '❌';
  console.log(`${emoji} [${step}] ${message}`);
  if (data) {
    console.log('   Data:', JSON.stringify(data, null, 2));
  }
  results.push({ step, status, message, data });
}

async function testOAuth2Credentials() {
  console.log('🔍 Test des nouvelles credentials OAuth2 Google Calendar\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Étape 1 : Vérifier les variables d'environnement
  console.log('📋 Étape 1 : Vérification des variables d\'environnement');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  if (!clientId) {
    logResult('ENV_CHECK', 'error', 'GOOGLE_CLIENT_ID manquant');
    return;
  }
  if (!clientSecret) {
    logResult('ENV_CHECK', 'error', 'GOOGLE_CLIENT_SECRET manquant');
    return;
  }
  if (!refreshToken) {
    logResult('ENV_CHECK', 'error', 'GOOGLE_REFRESH_TOKEN manquant');
    return;
  }

  logResult('ENV_CHECK', 'success', 'Toutes les variables d\'environnement sont présentes', {
    clientId: clientId.substring(0, 20) + '...',
    clientSecret: '***',
    refreshToken: refreshToken.substring(0, 20) + '...',
    calendarId,
  });
  console.log();

  // Étape 2 : Créer le client OAuth2
  console.log('🔐 Étape 2 : Initialisation du client OAuth2');
  let oauth2Client: OAuth2Client;
  try {
    oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3000/oauth2callback'
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    logResult('OAUTH_INIT', 'success', 'Client OAuth2 initialisé avec succès');
    console.log();
  } catch (error: any) {
    logResult('OAUTH_INIT', 'error', `Erreur lors de l'initialisation: ${error.message}`);
    return;
  }

  // Étape 3 : Obtenir un access token
  console.log('🎫 Étape 3 : Obtention d\'un access token');
  try {
    const { token } = await oauth2Client.getAccessToken();
    
    if (!token) {
      logResult('ACCESS_TOKEN', 'error', 'Impossible d\'obtenir un access token');
      return;
    }

    logResult('ACCESS_TOKEN', 'success', 'Access token obtenu avec succès', {
      tokenPrefix: token.substring(0, 30) + '...',
      tokenLength: token.length,
    });
    console.log();
  } catch (error: any) {
    logResult('ACCESS_TOKEN', 'error', `Erreur lors de l'obtention du token: ${error.message}`, {
      errorCode: error.code,
      errorDetails: error.response?.data,
    });
    return;
  }

  // Étape 4 : Initialiser l'API Calendar
  console.log('📅 Étape 4 : Initialisation de l\'API Google Calendar');
  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client,
  });
  logResult('CALENDAR_INIT', 'success', 'API Calendar initialisée');
  console.log();

  // Étape 5 : Récupérer les événements
  console.log('📆 Étape 5 : Récupération des événements Google Calendar');
  try {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 7);

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: now.toISOString(),
      timeMax: futureDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 10,
    });

    const events = response.data.items || [];
    
    logResult('FETCH_EVENTS', 'success', `${events.length} événement(s) récupéré(s)`, {
      eventCount: events.length,
      events: events.map(e => ({
        id: e.id,
        summary: e.summary,
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
      })),
    });
    console.log();

    // Afficher quelques détails des événements
    if (events.length > 0) {
      console.log('📋 Événements récupérés:');
      events.slice(0, 5).forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.summary || '(Sans titre)'}`);
        console.log(`      📅 ${event.start?.dateTime || event.start?.date} → ${event.end?.dateTime || event.end?.date}`);
      });
      if (events.length > 5) {
        console.log(`   ... et ${events.length - 5} autre(s) événement(s)`);
      }
      console.log();
    }
  } catch (error: any) {
    logResult('FETCH_EVENTS', 'error', `Erreur lors de la récupération des événements: ${error.message}`, {
      errorCode: error.code,
      errorDetails: error.response?.data,
    });
    return;
  }

  // Résumé final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Résumé des tests:\n');
  
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`   ✅ Tests réussis: ${successCount}`);
  console.log(`   ❌ Tests échoués: ${errorCount}`);
  console.log();

  if (errorCount === 0) {
    console.log('🎉 Toutes les credentials OAuth2 fonctionnent correctement!');
    console.log('✅ L\'application est prête à utiliser Google Calendar API.');
  } else {
    console.log('⚠️  Certains tests ont échoué. Veuillez vérifier les erreurs ci-dessus.');
  }
  console.log();
}

// Exécuter les tests
testOAuth2Credentials()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
