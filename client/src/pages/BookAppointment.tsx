import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  ArrowLeft, 
  CheckCircle2, 
  CalendarDays,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  MapPin,
  Star
} from 'lucide-react';

// Configuration du client tRPC optimisé
const API_BASE = '/api/trpc';

async function callTRPC(method: string, input: any) {
  const response = await fetch(`${API_BASE}/booking.${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur API');
  }

  const result = await response.json();
  return result.result.data.json;
}

export default function OptimizedBookAppointment() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  // Formulaire de données personnelles
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: '',
  });

  // Charger le statut du service au démarrage
  useEffect(() => {
    loadHealthStatus();
  }, []);

  // Charger les créneaux disponibles quand la date change
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadHealthStatus = async () => {
    try {
      const status = await callTRPC('healthCheck', {});
      setHealthStatus(status);
      console.log("✅ Statut du service:", status);
    } catch (error) {
      console.error("❌ Erreur statut service:", error);
    }
  };

  const loadAvailableSlots = async (date: Date) => {
    setIsLoadingSlots(true);
    try {
      const dateStr = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      const result = await callTRPC('getAvailableSlots', { date: dateStr });
      
      setAvailableSlots(result.availableSlots || []);
      
      if (result.availableSlots.length === 0) {
        toast.info("Aucun créneau disponible pour cette date");
      } else {
        toast.success(`${result.availableSlots.length} créneaux disponibles`);
      }
      
    } catch (error) {
      console.error("❌ Erreur chargement créneaux:", error);
      toast.error("Impossible de charger les créneaux disponibles");
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time selection
    if (date) {
      setStep(2);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
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
      toast.error("Veuillez sélectionner une date et un créneau");
      return;
    }

    setIsSubmitting(true);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const result = await callTRPC('bookAppointment', {
        date: dateStr,
        time: selectedTime,
        patientInfo: formData
      });

      if (result.success) {
        setBookingConfirmed(true);
        toast.success('Rendez-vous confirmé ! Un email de confirmation a été envoyé.');
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          reason: '',
        });
      } else {
        throw new Error(result.message || 'Erreur lors de la confirmation');
      }
      
    } catch (error) {
      console.error("❌ Erreur soumission:", error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la prise de rendez-vous');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0 || date.getDay() === 6; // Past dates and weekends
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-2xl border-0 bg-white/80 backdrop-blur">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-6 rounded-full">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Rendez-vous confirmé !
              </h2>
              
              <p className="text-gray-600 mb-6 text-lg">
                Votre rendez-vous a été enregistré avec succès dans mon agenda Google.
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl mb-6 text-left border border-blue-100">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <CalendarDays className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Détails du rendez-vous</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date :</span>
                        <span className="font-medium">
                          {selectedDate?.toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heure :</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durée :</span>
                        <span className="font-medium">60 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Praticien :</span>
                        <span className="font-medium">Dorian Sarry</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg mb-6 border border-amber-200">
                <div className="flex items-center space-x-2 text-amber-800">
                  <Mail className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Un email de confirmation a été envoyé à <strong>{formData.email}</strong>
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => setLocation('/')} 
                  variant="outline" 
                  className="flex-1 h-12 text-base font-medium"
                >
                  Retour à l'accueil
                </Button>
                <Button 
                  onClick={() => {
                    setBookingConfirmed(false);
                    setStep(1);
                    setSelectedDate(undefined);
                    setSelectedTime('');
                    setAvailableSlots([]);
                  }}
                  className="flex-1 h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-blue-100">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 text-gray-900">
              Prendre rendez-vous
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              Consultation de 60 minutes avec Dorian Sarry
            </p>
            
            {/* Status indicators */}
            <div className="flex justify-center items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${healthStatus?.calendarInitialized ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-gray-600">
                  {healthStatus?.calendarInitialized ? 'Agenda synchronisé' : 'Mode dégradé'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Durée fixe: 60 minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indicateur de progression amélioré */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= stepNumber 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > stepNumber ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    step >= stepNumber ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {stepNumber === 1 ? 'Date' : stepNumber === 2 ? 'Créneau' : 'Informations'}
                  </span>
                </div>
                
                {stepNumber < 3 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Étape 1: Sélection de la date */}
        {step === 1 && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Choisissez une date</CardTitle>
              <CardDescription className="text-lg">
                Sélectionnez la date de votre consultation (du lundi au vendredi)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="bg-gradient-to-b from-blue-50 to-white p-6 rounded-xl">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  className="rounded-md border-0 shadow-none"
                  classNames={{
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                    day_today: "bg-blue-100 text-blue-600 font-bold",
                    day_disabled: "text-gray-300 cursor-not-allowed",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 2: Sélection de l'heure */}
        {step === 2 && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">
                Choisissez un créneau de 60 minutes
              </CardTitle>
              <CardDescription className="text-lg">
                {selectedDate?.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
                  <span className="text-lg">Chargement des créneaux disponibles...</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucun créneau disponible
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Cette date est entièrement réservée. Veuillez choisir une autre date.
                  </p>
                  <Button onClick={() => setStep(1)} className="bg-blue-600 hover:bg-blue-700">
                    Choisir une autre date
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <MapPin className="h-5 w-5" />
                      <span className="font-medium">Créneaux disponibles (heure exacte):</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {availableSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        className={`h-14 text-lg font-medium transition-all ${
                          selectedTime === time 
                            ? 'bg-blue-600 text-white shadow-lg scale-105' 
                            : 'hover:bg-blue-50 hover:border-blue-300'
                        }`}
                        onClick={() => handleTimeSelect(time)}
                      >
                        <div className="flex flex-col items-center">
                          <Clock className="h-5 w-5 mb-1" />
                          {time}
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="mt-8 text-center">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Changer la date
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Étape 3: Informations personnelles */}
        {step === 3 && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Vos informations</CardTitle>
              <CardDescription className="text-lg">
                Veuillez remplir vos coordonnées pour confirmer le rendez-vous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <CalendarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Récapitulatif</h3>
                    <p className="text-gray-700">
                      <strong>{selectedDate?.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</strong> à <strong>{selectedTime}</strong>
                    </p>
                    <p className="text-sm text-gray-600">Consultation de 60 minutes</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-base font-medium">Prénom *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="h-12 text-base"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-base font-medium">Nom *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="h-12 text-base"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-medium flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12 text-base"
                    placeholder="votre@email.com"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base font-medium flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Téléphone *
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="h-12 text-base"
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="reason" className="text-base font-medium">Motif de consultation (optionnel)</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    className="text-base"
                    placeholder="Décrivez brièvement la raison de votre consultation..."
                  />
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start space-x-2 text-amber-800">
                    <Star className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Après confirmation :</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Le rendez-vous sera ajouté à mon agenda Google</li>
                        <li>• Vous recevrez un email de confirmation</li>
                        <li>• Un rappel vous sera envoyé 24h avant</li>
                        <li>• Annulation possible jusqu'à 24h à l'avance</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    className="h-12 flex-1 text-base"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Confirmation...
                      </>
                    ) : (
                      <>
                        Confirmer le rendez-vous
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
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