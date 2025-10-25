import React from 'react';
import { useRouter } from 'next/navigation';
import { AmendmentsCard } from '@/features/user/ui/AmendmentsCard';
import { getStatusStyles } from '@/features/user/utils/userWiki.utils';

interface AmendmentSearchCardProps {
  amendment: any;
}

export function AmendmentSearchCard({ amendment }: AmendmentSearchCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/amendment/${amendment.id}`);
  };

  const statusStyle = getStatusStyles(amendment.status);

  return (
    <div onClick={handleClick} className="cursor-pointer">
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
      />
    </div>
  );
}
