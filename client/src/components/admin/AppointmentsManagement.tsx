import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Calendar, Clock, User, Phone, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  id: number;
  patientName: string;
  patientEmail: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
}

export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      patientName: 'Marie Dupont',
      patientEmail: 'marie.dupont@email.com',
      date: '2025-11-15',
      time: '09:00',
      status: 'scheduled',
      reason: 'Consultation initiale'
    },
    {
      id: 2,
      patientName: 'Jean Martin',
      patientEmail: 'jean.martin@email.com',
      date: '2025-11-15',
      time: '10:00',
      status: 'scheduled',
      reason: 'Suivi thérapeutique'
    },
    {
      id: 3,
      patientName: 'Sophie Bernard',
      patientEmail: 'sophie.bernard@email.com',
      date: '2025-11-14',
      time: '14:00',
      status: 'completed',
      reason: 'Thérapie sensorimotrice'
    }
  ]);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Programmé', variant: 'default' as const },
      completed: { label: 'Complété', variant: 'secondary' as const },
      cancelled: { label: 'Annulé', variant: 'destructive' as const },
      no_show: { label: 'Absent', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    setIsUpdating(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await fetch('/api/trpc/admin.updateAppointmentStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            appointmentId,
            status: newStatus,
          }
        }),
      });

      if (response.ok) {
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId
              ? { ...apt, status: newStatus as typeof apt.status }
              : apt
          )
        );
        toast.success('Statut du rendez-vous mis à jour');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    selectedStatus === 'all' ? true : apt.status === selectedStatus
  );

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today && apt.status === 'scheduled';
  }).length;

  const upcomingAppointments = appointments.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.date);
    return aptDate > today && apt.status === 'scheduled';
  }).length;

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold">{todayAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">À venir</p>
                <p className="text-2xl font-bold">{upcomingAppointments}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des rendez-vous */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des rendez-vous</CardTitle>
              <CardDescription>
                Consultez et gérez tous les rendez-vous du système
              </CardDescription>
            </div>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Nouveau rendez-vous
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filtrer par statut:</span>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="scheduled">Programmé</SelectItem>
                  <SelectItem value="completed">Complété</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="no_show">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredAppointments.length} rendez-vous trouvé(s)
            </div>
          </div>

          {/* Tableau */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-8 w-8" />
                        <p>Aucun rendez-vous trouvé</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{apt.patientName}</p>
                          <p className="text-sm text-muted-foreground">{apt.patientEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(apt.date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{apt.time}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {apt.reason || '-'}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(apt.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={apt.status}
                          onValueChange={(value) => handleStatusChange(apt.id, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Programmé</SelectItem>
                            <SelectItem value="completed">Complété</SelectItem>
                            <SelectItem value="cancelled">Annulé</SelectItem>
                            <SelectItem value="no_show">Absent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
