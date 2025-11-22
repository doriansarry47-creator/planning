import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Composant de gestion des disponibilités pour l'administrateur
 * Permet de créer, modifier et supprimer des créneaux de disponibilité dans Google Calendar
 */
export function AvailabilityManager() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [useRecurrence, setUseRecurrence] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>(['MO', 'TU', 'WE', 'TH', 'FR']);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours par défaut
  );

  // Mutation pour créer un créneau
  const createSlot = useMutation({
    mutationFn: trpc.availability.createSlot.mutate,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('✅ Créneaux créés avec succès!', {
          description: 'Les patients peuvent maintenant réserver ces créneaux.',
        });
        // Reset form
        setStartTime('09:00');
        setEndTime('17:00');
        setUseRecurrence(false);
      } else {
        toast.error('❌ Erreur', {
          description: data.error || 'Impossible de créer les créneaux',
        });
      }
    },
    onError: (error) => {
      toast.error('❌ Erreur', {
        description: error.message || 'Une erreur est survenue',
      });
    },
  });

  // Récupérer le résumé des disponibilités
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  
  const { data: summary } = useQuery({
    queryKey: ['availability-summary', startOfMonth.toISOString(), endOfMonth.toISOString()],
    queryFn: () =>
      trpc.availability.getAvailabilitySummary.query({
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
      }),
  });

  const handleCreateSlot = () => {
    if (!selectedDate) {
      toast.error('Veuillez sélectionner une date');
      return;
    }

    createSlot.mutate({
      date: selectedDate.toISOString(),
      startTime,
      endTime,
      title: '🟢 DISPONIBLE - Créneau libre',
      description: 'Créneau disponible pour les rendez-vous patients',
      recurrence: useRecurrence
        ? {
            frequency: recurrenceType,
            until: recurrenceEndDate.toISOString(),
            byWeekDay: recurrenceType === 'WEEKLY' ? selectedWeekDays : undefined,
          }
        : undefined,
    });
  };

  const weekDaysOptions = [
    { value: 'MO', label: 'Lundi' },
    { value: 'TU', label: 'Mardi' },
    { value: 'WE', label: 'Mercredi' },
    { value: 'TH', label: 'Jeudi' },
    { value: 'FR', label: 'Vendredi' },
    { value: 'SA', label: 'Samedi' },
    { value: 'SU', label: 'Dimanche' },
  ];

  const toggleWeekDay = (day: string) => {
    setSelectedWeekDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Gestion des Disponibilités
          </CardTitle>
          <CardDescription>
            Créez vos créneaux de disponibilité. Ils seront synchronisés avec votre Google Calendar
            et visibles par les patients pour la prise de rendez-vous.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection de date */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Sélectionner une date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={fr}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-4">
              {/* Heures */}
              <div className="space-y-2">
                <Label htmlFor="startTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Heure de début
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Heure de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              {/* Récurrence */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurrence"
                    checked={useRecurrence}
                    onCheckedChange={(checked) => setUseRecurrence(checked as boolean)}
                  />
                  <Label htmlFor="recurrence" className="cursor-pointer">
                    Répéter ces créneaux
                  </Label>
                </div>

                {useRecurrence && (
                  <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                    <div className="space-y-2">
                      <Label>Fréquence</Label>
                      <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAILY">Tous les jours</SelectItem>
                          <SelectItem value="WEEKLY">Toutes les semaines</SelectItem>
                          <SelectItem value="MONTHLY">Tous les mois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {recurrenceType === 'WEEKLY' && (
                      <div className="space-y-2">
                        <Label>Jours de la semaine</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {weekDaysOptions.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={day.value}
                                checked={selectedWeekDays.includes(day.value)}
                                onCheckedChange={() => toggleWeekDay(day.value)}
                              />
                              <Label htmlFor={day.value} className="cursor-pointer text-sm">
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Jusqu'au</Label>
                      <Calendar
                        mode="single"
                        selected={recurrenceEndDate}
                        onSelect={(date) => date && setRecurrenceEndDate(date)}
                        locale={fr}
                        disabled={(date) => date < selectedDate}
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleCreateSlot}
                disabled={createSlot.isPending}
                className="w-full"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createSlot.isPending ? 'Création...' : 'Créer les créneaux'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résumé des disponibilités */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé du mois</CardTitle>
          <CardDescription>
            {format(selectedDate, 'MMMM yyyy', { locale: fr })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary?.summary && Object.keys(summary.summary).length > 0 ? (
            <div className="grid gap-2">
              {Object.entries(summary.summary).map(([date, stats]) => (
                <div
                  key={date}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(date), 'EEEE d MMMM', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">
                      {stats.available} disponibles
                    </span>
                    <span className="text-orange-600">
                      {stats.booked} réservés
                    </span>
                    <span className="text-muted-foreground">
                      {stats.total} total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucun créneau disponible ce mois-ci
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
