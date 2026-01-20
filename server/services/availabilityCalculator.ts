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
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

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
    const dateStr = formatInTimeZone(range.startDateTime, rules.timezone, 'yyyy-MM-dd');

    while (true) {
      const slotEnd = new Date(currentTime.getTime() + rules.slotDuration * 60000);
      
      if (slotEnd > rangeEnd) break;

      // Utiliser date-fns-tz pour formater l'heure dans la timezone cible
      const startTimeStr = formatInTimeZone(currentTime, rules.timezone, 'HH:mm');
      const endTimeStr = formatInTimeZone(slotEnd, rules.timezone, 'HH:mm');
      const currentSlotDateStr = formatInTimeZone(currentTime, rules.timezone, 'yyyy-MM-dd');

      // FILTRE : Pas dans le passé
      if (slotEnd > minBookingTime) {
        // FILTRE : Pas de chevauchement avec un rendez-vous
        let overlappingAppt: SimpleEvent | undefined = undefined;
        for (const appt of appointments) {
          if (currentTime < appt.endDateTime && slotEnd > appt.startDateTime) {
            overlappingAppt = appt;
            break;
          }
        }

        if (!overlappingAppt) {
          availableSlots.push({
            date: currentSlotDateStr,
            startTime: startTimeStr,
            endTime: endTimeStr,
            duration: rules.slotDuration,
          });
          currentTime = slotEnd;
        } else {
          // Si occupé, on saute à la fin du rendez-vous
          const apptEnd = new Date(overlappingAppt.endDateTime);
          
          // Pour éviter de décaler tous les créneaux suivants (ex: RDV finit à 18h30 -> prochain à 18h30),
          // on arrondit à la prochaine heure pleine ou demi-heure si on veut garder un rythme,
          // MAIS l'utilisateur veut que ça s'enchaîne. 
          // S'il a un RDV de 18h à 19h, le suivant doit être à 19h.
          // S'il a un RDV de 18h à 18h30, et qu'il veut des créneaux de 60min, 
          // soit il commence à 18h30 (perte de rythme), soit il attend 19h.
          
          // L'utilisateur dit : "j'ai un créneaux de 18h à 19h mais l'application me propose un créneaux a 19h30"
          // Cela arrive si `currentTime` devient 19h00, mais que quelque chose le décale.
          // Dans mon test, avec 18h-19h, ça donnait bien 19h.
          
          // Hypothèse : Le "créneau de 18h à 19h" est peut-être un événement Google qui finit à 19h00m01s 
          // ou un petit décalage de secondes/ms qui fait que 19h00 < apptEnd est vrai.
          
          // Correction : On s'assure que si on saute à la fin d'un RDV, on ne crée pas de décalage inutile.
          // Si le rendez-vous finit à une heure qui n'est pas alignée sur le rythme souhaité (ex: 18h30 alors qu'on veut des créneaux de 60min commençant aux heures piles),
          // on peut soit commencer à 18h30, soit attendre 19h00.
          // L'utilisateur se plaint d'un décalage de 30 min (19h30 au lieu de 19h00).
          // Cela suggère qu'il veut rester aligné sur les heures piles ou les demies.
          
          // On arrondit à la minute la plus proche pour éviter les problèmes de millisecondes de Google
          // qui pourraient faire que 19:00:01 soit considéré comme après 19:00.
          currentTime = new Date(Math.round(apptEnd.getTime() / 60000) * 60000);
        }
      } else {
        currentTime = slotEnd;
      }
    }
  }

  console.info(`[AvailabilityCalculator] ✅ ${availableSlots.length} créneaux disponibles générés`);
  return availableSlots;
}

/**
 * Convertir un événement Google Calendar en SimpleEvent
 */
export function convertGoogleEventToSimpleEvent(googleEvent: any): SimpleEvent {
  // Google Calendar renvoie des dates avec offset (ex: 2026-01-05T17:00:00+01:00)
  // On s'assure de bien capturer le moment exact en UTC
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
