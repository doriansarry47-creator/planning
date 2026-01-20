
import { calculateAvailableSlots, DEFAULT_WORKING_HOURS } from '../server/services/availabilityCalculator';

async function testLogic() {
  console.log('🚀 Test de la logique d\'enchaînement des créneaux...');

  // Simulation d'une plage "DISPONIBLE" de 14h à 20h
  const rangeStart = new Date('2026-01-20T14:00:00+01:00');
  const rangeEnd = new Date('2026-01-20T20:00:00+01:00');

  // Simulation d'un rendez-vous de 18h à 19h
  const apptStart = new Date('2026-01-20T18:00:00+01:00');
  const apptEnd = new Date('2026-01-20T19:00:00+01:00');

  const events = [
    {
      startDateTime: rangeStart,
      endDateTime: rangeEnd,
      summary: 'DISPONIBLE'
    },
    {
      startDateTime: apptStart,
      endDateTime: apptEnd,
      summary: 'RDV Patient'
    }
  ];

  const slots = calculateAvailableSlots(
    '2026-01-20',
    '2026-01-20',
    events,
    {
      ...DEFAULT_WORKING_HOURS,
      minAdvanceBookingMinutes: 0 // Pour le test
    }
  );

  console.log('\nCréneaux générés :');
  slots.forEach(s => {
    console.log(`- ${s.startTime} à ${s.endTime} (${s.duration} min)`);
  });

  // Vérification
  const has19h = slots.some(s => s.startTime === '19:00');
  if (has19h) {
    console.log('\n✅ SUCCÈS : Un créneau est bien proposé à 19h00 (immédiatement après le RDV de 18h-19h).');
  } else {
    console.error('\n❌ ÉCHEC : Aucun créneau à 19h00.');
  }
}

testLogic().catch(console.error);
