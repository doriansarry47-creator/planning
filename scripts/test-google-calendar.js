#!/usr/bin/env node

/**
 * Script de test pour vérifier l'intégration Google Calendar
 * Utilise la clé API fournie par l'utilisateur
 */

const { google } = require('googleapis');

const API_KEY = 'd1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939';

async function testGoogleCalendarAPI() {
  try {
    console.log('🔍 Test de l\'API Google Calendar...');
    console.log('🔑 Utilisation de la clé API:', API_KEY.substring(0, 8) + '...');
    
    // Initialiser l'API Google Calendar
    const calendar = google.calendar({ version: 'v3', auth: API_KEY });
    
    // Tester l'accès à l'API
    console.log('📅 Test de récupération des calendriers...');
    const calendarsResponse = await calendar.calendarList.list({
      maxResults: 10,
    });
    
    const calendars = calendarsResponse.data.items || [];
    
    if (calendars.length > 0) {
      console.log('✅ Connexion réussie !');
      console.log(`📊 Nombre de calendriers trouvés: ${calendars.length}`);
      
      // Afficher les premiers calendriers
      console.log('\n📅 Vos calendriers:');
      calendars.slice(0, 3).forEach((calendar, index) => {
        console.log(`  ${index + 1}. ${calendar.summary} (${calendar.id})`);
        console.log(`     Statut: ${calendar.accessRole}`);
      });
      
      // Test de création d'un événement de test
      console.log('\n🧪 Test de création d\'un événement...');
      
      const now = new Date();
      const startTime = new Date(now.getTime() + 30 * 60000); // Dans 30 minutes
      const endTime = new Date(startTime.getTime() + 60 * 60000); // Durée 1h
      
      const testEvent = {
        summary: 'Test - Vérification Planning App',
        description: 'Ceci est un test automatique de l\'intégration Google Calendar',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Europe/Paris',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 15 },
          ],
        },
        colorId: '10',
      };
      
      try {
        const createResponse = await calendar.events.insert({
          calendarId: 'primary',
          resource: testEvent,
        });
        
        const createdEvent = createResponse.data;
        console.log('✅ Événement de test créé avec succès !');
        console.log(`📝 ID de l'événement: ${createdEvent.id}`);
        console.log(`📍 Titre: ${createdEvent.summary}`);
        console.log(`🕐 Créé le: ${createdEvent.created}`);
        
        // Supprimer l'événement de test après 10 secondes
        setTimeout(async () => {
          try {
            await calendar.events.delete({
              calendarId: 'primary',
              eventId: createdEvent.id,
            });
            console.log('🗑️ Événement de test supprimé.');
          } catch (deleteError) {
            console.log('⚠️ Impossible de supprimer l\'événement de test:', deleteError.message);
          }
        }, 10000);
        
      } catch (createError) {
        console.log('❌ Erreur lors de la création de l\'événement:', createError.message);
      }
      
    } else {
      console.log('⚠️ Aucun calendrier trouvé. Vérifiez les permissions.');
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
    
    if (error.code === 403) {
      console.log('\n🔧 Solutions possibles:');
      console.log('1. Vérifiez que l\'API Google Calendar est activée dans Google Cloud Console');
      console.log('2. Assurez-vous que la clé API a les bonnes permissions');
      console.log('3. Vérifiez que la clé API n\'a pas expiré');
    } else if (error.code === 401) {
      console.log('\n🔧 Solutions possibles:');
      console.log('1. Vérifiez que la clé API est valide');
      console.log('2. Assurez-vous que la clé API a les bonnes restrictions');
    }
  }
}

// Exécuter le test
testGoogleCalendarAPI().then(() => {
  console.log('\n🏁 Test terminé.');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur inattendue:', error);
  process.exit(1);
});