import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

// Simple router setup without complex server dependencies
const t = initTRPC.context<any>().create({
  transformer: superjson,
});

export const router = t.router;

// Simple availability slot schema (basic validation)
const createAvailabilitySlotSchema = z.object({
  practitionerId: z.number().int().positive(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  capacity: z.number().int().positive().default(1).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
});

// Create the simplified router
export const TRPCRouter = router({
  // Availability slots - simplified
  availabilitySlots: router({
    create: t.procedure
      .input(createAvailabilitySlotSchema)
      .mutation(async ({ input }) => {
        try {
          console.log("Creating availability slot:", input);
          
          // Mock response for now - in production, this would call your database
          return {
            id: Math.floor(Math.random() * 1000),
            ...input,
            createdAt: new Date().toISOString(),
          };
        } catch (error) {
          console.error("Error creating slot:", error);
          throw new Error("Failed to create availability slot");
        }
      }),
    
    listByPractitioner: t.procedure
      .input(z.object({ practitionerId: z.number().int().positive() }))
      .query(async ({ input }) => {
        console.log("Getting slots for practitioner:", input.practitionerId);
        
        // Mock response - in production, this would query your database
        return [];
      }),
  }),

  // Practitioners - simplified
  practitioners: router({
    list: t.procedure.query(async () => {
      console.log("Getting all practitioners");
      
      // Mock response - in production, this would query your database
      return [];
    }),
  }),

  // System - simplified
  system: router({
    health: t.procedure.query(() => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        message: "Service is running",
      };
    }),
  }),
});

export type AppRouter = typeof TRPCRouter;