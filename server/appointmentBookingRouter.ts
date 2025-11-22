import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from './_core/trpc';
import { getAppointmentCalendarService } from './services/appointmentCalendarService';

/**
 * Router TRPC pour la gestion avancée des rendez-vous
 * avec verrouillage, récurrence, et vérification des conflits
 */
export const appointmentBookingRouter = router({
  /**
   * ADMIN: Créer un calendrier dédié aux RDV
   */
  createAppointmentCalendar: adminProcedure
    .input(
      z.object({
        calendarName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const service = getAppointmentCalendarService();
      if (!service) {
        throw new Error('Service calendrier non configuré');
      }

      const calendarId = await service.createAppointmentCalendar(input.calendarName);

      return {
        success: true,
        calendarId,
        message: 'Calendrier dédié créé avec succès',
      };
    }),

  /**
   * ADMIN: Créer un créneau de disponibilité ponctuel
   */
  createAvailabilitySlot: adminProcedure
    .input(
      z.object({
        date: z.string().datetime(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .mutation(async ({ input }) => {
      const service = getAppointmentCalendarService();
      if (!service) {
        throw new Error('Service calendrier non configuré');
      }

      const slotId = await service.createAvailabilitySlot(
        new Date(input.date),
        input.startTime,
        input.endTime,
        false
      );

      return {
        success: !!slotId,
        slotId,
        message: slotId ? 'Créneau créé' : 'Erreur lors de la création',
      };
    }),

  /**
   * ADMIN: Créer des créneaux récurrents
   */
  createRecurrentAvailability: adminProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        recurrence: z.object({
          frequency: z.enum(['daily', 'weekly', 'monthly']),
          interval: z.number().optional(),
          daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
          endDate: z.string().datetime().optional(),
          count: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const service = getAppointmentCalendarService();
      if (!service) {
        throw new Error('Service calendrier non configuré');
      }

      const recurrence = {
        ...input.recurrence,
        endDate: input.recurrence.endDate ? new Date(input.recurrence.endDate) : undefined,
      };

      const slotId = await service.createRecurrentAvailability(
        new Date(input.startDate),
        input.startTime,
        input.endTime,
        recurrence
      );

      return {
        success: !!slotId,
        slotId,
        message: slotId ? 'Créneaux récurrents créés' : 'Erreur lors de la création',
      };
    }),

  /**
   * PUBLIC: Récupérer les créneaux disponibles
   */
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ input }) => {
      const service = getAppointmentCalendarService();
      if (!service) {
        throw new Error('Service calendrier non configuré');
      }

      const slots = await service.getAvailableSlots(
        new Date(input.startDate),
        new Date(input.endDate)
      );

      return {
        success: true,
        slots: slots.map(slot => ({
          id: slot.id,
          date: slot.date.toISOString(),
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
          isRecurrent: slot.isRecurrent,
        })),
        total: slots.length,
      };
    }),

  /**
   * PUBLIC: Verrouiller un créneau (quand le patient commence à réserver)
   */
  lockSlot: publicProcedure
    .input(
      z.object({
        slotId: z.string(),
        durationMinutes: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const service = getAppointmentCalendarService();
      if (!service) {
        throw new Error('Service calendrier non configuré');
      }

      const success = await service.lockSlot(
        input.slotId,
        input.durationMinutes || 5
      );

      return {
        success,
        message: success 
          ? 'Créneau verrouillé pour vous' 
          : 'Impossible de verrouiller ce créneau',
      };
    }),

  /**
   * PUBLIC: Déverrouiller un créneau (si le patient annule)
   */
  unlockSlot: publicProcedure
    .input(
      z.object({
        slotId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const service = getAppointmentCalendarService();
      if (!service) {
        throw new Error('Service calendrier non configuré');
      }

      const success = await service.unlockSlot(input.slotId);

      return {
        success,
        message: success ? 'Créneau déverrouillé' : 'Erreur lors du déverrouillage',
      };
    }),

  /**
   * PUBLIC: Vérifier les conflits avant réservation
   */
  checkConflicts: publicProcedure
    .input(
      z.object({
        date: z.string().datetime(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .query(async ({ input }) => {
      const service = getAppointmentCalendarService();
      if (!service) {
        throw new Error('Service calendrier non configuré');
      }

      const hasConflict = await service.checkConflicts(
        new Date(input.date),
        input.startTime,
        input.endTime
      );

      return {
        hasConflict,
        available: !hasConflict,
        message: hasConflict ? 'Créneau occupé' : 'Créneau disponible',
      };
    }),

  /**
   * PUBLIC: Réserver un créneau
   */
  bookSlot: publicProcedure
    .input(
      z.object({
        slotId: z.string(),
        patientInfo: z.object({
          name: z.string().min(2),
          email: z.string().email(),
          phone: z.string().optional(),
          reason: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const service = getAppointmentCalendarService();
      if (!service) {
        throw new Error('Service calendrier non configuré');
      }

      const success = await service.bookSlot(
        input.slotId,
        input.patientInfo
      );

      if (!success) {
        return {
          success: false,
          message: 'Impossible de réserver ce créneau. Il est peut-être déjà pris.',
        };
      }

      return {
        success: true,
        appointmentId: input.slotId,
        message: 'Rendez-vous confirmé ! Un email de confirmation vous a été envoyé.',
      };
    }),

  /**
   * PUBLIC: Annuler un rendez-vous
   */
  cancelAppointment: publicProcedure
    .input(
      z.object({
        appointmentId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const service = getAppointmentCalendarService();
      if (!service) {
        throw new Error('Service calendrier non configuré');
      }

      const success = await service.cancelAppointment(input.appointmentId);

      return {
        success,
        message: success 
          ? 'Rendez-vous annulé. Le créneau est de nouveau disponible.' 
          : 'Erreur lors de l\'annulation',
      };
    }),

  /**
   * ADMIN: Supprimer un créneau de disponibilité
   */
  deleteAvailabilitySlot: adminProcedure
    .input(
      z.object({
        slotId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const service = getAppointmentCalendarService();
      if (!service) {
        throw new Error('Service calendrier non configuré');
      }

      const success = await service.deleteAvailabilitySlot(input.slotId);

      return {
        success,
        message: success ? 'Créneau supprimé' : 'Erreur lors de la suppression',
      };
    }),

  /**
   * ADMIN: Créer des créneaux en masse (batch)
   */
  createBatchSlots: adminProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        workingHours: z.object({
          start: z.string().regex(/^\d{2}:\d{2}$/),
          end: z.string().regex(/^\d{2}:\d{2}$/),
        }),
        slotDuration: z.number().min(15).max(120),
        daysOfWeek: z.array(z.number().min(0).max(6)),
      })
    )
    .mutation(async ({ input }) => {
      const service = getAppointmentCalendarService();
      if (!service) {
        throw new Error('Service calendrier non configuré');
      }

      const created: string[] = [];
      const errors: string[] = [];

      let currentDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      while (currentDate <= endDate) {
        // Vérifier si ce jour est dans les jours de travail
        const dayOfWeek = currentDate.getDay();
        if (input.daysOfWeek.includes(dayOfWeek)) {
          // Générer les créneaux pour ce jour
          const [startHour, startMin] = input.workingHours.start.split(':').map(Number);
          const [endHour, endMin] = input.workingHours.end.split(':').map(Number);

          let slotStart = new Date(currentDate);
          slotStart.setHours(startHour, startMin, 0, 0);

          const dayEnd = new Date(currentDate);
          dayEnd.setHours(endHour, endMin, 0, 0);

          while (slotStart < dayEnd) {
            const slotEnd = new Date(slotStart.getTime() + input.slotDuration * 60000);

            if (slotEnd <= dayEnd) {
              const slotId = await service.createAvailabilitySlot(
                new Date(slotStart),
                slotStart.toTimeString().slice(0, 5),
                slotEnd.toTimeString().slice(0, 5),
                false
              );

              if (slotId) {
                created.push(slotId);
              } else {
                errors.push(`Erreur pour ${slotStart.toISOString()}`);
              }
            }

            slotStart = slotEnd;
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        success: true,
        created: created.length,
        errors: errors.length,
        details: { created, errors },
        message: `${created.length} créneaux créés, ${errors.length} erreurs`,
      };
    }),
});
