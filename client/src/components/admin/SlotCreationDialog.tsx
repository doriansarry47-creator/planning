import React, { useState, useMemo } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarIcon, 
  Clock, 
  Repeat, 
  Plus,
  X,
  Info,
  AlertTriangle,
  CheckCircle2,
  Calendar as CalendarCheckIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface SlotCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSlots: (slots: SlotData[]) => Promise<void>;
  existingSlots?: Array<{ date: string; startTime: string; endTime: string }>;
  selectedDate?: Date; // Date sélectionnée depuis le calendrier
  selectedTime?: { start: string; end: string }; // Horaires sélectionnés depuis le calendrier
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
  { value: 'consultation', label: 'Consultation classique', color: 'bg-blue-500' },
  { value: 'suivi', label: 'Suivi', color: 'bg-green-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  { value: 'premiere', label: 'Première consultation', color: 'bg-purple-500' },
  { value: 'groupe', label: 'Séance de groupe', color: 'bg-indigo-500' },
];

// Types d'absence comme dans l'image fournie
const absenceTypes = [
  { value: 'formation', label: 'Formation', color: 'bg-orange-500', icon: '📚' },
  { value: 'sante', label: 'Santé', color: 'bg-pink-500', icon: '🏥' },
  { value: 'conge', label: 'Congé', color: 'bg-teal-500', icon: '🌴' },
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
  selectedDate,
  selectedTime,
}: SlotCreationDialogProps) {
  const [activeTab, setActiveTab] = useState<'simple' | 'recurring'>('simple');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSlots, setPreviewSlots] = useState<SlotData[]>([]);

  // Type de créneau (disponibilité ou absence)
  const [slotType, setSlotType] = useState<'availability' | 'absence'>('availability');
  
  // État pour le formulaire simple
  const [simpleSlot, setSimpleSlot] = useState({
    date: selectedDate || undefined as Date | undefined,
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
    interval: 60,
    consultationType: 'consultation',
  });

  // Mettre à jour la date et l'horaire quand selectedDate ou selectedTime changent
  React.useEffect(() => {
    if (selectedDate && open) {
      const updatedSlot: any = { date: selectedDate };
      
      // Pré-remplir les horaires si fournis
      if (selectedTime) {
        updatedSlot.startTime = selectedTime.start;
        updatedSlot.endTime = selectedTime.end;
        // Calculer la durée automatiquement
        const [startHours, startMinutes] = selectedTime.start.split(':').map(Number);
        const [endHours, endMinutes] = selectedTime.end.split(':').map(Number);
        const durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        if (durationMinutes > 0) {
          updatedSlot.duration = durationMinutes;
        }
      }
      
      setSimpleSlot(prev => ({ ...prev, ...updatedSlot }));
      setRecurringSlot(prev => ({ 
        ...prev, 
        startDate: selectedDate,
        ...(selectedTime && { startTime: selectedTime.start, endTime: selectedTime.end })
      }));
    }
  }, [selectedDate, selectedTime, open]);

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

  // Validation du formulaire
  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (activeTab === 'simple') {
      if (!simpleSlot.date) errors.push('Veuillez sélectionner une date');
      if (!simpleSlot.startTime) errors.push('Veuillez sélectionner une heure de début');
      if (!simpleSlot.endTime) errors.push('Veuillez sélectionner une heure de fin');
      if (simpleSlot.startTime >= simpleSlot.endTime) errors.push('L\'heure de fin doit être après l\'heure de début');
      if (!simpleSlot.consultationType) errors.push('Veuillez sélectionner un type de consultation');
      if (simpleSlot.duration < 15) errors.push('La durée minimale d\'un créneau est de 15 minutes');
    } else {
      if (!recurringSlot.startDate) errors.push('Veuillez sélectionner une date de début');
      if (!recurringSlot.startTime) errors.push('Veuillez sélectionner une heure de début de journée');
      if (!recurringSlot.endTime) errors.push('Veuillez sélectionner une heure de fin de journée');
      if (recurringSlot.startTime >= recurringSlot.endTime) errors.push('L\'heure de fin doit être après l\'heure de début');
      if (!recurringSlot.consultationType) errors.push('Veuillez sélectionner un type de consultation');
      if (recurringSlot.slotDuration < 15) errors.push('La durée minimale d\'un créneau est de 15 minutes');
      if (recurringSlot.selectedDays.length === 0) errors.push('Veuillez sélectionner au moins un jour de la semaine');
      if (recurringSlot.endType === 'date' && !recurringSlot.endDate) {
        errors.push('Veuillez sélectionner une date de fin de récurrence');
      }
      if (recurringSlot.endType === 'occurrences' && (!recurringSlot.occurrences || recurringSlot.occurrences < 1)) {
        errors.push('Veuillez saisir un nombre d\'occurrences valide (minimum 1)');
      }
    }
    
    return { valid: errors.length === 0, errors };
  };

  // Prévisualiser les créneaux
  const handlePreview = () => {
    const validation = validateForm();
    
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }
    
    const slots = activeTab === 'simple' 
      ? generateSimpleSlots() 
      : generateRecurringSlots();

    if (slots.length === 0) {
      toast.error('Aucun créneau à créer');
      return;
    }

    setPreviewSlots(slots);
    setShowPreview(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (previewSlots.length === 0) {
        toast.error('Aucun créneau à créer');
        return;
      }

      await onCreateSlots(previewSlots);
      toast.success(`${previewSlots.length} créneau(x) créé(s) avec succès`);
      onOpenChange(false);
      setShowPreview(false);
      
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
      setPreviewSlots([]);
    } catch (error) {
      toast.error('Erreur lors de la création des créneaux');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Compter les conflits
  const conflictsCount = useMemo(() => {
    return previewSlots.filter(slot => 
      checkConflicts(slot.date, slot.startTime, slot.endTime)
    ).length;
  }, [previewSlots, existingSlots]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <CalendarCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            Créer des créneaux de disponibilité
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            Créez un ou plusieurs créneaux horaires en mode simple ou récurrent. Les créneaux en conflit seront automatiquement détectés.
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'simple' | 'recurring')} className="mt-4">
              <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 dark:bg-gray-800 p-1">
                <TabsTrigger 
                  value="simple" 
                  className="text-base font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Créneau simple
                </TabsTrigger>
                <TabsTrigger 
                  value="recurring" 
                  className="text-base font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                >
                  <Repeat className="mr-2 h-4 w-4" />
                  Créneaux récurrents
                </TabsTrigger>
              </TabsList>

              {/* Formulaire Simple */}
              <TabsContent value="simple" className="space-y-6 mt-6">
                {/* Sélection du type de créneau */}
                <div className="space-y-3">
                  <Label className="text-lg font-bold text-gray-900 dark:text-gray-100">Sélectionnez un type d'absence ou disponibilité *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Bouton Disponibilité */}
                    <Button
                      type="button"
                      variant={slotType === 'availability' ? 'default' : 'outline'}
                      size="lg"
                      className={cn(
                        "h-20 text-base font-semibold transition-all",
                        slotType === 'availability' && "bg-green-600 hover:bg-green-700 border-green-600"
                      )}
                      onClick={() => {
                        setSlotType('availability');
                        setSimpleSlot({ ...simpleSlot, consultationType: 'consultation' });
                        setRecurringSlot({ ...recurringSlot, consultationType: 'consultation' });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6" />
                        <span>Disponibilité</span>
                      </div>
                    </Button>
                    
                    {/* Bouton Absence */}
                    <Button
                      type="button"
                      variant={slotType === 'absence' ? 'default' : 'outline'}
                      size="lg"
                      className={cn(
                        "h-20 text-base font-semibold transition-all",
                        slotType === 'absence' && "bg-red-600 hover:bg-red-700 border-red-600"
                      )}
                      onClick={() => {
                        setSlotType('absence');
                        setSimpleSlot({ ...simpleSlot, consultationType: 'formation' });
                        setRecurringSlot({ ...recurringSlot, consultationType: 'formation' });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <X className="h-6 w-6" />
                        <span>Absence</span>
                      </div>
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Date *</Label>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          className={cn(
                            'w-full justify-start text-left font-normal text-base h-12 border-2',
                            !simpleSlot.date && 'text-muted-foreground',
                            simpleSlot.date && 'border-blue-500 dark:border-blue-400'
                          )}
                        >
                          <CalendarIcon className="mr-3 h-5 w-5" />
                          {simpleSlot.date ? format(simpleSlot.date, 'PPP', { locale: fr }) : 'Sélectionner une date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[100]" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={simpleSlot.date}
                          onSelect={(date) => setSimpleSlot({ ...simpleSlot, date })}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {slotType === 'availability' ? 'Type de consultation *' : 'Type d\'absence *'}
                    </Label>
                    <Select
                      value={simpleSlot.consultationType}
                      onValueChange={(value) => setSimpleSlot({ ...simpleSlot, consultationType: value })}
                    >
                      <SelectTrigger className="h-12 text-base border-2 bg-white dark:bg-gray-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-2 shadow-lg z-50">
                        {slotType === 'availability' ? (
                          consultationTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full", type.color)} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          absenceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div className="flex items-center gap-2">
                                <span>{type.icon}</span>
                                <div className={cn("w-3 h-3 rounded-full", type.color)} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Horaires
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Heure de début *</Label>
                      <Input
                        type="time"
                        value={simpleSlot.startTime}
                        onChange={(e) => setSimpleSlot({ ...simpleSlot, startTime: e.target.value })}
                        className="h-12 text-base border-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Heure de fin *</Label>
                      <Input
                        type="time"
                        value={simpleSlot.endTime}
                        onChange={(e) => setSimpleSlot({ ...simpleSlot, endTime: e.target.value })}
                        className="h-12 text-base border-2"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Durées et intervalles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Durée du créneau (minutes) *</Label>
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        value={simpleSlot.duration}
                        onChange={(e) => setSimpleSlot({ ...simpleSlot, duration: parseInt(e.target.value) })}
                        className="h-12 text-base border-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Intervalle entre rendez-vous (minutes)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="5"
                        value={simpleSlot.interval}
                        onChange={(e) => setSimpleSlot({ ...simpleSlot, interval: parseInt(e.target.value) })}
                        className="h-12 text-base border-2"
                      />
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-base text-blue-900 dark:text-blue-100 ml-2">
                    <strong>Génération automatique :</strong> Les créneaux seront créés automatiquement entre l'heure de début et de fin, 
                    avec la durée et l'intervalle spécifiés. Les conflits seront détectés et signalés.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Formulaire Récurrent */}
              <TabsContent value="recurring" className="space-y-6 mt-6">
                {/* Sélection du type de créneau */}
                <div className="space-y-3">
                  <Label className="text-lg font-bold text-gray-900 dark:text-gray-100">Sélectionnez un type d'absence ou disponibilité *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Bouton Disponibilité */}
                    <Button
                      type="button"
                      variant={slotType === 'availability' ? 'default' : 'outline'}
                      size="lg"
                      className={cn(
                        "h-20 text-base font-semibold transition-all",
                        slotType === 'availability' && "bg-green-600 hover:bg-green-700 border-green-600"
                      )}
                      onClick={() => {
                        setSlotType('availability');
                        setSimpleSlot({ ...simpleSlot, consultationType: 'consultation' });
                        setRecurringSlot({ ...recurringSlot, consultationType: 'consultation' });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6" />
                        <span>Disponibilité</span>
                      </div>
                    </Button>
                    
                    {/* Bouton Absence */}
                    <Button
                      type="button"
                      variant={slotType === 'absence' ? 'default' : 'outline'}
                      size="lg"
                      className={cn(
                        "h-20 text-base font-semibold transition-all",
                        slotType === 'absence' && "bg-red-600 hover:bg-red-700 border-red-600"
                      )}
                      onClick={() => {
                        setSlotType('absence');
                        setSimpleSlot({ ...simpleSlot, consultationType: 'formation' });
                        setRecurringSlot({ ...recurringSlot, consultationType: 'formation' });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <X className="h-6 w-6" />
                        <span>Absence</span>
                      </div>
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Date de début *</Label>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          className={cn(
                            'w-full justify-start text-left font-normal text-base h-12 border-2',
                            !recurringSlot.startDate && 'text-muted-foreground',
                            recurringSlot.startDate && 'border-blue-500 dark:border-blue-400'
                          )}
                        >
                          <CalendarIcon className="mr-3 h-5 w-5" />
                          {recurringSlot.startDate ? format(recurringSlot.startDate, 'PPP', { locale: fr }) : 'Sélectionner une date de début'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[100]" align="start" side="bottom">
                        <Calendar
                          mode="single"
                          selected={recurringSlot.startDate}
                          onSelect={(date) => setRecurringSlot({ ...recurringSlot, startDate: date })}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {slotType === 'availability' ? 'Type de consultation *' : 'Type d\'absence *'}
                    </Label>
                    <Select
                      value={recurringSlot.consultationType}
                      onValueChange={(value) => setRecurringSlot({ ...recurringSlot, consultationType: value })}
                    >
                      <SelectTrigger className="h-12 text-base border-2 bg-white dark:bg-gray-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-2 shadow-lg z-50">
                        {slotType === 'availability' ? (
                          consultationTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full", type.color)} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          absenceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div className="flex items-center gap-2">
                                <span>{type.icon}</span>
                                <div className={cn("w-3 h-3 rounded-full", type.color)} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Horaires de journée
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Heure de début *</Label>
                      <Input
                        type="time"
                        value={recurringSlot.startTime}
                        onChange={(e) => setRecurringSlot({ ...recurringSlot, startTime: e.target.value })}
                        className="h-12 text-base border-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Heure de fin *</Label>
                      <Input
                        type="time"
                        value={recurringSlot.endTime}
                        onChange={(e) => setRecurringSlot({ ...recurringSlot, endTime: e.target.value })}
                        className="h-12 text-base border-2"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Durées et intervalles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Durée du créneau (minutes) *</Label>
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        value={recurringSlot.slotDuration}
                        onChange={(e) => setRecurringSlot({ ...recurringSlot, slotDuration: parseInt(e.target.value) })}
                        className="h-12 text-base border-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">Pause entre créneaux (minutes)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="5"
                        value={recurringSlot.breakDuration}
                        onChange={(e) => setRecurringSlot({ ...recurringSlot, breakDuration: parseInt(e.target.value) })}
                        className="h-12 text-base border-2"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">Jours de la semaine *</Label>
                  <div className="flex flex-wrap gap-3">
                    {daysOfWeek.map((day) => (
                      <Badge
                        key={day.value}
                        variant={recurringSlot.selectedDays.includes(day.value) ? 'default' : 'outline'}
                        className={cn(
                          "cursor-pointer px-5 py-3 text-base font-medium transition-all hover:scale-105",
                          recurringSlot.selectedDays.includes(day.value) 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                            : 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border-2'
                        )}
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

                <Separator className="my-6" />

                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fin de la récurrence *</Label>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="end-date-checkbox"
                          checked={recurringSlot.endType === 'date'}
                          onCheckedChange={(checked) => 
                            checked && setRecurringSlot({ ...recurringSlot, endType: 'date' })
                          }
                          className="h-5 w-5"
                        />
                        <Label htmlFor="end-date-checkbox" className="text-base font-medium text-gray-900 dark:text-gray-100">Jusqu'à une date</Label>
                      </div>
                      {recurringSlot.endType === 'date' && (
                        <div className="ml-8">
                          <Popover modal={true}>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                className={cn(
                                  'w-full justify-start text-left font-normal text-base h-12 border-2',
                                  !recurringSlot.endDate && 'text-muted-foreground',
                                  recurringSlot.endDate && 'border-blue-500 dark:border-blue-400'
                                )}
                              >
                                <CalendarIcon className="mr-3 h-5 w-5" />
                                {recurringSlot.endDate ? format(recurringSlot.endDate, 'PPP', { locale: fr }) : 'Sélectionner une date de fin'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-[200]" align="start" side="top" sideOffset={5}>
                              <Calendar
                                mode="single"
                                selected={recurringSlot.endDate}
                                onSelect={(date) => {
                                  if (date) {
                                    setRecurringSlot({ ...recurringSlot, endDate: date });
                                  }
                                }}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  if (!recurringSlot.startDate) return date < today;
                                  return date < recurringSlot.startDate;
                                }}
                                initialFocus
                                fromDate={recurringSlot.startDate || new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="occurrences-checkbox"
                          checked={recurringSlot.endType === 'occurrences'}
                          onCheckedChange={(checked) => 
                            checked && setRecurringSlot({ ...recurringSlot, endType: 'occurrences' })
                          }
                          className="h-5 w-5"
                        />
                        <Label htmlFor="occurrences-checkbox" className="text-base font-medium text-gray-900 dark:text-gray-100">Après un nombre d'occurrences</Label>
                      </div>
                      {recurringSlot.endType === 'occurrences' && (
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={recurringSlot.occurrences}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setRecurringSlot({ ...recurringSlot, occurrences: Math.max(1, Math.min(100, val)) });
                          }}
                          className="ml-8 h-12 text-base border-2"
                          placeholder="Nombre d'occurrences (1-100)"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-base text-green-900 dark:text-green-100 ml-2">
                    <strong>Génération automatique :</strong> Des créneaux seront générés pour chaque jour sélectionné, 
                    entre les heures spécifiées. La récurrence se poursuivra jusqu'à la date de fin ou le nombre d'occurrences choisi.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={loading}
                size="lg"
                className="text-base"
              >
                Annuler
              </Button>
              <Button 
                onClick={handlePreview} 
                disabled={loading}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-base"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Prévisualiser
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Résumé des créneaux</h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                  Vérifiez les créneaux avant de les créer
                </p>
              </div>
              <Button variant="outline" onClick={() => setShowPreview(false)} size="lg">
                <X className="mr-2 h-5 w-5" />
                Modifier
              </Button>
            </div>

            {conflictsCount > 0 && (
              <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-base text-amber-900 dark:text-amber-100 ml-2">
                  <strong>Attention :</strong> {conflictsCount} créneau(x) en conflit détecté(s). Ces créneaux ne seront pas créés.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-base">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Total de créneaux :</span>
                    <span className="ml-2 text-blue-600 dark:text-blue-400 font-bold">{previewSlots.length}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Conflits :</span>
                    <span className={cn(
                      "ml-2 font-bold",
                      conflictsCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"
                    )}>
                      {conflictsCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="max-h-[400px] overflow-y-auto space-y-2 border-2 rounded-lg p-4">
              {previewSlots.slice(0, 50).map((slot, index) => {
                const hasConflict = checkConflicts(slot.date, slot.startTime, slot.endTime);
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border-2 text-base",
                      hasConflict 
                        ? "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800" 
                        : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {hasConflict ? (
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      )}
                      <div>
                        <div className="font-semibold">
                          {format(new Date(slot.date), 'EEEE d MMMM yyyy', { locale: fr })}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                    </div>
                    <Badge variant={hasConflict ? "destructive" : "default"}>
                      {hasConflict ? "Conflit" : "OK"}
                    </Badge>
                  </div>
                );
              })}
              {previewSlots.length > 50 && (
                <p className="text-center text-gray-600 dark:text-gray-400 text-base py-4">
                  ... et {previewSlots.length - 50} autres créneaux
                </p>
              )}
            </div>

            <DialogFooter className="gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowPreview(false)}
                size="lg"
                className="text-base"
              >
                Retour
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || previewSlots.length === 0}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-base"
              >
                {loading ? (
                  <>
                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Créer {previewSlots.length} créneau(x)
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
