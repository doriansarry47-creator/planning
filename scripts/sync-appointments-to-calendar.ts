#!/usr/bin/env tsx
/**
 * Script de synchronisation des rendez-vous de la BD vers Google Calendar
 * 
 * Ce script récupère tous les rendez-vous de la base de données qui n'ont pas 
 * encore été synchronisés avec Google Calendar et les crée dans le calendrier.
 * 
 * Usage:
 *   npm run sync:appointments
 *   ou
 *   tsx scripts/sync-appointments-to-calendar.ts
 */

import { config } from 'dotenv';
config();

async function syncAppointmentsToCalendar() {
  console.log('🔄 Synchronisation des rendez-vous vers Google Calendar...\n');
  
  try {
    // Importer les dépendances
    const { getDb } = await import('../server/db');
    const { appointments } = await import('../drizzle/schema');
    const { getGoogleCalendarService } = await import('../server/services/googleCalendar');
    const { eq, isNull } = await import('drizzle-orm');
    
    // Vérifier la connexion à la base de données
    const db = await getDb();
    if (!db) {
      console.error('❌ Erreur : Base de données non disponible');
      console.log('Vérifiez que DATABASE_URL est configuré dans .env');
      process.exit(1);
    }
    
    // Vérifier la connexion à Google Calendar
    const calendarService = getGoogleCalendarService();
    if (!calendarService) {
      console.error('❌ Erreur : Service Google Calendar non disponible');
      console.log('Vérifiez que les variables d\'environnement suivantes sont configurées :');
      console.log('  - GOOGLE_SERVICE_ACCOUNT_EMAIL');
      console.log('  - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
      console.log('  - GOOGLE_CALENDAR_ID');
      process.exit(1);
    }
    
    console.log('✅ Connexion à la base de données établie');
    console.log('✅ Service Google Calendar connecté\n');
    
    // Récupérer tous les rendez-vous sans googleEventId OU avec un ID local
    // Cela signifie qu'ils n'ont pas encore été synchronisés avec Google Calendar
    const { or, like } = await import('drizzle-orm');
    
    const unsyncedAppointments = await db
      .select()
      .from(appointments)
      .where(
        or(
          isNull(appointments.googleEventId),
          like(appointments.googleEventId, 'local_%')
        )
      );
    
    console.log(`📊 ${unsyncedAppointments.length} rendez-vous non synchronisés trouvés\n`);
    
    if (unsyncedAppointments.length === 0) {
      console.log('✅ Tous les rendez-vous sont déjà synchronisés !');
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    // Synchroniser chaque rendez-vous
    for (const appointment of unsyncedAppointments) {
      try {
        console.log(`📅 Synchronisation du rendez-vous #${appointment.id}`);
        console.log(`   Patient: ${appointment.customerName}`);
        console.log(`   Date: ${appointment.startTime.toISOString()}`);
        
        // Extraire les heures et minutes
        const startDate = new Date(appointment.startTime);
        const endDate = new Date(appointment.endTime);
        
        const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
        const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
        
        // Créer l'événement dans Google Calendar
        const eventId = await calendarService.createEvent({
          date: startDate,
          startTime: startTime,
          endTime: endTime,
          patientName: appointment.customerName,
          patientEmail: appointment.customerEmail,
          patientPhone: appointment.customerPhone || undefined,
          reason: appointment.notes || undefined,
          practitionerName: "Dorian Sarry",
        });
        
        if (eventId) {
          // Mettre à jour la BD avec le googleEventId
          await db
            .update(appointments)
            .set({ googleEventId: eventId })
            .where(eq(appointments.id, appointment.id));
          
          console.log(`   ✅ Synchronisé avec succès (Event ID: ${eventId})\n`);
          successCount++;
        } else {
          console.log(`   ⚠️ Échec de la création dans Google Calendar\n`);
          failCount++;
        }
      } catch (error: any) {
        console.error(`   ❌ Erreur : ${error.message}\n`);
        failCount++;
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE LA SYNCHRONISATION');
    console.log('='.repeat(60));
    console.log(`Total rendez-vous traités : ${unsyncedAppointments.length}`);
    console.log(`✅ Synchronisés avec succès : ${successCount}`);
    console.log(`❌ Échecs : ${failCount}`);
    console.log('='.repeat(60) + '\n');
    
    if (successCount > 0) {
      console.log('✅ Synchronisation terminée avec succès !');
      console.log('💡 Conseil : Vérifiez votre Google Calendar pour voir les nouveaux événements');
    }
    
    if (failCount > 0) {
      console.log('⚠️ Certains rendez-vous n\'ont pas pu être synchronisés');
      console.log('💡 Vérifiez les logs ci-dessus pour plus de détails');
    }
    
  } catch (error: any) {
    console.error('\n❌ Erreur fatale lors de la synchronisation:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
syncAppointmentsToCalendar()
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur lors de l\'exécution:', error);
    process.exit(1);
  });
