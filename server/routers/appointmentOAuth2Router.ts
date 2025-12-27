/**
 * ============================================================================
 * ROUTER TRPC - RÉSERVATION DE RENDEZ-VOUS (OAUTH 2.0)
 * ============================================================================
 * 
 * Router tRPC pour gérer les rendez-vous avec Google Calendar OAuth 2.0.
 * 
 * Endpoints :
 * - bookAppointment : Créer un rendez-vous
 * - cancelAppointment : Annuler un rendez-vous
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
  isSlotAvailable,
  DEFAULT_WORKING_HOURS,
} from '../services/availabilityCalculator';
import { db } from '../db';
import { appointments } from '../../drizzle/schema';

/**
 * Router pour les rendez-vous
 */
export const appointmentOAuth2Router = router({
  /**
   * Créer un rendez-vous
   * 
   * Input :
   * - date : Date du rendez-vous (YYYY-MM-DD)
   * - startTime : Heure de début (HH:mm)
   * - endTime : Heure de fin (HH:mm)
   * - clientName : Nom du client
   * - clientEmail : Email du client
   * - clientPhone : Téléphone du client (optionnel)
   * - notes : Notes additionnelles (optionnel)
   * 
   * Output :
   * - appointmentId : ID du rendez-vous dans la base de données
   * - googleEventId : ID de l'événement dans Google Calendar
   */
  bookAppointment: publicProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide'),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide'),
        clientName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
        clientEmail: z.string().email('Email invalide'),
        clientPhone: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.info(`[appointmentOAuth2Router] 📝 Tentative de réservation pour ${input.clientName}`);
        console.info(`  Date: ${input.date} ${input.startTime}-${input.endTime}`);

        // Récupérer le service Google Calendar
        const calendarService = getGoogleCalendarOAuth2Service();

        if (!calendarService) {
          throw new Error('Google Calendar service not configured');
        }

        // ÉTAPE 1 : Vérifier que le créneau est toujours disponible
        const nextDay = new Date(input.date);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];

        const existingEvents = await calendarService.getExistingEvents(
          input.date,
          nextDayStr
        );

        const simpleEvents = existingEvents.map(convertGoogleEventToSimpleEvent);
        const availableSlots = calculateAvailableSlots(
          input.date,
          input.date,
          simpleEvents,
          DEFAULT_WORKING_HOURS
        );

        const slotIsAvailable = isSlotAvailable(
          input.date,
          input.startTime,
          input.endTime,
          availableSlots
        );

        if (!slotIsAvailable) {
          console.error('[appointmentOAuth2Router] ❌ Créneau non disponible');
          throw new Error('Le créneau sélectionné n\'est plus disponible. Veuillez en choisir un autre.');
        }

        console.info('[appointmentOAuth2Router] ✅ Créneau disponible, création en cours...');

        // ÉTAPE 2 : Créer l'événement dans Google Calendar
        const googleEventId = await calendarService.createAppointment({
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          notes: input.notes,
        });

        console.info(`[appointmentOAuth2Router] ✅ Événement Google Calendar créé: ${googleEventId}`);

        // ÉTAPE 3 : Enregistrer le rendez-vous dans la base de données
        const [appointment] = await db
          .insert(appointments)
          .values({
            patientName: input.clientName,
            patientEmail: input.clientEmail,
            patientPhone: input.clientPhone || null,
            date: new Date(input.date),
            startTime: input.startTime,
            endTime: input.endTime,
            reason: input.notes || null,
            status: 'confirmed',
            googleEventId: googleEventId,
            createdAt: new Date(),
          })
          .returning();

        console.info(`[appointmentOAuth2Router] ✅ Rendez-vous enregistré en base: ${appointment.id}`);

        return {
          success: true,
          appointmentId: appointment.id,
          googleEventId: googleEventId,
          message: 'Rendez-vous confirmé avec succès !',
        };
      } catch (error: any) {
        console.error('[appointmentOAuth2Router] ❌ Erreur lors de la réservation:', error.message);
        throw new Error(`Échec de la réservation: ${error.message}`);
      }
    }),

  /**
   * Annuler un rendez-vous
   * 
   * Input :
   * - appointmentId : ID du rendez-vous dans la base de données
   * 
   * Output :
   * - success : true si l'annulation a réussi
   */
  cancelAppointment: publicProcedure
    .input(
      z.object({
        appointmentId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.info(`[appointmentOAuth2Router] 🗑️ Annulation du rendez-vous ${input.appointmentId}`);

        // Récupérer le service Google Calendar
        const calendarService = getGoogleCalendarOAuth2Service();

        if (!calendarService) {
          throw new Error('Google Calendar service not configured');
        }

        // ÉTAPE 1 : Récupérer le rendez-vous depuis la base de données
        const [appointment] = await db
          .select()
          .from(appointments)
          .where((t: any) => t.id === input.appointmentId)
          .limit(1);

        if (!appointment) {
          throw new Error('Rendez-vous introuvable');
        }

        if (appointment.status === 'cancelled') {
          throw new Error('Ce rendez-vous est déjà annulé');
        }

        // ÉTAPE 2 : Supprimer l'événement de Google Calendar
        if (appointment.googleEventId) {
          const deleted = await calendarService.deleteAppointment(appointment.googleEventId);
          
          if (deleted) {
            console.info('[appointmentOAuth2Router] ✅ Événement supprimé de Google Calendar');
          } else {
            console.warn('[appointmentOAuth2Router] ⚠️ Impossible de supprimer l\'événement Google (peut-être déjà supprimé)');
          }
        }

        // ÉTAPE 3 : Mettre à jour le statut dans la base de données
        await db
          .update(appointments)
          .set({
            status: 'cancelled',
            updatedAt: new Date(),
          })
          .where((t: any) => t.id === input.appointmentId);

        console.info('[appointmentOAuth2Router] ✅ Rendez-vous annulé avec succès');

        return {
          success: true,
          message: 'Rendez-vous annulé avec succès',
        };
      } catch (error: any) {
        console.error('[appointmentOAuth2Router] ❌ Erreur lors de l\'annulation:', error.message);
        throw new Error(`Échec de l'annulation: ${error.message}`);
      }
    }),

  /**
   * Récupérer les rendez-vous d'un client
   * 
   * Input :
   * - email : Email du client
   * 
   * Output :
   * - Liste des rendez-vous
   */
  getClientAppointments: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input }) => {
      try {
        console.info(`[appointmentOAuth2Router] 📋 Récupération des rendez-vous pour ${input.email}`);

        const clientAppointments = await db
          .select()
          .from(appointments)
          .where((t: any) => t.patientEmail === input.email)
          .orderBy((t: any) => t.date);

        console.info(`[appointmentOAuth2Router] ✅ ${clientAppointments.length} rendez-vous trouvés`);

        return {
          success: true,
          appointments: clientAppointments,
        };
      } catch (error: any) {
        console.error('[appointmentOAuth2Router] ❌ Erreur:', error.message);
        throw new Error(`Échec de la récupération des rendez-vous: ${error.message}`);
      }
    }),

  /**
   * Récupérer un rendez-vous par ID
   */
  getAppointmentById: publicProcedure
    .input(
      z.object({
        appointmentId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const [appointment] = await db
          .select()
          .from(appointments)
          .where((t: any) => t.id === input.appointmentId)
          .limit(1);

        if (!appointment) {
          throw new Error('Rendez-vous introuvable');
        }

        return {
          success: true,
          appointment,
        };
      } catch (error: any) {
        console.error('[appointmentOAuth2Router] ❌ Erreur:', error.message);
        throw new Error(`Échec de la récupération: ${error.message}`);
      }
    }),
});
