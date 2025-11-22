import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Plus,
  Search,
  Download,
  Upload,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  internalNotes?: string;
  isActive: boolean;
  createdAt: string;
  lastVisit?: string;
}

interface PatientAppointment {
  id: number;
  date: string;
  time: string;
  practitioner: string;
  service: string;
  status: string;
  notes?: string;
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: 1,
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@email.com',
    phoneNumber: '06 12 34 56 78',
    dateOfBirth: '1985-03-15',
    gender: 'Femme',
    address: '123 Rue de la Paix',
    city: 'Paris',
    zipCode: '75001',
    emergencyContactName: 'Jean Dupont',
    emergencyContactPhone: '06 98 76 54 32',
    medicalHistory: 'Aucun antécédent majeur',
    allergies: 'Pénicilline',
    medications: 'Aucun',
    internalNotes: 'Patiente très ponctuelle',
    isActive: true,
    createdAt: '2024-01-15T10:00:00',
    lastVisit: '2025-11-10T14:00:00',
  },
  {
    id: 2,
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean.martin@email.com',
    phoneNumber: '06 23 45 67 89',
    dateOfBirth: '1990-07-22',
    gender: 'Homme',
    address: '45 Avenue des Champs',
    city: 'Lyon',
    zipCode: '69001',
    medicalHistory: 'Diabète de type 2',
    medications: 'Metformine 500mg',
    internalNotes: 'Nécessite des rappels pour les rendez-vous',
    isActive: true,
    createdAt: '2024-03-20T11:30:00',
    lastVisit: '2025-11-12T09:00:00',
  },
];

const MOCK_APPOINTMENTS: Record<number, PatientAppointment[]> = {
  1: [
    {
      id: 1,
      date: '2025-11-10',
      time: '14:00',
      practitioner: 'Dr. Sophie Bernard',
      service: 'Consultation',
      status: 'completed',
      notes: 'RAS',
    },
    {
      id: 2,
      date: '2025-10-15',
      time: '10:00',
      practitioner: 'Dr. Sophie Bernard',
      service: 'Suivi',
      status: 'completed',
    },
  ],
  2: [
    {
      id: 3,
      date: '2025-11-12',
      time: '09:00',
      practitioner: 'Dr. Marc Dubois',
      service: 'Consultation',
      status: 'completed',
    },
  ],
};

