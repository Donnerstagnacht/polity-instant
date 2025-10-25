import React from 'react';
import { useRouter } from 'next/navigation';
import { StatementCard } from '@/features/user/ui/StatementCard';
import { getTagColor } from '@/features/user/utils/userWiki.utils';
import { BADGE_COLORS } from '@/features/user/state/badgeColors';

interface StatementSearchCardProps {
  statement: any;
}

export function StatementSearchCard({ statement }: StatementSearchCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/statement/${statement.id}`);
  };

  const tagColor = getTagColor(statement.tag, BADGE_COLORS);

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <StatementCard tag={statement.tag} text={statement.text} tagColor={tagColor} />
    </div>
  );
}
