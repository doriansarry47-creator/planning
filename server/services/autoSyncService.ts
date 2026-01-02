import { getCalendarSyncService } from './calendarSyncService';

/**
 * Service de synchronisation automatique avec Google Calendar
 * - Système de cache intelligent pour éviter les synchronisations répétées
 * - Polling automatique périodique
 * - Synchronisation à la demande avant chaque affichage de créneaux
 */

interface SyncCache {
  lastSyncTime: Date;
  lastSyncResult: any;
  isValid: boolean;
}

export class AutoSyncService {
  private cache: SyncCache = {
    lastSyncTime: new Date(0),
    lastSyncResult: null,
    isValid: false,
  };
  
  private syncInProgress: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly CACHE_DURATION_MS = 30 * 1000; // 30 secondes de cache
  private readonly POLLING_INTERVAL_MS = 2 * 60 * 1000; // Polling toutes les 2 minutes

  /**
   * Démarrer le polling automatique
   */
  startAutoPolling(): void {
    if (this.pollingInterval) {
      console.log('[AutoSync] Polling déjà actif');
      return;
    }

    console.log('[AutoSync] 🚀 Démarrage du polling automatique (toutes les 2 minutes)');
    
    // Synchroniser immédiatement
    this.syncIfNeeded(true).catch(err => {
      console.error('[AutoSync] Erreur synchronisation initiale:', err);
    });

    // Puis toutes les 2 minutes
    this.pollingInterval = setInterval(async () => {
      try {
        await this.syncIfNeeded(true);
      } catch (error) {
        console.error('[AutoSync] Erreur polling:', error);
      }
    }, this.POLLING_INTERVAL_MS);
  }

  /**
   * Arrêter le polling automatique
   */
  stopAutoPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('[AutoSync] ⏹️ Polling automatique arrêté');
    }
  }

  /**
   * Vérifier si le cache est encore valide
   */
  private isCacheValid(): boolean {
    if (!this.cache.isValid) return false;
    
    const now = Date.now();
    const cacheAge = now - this.cache.lastSyncTime.getTime();
    return cacheAge < this.CACHE_DURATION_MS;
  }

  /**
   * Invalider le cache (forcer une nouvelle synchronisation)
   */
  invalidateCache(): void {
    this.cache.isValid = false;
    console.log('[AutoSync] Cache invalidé');
  }

  /**
   * Synchroniser si nécessaire (avec cache intelligent)
   * @param force - Forcer la synchronisation même si le cache est valide
   */
  async syncIfNeeded(force: boolean = false): Promise<any> {
    // Si le cache est valide et pas de force, retourner le résultat en cache
    if (!force && this.isCacheValid()) {
      console.log('[AutoSync] ✅ Cache valide, synchronisation ignorée');
      return this.cache.lastSyncResult;
    }

    // Si une synchronisation est déjà en cours, attendre
    if (this.syncInProgress) {
      console.log('[AutoSync] ⏳ Synchronisation déjà en cours, attente...');
      // Attendre un peu et retourner le dernier résultat
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.cache.lastSyncResult;
    }

    try {
      this.syncInProgress = true;
      
      const syncService = getCalendarSyncService();
      if (!syncService) {
        console.log('[AutoSync] ⚠️ Service de synchronisation non disponible');
        return null;
      }

      console.log('[AutoSync] 🔄 Synchronisation des RDV supprimés...');
      const result = await syncService.syncDeletedAppointments();
      
      // Mettre à jour le cache
      this.cache = {
        lastSyncTime: new Date(),
        lastSyncResult: result,
        isValid: true,
      };

      if (result.cancelled > 0) {
        console.log(`[AutoSync] ✅ Synchronisation terminée: ${result.cancelled} RDV annulés, ${result.freedSlots} créneaux libérés`);
      } else {
        console.log('[AutoSync] ✅ Synchronisation terminée: Aucun changement détecté');
      }

      return result;
    } catch (error: any) {
      console.error('[AutoSync] ❌ Erreur synchronisation:', error.message);
      // Ne pas invalider le cache en cas d'erreur, garder les données précédentes
      return this.cache.lastSyncResult;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Obtenir les statistiques de synchronisation
   */
  getStats() {
    return {
      lastSyncTime: this.cache.lastSyncTime,
      cacheValid: this.isCacheValid(),
      pollingActive: this.pollingInterval !== null,
      syncInProgress: this.syncInProgress,
      lastResult: this.cache.lastSyncResult,
    };
  }
}

// Instance singleton
let autoSyncServiceInstance: AutoSyncService | null = null;

export function getAutoSyncService(): AutoSyncService {
  if (!autoSyncServiceInstance) {
    autoSyncServiceInstance = new AutoSyncService();
    
    // Démarrer le polling automatique seulement en production
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_AUTO_SYNC === 'true') {
      autoSyncServiceInstance.startAutoPolling();
      console.log('[AutoSync] 🎯 Service de synchronisation automatique initialisé');
    } else {
      console.log('[AutoSync] 📋 Service de synchronisation en mode manuel (polling désactivé en développement)');
    }
  }
  
  return autoSyncServiceInstance;
}

/**
 * Middleware pour synchroniser avant chaque récupération de créneaux
 */
export async function syncBeforeGetSlots(): Promise<void> {
  const autoSync = getAutoSyncService();
  await autoSync.syncIfNeeded(false); // Utiliser le cache si valide
}
