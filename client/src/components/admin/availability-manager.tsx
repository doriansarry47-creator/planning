import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { 
  Plus, 
  Clock, 
  Trash2, 
  Edit, 
  Calendar as CalendarIcon,
  User,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Practitioner {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

interface TimeSlot {
  id: string;
  practitionerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface AvailabilitySlot {
  id: string;
  practitionerId: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isActive: boolean;
  notes?: string;
}

interface AvailabilityManagerProps {
  onUpdate?: () => void;
}

export function AvailabilityManager({ onUpdate }: AvailabilityManagerProps) {
  const { token } = useAuth();
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [createSlotDialog, setCreateSlotDialog] = useState(false);
  const [createRecurringDialog, setCreateRecurringDialog] = useState(false);
  
  // Form states
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: '',
    capacity: 1,
    notes: '',
  });
  
  const [newTimeSlot, setNewTimeSlot] = useState({
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
  });

  const daysOfWeek = [
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' },
    { value: 0, label: 'Dimanche' },
  ];

  useEffect(() => {
    loadPractitioners();
  }, []);

  useEffect(() => {
    if (selectedPractitioner) {
      loadPractitionerSchedule();
    }
  }, [selectedPractitioner, selectedDate]);

  const loadPractitioners = async () => {
    try {
      const data = await api.getPractitioners();
      setPractitioners(data);
    } catch (error) {
      setError('Erreur lors du chargement des praticiens');
    }
  };

  const loadPractitionerSchedule = async () => {
    if (!selectedPractitioner || !token) return;
    
    setLoading(true);
    try {
      const [timeSlotsData, availabilitySlotsData] = await Promise.all([
        api.getPractitionerTimeSlots(selectedPractitioner, token),
        api.getPractitionerAvailability(selectedPractitioner, format(selectedDate, 'yyyy-MM-dd'), token),
      ]);
      
      setTimeSlots(timeSlotsData);
      setAvailabilitySlots(availabilitySlotsData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const createAvailabilitySlot = async () => {
    if (!selectedPractitioner || !token) return;
    
    try {
      const slotData = {
        practitionerId: selectedPractitioner,
        startTime: `${format(selectedDate, 'yyyy-MM-dd')}T${newSlot.startTime}:00`,
        endTime: `${format(selectedDate, 'yyyy-MM-dd')}T${newSlot.endTime}:00`,
        capacity: newSlot.capacity,
        notes: newSlot.notes,
      };
      
      await api.createAvailabilitySlot(slotData, token);
      await loadPractitionerSchedule();
      setCreateSlotDialog(false);
      setNewSlot({ startTime: '', endTime: '', capacity: 1, notes: '' });
      
      if (onUpdate) onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const createRecurringTimeSlot = async () => {
    if (!selectedPractitioner || !token) return;
    
    try {
      const timeSlotData = {
        practitionerId: selectedPractitioner,
        dayOfWeek: newTimeSlot.dayOfWeek,
        startTime: newTimeSlot.startTime,
        endTime: newTimeSlot.endTime,
      };
      
      await api.createTimeSlot(timeSlotData, token);
      await loadPractitionerSchedule();
      setCreateRecurringDialog(false);
      setNewTimeSlot({ dayOfWeek: 1, startTime: '', endTime: '' });
      
      if (onUpdate) onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const deleteTimeSlot = async (timeSlotId: string) => {
    if (!token) return;
    
    try {
      await api.deleteTimeSlot(timeSlotId, token);
      await loadPractitionerSchedule();
      
      if (onUpdate) onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const deleteAvailabilitySlot = async (slotId: string) => {
    if (!token) return;
    
    try {
      await api.deleteAvailabilitySlot(slotId, token);
      await loadPractitionerSchedule();
      
      if (onUpdate) onUpdate();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const selectedPractitionerData = practitioners.find(p => p.id === selectedPractitioner);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sélection du praticien */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Gestion des disponibilités
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Sélectionner un praticien</Label>
              <Select value={selectedPractitioner} onValueChange={setSelectedPractitioner}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un praticien..." />
                </SelectTrigger>
                <SelectContent>
                  {practitioners.map((practitioner) => (
                    <SelectItem key={practitioner.id} value={practitioner.id}>
                      Dr. {practitioner.firstName} {practitioner.lastName} - {practitioner.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPractitionerData && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedPractitionerData.specialization}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPractitioner && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendrier et créneaux spécifiques */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Créneaux spécifiques
                </CardTitle>
                
                <Dialog open={createSlotDialog} onOpenChange={setCreateSlotDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer un créneau spécifique</DialogTitle>
                      <DialogDescription>
                        Ajoutez un créneau de disponibilité pour le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Heure de début</Label>
                          <Input
                            type="time"
                            value={newSlot.startTime}
                            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Heure de fin</Label>
                          <Input
                            type="time"
                            value={newSlot.endTime}
                            onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Capacité (nombre de patients)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newSlot.capacity}
                          onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <div>
                        <Label>Notes (optionnel)</Label>
                        <Input
                          placeholder="Notes ou informations supplémentaires..."
                          value={newSlot.notes}
                          onChange={(e) => setNewSlot({ ...newSlot, notes: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setCreateSlotDialog(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                        <Button onClick={createAvailabilitySlot}>
                          <Save className="w-4 h-4 mr-2" />
                          Créer
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={fr}
                    className="rounded-md border"
                  />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      Créneaux du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                    </h4>
                    {availabilitySlots.length > 0 ? (
                      availabilitySlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">
                                {format(new Date(slot.startTime), 'HH:mm')} - {format(new Date(slot.endTime), 'HH:mm')}
                              </span>
                              <Badge variant="outline">Capacité: {slot.capacity}</Badge>
                            </div>
                            {slot.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{slot.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteAvailabilitySlot(slot.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Aucun créneau spécifique pour cette date
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Horaires récurrents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horaires récurrents
              </CardTitle>
              
              <Dialog open={createRecurringDialog} onOpenChange={setCreateRecurringDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un horaire récurrent</DialogTitle>
                    <DialogDescription>
                      Définissez des créneaux qui se répètent chaque semaine
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Jour de la semaine</Label>
                      <Select
                        value={newTimeSlot.dayOfWeek.toString()}
                        onValueChange={(value) => setNewTimeSlot({ ...newTimeSlot, dayOfWeek: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((day) => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Heure de début</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.startTime}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Heure de fin</Label>
                        <Input
                          type="time"
                          value={newTimeSlot.endTime}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setCreateRecurringDialog(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                      <Button onClick={createRecurringTimeSlot}>
                        <Save className="w-4 h-4 mr-2" />
                        Créer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {timeSlots.length > 0 ? (
                  timeSlots.map((timeSlot) => {
                    const dayLabel = daysOfWeek.find(d => d.value === timeSlot.dayOfWeek)?.label;
                    return (
                      <div key={timeSlot.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{dayLabel}</Badge>
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {timeSlot.startTime} - {timeSlot.endTime}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteTimeSlot(timeSlot.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun horaire récurrent défini
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}