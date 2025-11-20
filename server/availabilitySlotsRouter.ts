import { protectedProcedure, router, practitionerProcedure } from "./_core/trpc";
import { createAvailabilitySlotSchema, updateAvailabilitySlotSchema, slotIdSchema, practitionerIdSchema, getAvailableSlotsSchema } from "@shared/zodSchemas";
import { createAvailabilitySlot, updateAvailabilitySlot, deleteAvailabilitySlot, getPractitionerSlots, getAvailableSlots } from "./db";

export const availabilitySlotsRouter = router({
  // Créer un nouveau créneau de disponibilité (Admin/Practitioner)
  create: practitionerProcedure
    .input(createAvailabilitySlotSchema)
    .mutation(async ({ input }) => {
      try {
        // TODO: Vérifier si le praticienId correspond à l'utilisateur connecté si ce n'est pas un admin
        
        // Validation supplémentaire des dates
        if (!input.startTime || !input.endTime) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Les heures de début et de fin sont requises" 
          });
        }

        // Convertir les chaînes ISO en objets Date pour Drizzle
        const startDate = new Date(input.startTime);
        const endDate = new Date(input.endTime);

        // Vérifier que les dates sont valides
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Format de date invalide" 
          });
        }

        // Vérifier que startTime < endTime
        if (startDate >= endDate) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "L'heure de fin doit être après l'heure de début" 
          });
        }

        const data = {
          ...input,
          startTime: startDate,
          endTime: endDate,
        };

        return await createAvailabilitySlot(data);
      } catch (error) {
        console.error("Erreur lors de la création du créneau:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Erreur lors de la création du créneau de disponibilité" 
        });
      }
    }),

  // Mettre à jour un créneau de disponibilité (Admin/Practitioner)
  update: practitionerProcedure
    .input(updateAvailabilitySlotSchema)
    .mutation(async ({ input }) => {
      // TODO: Vérifier si le créneau appartient au praticien ou si l'utilisateur est admin
      
      const { id, ...updateData } = input;
      
      // Convertir les chaînes ISO en objets Date si elles existent
      const data = {
        ...updateData,
        ...(updateData.startTime && { startTime: new Date(updateData.startTime) }),
        ...(updateData.endTime && { endTime: new Date(updateData.endTime) }),
      };

      return updateAvailabilitySlot(id, data);
    }),

  // Supprimer un créneau de disponibilité (Admin/Practitioner)
  delete: practitionerProcedure
    .input(slotIdSchema)
    .mutation(async ({ input }) => {
      // TODO: Vérifier si le créneau appartient au praticien ou si l'utilisateur est admin
      
      return deleteAvailabilitySlot(input);
    }),

  // Récupérer tous les créneaux d'un praticien (Admin/Practitioner)
  listByPractitioner: practitionerProcedure
    .input(practitionerIdSchema)
    .query(async ({ input }) => {
      // TODO: Vérifier si le praticienId correspond à l'utilisateur connecté si ce n'est pas un admin
      
      return getPractitionerSlots(input);
    }),

  // Récupérer les créneaux disponibles pour la prise de rendez-vous (Public)
  getAvailable: protectedProcedure // Utiliser protected pour s'assurer que l'utilisateur est connecté, mais peut être public si la prise de RDV est ouverte à tous
    .input(getAvailableSlotsSchema)
    .query(async ({ input }) => {
      // Convertir les chaînes ISO en objets Date pour Drizzle
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      return getAvailableSlots(input.practitionerId, startDate, endDate);
    }),
});
