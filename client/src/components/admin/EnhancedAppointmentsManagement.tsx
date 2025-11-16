import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TimerOff,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Appointment {
  id: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  practitioner: string;
  practitionerId: number;
  service: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'late' | 'completed' | 'cancelled' | 'no_show';
  consultationType: string;
  notes?: string;
  internalNotes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    patientName: 'Marie Dupont',
    patientEmail: 'marie.dupont@email.com',
    patientPhone: '06 12 34 56 78',
    practitioner: 'Dr. Sophie Bernard',
    practitionerId: 1,
    service: 'Consultation',
    date: '2025-11-20',
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    consultationType: 'consultation',
    notes: 'Première consultation',
    createdAt: '2025-11-10T10:00:00',
    updatedAt: '2025-11-10T10:00:00',
  },
  {
    id: 2,
    patientName: 'Jean Martin',
    patientEmail: 'jean.martin@email.com',
    patientPhone: '06 23 45 67 89',
    practitioner: 'Dr. Marc Dubois',
    practitionerId: 2,
    service: 'Suivi',
    date: '2025-11-21',
    startTime: '14:00',
    endTime: '15:00',
    status: 'pending',
    consultationType: 'suivi',
    createdAt: '2025-11-11T11:30:00',
    updatedAt: '2025-11-11T11:30:00',
  },
  {
    id: 3,
    patientName: 'Sophie Bernard',
    patientEmail: 'sophie.bernard@email.com',
    patientPhone: '06 34 56 78 90',
    practitioner: 'Dr. Sophie Bernard',
    practitionerId: 1,
    service: 'Thérapie',
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '11:00',
    status: 'completed',
    consultationType: 'groupe',
    notes: 'Séance de groupe réussie',
    createdAt: '2025-11-01T09:00:00',
    updatedAt: '2025-11-15T11:00:00',
  },
  {
    id: 4,
    patientName: 'Pierre Durand',
    patientEmail: 'pierre.durand@email.com',
    patientPhone: '06 45 67 89 01',
    practitioner: 'Dr. Marc Dubois',
    practitionerId: 2,
    service: 'Consultation',
    date: '2025-11-18',
    startTime: '16:00',
    endTime: '17:00',
    status: 'cancelled',
    consultationType: 'urgent',
    cancellationReason: 'Patient malade',
    createdAt: '2025-11-12T14:00:00',
    updatedAt: '2025-11-17T18:00:00',
  },
  {
    id: 5,
    patientName: 'Claire Petit',
    patientEmail: 'claire.petit@email.com',
    patientPhone: '06 56 78 90 12',
    practitioner: 'Dr. Sophie Bernard',
    practitionerId: 1,
    service: 'Consultation',
    date: '2025-11-19',
    startTime: '09:00',
    endTime: '10:00',
    status: 'no_show',
    consultationType: 'premiere',
    internalNotes: 'Patient non venu sans prévenir',
    createdAt: '2025-11-13T15:00:00',
    updatedAt: '2025-11-19T10:30:00',
  },
];

const STATUS_CONFIG = {
  pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
  confirmed: { label: 'Confirmé', variant: 'default' as const, icon: CheckCircle2 },
  in_progress: { label: 'En cours', variant: 'default' as const, icon: Clock },
  late: { label: 'En retard', variant: 'destructive' as const, icon: AlertCircle },
  completed: { label: 'Terminé', variant: 'secondary' as const, icon: CheckCircle2 },
  cancelled: { label: 'Annulé', variant: 'destructive' as const, icon: XCircle },
  no_show: { label: 'Non honoré', variant: 'outline' as const, icon: TimerOff },
};

const CANCELLATION_REASONS = [
  'Patient malade',
  'Empêchement personnel',
  'Problème de transport',
  'Urgence familiale',
  'Erreur de réservation',
  'Praticien indisponible',
  'Conditions météorologiques',
  'Autre',
];

