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
      return response.data.data;
    },
  });

  const { data: practitioners } = useQuery<Practitioner[]>({
    queryKey: ['practitioners'],
    queryFn: async () => {
      const response = await api.get('/practitioners');
      return response.data.data;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-medical-400 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-white">MedPlan Admin</h1>
                <p className="text-sm text-gray-300">Tableau de bord administrateur</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-300">
                <UserCheck className="h-4 w-4 mr-2" />
                <span>{user?.fullName}</span>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h2>
          <p className="text-gray-600">
            Vue d'ensemble de l'activité de la clinique
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Aujourd'hui</p>
                  <p className="text-3xl font-bold text-blue-900">{todayAppointments.length}</p>
                  <p className="text-sm text-blue-600">Rendez-vous</p>
                </div>
                <Calendar className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">À venir</p>
                  <p className="text-3xl font-bold text-green-900">{upcomingAppointments.length}</p>
                  <p className="text-sm text-green-600">Rendez-vous</p>
                </div>
                <Clock className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Total</p>
                  <p className="text-3xl font-bold text-purple-900">{totalPatients}</p>
                  <p className="text-sm text-purple-600">Patients</p>
                </div>
                <Users className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-1">Praticiens</p>
                  <p className="text-3xl font-bold text-orange-900">{practitioners?.length || 0}</p>
                  <p className="text-sm text-orange-600">Actifs</p>
                </div>
                <UserCheck className="h-12 w-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="medical-card cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-medical-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Rendez-vous</h3>
              <p className="text-sm text-gray-600">Gérer les rendez-vous</p>
            </CardContent>
          </Card>

          <Card className="medical-card cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <UserCheck className="h-8 w-8 text-medical-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Praticiens</h3>
              <p className="text-sm text-gray-600">Gérer les praticiens</p>
            </CardContent>
          </Card>

          <Card className="medical-card cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-medical-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Patients</h3>
              <p className="text-sm text-gray-600">Gérer les patients</p>
            </CardContent>
          </Card>

          <Card className="medical-card cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-medical-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Statistiques</h3>
              <p className="text-sm text-gray-600">Voir les rapports</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 text-medical-600 mr-2" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 text-medical-600 mr-2" />
                Praticiens actifs
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