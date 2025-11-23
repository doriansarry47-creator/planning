import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Clock, ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react';

// Générer toutes les dates disponibles (nov, déc, jan)
const generateAvailableDates = () => {
  const dates = [];
  // Novembre 2025: 24, 25, 27, 28
  // Décembre 2025: 1-5, 8-12, 15-19, 22-26, 29-31
  // Janvier 2026: 1-9, 12-16, 19-23, 26-30
  const dateStrings = [
    // Novembre
    '2025-11-24', '2025-11-25', '2025-11-27', '2025-11-28',
    // Décembre
    '2025-12-01', '2025-12-02', '2025-12-04', '2025-12-05', '2025-12-08', '2025-12-09', 
    '2025-12-11', '2025-12-12', '2025-12-15', '2025-12-16', '2025-12-18', '2025-12-19',
    '2025-12-22', '2025-12-23', '2025-12-25', '2025-12-26', '2025-12-29', '2025-12-30',
    // Janvier
    '2026-01-05', '2026-01-06', '2026-01-08', '2026-01-09', '2026-01-12', '2026-01-13',
    '2026-01-15', '2026-01-16', '2026-01-19', '2026-01-20', '2026-01-22', '2026-01-23',
    '2026-01-26', '2026-01-27', '2026-01-29', '2026-01-30',
  ];
  
  return dateStrings.map(date => ({
    date,
    slots: ['17:30', '18:30']
  }));
};

const AVAILABLE_DATES = generateAvailableDates();

// Grouper les dates par mois
const groupDatesByMonth = () => {
  const grouped: Record<string, typeof AVAILABLE_DATES> = {};
  
  AVAILABLE_DATES.forEach(item => {
    const date = new Date(item.date);
    const monthKey = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(item);
  });
  
  return grouped;
};

const DATES_BY_MONTH = groupDatesByMonth();

export default function OptimizedBookAppointment() {
  const [step, setStep] = useState<'date' | 'time' | 'info' | 'done'>('date');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: ''
  });

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
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/trpc/booking.bookAppointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            date: selectedDate,
            startTime: selectedTime,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            reason: form.reason,
          }
        })
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
              <CardDescription>{AVAILABLE_DATES.length} date(s) disponible(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                {Object.entries(DATES_BY_MONTH).map(([monthKey, dates]) => (
                  <div key={monthKey}>
                    {/* Month Header */}
                    <div className="mb-4 pb-3 border-b-2 border-gray-300">
                      <h3 className="text-lg font-bold text-gray-800 capitalize">{monthKey}</h3>
                      <p className="text-sm text-gray-500">{dates.length} date(s) disponible(s)</p>
                    </div>
                    
                    {/* Dates Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {dates.map(({ date }) => {
                        const dateObj = new Date(date);
                        const dayNumber = dateObj.getDate();
                        const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
                        
                        return (
                          <button
                            key={date}
                            onClick={() => handleSelectDate(date)}
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
              <div className="grid grid-cols-2 gap-3 mb-4">
                {AVAILABLE_DATES.find(d => d.date === selectedDate)?.slots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleSelectTime(time)}
                    className="p-4 rounded-lg bg-blue-50 border-2 border-blue-300 text-blue-700 hover:bg-blue-100 font-semibold"
                  >
                    <Clock className="inline h-4 w-4 mr-2" />
                    {time}
                  </button>
                ))}
              </div>
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
                    {isSubmitting ? 'Confirmation...' : 'Confirmer'}
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
