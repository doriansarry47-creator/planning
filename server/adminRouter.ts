import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

/**
 * Router pour les fonctionnalités d'administration
 */
export const adminRouter = router({
  // ============= AUTHENTIFICATION =============
  
  /**
   * Connexion avec email et mot de passe
   */
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const { authenticateUser, createAdminLog } = await import("./db");
      
      const user = await authenticateUser(input.email, input.password);
      
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou mot de passe incorrect",
        });
      }

      // Créer un log de connexion
      if (user.role === "admin") {
        await createAdminLog({
          userId: user.id,
          action: "admin_login",
          entityType: "auth",
          entityId: user.id,
          details: JSON.stringify({ email: user.email }),
          ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress || "unknown",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
        });
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    }),

  /**
   * Changer le mot de passe
   */
  changePassword: adminProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Non authentifié",
        });
      }

      const { authenticateUser, changeUserPassword, createAdminLog } = await import("./db");
      
      // Vérifier le mot de passe actuel
      const user = await authenticateUser(ctx.user.email!, input.currentPassword);
      
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Mot de passe actuel incorrect",
        });
      }

      // Changer le mot de passe
      await changeUserPassword(ctx.user.id, input.newPassword);

      // Log l'action
      await createAdminLog({
        userId: ctx.user.id,
        action: "password_changed",
        entityType: "user",
        entityId: ctx.user.id,
        ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress || "unknown",
        userAgent: ctx.req.headers["user-agent"] || "unknown",
      });

      return { success: true };
    }),

  // ============= GESTION DES UTILISATEURS =============
  
  /**
   * Récupérer tous les utilisateurs
   */
  getUsers: adminProcedure.query(async () => {
    const { getAllUsers } = await import("./db");
    return getAllUsers();
  }),

  /**
   * Suspendre/activer un utilisateur
   */
  toggleUserStatus: adminProcedure
    .input(z.object({
      userId: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { toggleUserStatus, createAdminLog } = await import("./db");
      
      await toggleUserStatus(input.userId, input.isActive);

      // Log l'action
      if (ctx.user) {
        await createAdminLog({
          userId: ctx.user.id,
          action: input.isActive ? "user_activated" : "user_suspended",
          entityType: "user",
          entityId: input.userId,
          ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress || "unknown",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
        });
      }

      return { success: true };
    }),

  /**
   * Supprimer un utilisateur
   */
  deleteUser: adminProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { deleteUser, createAdminLog } = await import("./db");
      
      // Log l'action avant la suppression
      if (ctx.user) {
        await createAdminLog({
          userId: ctx.user.id,
          action: "user_deleted",
          entityType: "user",
          entityId: input.userId,
          ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress || "unknown",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
        });
      }

      await deleteUser(input.userId);

      return { success: true };
    }),

  // ============= GESTION DES RENDEZ-VOUS =============
  
  /**
   * Récupérer tous les rendez-vous
   */
  getAllAppointments: adminProcedure.query(async () => {
    const { getAllAppointments } = await import("./db");
    return getAllAppointments();
  }),

  /**
   * Mettre à jour le statut d'un rendez-vous
   */
  updateAppointmentStatus: adminProcedure
    .input(z.object({
      appointmentId: z.number(),
      status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const { getDb, createAdminLog } = await import("./db");
      const { appointments } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.update(appointments)
        .set({ status: input.status })
        .where(eq(appointments.id, input.appointmentId));

      // Log l'action
      if (ctx.user) {
        await createAdminLog({
          userId: ctx.user.id,
          action: "appointment_status_updated",
          entityType: "appointment",
          entityId: input.appointmentId,
          details: JSON.stringify({ newStatus: input.status }),
          ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress || "unknown",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
        });
      }

      return { success: true };
    }),

  // ============= GESTION DES SPÉCIALITÉS =============
  
  /**
   * Récupérer toutes les spécialités
   */
  getSpecialties: adminProcedure.query(async () => {
    const { getSpecialties } = await import("./db");
    return getSpecialties();
  }),

  /**
   * Créer une spécialité
   */
  createSpecialty: adminProcedure
    .input(z.object({
      name: z.string().min(2),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { createSpecialty, createAdminLog } = await import("./db");
      
      const result = await createSpecialty({
        name: input.name,
        description: input.description,
        isActive: true,
      });

      // Log l'action
      if (ctx.user) {
        await createAdminLog({
          userId: ctx.user.id,
          action: "specialty_created",
          entityType: "specialty",
          details: JSON.stringify(input),
          ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress || "unknown",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
        });
      }

      return { success: true, result };
    }),

  /**
   * Mettre à jour une spécialité
   */
  updateSpecialty: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { updateSpecialty, createAdminLog } = await import("./db");
      
      const { id, ...data } = input;
      await updateSpecialty(id, data);

      // Log l'action
      if (ctx.user) {
        await createAdminLog({
          userId: ctx.user.id,
          action: "specialty_updated",
          entityType: "specialty",
          entityId: id,
          details: JSON.stringify(data),
          ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress || "unknown",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
        });
      }

      return { success: true };
    }),

  /**
   * Supprimer une spécialité
   */
  deleteSpecialty: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { deleteSpecialty, createAdminLog } = await import("./db");
      
      // Log l'action avant la suppression
      if (ctx.user) {
        await createAdminLog({
          userId: ctx.user.id,
          action: "specialty_deleted",
          entityType: "specialty",
          entityId: input.id,
          ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress || "unknown",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
        });
      }

      await deleteSpecialty(input.id);

      return { success: true };
    }),

  // ============= LOGS D'ACTIVITÉ =============
  
  /**
   * Récupérer les logs d'activité
   */
  getLogs: adminProcedure
    .input(z.object({
      limit: z.number().optional().default(100),
    }))
    .query(async ({ input }) => {
      const { getAdminLogs } = await import("./db");
      return getAdminLogs(input.limit);
    }),

  // ============= STATISTIQUES =============
  
  /**
   * Récupérer les statistiques du dashboard
   */
  getStats: adminProcedure.query(async () => {
    const { getDb } = await import("./db");
    const { users, appointments, availabilitySlots, practitioners } = await import("../drizzle/schema");
    const { eq, gte, sql } = await import("drizzle-orm");
    
    const db = await getDb();
    if (!db) {
      return {
        totalUsers: 0,
        totalPractitioners: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        weekAppointments: 0,
        availableSlots: 0,
      };
    }

    // Calculer les dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // Compter les utilisateurs
    const totalUsers = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "user"));

    // Compter les praticiens actifs
    const totalPractitioners = await db.select({ count: sql<number>`count(*)` })
      .from(practitioners)
      .where(eq(practitioners.isActive, true));

    // Compter tous les rendez-vous
    const totalAppointments = await db.select({ count: sql<number>`count(*)` })
      .from(appointments);

    // Rendez-vous du jour
    const todayAppointments = await db.select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(gte(appointments.startTime, today));

    // Rendez-vous de la semaine
    const weekAppointments = await db.select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(gte(appointments.startTime, weekStart));

    // Créneaux disponibles
    const availableSlots = await db.select({ count: sql<number>`count(*)` })
      .from(availabilitySlots)
      .where(eq(availabilitySlots.isActive, true));

    return {
      totalUsers: Number(totalUsers[0]?.count || 0),
      totalPractitioners: Number(totalPractitioners[0]?.count || 0),
      totalAppointments: Number(totalAppointments[0]?.count || 0),
      todayAppointments: Number(todayAppointments[0]?.count || 0),
      weekAppointments: Number(weekAppointments[0]?.count || 0),
      availableSlots: Number(availableSlots[0]?.count || 0),
    };
  }),
});