export default function EnhancedAppointmentsManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [customCancellationReason, setCustomCancellationReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrer les rendez-vous
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      searchTerm === '' ||
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientPhone.includes(searchTerm);

    const matchesStatus = selectedStatus === 'all' || apt.status === selectedStatus;
    const matchesPractitioner =
      selectedPractitioner === 'all' || String(apt.practitionerId) === selectedPractitioner;
    const matchesDate = selectedDate === '' || apt.date === selectedDate;

    return matchesSearch && matchesStatus && matchesPractitioner && matchesDate;
  });

  // Statistiques
  const stats = {
    total: appointments.length,
    today: appointments.filter((apt) => isSameDay(parseISO(apt.date), new Date())).length,
    pending: appointments.filter((apt) => apt.status === 'pending').length,
    confirmed: appointments.filter((apt) => apt.status === 'confirmed').length,
    completed: appointments.filter((apt) => apt.status === 'completed').length,
    cancelled: appointments.filter((apt) => apt.status === 'cancelled').length,
    noShow: appointments.filter((apt) => apt.status === 'no_show').length,
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    setIsUpdating(true);
    try {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? {
                ...apt,
                status: newStatus as Appointment['status'],
                updatedAt: new Date().toISOString(),
              }
            : apt
        )
      );

      toast.success(`Statut mis à jour: ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG].label}`);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancellationReason('');
    setCustomCancellationReason('');
    setIsCancelDialogOpen(true);
  };

  const confirmCancelAppointment = async () => {
    if (!selectedAppointment) return;

    const reason = cancellationReason === 'Autre' ? customCancellationReason : cancellationReason;

    if (!reason) {
      toast.error('Veuillez sélectionner ou saisir un motif d\'annulation');
      return;
    }

    try {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? {
                ...apt,
                status: 'cancelled',
                cancellationReason: reason,
                updatedAt: new Date().toISOString(),
              }
            : apt
        )
      );

      toast.success('Rendez-vous annulé avec succès');
      setIsCancelDialogOpen(false);
      setSelectedAppointment(null);
      
      // TODO: Envoyer une notification au patient
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    // Ne permettre la suppression que des rendez-vous annulés
    if (apt.status !== 'cancelled') {
      toast.error('Seuls les rendez-vous annulés peuvent être supprimés');
      return;
    }

    try {
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
      toast.success('Rendez-vous supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleCreateAppointment = () => {
    toast.info('Fonctionnalité de création manuelle en cours de développement');
    // TODO: Implémenter la création manuelle de rendez-vous
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedPractitioner('all');
    setSelectedDate('');
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Rendez-vous</CardTitle>
              <CardDescription>
                Créer, modifier et gérer tous les rendez-vous du cabinet
              </CardDescription>
            </div>
            <Button onClick={handleCreateAppointment}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Rendez-vous
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
            <p className="text-xs text-muted-foreground">Aujourd'hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">Confirmés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Terminés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Annulés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.noShow}</div>
            <p className="text-xs text-muted-foreground">Non honorés</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Barre de recherche */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
            </div>

            {/* Filtres avancés */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="confirmed">Confirmé</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="late">En retard</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                      <SelectItem value="no_show">Non honoré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Praticien</Label>
                  <Select value={selectedPractitioner} onValueChange={setSelectedPractitioner}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les praticiens" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les praticiens</SelectItem>
                      <SelectItem value="1">Dr. Sophie Bernard</SelectItem>
                      <SelectItem value="2">Dr. Marc Dubois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des rendez-vous */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Praticien</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucun rendez-vous trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((apt) => (
                  <TableRow
                    key={apt.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewDetails(apt)}
                  >
                    <TableCell className="font-medium">
                      {format(parseISO(apt.date), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {apt.startTime} - {apt.endTime}
                    </TableCell>
                    <TableCell>{apt.patientName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{apt.patientPhone}</div>
                    </TableCell>
                    <TableCell>{apt.practitioner}</TableCell>
                    <TableCell>{apt.service}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(apt)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Détails
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {apt.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(apt.id, 'confirmed')}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              Confirmer
                            </DropdownMenuItem>
                          )}
                          {(apt.status === 'pending' || apt.status === 'confirmed') && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(apt.id, 'in_progress')}
                              >
                                <Clock className="mr-2 h-4 w-4 text-blue-600" />
                                En cours
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(apt.id, 'completed')}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4 text-gray-600" />
                                Terminer
                              </DropdownMenuItem>
                            </>
                          )}
                          {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleCancelAppointment(apt)}
                                className="text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Annuler
                              </DropdownMenuItem>
                            </>
                          )}
                          {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(apt.id, 'no_show')}
                              className="text-destructive"
                            >
                              <TimerOff className="mr-2 h-4 w-4" />
                              Marquer non honoré
                            </DropdownMenuItem>
                          )}
                          {apt.status === 'cancelled' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteAppointment(apt.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog détails du rendez-vous */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle>Détails du Rendez-vous</DialogTitle>
                <DialogDescription>
                  Rendez-vous créé le{' '}
                  {format(parseISO(selectedAppointment.createdAt), 'dd MMMM yyyy à HH:mm', {
                    locale: fr,
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Statut */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-muted-foreground">Statut actuel</Label>
                    <div className="mt-2">{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                  {selectedAppointment.status !== 'completed' &&
                    selectedAppointment.status !== 'cancelled' && (
                      <Select
                        value={selectedAppointment.status}
                        onValueChange={(value) => handleStatusChange(selectedAppointment.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="confirmed">Confirmé</SelectItem>
                          <SelectItem value="in_progress">En cours</SelectItem>
                          <SelectItem value="late">En retard</SelectItem>
                          <SelectItem value="completed">Terminé</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                </div>

                {/* Informations patient */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Informations Patient</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedAppointment.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedAppointment.patientEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedAppointment.patientPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Informations rendez-vous */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Détails du Rendez-vous</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Date</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(parseISO(selectedAppointment.date), 'EEEE dd MMMM yyyy', {
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Horaire</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {selectedAppointment.startTime} - {selectedAppointment.endTime}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Praticien</Label>
                      <p className="mt-1">{selectedAppointment.practitioner}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Service</Label>
                      <p className="mt-1">{selectedAppointment.service}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedAppointment.notes && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Notes du patient</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{selectedAppointment.notes}</p>
                    </div>
                  </div>
                )}

                {selectedAppointment.internalNotes && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes internes
                    </Label>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">{selectedAppointment.internalNotes}</p>
                    </div>
                  </div>
                )}

                {selectedAppointment.cancellationReason && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      Motif d'annulation
                    </Label>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        {selectedAppointment.cancellationReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Fermer
                </Button>
                {selectedAppointment.status !== 'cancelled' &&
                  selectedAppointment.status !== 'completed' && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsDetailsDialogOpen(false);
                        handleCancelAppointment(selectedAppointment);
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Annuler le rendez-vous
                    </Button>
                  )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'annulation avec motif */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler le rendez-vous</AlertDialogTitle>
            <AlertDialogDescription>
              Veuillez sélectionner ou saisir un motif d'annulation. Une notification sera envoyée au
              patient.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motif d'annulation *</Label>
              <Select value={cancellationReason} onValueChange={setCancellationReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un motif" />
                </SelectTrigger>
                <SelectContent>
                  {CANCELLATION_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cancellationReason === 'Autre' && (
              <div className="space-y-2">
                <Label>Préciser le motif *</Label>
                <Textarea
                  placeholder="Détails de l'annulation..."
                  value={customCancellationReason}
                  onChange={(e) => setCustomCancellationReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
