import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  capacity?: number; // Pour ateliers de groupe
  bookedCount?: number;
  isUrgency?: boolean; // Créneau urgence
  price?: number;
}

interface EnhancedCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  availableSlots: TimeSlot[];
  viewMode?: 'patient' | 'admin';
}

export function EnhancedCalendar({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  availableSlots,
  viewMode = 'patient'
}: EnhancedCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Jours du mois suivant
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  // Déterminer la disponibilité d'une date
  const getDateAvailability = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return 'past';
    if (date.getDay() === 0 || date.getDay() === 6) return 'weekend';
    
    // Simuler différents niveaux de disponibilité
    const dayOfMonth = date.getDate();
    if (dayOfMonth % 7 === 0) return 'full'; // Complet
    if (dayOfMonth % 3 === 0) return 'limited'; // Limité (2-3 créneaux)
    return 'available'; // Disponible
  };

  // Compter les créneaux disponibles pour une date
  const getAvailableSlotsCount = (date: Date) => {
    const availability = getDateAvailability(date);
    if (availability === 'available') return Math.floor(Math.random() * 5) + 5;
    if (availability === 'limited') return Math.floor(Math.random() * 3) + 1;
    return 0;
  };

  // Styles par niveau de disponibilité
  const getDateStyles = (date: Date, isCurrentMonth: boolean, isSelected: boolean) => {
    if (!isCurrentMonth) {
      return 'text-gray-300 cursor-not-allowed';
    }
    
    if (isSelected) {
      return 'bg-gradient-to-br from-sage-600 to-therapy-600 text-white shadow-lg ring-2 ring-sage-400 ring-offset-2 scale-105';
    }
    
    const availability = getDateAvailability(date);
    
    switch (availability) {
      case 'past':
        return 'text-gray-400 cursor-not-allowed bg-gray-50';
      case 'weekend':
        return 'text-gray-400 cursor-not-allowed bg-gray-50';
      case 'full':
        return 'text-gray-500 cursor-not-allowed bg-red-50 border border-red-200';
      case 'limited':
        return 'text-amber-700 hover:bg-amber-50 cursor-pointer border border-amber-200 hover:shadow-md hover:scale-105';
      case 'available':
        return 'text-gray-700 hover:bg-sage-50 cursor-pointer border border-sage-200 hover:shadow-md hover:scale-105';
      default:
        return 'text-gray-700';
    }
  };

  // Badge de disponibilité
  const getAvailabilityBadge = (date: Date) => {
    const availability = getDateAvailability(date);
    const count = getAvailableSlotsCount(date);
    
    switch (availability) {
      case 'available':
        return (
          <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        );
      case 'limited':
        return (
          <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-amber-500 rounded-full"></div>
        );
      case 'full':
        return (
          <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></div>
        );
      default:
        return null;
    }
  };

  const isDateSelectable = (date: Date) => {
    const availability = getDateAvailability(date);
    return availability === 'available' || availability === 'limited';
  };

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (isCurrentMonth && isDateSelectable(date)) {
      onDateSelect(date);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Calendrier */}
      <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-sage-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-sage-600" />
              Choisissez une date
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousMonth}
                className="hover:bg-sage-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextMonth}
                className="hover:bg-sage-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-gray-600 font-medium">
            {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </CardHeader>
        <CardContent>
          {/* Légende */}
          <div className="mb-4 p-3 bg-sage-50/50 rounded-lg border border-sage-100">
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Disponible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-gray-700">Limité</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Complet</span>
              </div>
            </div>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map(({ date, isCurrentMonth }, index) => {
              const isSelected = selectedDate && 
                date.toDateString() === selectedDate.toDateString();
              const isHovered = hoveredDate && 
                date.toDateString() === hoveredDate.toDateString();
              
              return (
                <button
                  key={index}
                  className={`
                    relative p-2 sm:p-3 text-sm rounded-lg transition-all duration-200
                    ${getDateStyles(date, isCurrentMonth, !!isSelected)}
                    ${isHovered && isCurrentMonth ? 'ring-2 ring-sage-300' : ''}
                  `}
                  onClick={() => handleDateClick(date, isCurrentMonth)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={!isDateSelectable(date) || !isCurrentMonth}
                >
                  <span className="font-medium">{date.getDate()}</span>
                  {isCurrentMonth && getAvailabilityBadge(date)}
                  
                  {/* Tooltip au survol */}
                  {isHovered && isCurrentMonth && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10 
                                    bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap
                                    shadow-lg">
                      {getAvailableSlotsCount(date)} créneaux disponibles
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 
                                      w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Créneaux horaires */}
      <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-sage-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-sage-600" />
            Choisissez un horaire
          </CardTitle>
          <p className="text-gray-600">
            {selectedDate 
              ? formatDate(selectedDate)
              : 'Sélectionnez d\'abord une date'
            }
          </p>
          {selectedDate && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-gray-700 font-medium">
                {getAvailableSlotsCount(selectedDate)} créneaux disponibles
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <div className="space-y-4">
              {/* Créneaux du matin */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-sage-400 rounded-full"></span>
                  Matin
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.filter(slot => {
                    const hour = parseInt(slot.time.split(':')[0]);
                    return hour < 12;
                  }).map((slot) => (
                    <button
                      key={slot.id}
                      className={`
                        relative p-4 border-2 rounded-lg text-left transition-all duration-200
                        ${!slot.available 
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                          : selectedTime === slot.time 
                          ? 'border-sage-600 bg-sage-50 text-sage-700 shadow-lg ring-2 ring-sage-300 scale-105' 
                          : 'border-gray-200 hover:border-sage-300 text-gray-700 hover:shadow-md hover:scale-102'
                        }
                      `}
                      onClick={() => slot.available && onTimeSelect(slot.time)}
                      disabled={!slot.available}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg">{slot.time}</div>
                          <div className="text-xs mt-0.5">
                            {slot.available ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Disponible
                              </span>
                            ) : (
                              <span className="text-gray-500">Réservé</span>
                            )}
                          </div>
                        </div>
                        {slot.isUrgency && (
                          <div className="absolute top-1 right-1">
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              URGENCE
                            </span>
                          </div>
                        )}
                        {slot.capacity && slot.capacity > 1 && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Users className="h-3 w-3" />
                            <span>{slot.bookedCount}/{slot.capacity}</span>
                          </div>
                        )}
                      </div>
                      {slot.price && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-sm font-semibold text-therapy-700">{slot.price}€</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Créneaux de l'après-midi */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-therapy-400 rounded-full"></span>
                  Après-midi
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.filter(slot => {
                    const hour = parseInt(slot.time.split(':')[0]);
                    return hour >= 12;
                  }).map((slot) => (
                    <button
                      key={slot.id}
                      className={`
                        relative p-4 border-2 rounded-lg text-left transition-all duration-200
                        ${!slot.available 
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                          : selectedTime === slot.time 
                          ? 'border-therapy-600 bg-therapy-50 text-therapy-700 shadow-lg ring-2 ring-therapy-300 scale-105' 
                          : 'border-gray-200 hover:border-therapy-300 text-gray-700 hover:shadow-md hover:scale-102'
                        }
                      `}
                      onClick={() => slot.available && onTimeSelect(slot.time)}
                      disabled={!slot.available}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg">{slot.time}</div>
                          <div className="text-xs mt-0.5">
                            {slot.available ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Disponible
                              </span>
                            ) : (
                              <span className="text-gray-500">Réservé</span>
                            )}
                          </div>
                        </div>
                        {slot.isUrgency && (
                          <div className="absolute top-1 right-1">
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              URGENCE
                            </span>
                          </div>
                        )}
                      </div>
                      {slot.price && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-sm font-semibold text-therapy-700">{slot.price}€</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message d'aide */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">Besoin d'un autre créneau ?</p>
                    <p className="mt-1 text-blue-700">
                      Contactez-nous au 06.45.15.63.68 pour trouver un horaire qui vous convient.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Sélectionnez une date</p>
              <p className="text-sm mt-1">pour voir les créneaux disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
