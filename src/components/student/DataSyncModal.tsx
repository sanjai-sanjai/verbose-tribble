import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SyncResult, SyncStep } from '@/hooks/use-sync-manager';

interface DataSyncModalProps {
  open: boolean;
  onClose: () => void;
  syncResults: SyncResult[];
  isSuccess: boolean;
  lastSyncTime: string | null;
  onRetry?: () => void;
}

const syncStepConfig: Record<
  SyncStep,
  { icon: string; label: string; translationKey: string }
> = {
  userProgress: {
    icon: '👤',
    label: 'User Progress',
    translationKey: 'sync.steps.userProgress',
  },
  leaderboard: {
    icon: '🏆',
    label: 'Leaderboard',
    translationKey: 'sync.steps.leaderboard',
  },
  eduCoins: {
    icon: '🪙',
    label: 'EduCoins Wallet',
    translationKey: 'sync.steps.eduCoins',
  },
  subjectProgress: {
    icon: '📚',
    label: 'Subject Progress',
    translationKey: 'sync.steps.subjectProgress',
  },
  tasks: {
    icon: '✅',
    label: 'Tasks & Verifications',
    translationKey: 'sync.steps.tasks',
  },
};

export function DataSyncModal({
  open,
  onClose,
  syncResults,
  isSuccess,
  lastSyncTime,
  onRetry,
}: DataSyncModalProps) {
  const { t } = useTranslation();
  const [visibleSteps, setVisibleSteps] = useState<number>(0);

  // Animate items appearing one by one
  useEffect(() => {
    if (!open || syncResults.length === 0) {
      setVisibleSteps(0);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    const interval = setInterval(() => {
      setVisibleSteps((prev) =>
        prev < syncResults.length ? prev + 1 : syncResults.length
      );
    }, 300);

    return () => clearInterval(interval);
  }, [open, syncResults.length]);

  if (!open) return null;

  const failedSteps = syncResults.filter((r) => r.status === 'failed').length;
  const successSteps = syncResults.filter((r) => r.status === 'success').length;

  const formatSyncTime = (timestamp: string | null) => {
    if (!timestamp) return t('sync.unknown');

    try {
      const date = new Date(timestamp);
      const now = new Date();

      // Check if today
      if (date.toDateString() === now.toDateString()) {
        const timeStr = date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `${t('sync.today')} ${t('sync.at')} ${timeStr}`;
      }

      // Format as "Date, HH:MM AM/PM"
      const dateStr = date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
      const timeStr = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      return `${dateStr} ${t('sync.at')} ${timeStr}`;
    } catch {
      return t('sync.unknown');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal background with glassmorphism */}
      <div className="glass-card border border-border rounded-3xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
        {/* Success/Failure Header */}
        <div
          className={`px-6 pt-8 pb-6 text-center border-b ${
            isSuccess && failedSteps === 0
              ? 'border-secondary/30'
              : 'border-destructive/30'
          }`}
        >
          {/* Icon */}
          {isSuccess && failedSteps === 0 ? (
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-secondary/30 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-secondary/20 rounded-full p-4 inline-flex">
                  <Check className="h-8 w-8 text-secondary" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/30 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-destructive/20 rounded-full p-4 inline-flex">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
            </div>
          )}

          {/* Header Text */}
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
            {isSuccess && failedSteps === 0
              ? t('sync.successTitle')
              : t('sync.partialTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSuccess && failedSteps === 0
              ? t('sync.successSubtitle')
              : t('sync.partialSubtitle')}
          </p>
        </div>

        {/* Sync Results Checklist */}
        <div className="px-6 py-6 space-y-3">
          {syncResults.map((result, index) => {
            const config = syncStepConfig[result.step];
            const isVisible = index < visibleSteps;
            const isSuccess = result.status === 'success';

            return (
              <div
                key={result.step}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
                } ${
                  isSuccess
                    ? 'bg-secondary/10'
                    : 'bg-destructive/10'
                }`}
              >
                {/* Icon */}
                <span className="text-lg">{config.icon}</span>

                {/* Label */}
                <span
                  className={`flex-1 text-sm font-medium ${
                    isSuccess ? 'text-foreground' : 'text-destructive'
                  }`}
                >
                  {t(config.translationKey)}
                </span>

                {/* Checkmark or X */}
                {isSuccess ? (
                  <div
                    className={`flex items-center justify-center transition-all duration-300 ${
                      isVisible ? 'scale-100' : 'scale-0'
                    }`}
                  >
                    <Check className="h-5 w-5 text-secondary" />
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-center transition-all duration-300 ${
                      isVisible ? 'scale-100' : 'scale-0'
                    }`}
                  >
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Timestamp Info */}
        <div className="px-6 py-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            {isSuccess && failedSteps === 0
              ? `${t('sync.lastSynced')}: ${formatSyncTime(lastSyncTime)}`
              : `${syncResults.length} ${t('sync.itemsProcessed')}`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 space-y-3">
          {isSuccess && failedSteps === 0 ? (
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-sm font-semibold"
              size="sm"
            >
              {t('sync.continueButton')}
            </Button>
          ) : (
            <>
              <Button
                onClick={onRetry}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm font-semibold flex items-center justify-center gap-2"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
                {t('sync.retryButton')}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full text-sm font-semibold"
                size="sm"
              >
                {t('sync.tryLaterButton')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Confetti for success - subtle animation */}
      {isSuccess && failedSteps === 0 && (
        <div className="pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="fixed animate-pulse pointer-events-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animation: `float-up 3s ease-out forwards`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              {['🎉', '✨', '🎊', '⭐', '🌟', '💫'][i]}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateY(100vh) translateX(${Math.random() * 100 - 50}px);
          }
        }

        .animate-in {
          animation: fadeInZoom 0.3s ease-out;
        }

        @keyframes fadeInZoom {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
