import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { appointments } from "../drizzle/schema";

export const patientAppointmentsRouter = router({
  /**
   * Récupérer les rendez-vous d'un patient par son email
   */
  getByEmail: publicProcedure
    .input(z.object({
      email: z.string().email("Email invalide"),
    }))
    .query(async ({ input }) => {
      try {
        console.log(`[PatientAppointments] Recherche des rendez-vous pour: ${input.email}`);
        
        const { getDb } = await import("./db");
        const db = await getDb();
        
        const patientAppointments = await db
          .select()
          .from(appointments)
          .where(eq(appointments.customerEmail, input.email));

        console.log(`[PatientAppointments] ${patientAppointments.length} rendez-vous trouvés`);

        return {
          success: true,
          appointments: patientAppointments.map(apt => ({
            id: apt.id,
            date: apt.startTime.toLocaleDateString('fr-FR'),
            startTime: apt.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            endTime: apt.endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            customerName: apt.customerName,
            customerEmail: apt.customerEmail,
            customerPhone: apt.customerPhone,
            status: apt.status,
            notes: apt.notes,
            cancellationHash: apt.cancellationHash,
            googleEventId: apt.googleEventId,
            createdAt: apt.createdAt,
          })),
          total: patientAppointments.length,
        };
      } catch (error: any) {
        console.error("[PatientAppointments] Erreur:", error);
        return {
          success: false,
          appointments: [],
          total: 0,
          error: error.message,
        };
      }
    }),

  /**
   * Annuler un rendez-vous
   */
  cancelAppointment: publicProcedure
    .input(z.object({
      appointmentId: z.number(),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      try {
        console.log(`[PatientAppointments] Annulation du RDV ${input.appointmentId}`);

        const { getDb } = await import("./db");
        const db = await getDb();

        // Vérifier que le rendez-vous appartient bien au patient
        const appointment = await db
          .select()
          .from(appointments)
          .where(eq(appointments.id, input.appointmentId))
          .limit(1);

        if (!appointment || appointment.length === 0) {
          throw new Error("Rendez-vous non trouvé");
        }

        const apt = appointment[0];

        if (apt.customerEmail !== input.email) {
          throw new Error("Non autorisé - cet email n'correspond pas au rendez-vous");
        }

        // Supprimer de Google Calendar si applicable
        if (apt.googleEventId) {
          try {
            const { getGoogleCalendarService } = await import("./services/googleCalendar");
            const service = getGoogleCalendarService();
            
            if (service && service.calendar) {
              console.log(`[PatientAppointments] Suppression de l'événement Google: ${apt.googleEventId}`);
              const calendarId = process.env.GOOGLE_CALENDAR_ID || 'doriansarry47@gmail.com';
              await service.calendar.events.delete({
                calendarId,
                eventId: apt.googleEventId,
              });
            }
          } catch (gcError: any) {
            console.warn(`[PatientAppointments] Erreur suppression Google Calendar:`, gcError.message);
            // Continuer même si Google Calendar échoue
          }
        }

        // Mettre à jour le statut dans la BD
        await db.update(appointments)
          .set({ 
            status: 'cancelled',
            updatedAt: new Date(),
          })
          .where(eq(appointments.id, input.appointmentId));

        console.log(`[PatientAppointments] ✅ Rendez-vous ${input.appointmentId} annulé`);

        return {
          success: true,
          message: "Rendez-vous annulé avec succès",
        };
      } catch (error: any) {
        console.error("[PatientAppointments] Erreur annulation:", error);
        return {
          success: false,
          error: error.message || "Erreur lors de l'annulation",
        };
      }
    }),
});
