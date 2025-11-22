import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  User, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  UserPlus,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

interface Practitioner {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  bio?: string;
  address?: string;
  color: string;
  workingHours: WorkingHours[];
}

const daysOfWeek = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

export default function PractitionersManagement() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([
    {
      id: 1,
      name: 'Dr. Jean Dupont',
      email: 'j.dupont@example.com',
      phone: '06 45 15 63 68',
      specialty: 'Médecine générale',
      color: '#3b82f6',
      workingHours: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '16:00' },
      ],
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    bio: '',
    address: '',
    color: '#3b82f6',
  });

  const [scheduleFormData, setScheduleFormData] = useState<WorkingHours[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePractitioner = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPractitioner: Practitioner = {
      id: practitioners.length + 1,
      ...formData,
      workingHours: [],
    };

    setPractitioners(prev => [...prev, newPractitioner]);
    toast.success('Praticien créé avec succès');
    setIsCreateDialogOpen(false);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: '',
      bio: '',
      address: '',
      color: '#3b82f6',
    });
  };

  const handleEditSchedule = (practitioner: Practitioner) => {
    setSelectedPractitioner(practitioner);
    setScheduleFormData([...practitioner.workingHours]);
    setIsEditScheduleOpen(true);
  };

  const handleDayToggle = (dayOfWeek: number) => {
    const exists = scheduleFormData.find(s => s.dayOfWeek === dayOfWeek);
    
    if (exists) {
      setScheduleFormData(prev => prev.filter(s => s.dayOfWeek !== dayOfWeek));
    } else {
      setScheduleFormData(prev => [...prev, {
        dayOfWeek,
        startTime: '09:00',
        endTime: '17:00',
      }]);
    }
  };

  const handleScheduleTimeChange = (dayOfWeek: number, field: keyof WorkingHours, value: string) => {
    setScheduleFormData(prev => prev.map(s => 
      s.dayOfWeek === dayOfWeek 
        ? { ...s, [field]: value }
        : s
    ));
  };

  const handleSaveSchedule = () => {
    if (!selectedPractitioner) return;

    setPractitioners(prev => prev.map(p => 
      p.id === selectedPractitioner.id 
        ? { ...p, workingHours: scheduleFormData }
        : p
    ));

    toast.success('Horaires mis à jour avec succès');
    setIsEditScheduleOpen(false);
    setSelectedPractitioner(null);
  };

  const handleDeletePractitioner = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce praticien ?')) {
      setPractitioners(prev => prev.filter(p => p.id !== id));
      toast.success('Praticien supprimé');
    }
  };

  const getDayScheduleSummary = (workingHours: WorkingHours[]) => {
    const workingDays = workingHours.map(h => daysOfWeek.find(d => d.value === h.dayOfWeek)?.label).join(', ');
    return workingDays || 'Aucun horaire défini';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Gestion des praticiens
              </CardTitle>
              <CardDescription>
                Gérez les praticiens et leurs horaires personnalisés
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nouveau praticien
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouveau praticien</DialogTitle>
                  <DialogDescription>
                    Ajoutez un nouveau praticien à votre équipe
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePractitioner}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Dr. Jean Dupont"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Spécialité *</Label>
                        <Input
                          id="specialty"
                          name="specialty"
                          value={formData.specialty}
                          onChange={handleInputChange}
                          placeholder="Médecine générale"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="06 12 34 56 78"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="123 Rue de la Santé, 75001 Paris"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Brève présentation du praticien..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Couleur d'affichage</Label>
                      <Input
                        id="color"
                        name="color"
                        type="color"
                        value={formData.color}
                        onChange={handleInputChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        Cette couleur sera utilisée pour identifier le praticien dans le calendrier
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Créer le praticien
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {practitioners.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Aucun praticien enregistré</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Ajouter le premier praticien
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Praticien</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Horaires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practitioners.map((practitioner) => (
                  <TableRow key={practitioner.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback style={{ backgroundColor: practitioner.color }}>
                            {practitioner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{practitioner.name}</div>
                          {practitioner.address && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {practitioner.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{practitioner.specialty}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {practitioner.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {practitioner.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {getDayScheduleSummary(practitioner.workingHours)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditSchedule(practitioner)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeletePractitioner(practitioner.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour éditer les horaires */}
      <Dialog open={isEditScheduleOpen} onOpenChange={setIsEditScheduleOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Horaires de {selectedPractitioner?.name}
            </DialogTitle>
            <DialogDescription>
              Définissez les horaires de travail personnalisés pour ce praticien
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {daysOfWeek.map((day) => {
              const schedule = scheduleFormData.find(s => s.dayOfWeek === day.value);
              const isActive = !!schedule;

              return (
                <div key={day.value} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isActive}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <Label className="text-base font-semibold">{day.label}</Label>
                    </div>
                  </div>

                  {isActive && schedule && (
                    <div className="ml-9 space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Début</Label>
                          <Input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => handleScheduleTimeChange(day.value, 'startTime', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Fin</Label>
                          <Input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => handleScheduleTimeChange(day.value, 'endTime', e.target.value)}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Pause début (optionnel)</Label>
                          <Input
                            type="time"
                            value={schedule.breakStart || ''}
                            onChange={(e) => handleScheduleTimeChange(day.value, 'breakStart', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Pause fin (optionnel)</Label>
                          <Input
                            type="time"
                            value={schedule.breakEnd || ''}
                            onChange={(e) => handleScheduleTimeChange(day.value, 'breakEnd', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditScheduleOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveSchedule}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les horaires
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
