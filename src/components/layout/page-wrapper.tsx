'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTranslation } from '@/hooks/use-translation';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Loading fallback component shown during actual page transitions
 */
function PageLoadingFallback({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div className={`flex min-h-[400px] items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t('loading.page')}</p>
          <p className="mt-1 text-xs text-muted-foreground/70">{t('loading.compiling')}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Page wrapper component that uses React Suspense for natural loading states
 * Only shows loading when React actually suspends (during real navigation/compilation)
 */
export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <Suspense fallback={<PageLoadingFallback className={className} />}>
      <div className={className}>{children}</div>
    </Suspense>
  );
}
