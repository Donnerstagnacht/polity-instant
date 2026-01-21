'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Vote, Users, FileText, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';

export type AgendaItemType = 'election' | 'vote' | 'speech' | 'discussion';
export type AgendaItemStatus = 'completed' | 'in-progress' | 'pending' | 'planned';

interface AgendaCardProps {
  id: string;
  title: string;
  description?: string;
  type: AgendaItemType;
  status: AgendaItemStatus;
  creatorName?: string;
  detailsLink: string;
  detailsLabel?: string;
  footer?: ReactNode;
  className?: string;
  isActive?: boolean;
  actionButton?: ReactNode;
  showMoveButton?: boolean;
  onMoveClick?: () => void;
}

const getAgendaItemIcon = (type: AgendaItemType) => {
  switch (type) {
    case 'election':
      return <UserCheck className="h-4 w-4" />;
    case 'vote':
      return <Vote className="h-4 w-4" />;
    case 'speech':
      return <Users className="h-4 w-4" />;
    case 'discussion':
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getStatusColor = (status: AgendaItemStatus) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'pending':
    case 'planned':
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getTypeColor = (type: AgendaItemType) => {
  switch (type) {
    case 'election':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'vote':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'speech':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'discussion':
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
};

export function AgendaCard({
  id,
  title,
  description,
  type,
  status,
  creatorName,
  detailsLink,
  detailsLabel,
  footer,
  className,
  isActive = false,
  actionButton,
  showMoveButton = false,
  onMoveClick,
}: AgendaCardProps) {
  const { t } = useTranslation();

  return (
    <Link href={detailsLink} className="block">
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          isActive &&
            'relative overflow-hidden before:absolute before:inset-0 before:-z-10 before:animate-spin-slow before:rounded-lg before:bg-gradient-to-r before:from-green-500 before:via-emerald-500 before:to-green-500 before:p-[3px]',
          className
        )}
      >
        <div className={cn(isActive && 'relative z-10 rounded-lg bg-background')}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-1">
                <CardTitle className="text-lg">{title}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getTypeColor(type)}>
                    {getAgendaItemIcon(type)}
                    <span className="ml-1 capitalize">{type}</span>
                  </Badge>
                  <Badge className={getStatusColor(status)}>{status}</Badge>
                  {isActive && (
                    <Badge className="animate-pulse bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {t('features.events.agenda.active')}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {showMoveButton && onMoveClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={e => {
                      e.preventDefault();
                      onMoveClick();
                    }}
                    title={t('features.events.agenda.moveToEvent')}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {actionButton}
              </div>
            </div>
          </CardHeader>

          {description && (
            <CardContent className="pt-0">
              <p className="text-muted-foreground">{description}</p>
            </CardContent>
          )}

          {(creatorName || footer) && (
            <CardFooter className="pt-3">
              {footer || (
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>
                        {t('features.events.agenda.by', {
                          name: creatorName || t('features.events.agenda.unknown'),
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardFooter>
          )}
        </div>
      </Card>
    </Link>
  );
}
