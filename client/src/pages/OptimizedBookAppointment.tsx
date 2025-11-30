import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Clock, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

type AvailabilitySlot = {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  title: string;
};

type SlotsByDate = Record<string, AvailabilitySlot[]>;

export default function OptimizedBookAppointment() {
  const [step, setStep] = useState<'date' | 'time' | 'info' | 'done'>('date');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [slotsByDate, setSlotsByDate] = useState<SlotsByDate>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: ''
  });

  // Charger les disponibilités depuis l'API au montage du composant
  useEffect(() => {
    const fetchAvailabilities = async () => {
      setIsLoadingSlots(true);
      try {
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 90); // 3 mois de disponibilités

        const response = await fetch('/api/trpc/booking.getAvailabilitiesByDate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            json: {
              startDate: today.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
            }
          })
        });

        const result = await response.json();
        console.log('📋 Disponibilités reçues:', result);

        if (result?.result?.data?.json?.success) {
          const data = result.result.data.json;
          setSlotsByDate(data.slotsByDate || {});
          setAvailableDates(data.availableDates || []);
        } else {
          console.error('❌ Erreur chargement disponibilités:', result);
          toast.error('Impossible de charger les disponibilités');
        }
      } catch (error) {
        console.error('❌ Erreur réseau:', error);
        toast.error('Erreur de connexion au serveur');
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchAvailabilities();
  }, []);

  // Grouper les dates par mois
  const groupDatesByMonth = () => {
    const grouped: Record<string, string[]> = {};
    
    availableDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const monthKey = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(dateStr);
    });
    
    return grouped;
  };

  const datesByMonth = groupDatesByMonth();

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setStep('time');
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep('info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation stricte avant envoi
    if (!selectedDate) {
      toast.error('❌ Veuillez sélectionner une date');
      return;
    }
    if (!selectedTime) {
      toast.error('❌ Veuillez sélectionner un créneau horaire');
      return;
    }
    if (!form.firstName.trim()) {
      toast.error('❌ Prénom requis');
      return;
    }
    if (!form.lastName.trim()) {
      toast.error('❌ Nom requis');
      return;
    }
    if (!form.email.trim()) {
      toast.error('❌ Email requis');
      return;
    }
    if (!form.phone.trim()) {
      toast.error('❌ Téléphone requis');
      return;
    }
    
    // Envoyer directement la réservation
    await handleConfirmBooking();
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);

    try {
      // Validation finale stricte
      if (!selectedDate || !selectedTime || !form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
        toast.error('❌ Données manquantes. Veuillez compléter tous les champs');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        date: selectedDate,
        startTime: selectedTime,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        reason: form.reason.trim() || '',
        sendNotifications: 'both' as const,
      };

      console.log('📤 Envoi de la réservation:', payload);
      
      const response = await fetch('/api/trpc/booking.bookAppointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json: payload })
      });

      const result = await response.json();
      console.log('📋 Réponse API:', result);
      
      // tRPC retourne { result: { data: { json: { success: true, ... } } } }
      const success = result?.result?.data?.json?.success || result?.success;
      const error = result?.error?.json?.message || result?.error?.message || result?.message;
      
      if (success) {
        setStep('done');
        toast.success('✅ Rendez-vous confirmé!');
      } else if (error || result?.error) {
        toast.error('Erreur: ' + (error || 'Impossible de réserver'));
      } else {
        console.warn('❌ Réponse inattendue:', result);
        toast.error('Erreur: Réponse serveur invalide');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Rendez-vous confirmé!</h2>
            <p className="text-gray-600 mb-6">
              {selectedDate} à {selectedTime} - 60 minutes
            </p>
            <Link href="/">
              <Button className="w-full">Retour</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="mx-auto px-4 max-w-2xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Prendre rendez-vous</h1>
          <p className="text-lg text-gray-600">Consultation de 60 minutes avec Dorian Sarry</p>
          <p className="text-green-600 font-medium mt-2">✓ Praticien certifié en Thérapie Sensori-Motrice</p>
        </div>

        {/* STEP 1: Select Date */}
        {step === 'date' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Choisissez une date</CardTitle>
              <CardDescription>
                {isLoadingSlots ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des disponibilités...
                  </span>
                ) : (
                  `${availableDates.length} date(s) disponible(s)`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSlots ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : availableDates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Aucune disponibilité pour le moment.</p>
                  <p className="text-sm mt-2">Veuillez réessayer plus tard.</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {Object.entries(datesByMonth).map(([monthKey, dates]) => (
                    <div key={monthKey}>
                      {/* Month Header */}
                      <div className="mb-4 pb-3 border-b-2 border-gray-300">
                        <h3 className="text-lg font-bold text-gray-800 capitalize">{monthKey}</h3>
                        <p className="text-sm text-gray-500">{dates.length} date(s) disponible(s)</p>
                      </div>
                      
                      {/* Dates Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {dates.map((dateStr) => {
                          const dateObj = new Date(dateStr);
                          const dayNumber = dateObj.getDate();
                          const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
                          
                          return (
                            <button
                              key={dateStr}
                              onClick={() => handleSelectDate(dateStr)}
                              className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-50 border-2 border-green-400 hover:bg-green-100 hover:border-green-500 transition-colors"
                            >
                              <span className="text-xs font-bold text-green-600">{dayName}</span>
                              <span className="text-xl font-bold text-green-700">{dayNumber}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Select Time */}
        {step === 'time' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Choisissez un créneau</CardTitle>
              <CardDescription>{selectedDate}</CardDescription>
            </CardHeader>
            <CardContent>
              {slotsByDate[selectedDate] && slotsByDate[selectedDate].length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {slotsByDate[selectedDate].map((slot) => (
                    <button
                      key={slot.startTime}
                      onClick={() => handleSelectTime(slot.startTime)}
                      className="p-4 rounded-lg bg-blue-50 border-2 border-blue-300 text-blue-700 hover:bg-blue-100 font-semibold"
                    >
                      <Clock className="inline h-4 w-4 mr-2" />
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucun créneau disponible pour cette date.</p>
                </div>
              )}
              <Button variant="outline" onClick={() => setStep('date')} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Patient Info */}
        {step === 'info' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Vos informations</CardTitle>
              <CardDescription>{selectedDate} à {selectedTime} - 60 min</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Prénom *</Label>
                    <Input
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <Label>Nom *</Label>
                    <Input
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="jean@example.com"
                  />
                </div>

                <div>
                  <Label>Téléphone *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div>
                  <Label>Motif</Label>
                  <Textarea
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Motif de consultation..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep('time')} className="flex-1">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? '⏳ Finalisation...' : '✅ Finaliser'}
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
