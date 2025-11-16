// EnhancedAppointmentsManagement.tsx
import React, { useState, useEffect } from 'react';
import FullCalendar, { EventInput } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  status: 'confirmé' | 'en attente' | 'annulé' | 'non honoré';
}

export default function EnhancedAppointmentsManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Fetch des RDV depuis l'API
  useEffect(() => {
    fetch('/trpc/admin.getAppointments')
      .then(res => res.json())
      .then(data => setAppointments(data.appointments || []));
  }, []);

  // Transformation pour FullCalendar
  const events: EventInput[] = appointments.map(a => ({
    id: a.id,
    title: a.title,
    start: a.start,
    end: a.end,
    color: a.status === 'annulé' ? '#f87171' : '#34d399', // rouge si annulé, vert sinon
    extendedProps: { status: a.status },
  }));

  // Suppression d’un RDV annulé
  const handleDeleteCancelled = (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce rendez-vous annulé ?')) return;
    fetch(`/trpc/admin.deleteAppointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).then(() => {
      setAppointments(prev => prev.filter(a => a.id !== id));
      toast.success('Rendez-vous annulé supprimé');
    });
  };

  // Gestion clic sur un RDV
  const handleEventClick = (clickInfo: any) => {
    const appointment = appointments.find(a => a.id === clickInfo.event.id);
    if (!appointment) return;
    if (appointment.status === 'annulé') handleDeleteCancelled(appointment.id);
    else toast(`RDV: ${appointment.title} - Statut: ${appointment.status}`);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gestion des rendez-vous</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        locale={frLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        eventClick={handleEventClick}
      />
      <p className="mt-2 text-sm text-muted-foreground">
        Cliquez sur un rendez-vous annulé pour le supprimer.
      </p>
    </div>
  );
}
tsx
Copier le code
// AvailabilityManagement.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Availability {
  id: string;
  practitioner: string;
  start: string;
  end: string;
  recurrence?: 'daily' | 'weekly' | 'monthly';
  endRecurrence?: string;
}

export default function AvailabilityManagement() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [newAvail, setNewAvail] = useState<Partial<Availability>>({});

  useEffect(() => {
    fetch('/trpc/admin.getAvailabilities')
      .then(res => res.json())
      .then(data => setAvailabilities(data.availabilities || []));
  }, []);

  const handleAddAvailability = () => {
    if (!newAvail.practitioner || !newAvail.start || !newAvail.end) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    fetch('/trpc/admin.addAvailability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availability: newAvail }),
    }).then(() => {
      setAvailabilities(prev => [...prev, newAvail as Availability]);
      toast.success('Disponibilité ajoutée');
      setNewAvail({});
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gestion des disponibilités</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Nom du praticien"
          value={newAvail.practitioner || ''}
          onChange={e => setNewAvail({ ...newAvail, practitioner: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="datetime-local"
          placeholder="Début"
          value={newAvail.start || ''}
          onChange={e => setNewAvail({ ...newAvail, start: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="datetime-local"
          placeholder="Fin"
          value={newAvail.end || ''}
          onChange={e => setNewAvail({ ...newAvail, end: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="date"
          placeholder="Fin récurrence"
          value={newAvail.endRecurrence || ''}
          onChange={e => setNewAvail({ ...newAvail, endRecurrence: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <select
          value={newAvail.recurrence || ''}
          onChange={e => setNewAvail({ ...newAvail, recurrence: e.target.value as any })}
          className="border p-2 rounded w-full"
        >
          <option value="">Pas de récurrence</option>
          <option value="daily">Quotidienne</option>
          <option value="weekly">Hebdomadaire</option>
          <option value="monthly">Mensuelle</option>
        </select>
      </div>

      <Button onClick={handleAddAvailability}>Ajouter disponibilité</Button>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Disponibilités existantes</h3>
        <ul className="space-y-2">
          {availabilities.map(a => (
            <li key={a.id} className="border p-2 rounded flex justify-between items-center">
              <span>
                {a.practitioner} : {new Date(a.start).toLocaleString('fr-FR')} → {new Date(a.end).toLocaleString('fr-FR')}
                {a.recurrence ? ` | Récurrence : ${a.recurrence} jusqu'au ${a.endRecurrence || '∞'}` : ''}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  fetch(`/trpc/admin.deleteAvailability`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: a.id }),
                  }).then(() => {
                    setAvailabilities(prev => prev.filter(av => av.id !== a.id));
                    toast.success('Disponibilité supprimée');
                  });
                }}
              >
                Supprimer
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}