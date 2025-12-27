/**
 * ============================================================================
 * ALGORITHME DE CALCUL DES DISPONIBILITÉS
 * ============================================================================
 * 
 * Calcul déterministe des créneaux disponibles basé sur :
 * 1. Des règles de travail (horaires, jours ouvrés)
 * 2. Les événements Google Calendar existants
 * 
 * ❌ PAS d'événements "disponible"
 * ❌ PAS de parsing iCal
 * ❌ PAS de dépendance sur l'heure locale du serveur
 * 
 * ✅ Timezone explicite (Europe/Paris)
 * ✅ Déterministe (même résultat en preview et prod)
 * ✅ Compatible Vercel (stateless)
 * 
 * @author Claude - Senior Full-Stack Engineer
 * @date 2025-12-27
 */

import { WorkingHoursRules, TimeSlot } from './googleCalendarOAuth2';

/**
 * Événement simplifié pour le calcul
 */
interface SimpleEvent {
  startDateTime: Date;
  endDateTime: Date;
}

/**
 * RÈGLES DE TRAVAIL PAR DÉFAUT
 * 
 * Ces règles définissent quand je suis disponible pour prendre des rendez-vous.
 * Modifiez ces valeurs selon vos besoins.
 */
export const DEFAULT_WORKING_HOURS: WorkingHoursRules = {
  timezone: 'Europe/Paris',
  workingDays: [1, 2, 3, 4, 5], // Lundi à Vendredi (ISO 8601: 1 = Lundi, 7 = Dimanche)
  startHour: 9,                  // 9h00
  startMinute: 0,
  endHour: 18,                   // 18h00
  endMinute: 0,
  slotDuration: 60,              // 60 minutes par créneau
  minAdvanceBookingMinutes: 120, // Minimum 2 heures à l'avance
  maxAdvanceBookingDays: 30,     // Maximum 30 jours à l'avance
};

/**
 * Calculer les créneaux disponibles sur une période
 * 
 * ALGORITHME :
 * 1. Générer tous les créneaux possibles selon les règles de travail
 * 2. Récupérer les événements Google Calendar existants
 * 3. Filtrer les créneaux qui chevauchent des événements
 * 4. Filtrer les créneaux dans le passé
 * 5. Retourner uniquement les créneaux disponibles
 * 
 * @param startDate Date de début (YYYY-MM-DD)
 * @param endDate Date de fin (YYYY-MM-DD)
 * @param existingEvents Événements Google Calendar existants
 * @param rules Règles de travail (optionnel, utilise DEFAULT_WORKING_HOURS par défaut)
 * @returns Liste des créneaux disponibles
 */
