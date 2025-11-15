import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, ArrowLeft, CheckCircle2, Stethoscope, Briefcase } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function EnhancedBookAppointment() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1); // 1: Service/Provider, 2: Date, 3: Time, 4: Personal info
  const [selectedService, setSelectedService] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationHash, setConfirmationHash] = useState('');

  // Formulaire de données personnelles
  const [formData, setFormData] = useState({
    reason: '',
    notes: '',
    location: '',
  });

  // Récupérer les services
  const { data: services = [] } = trpc.services.list.useQuery();
  
  // Récupérer les praticiens
  const { data: practitioners = [] } = trpc.practitioners.list.useQuery();
  
  // Mutation pour créer un rendez-vous
  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: (data) => {
      setConfirmationHash(data.hash);
      setBookingConfirmed(true);
      toast.success('Rendez-vous confirmé !');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Créneaux horaires disponibles (exemple - devrait être calculé dynamiquement)
  const availableTimeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleServiceProviderSelection = () => {
    if (selectedService && selectedProvider) {
      setStep(2);
    } else {
      toast.error('Veuillez sélectionner un service et un praticien');
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setStep(3);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast.error('Informations manquantes');
      return;
    }

    createAppointment.mutate({
      practitionerId: parseInt(selectedProvider),
      serviceId: selectedService ? parseInt(selectedService) : undefined,
      appointmentDate: selectedDate,
      startTime: selectedTime,
      reason: formData.reason,
      notes: formData.notes,
      location: formData.location,
    });
  };

  const selectedServiceData = services.find(s => s.id === parseInt(selectedService));
  const selectedProviderData = practitioners.find(p => p.id === parseInt(selectedProvider));

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Rendez-vous confirmé !</h2>
              <p className="text-gray-600 mb-4">
                Votre rendez-vous a été enregistré avec succès.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left space-y-2">
                <p className="text-sm text-gray-700">
                  <strong>Service :</strong> {selectedServiceData?.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Praticien :</strong> {selectedProviderData?.firstName} {selectedProviderData?.lastName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Date :</strong> {selectedDate?.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Heure :</strong> {selectedTime}
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-6">
                <p className="text-xs text-yellow-800">
                  <strong>Code d'annulation :</strong><br />
                  <code className="text-xs break-all">{confirmationHash}</code><br />
                  <span className="text-xs">Conservez ce code pour annuler votre rendez-vous si nécessaire.</span>
                </p>
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setLocation('/')} 
                  variant="outline" 
                  className="flex-1"
                >
                  Retour à l'accueil
                </Button>
                <Button 
                  onClick={() => {
                    setBookingConfirmed(false);
                    setStep(1);
                    setSelectedService('');
                    setSelectedProvider('');
                    setSelectedDate(undefined);
                    setSelectedTime('');
                    setFormData({
                      reason: '',
                      notes: '',
                      location: '',
                    });
                  }}
                  className="flex-1"
                >
                  Nouveau rendez-vous
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Prendre rendez-vous</h1>
          <p className="text-gray-600">Réservez votre consultation en quelques étapes</p>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Service</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <CalendarIcon className="h-5 w-5" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Date</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <Clock className="h-5 w-5" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Heure</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 4 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <User className="h-5 w-5" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Détails</span>
            </div>
          </div>
        </div>

        {/* Étape 1: Sélection du service et du praticien */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Choisissez un service et un praticien</CardTitle>
              <CardDescription>
                Sélectionnez le type de consultation et le professionnel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="service">Service *</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Sélectionnez un service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} - {service.duration} min
                        {service.price && ` - ${service.price} ${service.currency}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedServiceData && (
                  <p className="text-sm text-gray-600 mt-2">{selectedServiceData.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Praticien *</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Sélectionnez un praticien" />
                  </SelectTrigger>
                  <SelectContent>
                    {practitioners.map((practitioner) => (
                      <SelectItem key={practitioner.id} value={practitioner.id.toString()}>
                        {practitioner.firstName} {practitioner.lastName} - {practitioner.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProviderData && (
                  <p className="text-sm text-gray-600 mt-2">{selectedProviderData.biography}</p>
                )}
              </div>

              <Button 
                onClick={handleServiceProviderSelection} 
                className="w-full"
                disabled={!selectedService || !selectedProvider}
              >
                Continuer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Étape 2: Sélection de la date */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Choisissez une date</CardTitle>
              <CardDescription>
                Sélectionnez la date de votre rendez-vous
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                className="rounded-md border"
              />
              <div className="mt-6">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 3: Sélection de l'heure */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Choisissez un créneau horaire</CardTitle>
              <CardDescription>
                Date sélectionnée : {selectedDate?.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableTimeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    className="h-12"
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Changer la date
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 4: Détails et confirmation */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Détails de la consultation</CardTitle>
              <CardDescription>
                Ajoutez des informations complémentaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg mb-6 space-y-2">
                <p className="text-sm text-gray-700">
                  <strong>Service :</strong> {selectedServiceData?.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Praticien :</strong> {selectedProviderData?.firstName} {selectedProviderData?.lastName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Date :</strong> {selectedDate?.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Heure :</strong> {selectedTime}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Motif de consultation *</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Décrivez brièvement la raison de votre consultation..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes complémentaires (optionnel)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Informations supplémentaires..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lieu préféré (optionnel)</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Cabinet, téléconsultation, etc."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(3)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createAppointment.isPending}
                    className="flex-1"
                  >
                    {createAppointment.isPending ? 'Confirmation...' : 'Confirmer le rendez-vous'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
