import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyToken } from '../_lib/auth';
import { sendSuccess, sendError, handleApiError } from '../_lib/response';

// Schéma de validation pour un créneau
const availabilitySlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  duration: z.number().min(15).max(180).default(60),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
  dayOfWeek: z.number().min(0).max(6).optional(), // 0 = dimanche, 6 = samedi
  notes: z.string().optional(),
});

// Mock data pour les créneaux (à remplacer par une vraie base de données)
let availabilitySlots: Array<{
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  isAvailable: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  dayOfWeek?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}> = [
  {
    id: '1',
    date: '2024-10-15',
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
    isAvailable: true,
    isRecurring: true,
    recurringPattern: 'weekly',
    dayOfWeek: 2, // mardi
    notes: 'Créneau matinal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    date: '2024-10-15',
    startTime: '14:00',
    endTime: '15:00',
    duration: 60,
    isAvailable: true,
    isRecurring: true,
    recurringPattern: 'weekly',
    dayOfWeek: 2,
    notes: 'Créneau après-midi',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    date: '2024-10-17',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    isAvailable: false, // Réservé
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getAvailabilitySlots(req, res);
      case 'POST':
        return await createAvailabilitySlot(req, res);
      case 'PUT':
        return await updateAvailabilitySlot(req, res);
      case 'DELETE':
        return await deleteAvailabilitySlot(req, res);
      default:
        return sendError(res, 'Méthode non autorisée', 405);
    }
  } catch (error) {
    return handleApiError(res, error);
  }
}

// Récupérer les créneaux de disponibilité
async function getAvailabilitySlots(req: VercelRequest, res: VercelResponse) {
  const { startDate, endDate, available } = req.query;
  
  let filteredSlots = [...availabilitySlots];
  
  // Filtrer par date
  if (startDate) {
    filteredSlots = filteredSlots.filter(slot => slot.date >= startDate);
  }
  
  if (endDate) {
    filteredSlots = filteredSlots.filter(slot => slot.date <= endDate);
  }
  
  // Filtrer par disponibilité
  if (available !== undefined) {
    const isAvailable = available === 'true';
    filteredSlots = filteredSlots.filter(slot => slot.isAvailable === isAvailable);
  }
  
  // Générer des créneaux récurrents pour les 3 prochains mois
  const generatedSlots = generateRecurringSlots(filteredSlots);
  
  return sendSuccess(res, {
    slots: generatedSlots,
    total: generatedSlots.length
  }, 'Créneaux récupérés avec succès');
}

// Créer un nouveau créneau de disponibilité
async function createAvailabilitySlot(req: VercelRequest, res: VercelResponse) {
  // Vérifier l'authentification admin
  const authResult = await verifyToken(req);
  if (!authResult.success || authResult.payload?.userType !== 'admin') {
    return sendError(res, 'Accès non autorisé', 401);
  }
  
  const validationResult = availabilitySlotSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return sendError(res, 'Données invalides: ' + validationResult.error.issues[0].message, 400);
  }
  
  const slotData = validationResult.data;
  
  // Vérifier que l'heure de fin est après l'heure de début
  if (slotData.startTime >= slotData.endTime) {
    return sendError(res, 'L\'heure de fin doit être postérieure à l\'heure de début', 400);
  }
  
  // Vérifier les conflits de créneaux
  const conflictingSlot = availabilitySlots.find(slot => 
    slot.date === slotData.date &&
    ((slotData.startTime >= slot.startTime && slotData.startTime < slot.endTime) ||
     (slotData.endTime > slot.startTime && slotData.endTime <= slot.endTime) ||
     (slotData.startTime <= slot.startTime && slotData.endTime >= slot.endTime))
  );
  
  if (conflictingSlot) {
    return sendError(res, 'Ce créneau entre en conflit avec un créneau existant', 409);
  }
  
  // Créer le nouveau créneau
  const newSlot = {
    id: generateId(),
    ...slotData,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  availabilitySlots.push(newSlot);
  
  return sendSuccess(res, newSlot, 'Créneau créé avec succès', 201);
}

// Mettre à jour un créneau de disponibilité
async function updateAvailabilitySlot(req: VercelRequest, res: VercelResponse) {
  const authResult = await verifyToken(req);
  if (!authResult.success || authResult.payload?.userType !== 'admin') {
    return sendError(res, 'Accès non autorisé', 401);
  }
  
  const { slotId } = req.query;
  const updateData = req.body;
  
  const slotIndex = availabilitySlots.findIndex(slot => slot.id === slotId);
  if (slotIndex === -1) {
    return sendError(res, 'Créneau non trouvé', 404);
  }
  
  availabilitySlots[slotIndex] = {
    ...availabilitySlots[slotIndex],
    ...updateData,
    updatedAt: new Date().toISOString(),
  };
  
  return sendSuccess(res, availabilitySlots[slotIndex], 'Créneau mis à jour avec succès');
}

// Supprimer un créneau de disponibilité
async function deleteAvailabilitySlot(req: VercelRequest, res: VercelResponse) {
  const authResult = await verifyToken(req);
  if (!authResult.success || authResult.payload?.userType !== 'admin') {
    return sendError(res, 'Accès non autorisé', 401);
  }
  
  const { slotId } = req.query;
  
  const slotIndex = availabilitySlots.findIndex(slot => slot.id === slotId);
  if (slotIndex === -1) {
    return sendError(res, 'Créneau non trouvé', 404);
  }
  
  const deletedSlot = availabilitySlots.splice(slotIndex, 1)[0];
  
  return sendSuccess(res, deletedSlot, 'Créneau supprimé avec succès');
}

// Fonctions utilitaires

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Générer des créneaux récurrents
function generateRecurringSlots(baseSlots: typeof availabilitySlots): typeof availabilitySlots {
  const generated = [...baseSlots];
  const today = new Date();
  const threeMonthsLater = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
  
  baseSlots
    .filter(slot => slot.isRecurring)
    .forEach(slot => {
      const baseDate = new Date(slot.date);
      let currentDate = new Date(baseDate);
      
      // Avancer au prochain créneau si la date de base est dans le passé
      while (currentDate < today) {
        switch (slot.recurringPattern) {
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'biweekly':
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
      }
      
      // Générer les créneaux futurs
      while (currentDate <= threeMonthsLater) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Vérifier qu'il n'existe pas déjà un créneau pour cette date
        const existingSlot = generated.find(s => 
          s.date === dateStr && 
          s.startTime === slot.startTime && 
          s.endTime === slot.endTime
        );
        
        if (!existingSlot) {
          generated.push({
            ...slot,
            id: generateId(),
            date: dateStr,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        
        // Avancer à la prochaine occurrence
        switch (slot.recurringPattern) {
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'biweekly':
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }
      }
    });
  
  // Trier par date et heure
  return generated.sort((a, b) => {
    const dateComparison = a.date.localeCompare(b.date);
    if (dateComparison !== 0) return dateComparison;
    return a.startTime.localeCompare(b.startTime);
  });
}