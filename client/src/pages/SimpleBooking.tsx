import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  title: string;
}

export default function SimpleBooking() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    reason: '',
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Récupérer les créneaux disponibles
  const { data: slotsData, isLoading: slotsLoading, refetch: refetchSlots } = trpc.patientBooking.getAvailableSlots.useQuery({
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 jours
  });

  // Mutation pour réserver un rendez-vous
  const bookAppointmentMutation = trpc.patientBooking.bookAppointment.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setBookingSuccess(true);
        setBookingError(null);
        setSelectedSlot(null);
        setSelectedDate(undefined);
        setFormData({
          patientName: '',
          patientEmail: '',
          patientPhone: '',
          reason: '',
        });
        // Recharger les créneaux disponibles
        refetchSlots();
      } else {
        setBookingError(data.error || 'Erreur lors de la réservation');
        setBookingSuccess(false);
      }
    },
    onError: (error) => {
      setBookingError(error.message || 'Erreur lors de la réservation');
      setBookingSuccess(false);
    },
  });

  // Obtenir les créneaux pour la date sélectionnée
  const selectedDateSlots = selectedDate && slotsData?.slotsByDate
    ? slotsData.slotsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  // Obtenir les dates avec des créneaux disponibles
  const datesWithSlots = slotsData?.slotsByDate
    ? Object.keys(slotsData.slotsByDate).map(dateStr => new Date(dateStr))
    : [];

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      setBookingError('Veuillez sélectionner un créneau');
      return;
    }

    if (!formData.patientName || !formData.patientEmail) {
      setBookingError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    bookAppointmentMutation.mutate({
      patientName: formData.patientName,
      patientEmail: formData.patientEmail,
      patientPhone: formData.patientPhone,
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      reason: formData.reason,
    });
  };

  // Fonction pour vérifier si une date a des créneaux
  const dateHasSlots = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return slotsData?.slotsByDate?.[dateStr]?.length > 0;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Prendre Rendez-vous
        </h1>
        <p className="text-lg text-gray-600">
          Choisissez un créneau disponible et remplissez vos informations
        </p>
      </div>

      {/* Messages de succès/erreur */}
      {bookingSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Rendez-vous confirmé !</AlertTitle>
          <AlertDescription className="text-green-700">
            Vous allez recevoir un email de confirmation avec les détails de votre rendez-vous.
          </AlertDescription>
        </Alert>
      )}

      {bookingError && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Erreur</AlertTitle>
          <AlertDescription className="text-red-700">
            {bookingError}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendrier et sélection de créneau */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Sélectionnez une date
            </CardTitle>
            <CardDescription>
              {slotsLoading ? 'Chargement des disponibilités...' : 
               `${slotsData?.totalSlots || 0} créneaux disponibles`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Calendrier */}
            <div className="mb-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today || !dateHasSlots(date);
                }}
                modifiers={{
                  available: datesWithSlots,
                }}
                modifiersStyles={{
                  available: {
                    backgroundColor: '#dcfce7',
                    fontWeight: 'bold',
                  },
                }}
                locale={fr}
                className="rounded-md border mx-auto"
              />
            </div>

            {/* Liste des créneaux horaires */}
            {selectedDate && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Créneaux disponibles le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                </h3>
                
                {selectedDateSlots.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucun créneau disponible pour cette date
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDateSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={selectedSlot === slot ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.startTime} - {slot.endTime}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulaire de réservation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Vos informations
            </CardTitle>
            <CardDescription>
              {selectedSlot 
                ? `Créneau sélectionné : ${selectedSlot.startTime} - ${selectedSlot.endTime}`
                : 'Sélectionnez un créneau pour réserver'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom complet */}
              <div>
                <Label htmlFor="patientName">
                  Nom complet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="patientName"
                  type="text"
                  placeholder="Jean Dupont"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  required
                  disabled={!selectedSlot}
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="patientEmail">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="patientEmail"
                    type="email"
                    placeholder="jean.dupont@email.com"
                    value={formData.patientEmail}
                    onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                    className="pl-10"
                    required
                    disabled={!selectedSlot}
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <Label htmlFor="patientPhone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="patientPhone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="pl-10"
                    disabled={!selectedSlot}
                  />
                </div>
              </div>

              {/* Motif */}
              <div>
                <Label htmlFor="reason">Motif de la consultation</Label>
                <Textarea
                  id="reason"
                  placeholder="Décrivez brièvement le motif de votre rendez-vous..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  disabled={!selectedSlot}
                />
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!selectedSlot || bookAppointmentMutation.isLoading}
              >
                {bookAppointmentMutation.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Réservation en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Confirmer le rendez-vous
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                Vous recevrez un email de confirmation après la réservation
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Informations supplémentaires */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informations pratiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>📍 <strong>Adresse :</strong> 20 rue des Jacobins, 24000 Périgueux</p>
          <p>📧 <strong>Email :</strong> doriansarry47@gmail.com</p>
          <p>⏰ <strong>Durée :</strong> Les consultations durent généralement 30 minutes</p>
          <p>🔔 <strong>Rappel :</strong> Vous recevrez un rappel par email 24h avant votre rendez-vous</p>
        </CardContent>
      </Card>
    </div>
  );
}
