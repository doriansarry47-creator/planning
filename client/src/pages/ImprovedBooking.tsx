import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';
import { Calendar, Clock, Lock, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Page patient améliorée avec verrouillage de créneaux
 */
export default function ImprovedBooking() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [lockedSlot, setLockedSlot] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [lockTimer, setLockTimer] = useState<number>(0);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    reason: '',
  });

  // Période affichée
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const endDate = addDays(startDate, 6);

  // Query pour récupérer les créneaux
  const { data: slotsData, isLoading, refetch } = trpc.appointmentBooking.getAvailableSlots.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  // Mutations
  const lockSlot = trpc.appointmentBooking.lockSlot.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setLockedSlot(selectedSlot?.id);
        setLockTimer(300); // 5 minutes
        setShowBookingForm(true);
      } else {
        alert('Ce créneau vient d\'être pris par quelqu\'un d\'autre');
        setSelectedSlot(null);
        refetch();
      }
    },
    onError: () => {
      alert('Erreur lors du verrouillage du créneau');
    },
  });

  const unlockSlot = trpc.appointmentBooking.unlockSlot.useMutation({
    onSuccess: () => {
      setLockedSlot(null);
      setLockTimer(0);
      refetch();
    },
  });

  const bookSlot = trpc.appointmentBooking.bookSlot.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        alert('✅ Rendez-vous confirmé ! Vous recevrez un email de confirmation.');
        setShowBookingForm(false);
        setSelectedSlot(null);
        setLockedSlot(null);
        setLockTimer(0);
        refetch();
      } else {
        alert('❌ ' + data.message);
        setShowBookingForm(false);
        refetch();
      }
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`);
    },
  });

  // Timer de verrouillage
  useEffect(() => {
    if (lockTimer > 0) {
      const interval = setInterval(() => {
        setLockTimer((prev) => {
          if (prev <= 1) {
            // Temps écoulé, déverrouiller
            if (lockedSlot) {
              unlockSlot.mutate({ slotId: lockedSlot });
            }
            setShowBookingForm(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lockTimer, lockedSlot]);

  // Grouper par date
  const slotsByDate = slotsData?.slots.reduce((acc, slot) => {
    const date = new Date(slot.date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, typeof slotsData.slots>);

  // Sélectionner un créneau
  const handleSlotSelection = (slot: any) => {
    setSelectedSlot(slot);
    // Verrouiller immédiatement
    lockSlot.mutate({ slotId: slot.id, durationMinutes: 5 });
  };

  // Annuler la réservation
  const handleCancel = () => {
    if (lockedSlot) {
      unlockSlot.mutate({ slotId: lockedSlot });
    }
    setShowBookingForm(false);
    setSelectedSlot(null);
    setLockTimer(0);
  };

  // Confirmer la réservation
  const handleConfirm = () => {
    if (!formData.name || !formData.email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!selectedSlot) return;

    bookSlot.mutate({
      slotId: selectedSlot.id,
      patientInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        reason: formData.reason,
      },
    });
  };

  // Formater le timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                Prendre Rendez-vous
              </h1>
              <p className="text-gray-600 mt-2">
                Sélectionnez un créneau disponible ci-dessous
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setSelectedDate(addWeeks(selectedDate, -1))}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              ← Semaine précédente
            </button>
            
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                {format(startDate, 'dd MMMM', { locale: fr })} - {format(endDate, 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>

            <button
              onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Semaine suivante →
            </button>
          </div>

          {/* Stats */}
          {slotsData && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-center text-gray-700">
                <strong>{slotsData.total}</strong> créneaux disponibles cette semaine
              </p>
            </div>
          )}
        </div>

        {/* Grille des créneaux */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Chargement des créneaux...</p>
          </div>
        ) : slotsByDate && Object.keys(slotsByDate).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(slotsByDate).map(([date, slots]) => (
              <div key={date} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 border-b pb-2">
                  {format(new Date(date), 'EEEE dd MMMM', { locale: fr })}
                </h3>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelection(slot)}
                      disabled={lockSlot.isPending}
                      className="w-full p-3 rounded-lg text-left transition-all bg-green-50 hover:bg-green-100 border-2 border-green-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">Aucun créneau disponible pour cette semaine</p>
            <p className="text-sm text-gray-500 mt-2">Essayez une autre semaine</p>
          </div>
        )}
      </div>

      {/* Modal de réservation avec verrouillage */}
      {showBookingForm && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Timer de verrouillage */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Créneau réservé pour vous
                  </p>
                  <p className="text-xs text-yellow-700">
                    Temps restant: <strong className="text-lg">{formatTimer(lockTimer)}</strong>
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Confirmer votre rendez-vous
            </h2>
            
            {/* Infos créneau */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Créneau sélectionné</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(selectedSlot.date), 'EEEE dd MMMM yyyy', { locale: fr })}
              </p>
              <p className="text-blue-600 font-medium">
                {selectedSlot.startTime} - {selectedSlot.endTime}
              </p>
            </div>

            {/* Formulaire */}
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="jean@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif du rendez-vous
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Décrivez brièvement..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={bookSlot.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {bookSlot.isPending ? 'Confirmation...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
