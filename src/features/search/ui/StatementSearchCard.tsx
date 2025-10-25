import React from 'react';
import { StatementCard } from '@/features/user/ui/StatementCard';
import { getTagColor } from '@/features/user/utils/userWiki.utils';
import { BADGE_COLORS } from '@/features/user/state/badgeColors';

interface StatementSearchCardProps {
  statement: any;
}

export function StatementSearchCard({ statement }: StatementSearchCardProps) {
  const tagColor = getTagColor(statement.tag, BADGE_COLORS);

  return (
    <a href={`/statement/${statement.id}`} className="block cursor-pointer">
      <StatementCard tag={statement.tag} text={statement.text} tagColor={tagColor} />
    </a>
  );
}