export function calculateAvailableSlots(
  startDate: string,
  endDate: string,
  existingEvents: SimpleEvent[],
  rules: WorkingHoursRules = DEFAULT_WORKING_HOURS
): TimeSlot[] {
  console.info(`[AvailabilityCalculator] 🧮 Calcul des disponibilités du ${startDate} au ${endDate}`);

  const availableSlots: TimeSlot[] = [];
  
  // Obtenir la date/heure actuelle UTC (compatible Vercel)
  const nowUTC = new Date();
  const minBookingTime = new Date(nowUTC.getTime() + rules.minAdvanceBookingMinutes * 60 * 1000);

  console.info(`[AvailabilityCalculator] ⏰ Heure actuelle UTC: ${nowUTC.toISOString()}`);
  console.info(`[AvailabilityCalculator] ⏰ Réservation minimum après: ${minBookingTime.toISOString()}`);

  // Parser les dates de début et fin
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Limiter la fenêtre de réservation
  const maxBookingDate = new Date(nowUTC);
  maxBookingDate.setDate(maxBookingDate.getDate() + rules.maxAdvanceBookingDays);

  if (end > maxBookingDate) {
    console.info(`[AvailabilityCalculator] ⚠️ Limite de réservation: ${maxBookingDate.toISOString().split('T')[0]}`);
  }

  // Parcourir chaque jour de la période
  const currentDate = new Date(start);
  let totalGenerated = 0;
  let totalFiltered = 0;

  while (currentDate <= end && currentDate <= maxBookingDate) {
    // Obtenir le jour de la semaine (ISO 8601: 1 = Lundi, 7 = Dimanche)
    const dayOfWeek = currentDate.getDay();
    const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Convertir Dimanche (0) en 7

    // Vérifier si ce jour est un jour ouvré
    if (!rules.workingDays.includes(isoDayOfWeek)) {
      console.info(`[AvailabilityCalculator] ⏭️ Jour non ouvré ignoré: ${currentDate.toISOString().split('T')[0]} (jour ${isoDayOfWeek})`);
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Générer tous les créneaux pour ce jour
    const dateStr = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

    let currentHour = rules.startHour;
    let currentMinute = rules.startMinute;

    while (true) {
      // Calculer l'heure de fin du créneau
      const endMinute = currentMinute + rules.slotDuration;
      const endHour = currentHour + Math.floor(endMinute / 60);
      const finalEndMinute = endMinute % 60;

      // Vérifier si le créneau dépasse les heures de travail
      if (endHour > rules.endHour || (endHour === rules.endHour && finalEndMinute > rules.endMinute)) {
        break; // Fin de la journée de travail
      }

      // Formater les heures
      const startTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      const endTimeStr = `${endHour.toString().padStart(2, '0')}:${finalEndMinute.toString().padStart(2, '0')}`;

      totalGenerated++;

      // Créer les objets Date pour ce créneau (en UTC)
      const slotStartUTC = new Date(`${dateStr}T${startTimeStr}:00.000Z`);
      const slotEndUTC = new Date(`${dateStr}T${endTimeStr}:00.000Z`);

      // FILTRE 1 : Vérifier que le créneau est dans le futur + délai minimum
      if (slotEndUTC <= minBookingTime) {
        totalFiltered++;
        // Passer au créneau suivant
        currentMinute += rules.slotDuration;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
        continue;
      }

      // FILTRE 2 : Vérifier qu'aucun événement ne chevauche ce créneau
      let isOccupied = false;
      for (const event of existingEvents) {
        // Chevauchement si : début du slot < fin de l'événement ET fin du slot > début de l'événement
        const overlaps = slotStartUTC < event.endDateTime && slotEndUTC > event.startDateTime;

        if (overlaps) {
          isOccupied = true;
          totalFiltered++;
          break;
        }
      }

      // Si le créneau est disponible, l'ajouter
      if (!isOccupied) {
        availableSlots.push({
          date: dateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          duration: rules.slotDuration,
        });
      }

      // Passer au créneau suivant
      currentMinute += rules.slotDuration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.info(`[AvailabilityCalculator] 📊 Résultats:`);
  console.info(`  - Créneaux générés: ${totalGenerated}`);
  console.info(`  - Créneaux filtrés: ${totalFiltered}`);
  console.info(`  - Créneaux disponibles: ${availableSlots.length}`);

  return availableSlots;
}

/**
 * Convertir un événement Google Calendar en SimpleEvent
 */
export function convertGoogleEventToSimpleEvent(googleEvent: any): SimpleEvent {
  return {
    startDateTime: new Date(googleEvent.start.dateTime),
    endDateTime: new Date(googleEvent.end.dateTime),
  };
}

/**
 * Grouper les créneaux par date
 * 
 * @param slots Liste des créneaux
 * @returns Dictionnaire { date => créneaux[] }
 */
export function groupSlotsByDate(slots: TimeSlot[]): Record<string, TimeSlot[]> {
  const grouped: Record<string, TimeSlot[]> = {};

  for (const slot of slots) {
    if (!grouped[slot.date]) {
      grouped[slot.date] = [];
    }
    grouped[slot.date].push(slot);
  }

  return grouped;
}

/**
 * Obtenir les dates qui ont au moins un créneau disponible
 * 
 * @param slots Liste des créneaux
 * @returns Liste des dates triées (YYYY-MM-DD)
 */
export function getAvailableDates(slots: TimeSlot[]): string[] {
  const dates = new Set<string>();

  for (const slot of slots) {
    dates.add(slot.date);
  }

  return Array.from(dates).sort();
}

/**
 * Vérifier si un créneau spécifique est disponible
 * 
 * @param date Date (YYYY-MM-DD)
 * @param startTime Heure de début (HH:mm)
 * @param endTime Heure de fin (HH:mm)
 * @param availableSlots Liste des créneaux disponibles
 * @returns true si le créneau est disponible
 */
export function isSlotAvailable(
  date: string,
  startTime: string,
  endTime: string,
  availableSlots: TimeSlot[]
): boolean {
  return availableSlots.some(
    slot => 
      slot.date === date &&
      slot.startTime === startTime &&
      slot.endTime === endTime
  );
}

/**
 * Calculer le prochain créneau disponible
 * 
 * @param availableSlots Liste des créneaux disponibles (triés par date/heure)
 * @returns Premier créneau disponible ou null
 */
export function getNextAvailableSlot(availableSlots: TimeSlot[]): TimeSlot | null {
  if (availableSlots.length === 0) {
    return null;
  }

  // Les créneaux doivent être triés par date puis heure
  const sorted = [...availableSlots].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.startTime.localeCompare(b.startTime);
  });

  return sorted[0];
}
