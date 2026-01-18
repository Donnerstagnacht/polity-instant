'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show your custom install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if dismissed recently (within 7 days)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md sm:left-auto sm:right-4">
      <div className="rounded-lg border border-border bg-background p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{t('common.pwa.installTitle')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('common.pwa.installDescription')}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label={t('common.pwa.dismiss')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            {t('common.pwa.notNow')}
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t('common.pwa.install')}
          </button>
        </div>
      </div>
    </div>
  );
}
