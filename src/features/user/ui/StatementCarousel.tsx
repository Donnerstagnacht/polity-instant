import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { StatementTimelineCard } from '@/features/timeline/ui/cards/StatementTimelineCard';
import { useTranslation } from '@/hooks/use-translation';

interface Statement {
  id: number;
  tag: string;
  text: string;
}

interface StatementCarouselProps {
  statements: Statement[];
  authorName: string;
  authorTitle?: string;
  authorAvatar?: string;
}

export const StatementCarousel: React.FC<StatementCarouselProps> = ({
  statements,
  authorName,
  authorTitle,
  authorAvatar,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-12">
      <h2 className="mb-6 text-xl font-semibold">{t('pages.user.statements.title')}</h2>
      <Carousel className="w-full" opts={{ align: 'start', dragFree: true }}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {statements.map(statement => (
            <CarouselItem
              key={statement.id}
              className="basis-[85%] pl-2 sm:basis-1/2 md:basis-1/2 md:pl-4 lg:basis-1/3"
            >
              <StatementTimelineCard
                statement={{
                  id: String(statement.id),
                  content: statement.text,
                  authorName,
                  authorTitle,
                  authorAvatar,
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};
