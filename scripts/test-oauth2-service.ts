/**
 * Script de test pour le service OAuth 2.0 Google Calendar
 * 
 * Usage: npm run test:oauth2
 */

import 'dotenv/config';
import { getGoogleCalendarOAuth2Service } from '../server/services/googleCalendarOAuth2';
import {
  calculateAvailableSlots,
  convertGoogleEventToSimpleEvent,
  DEFAULT_WORKING_HOURS,
} from '../server/services/availabilityCalculator';

async function main() {
  console.log('🧪 Test du service OAuth 2.0 Google Calendar\n');
  console.log('════════════════════════════════════════════════════════════\n');

  // 1. Vérifier les variables d'environnement
  console.log('1️⃣ Vérification des variables d\'environnement...\n');
  
  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
    'GOOGLE_CALENDAR_ID',
  ];

  let hasAllVars = true;
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${varName}: MANQUANT`);
      hasAllVars = false;
    }
  }

  if (!hasAllVars) {
    console.error('\n❌ Configuration incomplète. Veuillez définir toutes les variables dans .env');
    process.exit(1);
  }

  console.log('\n   ✅ Configuration complète\n');

  // 2. Initialiser le service
  console.log('2️⃣ Initialisation du service OAuth 2.0...\n');

  const service = getGoogleCalendarOAuth2Service();

  if (!service) {
    console.error('   ❌ Impossible d\'initialiser le service');
    process.exit(1);
  }

  console.log('   ✅ Service initialisé avec succès\n');

  // 3. Récupérer les événements existants
  console.log('3️⃣ Récupération des événements Google Calendar...\n');

  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);
  const endDateStr = endDate.toISOString().split('T')[0];

  console.log(`   Période: ${startDate} → ${endDateStr}\n`);

  try {
    const events = await service.getExistingEvents(startDate, endDateStr);
    console.log(`   ✅ ${events.length} événements récupérés\n`);

    if (events.length > 0) {
      console.log('   📅 Événements existants:\n');
      events.slice(0, 5).forEach((event, index) => {
        const start = new Date(event.start.dateTime).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
        console.log(`      ${index + 1}. ${event.summary} - ${start}`);
      });
      if (events.length > 5) {
        console.log(`      ... et ${events.length - 5} autres`);
      }
      console.log();
    }
  } catch (error: any) {
    console.error(`   ❌ Erreur: ${error.message}`);
    process.exit(1);
  }

  // 4. Calculer les disponibilités
  console.log('4️⃣ Calcul des créneaux disponibles...\n');

  try {
    const events = await service.getExistingEvents(startDate, endDateStr);
    const simpleEvents = events.map(convertGoogleEventToSimpleEvent);
    
    const availableSlots = calculateAvailableSlots(
      startDate,
      endDateStr,
      simpleEvents,
      DEFAULT_WORKING_HOURS
    );

    console.log(`   ✅ ${availableSlots.length} créneaux disponibles trouvés\n`);

    if (availableSlots.length > 0) {
      console.log('   📆 Premiers créneaux disponibles:\n');
      availableSlots.slice(0, 10).forEach((slot, index) => {
        console.log(`      ${index + 1}. ${slot.date} ${slot.startTime}-${slot.endTime}`);
      });
      if (availableSlots.length > 10) {
        console.log(`      ... et ${availableSlots.length - 10} autres`);
      }
      console.log();
    }
  } catch (error: any) {
    console.error(`   ❌ Erreur: ${error.message}`);
    process.exit(1);
  }

  // 5. Afficher les règles de travail
  console.log('5️⃣ Configuration des règles de travail...\n');
  console.log(`   Timezone: ${DEFAULT_WORKING_HOURS.timezone}`);
  console.log(`   Jours ouvrés: ${DEFAULT_WORKING_HOURS.workingDays.join(', ')} (1=Lundi, 7=Dimanche)`);
  console.log(`   Horaires: ${DEFAULT_WORKING_HOURS.startHour.toString().padStart(2, '0')}:${DEFAULT_WORKING_HOURS.startMinute.toString().padStart(2, '0')} - ${DEFAULT_WORKING_HOURS.endHour.toString().padStart(2, '0')}:${DEFAULT_WORKING_HOURS.endMinute.toString().padStart(2, '0')}`);
  console.log(`   Durée des créneaux: ${DEFAULT_WORKING_HOURS.slotDuration} minutes`);
  console.log(`   Délai minimum de réservation: ${DEFAULT_WORKING_HOURS.minAdvanceBookingMinutes} minutes`);
  console.log(`   Fenêtre de réservation: ${DEFAULT_WORKING_HOURS.maxAdvanceBookingDays} jours\n`);

  console.log('════════════════════════════════════════════════════════════\n');
  console.log('✅ Tous les tests sont passés avec succès !');
  console.log('🚀 Le service OAuth 2.0 est opérationnel.\n');
}

main().catch(error => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});
