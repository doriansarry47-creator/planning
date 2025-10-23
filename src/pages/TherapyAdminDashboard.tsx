import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  LogOut, 
  Heart,
  BarChart3,
  Settings,
  Clock,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';

// Types
interface Appointment {
  id: string;
  patientId: string;
  date: string;
  startTime?: string;
  duration: number;
  status: string;
  type: string;
  reason: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  preferredSessionType?: string;
  createdAt: string;
}

interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalPatients: number;
  newPatientsThisMonth: number;
  cabinetSessions: number;
  visioSessions: number;
}

export function TherapyAdminDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  // Récupérer les rendez-vous
  const { data: appointments, isLoading: loadingAppointments, refetch: refetchAppointments } = useQuery<Appointment[]>({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments');
      const data = response.data.data || response.data;
      return data.appointments || data || [];
    },
  });

  // Récupérer les patients
  const { data: patients, isLoading: loadingPatients } = useQuery<Patient[]>({
    queryKey: ['admin-patients'],
    queryFn: async () => {
      const response = await api.get('/patients');
      const data = response.data.data || response.data;
      return data.patients || data || [];
    },
  });

  // Calcul des statistiques avec useMemo pour optimisation
  const stats = useMemo<DashboardStats>(() => {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const todayAppointments = appointments?.filter(apt => apt.date === today) || [];
    const upcomingAppointments = appointments?.filter(
      apt => apt.status === 'pending' && new Date(apt.date) >= new Date()
    ) || [];
    const completedAppointments = appointments?.filter(apt => apt.status === 'completed') || [];
    const cancelledAppointments = appointments?.filter(apt => apt.status === 'cancelled') || [];
    
    const newPatientsThisMonth = patients?.filter(
      p => p.createdAt && p.createdAt >= firstDayOfMonth
    ).length || 0;

    const cabinetSessions = appointments?.filter(apt => apt.type === 'cabinet').length || 0;
    const visioSessions = appointments?.filter(apt => apt.type === 'visio').length || 0;

    return {
      totalAppointments: appointments?.length || 0,
      todayAppointments: todayAppointments.length,
      upcomingAppointments: upcomingAppointments.length,
      completedAppointments: completedAppointments.length,
      cancelledAppointments: cancelledAppointments.length,
      totalPatients: patients?.length || 0,
      newPatientsThisMonth,
      cabinetSessions,
      visioSessions,
    };
  }, [appointments, patients]);

  // Filtrage des rendez-vous
  const filteredAppointments = useMemo(() => {
    let filtered = appointments || [];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    if (filterDate === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(apt => apt.date === today);
    } else if (filterDate === 'upcoming') {
      filtered = filtered.filter(apt => new Date(apt.date) >= new Date());
    } else if (filterDate === 'past') {
      filtered = filtered.filter(apt => new Date(apt.date) < new Date());
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, filterStatus, filterDate]);

  // Mutation pour mettre à jour le statut d'un rendez-vous
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/appointments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-teal-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg mr-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Administration - Dorian Sarry</h1>
                <p className="text-sm text-teal-400">Thérapie Sensorimotrice</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  refetchAppointments();
                  queryClient.invalidateQueries({ queryKey: ['admin-patients'] });
                }}
                className="flex items-center text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <div className="flex items-center text-sm text-gray-300">
                <UserCheck className="h-4 w-4 mr-2" />
                <span>{user?.email || user?.name || 'Admin'}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="flex items-center text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent mb-2">
            Tableau de bord administrateur
          </h2>
          <p className="text-gray-700 font-medium">
            🩺 Vue d'ensemble de votre pratique thérapeutique
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center text-green-700">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center text-blue-700">
              <Activity className="h-4 w-4 mr-2" />
              {stats.totalAppointments} rendez-vous au total
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-teal-400" />
            Statistiques en temps réel
          </h3>
        </div>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100 mb-1">Aujourd'hui</p>
                  <p className="text-4xl font-bold text-white">{stats.todayAppointments}</p>
                  <p className="text-sm text-blue-100 mt-1">Rendez-vous</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100 mb-1">À venir</p>
                  <p className="text-4xl font-bold text-white">{stats.upcomingAppointments}</p>
                  <p className="text-sm text-green-100 mt-1">Programmés</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Clock className="h-10 w-10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100 mb-1">Patients</p>
                  <p className="text-4xl font-bold text-white">{stats.totalPatients}</p>
                  <p className="text-sm text-purple-100 mt-1">+{stats.newPatientsThisMonth} ce mois</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <Users className="h-10 w-10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-100 mb-1">Terminés</p>
                  <p className="text-4xl font-bold text-white">{stats.completedAppointments}</p>
                  <p className="text-sm text-orange-100 mt-1">Consultations</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Types Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Séances en cabinet</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.cabinetSessions}</p>
                </div>
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-3 rounded-xl">
                  <Activity className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Séances en visio</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.visioSessions}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                  <Activity className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-teal-400" />
            Gestion des rendez-vous
          </h3>
        </div>

        {/* Filters */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filtres:</span>
              </div>
              
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmés</option>
                <option value="completed">Terminés</option>
                <option value="cancelled">Annulés</option>
              </select>

              <select 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="upcoming">À venir</option>
                <option value="past">Passés</option>
              </select>

              <Button variant="outline" size="sm" className="ml-auto">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-100">
            <CardTitle className="flex items-center text-teal-900">
              <Calendar className="h-5 w-5 text-teal-600 mr-2" />
              Liste des rendez-vous ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAppointments ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des rendez-vous...</p>
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motif</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(appointment.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{appointment.patient?.email}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appointment.type === 'cabinet' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {appointment.type === 'cabinet' ? 'Cabinet' : 'Visio'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {appointment.reason}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {appointment.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateAppointmentMutation.mutate({ id: appointment.id, status: 'confirmed' })}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateAppointmentMutation.mutate({ id: appointment.id, status: 'cancelled' })}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun rendez-vous trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
