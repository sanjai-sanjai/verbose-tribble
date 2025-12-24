import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export type SyncStep = 'userProgress' | 'leaderboard' | 'eduCoins' | 'subjectProgress' | 'tasks';
export type SyncStatus = 'unsynced' | 'syncing' | 'synced' | 'error';

export interface SyncResult {
  step: SyncStep;
  status: 'success' | 'failed';
  timestamp?: string;
}

export interface UseSyncManagerReturn {
  syncStatus: SyncStatus;
  lastSyncTime: string | null;
  isOnline: boolean;
  isSyncing: boolean;
  syncResults: SyncResult[];
  hasUnsynced: boolean;
  handleSync: () => Promise<void>;
  resetSync: () => void;
}

const SYNC_STEPS: SyncStep[] = [
  'userProgress',
  'leaderboard',
  'eduCoins',
  'subjectProgress',
  'tasks',
];

const SYNC_INTERVAL = 500; // Delay between sync steps (ms)

export function useSyncManager(): UseSyncManagerReturn {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('unsynced');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);

  // Load last sync time from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('last_sync_time');
    if (saved) {
      setLastSyncTime(saved);
      setSyncStatus('synced');
    }

    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate sequential sync operations
  const performSyncOperation = async (step: SyncStep): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate occasional failures for testing (10% failure rate)
        const success = Math.random() > 0.1;

        if (success) {
          setSyncResults((prev) => [
            ...prev,
            {
              step,
              status: 'success',
              timestamp: new Date().toISOString(),
            },
          ]);
        } else {
          setSyncResults((prev) => [
            ...prev,
            {
              step,
              status: 'failed',
              timestamp: new Date().toISOString(),
            },
          ]);
        }

        resolve(success);
      }, SYNC_INTERVAL);
    });
  };

  // Check internet connectivity
  const checkInternetConnection = (): boolean => {
    return navigator.onLine;
  };

  // Perform the complete sync
  const handleSync = useCallback(async () => {
    // Check internet connection first
    if (!checkInternetConnection()) {
      toast.error('No internet connection', {
        description: 'Please try again when you have internet access.',
      });
      setSyncStatus('error');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncResults([]);

    try {
      let allSuccessful = true;

      // Perform each sync step sequentially
      for (const step of SYNC_STEPS) {
        const success = await performSyncOperation(step);
        if (!success) {
          allSuccessful = false;
          // Don't break on failure - continue syncing remaining steps
        }
      }

      // Update sync status based on results
      if (allSuccessful) {
        const now = new Date().toISOString();
        localStorage.setItem('last_sync_time', now);
        localStorage.setItem('sync_status', 'synced');
        setLastSyncTime(now);
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      toast.error('Sync failed', {
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Mark data as unsynced when it changes
  const markUnsynced = useCallback(() => {
    setSyncStatus('unsynced');
    localStorage.setItem('sync_status', 'unsynced');
  }, []);

  // Reset sync state
  const resetSync = useCallback(() => {
    setSyncStatus('unsynced');
    setSyncResults([]);
    localStorage.setItem('sync_status', 'unsynced');
  }, []);

  const hasUnsynced = syncStatus === 'unsynced';

  return {
    syncStatus,
    lastSyncTime,
    isOnline,
    isSyncing,
    syncResults,
    hasUnsynced,
    handleSync,
    resetSync,
  };
}
