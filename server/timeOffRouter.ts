import { practitionerProcedure, router } from "./_core/trpc";
import { createTimeOffSchema, practitionerIdSchema } from "@shared/zodSchemas";
import { createTimeOff, getPractitionerTimeOff } from "./db";

export const timeOffRouter = router({
  // Ajouter une période de congé (Admin/Practitioner)
  create: practitionerProcedure
    .input(createTimeOffSchema)
    .mutation(async ({ input, ctx }) => {
      // TODO: Vérifier si le practitionerId correspond à l'utilisateur connecté si ce n'est pas un admin
      
      // Convertir les chaînes de date en objets Date pour Drizzle
      const data = {
        ...input,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
      };

      return createTimeOff(data);
    }),

  // Récupérer les congés d'un praticien (Admin/Practitioner)
  listByPractitioner: practitionerProcedure
    .input(practitionerIdSchema)
    .query(async ({ input, ctx }) => {
      // TODO: Vérifier si le practitionerId correspond à l'utilisateur connecté si ce n'est pas un admin
      
      return getPractitionerTimeOff(input);
    }),
    
  // TODO: Ajouter les procédures update et delete si nécessaire
});
