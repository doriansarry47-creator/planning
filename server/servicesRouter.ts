import { router, publicProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";

const createServiceSchema = z.object({
  name: z.string().min(1, "Le nom du service est requis"),
  description: z.string().optional(),
  duration: z.number().min(5).default(30),
  price: z.string().default("0"),
  currency: z.string().default("EUR"),
  location: z.string().optional(),
  color: z.string().default("#3788d8"),
  availabilitiesType: z.enum(["flexible", "fixed"]).default("flexible"),
  attendantsNumber: z.number().min(1).default(1),
  isPrivate: z.boolean().default(false),
  categoryId: z.number().optional(),
});

const createServiceCategorySchema = z.object({
  name: z.string().min(1, "Le nom de la catégorie est requis"),
  description: z.string().optional(),
});

export const servicesRouter = router({
  // Catégories de services
  categories: router({
    list: publicProcedure.query(async () => {
      const { getServiceCategories } = await import("./db");
      return getServiceCategories();
    }),
    
    create: adminProcedure.input(createServiceCategorySchema).mutation(async ({ input }) => {
      const { createServiceCategory } = await import("./db");
      return createServiceCategory(input);
    }),
  }),
  
  // Services
  list: publicProcedure.query(async () => {
    const { getServices } = await import("./db");
    return getServices();
  }),
  
  getById: publicProcedure.input(z.number()).query(async ({ input }) => {
    const { getServiceById } = await import("./db");
    return getServiceById(input);
  }),
  
  create: adminProcedure.input(createServiceSchema).mutation(async ({ input }) => {
    const { createService } = await import("./db");
    return createService(input);
  }),
  
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      data: createServiceSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      const { updateService } = await import("./db");
      return updateService(input.id, input.data);
    }),
  
  delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
    const { deleteService } = await import("./db");
    return deleteService(input);
  }),
  
  // Services d'un praticien
  practitionerServices: router({
    list: publicProcedure.input(z.number()).query(async ({ input }) => {
      const { getPractitionerServices } = await import("./db");
      return getPractitionerServices(input);
    }),
    
    add: adminProcedure
      .input(z.object({
        practitionerId: z.number(),
        serviceId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { addServiceToPractitioner } = await import("./db");
        return addServiceToPractitioner(input.practitionerId, input.serviceId);
      }),
  }),
});
