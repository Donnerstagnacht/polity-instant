'use client';

import { Bell, BellOff, Loader2 } from 'lucide-react';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    error,
    subscribe,
    unsubscribe,
  } = usePushSubscription();

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success('Push-Benachrichtigungen deaktiviert');
      } else {
        await subscribe();
        toast.success('Push-Benachrichtigungen aktiviert');
      }
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Ändern der Einstellung');
    }
  };

  // Browser doesn't support push notifications
  if (!isSupported) {
    if (variant === 'minimal') return null;

    return (
      <Alert>
        <BellOff className="h-4 w-4" />
        <AlertDescription>
          Ihr Browser unterstützt keine Push-Benachrichtigungen.
        </AlertDescription>
      </Alert>
    );
  }

  // Permission denied
  if (permission === 'denied') {
    if (variant === 'minimal') return null;

    return (
      <Alert variant="destructive">
        <BellOff className="h-4 w-4" />
        <AlertDescription>
          Push-Benachrichtigungen wurden blockiert. Bitte aktivieren Sie diese in Ihren
          Browser-Einstellungen.
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
            <Bell className="h-4 w-4 mr-2" />
            Benachrichtigungen aktiv
          </>
        ) : (
          <>
            <BellOff className="h-4 w-4 mr-2" />
            Benachrichtigungen aktivieren
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
            {isSubscribed ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
            Push-Benachrichtigungen
          </CardTitle>
          {showDescription && (
            <CardDescription>
              Erhalten Sie Benachrichtigungen auch wenn die App geschlossen ist.
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
                {isSubscribed ? 'Aktiviert' : 'Deaktiviert'}
              </div>
              <div className="text-sm text-muted-foreground">
                {isSubscribed
                  ? 'Sie erhalten Push-Benachrichtigungen auf diesem Gerät'
                  : 'Aktivieren Sie Push-Benachrichtigungen für dieses Gerät'}
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
                'Deaktivieren'
              ) : (
                'Aktivieren'
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
          <div className="text-sm font-medium flex items-center gap-2">
            {isSubscribed ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            Push-Benachrichtigungen
          </div>
          {showDescription && (
            <div className="text-sm text-muted-foreground">
              {isSubscribed
                ? 'Sie erhalten Benachrichtigungen auch wenn die App geschlossen ist'
                : 'Aktivieren Sie Benachrichtigungen für dieses Gerät'}
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
            'Deaktivieren'
          ) : (
            'Aktivieren'
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
