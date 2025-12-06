import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, Calendar, Clock, User, AlertTriangle } from 'lucide-react';

export default function CancelAppointment() {
  const [, params] = useRoute('/appointments/cancel/:hash');
  const hash = params?.hash;
  const [cancelled, setCancelled] = useState(false);

  // Récupérer les détails du rendez-vous
  const { data: appointment, isLoading, error } = useQuery({
    queryKey: ['appointment', hash],
    queryFn: async () => {
      const response = await fetch(`/api/trpc/appointments.getByHash?input=${JSON.stringify(hash)}`);
      if (!response.ok) throw new Error('Rendez-vous non trouvé');
      const data = await response.json();
      return data.result.data;
    },
    enabled: !!hash,
  });

  // Mutation pour annuler le rendez-vous
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/trpc/appointments.cancelByHash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: hash }),
      });
      if (!response.ok) throw new Error('Erreur lors de l\'annulation');
      return response.json();
    },
    onSuccess: () => {
      setCancelled(true);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Chargement des informations...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-center text-red-900">Rendez-vous non trouvé</CardTitle>
            <CardDescription className="text-center">
              Ce lien d'annulation n'est pas valide ou a expiré.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-gray-600 mb-4">
              Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le cabinet directement.
            </p>
            <div className="text-center space-y-2 text-sm">
              <p className="font-medium">Contact :</p>
              <p>📞 <a href="tel:+33645156368" className="text-blue-600 hover:underline">06.45.15.63.68</a></p>
              <p>✉️ <a href="mailto:doriansarry@yahoo.fr" className="text-blue-600 hover:underline">doriansarry@yahoo.fr</a></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (appointment.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-orange-200">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <CardTitle className="text-center text-orange-900">Rendez-vous déjà annulé</CardTitle>
            <CardDescription className="text-center">
              Ce rendez-vous a déjà été annulé précédemment.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-green-900">Rendez-vous annulé</CardTitle>
            <CardDescription className="text-center">
              Votre rendez-vous a été annulé avec succès.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-gray-700">
                Un email de confirmation d'annulation vous a été envoyé. Si vous souhaitez reprendre un rendez-vous, 
                n'hésitez pas à nous contacter.
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center space-y-2 text-sm">
              <p className="font-medium">Contact :</p>
              <p>📞 <a href="tel:+33645156368" className="text-blue-600 hover:underline">06.45.15.63.68</a></p>
              <p>✉️ <a href="mailto:doriansarry@yahoo.fr" className="text-blue-600 hover:underline">doriansarry@yahoo.fr</a></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Annuler le rendez-vous</CardTitle>
          <CardDescription className="text-center">
            Êtes-vous sûr de vouloir annuler ce rendez-vous ?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Détails du rendez-vous */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Date</p>
                <p className="text-gray-700">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Heure</p>
                <p className="text-gray-700">{appointment.startTime} - {appointment.endTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Motif</p>
                <p className="text-gray-700">{appointment.reason}</p>
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-900">
              <strong>Attention :</strong> Cette action est irréversible. Pour reprendre un nouveau rendez-vous, 
              vous devrez effectuer une nouvelle réservation.
            </AlertDescription>
          </Alert>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.history.back()}
            >
              Conserver le rendez-vous
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Annulation...
                </>
              ) : (
                'Confirmer l\'annulation'
              )}
            </Button>
          </div>

          {cancelMutation.isError && (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-900">
                Une erreur est survenue lors de l'annulation. Veuillez réessayer ou nous contacter directement.
              </AlertDescription>
            </Alert>
          )}

          {/* Informations de contact */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Besoin d'aide ?</p>
            <div className="space-y-1 text-sm">
              <p>📞 <a href="tel:+33645156368" className="text-blue-600 hover:underline">06.45.15.63.68</a></p>
              <p>✉️ <a href="mailto:doriansarry@yahoo.fr" className="text-blue-600 hover:underline">doriansarry@yahoo.fr</a></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
