import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { StatementCard } from './StatementCard';

interface Statement {
  id: number;
  tag: string;
  text: string;
}

interface StatementCarouselProps {
  statements: Statement[];
  getTagColor: (tag: string) => { bg: string; text: string };
}

export const StatementCarousel: React.FC<StatementCarouselProps> = ({
  statements,
  getTagColor,
}) => (
  <div className="mb-12">
    <h2 className="mb-6 text-xl font-semibold">Key Statements</h2>
    <Carousel className="w-full" opts={{ align: 'start', dragFree: true }}>
      <CarouselContent className="-ml-2 md:-ml-4">
        {statements.map(statement => {
          const tagColor = getTagColor(statement.tag);
          return (
            <CarouselItem
              key={statement.id}
              className="basis-[85%] pl-2 sm:basis-1/2 md:basis-1/2 md:pl-4 lg:basis-1/3"
            >
              <StatementCard tag={statement.tag} text={statement.text} tagColor={tagColor} />
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  </div>
);
