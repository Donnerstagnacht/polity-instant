import { useTranslation } from '@/hooks/use-translation';

export interface StatItem {
  value: number;
  labelKey: string;
  show?: boolean;
}

interface StatsBarProps {
  stats: StatItem[];
  className?: string;
}

export function StatsBar({ stats, className = '' }: StatsBarProps) {
  const { t } = useTranslation();

  // Filter out stats that shouldn't be shown
  const visibleStats = stats.filter(stat => stat.show !== false);

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-8 text-center">
        {visibleStats.map((stat, index) => (
          <div key={index}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{t(stat.labelKey)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
