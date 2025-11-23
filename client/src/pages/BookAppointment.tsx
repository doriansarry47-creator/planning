import React, { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  RefreshCw,
  CalendarIcon
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00'
];

export default function BookAppointment() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: '',
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
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
      
      const response = await fetch('/api/trpc/booking.bookAppointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            date: dateStr,
            startTime: selectedTime,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            reason: formData.reason,
          }
        })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la réservation");
      }

      const result = await response.json();
      if (result.result?.data?.json?.success) {
        setBookingConfirmed(true);
        toast.success('Rendez-vous confirmé ! Un email de confirmation a été envoyé.');
      } else {
        throw new Error(result.result?.data?.json?.message || "Erreur inconnue");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la réservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0 || date.getDay() === 6;
  };

  // Confirmation screen
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
                Votre rendez-vous a été enregistré avec succès.
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl mb-6 text-left border border-blue-100">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
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
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-6">
                ✉️ Un email de confirmation a été envoyé à <strong>{formData.email}</strong>
              </p>
              
              <Link href="/">
                <Button className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700">
                  Retour à l'accueil
                </Button>
              </Link>
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
          </div>
        </div>

        {/* Progress indicator */}
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
                    {stepNumber === 1 ? 'Date' : stepNumber === 2 ? 'Heure' : 'Infos'}
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

        {/* Step 1: Date Selection */}
        {step === 1 && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Choisissez une date</CardTitle>
              <CardDescription className="text-lg">
                Sélectionnez la date de votre consultation
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

        {/* Step 2: Time Selection */}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {TIME_SLOTS.map((time) => (
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
              
              <div className="text-center">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Changer la date
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Patient Info */}
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
