#!/usr/bin/env tsx
/**
 * Script de test pour tester la réservation de rendez-vous
 */

import { config } from 'dotenv';
import { getAvailabilitySyncService } from '../server/services/availabilitySync';

config();

async function testBooking() {
  console.log('🧪 Test de réservation de rendez-vous\n');
  console.log('='.repeat(60));

  const service = getAvailabilitySyncService();
  
  if (!service) {
    console.error('❌ Service non disponible');
    process.exit(1);
  }

  // Étape 1 : Récupérer les créneaux disponibles
  console.log('\n📅 ÉTAPE 1: Récupération des créneaux disponibles\n');
  
  const startDate = new Date();
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
  
  try {
    const availableSlots = await service.getAvailableSlots(startDate, endDate, 60);
    
    console.log(`✓ ${availableSlots.length} créneaux disponibles trouvés`);
    
    if (availableSlots.length === 0) {
      console.log('⚠️  Aucun créneau disponible pour tester la réservation');
      console.log('💡 Créez des créneaux avec: npm run sync:availability');
      return;
    }
    
    // Afficher les 5 premiers créneaux
    console.log('\n📋 Premiers créneaux disponibles:');
    availableSlots.slice(0, 5).forEach((slot, index) => {
      console.log(`  ${index + 1}. ${slot.date.toLocaleDateString('fr-FR')} ${slot.startTime}-${slot.endTime}`);
    });

    // Étape 2 : Réserver le premier créneau disponible
    console.log('\n' + '='.repeat(60));
    console.log('📝 ÉTAPE 2: Réservation d\'un créneau de test\n');
    
    const firstSlot = availableSlots[0];
    console.log(`Créneau à réserver: ${firstSlot.date.toLocaleDateString('fr-FR')} ${firstSlot.startTime}-${firstSlot.endTime}`);
    
    const testPatient = {
      name: 'Jean Dupont (TEST)',
      email: 'test@example.com',
      phone: '06 12 34 56 78',
      reason: 'Test de réservation automatique',
    };

    console.log('\nInformations du patient:');
    console.log(`  Nom: ${testPatient.name}`);
    console.log(`  Email: ${testPatient.email}`);
    console.log(`  Téléphone: ${testPatient.phone}`);
    console.log(`  Motif: ${testPatient.reason}`);
    
    console.log('\n🚀 Envoi de la réservation...');
    
    const eventId = await service.bookSlot(
      firstSlot.date,
      firstSlot.startTime,
      firstSlot.endTime,
      testPatient
    );
    
    if (eventId) {
      console.log('\n✅ SUCCÈS: Rendez-vous réservé!');
      console.log(`   ID de l'événement: ${eventId}`);
      console.log('   Le rendez-vous a été ajouté à Google Calendar');
      console.log('   Un email de confirmation a été envoyé (si configuré)');
      
      // Étape 3 : Vérifier que le créneau n'est plus disponible
      console.log('\n' + '='.repeat(60));
      console.log('🔍 ÉTAPE 3: Vérification du masquage du créneau\n');
      
      const updatedSlots = await service.getAvailableSlots(startDate, endDate, 60);
      console.log(`✓ ${updatedSlots.length} créneaux disponibles (avant: ${availableSlots.length})`);
      
      if (updatedSlots.length < availableSlots.length) {
        console.log('✅ Le créneau réservé a bien été masqué!');
      } else {
        console.log('⚠️  Le créneau pourrait encore apparaître (vérifiez dans Google Calendar)');
      }
      
    } else {
      console.log('\n❌ ÉCHEC: La réservation a échoué');
      console.log('   Vérifiez les logs ci-dessus pour plus de détails');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ Test terminé\n');
    
    console.log('📊 Résumé:');
    console.log(`   • Créneaux disponibles au départ: ${availableSlots.length}`);
    console.log(`   • Réservation effectuée: ${eventId ? 'OUI' : 'NON'}`);
    console.log(`   • ID événement: ${eventId || 'N/A'}`);
    
    console.log('\n💡 Prochaines étapes:');
    console.log('   1. Vérifiez dans Google Calendar que le RDV apparaît');
    console.log('   2. Vérifiez que le créneau n\'apparaît plus comme disponible');
    console.log('   3. Vérifiez l\'email de confirmation (si configuré)');
    console.log('   4. Testez l\'application web pour réserver un autre créneau\n');
    
  } catch (error: any) {
    console.error('\n❌ ERREUR:', error.message || error);
    console.error('\nDétails:', error);
  }
}

testBooking().catch(console.error);
