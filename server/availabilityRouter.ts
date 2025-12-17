import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { getGoogleCalendarService } from './services/googleCalendar';
import { getAvailabilitySyncService } from './services/availabilitySync';
import { getCalendarSyncService } from './services/calendarSyncService';

/**
 * Router TRPC pour la gestion des disponibilités via Google Calendar
 * Permet aux praticiens de gérer leurs créneaux de disponibilité
 * et aux patients de consulter les créneaux disponibles
 */
export const availabilityRouter = router({
  /**
   * Créer un créneau de disponibilité (ADMIN)
   */
  createSlot: publicProcedure
    .input(
      z.object({
        date: z.string().datetime(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        title: z.string().optional(),
        description: z.string().optional(),
        recurrence: z.object({
          frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
          until: z.string().datetime().optional(),
          count: z.number().optional(),
          byWeekDay: z.array(z.string()).optional(), // ['MO', 'TU', 'WE', 'TH', 'FR']
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const service = getGoogleCalendarService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      const eventId = await service.createAvailabilitySlot({
        date: new Date(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        title: input.title,
        description: input.description,
        recurrence: input.recurrence ? {
          frequency: input.recurrence.frequency,
          until: input.recurrence.until ? new Date(input.recurrence.until) : undefined,
          count: input.recurrence.count,
          byWeekDay: input.recurrence.byWeekDay,
        } : undefined,
      });

      if (!eventId) {
        return {
          success: false,
          error: 'Erreur lors de la création du créneau',
        };
      }

      return {
        success: true,
        eventId,
        message: 'Créneau de disponibilité créé avec succès',
      };
    }),

  /**
   * Mettre à jour un créneau de disponibilité (ADMIN)
   */
  updateSlot: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        date: z.string().datetime(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        title: z.string().optional(),
        description: z.string().optional(),
        recurrence: z.object({
          frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
          until: z.string().datetime().optional(),
          count: z.number().optional(),
          byWeekDay: z.array(z.string()).optional(),
        }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const service = getGoogleCalendarService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      const success = await service.updateAvailabilitySlot(input.eventId, {
        date: new Date(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        title: input.title,
        description: input.description,
        recurrence: input.recurrence ? {
          frequency: input.recurrence.frequency,
          until: input.recurrence.until ? new Date(input.recurrence.until) : undefined,
          count: input.recurrence.count,
          byWeekDay: input.recurrence.byWeekDay,
        } : undefined,
      });

      return {
        success,
        message: success ? 'Créneau mis à jour' : 'Erreur lors de la mise à jour',
      };
    }),

  /**
   * Supprimer un créneau de disponibilité (ADMIN)
   */
  deleteSlot: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const service = getGoogleCalendarService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      const success = await service.deleteAvailabilitySlot(input.eventId);

      return {
        success,
        message: success ? 'Créneau supprimé' : 'Erreur lors de la suppression',
      };
    }),

  /**
   * Récupérer les créneaux de disponibilité (PUBLIC)
   * Accessible aux patients pour voir les créneaux disponibles
   * LES CRÉNEAUX PRIS SONT AUTOMATIQUEMENT MASQUÉS
   */
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        slotDuration: z.number().min(15).max(120).optional().default(60),
      })
    )
    .query(async ({ input }) => {
      // ÉTAPE 1: Synchroniser les RDV supprimés sur Google Calendar
      const calendarSyncService = getCalendarSyncService();
      if (calendarSyncService) {
        try {
          console.log("[AvailabilityRouter] Synchronisation des RDV supprimés...");
          const syncResult = await calendarSyncService.syncDeletedAppointments();
          if (syncResult.cancelled > 0) {
            console.log(`[AvailabilityRouter] ✅ ${syncResult.cancelled} RDV annulés, ${syncResult.freedSlots} créneaux libérés`);
          }
        } catch (syncError: any) {
          console.warn("[AvailabilityRouter] ⚠️ Erreur de synchronisation (non bloquante):", syncError.message);
        }
      }

      // Utiliser le nouveau service de synchronisation
      const syncService = getAvailabilitySyncService();
      
      // Fallback sur l'ancien service si le nouveau n'est pas disponible
      if (!syncService) {
        const service = getGoogleCalendarService();
        if (!service) {
          throw new Error('Service Google Calendar non configuré');
        }

        const slots = await service.getAvailabilitySlots(
          new Date(input.startDate),
          new Date(input.endDate),
          input.slotDuration
        );

        // Grouper les créneaux par date (MASQUER LES CRÉNEAUX PRIS)
        const slotsByDate: Record<string, any[]> = {};
        slots.forEach(slot => {
          const dateKey = slot.date.toISOString().split('T')[0];
          if (!slotsByDate[dateKey]) {
            slotsByDate[dateKey] = [];
          }
          // NE RETOURNER QUE LES CRÉNEAUX DISPONIBLES
          if (slot.isAvailable) {
            slotsByDate[dateKey].push({
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable: true,
            });
          }
        });

        return {
          success: true,
          slots: slotsByDate,
          totalSlots: slots.filter(s => s.isAvailable).length, // Compter uniquement les disponibles
          availableSlots: slots.filter(s => s.isAvailable).length,
          period: {
            start: input.startDate,
            end: input.endDate,
          },
        };
      }

      // Utiliser le nouveau service (retourne uniquement les créneaux disponibles)
      const availableSlots = await syncService.getAvailableSlots(
        new Date(input.startDate),
        new Date(input.endDate),
        input.slotDuration
      );

      // Grouper les créneaux par date
      const slotsByDate: Record<string, any[]> = {};
      availableSlots.forEach(slot => {
        const dateKey = slot.date.toISOString().split('T')[0];
        if (!slotsByDate[dateKey]) {
          slotsByDate[dateKey] = [];
        }
        slotsByDate[dateKey].push({
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: true, // Toujours true car on ne retourne que les disponibles
        });
      });

      console.log(`[AvailabilityRouter] ${availableSlots.length} créneaux disponibles retournés (créneaux pris masqués)`);

      return {
        success: true,
        slots: slotsByDate,
        totalSlots: availableSlots.length,
        availableSlots: availableSlots.length,
        period: {
          start: input.startDate,
          end: input.endDate,
        },
      };
    }),

  /**
   * Réserver un créneau (créer un rendez-vous)
   * Le créneau sera automatiquement marqué comme pris et masqué
   */
  bookSlot: publicProcedure
    .input(
      z.object({
        patientName: z.string().min(2),
        patientEmail: z.string().email(),
        patientPhone: z.string().optional(),
        date: z.string().datetime(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        reason: z.string().optional(),
        practitionerName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Utiliser le nouveau service de synchronisation
      const syncService = getAvailabilitySyncService();
      
      if (syncService) {
        // Utiliser le nouveau service qui gère mieux les rendez-vous
        const eventId = await syncService.bookSlot(
          new Date(input.date),
          input.startTime,
          input.endTime,
          {
            name: input.patientName,
            email: input.patientEmail,
            phone: input.patientPhone,
            reason: input.reason,
          }
        );

        if (!eventId) {
          return {
            success: false,
            error: 'Ce créneau n\'est plus disponible ou une erreur est survenue',
          };
        }

        console.log(`[AvailabilityRouter] Rendez-vous créé: ${eventId} - Le créneau sera masqué`);

        return {
          success: true,
          eventId,
          message: 'Rendez-vous réservé avec succès. Le créneau ne sera plus visible pour les autres utilisateurs.',
        };
      }

      // Fallback sur l'ancien service
      const service = getGoogleCalendarService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      // Vérifier la disponibilité
      const isAvailable = await service.checkAvailability(
        new Date(input.date),
        input.startTime,
        input.endTime
      );

      if (!isAvailable) {
        return {
          success: false,
          error: 'Ce créneau n\'est plus disponible',
        };
      }

      // Créer le rendez-vous
      const eventId = await service.createEvent({
        patientName: input.patientName,
        patientEmail: input.patientEmail,
        patientPhone: input.patientPhone,
        date: new Date(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        reason: input.reason,
        practitionerName: input.practitionerName,
      });

      if (!eventId) {
        return {
          success: false,
          error: 'Erreur lors de la création du rendez-vous',
        };
      }

      return {
        success: true,
        eventId,
        message: 'Rendez-vous réservé avec succès',
      };
    }),

  /**
   * Vérifier la disponibilité d'un créneau spécifique
   */
  checkSlotAvailability: publicProcedure
    .input(
      z.object({
        date: z.string().datetime(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .query(async ({ input }) => {
      const service = getGoogleCalendarService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      const isAvailable = await service.checkAvailability(
        new Date(input.date),
        input.startTime,
        input.endTime
      );

      return {
        isAvailable,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
      };
    }),

  /**
   * Obtenir un résumé des disponibilités par jour
   */
  getAvailabilitySummary: publicProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ input }) => {
      const service = getGoogleCalendarService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      const slots = await service.getAvailabilitySlots(
        new Date(input.startDate),
        new Date(input.endDate)
      );

      // Grouper par date avec statistiques
      const summary: Record<string, { total: number; available: number; booked: number }> = {};
      
      slots.forEach(slot => {
        const dateKey = slot.date.toISOString().split('T')[0];
        if (!summary[dateKey]) {
          summary[dateKey] = { total: 0, available: 0, booked: 0 };
        }
        summary[dateKey].total++;
        if (slot.isAvailable) {
          summary[dateKey].available++;
        } else {
          summary[dateKey].booked++;
        }
      });

      return {
        success: true,
        summary,
        period: {
          start: input.startDate,
          end: input.endDate,
        },
      };
    }),
});
