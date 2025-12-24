import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useSyncManager } from '@/hooks/use-sync-manager';
import { DataSyncModal } from '@/components/student/DataSyncModal';
import { useState } from 'react';

interface DataSyncStatusProps {
  className?: string;
}

export function DataSyncStatus({ className }: DataSyncStatusProps) {
  const { t } = useTranslation();
  const {
    syncStatus,
    lastSyncTime,
    isSyncing,
    syncResults,
    handleSync,
  } = useSyncManager();

  const [showModal, setShowModal] = useState(false);

  const handleSyncClick = async () => {
    await handleSync();
    // Show modal after sync completes
    setTimeout(() => {
      setShowModal(true);
    }, SYNC_STEPS.length * 500 + 200);
  };

  const formatSyncTime = (timestamp: string | null) => {
    if (!timestamp) return t('sync.unknown');

    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins === 0) return t('sync.justNow');
      if (diffMins < 60) return `${diffMins}m ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      // Format as "Today, HH:MM AM/PM" or "Date, HH:MM AM/PM"
      const timeStr = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      if (date.toDateString() === now.toDateString()) {
        return `${t('sync.today')} ${t('sync.at')} ${timeStr}`;
      }

      const dateStr = date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
      return `${dateStr} ${t('sync.at')} ${timeStr}`;
    } catch {
      return t('sync.unknown');
    }
  };

  // Determine button state and colors
  const isUnsynced = syncStatus === 'unsynced';
  const isSynced = syncStatus === 'synced';
  const isError = syncStatus === 'error';

  // Button colors based on sync status
  const buttonColorClass = isSynced
    ? 'bg-secondary/10 text-secondary hover:bg-secondary/20'
    : isError
      ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
      : isSyncing
        ? 'bg-primary/10 text-primary hover:bg-primary/20'
        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20';

  // Tooltip text based on status
  const tooltipText = isSynced
    ? t('sync.allDataSynced')
    : isSyncing
      ? t('sync.syncing')
      : isError
        ? t('sync.syncFailed')
        : t('sync.dataNotSynced');

  // Display text based on status
  const displayText = isSynced
    ? `${t('sync.lastSynced')}: ${formatSyncTime(lastSyncTime)}`
    : isSyncing
      ? t('sync.syncing')
      : isError
        ? t('sync.syncFailed')
        : t('sync.readyToSync');

  return (
    <>
      <button
        onClick={handleSyncClick}
        disabled={isSyncing}
        className={cn(
          'inline-flex items-center gap-1.5',
          'px-2 sm:px-3',
          'h-10 rounded-lg',
          'text-xs sm:text-sm font-medium',
          'transition-all duration-200',
          'disabled:opacity-70',
          buttonColorClass,
          className
        )}
        title={tooltipText}
        aria-label={`Sync data - ${tooltipText}`}
      >
        <RefreshCw
          className={cn(
            'h-4 w-4 flex-shrink-0',
            isSyncing && 'animate-spin'
          )}
        />
        <span className="hidden sm:inline whitespace-nowrap">
          {displayText}
        </span>
      </button>

      {/* Sync Modal */}
      <DataSyncModal
        open={showModal}
        onClose={() => setShowModal(false)}
        syncResults={syncResults}
        isSuccess={syncStatus === 'synced'}
        lastSyncTime={lastSyncTime}
        onRetry={handleSyncClick}
      />
    </>
  );
}

// List of sync steps for timing calculation
const SYNC_STEPS = [
  'userProgress',
  'leaderboard',
  'eduCoins',
  'subjectProgress',
  'tasks',
] as const;
