import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function BookAppointment() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1); // 1: Date selection, 2: Time selection, 3: Personal info
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Formulaire de données personnelles
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: '',
  });

  // Créneaux horaires disponibles (exemple)
  const availableTimeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
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
    setIsSubmitting(true);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Ici, vous enverriez les données à votre backend
      console.log('Rendez-vous créé:', {
        ...formData,
        date: selectedDate,
        time: selectedTime
      });

      setBookingConfirmed(true);
      toast.success('Rendez-vous confirmé !');
    } catch (error) {
      toast.error('Erreur lors de la prise de rendez-vous');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-gray-700">
                  <strong>Date :</strong> {selectedDate?.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Heure :</strong> {selectedTime}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Avec :</strong> Dorian Sarry
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Un email de confirmation a été envoyé à <strong>{formData.email}</strong>
              </p>
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
          <p className="text-gray-600">Choisissez une date et un créneau horaire</p>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <CalendarIcon className="h-5 w-5" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Date</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <Clock className="h-5 w-5" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Heure</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 3 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <User className="h-5 w-5" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">Infos</span>
            </div>
          </div>
        </div>

        {/* Étape 1: Sélection de la date */}
        {step === 1 && (
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
            </CardContent>
          </Card>
        )}

        {/* Étape 2: Sélection de l'heure */}
        {step === 2 && (
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
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Changer la date
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 3: Informations personnelles */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Vos informations</CardTitle>
              <CardDescription>
                Veuillez remplir vos coordonnées pour confirmer le rendez-vous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Date :</strong> {selectedDate?.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Heure :</strong> {selectedTime}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Motif de consultation (optionnel)</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Décrivez brièvement la raison de votre consultation..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Confirmation...' : 'Confirmer le rendez-vous'}
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
