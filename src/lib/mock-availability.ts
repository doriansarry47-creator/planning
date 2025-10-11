// Local mock availability storage for development (uses localStorage)

export interface MockAvailabilitySlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  isAvailable: boolean;
  isRecurring: boolean;
  recurringPattern?: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek?: number; // 0..6
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'mockAvailabilitySlots';

function readAll(): MockAvailabilitySlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockAvailabilitySlot[]) : [];
  } catch {
    return [];
  }
}

function writeAll(slots: MockAvailabilitySlot[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function initializeDefaults(): void {
  const existing = readAll();
  if (existing.length > 0) return;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const defaults: MockAvailabilitySlot[] = [
    {
      id: generateId(),
      date: todayStr,
      startTime: '09:00',
      endTime: '10:00',
      duration: 60,
      isAvailable: true,
      isRecurring: true,
      recurringPattern: 'weekly',
      dayOfWeek: new Date().getDay(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      date: todayStr,
      startTime: '14:00',
      endTime: '15:00',
      duration: 60,
      isAvailable: true,
      isRecurring: true,
      recurringPattern: 'weekly',
      dayOfWeek: new Date().getDay(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  writeAll(defaults);
}

export function getAvailabilitySlots(params?: {
  startDate?: string;
  endDate?: string;
  available?: boolean;
}): { slots: MockAvailabilitySlot[]; total: number } {
  initializeDefaults();
  let base = [...readAll()];

  if (params?.startDate) {
    base = base.filter((s) => s.date >= params.startDate!);
  }
  if (params?.endDate) {
    base = base.filter((s) => s.date <= params.endDate!);
  }
  if (typeof params?.available === 'boolean') {
    base = base.filter((s) => s.isAvailable === params.available);
  }

  const generated = generateRecurringSlots(base);
  return { slots: generated, total: generated.length };
}

export function createAvailabilitySlot(input: Omit<MockAvailabilitySlot, 'id' | 'createdAt' | 'updatedAt'>) {
  initializeDefaults();
  const current = readAll();

  if (input.startTime >= input.endTime) {
    throw new Error("L'heure de fin doit être postérieure à l'heure de début");
  }

  const conflict = current.find(
    (slot) =>
      slot.date === input.date &&
      ((input.startTime >= slot.startTime && input.startTime < slot.endTime) ||
        (input.endTime > slot.startTime && input.endTime <= slot.endTime) ||
        (input.startTime <= slot.startTime && input.endTime >= slot.endTime))
  );
  if (conflict) {
    throw new Error('Ce créneau entre en conflit avec un créneau existant');
  }

  const newSlot: MockAvailabilitySlot = {
    id: generateId(),
    ...input,
    isAvailable: input.isAvailable ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  current.push(newSlot);
  writeAll(current);
  return newSlot;
}

export function updateAvailabilitySlot(id: string, updates: Partial<MockAvailabilitySlot>) {
  initializeDefaults();
  const current = readAll();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) throw new Error('Créneau non trouvé');
  current[index] = { ...current[index], ...updates, updatedAt: new Date().toISOString() };
  writeAll(current);
  return current[index];
}

export function deleteAvailabilitySlot(id: string) {
  initializeDefaults();
  const current = readAll();
  const index = current.findIndex((s) => s.id === id);
  if (index === -1) throw new Error('Créneau non trouvé');
  const [deleted] = current.splice(index, 1);
  writeAll(current);
  return deleted;
}

export function generateRecurringSlots(baseSlots: MockAvailabilitySlot[]): MockAvailabilitySlot[] {
  const generated = [...baseSlots];
  const today = new Date();
  const threeMonthsLater = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  baseSlots
    .filter((s) => s.isRecurring)
    .forEach((slot) => {
      const [y, m, d] = slot.date.split('-').map((v) => parseInt(v, 10));
      let currentDate = new Date(y, m - 1, d);

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
          default:
            currentDate.setDate(currentDate.getDate() + 7);
        }
      }

      while (currentDate <= threeMonthsLater) {
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const exists = generated.find(
          (s) => s.date === dateStr && s.startTime === slot.startTime && s.endTime === slot.endTime
        );
        if (!exists) {
          generated.push({
            ...slot,
            id: generateId(),
            date: dateStr,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

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
          default:
            currentDate.setDate(currentDate.getDate() + 7);
        }
      }
    });

  return generated.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
}

export const mockAvailability = {
  get: getAvailabilitySlots,
  create: createAvailabilitySlot,
  update: updateAvailabilitySlot,
  delete: deleteAvailabilitySlot,
};
