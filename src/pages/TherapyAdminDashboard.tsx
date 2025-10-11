import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { OrganicBackground } from '@/components/ui/organic-background';
import { MetricCard, TherapyIllustrations } from '@/components/admin/MetricCard';
import { AdminCalendar } from '@/components/calendar/AdminCalendar';
import { TherapyStatistics } from '@/components/statistics/TherapyStatistics';
import { 
  Calendar, 
  Users, 
  LogOut, 
  Heart,
  BarChart3,
  Settings,
  Clock,
  UserCheck,
  MessageCircle,
  TrendingUp,
  Bell,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';

interface Appointment {
  id: string;
  patientId: string;
  date: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'cabinet' | 'visio';
  reason: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export function TherapyAdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'appointments' | 'patients' | 'statistics'>('dashboard');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // Récupérer les données
  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments');
      const payload = response.data?.data || response.data;
      const raw = (payload.appointments || payload?.appointments || []) as any[];
      // Normaliser différentes formes de RDV (mock vs API réelle)
      return raw.map((apt: any) => {
        if (apt.date) {
          // Déjà au bon format
          return apt as Appointment;
        }
        const hasTimes = !!apt.appointmentDate && !!apt.startTime;
        const startIso = hasTimes
          ? new Date(`${apt.appointmentDate}T${apt.startTime}`).toISOString()
          : new Date().toISOString();
        let duration = 60;
        if (apt.startTime && apt.endTime) {
          const start = new Date(`2000-01-01T${apt.startTime}`);
          const end = new Date(`2000-01-01T${apt.endTime}`);
          duration = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000));
        }
        return {
          id: apt.id,
          patientId: apt.patientId,
          date: startIso,
          duration,
          status: (apt.status || 'pending') as Appointment['status'],
          type: (apt.type || 'cabinet') as Appointment['type'],
          reason: apt.reason || '',
          patient: apt.patient,
        } as Appointment;
      });
    },
  });

  // Calculs des statistiques
  const todayAppointments = appointments.filter(
    apt => apt.date.split('T')[0] === new Date().toISOString().split('T')[0]
  );

  const upcomingAppointments = appointments.filter(
    apt => apt.status !== 'cancelled' && new Date(apt.date) >= new Date()
  );

  const totalPatients = new Set(appointments.map(apt => apt.patientId)).size;

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  // Données pour les statistiques
  const statisticsData = {
    totalAppointments: appointments.length,
    totalPatients,
    newPatients: Math.floor(totalPatients * 0.3), // Estimation
    cancellationRate: appointments.length > 0 
      ? (appointments.filter(apt => apt.status === 'cancelled').length / appointments.length) * 100
      : 0,
    monthlyAppointments: [
      { month: 'Jan', count: 12 },
      { month: 'Fév', count: 18 },
      { month: 'Mar', count: 22 },
      { month: 'Avr', count: 25 },
      { month: 'Mai', count: 30 },
      { month: 'Juin', count: 28 }
    ],
    sessionTypes: [
      { type: 'cabinet', count: appointments.filter(apt => apt.type === 'cabinet').length, color: '#0d9488' },
      { type: 'visio', count: appointments.filter(apt => apt.type === 'visio').length, color: '#3b82f6' }
    ],
    appointmentStatus: [
      { status: 'pending', count: appointments.filter(apt => apt.status === 'pending').length, color: '#f59e0b' },
      { status: 'confirmed', count: appointments.filter(apt => apt.status === 'confirmed').length, color: '#10b981' },
      { status: 'completed', count: appointments.filter(apt => apt.status === 'completed').length, color: '#6366f1' },
      { status: 'cancelled', count: appointments.filter(apt => apt.status === 'cancelled').length, color: '#ef4444' }
    ],
    referralSources: [
      { source: 'Médecin traitant', count: 15 },
      { source: 'Psychologue', count: 8 },
      { source: 'Recherche personnelle', count: 12 },
      { source: 'Bouche à oreille', count: 6 }
    ],
    weeklyTrends: [
      { week: 'S1', appointments: 8, newPatients: 2 },
      { week: 'S2', appointments: 12, newPatients: 3 },
      { week: 'S3', appointments: 10, newPatients: 1 },
      { week: 'S4', appointments: 15, newPatients: 4 }
    ]
  };

  // Préparer les événements pour le calendrier
  const calendarEvents = appointments.map(apt => ({
    id: apt.id,
    title: apt.status === 'pending' ? '🟡 En attente' : 
           apt.status === 'confirmed' ? `🟢 ${apt.patient?.firstName} ${apt.patient?.lastName}` :
           apt.status === 'completed' ? '✅ Terminé' : '❌ Annulé',
    start: apt.date,
    end: new Date(new Date(apt.date).getTime() + (apt.duration || 60) * 60000).toISOString(),
    extendedProps: {
      type: apt.status === 'pending' ? 'available' : 
            apt.status === 'cancelled' ? 'unavailable' : 'booked',
      patient: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Patient',
      phone: apt.patient?.phone
    }
  }));

  const handleEventClick = (event: any) => {
    const appointment = appointments.find(apt => apt.id === event.id);
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowAppointmentModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapy-900 via-sage-800 to-cream-900 relative">
      <OrganicBackground variant="prominent" />
      
      {/* Header */}
      <header className="relative bg-therapy-800/95 backdrop-blur-md shadow-lg border-b border-sage-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-sage-600 to-therapy-600 p-2 rounded-lg mr-3 shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Dorian Sarry</h1>
                <p className="text-sm text-sage-400">Thérapie Sensorimotrice</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Bell className="h-5 w-5" />
                  {pendingAppointments.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingAppointments.length}
                    </span>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center text-sm text-gray-300">
                <UserCheck className="h-4 w-4 mr-2" />
                <span>{user?.name || user?.fullName}</span>
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
          
          {/* Navigation */}
          <nav className="pb-4">
            <div className="flex space-x-1">
              {[
                { key: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
                { key: 'calendar', label: 'Calendrier', icon: Calendar },
                { key: 'appointments', label: 'Rendez-vous', icon: Clock },
                { key: 'patients', label: 'Patients', icon: Users },
                { key: 'statistics', label: 'Statistiques', icon: TrendingUp },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-sage-600 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-therapy-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Aujourd'hui"
                value={todayAppointments.length}
                label="Rendez-vous"
                icon={Calendar}
                color="sage"
                illustration={<TherapyIllustrations.TimeFlow />}
              />

              <MetricCard
                title="À venir"
                value={upcomingAppointments.length}
                label="Rendez-vous"
                icon={Clock}
                color="therapy"
                illustration={<TherapyIllustrations.HeartFlow />}
              />

              <MetricCard
                title="Total"
                value={totalPatients}
                label="Patients"
                icon={Users}
                color="cream"
                illustration={<TherapyIllustrations.PersonAura />}
              />

              <MetricCard
                title="En attente"
                value={pendingAppointments.length}
                label="Confirmations"
                icon={MessageCircle}
                color="orange"
                illustration={<TherapyIllustrations.SoundWave />}
              />
            </div>

            {/* Rendez-vous du jour */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 text-sage-600 mr-2" />
                    Rendez-vous d'aujourd'hui
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {todayAppointments.slice(0, 5).map((appointment) => (
                        <div 
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-sage-50 rounded-lg cursor-pointer hover:bg-sage-100 transition-colors shadow-sm"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowAppointmentModal(true);
                          }}
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.patient?.firstName} {appointment.patient?.lastName}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              {appointment.type === 'cabinet' ? 'En cabinet' : 'Visioconférence'}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(appointment.date).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status === 'pending' ? 'En attente' :
                               appointment.status === 'confirmed' ? 'Confirmé' :
                               appointment.status === 'completed' ? 'Terminé' : 'Annulé'}
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

              {/* Actions rapides */}
              <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 text-sage-600 mr-2" />
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-sage-600 to-therapy-600 hover:from-sage-700 hover:to-therapy-700 shadow-lg"
                      onClick={() => setActiveTab('calendar')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un créneau
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('appointments')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir tous les rendez-vous
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('patients')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Gérer les patients
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('statistics')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Voir les statistiques
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <AdminCalendar
            events={calendarEvents}
            onEventClick={handleEventClick}
            onEventAdd={(eventData) => {
              console.log('Nouvel événement:', eventData);
              // Ici, vous ajouteriez la logique pour créer un nouveau créneau
            }}
          />
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Gestion des Rendez-vous</h2>
              <div className="flex space-x-2">
                <Button variant="outline" className="text-gray-300 border-gray-600">
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
                <Button variant="outline" className="text-gray-300 border-gray-600">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
              </div>
            </div>
            
            <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Heure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {appointments.slice(0, 10).map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {appointment.patient?.firstName} {appointment.patient?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{appointment.patient?.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>{new Date(appointment.date).toLocaleDateString('fr-FR')}</div>
                            <div className="text-gray-500">
                              {new Date(appointment.date).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                            {appointment.type === 'cabinet' ? 'Cabinet' : 'Visio'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status === 'pending' ? 'En attente' :
                               appointment.status === 'confirmed' ? 'Confirmé' :
                               appointment.status === 'completed' ? 'Terminé' : 'Annulé'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                className="text-teal-600 hover:text-teal-900"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowAppointmentModal(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Gestion des Patients</h2>
              <Button className="bg-gradient-to-r from-sage-600 to-therapy-600 hover:from-sage-700 hover:to-therapy-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau patient
              </Button>
            </div>
            
            <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
              <CardContent className="p-6">
                <p className="text-gray-600 text-center py-8">
                  Interface de gestion des patients en cours de développement...
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'statistics' && (
          <TherapyStatistics data={statisticsData} />
        )}
      </main>

      {/* Modal détail rendez-vous */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto backdrop-blur-sm bg-white/95 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Détail du rendez-vous</span>
                <button 
                  onClick={() => setShowAppointmentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Informations patient</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Nom :</span> {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}</p>
                    <p><span className="font-medium">Email :</span> {selectedAppointment.patient?.email}</p>
                    {selectedAppointment.patient?.phone && (
                      <p><span className="font-medium">Téléphone :</span> {selectedAppointment.patient.phone}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Informations rendez-vous</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Date :</span> {new Date(selectedAppointment.date).toLocaleDateString('fr-FR')}</p>
                    <p><span className="font-medium">Heure :</span> {new Date(selectedAppointment.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><span className="font-medium">Durée :</span> {selectedAppointment.duration} minutes</p>
                    <p><span className="font-medium">Type :</span> {selectedAppointment.type === 'cabinet' ? 'En cabinet' : 'Visioconférence'}</p>
                    <p><span className="font-medium">Statut :</span> 
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedAppointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedAppointment.status === 'pending' ? 'En attente' :
                         selectedAppointment.status === 'confirmed' ? 'Confirmé' :
                         selectedAppointment.status === 'completed' ? 'Terminé' : 'Annulé'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Motif de consultation</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedAppointment.reason}</p>
              </div>
              
              <div className="flex justify-end space-x-2">
                {selectedAppointment.status === 'pending' && (
                  <>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmer
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                      Annuler
                    </Button>
                  </>
                )}
                
                {selectedAppointment.patient?.phone && (
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler
                  </Button>
                )}
                
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}