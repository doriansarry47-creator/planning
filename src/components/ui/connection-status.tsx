import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline message after a delay when offline
    let timeoutId: NodeJS.Timeout;
    if (!isOnline) {
      timeoutId = setTimeout(() => {
        setShowOfflineMessage(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOnline]);

  // Auto-hide the offline message after some time when back online
  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineMessage]);

  if (!showOfflineMessage && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
      <div
        className={`
          flex items-center gap-3 p-4 rounded-lg shadow-lg border transition-all duration-300
          ${isOnline 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
          }
        `}
      >
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-sm">Connexion rétablie</p>
              <p className="text-xs text-green-600">Vous êtes de nouveau en ligne</p>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-sm">Connexion interrompue</p>
              <p className="text-xs text-red-600">Vérifiez votre connexion internet</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Component to show when app is trying to reconnect
export function ReconnectingIndicator({ 
  show, 
  attempts = 0 
}: { 
  show: boolean;
  attempts?: number;
}) {
  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg shadow-lg">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <p className="text-sm font-medium">
          Reconnexion en cours... {attempts > 0 && `(Tentative ${attempts})`}
        </p>
      </div>
    </div>
  );
}