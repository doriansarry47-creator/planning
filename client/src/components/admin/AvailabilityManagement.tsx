import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Trash2, Edit, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  capacity: number;
}

export default function AvailabilityManagement() {
  const [slots, setSlots] = useState<TimeSlot[]>([
    {
      id: 1,
      date: '2025-11-15',
      startTime: '09:00',
      endTime: '10:00',
      isBooked: false,
      capacity: 1
    },
    {
      id: 2,
      date: '2025-11-15',
      startTime: '10:00',
      endTime: '11:00',
      isBooked: true,
      capacity: 1
    },
    {
      id: 3,
      date: '2025-11-15',
      startTime: '14:00',
      endTime: '15:00',
      isBooked: false,
      capacity: 1
    },
    {
      id: 4,
      date: '2025-11-16',
      startTime: '09:00',
      endTime: '10:00',
      isBooked: false,
      capacity: 1
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    capacity: 1
  });

  const handleCreateSlot = async () => {
    try {
      // Validation
      if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }

      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));

      const newSlotData: TimeSlot = {
        id: slots.length + 1,
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        isBooked: false,
        capacity: newSlot.capacity
      };

      setSlots(prev => [...prev, newSlotData]);
      toast.success('Créneau créé avec succès');
      setIsDialogOpen(false);
      setNewSlot({ date: '', startTime: '', endTime: '', capacity: 1 });
    } catch (error) {
      toast.error('Erreur lors de la création du créneau');
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    try {
      const slot = slots.find(s => s.id === slotId);
      
      if (slot?.isBooked) {
        toast.error('Impossible de supprimer un créneau réservé');
        return;
      }

      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));

      setSlots(prev => prev.filter(s => s.id !== slotId));
      toast.success('Créneau supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du créneau');
    }
  };

  const handleGenerateWeekSlots = async () => {
    try {
      toast.info('Génération des créneaux de la semaine...');
      
      // Simuler la génération de créneaux pour une semaine
      const startDate = new Date();
      const newSlots: TimeSlot[] = [];
      
      // Générer créneaux du lundi au vendredi, 9h-17h
      for (let day = 0; day < 5; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);
        
        const dateStr = date.toISOString().split('T')[0];
        
        // Créneaux du matin: 9h-12h
        for (let hour = 9; hour < 12; hour++) {
          newSlots.push({
            id: slots.length + newSlots.length + 1,
            date: dateStr,
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
            isBooked: false,
            capacity: 1
          });
        }
        
        // Créneaux de l'après-midi: 14h-17h
        for (let hour = 14; hour < 17; hour++) {
          newSlots.push({
            id: slots.length + newSlots.length + 1,
            date: dateStr,
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
            isBooked: false,
            capacity: 1
          });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSlots(prev => [...prev, ...newSlots]);
      toast.success(`${newSlots.length} créneaux générés avec succès`);
    } catch (error) {
      toast.error('Erreur lors de la génération des créneaux');
    }
  };

  const availableSlots = slots.filter(s => !s.isBooked).length;
  const bookedSlots = slots.filter(s => s.isBooked).length;

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Créneaux disponibles</p>
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
                <p className="text-sm font-medium text-muted-foreground">Créneaux réservés</p>
                <p className="text-2xl font-bold">{bookedSlots}</p>
              </div>
              <XCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total créneaux</p>
                <p className="text-2xl font-bold">{slots.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestion des créneaux */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des disponibilités</CardTitle>
              <CardDescription>
                Créez et gérez vos créneaux de disponibilité
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerateWeekSlots}>
                <Calendar className="mr-2 h-4 w-4" />
                Générer la semaine
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau créneau
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau créneau</DialogTitle>
                    <DialogDescription>
                      Ajoutez un créneau de disponibilité
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newSlot.date}
                        onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Heure de début</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={newSlot.startTime}
                          onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">Heure de fin</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={newSlot.endTime}
                          onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacité</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        value={newSlot.capacity}
                        onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateSlot}>
                      Créer le créneau
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure de début</TableHead>
                  <TableHead>Heure de fin</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Clock className="h-8 w-8" />
                        <p>Aucun créneau disponible</p>
                        <p className="text-sm">Créez votre premier créneau pour commencer</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  slots.map((slot) => {
                    const duration = (new Date(`2000-01-01T${slot.endTime}`) - new Date(`2000-01-01T${slot.startTime}`) as any) / (1000 * 60);
                    
                    return (
                      <TableRow key={slot.id}>
                        <TableCell>
                          {new Date(slot.date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>{slot.startTime}</TableCell>
                        <TableCell>{slot.endTime}</TableCell>
                        <TableCell>{duration} min</TableCell>
                        <TableCell>
                          <Badge variant={slot.isBooked ? 'secondary' : 'default'}>
                            {slot.isBooked ? 'Réservé' : 'Disponible'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={slot.isBooked}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
