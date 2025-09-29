import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// TODO: remove mock functionality
const mockAppointments = [
  {
    id: "1",
    patientName: "Marie Dubois",
    time: "09:00",
    duration: 30,
    type: "Consultation",
    status: "confirmed",
  },
  {
    id: "2",
    patientName: "Pierre Martin",
    time: "10:30",
    duration: 45,
    type: "Contrôle",
    status: "confirmed",
  },
  {
    id: "3",
    patientName: "Sophie Bernard",
    time: "14:00",
    duration: 30,
    type: "Consultation",
    status: "pending",
  },
]

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
]

export function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAppointmentAtTime = (time: string) => {
    return mockAppointments.find(apt => apt.time === time)
  }

  const isSlotAvailable = (time: string) => {
    return !mockAppointments.some(apt => apt.time === time)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-chart-2 text-white"
      case "pending":
        return "bg-chart-3 text-black"
      default:
        return "bg-muted"
    }
  }

  const previousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const nextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const handleSlotClick = (time: string) => {
    const appointment = getAppointmentAtTime(time)
    if (appointment) {
      console.log("Appointment clicked:", appointment)
    } else {
      setSelectedSlot(time)
      console.log("Available slot selected:", time)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Planning du jour</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousDay}
                data-testid="button-previous-day"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-medium min-w-0 text-center">
                {formatDate(selectedDate)}
              </h3>
              <Button
                variant="outline"
                size="icon"
                onClick={nextDay}
                data-testid="button-next-day"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button data-testid="button-add-appointment">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau RDV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {timeSlots.map((time) => {
              const appointment = getAppointmentAtTime(time)
              const isAvailable = isSlotAvailable(time)
              
              return (
                <div
                  key={time}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover-elevate ${
                    selectedSlot === time ? "ring-2 ring-primary" : ""
                  } ${
                    isAvailable ? "hover:bg-muted/50" : ""
                  }`}
                  onClick={() => handleSlotClick(time)}
                  data-testid={`slot-${time}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        {time}
                      </div>
                      {appointment ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.patientName}</span>
                          <Badge variant="secondary">{appointment.type}</Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Créneau libre</span>
                      )}
                    </div>
                    {appointment && (
                      <Badge 
                        className={getStatusColor(appointment.status)}
                        data-testid={`status-${appointment.status}`}
                      >
                        {appointment.status === "confirmed" ? "Confirmé" : "En attente"}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau rendez-vous - {selectedSlot}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground">
              Interface de création de rendez-vous pour le créneau {selectedSlot}
            </div>
            <div className="mt-4 flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                Annuler
              </Button>
              <Button onClick={() => {
                console.log("Creating appointment at", selectedSlot)
                setSelectedSlot(null)
              }}>
                Créer le rendez-vous
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}