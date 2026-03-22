import { useTranslation } from '@/features/shared/hooks/use-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Separator } from '@/features/shared/ui/ui/separator';
import { cn } from '@/features/shared/utils/utils';

import { DocsSignalBadge } from './DocsSignalBadge';
import type { DocsProcessDefinition } from '../types/docs.types';

interface ProcessDiagramProps {
  baseKey: string;
  process: DocsProcessDefinition;
}

export function ProcessDiagram({ baseKey, process }: ProcessDiagramProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">{t(`${baseKey}.diagram.title`)}</CardTitle>
          <DocsSignalBadge tone={process.steps[process.steps.length - 1]?.tone ?? 'result'} />
        </div>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {t(`${baseKey}.diagram.description`)}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {process.kind === 'lanes' && process.lanes ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {process.lanes.map(lane => {
              const laneSteps = process.steps.filter(step => step.lane === lane);

              return (
                <div key={lane} className="rounded-2xl border border-border/60 bg-background/80 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {t(`${baseKey}.diagram.lanes.${lane}`)}
                    </h3>
                    <span className="text-xs text-muted-foreground">{laneSteps.length}</span>
                  </div>
                  <div className="space-y-3">
                    {laneSteps.map((step, index) => (
                      <div key={step.id} className="rounded-xl border border-border/50 bg-card/70 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {index + 1}
                          </span>
                          <DocsSignalBadge tone={step.tone} />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {t(`${baseKey}.diagram.steps.${step.id}.title`)}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {t(`${baseKey}.diagram.steps.${step.id}.description`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {process.steps.map((step, index) => (
              <div key={step.id} className="relative rounded-2xl border border-border/60 bg-background/85 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {t('pages.docs.labels.step', { value: index + 1 })}
                  </span>
                  <DocsSignalBadge tone={step.tone} />
                </div>
                <h4 className="text-base font-semibold text-foreground">
                  {t(`${baseKey}.diagram.steps.${step.id}.title`)}
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t(`${baseKey}.diagram.steps.${step.id}.description`)}
                </p>
                {index < process.steps.length - 1 ? (
                  <div className="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 bg-border lg:block" />
                ) : null}
              </div>
            ))}
          </div>
        )}
        <Separator />
        <div className={cn('grid gap-4', process.kind === 'lanes' ? 'md:grid-cols-2' : 'md:grid-cols-3')}>
          {process.steps.map(step => (
            <div key={`legend-${step.id}`} className="rounded-xl border border-dashed border-border/70 bg-background/70 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  {t(`${baseKey}.diagram.steps.${step.id}.title`)}
                </span>
                <DocsSignalBadge tone={step.tone} />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {t(`${baseKey}.diagram.steps.${step.id}.description`)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}