import { router, publicProcedure, adminProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

const createWorkingPlanSchema = z.object({
  practitionerId: z.number(),
  dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  startTime: z.string(), // Format "HH:MM:SS"
  endTime: z.string(),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
});

const createBlockedPeriodSchema = z.object({
  practitionerId: z.number(),
  startDatetime: z.date(),
  endDatetime: z.date(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const scheduleRouter = router({
  // Working Plans (Plans de travail hebdomadaires)
  workingPlans: router({
    list: publicProcedure.input(z.number()).query(async ({ input }) => {
      const { getPractitionerWorkingPlan } = await import("./db");
      return getPractitionerWorkingPlan(input);
    }),
    
    create: adminProcedure.input(createWorkingPlanSchema).mutation(async ({ input }) => {
      const { createWorkingPlan } = await import("./db");
      return createWorkingPlan(input);
    }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: createWorkingPlanSchema.partial(),
      }))
      .mutation(async ({ input }) => {
        const { updateWorkingPlan } = await import("./db");
        return updateWorkingPlan(input.id, input.data);
      }),
  }),
  
  // Blocked Periods (Périodes bloquées)
  blockedPeriods: router({
    list: publicProcedure.input(z.number()).query(async ({ input }) => {
      const { getPractitionerBlockedPeriods } = await import("./db");
      return getPractitionerBlockedPeriods(input);
    }),
    
    create: adminProcedure.input(createBlockedPeriodSchema).mutation(async ({ input }) => {
      const { createBlockedPeriod } = await import("./db");
      return createBlockedPeriod(input);
    }),
    
    delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      const { deleteBlockedPeriod } = await import("./db");
      return deleteBlockedPeriod(input);
    }),
  }),
  
  // Calculer les disponibilités d'un praticien (tenant compte du working plan et blocked periods)
  availabilities: publicProcedure
    .input(z.object({
      practitionerId: z.number(),
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      const { 
        getPractitionerWorkingPlan, 
        getPractitionerBlockedPeriods,
        getAllAppointments 
      } = await import("./db");
      
      const workingPlan = await getPractitionerWorkingPlan(input.practitionerId);
      const blockedPeriods = await getPractitionerBlockedPeriods(input.practitionerId);
      const appointments = await getAllAppointments();
      
      // TODO: Implémenter la logique de calcul des disponibilités
      // en tenant compte des working plans, blocked periods et rendez-vous existants
      
      return {
        workingPlan,
        blockedPeriods,
        appointments: appointments.filter(
          (apt: any) => apt.appointments.practitionerId === input.practitionerId
        ),
      };
    }),
});
