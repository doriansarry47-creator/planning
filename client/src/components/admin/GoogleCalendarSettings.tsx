import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar as CalendarIcon, 
  Link as LinkIcon,
  Unlink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import {
  loadGoogleCalendarAPI,
  signInToGoogle,
  signOutFromGoogle,
  isSignedIn,
  syncSlotsWithGoogle,
  GOOGLE_CONFIG,
} from '@/lib/googleCalendar';

interface GoogleCalendarSettingsProps {
  slots?: Array<{
    date: string;
    startTime: string;
    endTime: string;
    status: 'available' | 'booked' | 'cancelled';
    patientName?: string;
    consultationType?: string;
    notes?: string;
  }>;
}

export default function GoogleCalendarSettings({ slots = [] }: GoogleCalendarSettingsProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Vérifier l'état de la connexion au chargement
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      await loadGoogleCalendarAPI();
      setIsConnected(isSignedIn());
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
    }
  };

  // Connexion à Google
  const handleConnect = async () => {
    if (!GOOGLE_CONFIG.CLIENT_ID || !GOOGLE_CONFIG.API_KEY) {
      toast.error(
        'Configuration Google manquante',
        {
          description: 'Veuillez configurer VITE_GOOGLE_CLIENT_ID et VITE_GOOGLE_API_KEY dans votre fichier .env',
        }
      );
      return;
    }

    setIsLoading(true);
    try {
      await loadGoogleCalendarAPI();
      const success = await signInToGoogle();
      
      if (success) {
        setIsConnected(true);
        toast.success('Connecté à Google Calendar');
      } else {
        toast.error('Échec de la connexion à Google Calendar');
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast.error('Erreur lors de la connexion à Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnexion de Google
  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await signOutFromGoogle();
      setIsConnected(false);
      toast.success('Déconnecté de Google Calendar');
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronisation manuelle
  const handleSync = async () => {
    if (!isConnected) {
      toast.error('Veuillez d\'abord vous connecter à Google Calendar');
      return;
    }

    setIsSyncing(true);
    try {
      const bookedSlots = slots.filter(s => s.status === 'booked');
      
      if (bookedSlots.length === 0) {
        toast.info('Aucun rendez-vous à synchroniser');
        return;
      }

      const result = await syncSlotsWithGoogle(bookedSlots);
      
      setLastSync(new Date());
      
      if (result.failed === 0) {
        toast.success(
          `${result.success} rendez-vous synchronisé(s) avec succès`
        );
      } else {
        toast.warning(
          `Synchronisation partielle: ${result.success} réussi(s), ${result.failed} échoué(s)`
        );
      }
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>Google Calendar</CardTitle>
              <CardDescription>
                Synchronisez vos rendez-vous avec Google Calendar
              </CardDescription>
            </div>
          </div>
          <Badge variant={isConnected ? 'default' : 'secondary'} className="ml-2">
            {isConnected ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Connecté
              </>
            ) : (
              <>
                <AlertCircle className="mr-1 h-3 w-3" />
                Non connecté
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Instructions de configuration */}
        {(!GOOGLE_CONFIG.CLIENT_ID || !GOOGLE_CONFIG.API_KEY) && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p className="font-semibold mb-2">Configuration requise :</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Créez un projet dans la Google Cloud Console</li>
                <li>Activez l'API Google Calendar</li>
                <li>Créez des identifiants OAuth 2.0</li>
                <li>Ajoutez VITE_GOOGLE_CLIENT_ID et VITE_GOOGLE_API_KEY dans votre .env</li>
              </ol>
              <p className="mt-2 text-xs">
                Consultez le fichier GOOGLE_CALENDAR_SETUP.md pour plus de détails
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* État de la connexion */}
        <div className="space-y-3">
          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Compte Google Calendar connecté
                    </p>
                    {lastSync && (
                      <p className="text-xs text-green-700">
                        Dernière sync: {lastSync.toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                >
                  <Unlink className="mr-2 h-4 w-4" />
                  Déconnecter
                </Button>
              </div>

              {/* Actions de synchronisation */}
              <div className="space-y-2">
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="w-full"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {slots.filter(s => s.status === 'booked').length} rendez-vous réservé(s) à synchroniser
                </p>
              </div>

              {/* Synchronisation automatique (à implémenter) */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <p className="font-semibold">Synchronisation automatique</p>
                  <p className="mt-1">
                    Les rendez-vous sont automatiquement ajoutés à votre Google Calendar 
                    lors de leur création ou modification.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">
                    Google Calendar non connecté
                  </p>
                </div>
              </div>

              <Button
                onClick={handleConnect}
                disabled={isLoading || !GOOGLE_CONFIG.CLIENT_ID || !GOOGLE_CONFIG.API_KEY}
                className="w-full"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                {isLoading ? 'Connexion...' : 'Connecter Google Calendar'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Connectez votre compte Google pour synchroniser automatiquement vos rendez-vous
              </p>
            </div>
          )}
        </div>

        {/* Avantages de la synchronisation */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Avantages :</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Synchronisation bidirectionnelle des rendez-vous</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Rappels automatiques par email</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Accès depuis tous vos appareils</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Partage de disponibilités avec d'autres calendriers</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
