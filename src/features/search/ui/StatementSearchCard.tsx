import React from 'react';
import { StatementTimelineCard } from '@/features/timeline/ui/cards/StatementTimelineCard';
import { useTranslation } from '@/hooks/use-translation';

interface StatementSearchCardProps {
  statement: any;
}

export function StatementSearchCard({ statement }: StatementSearchCardProps) {
  const { t } = useTranslation();
  const authorName = statement.user?.name || statement.authorName || t('common.unknownUser');
  const authorAvatar = statement.user?.avatar || statement.user?.imageURL || statement.authorAvatar;
  const authorTitle = statement.user?.subtitle || statement.authorTitle;

  return (
    <StatementTimelineCard
      statement={{
        id: String(statement.id),
        content: statement.text || statement.content || '',
        authorName,
        authorTitle,
        authorAvatar,
        supportCount: statement.supportCount,
        opposeCount: statement.opposeCount,
        interestedCount: statement.interestedCount,
        commentCount: statement.commentCount,
      }}
    />
  );
}
