import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

/**
 * Composant d'affichage des disponibilités et de réservation pour les patients
 * Affiche les créneaux disponibles depuis Google Calendar et permet la réservation
 */
export function AvailabilityCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // Formulaire de réservation
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [reason, setReason] = useState('');

  // Dates pour la requête (semaine courante)
  const startDate = selectedDate
    ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    : new Date();
  const endDate = selectedDate
    ? new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    : new Date();

  // Récupérer les créneaux disponibles
  const { data: availabilityData, isLoading, refetch } = useQuery({
    queryKey: ['availability-slots', startDate.toISOString(), endDate.toISOString()],
    queryFn: () =>
      trpc.availability.getAvailableSlots.query({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        slotDuration: 30,
      }),
    enabled: !!selectedDate,
  });

  // Mutation pour réserver un créneau
  const bookSlot = useMutation({
    mutationFn: trpc.availability.bookSlot.mutate,
    onSuccess: (data) => {
      if (data.success) {
        toast.success('✅ Rendez-vous confirmé!', {
          description: 'Vous recevrez une confirmation par email.',
          duration: 5000,
        });
        setShowBookingForm(false);
        setSelectedSlot(null);
        setPatientName('');
        setPatientEmail('');
        setPatientPhone('');
        setReason('');
        refetch();
      } else {
        toast.error('❌ Erreur', {
          description: data.error || 'Impossible de réserver ce créneau',
        });
      }
    },
    onError: (error) => {
      toast.error('❌ Erreur', {
        description: error.message || 'Une erreur est survenue',
      });
    },
  });

  const handleSlotClick = (slot: { startTime: string; endTime: string }) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedSlot) return;

    if (!patientName || !patientEmail) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    bookSlot.mutate({
      patientName,
      patientEmail,
      patientPhone,
      date: selectedDate.toISOString(),
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      reason,
      practitionerName: 'Dr. Praticien',
    });
  };

  // Récupérer les créneaux pour la date sélectionnée
  const selectedDateKey = selectedDate?.toISOString().split('T')[0];
  const slotsForSelectedDate = selectedDateKey && availabilityData?.slots
    ? availabilityData.slots[selectedDateKey] || []
    : [];

  // Fonction pour déterminer si une date a des créneaux disponibles
  const hasAvailableSlots = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return availabilityData?.slots?.[dateKey]?.length > 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Réserver un rendez-vous
          </CardTitle>
          <CardDescription>
            Sélectionnez une date pour voir les créneaux disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Calendrier */}
            <div className="space-y-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={fr}
                className="rounded-md border"
                disabled={(date) => {
                  // Désactiver les dates passées
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (date < today) return true;
                  
                  // Désactiver les dates sans créneaux (optionnel)
                  return !hasAvailableSlots(date);
                }}
                modifiers={{
                  available: (date) => hasAvailableSlots(date),
                }}
                modifiersClassNames={{
                  available: 'bg-green-100 text-green-900 font-bold',
                }}
              />
              <p className="text-xs text-muted-foreground text-center mt-2">
                Les dates en <span className="text-green-600 font-bold">vert</span> ont des créneaux disponibles
              </p>
            </div>

            {/* Liste des créneaux */}
            <div className="space-y-4">
              {selectedDate && (
                <>
                  <div className="border-b pb-2">
                    <h3 className="font-semibold text-lg">
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {slotsForSelectedDate.length > 0
                        ? `${slotsForSelectedDate.length} créneaux disponibles`
                        : 'Aucun créneau disponible'}
                    </p>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : slotsForSelectedDate.length > 0 ? (
                      slotsForSelectedDate.map((slot, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left hover:bg-primary/10",
                            selectedSlot?.startTime === slot.startTime && "border-primary bg-primary/5"
                          )}
                          onClick={() => handleSlotClick(slot)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {slot.startTime} - {slot.endTime}
                        </Button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>Aucun créneau disponible pour cette date</p>
                        <p className="text-xs mt-1">Essayez une autre date</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de réservation */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer votre rendez-vous</DialogTitle>
            <DialogDescription>
              {selectedDate && selectedSlot && (
                <>
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })} de{' '}
                  {selectedSlot.startTime} à {selectedSlot.endTime}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom complet *
              </Label>
              <Input
                id="name"
                placeholder="Jean Dupont"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jean.dupont@example.com"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="06 12 34 56 78"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Motif de consultation
              </Label>
              <Textarea
                id="reason"
                placeholder="Décrivez brièvement le motif de votre consultation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBookingForm(false)}
                disabled={bookSlot.isPending}
              >
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={handleBooking}
                disabled={bookSlot.isPending}
              >
                {bookSlot.isPending ? 'Réservation...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
