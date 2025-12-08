import { config } from 'dotenv';
import { getAvailabilitySyncService } from '../server/services/availabilitySync';

// Charger les variables d'environnement
config();

/**
 * Script de synchronisation des disponibilités avec Google Calendar
 * 
 * Ce script permet de:
 * - Créer des créneaux de disponibilité pour une période donnée
 * - Synchroniser automatiquement avec Google Calendar
 * - Les créneaux pris seront automatiquement masqués dans l'application
 * 
 * Usage:
 * npm run sync-availability
 */

async function main() {
  console.log('='.repeat(60));
  console.log('🔄 SYNCHRONISATION DES DISPONIBILITÉS AVEC GOOGLE CALENDAR');
  console.log('='.repeat(60));
  console.log('');

  const service = getAvailabilitySyncService();
  
  if (!service) {
    console.error('❌ Erreur: Service de synchronisation non disponible');
    console.error('   Vérifiez que les variables d\'environnement sont correctement configurées:');
    console.error('   - GOOGLE_SERVICE_ACCOUNT_EMAIL');
    console.error('   - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
    console.error('   - GOOGLE_CALENDAR_ID');
    process.exit(1);
  }

  console.log('✅ Service de synchronisation initialisé');
  console.log('');

  // Configuration de la synchronisation
  // Modifier ces valeurs selon vos besoins
  const config = {
    // Période de synchronisation (3 mois à partir d'aujourd'hui)
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 mois
    
    // Horaires de travail
    workingHours: {
      start: '09:00',
      end: '18:00',
    },
    
    // Jours de travail (1=lundi, 2=mardi, ..., 5=vendredi)
    daysOfWeek: [1, 2, 3, 4, 5], // Du lundi au vendredi
    
    // Durée de chaque créneau (en minutes)
    slotDuration: 60, // 1 heure par créneau
  };

  console.log('📅 Configuration:');
  console.log(`   Période: du ${config.startDate.toLocaleDateString('fr-FR')} au ${config.endDate.toLocaleDateString('fr-FR')}`);
  console.log(`   Horaires: de ${config.workingHours.start} à ${config.workingHours.end}`);
  console.log(`   Jours: ${config.daysOfWeek.map(d => ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d]).join(', ')}`);
  console.log(`   Durée par créneau: ${config.slotDuration} minutes`);
  console.log('');

  // Demander confirmation
  console.log('⚠️  Cette opération va créer des créneaux de disponibilité dans votre Google Calendar');
  console.log('');
  
  // Calculer le nombre estimé de créneaux
  const daysCount = Math.floor((config.endDate.getTime() - config.startDate.getTime()) / (24 * 60 * 60 * 1000));
  const workingDaysCount = Math.floor(daysCount * config.daysOfWeek.length / 7);
  const workingMinutes = parseInt(config.workingHours.end.split(':')[0]) * 60 + parseInt(config.workingHours.end.split(':')[1]) 
                       - parseInt(config.workingHours.start.split(':')[0]) * 60 - parseInt(config.workingHours.start.split(':')[1]);
  const slotsPerDay = Math.floor(workingMinutes / config.slotDuration);
  const estimatedSlots = workingDaysCount * slotsPerDay;
  
  console.log(`📊 Nombre estimé de créneaux à créer: ${estimatedSlots}`);
  console.log('');
  console.log('🚀 Démarrage de la synchronisation...');
  console.log('');

  try {
    const startTime = Date.now();
    
    const result = await service.syncAvailabilityPeriod(
      config.startDate,
      config.endDate,
      config.workingHours,
      config.daysOfWeek,
      config.slotDuration
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ SYNCHRONISATION TERMINÉE');
    console.log('='.repeat(60));
    console.log(`   Créneaux créés: ${result.created}`);
    console.log(`   Erreurs: ${result.errors}`);
    console.log(`   Durée: ${duration} secondes`);
    console.log('');
    console.log('✨ Les créneaux de disponibilité ont été ajoutés à votre Google Calendar');
    console.log('📱 Les créneaux pris seront automatiquement masqués dans l\'application');
    console.log('');
    
    if (result.errors > 0) {
      console.log('⚠️  Attention: Certains créneaux n\'ont pas pu être créés');
      console.log('   Vérifiez les logs ci-dessus pour plus de détails');
    }
  } catch (error) {
    console.error('');
    console.error('❌ ERREUR LORS DE LA SYNCHRONISATION');
    console.error('='.repeat(60));
    console.error(error);
    process.exit(1);
  }
}

// Lancer le script
main().catch(console.error);
