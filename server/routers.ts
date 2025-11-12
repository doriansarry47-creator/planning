import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { timeOffRouter } from "./timeOffRouter";
import { availabilitySlotsRouter } from "./availabilitySlotsRouter";
import { adminRouter } from "./adminRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { createPractitionerSchema } from "@shared/zodSchemas";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  admin: adminRouter,
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
    create: adminProcedure.input(createPractitionerSchema).mutation(async ({ input }) => {
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
    create: publicProcedure.input((val: unknown) => {
      const data = val as any;
      return {
        practitionerId: data.practitionerId as number,
        appointmentDate: new Date(data.appointmentDate),
        startTime: data.startTime as string,
        reason: data.reason as string,
      };
    }).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const { createAppointment, getPractitionerById } = await import("./db");
      
      const practitioner = await getPractitionerById(input.practitionerId);
      if (!practitioner) throw new Error("Practitioner not found");

      const startDate = new Date(`${input.appointmentDate.toISOString().split('T')[0]}T${input.startTime}`);
      const endDate = new Date(startDate.getTime() + practitioner.consultationDuration * 60000);
      const endTime = endDate.toTimeString().slice(0, 8);

      return createAppointment({
        userId: ctx.user.id,
        practitionerId: input.practitionerId,
        appointmentDate: input.appointmentDate,
        startTime: input.startTime,
        endTime,
        reason: input.reason,
        status: "scheduled",
      });
    }),
    getAll: protectedProcedure.query(async () => {
      const { getAllAppointments } = await import("./db");
      return getAllAppointments();
    }),
    cancel: publicProcedure.input((val: unknown) => {
      if (typeof val === "number") return val;
      throw new Error("Invalid input");
    }).mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const { cancelAppointment } = await import("./db");
      return cancelAppointment(input);
    }),
  }),
});

export type AppRouter = typeof appRouter;
