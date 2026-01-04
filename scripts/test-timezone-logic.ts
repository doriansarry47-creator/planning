
import { calculateAvailableSlots, convertGoogleEventToSimpleEvent } from '../server/services/availabilityCalculator';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Europe/Paris';

async function testTimezoneLogic() {
  console.log('🧪 TEST DE LA LOGIQUE DES FUSEAUX HORAIRES\n');

  // 1. Simuler un événement Google Calendar "DISPONIBLE"
  // Supposons un événement de 09:00 à 12:00 (heure de Paris)
  // En hiver (janvier), Paris est à UTC+1.
  // Donc 09:00 Paris = 08:00 UTC
  // 12:00 Paris = 11:00 UTC
  
  const dateStr = '2026-01-10';
  const googleEvent = {
    summary: 'DISPONIBLE',
    start: {
      dateTime: `${dateStr}T09:00:00+01:00`,
      timeZone: TIMEZONE
    },
    end: {
      dateTime: `${dateStr}T12:00:00+01:00`,
      timeZone: TIMEZONE
    }
  };

  console.log(`Événement source (Paris): 09:00 à 12:00`);
  console.log(`ISO Start: ${googleEvent.start.dateTime}`);
  
  const simpleEvent = convertGoogleEventToSimpleEvent(googleEvent);
  console.log(`SimpleEvent Start (UTC): ${simpleEvent.startDateTime.toISOString()}`);

  // 2. Calculer les créneaux
  const slots = calculateAvailableSlots(dateStr, dateStr, [simpleEvent]);

  console.log(`\nCréneaux générés pour ${dateStr}:`);
  slots.forEach((slot, i) => {
    console.log(`${i + 1}. ${slot.startTime} - ${slot.endTime}`);
  });

  // Vérification de la cohérence
  if (slots.length > 0) {
    const firstSlot = slots[0];
    if (firstSlot.startTime === '09:00') {
      console.log('\n✅ SUCCÈS: Le premier créneau commence bien à 09:00');
    } else {
      console.log(`\n❌ ERREUR: Le premier créneau commence à ${firstSlot.startTime} au lieu de 09:00`);
    }
  } else {
    console.log('\n❌ ERREUR: Aucun créneau généré');
  }
}

testTimezoneLogic().catch(console.error);
