import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BookAppointment() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Prendre rendez-vous</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Title */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-2">Choisissez un créneau</h2>
            <p className="text-blue-100">Sélectionnez votre date et heure de rendez-vous</p>
          </div>

          {/* Google Calendar Scheduling Embed */}
          <div className="p-6">
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50" style={{ minHeight: '700px' }}>
              <iframe
                src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0sbQAqILaOjO6Z9kgR2i4d_6NHdaUOtqaSrwohnZpFuNLTRbcIAmZQJNaVmwB4ayTGe_Rny1W6?gv=true"
                style={{
                  border: 0,
                  width: '100%',
                  height: '100%',
                  minHeight: '700px'
                }}
                frameBorder="0"
                title="Réservation de rendez-vous"
              />
            </div>
          </div>

          {/* Info Footer */}
          <div className="bg-blue-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              💡 Tous les rendez-vous sont de 60 minutes. Vous recevrez une confirmation par email après votre réservation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
