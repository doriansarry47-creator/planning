import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';

const AVAILABLE_DATES = [
  { date: '2025-11-24', slots: ['17:30', '18:30'] },
  { date: '2025-11-25', slots: ['17:30', '18:30'] },
  { date: '2025-11-27', slots: ['17:30', '18:30'] },
];

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
      if (result.result?.data?.json?.success) {
        setStep('done');
        toast.success('✅ Rendez-vous confirmé!');
      } else if (result.error) {
        toast.error('Erreur: ' + (result.error.json?.message || 'Impossible de réserver'));
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
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_DATES.map(({ date }) => (
                  <button
                    key={date}
                    onClick={() => handleSelectDate(date)}
                    className="p-4 rounded-lg bg-green-50 border-2 border-green-400 text-green-700 hover:bg-green-100 font-semibold"
                  >
                    {new Date(date).toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </button>
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
