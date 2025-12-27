/**
 * ============================================================================
 * ROUTER TRPC - DISPONIBILITÉS (OAUTH 2.0)
 * ============================================================================
 * 
 * Router tRPC pour gérer les disponibilités basé sur Google OAuth 2.0.
 * 
 * Endpoints :
 * - getAvailableSlots : Récupérer les créneaux disponibles
 * - checkSlot : Vérifier si un créneau spécifique est disponible
 * 
 * @author Claude - Senior Full-Stack Engineer
 * @date 2025-12-27
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getGoogleCalendarOAuth2Service } from '../services/googleCalendarOAuth2';
import {
  calculateAvailableSlots,
  convertGoogleEventToSimpleEvent,
  groupSlotsByDate,
  getAvailableDates,
  DEFAULT_WORKING_HOURS,
} from '../services/availabilityCalculator';

/**
 * Router pour les disponibilités
 */
export const availabilityOAuth2Router = router({
  /**
   * Récupérer les créneaux disponibles pour une période
   * 
   * Input :
   * - startDate : Date de début (YYYY-MM-DD)
   * - endDate : Date de fin (YYYY-MM-DD)
   * 
   * Output :
   * - slots : Liste des créneaux disponibles
   * - slotsByDate : Créneaux groupés par date
   * - availableDates : Liste des dates avec au moins un créneau
   * - workingHoursInfo : Informations sur les règles de travail
   */
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (attendu: YYYY-MM-DD)'),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (attendu: YYYY-MM-DD)'),
      })
    )
    .query(async ({ input }) => {
      try {
        console.info(`[availabilityOAuth2Router] 📅 Requête de disponibilités du ${input.startDate} au ${input.endDate}`);

        // Récupérer le service Google Calendar OAuth 2.0
        const calendarService = getGoogleCalendarOAuth2Service();

        if (!calendarService) {
          throw new Error('Google Calendar service not configured. Please check OAuth credentials.');
        }

        // Étape 1 : Récupérer les événements existants depuis Google Calendar
        const existingEvents = await calendarService.getExistingEvents(
          input.startDate,
          input.endDate
        );

        console.info(`[availabilityOAuth2Router] ✅ ${existingEvents.length} événements existants récupérés`);

        // Étape 2 : Convertir les événements Google en SimpleEvent
        const simpleEvents = existingEvents.map(convertGoogleEventToSimpleEvent);

        // Étape 3 : Calculer les créneaux disponibles
        const availableSlots = calculateAvailableSlots(
          input.startDate,
          input.endDate,
          simpleEvents,
          DEFAULT_WORKING_HOURS
        );

        // Étape 4 : Grouper par date
        const slotsByDate = groupSlotsByDate(availableSlots);
        const availableDates = getAvailableDates(availableSlots);

        console.info(`[availabilityOAuth2Router] ✅ ${availableSlots.length} créneaux disponibles sur ${availableDates.length} jours`);

        return {
          success: true,
          slots: availableSlots,
          slotsByDate,
          availableDates,
          workingHoursInfo: {
            timezone: DEFAULT_WORKING_HOURS.timezone,
            workingDays: DEFAULT_WORKING_HOURS.workingDays,
            startTime: `${DEFAULT_WORKING_HOURS.startHour.toString().padStart(2, '0')}:${DEFAULT_WORKING_HOURS.startMinute.toString().padStart(2, '0')}`,
            endTime: `${DEFAULT_WORKING_HOURS.endHour.toString().padStart(2, '0')}:${DEFAULT_WORKING_HOURS.endMinute.toString().padStart(2, '0')}`,
            slotDuration: DEFAULT_WORKING_HOURS.slotDuration,
          },
        };
      } catch (error: any) {
        console.error('[availabilityOAuth2Router] ❌ Erreur:', error.message);
        throw new Error(`Failed to fetch availabilities: ${error.message}`);
      }
    }),

  /**
   * Vérifier si un créneau spécifique est disponible
   * 
   * Input :
   * - date : Date (YYYY-MM-DD)
   * - startTime : Heure de début (HH:mm)
   * - endTime : Heure de fin (HH:mm)
   * 
   * Output :
   * - available : true si le créneau est disponible
   * - reason : Raison si non disponible
   */
  checkSlot: publicProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (attendu: HH:mm)'),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide (attendu: HH:mm)'),
      })
    )
    .query(async ({ input }) => {
      try {
        console.info(`[availabilityOAuth2Router] 🔍 Vérification du créneau ${input.date} ${input.startTime}-${input.endTime}`);

        // Récupérer le service Google Calendar
        const calendarService = getGoogleCalendarOAuth2Service();

        if (!calendarService) {
          throw new Error('Google Calendar service not configured');
        }

        // Récupérer les événements pour ce jour uniquement
        const nextDay = new Date(input.date);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];

        const existingEvents = await calendarService.getExistingEvents(
          input.date,
          nextDayStr
        );

        // Calculer les disponibilités pour cette journée
        const simpleEvents = existingEvents.map(convertGoogleEventToSimpleEvent);
        const availableSlots = calculateAvailableSlots(
          input.date,
          input.date,
          simpleEvents,
          DEFAULT_WORKING_HOURS
        );

        // Vérifier si le créneau demandé est dans la liste des disponibles
        const isAvailable = availableSlots.some(
          slot => 
            slot.date === input.date &&
            slot.startTime === input.startTime &&
            slot.endTime === input.endTime
        );

        console.info(`[availabilityOAuth2Router] ${isAvailable ? '✅' : '❌'} Créneau ${isAvailable ? 'disponible' : 'occupé'}`);

        return {
          available: isAvailable,
          reason: isAvailable ? null : 'Créneau déjà réservé ou non disponible',
        };
      } catch (error: any) {
        console.error('[availabilityOAuth2Router] ❌ Erreur:', error.message);
        throw new Error(`Failed to check slot: ${error.message}`);
      }
    }),

  /**
   * Obtenir les informations sur les règles de travail
   * 
   * Output :
   * - Informations sur les horaires de travail configurés
   */
  getWorkingHours: publicProcedure.query(async () => {
    return {
      timezone: DEFAULT_WORKING_HOURS.timezone,
      workingDays: DEFAULT_WORKING_HOURS.workingDays,
      workingDaysNames: DEFAULT_WORKING_HOURS.workingDays.map(day => {
        const names = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        return names[day - 1];
      }),
      startTime: `${DEFAULT_WORKING_HOURS.startHour.toString().padStart(2, '0')}:${DEFAULT_WORKING_HOURS.startMinute.toString().padStart(2, '0')}`,
      endTime: `${DEFAULT_WORKING_HOURS.endHour.toString().padStart(2, '0')}:${DEFAULT_WORKING_HOURS.endMinute.toString().padStart(2, '0')}`,
      slotDuration: DEFAULT_WORKING_HOURS.slotDuration,
      minAdvanceBookingMinutes: DEFAULT_WORKING_HOURS.minAdvanceBookingMinutes,
      maxAdvanceBookingDays: DEFAULT_WORKING_HOURS.maxAdvanceBookingDays,
    };
  }),
});
