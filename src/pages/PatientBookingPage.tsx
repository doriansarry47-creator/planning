import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TherapyIntakeForm } from '@/components/therapy/TherapyIntakeForm';
import { 
  Calendar, 
  Clock, 
  Monitor, 
  MapPin, 
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  User,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface BookingStep {
  step: 1 | 2 | 3 | 4;
  title: string;
}

const AVAILABLE_TIMES = [
  { id: '1', time: '09:00', available: true },
  { id: '2', time: '10:00', available: true },
  { id: '3', time: '11:00', available: false },
  { id: '4', time: '14:00', available: true },
  { id: '5', time: '15:00', available: true },
  { id: '6', time: '16:00', available: true },
  { id: '7', time: '17:00', available: false },
  { id: '8', time: '18:00', available: true },
];

export function PatientBookingPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'cabinet' | 'visio' | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const steps: BookingStep[] = [
    { step: 1, title: 'Type de consultation' },
    { step: 2, title: 'Date et heure' },
    { step: 3, title: 'Informations personnelles' },
    { step: 4, title: 'Confirmation' }
  ];

  // Générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent pour compléter la première semaine
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && date.getDay() !== 0 && date.getDay() !== 6; // Pas le weekend
  };

  const handleDateSelect = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
    }
  };

  const handleFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Simuler l'envoi des données
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(4);
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedType !== null;
      case 2:
        return selectedDate !== null && selectedTime !== '';
      case 3:
        return true; // Le formulaire gère sa propre validation
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-2 rounded-lg mr-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prendre rendez-vous</h1>
                <p className="text-gray-600">Dorian Sarry - Thérapie Sensorimotrice</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.step}>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step.step 
                        ? 'bg-teal-600 text-white' 
                        : currentStep > step.step 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > step.step ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.step
                      )}
                    </div>
                    <span className={`ml-3 text-sm font-medium ${
                      currentStep >= step.step ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      currentStep > step.step ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Étape 1: Type de consultation */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Choisissez votre type de consultation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div 
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                    selectedType === 'cabinet' 
                      ? 'border-teal-600 bg-teal-50' 
                      : 'border-gray-200 hover:border-teal-300'
                  }`}
                  onClick={() => setSelectedType('cabinet')}
                >
                  <div className="text-center">
                    <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Consultation en Cabinet</h3>
                    <p className="text-gray-600 mb-4">
                      Séance en présentiel dans un environnement thérapeutique sécurisant
                    </p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center justify-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>60 minutes</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Cabinet à [Ville]</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                    selectedType === 'visio' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedType('visio')}
                >
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Monitor className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Consultation en Visioconférence</h3>
                    <p className="text-gray-600 mb-4">
                      Séance à distance dans le confort de votre domicile
                    </p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center justify-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>60 minutes</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <Monitor className="h-4 w-4 mr-2" />
                        <span>Plateforme sécurisée</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-8">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToNext()}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Continuer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 2: Date et heure */}
        {currentStep === 2 && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Choisissez une date</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600">
                  {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map(({ date, isCurrentMonth }, index) => {
                    const isAvailable = isCurrentMonth && isDateAvailable(date);
                    const isSelected = selectedDate && 
                      date.toDateString() === selectedDate.toDateString();
                    
                    return (
                      <button
                        key={index}
                        className={`p-2 text-sm rounded-md transition-colors ${
                          !isCurrentMonth 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : !isAvailable 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : isSelected 
                            ? 'bg-teal-600 text-white' 
                            : 'text-gray-700 hover:bg-teal-50'
                        }`}
                        onClick={() => isAvailable && handleDateSelect(date)}
                        disabled={!isAvailable}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Choisissez un horaire</CardTitle>
                <p className="text-gray-600">
                  {selectedDate 
                    ? formatDate(selectedDate)
                    : 'Sélectionnez d\'abord une date'
                  }
                </p>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_TIMES.map((slot) => (
                      <button
                        key={slot.id}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          !slot.available 
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                            : selectedTime === slot.time 
                            ? 'border-teal-600 bg-teal-50 text-teal-700' 
                            : 'border-gray-200 hover:border-teal-300 text-gray-700'
                        }`}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                      >
                        <div className="font-medium">{slot.time}</div>
                        <div className="text-sm">
                          {slot.available ? 'Disponible' : 'Réservé'}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4" />
                    <p>Sélectionnez une date pour voir les créneaux disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="lg:col-span-2 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedToNext()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Continuer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Étape 3: Formulaire d'informations */}
        {currentStep === 3 && (
          <div>
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(2)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
            
            <TherapyIntakeForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              selectedDate={selectedDate || undefined}
              selectedTime={selectedTime}
            />
          </div>
        )}

        {/* Étape 4: Confirmation */}
        {currentStep === 4 && (
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Rendez-vous confirmé !
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                Votre compte a été créé et votre rendez-vous a été programmé avec succès.
              </p>
              
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-teal-900 mb-4">Récapitulatif de votre rendez-vous :</h3>
                <div className="space-y-2 text-teal-700">
                  <p><strong>Date :</strong> {selectedDate && formatDate(selectedDate)}</p>
                  <p><strong>Heure :</strong> {selectedTime}</p>
                  <p><strong>Type :</strong> {selectedType === 'cabinet' ? 'Consultation en cabinet' : 'Visioconférence'}</p>
                  <p><strong>Praticien :</strong> Dorian Sarry</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-4">Prochaines étapes :</h3>
                <div className="text-left space-y-2 text-blue-700">
                  <p>✅ Un email de confirmation vous a été envoyé</p>
                  <p>✅ Vous recevrez un rappel 24h avant votre rendez-vous</p>
                  {selectedType === 'visio' && (
                    <p>✅ Le lien de visioconférence vous sera envoyé la veille</p>
                  )}
                  <p>✅ Vous pouvez gérer vos rendez-vous depuis votre espace patient</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => window.location.href = '/patient/dashboard'}
                >
                  <User className="h-4 w-4 mr-2" />
                  Accéder à mon espace
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  Retourner à l'accueil
                </Button>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-gray-600 mb-4">
                  Une question ? N'hésitez pas à me contacter :
                </p>
                <div className="flex justify-center space-x-6 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    dorian.sarry@example.com
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    06 XX XX XX XX
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}