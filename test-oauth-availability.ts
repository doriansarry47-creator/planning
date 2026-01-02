/**
 * Script de test pour vérifier que l'OAuth2 fonctionne
 * et peut récupérer les disponibilités
 */
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as dotenv from 'dotenv';

dotenv.config();

async function testOAuthAvailability() {
  console.log('🧪 Test OAuth2 - Récupération des disponibilités\n');

  // Vérifier les variables d'environnement
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  console.log('📋 Variables d\'environnement:');
  console.log('  - GOOGLE_CLIENT_ID:', clientId ? '✅' : '❌');
  console.log('  - GOOGLE_CLIENT_SECRET:', clientSecret ? '✅' : '❌');
  console.log('  - GOOGLE_REFRESH_TOKEN:', refreshToken ? '✅' : '❌');
  console.log('  - GOOGLE_CALENDAR_ID:', calendarId);
  console.log('');

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('❌ Configuration OAuth incomplète');
    process.exit(1);
  }

  try {
    // Créer le client OAuth2
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://localhost'
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    console.log('✅ Client OAuth2 créé avec succès\n');

    // Obtenir un access token
    console.log('🔑 Obtention d\'un access token...');
    const { token } = await oauth2Client.getAccessToken();
    console.log('✅ Access token obtenu:', token ? '✅' : '❌');
    console.log('');

    // Initialiser l'API Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Récupérer les événements
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 jours

    console.log('📅 Récupération des événements Google Calendar...');
    console.log('  Période:', now.toISOString(), 'à', endDate.toISOString());

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: now.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'Europe/Paris',
      showDeleted: false,
      maxResults: 50,
    });

    const events = response.data.items || [];
    console.log(`✅ ${events.length} événements récupérés\n`);

    if (events.length > 0) {
      console.log('📊 Exemples d\'événements:');
      events.slice(0, 5).forEach((event, i) => {
        console.log(`  ${i + 1}. ${event.summary}`);
        console.log(`     Début: ${event.start?.dateTime || event.start?.date}`);
        console.log(`     Fin: ${event.end?.dateTime || event.end?.date}`);
        console.log('');
      });
    }

    // Générer des créneaux de disponibilité (simulation)
    console.log('🕐 Génération des créneaux de disponibilité...');
    const workingHours = {
      startHour: 9,
      endHour: 18,
      slotDuration: 60,
      workingDays: [1, 2, 3, 4, 5], // Lundi-Vendredi
    };

    let slotsCount = 0;
    let currentDate = new Date(now);
    currentDate.setHours(0, 0, 0, 0);

    for (let day = 0; day < 30; day++) {
      const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay();
      
      if (workingHours.workingDays.includes(dayOfWeek)) {
        for (let hour = workingHours.startHour; hour < workingHours.endHour; hour++) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, 0, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + workingHours.slotDuration);

          if (slotStart < now) continue;

          // Vérifier les chevauchements
          let isAvailable = true;
          for (const event of events) {
            if (!event.start?.dateTime || !event.end?.dateTime) continue;
            
            const eventStart = new Date(event.start.dateTime);
            const eventEnd = new Date(event.end.dateTime);

            if (slotStart < eventEnd && slotEnd > eventStart) {
              isAvailable = false;
              break;
            }
          }

          if (isAvailable) {
            slotsCount++;
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`✅ ${slotsCount} créneaux disponibles trouvés\n`);
    
    console.log('🎉 Test réussi ! OAuth2 fonctionne correctement');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testOAuthAvailability();
