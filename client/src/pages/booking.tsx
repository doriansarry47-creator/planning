import { AppointmentBooking } from "@/components/booking/appointment-booking"

export default function Booking() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Prendre rendez-vous</h1>
          <p className="text-muted-foreground">
            Sélectionnez un créneau qui vous convient
          </p>
        </div>
        <AppointmentBooking />
      </div>
    </div>
  )
}