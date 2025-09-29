import { CalendarDays, Users, Clock, TrendingUp, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import emptyCalendar from "@assets/generated_images/Empty_calendar_state_3f2fdc31.png"

// TODO: remove mock functionality
const mockStats = {
  todayAppointments: 8,
  totalPatients: 247,
  weeklyAppointments: 32,
  monthlyRevenue: 4850,
}

const mockUpcomingAppointments = [
  {
    id: "1",
    time: "09:00",
    patient: "Marie Dubois",
    type: "Consultation",
    status: "confirmed",
  },
  {
    id: "2", 
    time: "10:30",
    patient: "Pierre Martin",
    type: "Contrôle",
    status: "confirmed",
  },
  {
    id: "3",
    time: "14:00",
    patient: "Sophie Bernard", 
    type: "Consultation",
    status: "pending",
  },
]

const mockAlerts = [
  {
    id: "1",
    type: "appointment",
    message: "2 rendez-vous en attente de confirmation",
    priority: "medium",
  },
  {
    id: "2",
    type: "schedule",
    message: "Créneaux libres disponibles cet après-midi",
    priority: "low",
  },
]

export function PractitionerDashboard() {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-chart-2 text-white"
      case "pending":
        return "bg-chart-3 text-black"
      default:
        return "bg-muted"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-chart-3"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RDV aujourd'hui</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-today-appointments">
              {mockStats.todayAppointments}
            </div>
            <p className="text-xs text-muted-foreground">
              +2 par rapport à hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-patients">
              {mockStats.totalPatients}
            </div>
            <p className="text-xs text-muted-foreground">
              +12 ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RDV cette semaine</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-weekly-appointments">
              {mockStats.weeklyAppointments}
            </div>
            <p className="text-xs text-muted-foreground">
              +5% par rapport à la semaine dernière
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-monthly-revenue">
              {mockStats.monthlyRevenue}€
            </div>
            <p className="text-xs text-muted-foreground">
              +8% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Rendez-vous du jour</CardTitle>
            <CardDescription>
              {mockUpcomingAppointments.length} rendez-vous programmés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockUpcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <img 
                  src={emptyCalendar} 
                  alt="Aucun rendez-vous" 
                  className="mx-auto h-32 w-32 object-contain mb-4 opacity-50"
                />
                <p className="text-muted-foreground">Aucun rendez-vous aujourd'hui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mockUpcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                    data-testid={`appointment-${appointment.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium">{appointment.time}</div>
                      <div>
                        <div className="font-medium">{appointment.patient}</div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.type}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(appointment.status)}>
                      {appointment.status === "confirmed" ? "Confirmé" : "En attente"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts and Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              {mockAlerts.length} notification{mockAlerts.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg"
                  data-testid={`alert-${alert.id}`}
                >
                  <AlertCircle 
                    className={`h-4 w-4 mt-0.5 ${getPriorityColor(alert.priority)}`} 
                  />
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}