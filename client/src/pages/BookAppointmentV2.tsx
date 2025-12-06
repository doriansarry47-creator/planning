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
  Loader2,
  AlertCircle
} from 'lucide-react';
import { trpc, trpcClient } from '@/lib/trpc';

/**
 * Page de réservation de rendez-vous améliorée
 * Intégration avec Google Calendar via iCal
 * Créneaux de 60 minutes uniquement
 */
export default function BookAppointmentV2() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1); // 1: Date, 2: Time, 3: Info
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Record<string, any[]>>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  // Formulaire de données personnelles
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: '',
  });

  // Charger les disponibilités au montage du composant
  useEffect(() => {
    loadAvailabilities();
  }, []);

  const loadAvailabilities = async () => {
    setIsLoadingSlots(true);
    try {
      // Charger les 90 prochains jours
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 90);

      const result = await trpcClient.booking.getAvailabilitiesByDate.query({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      if (result.success) {
        setAvailableSlots(result.slotsByDate);
        setAvailableDates(result.availableDates);
        console.log(`Disponibilités chargées: ${result.availableDates.length} dates`);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des disponibilités:', error);
      toast.error('Impossible de charger les disponibilités');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const dateStr = date.toISOString().split('T')[0];
    
    // Vérifier si la date a des créneaux disponibles
    if (availableSlots[dateStr] && availableSlots[dateStr].length > 0) {
      setSelectedDate(date);
      setStep(2);
    } else {
      toast.error('Aucun créneau disponible pour cette date');
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
      toast.error('Veuillez sélectionner une date et une heure');
      return;
    }

    setIsSubmitting(true);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const result = await trpcClient.booking.bookAppointment.mutate({
        date: dateStr,
        startTime: selectedTime,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        reason: formData.reason,
      });

      if (result.success) {
        setBookingConfirmed(true);
        toast.success('Rendez-vous confirmé !');
        
        // Recharger les disponibilités après la réservation
        await loadAvailabilities();
      } else {
        toast.error('Erreur lors de la réservation');
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la prise de rendez-vous');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour vérifier si une date a des créneaux disponibles
  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableDates.includes(dateStr);
  };

  // Fonction pour désactiver les dates sans disponibilités
  const disabledDates = (date: Date) => {
    // Désactiver les dates passées
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    // Désactiver les dates sans créneaux disponibles
    return !isDateAvailable(date);
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-2xl border-2 border-green-200">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-full shadow-lg">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-3 text-gray-900">Rendez-vous confirmé !</h2>
              <p className="text-gray-600 mb-6">
                Votre rendez-vous a été enregistré avec succès dans Google Calendar.
              </p>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl mb-6 text-left border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CalendarIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Date</p>
                      <p className="text-base text-gray-900">
                        {selectedDate?.toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Heure</p>
                      <p className="text-base text-gray-900">{selectedTime} (durée: 60 minutes)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Praticien</p>
                      <p className="text-base text-gray-900">Dorian Sarry</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">
                      Email de confirmation envoyé
                    </p>
                    <p className="text-sm text-yellow-700">
                      Un email de confirmation a été envoyé à <strong>{formData.email}</strong>
                      <br />
                      Vous recevrez un rappel 24h avant votre rendez-vous.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={() => setLocation('/')} 
                  variant="outline" 
                  className="flex-1 h-12"
                >
                  Retour à l'accueil
                </Button>
                <Button 
                  onClick={() => {
                    setBookingConfirmed(false);
                    setStep(1);
                    setSelectedDate(undefined);
                    setSelectedTime('');
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      reason: '',
                    });
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="hover:bg-white/80">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Prendre rendez-vous
          </h1>
          <p className="text-gray-600 text-lg">Choisissez une date et un créneau horaire disponible (60 min)</p>
        </div>

        {/* Indicateur de progression amélioré */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            {/* Ligne de progression */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-green-600 transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>

            {/* Étape 1 */}
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 ${
                step >= 1 
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg' 
                  : 'border-gray-300 bg-white'
              }`}>
                <CalendarIcon className="h-6 w-6" />
              </div>
              <span className="mt-2 font-semibold text-sm">Date</span>
            </div>

            {/* Étape 2 */}
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 ${
                step >= 2 
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg' 
                  : 'border-gray-300 bg-white'
              }`}>
                <Clock className="h-6 w-6" />
              </div>
              <span className="mt-2 font-semibold text-sm">Heure</span>
            </div>

            {/* Étape 3 */}
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 ${
                step >= 3 
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg' 
                  : 'border-gray-300 bg-white'
              }`}>
                <User className="h-6 w-6" />
              </div>
              <span className="mt-2 font-semibold text-sm">Infos</span>
            </div>
          </div>
        </div>

        {/* Étape 1: Sélection de la date */}
        {step === 1 && (
          <Card className="shadow-xl border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardTitle className="text-2xl">Choisissez une date</CardTitle>
              <CardDescription className="text-base">
                Sélectionnez la date de votre rendez-vous parmi les dates disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingSlots ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600">Chargement des disponibilités...</p>
                </div>
              ) : availableDates.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Aucune disponibilité trouvée</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Veuillez contacter le cabinet directement
                  </p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={disabledDates}
                    className="rounded-xl border-2 border-gray-200 shadow-sm"
                    classNames={{
                      day_selected: 'bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700',
                      day_today: 'bg-blue-100 text-blue-900',
                    }}
                  />
                </div>
              )}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Astuce :</strong> Les dates en surbrillance ont des créneaux disponibles.
                  Tous les rendez-vous durent 60 minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 2: Sélection de l'heure */}
        {step === 2 && selectedDate && (
          <Card className="shadow-xl border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardTitle className="text-2xl">Choisissez un créneau horaire</CardTitle>
              <CardDescription className="text-base">
                Date sélectionnée : <strong>{selectedDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {(() => {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const slots = availableSlots[dateStr] || [];
                
                if (slots.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun créneau disponible pour cette date</p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {slots.map((slot: any) => (
                        <Button
                          key={slot.startTime}
                          variant={selectedTime === slot.startTime ? 'default' : 'outline'}
                          className={`h-14 text-base font-semibold transition-all ${
                            selectedTime === slot.startTime
                              ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg scale-105'
                              : 'hover:border-blue-400 hover:bg-blue-50'
                          }`}
                          onClick={() => handleTimeSelect(slot.startTime)}
                        >
                          <div className="flex flex-col">
                            <span>{slot.startTime}</span>
                            <span className="text-xs opacity-80">(60 min)</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        <strong>✅ {slots.length} créneaux disponibles</strong> de 60 minutes pour cette journée
                      </p>
                    </div>
                  </>
                );
              })()}
              <div className="mt-6">
                <Button variant="ghost" onClick={() => setStep(1)} className="hover:bg-gray-100">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Changer la date
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 3: Informations personnelles */}
        {step === 3 && (
          <Card className="shadow-xl border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardTitle className="text-2xl">Vos informations</CardTitle>
              <CardDescription className="text-base">
                Veuillez remplir vos coordonnées pour confirmer le rendez-vous
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl mb-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">📅 Récapitulatif</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">
                    <strong>Date :</strong> {selectedDate?.toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-gray-700">
                    <strong>Heure :</strong> {selectedTime} - {(() => {
                      const [h, m] = selectedTime.split(':').map(Number);
                      const endDate = new Date();
                      endDate.setHours(h, m + 60);
                      return endDate.toTimeString().slice(0, 5);
                    })()} (60 minutes)
                  </p>
                  <p className="text-gray-700">
                    <strong>Praticien :</strong> Dorian Sarry
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-base font-semibold">Prénom *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-2 focus:border-blue-500"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-base font-semibold">Nom *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-2 focus:border-blue-500"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-11 pl-10 border-2 focus:border-blue-500"
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-semibold">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="h-11 pl-10 border-2 focus:border-blue-500"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-base font-semibold">
                    Motif de consultation (optionnel)
                  </Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    className="border-2 focus:border-blue-500 resize-none"
                    placeholder="Décrivez brièvement la raison de votre consultation..."
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      En confirmant, vous recevrez un email de confirmation et un rappel 24h avant votre rendez-vous.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    className="h-12"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold text-lg shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Confirmation en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Confirmer le rendez-vous
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
