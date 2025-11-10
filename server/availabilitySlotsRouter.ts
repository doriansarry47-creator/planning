import { protectedProcedure, router, adminProcedure, practitionerProcedure } from "./_core/trpc";
import { createAvailabilitySlotSchema, updateAvailabilitySlotSchema, slotIdSchema, practitionerIdSchema, getAvailableSlotsSchema } from "@shared/zodSchemas";
import { createAvailabilitySlot, updateAvailabilitySlot, deleteAvailabilitySlot, getPractitionerSlots, getAvailableSlots } from "./db";

export const availabilitySlotsRouter = router({
  // Créer un nouveau créneau de disponibilité (Admin/Practitioner)
  create: practitionerProcedure
    .input(createAvailabilitySlotSchema)
    .mutation(async ({ input, ctx }) => {
      // TODO: Vérifier si le praticienId correspond à l'utilisateur connecté si ce n'est pas un admin
      
      // Convertir les chaînes ISO en objets Date pour Drizzle
      const data = {
        ...input,
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
      };

      return createAvailabilitySlot(data);
    }),

  // Mettre à jour un créneau de disponibilité (Admin/Practitioner)
  update: practitionerProcedure
    .input(updateAvailabilitySlotSchema)
    .mutation(async ({ input, ctx }) => {
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
    .mutation(async ({ input, ctx }) => {
      // TODO: Vérifier si le créneau appartient au praticien ou si l'utilisateur est admin
      
      return deleteAvailabilitySlot(input);
    }),

  // Récupérer tous les créneaux d'un praticien (Admin/Practitioner)
  listByPractitioner: practitionerProcedure
    .input(practitionerIdSchema)
    .query(async ({ input, ctx }) => {
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
