import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarIcon, 
  Clock, 
  Repeat, 
  Plus,
  X,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface SlotCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSlots: (slots: SlotData[]) => Promise<void>;
  existingSlots?: Array<{ date: string; startTime: string; endTime: string }>;
}

export interface SlotData {
  date: string;
  startTime: string;
  endTime: string;
  consultationType: string;
  isRecurring: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: string;
    occurrences?: number;
  };
}

const consultationTypes = [
  { value: 'consultation', label: 'Consultation classique' },
  { value: 'suivi', label: 'Suivi' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'premiere', label: 'Première consultation' },
  { value: 'groupe', label: 'Séance de groupe' },
];

const daysOfWeek = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

export default function SlotCreationDialog({
  open,
  onOpenChange,
  onCreateSlots,
  existingSlots = [],
}: SlotCreationDialogProps) {
  const [activeTab, setActiveTab] = useState<'simple' | 'recurring'>('simple');
  const [loading, setLoading] = useState(false);

  // État pour le formulaire simple
  const [simpleSlot, setSimpleSlot] = useState({
    date: undefined as Date | undefined,
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
    interval: 60,
    consultationType: 'consultation',
  });

  // État pour le formulaire récurrent
  const [recurringSlot, setRecurringSlot] = useState({
    startDate: undefined as Date | undefined,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 60,
    breakDuration: 0,
    consultationType: 'consultation',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    interval: 1,
    selectedDays: [1, 2, 3, 4, 5] as number[],
    endType: 'date' as 'date' | 'occurrences',
    endDate: undefined as Date | undefined,
    occurrences: 10,
  });

  // Vérifier les conflits
  const checkConflicts = (date: string, startTime: string, endTime: string): boolean => {
    return existingSlots.some(slot => {
      if (slot.date !== date) return false;
      
      const slotStart = new Date(`${date}T${slot.startTime}`);
      const slotEnd = new Date(`${date}T${slot.endTime}`);
      const newStart = new Date(`${date}T${startTime}`);
      const newEnd = new Date(`${date}T${endTime}`);
      
      return (
        (newStart >= slotStart && newStart < slotEnd) ||
        (newEnd > slotStart && newEnd <= slotEnd) ||
        (newStart <= slotStart && newEnd >= slotEnd)
      );
    });
  };

  // Générer les créneaux simples
  const generateSimpleSlots = (): SlotData[] => {
    if (!simpleSlot.date) return [];

    const slots: SlotData[] = [];
    const dateStr = format(simpleSlot.date, 'yyyy-MM-dd');
    
    let currentTime = simpleSlot.startTime;
    const endTime = simpleSlot.endTime;
    
    while (currentTime < endTime) {
      const [hours, minutes] = currentTime.split(':').map(Number);
      const startDate = new Date(simpleSlot.date);
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + simpleSlot.duration);
      
      const slotEndTime = format(endDate, 'HH:mm');
      
      if (slotEndTime > endTime) break;

      // Vérifier les conflits
      if (checkConflicts(dateStr, currentTime, slotEndTime)) {
        toast.warning(`Conflit détecté pour le créneau ${currentTime} - ${slotEndTime}`);
      } else {
        slots.push({
          date: dateStr,
          startTime: currentTime,
          endTime: slotEndTime,
          consultationType: simpleSlot.consultationType,
          isRecurring: false,
        });
      }
      
      // Passer au créneau suivant
      startDate.setMinutes(startDate.getMinutes() + simpleSlot.duration + simpleSlot.interval);
      currentTime = format(startDate, 'HH:mm');
    }
    
    return slots;
  };

  // Générer les créneaux récurrents
  const generateRecurringSlots = (): SlotData[] => {
    if (!recurringSlot.startDate) return [];

    const slots: SlotData[] = [];
    let currentDate = new Date(recurringSlot.startDate);
    const maxDate = recurringSlot.endType === 'date' && recurringSlot.endDate
      ? recurringSlot.endDate
      : new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000); // Max 1 an

    let occurrenceCount = 0;
    const maxOccurrences = recurringSlot.endType === 'occurrences' 
      ? recurringSlot.occurrences 
      : 365;

    while (currentDate <= maxDate && occurrenceCount < maxOccurrences) {
      const dayOfWeek = currentDate.getDay();
      
      // Vérifier si ce jour est sélectionné
      if (recurringSlot.frequency === 'weekly' && !recurringSlot.selectedDays.includes(dayOfWeek)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Générer les créneaux pour cette journée
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      let currentTime = recurringSlot.startTime;
      
      while (currentTime < recurringSlot.endTime) {
        const [hours, minutes] = currentTime.split(':').map(Number);
        const startDate = new Date(currentDate);
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + recurringSlot.slotDuration);
        
        const slotEndTime = format(endDate, 'HH:mm');
        
        if (slotEndTime > recurringSlot.endTime) break;

        if (!checkConflicts(dateStr, currentTime, slotEndTime)) {
          slots.push({
            date: dateStr,
            startTime: currentTime,
            endTime: slotEndTime,
            consultationType: recurringSlot.consultationType,
            isRecurring: true,
            recurrence: {
              frequency: recurringSlot.frequency,
              interval: recurringSlot.interval,
              daysOfWeek: recurringSlot.selectedDays,
              endDate: recurringSlot.endDate ? format(recurringSlot.endDate, 'yyyy-MM-dd') : undefined,
              occurrences: recurringSlot.occurrences,
            },
          });
        }
        
        // Ajouter la durée du créneau + pause
        startDate.setMinutes(startDate.getMinutes() + recurringSlot.slotDuration + recurringSlot.breakDuration);
        currentTime = format(startDate, 'HH:mm');
      }

      occurrenceCount++;

      // Passer au jour suivant selon la fréquence
      if (recurringSlot.frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + recurringSlot.interval);
      } else if (recurringSlot.frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (recurringSlot.frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + recurringSlot.interval);
      }
    }

    return slots;
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const slots = activeTab === 'simple' 
        ? generateSimpleSlots() 
        : generateRecurringSlots();

      if (slots.length === 0) {
        toast.error('Aucun créneau à créer');
        return;
      }

      await onCreateSlots(slots);
      toast.success(`${slots.length} créneau(x) créé(s) avec succès`);
      onOpenChange(false);
      
      // Réinitialiser le formulaire
      setSimpleSlot({
        date: undefined,
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        interval: 60,
        consultationType: 'consultation',
      });
      setRecurringSlot({
        startDate: undefined,
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 60,
        breakDuration: 0,
        consultationType: 'consultation',
        frequency: 'weekly',
        interval: 1,
        selectedDays: [1, 2, 3, 4, 5],
        endType: 'date',
        endDate: undefined,
        occurrences: 10,
      });
    } catch (error) {
      toast.error('Erreur lors de la création des créneaux');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Créer des créneaux de disponibilité
          </DialogTitle>
          <DialogDescription>
            Créez un ou plusieurs créneaux en mode simple ou récurrent
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'simple' | 'recurring')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">Créneau simple</TabsTrigger>
            <TabsTrigger value="recurring">Créneaux récurrents</TabsTrigger>
          </TabsList>

          {/* Formulaire Simple */}
          <TabsContent value="simple" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !simpleSlot.date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {simpleSlot.date ? format(simpleSlot.date, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={simpleSlot.date}
                      onSelect={(date) => setSimpleSlot({ ...simpleSlot, date })}
                      locale={fr}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Type de consultation</Label>
                <Select
                  value={simpleSlot.consultationType}
                  onValueChange={(value) => setSimpleSlot({ ...simpleSlot, consultationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {consultationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure de début</Label>
                <Input
                  type="time"
                  value={simpleSlot.startTime}
                  onChange={(e) => setSimpleSlot({ ...simpleSlot, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Heure de fin</Label>
                <Input
                  type="time"
                  value={simpleSlot.endTime}
                  onChange={(e) => setSimpleSlot({ ...simpleSlot, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durée du créneau (minutes)</Label>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={simpleSlot.duration}
                  onChange={(e) => setSimpleSlot({ ...simpleSlot, duration: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Intervalle entre rendez-vous (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  step="5"
                  value={simpleSlot.interval}
                  onChange={(e) => setSimpleSlot({ ...simpleSlot, interval: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900">
                Les créneaux seront générés automatiquement entre l'heure de début et de fin, 
                avec la durée et l'intervalle spécifiés. Les conflits seront automatiquement détectés.
              </p>
            </div>
          </TabsContent>

          {/* Formulaire Récurrent */}
          <TabsContent value="recurring" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !recurringSlot.startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {recurringSlot.startDate ? format(recurringSlot.startDate, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={recurringSlot.startDate}
                      onSelect={(date) => setRecurringSlot({ ...recurringSlot, startDate: date })}
                      locale={fr}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Type de consultation</Label>
                <Select
                  value={recurringSlot.consultationType}
                  onValueChange={(value) => setRecurringSlot({ ...recurringSlot, consultationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {consultationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure de début de journée</Label>
                <Input
                  type="time"
                  value={recurringSlot.startTime}
                  onChange={(e) => setRecurringSlot({ ...recurringSlot, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Heure de fin de journée</Label>
                <Input
                  type="time"
                  value={recurringSlot.endTime}
                  onChange={(e) => setRecurringSlot({ ...recurringSlot, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durée du créneau (minutes)</Label>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={recurringSlot.slotDuration}
                  onChange={(e) => setRecurringSlot({ ...recurringSlot, slotDuration: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Pause entre créneaux (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  step="5"
                  value={recurringSlot.breakDuration}
                  onChange={(e) => setRecurringSlot({ ...recurringSlot, breakDuration: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Jours de la semaine</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Badge
                    key={day.value}
                    variant={recurringSlot.selectedDays.includes(day.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const newDays = recurringSlot.selectedDays.includes(day.value)
                        ? recurringSlot.selectedDays.filter(d => d !== day.value)
                        : [...recurringSlot.selectedDays, day.value];
                      setRecurringSlot({ ...recurringSlot, selectedDays: newDays });
                    }}
                  >
                    {day.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fin de la récurrence</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={recurringSlot.endType === 'date'}
                    onCheckedChange={(checked) => 
                      checked && setRecurringSlot({ ...recurringSlot, endType: 'date' })
                    }
                  />
                  <Label className="font-normal">Jusqu'à une date</Label>
                </div>
                {recurringSlot.endType === 'date' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal ml-6',
                          !recurringSlot.endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {recurringSlot.endDate ? format(recurringSlot.endDate, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={recurringSlot.endDate}
                        onSelect={(date) => setRecurringSlot({ ...recurringSlot, endDate: date })}
                        locale={fr}
                        disabled={(date) => !recurringSlot.startDate || date < recurringSlot.startDate}
                      />
                    </PopoverContent>
                  </Popover>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={recurringSlot.endType === 'occurrences'}
                    onCheckedChange={(checked) => 
                      checked && setRecurringSlot({ ...recurringSlot, endType: 'occurrences' })
                    }
                  />
                  <Label className="font-normal">Après un nombre d'occurrences</Label>
                </div>
                {recurringSlot.endType === 'occurrences' && (
                  <Input
                    type="number"
                    min="1"
                    value={recurringSlot.occurrences}
                    onChange={(e) => setRecurringSlot({ ...recurringSlot, occurrences: parseInt(e.target.value) })}
                    className="ml-6"
                  />
                )}
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg flex items-start gap-2">
              <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-900">
                Des créneaux seront générés automatiquement pour chaque jour sélectionné, 
                entre les heures spécifiées. La récurrence se poursuivra jusqu'à la date de fin 
                ou le nombre d'occurrences choisi.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Création en cours...' : 'Créer les créneaux'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
