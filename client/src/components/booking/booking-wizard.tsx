import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { AdvancedBookingCalendar } from './advanced-booking-calendar';
import { 
  User, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Stethoscope,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface Practitioner {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  biography?: string;
  consultationDuration: number;
}

interface AvailableSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  capacity: number;
}

interface BookingWizardProps {
  onBookingComplete?: (appointmentId: string) => void;
  onCancel?: () => void;
}

export function BookingWizard({ onBookingComplete, onCancel }: BookingWizardProps) {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);

  useEffect(() => {
    loadPractitioners();
  }, []);

  const loadPractitioners = async () => {
    try {
      const data = await api.getPractitioners();
      setPractitioners(data);
      
      // Extraire les spécialisations uniques
      const uniqueSpecializations = Array.from(
        new Set(data.map(p => p.specialization))
      );
      setSpecializations(uniqueSpecializations);
    } catch (error) {
      setError('Erreur lors du chargement des praticiens');
    }
  };

  const filteredPractitioners = specializationFilter
    ? practitioners.filter(p => p.specialization === specializationFilter)
    : practitioners;

  const handleSlotSelect = (slot: AvailableSlot, date: Date) => {
    setSelectedSlot(slot);
    setSelectedDate(date);
  };

  const handleBooking = async () => {
    if (!selectedPractitioner || !selectedSlot || !selectedDate || !token) {
      setError('Veuillez compléter toutes les informations');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const appointmentData = {
        practitionerId: selectedPractitioner,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: reason || undefined,
        notes: notes || undefined,
      };

      const appointment = await api.createAppointment(appointmentData, token);
      
      if (onBookingComplete) {
        onBookingComplete(appointment.id);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setError('');
    if (step === 1 && !selectedPractitioner) {
      setError('Veuillez sélectionner un praticien');
      return;
    }
    if (step === 2 && (!selectedSlot || !selectedDate)) {
      setError('Veuillez sélectionner un créneau');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const selectedPractitionerData = practitioners.find(p => p.id === selectedPractitioner);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepNumber
                    ? 'bg-primary text-primary-foreground'
                    : step > stepNumber
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > stepNumber ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-16 h-0.5 ml-2 ${
                    step > stepNumber ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Étape {step} sur 3
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Sélection du praticien */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Choisir un praticien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtre par spécialisation */}
            <div className="flex items-center gap-4">
              <Filter className="w-4 h-4" />
              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filtrer par spécialisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les spécialisations</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Liste des praticiens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPractitioners.map((practitioner) => (
                <Card
                  key={practitioner.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPractitioner === practitioner.id
                      ? 'ring-2 ring-primary border-primary'
                      : ''
                  }`}
                  onClick={() => setSelectedPractitioner(practitioner.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Dr. {practitioner.firstName} {practitioner.lastName}
                      </CardTitle>
                      {selectedPractitioner === practitioner.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <Badge variant="outline">{practitioner.specialization}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Consultation : {practitioner.consultationDuration} min</span>
                      </div>
                      {practitioner.biography && (
                        <p className="text-xs line-clamp-2">{practitioner.biography}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPractitioners.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun praticien trouvé pour cette spécialisation</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Sélection du créneau */}
      {step === 2 && selectedPractitioner && (
        <AdvancedBookingCalendar
          practitionerId={selectedPractitioner}
          onSlotSelect={handleSlotSelect}
          selectedSlot={selectedSlot || undefined}
          selectedDate={selectedDate || undefined}
        />
      )}

      {/* Step 3: Confirmation et détails */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Confirmer votre rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Résumé de la réservation */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Résumé de votre rendez-vous</h4>
              
              {selectedPractitionerData && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Dr. {selectedPractitionerData.firstName} {selectedPractitionerData.lastName}</span>
                  <Badge variant="outline">{selectedPractitionerData.specialization}</Badge>
                </div>
              )}
              
              {selectedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                </div>
              )}
              
              {selectedSlot && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                </div>
              )}
            </div>

            {/* Informations complémentaires */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Motif de la consultation</Label>
                <Input
                  id="reason"
                  placeholder="Ex: Consultation de routine, douleurs..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes ou informations complémentaires</Label>
                <Textarea
                  id="notes"
                  placeholder="Informations que vous souhaitez partager avec le praticien..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Informations importantes */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous recevrez un email de confirmation après la réservation. 
                Vous pourrez annuler ou modifier votre rendez-vous jusqu'à 24h avant la consultation.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={prevStep} disabled={loading}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
          )}
          {step === 1 && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {step < 3 ? (
            <Button onClick={nextStep} disabled={loading}>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleBooking} disabled={loading}>
              {loading ? 'Réservation en cours...' : 'Confirmer la réservation'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}