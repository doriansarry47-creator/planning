import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle2, XCircle, Clock, Play, Pause, Info } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Composant de gestion de la synchronisation Google Calendar
 * Permet aux administrateurs de :
 * - Voir l'état de la synchronisation automatique
 * - Forcer une synchronisation manuelle
 * - Démarrer/arrêter le polling automatique
 * - Consulter les statistiques de synchronisation
 */
export function SyncManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  // Récupérer les statistiques de synchronisation
  const { data: statsData, refetch: refetchStats } = trpc.calendarSync.getAutoSyncStats.useQuery(
    {},
    {
      refetchInterval: 10000, // Rafraîchir toutes les 10 secondes
    }
  );

  // Vérifier l'état de santé du service
  const { data: healthData, refetch: refetchHealth } = trpc.calendarSync.healthCheck.useQuery(
    {},
    {
      refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    }
  );

  // Mutation pour forcer une synchronisation
  const forceSyncMutation = trpc.calendarSync.forceSyncNow.useMutation({
    onSuccess: (data) => {
      setLastResult(data);
      refetchStats();
      refetchHealth();
    },
  });

  // Mutation pour démarrer le polling
  const startPollingMutation = trpc.calendarSync.startAutoPolling.useMutation({
    onSuccess: () => {
      refetchStats();
    },
  });

  // Mutation pour arrêter le polling
  const stopPollingMutation = trpc.calendarSync.stopAutoPolling.useMutation({
    onSuccess: () => {
      refetchStats();
    },
  });

  const handleForceSync = async () => {
    setIsLoading(true);
    try {
      await forceSyncMutation.mutateAsync({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPolling = async () => {
    await startPollingMutation.mutateAsync({});
  };

  const handleStopPolling = async () => {
    await stopPollingMutation.mutateAsync({});
  };

  const stats = statsData?.stats;
  const isPollingActive = stats?.pollingActive ?? false;
  const isSyncing = stats?.syncInProgress ?? false;
  const cacheValid = stats?.cacheValid ?? false;
  const lastSyncTime = stats?.lastSyncTime ? new Date(stats.lastSyncTime) : null;
  const lastSyncResult = stats?.lastResult;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Synchronisation Google Calendar
          </CardTitle>
          <CardDescription>
            Gérer la synchronisation automatique des rendez-vous supprimés sur Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* État du service */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">État du service</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Google Calendar</span>
                {healthData?.calendarServiceAvailable ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Connecté
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Déconnecté
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Service de Sync</span>
                {healthData?.syncServiceAvailable ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Actif
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactif
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Polling automatique</span>
                {isPollingActive ? (
                  <Badge variant="default" className="bg-blue-500">
                    <Play className="mr-1 h-3 w-3" />
                    Actif (2 min)
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Pause className="mr-1 h-3 w-3" />
                    Inactif
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Synchronisation en cours</span>
                {isSyncing ? (
                  <Badge variant="default" className="bg-yellow-500">
                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                    En cours
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Terminé
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Dernière synchronisation */}
          {lastSyncTime && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Dernière synchronisation</h3>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Il y a {formatDistanceToNow(lastSyncTime, { locale: fr, addSuffix: false })}
                  </span>
                  {cacheValid && (
                    <Badge variant="outline" className="ml-auto">
                      Cache valide
                    </Badge>
                  )}
                </div>
                {lastSyncResult && (
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RDV vérifiés :</span>
                      <span className="font-medium">{lastSyncResult.synced || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RDV annulés :</span>
                      <span className="font-medium text-orange-600">{lastSyncResult.cancelled || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Créneaux libérés :</span>
                      <span className="font-medium text-green-600">{lastSyncResult.freedSlots || 0}</span>
                    </div>
                    {lastSyncResult.errors > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Erreurs :</span>
                        <span className="font-medium text-red-600">{lastSyncResult.errors}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Résultat de la dernière action */}
          {lastResult && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {lastResult.message || 'Synchronisation effectuée'}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleForceSync}
                disabled={isLoading || isSyncing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading || isSyncing ? 'animate-spin' : ''}`} />
                Synchroniser maintenant
              </Button>

              {isPollingActive ? (
                <Button
                  onClick={handleStopPolling}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Arrêter le polling
                </Button>
              ) : (
                <Button
                  onClick={handleStartPolling}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Démarrer le polling
                </Button>
              )}
            </div>
          </div>

          {/* Informations */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Fonctionnement :</strong>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                <li>La synchronisation vérifie automatiquement les RDV supprimés sur Google Calendar</li>
                <li>Les RDV supprimés sont marqués comme "annulés" dans la base de données</li>
                <li>Les créneaux sont immédiatement libérés et disponibles pour de nouvelles réservations</li>
                <li>Le polling automatique synchronise toutes les 2 minutes en production</li>
                <li>Un cache de 30 secondes évite les synchronisations répétées inutiles</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
