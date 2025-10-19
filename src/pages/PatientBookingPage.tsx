import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { OrganicBackground } from '@/components/ui/organic-background';
import { TherapyIntakeForm } from '@/components/therapy/TherapyIntakeForm';
import { QuickAppointmentForm } from '@/components/therapy/QuickAppointmentForm';
import { useAuth } from '@/hooks/useAuth';
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
  step: 1 | 2 | 3;
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
  const { user, isAuthenticated, userType } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'cabinet' | null>('cabinet');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  // Si l'utilisateur est déjà connecté en tant que patient, on adapte l'expérience
  const isExistingPatient = isAuthenticated && userType === 'patient';

  const steps: BookingStep[] = isExistingPatient ? [
    { step: 1, title: 'Date et heure' },
    { step: 2, title: 'Motif de consultation' },
    { step: 3, title: 'Confirmation' }
  ] : [
    { step: 1, title: 'Date et heure' },
    { step: 2, title: 'Informations personnelles' },
    { step: 3, title: 'Confirmation' }
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
      setCurrentStep(3);
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
        return selectedDate !== null && selectedTime !== '';
      case 2:
        return true; // Le formulaire gère sa propre validation
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-therapy-50 relative">
      <OrganicBackground variant="subtle" />
      
      {/* Header */}
      <header className="relative bg-white/90 backdrop-blur-md shadow-lg border-b border-sage-200/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-sage-600 to-therapy-600 p-2 rounded-lg mr-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isExistingPatient ? 'Nouveau rendez-vous' : 'Prendre rendez-vous'}
                </h1>
                <p className="text-gray-600">Dorian Sarry - Thérapie Sensorimotrice</p>
                {isExistingPatient && user && (
                  <p className="text-sm text-sage-600 font-medium">
                    Connecté en tant que {user.firstName} {user.lastName}
                  </p>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = isExistingPatient ? '/patient/dashboard' : '/'}
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
                        ? 'bg-sage-600 text-white shadow-lg' 
                        : currentStep > step.step 
                        ? 'bg-therapy-600 text-white shadow-md' 
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
                      currentStep > step.step ? 'bg-therapy-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Informations cabinet et connexion patient */}
        <div className="space-y-6 mb-8">
          <Card className="border-0 bg-gradient-to-br from-cream-100/80 to-sage-100/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="bg-gradient-to-r from-sage-600 to-therapy-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Consultation en Cabinet</h3>
                <p className="text-gray-600 mb-4">
                  Toutes les séances se déroulent en présentiel dans le cabinet thérapeutique
                </p>
                <div className="flex justify-center space-x-6 text-sm text-therapy-700">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-sage-600" />
                    <span>60 minutes par séance</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-sage-600" />
                    <span>20 rue des Jacobins, 24000 Périgueux</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message pour patients existants */}
          {!isExistingPatient && (
            <Card className="border-sage-200 bg-sage-50/60 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="text-center">
                  <User className="h-6 w-6 text-sage-600 mx-auto mb-2" />
                  <p className="text-sage-800 font-medium mb-2">Déjà patient ?</p>
                  <p className="text-sage-700 text-sm mb-3">
                    Connectez-vous pour un processus de réservation plus rapide
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/login/patient'}
                    className="border-sage-300 text-sage-700 hover:bg-sage-100"
                  >
                    Se connecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Étape 1: Date et heure */}
        {currentStep === 1 && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
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
                            ? 'bg-sage-600 text-white shadow-lg' 
                            : 'text-gray-700 hover:bg-sage-50'
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

            <Card className="backdrop-blur-sm bg-white/90 shadow-xl">
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
                            ? 'border-sage-600 bg-sage-50 text-sage-700 shadow-lg' 
                            : 'border-gray-200 hover:border-sage-300 text-gray-700'
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
            
            <div className="lg:col-span-2 flex justify-end">
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToNext()}
                className="bg-gradient-to-r from-sage-600 to-therapy-600 hover:from-sage-700 hover:to-therapy-700 shadow-lg"
              >
                Continuer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Étape 2: Formulaire d'informations */}
        {currentStep === 2 && (
          <div>
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
            
            {isExistingPatient ? (
              <QuickAppointmentForm
                user={user}
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                selectedDate={selectedDate || undefined}
                selectedTime={selectedTime}
              />
            ) : (
              <TherapyIntakeForm
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                selectedDate={selectedDate || undefined}
                selectedTime={selectedTime}
              />
            )}
          </div>
        )}

        {/* Étape 3: Confirmation */}
        {currentStep === 3 && (
          <Card className="text-center backdrop-blur-sm bg-white/90 shadow-xl">
            <CardContent className="p-12">
              <div className="bg-therapy-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Check className="h-10 w-10 text-therapy-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Rendez-vous confirmé !
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                Votre rendez-vous avec Dorian Sarry est bien enregistré. Vous recevrez une confirmation par SMS et e-mail.
              </p>
              
              <div className="bg-sage-50 border border-sage-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-sage-900 mb-4">Récapitulatif de votre rendez-vous :</h3>
                <div className="space-y-2 text-sage-700">
                  <p><strong>Date :</strong> {selectedDate && formatDate(selectedDate)}</p>
                  <p><strong>Heure :</strong> {selectedTime}</p>
                  <p><strong>Type :</strong> Consultation en cabinet</p>
                  <p><strong>Praticien :</strong> Dorian Sarry</p>
                  <p><strong>Lieu :</strong> 20 rue des Jacobins, 24000 Périgueux</p>
                </div>
              </div>
              
              <div className="bg-therapy-50 border border-therapy-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-therapy-900 mb-4">Prochaines étapes :</h3>
                <div className="text-left space-y-2 text-therapy-700">
                  <p>✅ Un email de confirmation vous a été envoyé</p>
                  <p>✅ Vous recevrez un SMS de confirmation</p>
                  <p>✅ Vous recevrez un rappel SMS 24h avant votre rendez-vous</p>
                  <p>✅ Vous pouvez gérer vos rendez-vous depuis votre espace patient</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-gradient-to-r from-sage-600 to-therapy-600 hover:from-sage-700 hover:to-therapy-700 shadow-lg"
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
                    doriansarry@yahoo.fr
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    06.45.15.63.68
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