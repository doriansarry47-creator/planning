import { useState } from "react"
import { Calendar, Clock, User, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import appointmentConfirmation from "@assets/generated_images/Appointment_confirmation_graphic_e68768fc.png"

// TODO: remove mock functionality
const availableSlots = [
  { date: "2024-04-22", time: "09:00", available: true },
  { date: "2024-04-22", time: "10:30", available: true },
  { date: "2024-04-22", time: "14:00", available: false },
  { date: "2024-04-22", time: "15:30", available: true },
  { date: "2024-04-23", time: "09:30", available: true },
  { date: "2024-04-23", time: "11:00", available: true },
  { date: "2024-04-23", time: "16:00", available: true },
]

type BookingStep = "selection" | "details" | "confirmation"

export function AppointmentBooking() {
  const [currentStep, setCurrentStep] = useState<BookingStep>("selection")
  const [selectedSlot, setSelectedSlot] = useState<{date: string, time: string} | null>(null)
  const [patientDetails, setPatientDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    reason: "",
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedSlot({ date, time })
    console.log("Slot selected:", { date, time })
  }

  const handleNext = () => {
    if (currentStep === "selection" && selectedSlot) {
      setCurrentStep("details")
    } else if (currentStep === "details") {
      setCurrentStep("confirmation")
      console.log("Booking confirmed:", { selectedSlot, patientDetails })
    }
  }

  const handleBack = () => {
    if (currentStep === "details") {
      setCurrentStep("selection")
    } else if (currentStep === "confirmation") {
      setCurrentStep("details")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setPatientDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const groupedSlots = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = []
    }
    acc[slot.date].push(slot)
    return acc
  }, {} as Record<string, typeof availableSlots>)

  if (currentStep === "confirmation") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-32 w-48 bg-muted rounded-lg flex items-center justify-center">
            <img src={appointmentConfirmation} alt="Rendez-vous confirmé" className="max-h-full max-w-full object-contain" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Check className="h-5 w-5 text-chart-2" />
            Rendez-vous confirmé
          </CardTitle>
          <CardDescription>
            Votre demande de rendez-vous a été envoyée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{formatDate(selectedSlot!.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{selectedSlot!.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{patientDetails.firstName} {patientDetails.lastName}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Vous recevrez un email de confirmation avec tous les détails
          </div>
          <Button 
            className="w-full" 
            onClick={() => {
              setCurrentStep("selection")
              setSelectedSlot(null)
              setPatientDetails({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                reason: "",
              })
            }}
            data-testid="button-new-appointment"
          >
            Prendre un autre rendez-vous
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Prendre rendez-vous</CardTitle>
        <CardDescription>
          {currentStep === "selection" 
            ? "Choisissez un créneau disponible"
            : "Complétez vos informations"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === "selection" && (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([date, slots]) => (
              <div key={date} className="space-y-3">
                <h3 className="font-medium">{formatDate(date)}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <Button
                      key={`${slot.date}-${slot.time}`}
                      variant={
                        selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                          ? "default"
                          : "outline"
                      }
                      disabled={!slot.available}
                      onClick={() => handleSlotSelect(slot.date, slot.time)}
                      className="flex items-center gap-2"
                      data-testid={`slot-${slot.date}-${slot.time}`}
                    >
                      <Clock className="h-4 w-4" />
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            {selectedSlot && (
              <div className="mt-6">
                <Badge variant="secondary" className="text-sm">
                  Sélectionné: {formatDate(selectedSlot.date)} à {selectedSlot.time}
                </Badge>
              </div>
            )}
          </div>
        )}

        {currentStep === "details" && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(selectedSlot!.date)} à {selectedSlot!.time}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={patientDetails.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                  data-testid="input-booking-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={patientDetails.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                  data-testid="input-booking-lastname"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={patientDetails.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                data-testid="input-booking-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={patientDetails.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                data-testid="input-booking-phone"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Motif de consultation</Label>
              <Textarea
                id="reason"
                placeholder="Décrivez brièvement le motif de votre visite..."
                value={patientDetails.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                rows={3}
                data-testid="input-booking-reason"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === "selection"}
            data-testid="button-back"
          >
            Retour
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === "selection" && !selectedSlot) ||
              (currentStep === "details" && (!patientDetails.firstName || !patientDetails.lastName || !patientDetails.email || !patientDetails.phone))
            }
            data-testid="button-next"
          >
            {currentStep === "selection" ? "Continuer" : "Confirmer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}