import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Page pour afficher les créneaux disponibles et permettre la prise de rendez-vous
 */
export default function AvailableSlots() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  // État du formulaire de réservation
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    reason: '',
  });

  // Calculer la période (semaine en cours)
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Commence le lundi
  const endDate = addDays(startDate, 6); // Jusqu'au dimanche

  // Query pour récupérer les créneaux disponibles
  const { data: slotsData, isLoading, refetch } = trpc.googleCalendar.getAvailableSlots.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    workingHours: {
      start: '09:00',
      end: '18:00',
    },
    slotDuration: 30, // Créneaux de 30 minutes
  });

  // Mutation pour créer un rendez-vous
  const createAppointment = trpc.googleCalendar.createAppointment.useMutation({
    onSuccess: () => {
      alert('Rendez-vous confirmé ! Vous recevrez un email de confirmation.');
      setShowBookingForm(false);
      setSelectedSlot(null);
      refetch();
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`);
    },
  });

  // Grouper les créneaux par date
  const slotsByDate = slotsData?.slots.reduce((acc, slot) => {
    const date = new Date(slot.date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, typeof slotsData.slots>);

  // Navigation entre les semaines
  const goToPreviousWeek = () => {
    setSelectedDate(addWeeks(selectedDate, -1));
  };

  const goToNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  // Gérer la réservation
  const handleBooking = () => {
    if (!selectedSlot) return;

    if (!formData.patientName || !formData.patientEmail) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    createAppointment.mutate({
      patientName: formData.patientName,
      patientEmail: formData.patientEmail,
      patientPhone: formData.patientPhone,
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      reason: formData.reason,
      practitionerName: 'Dr. Praticien',
    });
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
                Créneaux Disponibles
              </h1>
              <p className="text-gray-600 mt-2">
                Sélectionnez un créneau pour prendre rendez-vous
              </p>
            </div>
          </div>

          {/* Navigation des semaines */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={goToPreviousWeek}
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
              onClick={goToNextWeek}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Semaine suivante →
            </button>
          </div>

          {/* Résumé */}
          {slotsData && (
            <div className="mt-4 flex gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-700">{slotsData.available} créneaux disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-700">{slotsData.total - slotsData.available} créneaux occupés</span>
              </div>
            </div>
          )}
        </div>

        {/* Grille des créneaux */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des créneaux...</p>
          </div>
        ) : slotsByDate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(slotsByDate).map(([date, slots]) => (
              <div key={date} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 border-b pb-2">
                  {format(new Date(date), 'EEEE dd MMMM', { locale: fr })}
                </h3>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {slots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (slot.isAvailable) {
                          setSelectedSlot(slot);
                          setShowBookingForm(true);
                        }
                      }}
                      disabled={!slot.isAvailable}
                      className={`
                        w-full p-3 rounded-lg text-left transition-all
                        ${slot.isAvailable 
                          ? 'bg-green-50 hover:bg-green-100 border-2 border-green-200 cursor-pointer' 
                          : 'bg-gray-50 border-2 border-gray-200 cursor-not-allowed opacity-50'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                        </div>
                        {slot.isAvailable ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
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
            <p className="text-gray-600">Aucun créneau disponible pour cette période</p>
          </div>
        )}
      </div>

      {/* Modal de réservation */}
      {showBookingForm && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Réserver un rendez-vous
            </h2>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Créneau sélectionné</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(selectedSlot.date), 'EEEE dd MMMM yyyy', { locale: fr })}
              </p>
              <p className="text-blue-600 font-medium">
                {selectedSlot.startTime} - {selectedSlot.endTime}
              </p>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleBooking(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  value={formData.patientEmail}
                  onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jean.dupont@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Décrivez brièvement le motif de votre consultation..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedSlot(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createAppointment.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAppointment.isPending ? 'Réservation...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
