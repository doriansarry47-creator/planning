import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, Clock, User } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps?: {
    type: 'available' | 'booked' | 'unavailable';
    patient?: string;
    phone?: string;
  };
}

interface AdminCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: any) => void;
  onDateSelect?: (selectInfo: any) => void;
  onEventAdd?: (eventData: any) => void;
}

export function AdminCalendar({ events = [], onEventClick, onDateSelect, onEventAdd }: AdminCalendarProps) {
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    isRecurring: false,
    recurringPattern: 'weekly'
  });

  const handleDateClick = (selectInfo: any) => {
    setSelectedDate(selectInfo.dateStr);
    setNewSlot(prev => ({ ...prev, date: selectInfo.dateStr }));
    setShowAddSlotModal(true);
    onDateSelect?.(selectInfo);
  };

  const handleEventClick = (clickInfo: any) => {
    onEventClick?.(clickInfo.event);
  };

  const handleAddSlot = () => {
    const eventData = {
      title: '🟢 Disponible',
      start: `${newSlot.date}T${newSlot.startTime}`,
      end: `${newSlot.date}T${newSlot.endTime}`,
      backgroundColor: '#10b981',
      borderColor: '#059669',
      extendedProps: {
        type: 'available',
        isRecurring: newSlot.isRecurring,
        recurringPattern: newSlot.recurringPattern
      }
    };
    
    onEventAdd?.(eventData);
    setShowAddSlotModal(false);
    setNewSlot({
      date: '',
      startTime: '',
      endTime: '',
      isRecurring: false,
      recurringPattern: 'weekly'
    });
  };

  // Configuration des événements avec couleurs
  const calendarEvents = events.map(event => ({
    ...event,
    backgroundColor: event.extendedProps?.type === 'available' 
      ? '#10b981' 
      : event.extendedProps?.type === 'booked' 
      ? '#ef4444' 
      : '#6b7280',
    borderColor: event.extendedProps?.type === 'available' 
      ? '#059669' 
      : event.extendedProps?.type === 'booked' 
      ? '#dc2626' 
      : '#4b5563',
  }));

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Calendrier des créneaux</h2>
          <p className="text-gray-600">Gérez vos disponibilités et rendez-vous</p>
        </div>
        <Button 
          onClick={() => setShowAddSlotModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un créneau
        </Button>
      </div>

      {/* Légende */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>🟢 Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>🔴 Réservé</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
              <span>⚪ Indisponible</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendrier */}
      <Card>
        <CardContent className="p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            locale="fr"
            timeZone="Europe/Paris"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Lundi à Vendredi
              startTime: '09:00',
              endTime: '18:00'
            }}
            select={(selectionInfo) => {
              setSelectedDate(selectionInfo.startStr.slice(0, 10));
              setNewSlot(prev => ({
                ...prev,
                date: selectionInfo.startStr.slice(0, 10),
                startTime: selectionInfo.startStr.slice(11, 16),
                endTime: selectionInfo.endStr?.slice(11, 16) || prev.endTime,
              }));
              setShowAddSlotModal(true);
            }}
            eventContent={(eventInfo) => {
              const { event } = eventInfo;
              const type = event.extendedProps?.type;
              
              return (
                <div className="p-1 text-xs">
                  <div className="font-medium">{event.title}</div>
                  {type === 'booked' && event.extendedProps?.patient && (
                    <div className="flex items-center mt-1">
                      <User className="h-3 w-3 mr-1" />
                      <span>{event.extendedProps.patient}</span>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </CardContent>
      </Card>

      {/* Modal d'ajout de créneau */}
      {showAddSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Ajouter un créneau disponible
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Heure début</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Heure fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newSlot.isRecurring}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="recurring">Créneau récurrent</Label>
              </div>

              {newSlot.isRecurring && (
                <div>
                  <Label htmlFor="pattern">Récurrence</Label>
                  <select
                    id="pattern"
                    value={newSlot.recurringPattern}
                    onChange={(e) => setNewSlot(prev => ({ ...prev, recurringPattern: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="weekly">Chaque semaine</option>
                    <option value="biweekly">Toutes les 2 semaines</option>
                    <option value="monthly">Chaque mois</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddSlotModal(false)}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddSlot}
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={!newSlot.date || !newSlot.startTime || !newSlot.endTime}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}