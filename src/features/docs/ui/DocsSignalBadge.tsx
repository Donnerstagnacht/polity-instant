import { Badge } from '@/features/shared/ui/ui/badge';
import { cn } from '@/features/shared/utils/utils';
import { useTranslation } from '@/features/shared/hooks/use-translation';

import type { DocsSignalTone } from '../types/docs.types';

const toneStyles: Record<DocsSignalTone, string> = {
  entry: 'bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-300',
  action: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300',
  collaboration: 'bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300',
  attention: 'bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300',
  decision: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
  result: 'bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-300',
};

export function DocsSignalBadge({ tone, className }: { tone: DocsSignalTone; className?: string }) {
  const { t } = useTranslation();

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-[11px] font-bold uppercase tracking-[0.2em]',
        toneStyles[tone],
        className
      )}
    >
      {t(`pages.docs.tones.${tone}`)}
    </Badge>
  );
}