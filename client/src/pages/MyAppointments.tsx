import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Calendar, Clock, Phone, Trash2, ArrowLeft } from 'lucide-react';

interface Appointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: string;
  notes?: string;
}

export default function MyAppointments() {
  const [step, setStep] = useState<'search' | 'results'>('search');
  const [email, setEmail] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('❌ Email requis');
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch('/api/trpc/patientAppointments.getByEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            email: email.trim(),
          }
        })
      });

      const result = await response.json();
      console.log('📋 Réponse API:', result);

      const success = result?.result?.data?.json?.success;
      const data = result?.result?.data?.json;

      if (success && data?.appointments) {
        if (data.appointments.length === 0) {
          toast.info('ℹ️ Aucun rendez-vous trouvé pour cet email');
        } else {
          setAppointments(data.appointments);
          setStep('results');
          toast.success(`✅ ${data.appointments.length} rendez-vous trouvé(s)`);
        }
      } else {
        toast.error('Erreur: ' + (data?.error || 'Impossible de récupérer les rendez-vous'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancel = async (appointmentId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    setIsCancelling(true);

    try {
      const response = await fetch('/api/trpc/patientAppointments.cancelAppointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            appointmentId,
            email,
          }
        })
      });

      const result = await response.json();
      const success = result?.result?.data?.json?.success;
      const message = result?.result?.data?.json?.message;

      if (success) {
        toast.success('✅ ' + (message || 'Rendez-vous annulé'));
        // Supprimer de la liste
        setAppointments(appointments.filter(a => a.id !== appointmentId));
      } else {
        toast.error('Erreur: ' + (result?.result?.data?.json?.error || 'Impossible d\'annuler'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsCancelling(false);
    }
  };

  if (step === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStep('search');
              setAppointments([]);
            }}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mes rendez-vous</h1>
            <p className="text-gray-600">{email}</p>
          </div>

          {appointments.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <p className="text-gray-600">Aucun rendez-vous trouvé</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <Card key={apt.id} className={apt.status === 'cancelled' ? 'opacity-50' : ''}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold">{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="h-5 w-5 text-green-600" />
                          <span>{apt.startTime} - {apt.endTime}</span>
                        </div>
                        {apt.customerPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-purple-600" />
                            <span>{apt.customerPhone}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Statut:</strong>{' '}
                          <span className={apt.status === 'cancelled' ? 'text-red-600' : 'text-green-600'}>
                            {apt.status === 'cancelled' ? '❌ Annulé' : '✅ Confirmé'}
                          </span>
                        </p>
                        {apt.notes && (
                          <p className="text-sm text-gray-600 mb-4">
                            <strong>Notes:</strong> {apt.notes}
                          </p>
                        )}
                        {apt.status !== 'cancelled' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(apt.id)}
                            disabled={isCancelling}
                            className="w-full md:w-auto"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Mes rendez-vous</CardTitle>
            <CardDescription>Consultez et gérez vos rendez-vous</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="email">Email de confirmation *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching}
                className="w-full"
              >
                {isSearching ? 'Recherche...' : '🔍 Rechercher'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
