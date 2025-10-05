import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  User, 
  LogOut, 
  Plus,
  Heart,
  FileText,
  Settings
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { Appointment } from '@/types';

export function PatientDashboard() {
  const { user, logout } = useAuth();

  // Récupérer les rendez-vous du patient
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments');
      return response.data.data;
    },
  });

  const upcomingAppointments = appointments?.filter(
    apt => apt.status === 'scheduled' && new Date(apt.appointmentDate) >= new Date()
  ) || [];

  const pastAppointments = appointments?.filter(
    apt => apt.status === 'completed' || new Date(apt.appointmentDate) < new Date()
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-medical-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">MedPlan</h1>
                <p className="text-sm text-gray-600">Espace Patient</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="h-4 w-4 mr-2" />
                <span>{user?.firstName} {user?.lastName}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="flex items-center"
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
            Bonjour {user?.firstName} !
          </h2>
          <p className="text-gray-600">
            Gérez vos rendez-vous médicaux et votre suivi de santé
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="medical-card cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Plus className="h-8 w-8 text-medical-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Nouveau RDV</h3>
              <p className="text-sm text-gray-600">Prendre un rendez-vous</p>
            </CardContent>
          </Card>

          <Card className="medical-card cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-medical-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Mes RDV</h3>
              <p className="text-sm text-gray-600">Voir tous mes rendez-vous</p>
            </CardContent>
          </Card>

          <Card className="medical-card cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-medical-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Historique</h3>
              <p className="text-sm text-gray-600">Consulter mon historique</p>
            </CardContent>
          </Card>

          <Card className="medical-card cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 text-medical-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Profil</h3>
              <p className="text-sm text-gray-600">Modifier mes informations</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 text-medical-600 mr-2" />
                Prochains rendez-vous
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600"></div>
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-medical-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.practitioner?.specialization}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(appointment.appointmentDate)} à {formatTime(appointment.startTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Confirmé
                        </span>
                      </div>
                    </div>
                  ))}
                  {upcomingAppointments.length > 3 && (
                    <Button variant="outline" className="w-full">
                      Voir tous ({upcomingAppointments.length})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Aucun rendez-vous à venir</p>
                  <Button className="medical-button">
                    Prendre un rendez-vous
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 text-medical-600 mr-2" />
                Historique récent
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pastAppointments.length > 0 ? (
                <div className="space-y-4">
                  {pastAppointments.slice(0, 3).map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {appointment.practitioner?.firstName} {appointment.practitioner?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {appointment.practitioner?.specialization}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(appointment.appointmentDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Terminé
                        </span>
                      </div>
                    </div>
                  ))}
                  {pastAppointments.length > 3 && (
                    <Button variant="outline" className="w-full">
                      Voir l'historique complet
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun historique disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}