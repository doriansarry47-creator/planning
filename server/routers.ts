import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { timeOffRouter } from "./timeOffRouter";
import { availabilitySlotsRouter } from "./availabilitySlotsRouter";
import { servicesRouter } from "./servicesRouter";
import { scheduleRouter } from "./scheduleRouter";
import { googleCalendarRouter } from "./googleCalendarRouter";
import { appointmentBookingRouter } from "./appointmentBookingRouter";
import { patientBookingRouter } from "./patientBookingRouter";
import { bookingRouter } from "./bookingRouter";
import { patientAppointmentsRouter } from "./patientAppointmentsRouter";
import { calendarSyncRouter } from "./calendarSyncRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createPractitionerSchema } from "../shared/zodSchemas";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  services: servicesRouter,
  schedule: scheduleRouter,
  googleCalendar: googleCalendarRouter,
  appointmentBooking: appointmentBookingRouter,
  patientBooking: patientBookingRouter,
  booking: bookingRouter, // Nouveau router pour la réservation simplifiée
  patientAppointments: patientAppointmentsRouter, // Nouveau router pour consulter/annuler les rendez-vous
  calendarSync: calendarSyncRouter, // Router pour la synchronisation bidirectionnelle avec Google Calendar
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  practitioners: router({
    list: publicProcedure.query(async () => {
      const { getPractitioners } = await import("./db");
      return getPractitioners();
    }),
    getById: publicProcedure.input((val: unknown) => {
      if (typeof val === "number") return val;
      throw new Error("Invalid input");
    }).query(async ({ input }) => {
      const { getPractitionerById } = await import("./db");
      return getPractitionerById(input);
    }),
    create: publicProcedure.input(createPractitionerSchema).mutation(async ({ input }) => {
      const { createPractitioner, getUserByEmail, upsertUser } = await import("./db");
      
      // 1. Trouver l'utilisateur par email
      let user = await getUserByEmail(input.email);

      // 2. Si l'utilisateur n'existe pas, le créer avec le rôle 'practitioner'
      if (!user) {
        await upsertUser({
          openId: `practitioner-${input.email}`, // OpenId factice pour les praticiens non Manus
          email: input.email,
          name: `${input.firstName} ${input.lastName}`,
          role: 'practitioner',
        });
        user = await getUserByEmail(input.email);
      }

      if (!user) {
        throw new Error("Impossible de créer ou trouver l'utilisateur pour le praticien.");
      }

      // 3. Créer le praticien
      const { email, ...practitionerData } = input;
      return createPractitioner({
        ...practitionerData,
        userId: user.id,
      });
    }),
  }),

  availabilitySlots: availabilitySlotsRouter,
  timeOff: timeOffRouter,

  appointments: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const { getUserAppointments } = await import("./db");
      return getUserAppointments(ctx.user.id);
    }),

    /**
     * Réinitialiser tous les rendez-vous pris via l'application (webapp)
     * Supprime uniquement les rendez-vous créés via le système de réservation en ligne
     * et pas ceux ajoutés manuellement
     */
    resetWebAppointments: publicProcedure.mutation(async () => {
      const { getDb } = await import("./db");
      const { appointments } = await import("../drizzle/schema");
      const { eq, isNotNull } = await import("drizzle-orm");
      
      const db = await getDb();
      
      try {
        // Supprimer uniquement les rendez-vous avec un googleEventId qui commence par "local_"
        // ou qui ont été créés via le système de réservation web
        // Cela préserve les rendez-vous ajoutés manuellement via l'admin
        const result = await db
          .delete(appointments)
          .where(isNotNull(appointments.googleEventId))
          .returning({ id: appointments.id, googleEventId: appointments.googleEventId });
        
        console.log(`[ResetWebAppointments] ✅ ${result.length} rendez-vous web supprimés`);
        
        return {
          success: true,
          deletedCount: result.length,
          message: `${result.length} rendez-vous web ont été supprimés de la base de données`,
        };
      } catch (error: any) {
        console.error('[ResetWebAppointments] ❌ Erreur:', error.message);
        throw new Error(`Impossible de réinitialiser les rendez-vous: ${error.message}`);
      }
    }),
    
    create: publicProcedure.input((val: unknown) => {
      const data = val as any;
      return {
        practitionerId: data.practitionerId as number,
        serviceId: data.serviceId as number | undefined,
        appointmentDate: new Date(data.appointmentDate),
        startTime: data.startTime as string,
        reason: data.reason as string,
        notes: data.notes as string | undefined,
        location: data.location as string | undefined,
      };
    }).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const { 
        createAppointmentWithHash, 
        getPractitionerById, 
        getServiceById, 
        getUserById
      } = await import("./db");
      
      const practitioner = await getPractitionerById(input.practitionerId);
      if (!practitioner) throw new Error("Practitioner not found");

      // Déterminer la durée du rendez-vous
      let duration = practitioner.consultationDuration;
      if (input.serviceId) {
        const service = await getServiceById(input.serviceId);
        if (service) {
          duration = service.duration;
        }
      }

      const startDate = new Date(`${input.appointmentDate.toISOString().split('T')[0]}T${input.startTime}`);
      const endDate = new Date(startDate.getTime() + duration * 60000);
      const endTime = endDate.toTimeString().slice(0, 8);

      // Créer le rendez-vous d'abord
      const { insertId, hash } = await createAppointmentWithHash({
        userId: ctx.user.id,
        practitionerId: input.practitionerId,
        serviceId: input.serviceId,
        appointmentDate: input.appointmentDate,
        startTime: input.startTime,
        endTime,
        reason: input.reason,
        notes: input.notes,
        location: input.location,
        status: "scheduled",
        isUnavailability: false,
      });

      // Synchroniser avec Google Calendar et mettre à jour l'appointment avec le googleEventId
      let googleEventId: string | null = null;
      try {
        const { getGoogleCalendarService } = await import("./services/googleCalendar");
        const calendarService = getGoogleCalendarService();
        
        if (calendarService) {
          const user = await getUserById(ctx.user.id);
          
          if (user) {
            googleEventId = await calendarService.createEvent({
              patientName: user.name || 'Patient',
              patientEmail: user.email || '',
              patientPhone: user.phoneNumber,
              date: input.appointmentDate,
              startTime: input.startTime,
              endTime,
              reason: input.reason,
              practitionerName: `${practitioner.firstName} ${practitioner.lastName}`,
            });

            // Mettre à jour l'appointment avec le googleEventId
            if (googleEventId && insertId) {
              const { updateAppointment } = await import("./db");
              await updateAppointment(insertId, { googleEventId });
              
              console.log('[Appointments] ✅ Rendez-vous ajouté dans Google Calendar:', googleEventId);
            }
          }
        } else {
          console.warn('[Appointments] ⚠️ Service Google Calendar non configuré. Rendez-vous créé sans synchronisation.');
        }
      } catch (error) {
        console.error('[Appointments] ❌ Erreur lors de la synchronisation Google Calendar:', error);
        // Ne pas bloquer la création du rendez-vous si la synchronisation échoue
      }

      // Envoyer l'email de confirmation au patient
      try {
        const user = await getUserById(ctx.user.id);
        
        if (user && user.email) {
          const { sendAppointmentConfirmationEmail, sendAppointmentNotificationToPractitioner } = await import("./services/emailService");
          
          const emailData = {
            patientName: user.name || 'Patient',
            patientEmail: user.email,
            practitionerName: `${practitioner.firstName} ${practitioner.lastName}`,
            date: input.appointmentDate,
            startTime: input.startTime,
            endTime,
            reason: input.reason,
            location: input.location || '20 rue des Jacobins, 24000 Périgueux',
            appointmentHash: hash,
          };

          // Envoyer l'email de confirmation au patient
          const patientEmailResult = await sendAppointmentConfirmationEmail(emailData);
          
          if (patientEmailResult.success) {
            console.log('[Appointments] Email de confirmation envoyé au patient:', patientEmailResult.messageId);
          } else {
            console.error('[Appointments] Erreur lors de l\'envoi de l\'email au patient:', patientEmailResult.error);
          }

          // Envoyer une notification au praticien (si email disponible)
          const practitionerUser = await getUserById(practitioner.userId);
          if (practitionerUser && practitionerUser.email) {
            const practitionerEmailResult = await sendAppointmentNotificationToPractitioner(
              emailData,
              practitionerUser.email
            );
            
            if (practitionerEmailResult.success) {
              console.log('[Appointments] Email de notification envoyé au praticien:', practitionerEmailResult.messageId);
            } else {
              console.error('[Appointments] Erreur lors de l\'envoi de l\'email au praticien:', practitionerEmailResult.error);
            }
          }
        }
      } catch (error) {
        console.error('[Appointments] Erreur lors de l\'envoi des emails:', error);
        // Ne pas bloquer la création du rendez-vous si l'envoi d'email échoue
      }

      return { insertId, hash };
    }),
    
    getAll: protectedProcedure.query(async () => {
      const { getAllAppointments } = await import("./db");
      return getAllAppointments();
    }),
    
    getByHash: publicProcedure.input((val: unknown) => {
      if (typeof val === "string") return val;
      throw new Error("Invalid input");
    }).query(async ({ input }) => {
      const { getAppointmentByHash } = await import("./db");
      return getAppointmentByHash(input);
    }),
    
    cancel: publicProcedure.input((val: unknown) => {
      if (typeof val === "number") return val;
      throw new Error("Invalid input");
    }).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const { updateAppointment } = await import("./db");
      return updateAppointment(input, { status: "cancelled" });
    }),
    
    cancelByHash: publicProcedure.input((val: unknown) => {
      if (typeof val === "string") return val;
      throw new Error("Invalid input");
    }).mutation(async ({ input }) => {
      const { getAppointmentByHash, updateAppointment } = await import("./db");
      const appointment = await getAppointmentByHash(input);
      
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      
      await updateAppointment(appointment.id, { status: "cancelled" });
      return { success: true };
    }),
    
    update: protectedProcedure.input((val: unknown) => {
      const data = val as any;
      return {
        id: data.id as number,
        status: data.status as string | undefined,
        notes: data.notes as string | undefined,
        diagnosis: data.diagnosis as string | undefined,
        treatment: data.treatment as string | undefined,
      };
    }).mutation(async ({ input }) => {
      const { updateAppointment } = await import("./db");
      const { id, ...updateData } = input;
      await updateAppointment(id, updateData);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
