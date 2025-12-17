import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { getCalendarSyncService } from './services/calendarSyncService';
import { getGoogleCalendarService } from './services/googleCalendar';
import { getAutoSyncService } from './services/autoSyncService';
import { eq, and, gte, lte, or } from 'drizzle-orm';

export const calendarSyncRouter = router({
  /**
   * Synchroniser les rendez-vous supprimés sur Google Calendar
   * Met à jour la base de données et libère les créneaux
   */
  syncDeletedAppointments: publicProcedure
    .input(z.object({}).optional())
    .mutation(async () => {
      const syncService = getCalendarSyncService();

      if (!syncService) {
        console.log('[CalendarSyncRouter] Service de synchronisation non disponible');
        return {
          success: false,
          error: 'Service de synchronisation Google Calendar non configuré',
          result: null,
        };
      }

      try {
        console.log('[CalendarSyncRouter] Démarrage de la synchronisation des RDV supprimés...');
        const result = await syncService.syncDeletedAppointments();

        return {
          success: true,
          result,
          message: `Synchronisation terminée: ${result.cancelled} RDV annulés, ${result.freedSlots} créneaux libérés`,
        };
      } catch (error: any) {
        console.error('[CalendarSyncRouter] Erreur synchronisation:', error);
        return {
          success: false,
          error: error.message,
          result: null,
        };
      }
    }),

  /**
   * Synchronisation complète avec détection des événements modifiés
   */
  fullSync: publicProcedure
    .input(
      z.object({
        lastSyncTime: z.string().datetime().optional(),
      }).optional()
    )
    .mutation(async ({ input }) => {
      const syncService = getCalendarSyncService();

      if (!syncService) {
        return {
          success: false,
          error: 'Service de synchronisation non configuré',
          result: null,
        };
      }

      try {
        const lastSync = input?.lastSyncTime ? new Date(input.lastSyncTime) : undefined;
        const result = await syncService.fullSync(lastSync);

        return {
          success: true,
          result,
          syncedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          result: null,
        };
      }
    }),

  /**
   * Vérifier l'état de synchronisation d'un rendez-vous spécifique
   */
  checkAppointmentSync: publicProcedure
    .input(
      z.object({
        appointmentId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const { getDb } = await import('./db');
        const { appointments } = await import('../drizzle/schema');
        const db = await getDb();

        const [appointment] = await db
          .select()
          .from(appointments)
          .where(eq(appointments.id, input.appointmentId))
          .limit(1);

        if (!appointment) {
          return {
            success: false,
            error: 'Rendez-vous non trouvé',
            exists: false,
          };
        }

        if (!appointment.googleEventId) {
          return {
            success: true,
            exists: true,
            hasGoogleEvent: false,
            googleEventExists: false,
            status: appointment.status,
          };
        }

        const syncService = getCalendarSyncService();
        let googleEventExists = false;

        if (syncService) {
          googleEventExists = await syncService.checkEventExists(appointment.googleEventId);
        }

        return {
          success: true,
          exists: true,
          hasGoogleEvent: true,
          googleEventId: appointment.googleEventId,
          googleEventExists,
          status: appointment.status,
          needsSync: !googleEventExists && appointment.status === 'confirmed',
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          exists: false,
        };
      }
    }),

  /**
   * Récupérer les créneaux disponibles avec synchronisation préalable
   * Cette route vérifie d'abord les RDV supprimés avant de retourner les créneaux
   */
  getAvailableSlotsWithSync: publicProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        slotDuration: z.number().default(60),
        autoSync: z.boolean().default(true),
      })
    )
    .query(async ({ input }) => {
      const syncService = getCalendarSyncService();
      const calendarService = getGoogleCalendarService();

      let syncResult = null;

      if (input.autoSync && syncService) {
        try {
          console.log('[CalendarSyncRouter] Synchronisation automatique avant récupération des créneaux...');
          syncResult = await syncService.syncDeletedAppointments();
          console.log('[CalendarSyncRouter] Synchronisation terminée:', syncResult);
        } catch (error) {
          console.error('[CalendarSyncRouter] Erreur synchronisation auto:', error);
        }
      }

      if (!calendarService) {
        return {
          success: false,
          error: 'Service Google Calendar non configuré',
          slots: {},
          syncResult,
        };
      }

      try {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);

        const slots = await calendarService.getAvailabilitySlots(
          startDate,
          endDate,
          input.slotDuration
        );

        const slotsByDate: Record<string, any[]> = {};
        
        for (const slot of slots) {
          if (slot.isAvailable) {
            const dateKey = slot.date.toISOString().split('T')[0];
            if (!slotsByDate[dateKey]) {
              slotsByDate[dateKey] = [];
            }
            slotsByDate[dateKey].push({
              startTime: slot.startTime,
              endTime: slot.endTime,
              duration: input.slotDuration,
              isAvailable: true,
            });
          }
        }

        return {
          success: true,
          slots: slotsByDate,
          totalSlots: slots.filter(s => s.isAvailable).length,
          syncResult,
          syncedAt: new Date().toISOString(),
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          slots: {},
          syncResult,
        };
      }
    }),

  /**
   * Annuler un rendez-vous et le marquer comme supprimé
   */
  cancelAppointment: publicProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        reason: z.string().optional(),
        deleteFromCalendar: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { getDb } = await import('./db');
        const { appointments } = await import('../drizzle/schema');
        const db = await getDb();

        const [appointment] = await db
          .select()
          .from(appointments)
          .where(eq(appointments.id, input.appointmentId))
          .limit(1);

        if (!appointment) {
          return {
            success: false,
            error: 'Rendez-vous non trouvé',
          };
        }

        if (input.deleteFromCalendar && appointment.googleEventId) {
          const calendarService = getGoogleCalendarService();
          if (calendarService) {
            try {
              await calendarService.cancelEvent(appointment.googleEventId);
              console.log('[CalendarSyncRouter] Événement Google Calendar supprimé');
            } catch (error) {
              console.error('[CalendarSyncRouter] Erreur suppression événement:', error);
            }
          }
        }

        await db
          .update(appointments)
          .set({
            status: 'cancelled',
            notes: appointment.notes 
              ? `${appointment.notes}\n\nAnnulé: ${input.reason || 'Pas de raison spécifiée'}`
              : `Annulé: ${input.reason || 'Pas de raison spécifiée'}`,
            updatedAt: new Date(),
          })
          .where(eq(appointments.id, input.appointmentId));

        return {
          success: true,
          message: 'Rendez-vous annulé avec succès',
          freedSlot: {
            date: appointment.startTime.toISOString().split('T')[0],
            startTime: appointment.startTime.toTimeString().slice(0, 5),
            endTime: appointment.endTime.toTimeString().slice(0, 5),
          },
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    }),

  /**
   * Statut de santé du service de synchronisation
   */
  healthCheck: publicProcedure
    .input(z.object({}).optional())
    .query(async () => {
      const syncService = getCalendarSyncService();
      const calendarService = getGoogleCalendarService();
      const autoSyncService = getAutoSyncService();

      return {
        success: true,
        syncServiceAvailable: syncService !== null,
        calendarServiceAvailable: calendarService !== null,
        autoSyncStats: autoSyncService.getStats(),
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Obtenir les statistiques de synchronisation automatique
   */
  getAutoSyncStats: publicProcedure
    .input(z.object({}).optional())
    .query(async () => {
      const autoSyncService = getAutoSyncService();
      const stats = autoSyncService.getStats();

      return {
        success: true,
        stats,
        message: stats.pollingActive 
          ? 'Synchronisation automatique active' 
          : 'Synchronisation automatique inactive',
      };
    }),

  /**
   * Forcer une synchronisation immédiate (ignorer le cache)
   */
  forceSyncNow: publicProcedure
    .input(z.object({}).optional())
    .mutation(async () => {
      const autoSyncService = getAutoSyncService();

      try {
        console.log('[CalendarSyncRouter] 🔄 Synchronisation forcée démarrée...');
        const result = await autoSyncService.syncIfNeeded(true); // true = forcer, ignorer le cache

        return {
          success: true,
          result,
          message: result && result.cancelled > 0
            ? `Synchronisation terminée: ${result.cancelled} RDV annulés, ${result.freedSlots} créneaux libérés`
            : 'Synchronisation terminée: Aucun changement détecté',
        };
      } catch (error: any) {
        console.error('[CalendarSyncRouter] Erreur synchronisation forcée:', error);
        return {
          success: false,
          error: error.message,
          result: null,
        };
      }
    }),

  /**
   * Démarrer le polling automatique
   */
  startAutoPolling: publicProcedure
    .input(z.object({}).optional())
    .mutation(async () => {
      const autoSyncService = getAutoSyncService();
      
      try {
        autoSyncService.startAutoPolling();
        return {
          success: true,
          message: 'Polling automatique démarré (synchronisation toutes les 2 minutes)',
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    }),

  /**
   * Arrêter le polling automatique
   */
  stopAutoPolling: publicProcedure
    .input(z.object({}).optional())
    .mutation(async () => {
      const autoSyncService = getAutoSyncService();
      
      try {
        autoSyncService.stopAutoPolling();
        return {
          success: true,
          message: 'Polling automatique arrêté',
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    }),
});
