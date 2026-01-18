'use client';

import { Bell, BellOff, Loader2 } from 'lucide-react';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from '@/hooks/use-translation';

interface PushNotificationToggleProps {
  variant?: 'default' | 'card' | 'minimal';
  showDescription?: boolean;
}

/**
 * Component to enable/disable push notifications
 *
 * @example
 * ```tsx
 * // In a settings page
 * <PushNotificationToggle variant="card" showDescription />
 *
 * // In a header/toolbar
 * <PushNotificationToggle variant="minimal" />
 * ```
 */
export function PushNotificationToggle({
  variant = 'default',
  showDescription = true,
}: PushNotificationToggleProps) {
  const { t } = useTranslation();
  const { isSupported, isSubscribed, isLoading, permission, error, subscribe, unsubscribe } =
    usePushSubscription();

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success(t('components.pushNotifications.deactivated'));
      } else {
        await subscribe();
        // Only show success if subscribe didn't throw
        toast.success(t('components.pushNotifications.activated'));
      }
    } catch (err: any) {
      console.error('[PushNotificationToggle] Error:', err);
      toast.error(err.message || t('components.pushNotifications.error'));
    }
  };

  // Browser doesn't support push notifications
  if (!isSupported) {
    if (variant === 'minimal') {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          title={t('components.pushNotifications.notSupported')}
        >
          <BellOff className="h-4 w-4" />
        </Button>
      );
    }

    return (
      <Alert>
        <BellOff className="h-4 w-4" />
        <AlertDescription>{t('components.pushNotifications.notSupported')}</AlertDescription>
      </Alert>
    );
  }

  // Permission denied
  if (permission === 'denied') {
    if (variant === 'minimal') {
      return (
        <Button
          variant="outline"
          size="sm"
          disabled
          title={t('components.pushNotifications.blocked')}
        >
          <BellOff className="h-4 w-4" />
        </Button>
      );
    }

    return (
      <Alert variant="destructive">
        <BellOff className="h-4 w-4" />
        <AlertDescription>
          {t('components.pushNotifications.blockedLong')}
        </AlertDescription>
      </Alert>
    );
  }

  // Minimal variant - just a button
  if (variant === 'minimal') {
    return (
      <Button
        variant={isSubscribed ? 'default' : 'outline'}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSubscribed ? (
          <>
            <Bell className="mr-2 h-4 w-4" />
            {t('components.pushNotifications.active')}
          </>
        ) : (
          <>
            <BellOff className="mr-2 h-4 w-4" />
            {t('components.pushNotifications.activate')}
          </>
        )}
      </Button>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            {t('components.pushNotifications.title')}
          </CardTitle>
          {showDescription && (
            <CardDescription>
              {t('components.pushNotifications.description')}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">
                {isSubscribed ? t('components.pushNotifications.enabled') : t('components.pushNotifications.disabled')}
              </div>
              <div className="text-sm text-muted-foreground">
                {isSubscribed
                  ? t('components.pushNotifications.enabledDescription')
                  : t('components.pushNotifications.disabledDescription')}
              </div>
            </div>
            <Button
              onClick={handleToggle}
              disabled={isLoading}
              variant={isSubscribed ? 'outline' : 'default'}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSubscribed ? (
                t('components.pushNotifications.deactivate')
              ) : (
                t('components.pushNotifications.activate')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-sm font-medium">
            {isSubscribed ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {t('components.pushNotifications.title')}
          </div>
          {showDescription && (
            <div className="text-sm text-muted-foreground">
              {isSubscribed
                ? t('components.pushNotifications.enabledDescriptionShort')
                : t('components.pushNotifications.disabledDescriptionShort')}
            </div>
          )}
        </div>
        <Button
          onClick={handleToggle}
          disabled={isLoading}
          variant={isSubscribed ? 'outline' : 'default'}
          size="sm"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSubscribed ? (
            t('components.pushNotifications.deactivate')
          ) : (
            t('components.pushNotifications.activate')
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
