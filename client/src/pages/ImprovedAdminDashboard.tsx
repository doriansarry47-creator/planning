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
import { AvailabilityManager } from "../components/admin/availability-manager";
import { 
  Users, 
  Calendar, 
  Clock, 
  User,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  Activity,
  BarChart3,
  Settings,
  Shield
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";

interface Appointment {
  id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  notes?: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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
  email: string;
  phoneNumber?: string;
  licenseNumber?: string;
  biography?: string;
  consultationDuration: number;
  isActive: boolean;
}

interface Patient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalPatients: number;
  totalPractitioners: number;
  todayAppointments: number;
}

export default function ImprovedAdminDashboard() {
  const { user, logout, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // State pour la création/modification de praticien
  const [practitionerDialog, setPractitionerDialog] = useState(false);
  const [editingPractitioner, setEditingPractitioner] = useState<Practitioner | null>(null);
  const [practitionerForm, setPractitionerForm] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    email: "",
    phoneNumber: "",
    licenseNumber: "",
    biography: "",
    consultationDuration: 30,
  });

  const specializations = [
    "Médecine générale",
    "Cardiologie",
    "Dermatologie", 
    "Gynécologie",
    "Neurologie",
    "Ophtalmologie",
    "Orthopédie",
    "Pédiatrie",
    "Psychiatrie",
    "Radiologie",
    "Thérapie sensori-motrice",
    "Autre"
  ];

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setErrorMessage("");
      
      const [appointmentsData, practitionersData, patientsData] = await Promise.all([
        api.getAllAppointments(token),
        api.getPractitioners(),
        api.getAllPatients(token),
      ]);

      setAppointments(appointmentsData);
      setPractitioners(practitionersData);
      setPatients(patientsData);
      
      // Calculer les statistiques
      calculateStats(appointmentsData, practitionersData, patientsData);
      
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setErrorMessage("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointments: Appointment[], practitioners: Practitioner[], patients: Patient[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    const stats: DashboardStats = {
      totalAppointments: appointments.length,
      scheduledAppointments: appointments.filter(apt => apt.status === 'scheduled').length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
      totalPatients: patients.filter(p => p.isActive).length,
      totalPractitioners: practitioners.filter(p => p.isActive).length,
      todayAppointments: appointments.filter(apt => 
        apt.appointmentDate === today && apt.status === 'scheduled'
      ).length,
    };
    
    setStats(stats);
  };

  const handleCreatePractitioner = async () => {
    if (!token) return;

    try {
      await api.createPractitioner(practitionerForm, token);
      setSuccessMessage("Praticien créé avec succès");
      setPractitionerDialog(false);
      resetPractitionerForm();
      await loadData();
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Erreur lors de la création");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleUpdatePractitioner = async () => {
    if (!token || !editingPractitioner) return;

    try {
      await api.updatePractitioner(editingPractitioner.id, practitionerForm, token);
      setSuccessMessage("Praticien mis à jour avec succès");
      setPractitionerDialog(false);
      setEditingPractitioner(null);
      resetPractitionerForm();
      await loadData();
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Erreur lors de la mise à jour");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const handleDeletePractitioner = async (practitionerId: string) => {
    if (!token || !confirm("Êtes-vous sûr de vouloir supprimer ce praticien ?")) return;

    try {
      await api.deletePractitioner(practitionerId, token);
      setSuccessMessage("Praticien supprimé avec succès");
      await loadData();
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Erreur lors de la suppression");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const openEditPractitioner = (practitioner: Practitioner) => {
    setEditingPractitioner(practitioner);
    setPractitionerForm({
      firstName: practitioner.firstName,
      lastName: practitioner.lastName,
      specialization: practitioner.specialization,
      email: practitioner.email,
      phoneNumber: practitioner.phoneNumber || "",
      licenseNumber: practitioner.licenseNumber || "",
      biography: practitioner.biography || "",
      consultationDuration: practitioner.consultationDuration,
    });
    setPractitionerDialog(true);
  };

  const resetPractitionerForm = () => {
    setPractitionerForm({
      firstName: "",
      lastName: "",
      specialization: "",
      email: "",
      phoneNumber: "",
      licenseNumber: "",
      biography: "",
      consultationDuration: 30,
    });
  };

  const getAppointmentStatus = (status: string) => {
    switch (status) {
      case "scheduled":
        return { label: "Programmé", variant: "default" as const };
      case "completed":
        return { label: "Terminé", variant: "secondary" as const };
      case "cancelled":
        return { label: "Annulé", variant: "destructive" as const };
      case "no_show":
        return { label: "Absent", variant: "outline" as const };
      default:
        return { label: status, variant: "outline" as const };
    }
  };

  const getTodaysAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.appointmentDate === today && apt.status === 'scheduled'
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-lg shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration</h1>
                <p className="text-sm text-gray-600">Gestion de la clinique</p>
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

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Stethoscope className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Praticiens</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPractitioners}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">RDV total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="w-4 h-4" />
              Rendez-vous
            </TabsTrigger>
            <TabsTrigger value="practitioners" className="gap-2">
              <Stethoscope className="w-4 h-4" />
              Praticiens
            </TabsTrigger>
            <TabsTrigger value="patients" className="gap-2">
              <Users className="w-4 h-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2">
              <Clock className="w-4 h-4" />
              Disponibilités
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          {/* Onglet Rendez-vous */}
          <TabsContent value="appointments" className="space-y-6">
            {/* Rendez-vous d'aujourd'hui */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Rendez-vous d'aujourd'hui ({getTodaysAppointments().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getTodaysAppointments().length > 0 ? (
                  <div className="space-y-3">
                    {getTodaysAppointments().map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="font-bold text-lg">
                                {appointment.startTime.slice(0, 5)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {appointment.endTime.slice(0, 5)}
                              </p>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">
                                  {appointment.patient.firstName} {appointment.patient.lastName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Stethoscope className="w-4 h-4" />
                                <span>
                                  Dr. {appointment.practitioner.firstName} {appointment.practitioner.lastName}
                                </span>
                                <span>•</span>
                                <span>{appointment.practitioner.specialization}</span>
                              </div>
                              {appointment.reason && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Motif: {appointment.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Badge variant={getAppointmentStatus(appointment.status).variant}>
                          {getAppointmentStatus(appointment.status).label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun rendez-vous programmé aujourd'hui</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tous les rendez-vous */}
            <Card>
              <CardHeader>
                <CardTitle>Tous les rendez-vous</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 border rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center min-w-[80px]">
                          <p className="font-medium">
                            {format(parseISO(appointment.appointmentDate), "dd/MM")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.startTime.slice(0, 5)}
                          </p>
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-medium">
                            {appointment.patient.firstName} {appointment.patient.lastName}
                          </p>
                          <p className="text-gray-600">
                            Dr. {appointment.practitioner.firstName} {appointment.practitioner.lastName}
                          </p>
                        </div>
                        
                        <Badge variant={getAppointmentStatus(appointment.status).variant}>
                          {getAppointmentStatus(appointment.status).label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Praticiens */}
          <TabsContent value="practitioners" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  Gestion des praticiens
                </CardTitle>
                
                <Dialog open={practitionerDialog} onOpenChange={setPractitionerDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      resetPractitionerForm();
                      setEditingPractitioner(null);
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un praticien
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPractitioner ? "Modifier le praticien" : "Ajouter un praticien"}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Prénom</Label>
                          <Input
                            value={practitionerForm.firstName}
                            onChange={(e) => setPractitionerForm({ ...practitionerForm, firstName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Nom</Label>
                          <Input
                            value={practitionerForm.lastName}
                            onChange={(e) => setPractitionerForm({ ...practitionerForm, lastName: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Spécialisation</Label>
                        <Select
                          value={practitionerForm.specialization}
                          onValueChange={(value) => setPractitionerForm({ ...practitionerForm, specialization: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une spécialisation..." />
                          </SelectTrigger>
                          <SelectContent>
                            {specializations.map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={practitionerForm.email}
                            onChange={(e) => setPractitionerForm({ ...practitionerForm, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Téléphone</Label>
                          <Input
                            value={practitionerForm.phoneNumber}
                            onChange={(e) => setPractitionerForm({ ...practitionerForm, phoneNumber: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Numéro de licence</Label>
                          <Input
                            value={practitionerForm.licenseNumber}
                            onChange={(e) => setPractitionerForm({ ...practitionerForm, licenseNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Durée consultation (min)</Label>
                          <Input
                            type="number"
                            value={practitionerForm.consultationDuration}
                            onChange={(e) => setPractitionerForm({ ...practitionerForm, consultationDuration: parseInt(e.target.value) || 30 })}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Biographie</Label>
                        <Textarea
                          value={practitionerForm.biography}
                          onChange={(e) => setPractitionerForm({ ...practitionerForm, biography: e.target.value })}
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setPractitionerDialog(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                        <Button onClick={editingPractitioner ? handleUpdatePractitioner : handleCreatePractitioner}>
                          <Check className="w-4 h-4 mr-2" />
                          {editingPractitioner ? "Modifier" : "Créer"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {practitioners.filter(p => p.isActive).map((practitioner) => (
                    <div
                      key={practitioner.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Stethoscope className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              Dr. {practitioner.firstName} {practitioner.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {practitioner.specialization}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>{practitioner.email}</div>
                          <div>{practitioner.phoneNumber || "Non renseigné"}</div>
                          <div>{practitioner.consultationDuration} min</div>
                        </div>
                        
                        {practitioner.biography && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {practitioner.biography}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditPractitioner(practitioner)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePractitioner(practitioner.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Patients */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Liste des patients ({patients.filter(p => p.isActive).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {patients.filter(p => p.isActive).map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{patient.email}</p>
                            <p>{patient.phoneNumber || "Téléphone non renseigné"}</p>
                            <p className="text-xs">
                              Inscrit le {format(parseISO(patient.createdAt), "dd/MM/yyyy")}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant="outline">
                            {appointments.filter(apt => 
                              apt.patient.id === patient.id && apt.status === 'completed'
                            ).length} consultations
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Disponibilités */}
          <TabsContent value="availability">
            <AvailabilityManager onUpdate={loadData} />
          </TabsContent>

          {/* Onglet Statistiques */}
          <TabsContent value="stats" className="space-y-6">
            {stats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Répartition des rendez-vous</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Programmés</span>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span className="font-medium">{stats.scheduledAppointments}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Terminés</span>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="font-medium">{stats.completedAppointments}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Annulés</span>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span className="font-medium">{stats.cancelledAppointments}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Vue d'ensemble</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total patients actifs</span>
                          <span className="font-bold">{stats.totalPatients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total praticiens</span>
                          <span className="font-bold">{stats.totalPractitioners}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total rendez-vous</span>
                          <span className="font-bold">{stats.totalAppointments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rendez-vous aujourd'hui</span>
                          <span className="font-bold text-blue-600">{stats.todayAppointments}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Spécialisations disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from(new Set(practitioners.map(p => p.specialization))).map((specialization) => {
                        const count = practitioners.filter(p => p.specialization === specialization && p.isActive).length;
                        return (
                          <div key={specialization} className="p-3 border rounded-lg text-center">
                            <p className="font-medium text-sm">{specialization}</p>
                            <p className="text-2xl font-bold text-blue-600">{count}</p>
                            <p className="text-xs text-gray-500">praticien{count > 1 ? 's' : ''}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}