import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, Event, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr'; // Importer la locale française
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';

// Forcer la configuration de moment en français
moment.locale('fr');
const localizer = momentLocalizer(moment);

// Types pour les événements du calendrier
export interface CalendarSlot extends Event {
  id?: number;
  title: string;
  start: Date;
  end: Date;
  status: 'available' | 'booked' | 'cancelled';
  patientName?: string;
  consultationType?: string;
  notes?: string;
}

interface EnhancedCalendarProps {
  slots: CalendarSlot[];
  onSelectSlot: (slotInfo: { start: Date; end: Date; slots: Date[] }) => void;
  onSelectEvent: (event: CalendarSlot) => void;
  onEventDrop?: (args: { event: CalendarSlot; start: Date; end: Date }) => void;
  onEventResize?: (args: { event: CalendarSlot; start: Date; end: Date }) => void;
}

// Messages en français pour react-big-calendar
const messages = {
  allDay: 'Journée',
  previous: 'Précédent',
  next: 'Suivant',
  today: "Aujourd'hui",
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Événement',
  noEventsInRange: 'Aucun événement dans cette période',
  showMore: (total: number) => `+ ${total} événement(s) supplémentaire(s)`,
};

export default function EnhancedCalendar({
  slots,
  onSelectSlot,
  onSelectEvent,
  onEventDrop,
  onEventResize,
}: EnhancedCalendarProps) {
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(new Date());

  // Style pour les événements selon leur statut
  const eventStyleGetter = useCallback((event: CalendarSlot) => {
    let backgroundColor = '#3b82f6'; // Bleu par défaut (disponible)
    let borderColor = '#2563eb';
    
    switch (event.status) {
      case 'available':
        backgroundColor = '#10b981'; // Vert
        borderColor = '#059669';
        break;
      case 'booked':
        backgroundColor = '#3b82f6'; // Bleu
        borderColor = '#2563eb';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444'; // Rouge
        borderColor = '#dc2626';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        fontSize: '0.875rem',
        fontWeight: '500',
        padding: '2px 4px',
      },
    };
  }, []);

  // Composant personnalisé pour afficher les événements
  const CustomEvent = ({ event }: { event: CalendarSlot }) => {
    const getStatusBadge = (status: string) => {
      const variants = {
        available: 'bg-green-500',
        booked: 'bg-blue-500',
        cancelled: 'bg-red-500',
      };
      return variants[status as keyof typeof variants] || 'bg-gray-500';
    };

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold truncate">{event.title}</span>
          <Badge className={`${getStatusBadge(event.status)} text-xs ml-1`}>
            {event.status === 'available' && 'Libre'}
            {event.status === 'booked' && 'Réservé'}
            {event.status === 'cancelled' && 'Annulé'}
          </Badge>
        </div>
        {event.patientName && (
          <span className="text-xs opacity-90 truncate">{event.patientName}</span>
        )}
        {event.consultationType && (
          <span className="text-xs opacity-80 truncate">{event.consultationType}</span>
        )}
      </div>
    );
  };

  // Gestion du drag & drop
  const handleEventDrop = useCallback(
    ({ event, start, end }: { event: CalendarSlot; start: Date; end: Date }) => {
      if (event.status === 'booked') {
        toast.error('Impossible de déplacer un créneau réservé');
        return;
      }
      
      if (onEventDrop) {
        onEventDrop({ event, start, end });
        toast.success('Créneau déplacé avec succès');
      }
    },
    [onEventDrop]
  );

  // Gestion du redimensionnement
  const handleEventResize = useCallback(
    ({ event, start, end }: { event: CalendarSlot; start: Date; end: Date }) => {
      if (event.status === 'booked') {
        toast.error('Impossible de redimensionner un créneau réservé');
        return;
      }
      
      if (onEventResize) {
        onEventResize({ event, start, end });
        toast.success('Durée du créneau modifiée');
      }
    },
    [onEventResize]
  );

  // Navigation personnalisée
  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  // Aller à aujourd'hui
  const goToToday = () => {
    setDate(new Date());
  };

  // Navigation personnalisée
  const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const newDate = new Date(date);
    
    switch (action) {
      case 'PREV':
        if (view === 'month') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else if (view === 'week') {
          newDate.setDate(newDate.getDate() - 7);
        } else if (view === 'day') {
          newDate.setDate(newDate.getDate() - 1);
        }
        break;
      case 'NEXT':
        if (view === 'month') {
          newDate.setMonth(newDate.getMonth() + 1);
        } else if (view === 'week') {
          newDate.setDate(newDate.getDate() + 7);
        } else if (view === 'day') {
          newDate.setDate(newDate.getDate() + 1);
        }
        break;
      case 'TODAY':
        return goToToday();
    }
    
    setDate(newDate);
  };

  // Formater le titre de la date
  const getDateTitle = () => {
    if (view === 'month') {
      return moment(date).format('MMMM YYYY');
    } else if (view === 'week') {
      const start = moment(date).startOf('week');
      const end = moment(date).endOf('week');
      return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`;
    } else {
      return moment(date).format('dddd D MMMM YYYY');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <CardTitle>Calendrier des disponibilités</CardTitle>
          </div>
          
          {/* Contrôles de navigation */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Navigation temporelle */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('PREV')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('TODAY')}
                className="h-8 px-3"
              >
                Aujourd'hui
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('NEXT')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Sélecteur de vue */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
                className="h-8"
              >
                Jour
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
                className="h-8"
              >
                Semaine
              </Button>
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
                className="h-8"
              >
                Mois
              </Button>
            </div>
          </div>
        </div>

        {/* Titre de la date courante */}
        <div className="text-lg font-semibold text-gray-700 capitalize mt-2">
          {getDateTitle()}
        </div>

        {/* Légende des couleurs */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Réservé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Annulé</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ height: '700px' }}>
          <Calendar
            localizer={localizer}
            events={slots}
            startAccessor="start"
            endAccessor="end"
            view={view}
            date={date}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            eventPropGetter={eventStyleGetter}
            components={{
              event: CustomEvent,
            }}
            messages={messages}
            selectable
            resizable
            draggableAccessor={(event: CalendarSlot) => event.status === 'available'}
            popup
            step={30}
            timeslots={2}
            min={new Date(2025, 0, 1, 8, 0, 0)} // 8h00
            max={new Date(2025, 0, 1, 20, 0, 0)} // 20h00
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                `${localizer?.format(start, 'HH:mm', culture)} - ${localizer?.format(end, 'HH:mm', culture)}`,
              agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
                `${localizer?.format(start, 'HH:mm', culture)} - ${localizer?.format(end, 'HH:mm', culture)}`,
            }}
            className="bg-white rounded-lg"
          />
        </div>
      </CardContent>
    </Card>
  );
}
