/**
 * ============================================================================
 * ALGORITHME DE CALCUL DES DISPONIBILITÉS
 * ============================================================================
 * 
 * Calcul déterministe des créneaux disponibles basé sur :
 * 1. Des règles de travail (horaires, jours ouvrés)
 * 2. Les événements Google Calendar existants
 * 
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
 * RÈGLES DE TRAVAIL PAR DÉFAUT
 */
export const DEFAULT_WORKING_HOURS: WorkingHoursRules = {
  timezone: 'Europe/Paris',
  workingDays: [1, 2, 4, 5], // Lundi, Mardi, Jeudi, Vendredi
  startHour: 9,                  // 9h00
  startMinute: 0,
  endHour: 18,                   // 18h00
  endMinute: 0,
  slotDuration: 60,              // 60 minutes par créneau
  minAdvanceBookingMinutes: 120, // Minimum 2 heures à l'avance
  maxAdvanceBookingDays: 30,     // Maximum 30 jours à l'avance
};

/**
 * Événement simplifié pour le calcul
 */
interface SimpleEvent {
  startDateTime: Date;
  endDateTime: Date;
  summary?: string;
}

/**
 * Calculer les créneaux disponibles sur une période
 * 
 * NOUVEL ALGORITHME :
 * 1. Identifier les événements Google Calendar dont le titre contient "DISPONIBLE"
 * 2. Découper ces événements en créneaux de 60 minutes
 * 3. Filtrer les créneaux qui chevauchent d'autres événements (rendez-vous)
 * 4. Filtrer les créneaux dans le passé
 */
export function calculateAvailableSlots(
  startDate: string,
  endDate: string,
  existingEvents: SimpleEvent[],
  rules: WorkingHoursRules = DEFAULT_WORKING_HOURS
): TimeSlot[] {
  console.info(`[AvailabilityCalculator] 🧮 Calcul des disponibilités (Scan événements "DISPONIBLE")`);

  const availableSlots: TimeSlot[] = [];
  const nowUTC = new Date();
  const minBookingTime = new Date(nowUTC.getTime() + rules.minAdvanceBookingMinutes * 60 * 1000);

  // 1. Séparer les plages de disponibilité et les rendez-vous
  const availabilityRanges = existingEvents.filter(e => 
    e.summary?.toUpperCase().includes('DISPONIBLE')
  );
  
  const appointments = existingEvents.filter(e => 
    !e.summary?.toUpperCase().includes('DISPONIBLE')
  );

  console.info(`[AvailabilityCalculator] 🔍 Trouvé ${availabilityRanges.length} plages "DISPONIBLE" et ${appointments.length} rendez-vous`);

  // 2. Découper chaque plage de disponibilité
  for (const range of availabilityRanges) {
    let currentTime = new Date(range.startDateTime);
    const rangeEnd = new Date(range.endDateTime);
    const dateStr = range.startDateTime.toISOString().split('T')[0];

    while (true) {
      const slotEnd = new Date(currentTime.getTime() + rules.slotDuration * 60000);
      
      if (slotEnd > rangeEnd) break;

      const startTimeStr = currentTime.toISOString().split('T')[1].substring(0, 5);
      const endTimeStr = slotEnd.toISOString().split('T')[1].substring(0, 5);

      // FILTRE : Pas dans le passé
      if (slotEnd > minBookingTime) {
        // FILTRE : Pas de chevauchement avec un rendez-vous
        let isOccupied = false;
        for (const appt of appointments) {
          if (currentTime < appt.endDateTime && slotEnd > appt.startDateTime) {
            isOccupied = true;
            break;
          }
        }

        if (!isOccupied) {
          availableSlots.push({
            date: dateStr,
            startTime: startTimeStr,
            endTime: endTimeStr,
            duration: rules.slotDuration,
          });
        }
      }

      currentTime = slotEnd;
    }
  }

  console.info(`[AvailabilityCalculator] ✅ ${availableSlots.length} créneaux disponibles générés`);
  return availableSlots;
}

/**
 * Convertir un événement Google Calendar en SimpleEvent
 */
export function convertGoogleEventToSimpleEvent(googleEvent: any): SimpleEvent {
  return {
    startDateTime: new Date(googleEvent.start.dateTime),
    endDateTime: new Date(googleEvent.end.dateTime),
    summary: googleEvent.summary || '',
  };
}

/**
 * Grouper les créneaux par date
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
 */
export function getNextAvailableSlot(availableSlots: TimeSlot[]): TimeSlot | null {
  if (availableSlots.length === 0) {
    return null;
  }
  const sorted = [...availableSlots].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.startTime.localeCompare(b.startTime);
  });
  return sorted[0];
}
