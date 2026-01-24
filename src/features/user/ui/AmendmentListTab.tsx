import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { AmendmentTimelineCard } from '@/features/timeline/ui/cards/AmendmentTimelineCard';
import { useTranslation } from '@/hooks/use-translation';
import type { UserAmendment } from '../types/user.types';

interface AmendmentListTabProps {
  amendments: UserAmendment[];
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const AmendmentListTab: React.FC<AmendmentListTabProps> = ({
  amendments,
  searchValue,
  onSearchChange,
}) => {
  const { t } = useTranslation();
  const filteredAmendments = useMemo(() => {
    const term = (searchValue ?? '').toLowerCase();
    if (!term) return amendments;
    return amendments.filter(
      amendment =>
        amendment.title.toLowerCase().includes(term) ||
        amendment.status.toLowerCase().includes(term) ||
        (amendment.subtitle && amendment.subtitle.toLowerCase().includes(term)) ||
        (amendment.code && amendment.code.toLowerCase().includes(term)) ||
        amendment.date.toLowerCase().includes(term) ||
        (amendment.tags && amendment.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  }, [amendments, searchValue]);

  const normalizeStatus = (
    status?: string
  ):
    | 'collaborative_editing'
    | 'internal_suggesting'
    | 'internal_voting'
    | 'viewing'
    | 'event_suggesting'
    | 'event_voting'
    | 'passed'
    | 'rejected' => {
    if (!status) return 'viewing';
    const normalized = status.toLowerCase();
    if (
      normalized === 'collaborative_editing' ||
      normalized === 'internal_suggesting' ||
      normalized === 'internal_voting' ||
      normalized === 'viewing' ||
      normalized === 'event_suggesting' ||
      normalized === 'event_voting' ||
      normalized === 'passed' ||
      normalized === 'rejected'
    ) {
      return normalized as
        | 'collaborative_editing'
        | 'internal_suggesting'
        | 'internal_voting'
        | 'viewing'
        | 'event_suggesting'
        | 'event_voting'
        | 'passed'
        | 'rejected';
    }
    if (normalized === 'drafting' || normalized === 'draft') {
      return 'collaborative_editing';
    }
    if (normalized === 'under review' || normalized === 'review') {
      return 'internal_voting';
    }
    return 'viewing';
  };

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('pages.user.amendments.searchPlaceholder')}
          className="pl-10"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      {filteredAmendments.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {t('pages.user.amendments.noResults')}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredAmendments.map(amendment => (
            <AmendmentTimelineCard
              key={amendment.id}
              amendment={{
                id: String(amendment.id),
                title: amendment.title,
                subtitle: amendment.subtitle,
                description: amendment.subtitle,
                status: normalizeStatus(amendment.status),
                groupName: amendment.groupName,
                groupId: amendment.groupId,
                hashtags: amendment.tags?.map((tag, index) => ({
                  id: `${amendment.id}-${index}-${tag}`,
                  tag,
                })),
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};
