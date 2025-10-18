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
  Stethoscope,
  FileText,
  Settings,
  MapPin,
  Phone,
  Mail
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
      // L'API retourne { success: true, data: { appointments: [], total: N } }
      const data = response.data.data || response.data;
      return data.appointments || data || [];
    },
  });

  const upcomingAppointments = appointments?.filter(
    apt => apt.status === 'scheduled' && new Date(apt.appointmentDate) >= new Date()
  ) || [];

  const pastAppointments = appointments?.filter(
    apt => apt.status === 'completed' || new Date(apt.appointmentDate) < new Date()
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg mr-3">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dorian Sarry</h1>
                <p className="text-sm text-green-600 font-medium">Thérapie Sensorimotrice</p>
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
          <div className="bg-gradient-to-r from-green-50 via-teal-50 to-blue-50 rounded-2xl p-8 shadow-2xl border-2 border-green-200">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-3">
              👋 Bonjour {user?.firstName} !
            </h2>
            <p className="text-gray-700 text-lg mb-4 font-medium">
              Bienvenue sur votre espace thérapeutique personnalisé. Cet espace vous permet de prendre rendez-vous, 
              suivre vos séances et rester en contact avec votre praticien.
            </p>
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <Calendar className="h-5 w-5" />
              <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          
          {/* Coordonnées du praticien */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-teal-200 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-teal-500 to-green-600 p-3 rounded-xl">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Dorian Sarry</h3>
                <p className="text-sm text-green-600 font-medium">Thérapie Sensorimotrice</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-sm text-gray-700">
              <div className="flex items-center bg-green-50 p-3 rounded-lg">
                <MapPin className="h-5 w-5 mr-3 text-green-600" />
                <span className="font-medium">20 rue des Jacobins, 24000 Périgueux</span>
              </div>
              <div className="flex items-center bg-teal-50 p-3 rounded-lg">
                <Phone className="h-5 w-5 mr-3 text-teal-600" />
                <a href="tel:0645156368" className="font-medium hover:text-teal-700 transition-colors">06.45.15.63.68</a>
              </div>
              <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                <Mail className="h-5 w-5 mr-3 text-blue-600" />
                <a href="mailto:doriansarry@yahoo.fr" className="font-medium hover:text-blue-700 transition-colors">doriansarry@yahoo.fr</a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Settings className="h-6 w-6 mr-2 text-green-600" />
          Actions rapides
        </h3>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-green-50 to-teal-50 cursor-pointer hover:scale-110 hover:-translate-y-2"
            onClick={() => window.location.href = '/patient/book-appointment'}
          >
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Nouveau RDV</h3>
              <p className="text-sm text-gray-600 font-medium">Réserver une séance</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 cursor-pointer hover:scale-110 hover:-translate-y-2"
            onClick={() => window.location.href = '/patient/appointments'}
          >
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Mes RDV</h3>
              <p className="text-sm text-gray-600 font-medium">Mes séances programmées</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 cursor-pointer hover:scale-110 hover:-translate-y-2"
            onClick={() => window.location.href = '/patient/follow-up'}
          >
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Suivi</h3>
              <p className="text-sm text-gray-600 font-medium">Mon parcours thérapeutique</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50 cursor-pointer hover:scale-110 hover:-translate-y-2"
            onClick={() => window.location.href = '/patient/profile'}
          >
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Profil</h3>
              <p className="text-sm text-gray-600 font-medium">Mes informations personnelles</p>
            </CardContent>
          </Card>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-green-600" />
          Vue d'ensemble de mes rendez-vous
        </h3>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-100">
              <CardTitle className="flex items-center text-green-900">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
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
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-100">
              <CardTitle className="flex items-center text-purple-900">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
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