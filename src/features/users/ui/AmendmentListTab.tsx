import React, { useMemo } from 'react';
import { Input } from '@/features/shared/ui/ui/input';
import { Search } from 'lucide-react';
import { AmendmentTimelineCard } from '@/features/timeline/ui/cards/AmendmentTimelineCard';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { ProfileAmendmentCollaboration } from '../types/user.types';

interface AmendmentListTabProps {
  collaborations: readonly ProfileAmendmentCollaboration[];
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const AmendmentListTab: React.FC<AmendmentListTabProps> = ({
  collaborations,
  searchValue,
  onSearchChange,
}) => {
  const { t } = useTranslation();

  const withAmendment = useMemo(
    () => collaborations.filter((c) => c.amendment),
    [collaborations],
  );

  const filtered = useMemo(() => {
    const term = (searchValue ?? '').toLowerCase();
    if (!term) return withAmendment;
    return withAmendment.filter((collab) => {
      const a = collab.amendment!;
      return (
        (a.title ?? '').toLowerCase().includes(term) ||
        (a.status ?? '').toLowerCase().includes(term) ||
        (a.reason ?? '').toLowerCase().includes(term) ||
        (a.code ?? '').toLowerCase().includes(term) ||
        String(a.created_at).toLowerCase().includes(term) ||
        (Array.isArray(a.tags) && a.tags.some((tag) => typeof tag === 'string' && tag.toLowerCase().includes(term)))
      );
    });
  }, [withAmendment, searchValue]);

  // Deduplicate by amendment id
  const unique = useMemo(() => {
    const seen = new Set<string>();
    return filtered.filter((c) => {
      const id = c.amendment!.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [filtered]);

  const normalizeStatus = (
    status?: string | null
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
      {unique.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          {t('pages.user.amendments.noResults')}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {unique.map((collab) => {
            const a = collab.amendment!;
            const hashtagTags = (a.amendment_hashtags ?? [])
              .map((j) => j.hashtag?.tag)
              .filter((tag): tag is string => !!tag);
            const rawTags = a.tags;
            const tags = hashtagTags.length > 0
              ? hashtagTags
              : Array.isArray(rawTags)
                ? rawTags.filter((tag): tag is string => typeof tag === 'string')
                : undefined;

            return (
              <AmendmentTimelineCard
                key={a.id}
                amendment={{
                  id: String(a.id),
                  title: a.title ?? '',
                  subtitle: a.reason ?? undefined,
                  description: a.reason ?? undefined,
                  status: normalizeStatus(a.status),
                  groupName: a.group?.name ?? undefined,
                  groupId: a.group?.id,
                  hashtags: tags?.map((tag, index) => ({
                    id: `${a.id}-${index}-${tag}`,
                    tag,
                  })),
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
};
