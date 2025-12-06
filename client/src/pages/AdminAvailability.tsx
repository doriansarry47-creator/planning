import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Calendar, Clock, Plus, Repeat, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Interface admin pour gérer les disponibilités
 * Créneaux ponctuels et récurrents
 */
export default function AdminAvailability() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecurrentModal, setShowRecurrentModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // États pour la création de créneaux ponctuels
  const [singleSlotData, setSingleSlotData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '09:30',
  });

  // États pour les créneaux récurrents
  const [recurrentData, setRecurrentData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '09:30',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    interval: 1,
    daysOfWeek: [1, 2, 3, 4, 5], // Lun-Ven
    endDate: format(addDays(new Date(), 90), 'yyyy-MM-dd'),
  });

  // États pour la création en masse
  const [batchData, setBatchData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    workingStart: '09:00',
    workingEnd: '18:00',
    slotDuration: 30,
    daysOfWeek: [1, 2, 3, 4, 5],
  });

  // Calcul de la période affichée
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const endDate = addDays(startDate, 13); // 2 semaines

  // Query pour récupérer les créneaux
  const { data: slotsData, isLoading, refetch } = trpc.appointmentBooking.getAvailableSlots.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  // Mutations
  const createSlot = trpc.appointmentBooking.createAvailabilitySlot.useMutation({
    onSuccess: () => {
      alert('Créneau créé avec succès !');
      setShowCreateModal(false);
      refetch();
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`);
    },
  });

  const createRecurrent = trpc.appointmentBooking.createRecurrentAvailability.useMutation({
    onSuccess: () => {
      alert('Créneaux récurrents créés avec succès !');
      setShowRecurrentModal(false);
      refetch();
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`);
    },
  });

  const createBatch = trpc.appointmentBooking.createBatchSlots.useMutation({
    onSuccess: (data) => {
      alert(`${data.created} créneaux créés avec succès !`);
      setShowBatchModal(false);
      refetch();
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`);
    },
  });

  const deleteSlot = trpc.appointmentBooking.deleteAvailabilitySlot.useMutation({
    onSuccess: () => {
      alert('Créneau supprimé');
      refetch();
    },
  });

  // Gestionnaires d'événements
  const handleCreateSingleSlot = () => {
    const dateTime = new Date(`${singleSlotData.date}T00:00:00`);
    createSlot.mutate({
      date: dateTime.toISOString(),
      startTime: singleSlotData.startTime,
      endTime: singleSlotData.endTime,
    });
  };

  const handleCreateRecurrent = () => {
    const dateTime = new Date(`${recurrentData.startDate}T00:00:00`);
    const endDateTime = new Date(`${recurrentData.endDate}T23:59:59`);

    createRecurrent.mutate({
      startDate: dateTime.toISOString(),
      startTime: recurrentData.startTime,
      endTime: recurrentData.endTime,
      recurrence: {
        frequency: recurrentData.frequency,
        interval: recurrentData.interval,
        daysOfWeek: recurrentData.daysOfWeek,
        endDate: endDateTime.toISOString(),
      },
    });
  };

  const handleCreateBatch = () => {
    const startDateTime = new Date(`${batchData.startDate}T00:00:00`);
    const endDateTime = new Date(`${batchData.endDate}T23:59:59`);

    createBatch.mutate({
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      workingHours: {
        start: batchData.workingStart,
        end: batchData.workingEnd,
      },
      slotDuration: batchData.slotDuration,
      daysOfWeek: batchData.daysOfWeek,
    });
  };

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                Gestion des Disponibilités
              </h1>
              <p className="text-gray-600 mt-2">
                Créez et gérez vos créneaux de disponibilité
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Créneau Ponctuel
            </button>
            
            <button
              onClick={() => setShowRecurrentModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Repeat className="w-4 h-4" />
              Créneaux Récurrents
            </button>

            <button
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Création en Masse
            </button>
          </div>

          {/* Statistiques */}
          {slotsData && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Créneaux disponibles</p>
                <p className="text-2xl font-bold text-blue-600">{slotsData.total}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Période affichée</p>
                <p className="text-lg font-semibold text-green-600">
                  {format(startDate, 'dd MMM', { locale: fr })} - {format(endDate, 'dd MMM', { locale: fr })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Liste des créneaux */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : slotsData && slotsData.slots.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Créneaux créés</h2>
            <div className="space-y-2">
              {slotsData.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(slot.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}
                        {slot.isRecurrent && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            Récurrent
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSlot.mutate({ slotId: slot.id! })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">Aucun créneau créé pour cette période</p>
            <p className="text-sm text-gray-500 mt-2">Créez des créneaux pour commencer à recevoir des réservations</p>
          </div>
        )}
      </div>

      {/* Modal Créneau Ponctuel */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Créer un Créneau Ponctuel</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={singleSlotData.date}
                  onChange={(e) => setSingleSlotData({ ...singleSlotData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                  <input
                    type="time"
                    value={singleSlotData.startTime}
                    onChange={(e) => setSingleSlotData({ ...singleSlotData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                  <input
                    type="time"
                    value={singleSlotData.endTime}
                    onChange={(e) => setSingleSlotData({ ...singleSlotData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateSingleSlot}
                disabled={createSlot.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createSlot.isPending ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Créneaux Récurrents */}
      {showRecurrentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Créer des Créneaux Récurrents</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={recurrentData.startDate}
                    onChange={(e) => setRecurrentData({ ...recurrentData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={recurrentData.endDate}
                    onChange={(e) => setRecurrentData({ ...recurrentData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
                  <input
                    type="time"
                    value={recurrentData.startTime}
                    onChange={(e) => setRecurrentData({ ...recurrentData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fin</label>
                  <input
                    type="time"
                    value={recurrentData.endTime}
                    onChange={(e) => setRecurrentData({ ...recurrentData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                <select
                  value={recurrentData.frequency}
                  onChange={(e) => setRecurrentData({ ...recurrentData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jours de la semaine</label>
                <div className="flex flex-wrap gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const days = [...recurrentData.daysOfWeek];
                        const idx = days.indexOf(index);
                        if (idx > -1) {
                          days.splice(idx, 1);
                        } else {
                          days.push(index);
                        }
                        setRecurrentData({ ...recurrentData, daysOfWeek: days });
                      }}
                      className={`px-4 py-2 rounded-lg transition ${
                        recurrentData.daysOfWeek.includes(index)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRecurrentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateRecurrent}
                disabled={createRecurrent.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {createRecurrent.isPending ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création en Masse */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Création en Masse</h2>
            <p className="text-sm text-gray-600 mb-4">
              Créez automatiquement tous les créneaux pour une période donnée
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={batchData.startDate}
                    onChange={(e) => setBatchData({ ...batchData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={batchData.endDate}
                    onChange={(e) => setBatchData({ ...batchData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début journée</label>
                  <input
                    type="time"
                    value={batchData.workingStart}
                    onChange={(e) => setBatchData({ ...batchData, workingStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin journée</label>
                  <input
                    type="time"
                    value={batchData.workingEnd}
                    onChange={(e) => setBatchData({ ...batchData, workingEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée des créneaux (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  step="15"
                  value={batchData.slotDuration}
                  onChange={(e) => setBatchData({ ...batchData, slotDuration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jours de travail</label>
                <div className="flex flex-wrap gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const days = [...batchData.daysOfWeek];
                        const idx = days.indexOf(index);
                        if (idx > -1) {
                          days.splice(idx, 1);
                        } else {
                          days.push(index);
                        }
                        setBatchData({ ...batchData, daysOfWeek: days });
                      }}
                      className={`px-4 py-2 rounded-lg transition ${
                        batchData.daysOfWeek.includes(index)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Estimation:</strong> Environ{' '}
                  {Math.ceil(
                    ((new Date(batchData.endDate).getTime() - new Date(batchData.startDate).getTime()) / 
                    (1000 * 60 * 60 * 24)) *
                    batchData.daysOfWeek.length *
                    ((parseInt(batchData.workingEnd.split(':')[0]) - parseInt(batchData.workingStart.split(':')[0])) * 60 / batchData.slotDuration)
                  )}{' '}
                  créneaux seront créés
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBatchModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateBatch}
                disabled={createBatch.isPending}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {createBatch.isPending ? 'Création...' : 'Créer Tous'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
