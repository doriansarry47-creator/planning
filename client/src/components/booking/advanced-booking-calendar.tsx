import React, { useState, useEffect } from 'react';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle 
} from 'lucide-react';
import { format, addDays, isSameDay, parseISO, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../lib/api';

interface AvailableSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  capacity: number;
  bookedCount?: number;
}

interface Practitioner {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  consultationDuration: number;
}

interface AdvancedBookingCalendarProps {
  practitionerId: string;
  onSlotSelect: (slot: AvailableSlot, date: Date) => void;
  selectedSlot?: AvailableSlot;
  selectedDate?: Date;
}

export function AdvancedBookingCalendar({
  practitionerId,
  onSlotSelect,
  selectedSlot,
  selectedDate
}: AdvancedBookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(new Date());

  useEffect(() => {
    if (practitionerId) {
      loadPractitioner();
    }
  }, [practitionerId]);

  useEffect(() => {
    if (currentDate && practitionerId) {
      loadAvailableSlots();
    }
  }, [currentDate, practitionerId]);

  const loadPractitioner = async () => {
    try {
      const data = await api.getPractitioner(practitionerId);
      setPractitioner(data);
    } catch (error) {
      console.error('Erreur lors du chargement du praticien:', error);
    }
  };

  const loadAvailableSlots = async () => {
    setLoading(true);
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const data = await api.getAvailableSlots(practitionerId, dateStr);
      setAvailableSlots(data);
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isBefore(date, new Date())) {
      setCurrentDate(date);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  const getSlotStatus = (slot: AvailableSlot) => {
    if (slot.isBooked) return 'booked';
    if (slot.bookedCount && slot.bookedCount >= slot.capacity) return 'full';
    return 'available';
  };

  const getSlotVariant = (slot: AvailableSlot) => {
    const status = getSlotStatus(slot);
    switch (status) {
      case 'booked':
      case 'full':
        return 'secondary';
      case 'available':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const isSlotDisabled = (slot: AvailableSlot) => {
    return slot.isBooked || (slot.bookedCount && slot.bookedCount >= slot.capacity);
  };

  const disabledDays = (date: Date) => {
    return isBefore(date, new Date());
  };

  return (
    <div className="space-y-6">
      {/* Informations du praticien */}
      {practitioner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dr. {practitioner.firstName} {practitioner.lastName}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {practitioner.specialization}
              </p>
              <p className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                Consultation : {practitioner.consultationDuration} minutes
              </p>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendrier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Choisir une date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={handleDateSelect}
              disabled={disabledDays}
              locale={fr}
              className="rounded-md border"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </CardContent>
        </Card>

        {/* Créneaux disponibles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Créneaux disponibles
              {currentDate && (
                <span className="text-sm font-normal text-muted-foreground">
                  - {format(currentDate, 'EEEE d MMMM', { locale: fr })}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id && 
                    selectedDate && isSameDay(selectedDate, currentDate);
                  const disabled = isSlotDisabled(slot);
                  
                  return (
                    <Button
                      key={slot.id}
                      variant={isSelected ? 'default' : getSlotVariant(slot)}
                      className={`w-full justify-between h-auto py-3 px-4 ${
                        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => !disabled && onSlotSelect(slot, currentDate)}
                      disabled={disabled}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {disabled ? (
                          <Badge variant="secondary">Complet</Badge>
                        ) : (
                          <Badge variant="outline">Disponible</Badge>
                        )}
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun créneau disponible pour cette date</p>
                <p className="text-sm mt-1">Sélectionnez une autre date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedSlot && selectedDate && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="border-primary text-primary">
                Créneau sélectionné
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}