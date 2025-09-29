import { AppointmentCalendar } from "@/components/calendar/appointment-calendar"

export default function Calendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Planning</h1>
        <p className="text-muted-foreground">
          Gérez vos rendez-vous et créneaux
        </p>
      </div>
      <AppointmentCalendar />
    </div>
  )
}