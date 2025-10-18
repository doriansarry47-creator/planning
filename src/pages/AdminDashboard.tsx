import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
  TrendingUp
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { Appointment, Practitioner, Patient } from '@/types';

export function AdminDashboard() {
  const { user, logout } = useAuth();

  // Récupérer toutes les données admin
  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments');
      // L'API retourne { success: true, data: { appointments: [], total: N } }
      const data = response.data.data || response.data;
      return data.appointments || data || [];
    },
  });

  const { data: practitioners } = useQuery<Practitioner[]>({
    queryKey: ['practitioners'],
    queryFn: async () => {
      const response = await api.get('/practitioners');
      // L'API retourne { success: true, data: [...] }
      return response.data.data || response.data || [];
    },
  });

  // Calculs des statistiques
  const todayAppointments = appointments?.filter(
    apt => apt.appointmentDate === new Date().toISOString().split('T')[0]
  ) || [];

  const upcomingAppointments = appointments?.filter(
    apt => apt.status === 'scheduled' && new Date(apt.appointmentDate) >= new Date()
  ) || [];

  const totalPatients = new Set(appointments?.map(apt => apt.patientId)).size || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-teal-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg mr-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Administration - Dorian Sarry</h1>
                <p className="text-sm text-teal-400">Tableau de bord administrateur</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
                  <p className="text-4xl font-bold text-white">{todayAppointments.length}</p>
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
                  <p className="text-4xl font-bold text-white">{upcomingAppointments.length}</p>
                  <p className="text-sm text-green-100 mt-1">Rendez-vous</p>
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
                  <p className="text-sm font-medium text-purple-100 mb-1">Total</p>
                  <p className="text-4xl font-bold text-white">{totalPatients}</p>
                  <p className="text-sm text-purple-100 mt-1">Patients</p>
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
                  <p className="text-sm font-medium text-orange-100 mb-1">Thérapeutes</p>
                  <p className="text-4xl font-bold text-white">{practitioners?.length || 0}</p>
                  <p className="text-sm text-orange-100 mt-1">Actifs</p>
                </div>
                <div className="bg-white/20 p-3 rounded-xl">
                  <UserCheck className="h-10 w-10 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-4 mt-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-teal-400" />
            Actions rapides
          </h3>
        </div>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl w-fit mx-auto mb-3">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Rendez-vous</h3>
              <p className="text-sm text-gray-600">Gérer les séances</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl w-fit mx-auto mb-3">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Thérapeutes</h3>
              <p className="text-sm text-gray-600">Gérer l'équipe</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl w-fit mx-auto mb-3">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Patients</h3>
              <p className="text-sm text-gray-600">Gérer les patients</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl w-fit mx-auto mb-3">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Statistiques</h3>
              <p className="text-sm text-gray-600">Voir les rapports</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-teal-400" />
            Vue d'ensemble des activités
          </h3>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="flex items-center text-blue-900">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                Rendez-vous d'aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.slice(0, 5).map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(appointment.startTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {appointment.status === 'scheduled' ? 'Programmé' : 'Terminé'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun rendez-vous aujourd'hui</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Practitioners */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100">
              <CardTitle className="flex items-center text-green-900">
                <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                Thérapeutes actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {practitioners && practitioners.length > 0 ? (
                <div className="space-y-4">
                  {practitioners.slice(0, 5).map((practitioner) => (
                    <div 
                      key={practitioner.id}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {practitioner.firstName} {practitioner.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {practitioner.specialization}
                        </p>
                        <p className="text-sm text-gray-500">
                          {practitioner.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Actif
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Voir tous les praticiens
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Aucun praticien enregistré</p>
                  <Button className="medical-button">
                    Ajouter un praticien
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}