export default function PatientsManagement() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [activeTab, setActiveTab] = useState('info');

  // Filtrer les patients par recherche
  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.email.toLowerCase().includes(searchLower) ||
      patient.phoneNumber.includes(searchTerm)
    );
  });

  const handleCreatePatient = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      isActive: true,
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setFormData(patient);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('info');
  };

  const handleSavePatient = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email invalide');
      return;
    }

    try {
      if (isEditing && formData.id) {
        // Mise à jour
        setPatients((prev) =>
          prev.map((p) =>
            p.id === formData.id
              ? { ...p, ...formData, updatedAt: new Date().toISOString() }
              : p
          )
        );
        toast.success('Patient modifié avec succès');
      } else {
        // Création
        const newPatient: Patient = {
          id: Math.max(...patients.map((p) => p.id), 0) + 1,
          ...formData,
          isActive: true,
          createdAt: new Date().toISOString(),
        } as Patient;
        setPatients((prev) => [...prev, newPatient]);
        toast.success('Patient créé avec succès');
      }
      setIsDialogOpen(false);
      setFormData({});
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;

    try {
      setPatients((prev) => prev.filter((p) => p.id !== patientToDelete.id));
      toast.success('Patient supprimé avec succès');
      setIsDeleteDialogOpen(false);
      setPatientToDelete(null);
      if (selectedPatient?.id === patientToDelete.id) {
        setSelectedPatient(null);
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(patients, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patients_export_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    toast.success('Données exportées avec succès');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        // Validation basique
        if (Array.isArray(importedData)) {
          setPatients((prev) => [...prev, ...importedData]);
          toast.success(`${importedData.length} patient(s) importé(s) avec succès`);
        } else {
          toast.error('Format de fichier invalide');
        }
      } catch (error) {
        toast.error('Erreur lors de l\'importation');
      }
    };
    reader.readAsText(file);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      completed: { label: 'Complété', variant: 'secondary' },
      scheduled: { label: 'Programmé', variant: 'default' },
      cancelled: { label: 'Annulé', variant: 'destructive' },
      no_show: { label: 'Absent', variant: 'outline' },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Patients</CardTitle>
              <CardDescription>
                Créer, modifier et gérer les dossiers patients
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-file"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <Button onClick={handleCreatePatient}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Patient
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche */}
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{patients.length}</div>
                <p className="text-xs text-muted-foreground">Total Patients</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {patients.filter((p) => p.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">Actifs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {patients.filter((p) => p.lastVisit).length}
                </div>
                <p className="text-xs text-muted-foreground">Visites Récentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">
                  {patients.filter((p) => p.medicalHistory || p.allergies).length}
                </div>
                <p className="text-xs text-muted-foreground">Historique Médical</p>
              </CardContent>
            </Card>
          </div>

          {/* Liste des patients */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Dernière Visite</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun patient trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewPatient(patient)}
                    >
                      <TableCell className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phoneNumber}</TableCell>
                      <TableCell>{patient.city || '-'}</TableCell>
                      <TableCell>
                        {patient.lastVisit
                          ? format(new Date(patient.lastVisit), 'dd MMM yyyy', { locale: fr })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={patient.isActive ? 'default' : 'secondary'}>
                          {patient.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPatient(patient)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePatient(patient)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Détails du patient sélectionné */}
      {selectedPatient && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </CardTitle>
                <CardDescription>
                  Patient créé le {format(new Date(selectedPatient.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEditPatient(selectedPatient)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
                <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informations</TabsTrigger>
                <TabsTrigger value="medical">Médical</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
              </TabsList>

              {/* Onglet Informations */}
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPatient.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Téléphone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedPatient.phoneNumber}</span>
                    </div>
                  </div>
                  {selectedPatient.dateOfBirth && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Date de naissance</Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(selectedPatient.dateOfBirth), 'dd MMMM yyyy', { locale: fr })}</span>
                      </div>
                    </div>
                  )}
                  {selectedPatient.gender && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Sexe</Label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedPatient.gender}</span>
                      </div>
                    </div>
                  )}
                  {selectedPatient.address && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-muted-foreground">Adresse</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {selectedPatient.address}, {selectedPatient.city} {selectedPatient.zipCode}
                        </span>
                      </div>
                    </div>
                  )}
                  {selectedPatient.emergencyContactName && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Contact d'urgence</Label>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedPatient.emergencyContactName}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Téléphone d'urgence</Label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedPatient.emergencyContactPhone}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Onglet Médical */}
              <TabsContent value="medical" className="space-y-4">
                {selectedPatient.medicalHistory && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Historique médical</Label>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">{selectedPatient.medicalHistory}</p>
                    </div>
                  </div>
                )}
                {selectedPatient.allergies && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Allergies</Label>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{selectedPatient.allergies}</p>
                    </div>
                  </div>
                )}
                {selectedPatient.medications && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Médicaments actuels</Label>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">{selectedPatient.medications}</p>
                    </div>
                  </div>
                )}
                {selectedPatient.internalNotes && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes internes (non visibles par le patient)
                    </Label>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">{selectedPatient.internalNotes}</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Onglet Historique */}
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-2">
                  <Label>Historique des rendez-vous</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Heure</TableHead>
                        <TableHead>Praticien</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_APPOINTMENTS[selectedPatient.id]?.length ? (
                        MOCK_APPOINTMENTS[selectedPatient.id].map((apt) => (
                          <TableRow key={apt.id}>
                            <TableCell>{format(new Date(apt.date), 'dd MMM yyyy', { locale: fr })}</TableCell>
                            <TableCell>{apt.time}</TableCell>
                            <TableCell>{apt.practitioner}</TableCell>
                            <TableCell>{apt.service}</TableCell>
                            <TableCell>{getStatusBadge(apt.status)}</TableCell>
                            <TableCell>{apt.notes || '-'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Aucun rendez-vous enregistré
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Dialog de création/modification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Modifier' : 'Nouveau'} Patient</DialogTitle>
            <DialogDescription>
              Remplissez les informations du patient. Les champs marqués d'un * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Informations de base */}
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Prénom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Nom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemple.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Téléphone *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="06 12 34 56 78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date de naissance</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Sexe</Label>
              <Select
                value={formData.gender || ''}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Homme">Homme</SelectItem>
                  <SelectItem value="Femme">Femme</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Adresse */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Rue de la Paix"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Paris"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">Code postal</Label>
              <Input
                id="zipCode"
                value={formData.zipCode || ''}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="75001"
              />
            </div>

            {/* Contact d'urgence */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contact d'urgence</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName || ''}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                placeholder="Nom du contact"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Téléphone d'urgence</Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone || ''}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                placeholder="06 98 76 54 32"
              />
            </div>

            {/* Informations médicales */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="medicalHistory">Historique médical</Label>
              <Textarea
                id="medicalHistory"
                value={formData.medicalHistory || ''}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                placeholder="Antécédents médicaux importants..."
                rows={3}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies || ''}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Liste des allergies connues..."
                rows={2}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="medications">Médicaments actuels</Label>
              <Textarea
                id="medications"
                value={formData.medications || ''}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                placeholder="Médicaments pris actuellement..."
                rows={2}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="internalNotes">Notes internes (non visibles par le patient)</Label>
              <Textarea
                id="internalNotes"
                value={formData.internalNotes || ''}
                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                placeholder="Notes internes pour le personnel..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSavePatient}>
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le patient{' '}
              <strong>
                {patientToDelete?.firstName} {patientToDelete?.lastName}
              </strong>
              ? Cette action est irréversible et supprimera également l'historique des rendez-vous.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePatient} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
