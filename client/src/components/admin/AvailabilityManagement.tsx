import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  CalendarX,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import EnhancedCalendar, { CalendarSlot } from './EnhancedCalendar';
import SlotCreationDialog, { SlotData } from './SlotCreationDialog';
import GoogleCalendarSettings from './GoogleCalendarSettings';

interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'cancelled';
  capacity: number;
  patientName?: string;
  consultationType?: string;
  notes?: string;
}

export default function AvailabilityManagement() {
  const { user } = useAuth();
  const utils = trpc.useContext();
  
  // TODO: Dans une version production, récupérer le practitionerId depuis l'utilisateur connecté ou un sélecteur
  const currentPractitionerId = 1;
  
  // Récupérer les créneaux depuis la base de données
  const { data: slotsFromDb, isLoading } = trpc.availabilitySlots.listByPractitioner.useQuery(
    currentPractitionerId,
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
  
  // Mutations tRPC
  const createSlotMutation = trpc.availabilitySlots.create.useMutation({
    onSuccess: () => {
      utils.availabilitySlots.listByPractitioner.invalidate();
    },
    onError: (error) => {
      toast.error('Erreur lors de la création: ' + error.message);
    },
  });
  
  const updateSlotMutation = trpc.availabilitySlots.update.useMutation({
    onSuccess: () => {
      utils.availabilitySlots.listByPractitioner.invalidate();
      toast.success('Créneau mis à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour: ' + error.message);
    },
  });
  
  const deleteSlotMutation = trpc.availabilitySlots.delete.useMutation({
    onSuccess: () => {
      utils.availabilitySlots.listByPractitioner.invalidate();
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression: ' + error.message);
    },
  });
  
  // État local pour l'interface (synchronisé avec la DB)
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  
  // Synchroniser les données de la DB avec l'état local
  useEffect(() => {
    if (slotsFromDb && slotsFromDb.length > 0) {
      const convertedSlots = slotsFromDb.map((slot: any) => {
        const startDate = new Date(slot.startTime);
        const endDate = new Date(slot.endTime);
        
        return {
          id: slot.id,
          date: startDate.toISOString().split('T')[0],
          startTime: startDate.toTimeString().slice(0, 5),
          endTime: endDate.toTimeString().slice(0, 5),
          status: slot.isActive ? 'available' : 'cancelled',
          capacity: slot.capacity || 1,
          notes: slot.notes,
        };
      });
      
      setSlots(convertedSlots);
    } else if (slotsFromDb && slotsFromDb.length === 0) {
      // Aucun créneau dans la DB
      setSlots([]);
    }
  }, [slotsFromDb]);

  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<TimeSlot | null>(null);

  // Convertir les slots en événements du calendrier
  const calendarEvents: CalendarSlot[] = useMemo(() => {
    return slots.map(slot => {
      const startDate = new Date(`${slot.date}T${slot.startTime}`);
      const endDate = new Date(`${slot.date}T${slot.endTime}`);

      let title = '';
      if (slot.status === 'booked' && slot.patientName) {
        title = slot.patientName;
      } else if (slot.status === 'cancelled') {
        title = 'Annulé';
      } else {
        title = 'Disponible';
      }

      return {
        id: slot.id,
        title,
        start: startDate,
        end: endDate,
        status: slot.status,
        patientName: slot.patientName,
        consultationType: slot.consultationType,
        notes: slot.notes,
      };
    });
  }, [slots]);

  // Créer des créneaux (avec appel API)
  const handleCreateSlots = async (slotsData: SlotData[]) => {
    try {
      setIsCreationDialogOpen(false);
      toast.loading(`Création de ${slotsData.length} créneau(x)...`, { id: 'creating-slots' });
      
      // Créer chaque créneau dans la base de données
      await Promise.all(
        slotsData.map(async (slotData) => {
          const startDateTime = new Date(`${slotData.date}T${slotData.startTime}:00`);
          const endDateTime = new Date(`${slotData.date}T${slotData.endTime}:00`);
          
          return createSlotMutation.mutateAsync({
            practitionerId: currentPractitionerId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            capacity: 1,
            isActive: true,
            notes: slotData.consultationType || undefined,
          });
        })
      );
      
      toast.dismiss('creating-slots');
      toast.success(`${slotsData.length} créneau(x) créé(s) avec succès`);
    } catch (error) {
      toast.dismiss('creating-slots');
      console.error('Erreur création créneaux:', error);
      toast.error('Erreur lors de la création des créneaux');
      throw error;
    }
  };

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>();
  const [selectedCalendarTime, setSelectedCalendarTime] = useState<{ start: string; end: string } | undefined>();

  // Sélectionner un créneau dans le calendrier
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedCalendarDate(slotInfo.start);
    // Extraire les horaires de début et fin
    const startTime = `${slotInfo.start.getHours().toString().padStart(2, '0')}:${slotInfo.start.getMinutes().toString().padStart(2, '0')}`;
    const endTime = `${slotInfo.end.getHours().toString().padStart(2, '0')}:${slotInfo.end.getMinutes().toString().padStart(2, '0')}`;
    setSelectedCalendarTime({ start: startTime, end: endTime });
    setIsCreationDialogOpen(true);
  };

  // Sélectionner un événement dans le calendrier
  const handleSelectEvent = (event: CalendarSlot) => {
    const slot = slots.find(s => s.id === event.id);
    if (slot) {
      setSelectedSlot(slot);
    }
  };

  // Déplacer un créneau (drag & drop)
  const handleEventDrop = async ({ event, start, end }: { event: CalendarSlot; start: Date; end: Date }) => {
    try {
      const slot = slots.find(s => s.id === event.id);
      if (!slot) return;

      if (slot.status === 'booked') {
        toast.error('Impossible de déplacer un créneau réservé');
        return;
      }

      // Vérifier les conflits
      const newDate = start.toISOString().split('T')[0];
      const newStartTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
      const newEndTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

      const hasConflict = slots.some(s => 
        s.id !== slot.id && 
        s.date === newDate &&
        s.startTime < newEndTime && 
        s.endTime > newStartTime
      );

      if (hasConflict) {
        toast.error('Conflit détecté : un créneau existe déjà à cette période');
        return;
      }

      // Mettre à jour le créneau dans la base de données
      const startDateTime = new Date(`${newDate}T${newStartTime}:00`);
      const endDateTime = new Date(`${newDate}T${newEndTime}:00`);
      
      await updateSlotMutation.mutateAsync({
        id: slot.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });
    } catch (error) {
      toast.error('Erreur lors du déplacement du créneau');
    }
  };

  // Redimensionner un créneau
  const handleEventResize = async ({ event, start, end }: { event: CalendarSlot; start: Date; end: Date }) => {
    try {
      const slot = slots.find(s => s.id === event.id);
      if (!slot) return;

      if (slot.status === 'booked') {
        toast.error('Impossible de redimensionner un créneau réservé');
        return;
      }

      const newStartTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
      const newEndTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

      // Vérifier les conflits
      const hasConflict = slots.some(s => 
        s.id !== slot.id && 
        s.date === slot.date &&
        s.startTime < newEndTime && 
        s.endTime > newStartTime
      );

      if (hasConflict) {
        toast.error('Conflit détecté : un créneau existe déjà à cette période');
        return;
      }

      // Mettre à jour le créneau dans la base de données
      const startDateTime = new Date(`${slot.date}T${newStartTime}:00`);
      const endDateTime = new Date(`${slot.date}T${newEndTime}:00`);
      
      await updateSlotMutation.mutateAsync({
        id: slot.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  // Supprimer un créneau
  const handleDeleteSlot = async (slot: TimeSlot) => {
    if (slot.status === 'booked') {
      toast.error('Impossible de supprimer un créneau réservé');
      return;
    }

    setSlotToDelete(slot);
  };

  const confirmDeleteSlot = async () => {
    if (!slotToDelete) return;

    try {
      await deleteSlotMutation.mutateAsync(slotToDelete.id);
      toast.success('Créneau supprimé avec succès');
      setSlotToDelete(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      // L'erreur est déjà affichée par la mutation
    }
  };

  // Annuler un créneau
  const handleCancelSlot = async (slot: TimeSlot) => {
    try {
      setSlots(prev => prev.map(s => 
        s.id === slot.id 
          ? { ...s, status: 'cancelled' as const }
          : s
      ));
      toast.success('Créneau annulé');
      setSelectedSlot(null);
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  // Supprimer les créneaux annulés
  const handleDeleteCancelledSlots = async () => {
    try {
      const cancelledCount = slots.filter(s => s.status === 'cancelled').length;
      if (cancelledCount === 0) {
        toast.info('Aucun créneau annulé à supprimer');
        return;
      }
      
      setSlots(prev => prev.filter(s => s.status !== 'cancelled'));
      toast.success(`${cancelledCount} créneau(x) annulé(s) supprimé(s)`);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const availableSlots = slots.filter(s => s.status === 'available').length;
  const bookedSlots = slots.filter(s => s.status === 'booked').length;
  const cancelledSlots = slots.filter(s => s.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold">{availableSlots}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Réservés</p>
                <p className="text-2xl font-bold">{bookedSlots}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Annulés</p>
                <p className="text-2xl font-bold">{cancelledSlots}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{slots.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Gérez vos créneaux et synchronisez avec Google Calendar</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsCreationDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau créneau
              </Button>
              {cancelledSlots > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteCancelledSlots}
                >
                  <CalendarX className="mr-2 h-4 w-4" />
                  Supprimer les annulés ({cancelledSlots})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Panneau Google Calendar */}
      <GoogleCalendarSettings slots={slots} />

      {/* Calendrier amélioré */}
      <EnhancedCalendar
        slots={calendarEvents}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
      />

      {/* Dialog de création de créneaux */}
      <SlotCreationDialog
        open={isCreationDialogOpen}
        onOpenChange={setIsCreationDialogOpen}
        onCreateSlots={handleCreateSlots}
        existingSlots={slots}
        selectedDate={selectedCalendarDate}
        selectedTime={selectedCalendarTime}
      />

      {/* Dialog de détails du créneau sélectionné */}
      {selectedSlot && (
        <AlertDialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Détails du créneau</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{new Date(selectedSlot.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Horaire:</span>
                    <span>{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{selectedSlot.consultationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Statut:</span>
                    <Badge variant={
                      selectedSlot.status === 'available' ? 'default' :
                      selectedSlot.status === 'booked' ? 'secondary' : 'destructive'
                    }>
                      {selectedSlot.status === 'available' && 'Disponible'}
                      {selectedSlot.status === 'booked' && 'Réservé'}
                      {selectedSlot.status === 'cancelled' && 'Annulé'}
                    </Badge>
                  </div>
                  {selectedSlot.patientName && (
                    <div className="flex justify-between">
                      <span className="font-medium">Patient:</span>
                      <span>{selectedSlot.patientName}</span>
                    </div>
                  )}
                  {selectedSlot.notes && (
                    <div>
                      <span className="font-medium">Notes:</span>
                      <p className="text-sm text-muted-foreground mt-1">{selectedSlot.notes}</p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {selectedSlot.status === 'available' && (
                <AlertDialogAction 
                  onClick={() => handleDeleteSlot(selectedSlot)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </AlertDialogAction>
              )}
              {selectedSlot.status === 'booked' && (
                <AlertDialogAction 
                  onClick={() => handleCancelSlot(selectedSlot)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Annuler le rendez-vous
                </AlertDialogAction>
              )}
              <AlertDialogCancel>Fermer</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!slotToDelete} onOpenChange={() => setSlotToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce créneau ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSlot}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
