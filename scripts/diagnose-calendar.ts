#!/usr/bin/env tsx
/**
 * Script de diagnostic complet pour Google Calendar
 * Vérifie la connexion, liste les événements et analyse les créneaux disponibles
 */

import { config } from 'dotenv';
config();

async function diagnoseCalendar() {
  console.log('🔍 DIAGNOSTIC GOOGLE CALENDAR\n');
  console.log('='.repeat(70));
  
  try {
    // 1. Vérifier les variables d'environnement
    console.log('\n📋 ÉTAPE 1 : Vérification des variables d\'environnement');
    console.log('='.repeat(70));
    
    const requiredVars = [
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
      'GOOGLE_CALENDAR_ID'
    ];
    
    let allVarsPresent = true;
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: Configuré`);
        if (varName === 'GOOGLE_SERVICE_ACCOUNT_EMAIL') {
          console.log(`   → Email: ${value}`);
        }
        if (varName === 'GOOGLE_CALENDAR_ID') {
          console.log(`   → Calendar ID: ${value}`);
        }
      } else {
        console.log(`❌ ${varName}: MANQUANT`);
        allVarsPresent = false;
      }
    }
    
    if (!allVarsPresent) {
      console.log('\n❌ Erreur : Variables d\'environnement manquantes');
      console.log('💡 Vérifiez votre fichier .env');
      process.exit(1);
    }
    
    // 2. Tester la connexion au service Google Calendar
    console.log('\n📋 ÉTAPE 2 : Connexion au service Google Calendar');
    console.log('='.repeat(70));
    
    const { getGoogleCalendarService } = await import('../server/services/googleCalendar');
    const service = getGoogleCalendarService();
    
    if (!service) {
      console.log('❌ Impossible de créer le service Google Calendar');
      console.log('💡 Vérifiez la configuration du service account');
      process.exit(1);
    }
    
    console.log('✅ Service Google Calendar créé avec succès');
    
    // 3. Récupérer tous les événements du calendrier
    console.log('\n📋 ÉTAPE 3 : Récupération des événements du calendrier');
    console.log('='.repeat(70));
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // 7 jours avant
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 jours après
    
    console.log(`📅 Période analysée: ${startDate.toLocaleDateString('fr-FR')} → ${endDate.toLocaleDateString('fr-FR')}`);
    
    const { google } = await import('googleapis');
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });
    
    const calendar = google.calendar({ version: 'v3', auth });
    
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items || [];
    console.log(`\n📊 Total d'événements trouvés: ${events.length}`);
    
    // 4. Analyser les événements
    console.log('\n📋 ÉTAPE 4 : Analyse des événements');
    console.log('='.repeat(70));
    
    let availabilityCount = 0;
    let appointmentCount = 0;
    let otherCount = 0;
    
    const availabilityEvents = [];
    const appointmentEvents = [];
    const otherEvents = [];
    
    for (const event of events) {
      const summary = event.summary || '(Sans titre)';
      const start = event.start?.dateTime || event.start?.date;
      const end = event.end?.dateTime || event.end?.date;
      const transparency = event.transparency;
      const isAvailabilitySlot = event.extendedProperties?.private?.isAvailabilitySlot === 'true';
      const isAppointment = event.extendedProperties?.private?.isAppointment === 'true';
      
      // Classifier l'événement
      const isAvailability = 
        isAvailabilitySlot ||
        transparency === 'transparent' ||
        summary.toUpperCase().includes('DISPONIBLE');
      
      const isBookedAppointment = 
        isAppointment ||
        transparency === 'opaque' ||
        (!transparency && !summary.toUpperCase().includes('DISPONIBLE'));
      
      if (isAvailability && !isBookedAppointment) {
        availabilityCount++;
        availabilityEvents.push({
          summary,
          start,
          end,
          transparency,
          isAvailabilitySlot
        });
      } else if (isBookedAppointment) {
        appointmentCount++;
        appointmentEvents.push({
          summary,
          start,
          end,
          transparency,
          isAppointment
        });
      } else {
        otherCount++;
        otherEvents.push({
          summary,
          start,
          end,
          transparency
        });
      }
    }
    
    console.log(`\n📊 Classification des événements:`);
    console.log(`   🟢 Plages de disponibilité: ${availabilityCount}`);
    console.log(`   🔵 Rendez-vous réservés: ${appointmentCount}`);
    console.log(`   ⚪ Autres événements: ${otherCount}`);
    
    // 5. Détailler les plages de disponibilité
    if (availabilityCount > 0) {
      console.log('\n📋 DÉTAIL DES PLAGES DE DISPONIBILITÉ:');
      console.log('='.repeat(70));
      
      availabilityEvents.forEach((event, index) => {
        console.log(`\n${index + 1}. ${event.summary}`);
        console.log(`   📅 Début: ${event.start}`);
        console.log(`   📅 Fin: ${event.end}`);
        console.log(`   🔍 Transparence: ${event.transparency || 'opaque'}`);
        console.log(`   🏷️  Marqué comme disponibilité: ${event.isAvailabilitySlot ? 'Oui' : 'Non'}`);
      });
    } else {
      console.log('\n⚠️ AUCUNE PLAGE DE DISPONIBILITÉ TROUVÉE');
      console.log('Pour que le système détecte les plages disponibles, vos événements doivent:');
      console.log('  1. Avoir "DISPONIBLE" dans le titre (ex: "DISPONIBLE - Consultations")');
      console.log('  2. OU être marqués comme "transparent" (ne pas bloquer le calendrier)');
      console.log('  3. OU avoir la propriété extendedProperties.isAvailabilitySlot = true');
    }
    
    // 6. Tester la génération de créneaux
    console.log('\n📋 ÉTAPE 5 : Test de génération des créneaux horaires');
    console.log('='.repeat(70));
    
    const slots = await service.getAvailabilitySlots(startDate, endDate, 60);
    
    console.log(`\n📊 Total de créneaux générés: ${slots.length}`);
    
    const availableSlots = slots.filter(s => s.isAvailable);
    const bookedSlots = slots.filter(s => !s.isAvailable);
    
    console.log(`   🟢 Créneaux disponibles: ${availableSlots.length}`);
    console.log(`   🔴 Créneaux réservés: ${bookedSlots.length}`);
    
    if (availableSlots.length > 0) {
      console.log('\n📅 Premiers créneaux disponibles:');
      availableSlots.slice(0, 10).forEach((slot, index) => {
        const dateStr = slot.date.toLocaleDateString('fr-FR');
        console.log(`   ${index + 1}. ${dateStr} de ${slot.startTime} à ${slot.endTime}`);
      });
      
      if (availableSlots.length > 10) {
        console.log(`   ... et ${availableSlots.length - 10} autres créneaux`);
      }
    } else {
      console.log('\n⚠️ AUCUN CRÉNEAU DISPONIBLE GÉNÉRÉ');
    }
    
    // 7. Résumé et recommandations
    console.log('\n📋 RÉSUMÉ ET RECOMMANDATIONS');
    console.log('='.repeat(70));
    
    if (availabilityCount === 0) {
      console.log('\n❌ PROBLÈME IDENTIFIÉ: Aucune plage de disponibilité dans le calendrier');
      console.log('\n💡 SOLUTIONS:');
      console.log('   1. Créez des événements dans Google Calendar avec "DISPONIBLE" dans le titre');
      console.log('   2. Ou utilisez le script de synchronisation: npm run sync:availability');
      console.log('   3. Assurez-vous que les événements couvrent les dates futures');
      console.log('\n📝 EXEMPLE D\'ÉVÉNEMENT:');
      console.log('   Titre: DISPONIBLE - Consultations');
      console.log('   Date: Lundi 16 Décembre 2024');
      console.log('   Heure: 09:00 - 18:00');
      console.log('   Transparence: Transparent (ne pas bloquer le calendrier)');
    } else if (availableSlots.length === 0) {
      console.log('\n⚠️ PROBLÈME IDENTIFIÉ: Plages disponibles trouvées mais aucun créneau généré');
      console.log('\n💡 CAUSES POSSIBLES:');
      console.log('   1. Les plages sont trop courtes (< 60 minutes)');
      console.log('   2. Les plages sont dans le passé');
      console.log('   3. Toutes les plages sont déjà réservées');
    } else {
      console.log('\n✅ TOUT FONCTIONNE CORRECTEMENT !');
      console.log(`   ${availableSlots.length} créneaux disponibles détectés`);
      console.log(`   ${availabilityCount} plages de disponibilité configurées`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Diagnostic terminé\n');
    
  } catch (error: any) {
    console.error('\n❌ ERREUR lors du diagnostic:', error.message);
    console.error('\nDétails:', error);
    process.exit(1);
  }
}

diagnoseCalendar()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
