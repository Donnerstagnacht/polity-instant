import '@/styles/animations.css';
import { useTranslation } from '@/features/shared/hooks/use-translation.ts';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'syncing';

interface GlobalLoadingAnimationProps {
  connectionStatus?: ConnectionStatus;
}

export function GlobalLoadingAnimation({ connectionStatus = 'syncing' }: GlobalLoadingAnimationProps) {
  const { t } = useTranslation();

  const statusMessage = getStatusMessage(connectionStatus, t);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 px-6 text-center max-w-lg">
        {/* Coffee cup with steam */}
        <div className="relative">
          {/* Steam wisps */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="animate-loading-steam block text-2xl opacity-0" style={{ animationDelay: '0s' }}>
              ~
            </span>
            <span className="animate-loading-steam block text-2xl opacity-0" style={{ animationDelay: '0.4s' }}>
              ~
            </span>
            <span className="animate-loading-steam block text-2xl opacity-0" style={{ animationDelay: '0.8s' }}>
              ~
            </span>
          </div>

          {/* Coffee emoji */}
          <span className="animate-loading-cup block text-6xl" role="img" aria-label="coffee">
            ☕
          </span>
        </div>

        {/* Connection status pill */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500'
                : connectionStatus === 'disconnected'
                  ? 'bg-red-400'
                  : 'animate-pulse bg-amber-400'
            }`}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {statusMessage}
          </span>
        </div>

        {/* Main message with typewriter effect */}
        <div className="space-y-3">
          <p className="animate-loading-typewriter overflow-hidden whitespace-nowrap border-r-2 border-foreground text-lg font-semibold text-foreground">
            {t('loading.sync.headline')}
          </p>
          <p className="animate-loading-fade-in text-sm text-muted-foreground opacity-0" style={{ animationDelay: '2.5s' }}>
            {t('loading.sync.coffeeMessage')}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs overflow-hidden rounded-full bg-muted h-1.5">
          <div className="animate-loading-progress h-full rounded-full bg-brand" />
        </div>
      </div>
    </div>
  );
}

function getStatusMessage(
  status: ConnectionStatus,
  t: (key: string) => string,
): string {
  switch (status) {
    case 'connecting':
      return t('loading.sync.connecting');
    case 'connected':
      return t('loading.sync.connected');
    case 'disconnected':
      return t('loading.sync.disconnected');
    case 'syncing':
      return t('loading.sync.syncing');
  }
}
