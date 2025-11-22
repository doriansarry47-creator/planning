import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { getGoogleCalendarOAuthService } from './services/googleCalendarOAuth';

/**
 * Router TRPC pour la gestion des rendez-vous via Google Calendar
 */
export const googleCalendarRouter = router({
  /**
   * Récupérer les créneaux disponibles pour une période
   */
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        startDate: z.string().datetime(), // ISO 8601
        endDate: z.string().datetime(),
        workingHours: z.object({
          start: z.string().regex(/^\d{2}:\d{2}$/),
          end: z.string().regex(/^\d{2}:\d{2}$/),
        }).optional(),
        slotDuration: z.number().min(15).max(120).optional(), // 15 à 120 minutes
      })
    )
    .query(async ({ input }) => {
      const service = getGoogleCalendarOAuthService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      const slots = await service.getAvailableSlots(
        startDate,
        endDate,
        input.workingHours,
        input.slotDuration
      );

      return {
        success: true,
        slots: slots.map(slot => ({
          date: slot.date.toISOString(),
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
        })),
        total: slots.length,
        available: slots.filter(s => s.isAvailable).length,
      };
    }),

  /**
   * Créer un rendez-vous
   */
  createAppointment: publicProcedure
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
      const service = getGoogleCalendarOAuthService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      // Vérifier la disponibilité d'abord
      const date = new Date(input.date);
      const isAvailable = await service.isSlotAvailable(
        date,
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
      const eventId = await service.createAppointment({
        patientName: input.patientName,
        patientEmail: input.patientEmail,
        patientPhone: input.patientPhone,
        date: date,
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
        message: 'Rendez-vous créé avec succès',
      };
    }),

  /**
   * Mettre à jour un rendez-vous
   */
  updateAppointment: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
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
      const service = getGoogleCalendarOAuthService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      const success = await service.updateAppointment(input.eventId, {
        patientName: input.patientName,
        patientEmail: input.patientEmail,
        patientPhone: input.patientPhone,
        date: new Date(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        reason: input.reason,
        practitionerName: input.practitionerName,
      });

      return {
        success,
        message: success ? 'Rendez-vous mis à jour' : 'Erreur lors de la mise à jour',
      };
    }),

  /**
   * Annuler un rendez-vous
   */
  cancelAppointment: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const service = getGoogleCalendarOAuthService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      const success = await service.cancelAppointment(input.eventId);

      return {
        success,
        message: success ? 'Rendez-vous annulé' : 'Erreur lors de l\'annulation',
      };
    }),

  /**
   * Vérifier si un créneau est disponible
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
      const service = getGoogleCalendarOAuthService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      const isAvailable = await service.isSlotAvailable(
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
   * Marquer un créneau comme disponible (pour l'admin)
   */
  markSlotAsAvailable: publicProcedure
    .input(
      z.object({
        date: z.string().datetime(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .mutation(async ({ input }) => {
      const service = getGoogleCalendarOAuthService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      const eventId = await service.markSlotAsAvailable(
        new Date(input.date),
        input.startTime,
        input.endTime
      );

      return {
        success: !!eventId,
        eventId,
        message: eventId ? 'Créneau marqué comme disponible' : 'Erreur',
      };
    }),

  /**
   * Obtenir un résumé des disponibilités
   */
  getAvailabilitySummary: publicProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ input }) => {
      const service = getGoogleCalendarOAuthService();
      if (!service) {
        throw new Error('Service Google Calendar non configuré');
      }

      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      const slots = await service.getAvailableSlots(startDate, endDate);

      // Grouper par date
      const slotsByDate = slots.reduce((acc, slot) => {
        const dateKey = slot.date.toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = { total: 0, available: 0 };
        }
        acc[dateKey].total++;
        if (slot.isAvailable) {
          acc[dateKey].available++;
        }
        return acc;
      }, {} as Record<string, { total: number; available: number }>);

      return {
        success: true,
        period: {
          start: input.startDate,
          end: input.endDate,
        },
        summary: slotsByDate,
        totalSlots: slots.length,
        availableSlots: slots.filter(s => s.isAvailable).length,
      };
    }),
});
