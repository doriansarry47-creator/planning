#!/usr/bin/env tsx
/**
 * Script pour créer quelques créneaux de test
 */

import { config } from 'dotenv';
import { getAvailabilitySyncService } from '../server/services/availabilitySync';

// Charger les variables d'environnement
config();

async function createTestSlots() {
  console.log('🧪 Création de créneaux de test...\n');

  const service = getAvailabilitySyncService();
  
  if (!service) {
    console.error('❌ Erreur: Service de synchronisation non disponible');
    process.exit(1);
  }

  // Créer des créneaux pour les 7 prochains jours
  const today = new Date();
  const slots: Array<{date: Date, startTime: string, endTime: string}> = [];

  // Générer des créneaux pour chaque jour ouvrable de la semaine prochaine
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Sauter les week-ends (0 = dimanche, 6 = samedi)
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // Créer 3 créneaux par jour : matin, midi, après-midi
    slots.push(
      { date: new Date(date), startTime: '09:00', endTime: '10:00' },
      { date: new Date(date), startTime: '14:00', endTime: '15:00' },
      { date: new Date(date), startTime: '16:00', endTime: '17:00' }
    );
  }

  console.log(`📅 Création de ${slots.length} créneaux de test...\n`);

  let created = 0;
  let errors = 0;

  for (const slot of slots) {
    try {
      const eventId = await service.createAvailabilitySlot(
        slot.date,
        slot.startTime,
        slot.endTime,
        '🟢 DISPONIBLE'
      );

      if (eventId) {
        created++;
        console.log(`✓ Créneau créé: ${slot.date.toLocaleDateString('fr-FR')} ${slot.startTime}-${slot.endTime}`);
      } else {
        errors++;
        console.error(`✗ Échec: ${slot.date.toLocaleDateString('fr-FR')} ${slot.startTime}-${slot.endTime}`);
      }
    } catch (error) {
      errors++;
      console.error(`✗ Erreur: ${slot.date.toLocaleDateString('fr-FR')} ${slot.startTime}-${slot.endTime}`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Créneaux créés: ${created}`);
  console.log(`❌ Erreurs: ${errors}`);
  console.log('='.repeat(60));
  console.log('\n💡 Vous pouvez maintenant tester l\'application!');
}

createTestSlots().catch(console.error);
