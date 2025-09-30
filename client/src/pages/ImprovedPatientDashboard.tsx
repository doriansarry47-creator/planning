import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  User,
  LogOut,
  Plus,
  X,
  Check,
  AlertCircle,
  CheckCircle,
  Heart,
  FileText,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Activity
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { BookingWizard } from "../components/booking/booking-wizard";
import { format, parseISO, isAfter, isBefore, addHours } from "date-fns";
import { fr } from "date-fns/locale";

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

export default function ImprovedPatientDashboard() {
  const { user, logout, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<PatientProfile>>({});

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setErrorMessage("");
      const [appointmentsData, practitionersData, profileData] = await Promise.all([
        api.getPatientAppointments(token),
        api.getPractitioners(),
        api.getPatientProfile(token),
      ]);

      setAppointments(appointmentsData);
      setPractitioners(practitionersData);
      setProfile(profileData);
      setProfileForm(profileData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setErrorMessage("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingComplete = (appointmentId: string) => {
    setShowBookingWizard(false);
    setSuccessMessage("Rendez-vous réservé avec succès ! Vous allez recevoir un email de confirmation.");
    loadData();
    
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!token) return;
    
    try {
      await api.cancelAppointment(appointmentId, token);
      setSuccessMessage("Rendez-vous annulé avec succès");
      await loadData();
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Erreur lors de l'annulation");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleUpdateProfile = async () => {
    if (!token || !profile) return;

    try {
      await api.updatePatientProfile(profileForm, token);
      setSuccessMessage("Profil mis à jour avec succès");
      setEditingProfile(false);
      await loadData();
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Erreur lors de la mise à jour");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const getAppointmentStatus = (status: string) => {
    switch (status) {
      case "scheduled":
        return { label: "Programmé", variant: "default" as const, color: "text-blue-600" };
      case "completed":
        return { label: "Terminé", variant: "secondary" as const, color: "text-green-600" };
      case "cancelled":
        return { label: "Annulé", variant: "destructive" as const, color: "text-red-600" };
      case "no_show":
        return { label: "Absent", variant: "outline" as const, color: "text-gray-600" };
      default:
        return { label: status, variant: "outline" as const, color: "text-gray-600" };
    }
  };

  const canCancelAppointment = (appointment: Appointment) => {
    if (appointment.status !== "scheduled") return false;
    
    const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.startTime}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilAppointment > 24;
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(`${apt.appointmentDate}T${apt.startTime}`);
      return isAfter(aptDate, now) && apt.status === "scheduled";
    }).sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate}T${a.startTime}`);
      const dateB = new Date(`${b.appointmentDate}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(`${apt.appointmentDate}T${apt.startTime}`);
      return isBefore(aptDate, now) || apt.status !== "scheduled";
    }).sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate}T${a.startTime}`);
      const dateB = new Date(`${b.appointmentDate}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement de votre espace patient...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-lg shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Bonjour, {profile?.firstName}
                </h1>
                <p className="text-sm text-gray-600">Espace Patient</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="w-4 h-4" />
              Mes Rendez-vous
            </TabsTrigger>
            <TabsTrigger value="book" className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau RDV
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Mon Profil
            </TabsTrigger>
          </TabsList>

          {/* Onglet Rendez-vous */}
          <TabsContent value="appointments" className="space-y-6">
            {/* Prochains rendez-vous */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Prochains rendez-vous
                </CardTitle>
                <CardDescription>
                  Vos consultations à venir
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getUpcomingAppointments().length > 0 ? (
                  <div className="space-y-4">
                    {getUpcomingAppointments().map((appointment) => {
                      const status = getAppointmentStatus(appointment.status);
                      return (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Stethoscope className="w-5 h-5 text-blue-600" />
                              <div>
                                <h4 className="font-medium">
                                  Dr. {appointment.practitioner.firstName}{" "}
                                  {appointment.practitioner.lastName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {appointment.practitioner.specialization}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>
                                  {format(parseISO(appointment.appointmentDate), "EEEE d MMMM yyyy", { locale: fr })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>
                                  {appointment.startTime.slice(0, 5)} - {appointment.endTime.slice(0, 5)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={status.variant}>{status.label}</Badge>
                              </div>
                            </div>
                            
                            {appointment.reason && (
                              <div className="mt-2 text-sm text-gray-600">
                                <FileText className="w-4 h-4 inline mr-2" />
                                {appointment.reason}
                              </div>
                            )}
                          </div>
                          
                          {canCancelAppointment(appointment) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="ml-4 text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Annuler
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun rendez-vous programmé</p>
                    <p className="text-sm mt-1">Réservez votre prochain rendez-vous</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historique */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-600" />
                  Historique des consultations
                </CardTitle>
                <CardDescription>
                  Vos rendez-vous passés
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getPastAppointments().length > 0 ? (
                  <div className="space-y-3">
                    {getPastAppointments().map((appointment) => {
                      const status = getAppointmentStatus(appointment.status);
                      return (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  Dr. {appointment.practitioner.firstName} {appointment.practitioner.lastName}
                                </span>
                                <Badge variant={status.variant} className="text-xs">
                                  {status.label}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-4">
                              <span>{format(parseISO(appointment.appointmentDate), "dd/MM/yyyy")}</span>
                              <span>{appointment.startTime.slice(0, 5)}</span>
                              <span>{appointment.practitioner.specialization}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun historique de consultation</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Nouveau RDV */}
          <TabsContent value="book">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Réserver un nouveau rendez-vous
                </CardTitle>
                <CardDescription>
                  Choisissez votre praticien et votre créneau préféré
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingWizard
                  onBookingComplete={handleBookingComplete}
                  onCancel={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Mon profil médical
                </CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles et médicales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {editingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Prénom</Label>
                        <Input
                          value={profileForm.firstName || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Nom</Label>
                        <Input
                          value={profileForm.lastName || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Téléphone</Label>
                        <Input
                          value={profileForm.phoneNumber || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Date de naissance</Label>
                        <Input
                          type="date"
                          value={profileForm.dateOfBirth || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Adresse</Label>
                      <Input
                        value={profileForm.address || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Contact d'urgence</Label>
                        <Input
                          value={profileForm.emergencyContact || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Téléphone d'urgence</Label>
                        <Input
                          value={profileForm.emergencyPhone || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, emergencyPhone: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Antécédents médicaux</Label>
                      <Textarea
                        value={profileForm.medicalHistory || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, medicalHistory: e.target.value })}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Allergies</Label>
                      <Textarea
                        value={profileForm.allergies || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label>Médicaments actuels</Label>
                      <Textarea
                        value={profileForm.medications || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, medications: e.target.value })}
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProfile}>
                        <Check className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </Button>
                      <Button variant="outline" onClick={() => setEditingProfile(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Informations personnelles</h3>
                      <Button variant="outline" onClick={() => setEditingProfile(true)}>
                        Modifier
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{profile?.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Téléphone</p>
                            <p className="font-medium">{profile?.phoneNumber || "Non renseigné"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Adresse</p>
                            <p className="font-medium">{profile?.address || "Non renseignée"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {profile?.medicalHistory && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium mb-1">Antécédents médicaux</p>
                            <p className="text-sm">{profile.medicalHistory}</p>
                          </div>
                        )}
                        
                        {profile?.allergies && (
                          <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-600 font-medium mb-1">Allergies</p>
                            <p className="text-sm">{profile.allergies}</p>
                          </div>
                        )}
                        
                        {profile?.medications && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600 font-medium mb-1">Médicaments</p>
                            <p className="text-sm">{profile.medications}</p>
                          </div>
                        )}
                      </div>
                    </div>
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