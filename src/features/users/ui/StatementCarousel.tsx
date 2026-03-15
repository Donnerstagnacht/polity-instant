import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/features/shared/ui/ui/carousel';
import { StatementTimelineCard } from '@/features/timeline/ui/cards/StatementTimelineCard';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { ProfileStatement } from '../types/user.types';

interface StatementCarouselProps {
  statements: readonly ProfileStatement[];
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
          {statements.map(statement => {
            const supportVotes = statement.support_votes ?? [];
            const survey = statement.surveys?.[0];
            return (
              <CarouselItem
                key={statement.id}
                className="basis-[85%] pl-2 sm:basis-1/2 md:basis-1/2 md:pl-4 lg:basis-1/3"
              >
                <StatementTimelineCard
                  statement={{
                    id: String(statement.id),
                    content: statement.text ?? '',
                    authorName,
                    authorTitle,
                    authorAvatar,
                    imageUrl: statement.image_url ?? undefined,
                    videoUrl: statement.video_url ?? undefined,
                    groupName: statement.group?.name ?? undefined,
                    groupAvatar: statement.group?.image_url ?? undefined,
                    groupId: statement.group_id ?? undefined,
                    supportCount: supportVotes.filter((v) => v.vote === 1).length,
                    opposeCount: supportVotes.filter((v) => v.vote === -1).length,
                    commentCount: statement.comment_count ?? 0,
                    surveyQuestion: survey?.question ?? undefined,
                    surveyOptions: survey?.options?.map((o) => ({
                      label: o.label,
                      voteCount: o.votes?.length ?? 0,
                    })),
                    hashtags: (statement.statement_hashtags ?? [])
                      .map((jn) => ({
                        id: jn.hashtag?.id ?? jn.id,
                        tag: jn.hashtag?.tag ?? '',
                      }))
                      .filter((h) => h.tag),
                  }}
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};
