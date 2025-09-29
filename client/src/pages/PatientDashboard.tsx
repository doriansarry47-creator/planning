import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User,
  LogOut,
  Plus,
  X,
  Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

interface Appointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  notes?: string;
  practitioner: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

interface Practitioner {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  biography?: string;
  consultationDuration: number;
}

interface PatientProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
}

export default function PatientDashboard() {
  const { user, logout, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedPractitioner, setSelectedPractitioner] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [appointmentsData, practitionersData, profileData] = await Promise.all([
        api.getPatientAppointments(token),
        api.getPractitioners(),
        api.getPatientProfile(token),
      ]);

      setAppointments(appointmentsData);
      setPractitioners(practitionersData);
      setProfile(profileData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      scheduled: "default",
      completed: "secondary", 
      cancelled: "destructive",
      no_show: "outline",
    };

    const labels: Record<string, string> = {
      scheduled: "Programmé",
      completed: "Terminé",
      cancelled: "Annulé",
      no_show: "Absent",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM format
  };

  const handleBookAppointment = async () => {
    if (!token || !selectedPractitioner || !appointmentDate || !appointmentTime || !reason) {
      return;
    }

    try {
      await api.createAppointment({
        practitionerId: selectedPractitioner,
        appointmentDate,
        startTime: appointmentTime + ":00",
        endTime: (parseInt(appointmentTime.split(':')[0]) + 1).toString().padStart(2, '0') + ":" + appointmentTime.split(':')[1] + ":00",
        reason,
      }, token);

      setBookingDialog(false);
      setSelectedPractitioner("");
      setAppointmentDate("");
      setAppointmentTime("");
      setReason("");
      
      // Recharger les rendez-vous
      const appointmentsData = await api.getPatientAppointments(token);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous:", error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!token) return;

    try {
      await api.cancelAppointment(appointmentId, token);
      // Recharger les rendez-vous
      const appointmentsData = await api.getPatientAppointments(token);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Erreur lors de l'annulation du rendez-vous:", error);
    }
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= today && apt.status === 'scheduled';
    }).sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const upcomingAppointments = getUpcomingAppointments();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mon Espace Patient</h1>
              <p className="text-gray-600">Bienvenue, {user?.firstName} {user?.lastName}</p>
            </div>
            <Button onClick={logout} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="appointments">Mes rendez-vous</TabsTrigger>
            <TabsTrigger value="profile">Mon profil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-green-600" />
                    Prendre un rendez-vous
                  </CardTitle>
                  <CardDescription>
                    Réservez facilement votre prochain rendez-vous médical
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full">Nouveau rendez-vous</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Réserver un rendez-vous</DialogTitle>
                        <DialogDescription>
                          Choisissez un praticien et planifiez votre rendez-vous
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="practitioner">Praticien</Label>
                          <Select value={selectedPractitioner} onValueChange={setSelectedPractitioner}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir un praticien" />
                            </SelectTrigger>
                            <SelectContent>
                              {practitioners.map((practitioner) => (
                                <SelectItem key={practitioner.id} value={practitioner.id}>
                                  Dr. {practitioner.firstName} {practitioner.lastName} - {practitioner.specialization}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor="time">Heure</Label>
                          <Input
                            id="time"
                            type="time"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="reason">Motif de consultation</Label>
                          <Textarea
                            id="reason"
                            placeholder="Décrivez brièvement le motif de votre consultation..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleBookAppointment} className="flex-1">
                            Réserver
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setBookingDialog(false)}
                            className="flex-1"
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Prochain rendez-vous
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingAppointments.slice(0, 2).map((appointment) => (
                        <div key={appointment.id} className="p-3 border rounded-lg">
                          <p className="font-medium">
                            Dr. {appointment.practitioner.firstName} {appointment.practitioner.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{appointment.practitioner.specialization}</p>
                          <p className="text-sm text-blue-600">
                            {formatDate(appointment.appointmentDate)} à {formatTime(appointment.startTime)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Aucun rendez-vous programmé</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent History */}
            <Card>
              <CardHeader>
                <CardTitle>Historique récent</CardTitle>
                <CardDescription>Vos derniers rendez-vous</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          Dr. {appointment.practitioner.firstName} {appointment.practitioner.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.practitioner.specialization}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(appointment.appointmentDate)} à {formatTime(appointment.startTime)}
                        </p>
                        {appointment.reason && (
                          <p className="text-sm text-gray-700 mt-1">Motif: {appointment.reason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(appointment.status)}
                        {appointment.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Mes rendez-vous</CardTitle>
                    <CardDescription>Gérez vos rendez-vous médicaux</CardDescription>
                  </div>
                  <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nouveau rendez-vous
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Réserver un rendez-vous</DialogTitle>
                        <DialogDescription>
                          Choisissez un praticien et planifiez votre rendez-vous
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="practitioner">Praticien</Label>
                          <Select value={selectedPractitioner} onValueChange={setSelectedPractitioner}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir un praticien" />
                            </SelectTrigger>
                            <SelectContent>
                              {practitioners.map((practitioner) => (
                                <SelectItem key={practitioner.id} value={practitioner.id}>
                                  Dr. {practitioner.firstName} {practitioner.lastName} - {practitioner.specialization}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor="time">Heure</Label>
                          <Input
                            id="time"
                            type="time"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="reason">Motif de consultation</Label>
                          <Textarea
                            id="reason"
                            placeholder="Décrivez brièvement le motif de votre consultation..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleBookAppointment} className="flex-1">
                            Réserver
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setBookingDialog(false)}
                            className="flex-1"
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          Dr. {appointment.practitioner.firstName} {appointment.practitioner.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{appointment.practitioner.specialization}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(appointment.appointmentDate)} à {formatTime(appointment.startTime)}
                        </p>
                        {appointment.reason && (
                          <p className="text-sm text-gray-700 mt-1">Motif: {appointment.reason}</p>
                        )}
                        {appointment.notes && (
                          <p className="text-sm text-gray-600 mt-1">Notes: {appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(appointment.status)}
                        {appointment.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mon profil</CardTitle>
                <CardDescription>Gérez vos informations personnelles et médicales</CardDescription>
              </CardHeader>
              <CardContent>
                {profile && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Prénom</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded">{profile.firstName}</p>
                      </div>
                      <div>
                        <Label>Nom</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded">{profile.lastName}</p>
                      </div>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded">{profile.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Téléphone</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded">{profile.phoneNumber || "Non renseigné"}</p>
                      </div>
                      <div>
                        <Label>Date de naissance</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded">
                          {profile.dateOfBirth ? formatDate(profile.dateOfBirth) : "Non renseigné"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label>Adresse</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded">{profile.address || "Non renseigné"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Contact d'urgence</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded">{profile.emergencyContact || "Non renseigné"}</p>
                      </div>
                      <div>
                        <Label>Téléphone d'urgence</Label>
                        <p className="text-sm bg-gray-50 p-2 rounded">{profile.emergencyPhone || "Non renseigné"}</p>
                      </div>
                    </div>
                    <div>
                      <Label>Allergies</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded">{profile.allergies || "Aucune allergie connue"}</p>
                    </div>
                    <div>
                      <Label>Médicaments</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded">{profile.medications || "Aucun médicament"}</p>
                    </div>
                    <Button className="w-full">Modifier mon profil</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}