#!/usr/bin/env tsx
/**
 * Script de test pour vérifier la configuration Google Calendar
 */

import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

async function testGoogleCalendarConnection() {
  console.log('🔍 Test de connexion à Google Calendar...\n');

  // 1. Vérifier les variables d'environnement
  console.log('📋 Vérification des variables d\'environnement:');
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  console.log(`  ✓ GOOGLE_SERVICE_ACCOUNT_EMAIL: ${serviceAccountEmail ? '✓ Défini' : '✗ Manquant'}`);
  console.log(`  ✓ GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: ${serviceAccountPrivateKey ? '✓ Défini' : '✗ Manquant'}`);
  console.log(`  ✓ GOOGLE_CALENDAR_ID: ${calendarId || 'primary'}\n`);

  if (!serviceAccountEmail || !serviceAccountPrivateKey) {
    console.error('❌ Configuration Google Calendar incomplète');
    process.exit(1);
  }

  try {
    // 2. Créer l'authentification JWT
    console.log('🔑 Création de l\'authentification JWT...');
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: serviceAccountPrivateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    // 3. Initialiser l'API Calendar
    const calendar = google.calendar({ version: 'v3', auth });
    console.log('✓ API Calendar initialisée\n');

    // 4. Tester la connexion en récupérant les événements
    console.log('📅 Récupération des événements du calendrier...');
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: calendarId || 'primary',
      timeMin: now.toISOString(),
      timeMax: nextWeek.toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    console.log(`✓ ${events.length} événements trouvés pour les 7 prochains jours\n`);

    // 5. Afficher les événements
    if (events.length > 0) {
      console.log('📋 Événements trouvés:');
      events.forEach((event: any, index: number) => {
        const start = event.start?.dateTime || event.start?.date;
        const isSlot = event.extendedProperties?.private?.isAvailabilitySlot === 'true';
        const type = isSlot ? '🟢 DISPONIBLE' : '🏥 RENDEZ-VOUS';
        console.log(`  ${index + 1}. ${type}: ${event.summary} (${start})`);
      });
    } else {
      console.log('⚠️  Aucun événement trouvé. Créez des créneaux avec: npm run sync:availability');
    }

    // 6. Tester la création d'un événement de test
    console.log('\n🧪 Test de création d\'événement...');
    const testEvent = {
      summary: '🧪 Test - Créneau disponible',
      description: 'Événement de test créé automatiquement',
      start: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        timeZone: 'Europe/Paris',
      },
      transparency: 'transparent',
      colorId: '10', // Vert
      extendedProperties: {
        private: {
          isAvailabilitySlot: 'true',
          isTest: 'true',
        },
      },
    };

    const createResponse = await calendar.events.insert({
      calendarId: calendarId || 'primary',
      resource: testEvent,
    });

    console.log(`✓ Événement de test créé: ${createResponse.data.id}`);

    // 7. Supprimer l'événement de test
    console.log('🗑️  Suppression de l\'événement de test...');
    await calendar.events.delete({
      calendarId: calendarId || 'primary',
      eventId: createResponse.data.id!,
    });
    console.log('✓ Événement de test supprimé\n');

    // 8. Résumé
    console.log('✅ SUCCÈS: Google Calendar est correctement configuré!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Résumé de la configuration:');
    console.log(`  • Service Account: ${serviceAccountEmail}`);
    console.log(`  • Calendar ID: ${calendarId || 'primary'}`);
    console.log(`  • Nombre d'événements: ${events.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Prochaines étapes:');
    console.log('  1. Créer des créneaux: npm run sync:availability');
    console.log('  2. Démarrer le serveur: npm run dev');
    console.log('  3. Tester les réservations sur l\'application\n');

  } catch (error: any) {
    console.error('\n❌ ERREUR lors du test:', error.message);
    
    if (error.code === 401) {
      console.error('\n💡 Solution: Vérifiez que:');
      console.error('  1. Le calendrier est partagé avec le service account');
      console.error('  2. Les droits "Apporter des modifications" sont accordés');
      console.error('  3. L\'API Google Calendar est activée dans Google Cloud Console');
    } else if (error.code === 403) {
      console.error('\n💡 Solution: Activez l\'API Google Calendar:');
      console.error('  1. Allez sur https://console.cloud.google.com/');
      console.error('  2. APIs & Services → Library');
      console.error('  3. Recherchez "Google Calendar API"');
      console.error('  4. Cliquez sur "Enable"');
    }
    
    console.error('\n📖 Pour plus d\'aide, consultez: GOOGLE_CALENDAR_SYNC.md\n');
    process.exit(1);
  }
}

// Exécuter le test
testGoogleCalendarConnection();
