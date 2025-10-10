import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { Appointment } from '@/types';

export function PatientAppointmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Récupérer les rendez-vous du patient
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments');
      return response.data.data;
    },
  });

  // Mutation pour annuler un rendez-vous
  const cancelAppointment = useMutation({
    mutationFn: async (appointmentId: string) => {
      await api.patch(`/appointments/${appointmentId}`, { status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setCancellingId(null);
    },
  });

  const upcomingAppointments = appointments?.filter(
    apt => apt.status !== 'cancelled' && new Date(apt.appointmentDate) >= new Date()
  ) || [];

  const pastAppointments = appointments?.filter(
    apt => apt.status === 'completed' || (apt.status !== 'cancelled' && new Date(apt.appointmentDate) < new Date())
  ) || [];

  const cancelledAppointments = appointments?.filter(
    apt => apt.status === 'cancelled'
  ) || [];

  const getStatusDisplay = (appointment: Appointment) => {
    if (appointment.status === 'cancelled') {
      return { text: 'Annulé', color: 'bg-red-100 text-red-800' };
    }
    if (appointment.status === 'completed') {
      return { text: 'Terminé', color: 'bg-gray-100 text-gray-800' };
    }
    if (new Date(appointment.appointmentDate) < new Date()) {
      return { text: 'Passé', color: 'bg-gray-100 text-gray-800' };
    }
    return { text: 'Confirmé', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Mes Rendez-vous</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Rendez-vous à venir */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  Rendez-vous à venir ({upcomingAppointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => {
                      const status = getStatusDisplay(appointment);
                      return (
                        <div 
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900">
                                Dorian Sarry - Thérapie Sensorimotrice
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                {status.text}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(appointment.appointmentDate)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                              </div>
                            </div>
                            {appointment.reason && (
                              <p className="text-sm text-gray-700 mt-2 italic">
                                Motif: {appointment.reason}
                              </p>
                            )}
                          </div>
                          <div className="ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCancellingId(appointment.id)}
                              disabled={cancelAppointment.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Annuler
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Aucun rendez-vous à venir</p>
                    <Button 
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                      onClick={() => window.location.href = '/patient/book-appointment'}
                    >
                      Prendre un rendez-vous
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historique */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CheckCircle className="h-5 w-5 text-gray-600 mr-2" />
                  Historique ({pastAppointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pastAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {pastAppointments.map((appointment) => {
                      const status = getStatusDisplay(appointment);
                      return (
                        <div 
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900">
                                Dorian Sarry - Thérapie Sensorimotrice
                              </h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                {status.text}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(appointment.appointmentDate)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                              </div>
                            </div>
                            {appointment.reason && (
                              <p className="text-sm text-gray-700 mt-2 italic">
                                Motif: {appointment.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun historique disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rendez-vous annulés */}
            {cancelledAppointments.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    Rendez-vous annulés ({cancelledAppointments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cancelledAppointments.map((appointment) => (
                      <div 
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">
                              Dorian Sarry - Thérapie Sensorimotrice
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Annulé
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(appointment.appointmentDate)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Modal de confirmation d'annulation */}
        {cancellingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmer l'annulation
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir annuler ce rendez-vous ?
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setCancellingId(null)}
                  className="flex-1"
                >
                  Non, garder
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => cancelAppointment.mutate(cancellingId)}
                  disabled={cancelAppointment.isPending}
                >
                  {cancelAppointment.isPending ? 'Annulation...' : 'Oui, annuler'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}