import React from 'react';
import { AmendmentsCard } from '@/features/user/ui/AmendmentsCard';
import { getStatusStyles } from '@/features/user/utils/userWiki.utils';

interface AmendmentSearchCardProps {
  amendment: any;
  gradientClass?: string;
}

export function AmendmentSearchCard({
  amendment,
  gradientClass = 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
}: AmendmentSearchCardProps) {
  const statusStyle = getStatusStyles(amendment.status);

  return (
    <a href={`/amendment/${amendment.id}`} className="block cursor-pointer">
      <AmendmentsCard
        amendment={{
          id: amendment.id,
          code: amendment.code,
          title: amendment.title,
          subtitle: amendment.subtitle,
          status: amendment.status,
          supporters: amendment.supporters || 0,
          date: amendment.date || new Date(amendment.createdAt).toLocaleDateString(),
          tags: amendment.tags,
        }}
        statusStyle={statusStyle}
        gradientClass={gradientClass}
      />
    </a>
  );
}
