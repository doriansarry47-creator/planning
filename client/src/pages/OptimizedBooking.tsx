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
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';
import { trpcClient } from '@/lib/trpc';

/**
 * Page de réservation optimisée
 * - Durée fixe de 60 minutes pour tous les rendez-vous
 * - Lecture des disponibilités depuis Google Calendar (via iCal)
 * - Création automatique des rendez-vous dans Google Calendar
 * - Envoi d'emails de confirmation
 * - Rappels automatiques 24h avant
 */
export default function OptimizedBooking() {
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
        console.log(`✅ Disponibilités chargées: ${result.availableDates.length} dates`);
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des disponibilités:', error);
      toast.error('Impossible de charger les disponibilités. Veuillez réessayer.');
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
      setSelectedTime(''); // Reset time selection
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
        toast.success('🎉 Rendez-vous confirmé !');
        
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-2 border-green-200 bg-white">
          <CardContent className="pt-12 pb-8">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-green-100 to-green-200 p-8 rounded-full shadow-2xl">
                    <CheckCircle2 className="h-20 w-20 text-green-600" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Rendez-vous confirmé ! 🎉
              </h2>
              
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Votre rendez-vous a été enregistré avec succès dans Google Calendar.
                Vous allez recevoir un email de confirmation.
              </p>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl mb-8 text-left border-2 border-blue-200 shadow-lg">
                <h3 className="font-bold text-xl mb-6 text-gray-900 flex items-center">
                  <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
                  Détails de votre rendez-vous
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start bg-white p-4 rounded-xl shadow-sm">
                    <CalendarIcon className="h-6 w-6 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Date</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedDate?.toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-white p-4 rounded-xl shadow-sm">
                    <Clock className="h-6 w-6 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Horaire</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedTime} - {(() => {
                          const [h, m] = selectedTime.split(':').map(Number);
                          const endDate = new Date();
                          endDate.setHours(h, m + 60);
                          return endDate.toTimeString().slice(0, 5);
                        })()}
                        <span className="text-sm font-normal text-gray-600 ml-2">(60 minutes)</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-white p-4 rounded-xl shadow-sm">
                    <User className="h-6 w-6 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Praticien</p>
                      <p className="text-lg font-bold text-gray-900">Dr. Dorian Sarry</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 mb-8 shadow-lg">
                <div className="flex items-start">
                  <Sparkles className="h-6 w-6 text-amber-600 mr-4 mt-0.5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="text-base font-bold text-amber-900 mb-2">
                      📧 Confirmation envoyée
                    </p>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Un email de confirmation a été envoyé à <strong className="font-semibold">{formData.email}</strong>
                      <br />
                      Vous recevrez également un rappel automatique <strong className="font-semibold">24 heures avant</strong> votre rendez-vous.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setLocation('/')} 
                  variant="outline" 
                  className="flex-1 h-14 text-base font-semibold border-2 hover:bg-gray-50"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
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
                  className="flex-1 h-14 text-base font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Bouton retour */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="hover:bg-white/80 font-semibold">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        {/* En-tête */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            Prendre rendez-vous
          </h1>
          <p className="text-gray-600 text-xl font-medium">
            Choisissez un créneau disponible de <span className="font-bold text-blue-600">60 minutes</span>
          </p>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Ligne de progression */}
            <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 -z-10 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 transition-all duration-500 rounded-full shadow-lg"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>

            {/* Étape 1: Date */}
            <div className={`flex flex-col items-center transition-all duration-300 ${step >= 1 ? 'scale-110' : 'scale-100'}`}>
              <div className={`flex items-center justify-center w-14 h-14 rounded-full border-4 transition-all duration-300 ${
                step >= 1 
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl' 
                  : 'border-gray-300 bg-white'
              }`}>
                <CalendarIcon className={`h-7 w-7 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <span className={`mt-3 font-bold text-base ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                Date
              </span>
            </div>

            {/* Étape 2: Heure */}
            <div className={`flex flex-col items-center transition-all duration-300 ${step >= 2 ? 'scale-110' : 'scale-100'}`}>
              <div className={`flex items-center justify-center w-14 h-14 rounded-full border-4 transition-all duration-300 ${
                step >= 2 
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl' 
                  : 'border-gray-300 bg-white'
              }`}>
                <Clock className={`h-7 w-7 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <span className={`mt-3 font-bold text-base ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                Heure
              </span>
            </div>

            {/* Étape 3: Infos */}
            <div className={`flex flex-col items-center transition-all duration-300 ${step >= 3 ? 'scale-110' : 'scale-100'}`}>
              <div className={`flex items-center justify-center w-14 h-14 rounded-full border-4 transition-all duration-300 ${
                step >= 3 
                  ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl' 
                  : 'border-gray-300 bg-white'
              }`}>
                <User className={`h-7 w-7 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <span className={`mt-3 font-bold text-base ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                Vos infos
              </span>
            </div>
          </div>
        </div>

        {/* Étape 1: Sélection de la date */}
        {step === 1 && (
          <Card className="shadow-2xl border-2 border-blue-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b-2 border-blue-100">
              <CardTitle className="text-3xl font-bold text-gray-900">Choisissez une date</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Sélectionnez la date de votre rendez-vous parmi les dates disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              {isLoadingSlots ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-6" />
                  <p className="text-gray-600 text-lg font-medium">Chargement des disponibilités...</p>
                </div>
              ) : availableDates.length === 0 ? (
                <div className="text-center py-16">
                  <AlertCircle className="h-16 w-16 text-amber-600 mx-auto mb-6" />
                  <p className="text-gray-700 text-xl font-bold mb-2">Aucune disponibilité trouvée</p>
                  <p className="text-gray-600 text-base">
                    Veuillez contacter le cabinet directement pour plus d'informations
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={disabledDates}
                      className="rounded-2xl border-2 border-blue-200 shadow-xl bg-white p-4"
                      classNames={{
                        day_selected: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:from-blue-700 focus:to-indigo-700 font-bold shadow-lg scale-110',
                        day_today: 'bg-blue-100 text-blue-900 font-bold border-2 border-blue-600',
                        day: 'hover:bg-blue-50 transition-all duration-200',
                      }}
                    />
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-lg">
                    <div className="flex items-start">
                      <Info className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-base text-blue-900 font-semibold mb-1">
                          💡 Comment ça marche ?
                        </p>
                        <p className="text-sm text-blue-800 leading-relaxed">
                          Les dates en surbrillance ont des créneaux disponibles. 
                          <br />
                          <strong>Tous les rendez-vous durent exactement 60 minutes.</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Étape 2: Sélection de l'heure */}
        {step === 2 && selectedDate && (
          <Card className="shadow-2xl border-2 border-blue-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b-2 border-blue-100">
              <CardTitle className="text-3xl font-bold text-gray-900">Choisissez un créneau</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Date sélectionnée : <strong className="text-gray-900">{selectedDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              {(() => {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const slots = availableSlots[dateStr] || [];
                
                if (slots.length === 0) {
                  return (
                    <div className="text-center py-16">
                      <Clock className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                      <p className="text-gray-700 text-xl font-bold">Aucun créneau disponible</p>
                      <p className="text-gray-600 text-base mt-2">pour cette date</p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {slots.map((slot: any) => (
                        <Button
                          key={slot.startTime}
                          variant={selectedTime === slot.startTime ? 'default' : 'outline'}
                          className={`h-20 text-lg font-bold transition-all duration-200 ${
                            selectedTime === slot.startTime
                              ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-2xl scale-105 border-2 border-blue-600'
                              : 'hover:border-blue-400 hover:bg-blue-50 hover:scale-105 border-2'
                          }`}
                          onClick={() => handleTimeSelect(slot.startTime)}
                        >
                          <div className="flex flex-col">
                            <span className="text-xl">{slot.startTime}</span>
                            <span className="text-xs opacity-90 mt-1">(60 min)</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 mb-6 shadow-lg">
                      <p className="text-base text-green-900 font-bold">
                        ✅ {slots.length} créneaux disponibles de 60 minutes
                      </p>
                    </div>
                  </>
                );
              })()}
              
              <div className="mt-6">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setStep(1);
                    setSelectedTime('');
                  }} 
                  className="hover:bg-gray-100 font-semibold"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Changer la date
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 3: Informations personnelles */}
        {step === 3 && (
          <Card className="shadow-2xl border-2 border-blue-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b-2 border-blue-100">
              <CardTitle className="text-3xl font-bold text-gray-900">Vos informations</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Remplissez vos coordonnées pour confirmer le rendez-vous
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              {/* Récapitulatif */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl mb-8 border-2 border-blue-200 shadow-lg">
                <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center">
                  <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
                  📋 Récapitulatif
                </h3>
                <div className="space-y-3 text-base">
                  <p className="text-gray-800">
                    <strong>Date :</strong> {selectedDate?.toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-gray-800">
                    <strong>Heure :</strong> {selectedTime} - {(() => {
                      const [h, m] = selectedTime.split(':').map(Number);
                      const endDate = new Date();
                      endDate.setHours(h, m + 60);
                      return endDate.toTimeString().slice(0, 5);
                    })()} <span className="text-blue-600 font-bold">(60 minutes)</span>
                  </p>
                  <p className="text-gray-800">
                    <strong>Praticien :</strong> Dr. Dorian Sarry
                  </p>
                </div>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-base font-bold text-gray-700">Prénom *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="h-12 border-2 focus:border-blue-500 text-base"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-base font-bold text-gray-700">Nom *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="h-12 border-2 focus:border-blue-500 text-base"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-bold text-gray-700">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-12 pl-12 border-2 focus:border-blue-500 text-base"
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-bold text-gray-700">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="h-12 pl-12 border-2 focus:border-blue-500 text-base"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-base font-bold text-gray-700">
                    Motif de consultation (optionnel)
                  </Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    className="border-2 focus:border-blue-500 resize-none text-base"
                    placeholder="Décrivez brièvement la raison de votre consultation..."
                  />
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-5 shadow-lg">
                  <div className="flex items-start">
                    <Sparkles className="h-6 w-6 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-900 leading-relaxed">
                      En confirmant, vous recevrez un <strong>email de confirmation</strong> et un <strong>rappel automatique 24h avant</strong> votre rendez-vous.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setStep(2);
                    }}
                    className="h-14 text-base font-semibold border-2"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Retour
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white font-bold text-lg shadow-2xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Confirmation en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-6 w-6" />
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
