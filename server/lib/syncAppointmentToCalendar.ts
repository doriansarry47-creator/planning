/**
 * Utilitaire pour synchroniser un rendez-vous avec Google Calendar
 * Utilisé pour garantir que tous les rendez-vous créés sont enregistrés dans le calendrier
 */

import { getGoogleCalendarService } from '../services/googleCalendar';

export interface AppointmentToSync {
  id: number;
  startTime: Date;
  endTime: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  notes: string | null;
  googleEventId: string | null;
}

/**
 * Synchronise un rendez-vous avec Google Calendar
 * Retourne l'eventId Google Calendar (nouveau ou existant)
 */
export async function syncAppointmentToCalendar(
  appointment: AppointmentToSync
): Promise<{ success: boolean; eventId: string | null; error?: string }> {
  const service = getGoogleCalendarService();
  
  // Si le service n'est pas disponible, ne rien faire
  if (!service) {
    console.warn('[SyncAppointment] Service Google Calendar non disponible');
    return { 
      success: false, 
      eventId: null, 
      error: 'Service Google Calendar non configuré' 
    };
  }
  
  // Si le rendez-vous a déjà un eventId valide (non local), ne rien faire
  if (appointment.googleEventId && !appointment.googleEventId.startsWith('local_')) {
    console.log(`[SyncAppointment] Rendez-vous #${appointment.id} déjà synchronisé: ${appointment.googleEventId}`);
    return { 
      success: true, 
      eventId: appointment.googleEventId 
    };
  }
  
  try {
    // Extraire les heures et minutes
    const startDate = new Date(appointment.startTime);
    const endDate = new Date(appointment.endTime);
    
    const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`[SyncAppointment] Création de l'événement pour le rendez-vous #${appointment.id}`);
    
    // Créer l'événement dans Google Calendar
    const eventId = await service.createEvent({
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
      console.log(`[SyncAppointment] ✅ Événement créé: ${eventId}`);
      return { success: true, eventId };
    } else {
      console.warn(`[SyncAppointment] ⚠️ Échec de la création de l'événement`);
      return { 
        success: false, 
        eventId: null, 
        error: 'Échec de la création dans Google Calendar' 
      };
    }
  } catch (error: any) {
    console.error(`[SyncAppointment] ❌ Erreur:`, error.message);
    return { 
      success: false, 
      eventId: null, 
      error: error.message 
    };
  }
}

/**
 * Met à jour le googleEventId d'un rendez-vous dans la base de données
 */
export async function updateAppointmentEventId(
  appointmentId: number,
  eventId: string
): Promise<boolean> {
  try {
    const { getDb } = await import('../db');
    const { appointments } = await import('../../drizzle/schema');
    const { eq } = await import('drizzle-orm');
    
    const db = await getDb();
    if (!db) {
      console.error('[SyncAppointment] Base de données non disponible');
      return false;
    }
    
    await db
      .update(appointments)
      .set({ googleEventId: eventId })
      .where(eq(appointments.id, appointmentId));
    
    console.log(`[SyncAppointment] ✅ googleEventId mis à jour pour le rendez-vous #${appointmentId}`);
    return true;
  } catch (error: any) {
    console.error(`[SyncAppointment] ❌ Erreur lors de la mise à jour:`, error.message);
    return false;
  }
}
