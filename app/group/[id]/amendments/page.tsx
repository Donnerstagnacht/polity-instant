'use client';

import { use, useEffect } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { useGroupData } from '@/features/groups/hooks/useGroupData';
import { useGroupAmendments } from '@/features/groups/hooks/useGroupAmendments';
import {
  useAmendmentFilters,
  useFilteredAmendments,
} from '@/features/groups/hooks/useAmendmentFilters';
import { AmendmentSearchAndFilters } from '@/features/groups/ui/AmendmentSearchAndFilters';
import { AmendmentGroups } from '@/features/groups/ui/AmendmentGroups';
import { Scale } from 'lucide-react';
import { useNavigation } from '@/navigation/state/useNavigation';
import { useTranslation } from '@/hooks/use-translation';

export default function GroupAmendmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { t } = useTranslation();
  const { currentPrimaryRoute } = useNavigation();

  // Set current route to 'group' when this page is loaded
  useEffect(() => {
    // The useNavigation hook will automatically detect we're on a /group/ route
    // and set the appropriate secondary navigation
  }, [currentPrimaryRoute]);

  // Fetch data
  const { group, isLoading: groupLoading } = useGroupData(resolvedParams.id);
  const { amendments, isLoading: amendmentsLoading } = useGroupAmendments(resolvedParams.id);

  // Filters
  const {
    filters,
    showFilters,
    hasActiveFilters,
    updateFilter,
    clearFilter,
    setShowFilters,
  } = useAmendmentFilters();

  // Filter and group amendments
  const { sortedAmendments, groupedAmendments } = useFilteredAmendments(amendments, filters);

  const isLoading = groupLoading || amendmentsLoading;

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">{t('pages.group.loading')}</div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!group) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">{t('pages.group.notFound.title')}</h1>
            <p className="text-muted-foreground">
              {t('pages.group.notFound.description')}
            </p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{group.name} - {t('pages.group.amendments.title')}</h1>
            <p className="text-muted-foreground">
              {sortedAmendments.length === 1 
                ? t('pages.group.amendments.count', { count: sortedAmendments.length })
                : t('pages.group.amendments.countPlural', { count: sortedAmendments.length })}
            </p>
            {/* Debug: Show status breakdown */}
            {sortedAmendments.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                {t('pages.group.amendments.statusBreakdown.passed')}: {groupedAmendments.passed.length}, {t('pages.group.amendments.statusBreakdown.underReview')}:{' '}
                {groupedAmendments.underReview.length}, {t('pages.group.amendments.statusBreakdown.drafting')}:{' '}
                {groupedAmendments.drafting.length}, {t('pages.group.amendments.statusBreakdown.rejected')}: {groupedAmendments.rejected.length}
                {/* Show unique statuses for debugging */}
                <div className="mt-1">
                  {t('pages.group.amendments.statusBreakdown.allStatuses')}:{' '}
                  {Array.from(new Set(sortedAmendments.map((a: any) => a.status))).join(', ')}
                </div>
              </div>
            )}
          </div>
          <Button asChild>
            <a href={`/create/amendment?groupId=${resolvedParams.id}`}>
              <Scale className="mr-2 h-4 w-4" />
              {t('pages.group.amendments.createAmendment')}
            </a>
          </Button>
        </div>

        {/* Search and Filters */}
        <AmendmentSearchAndFilters
          filters={filters}
          showFilters={showFilters}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={(value: string) => updateFilter('searchQuery', value)}
          onStatusChange={(value: string) => updateFilter('statusFilter', value)}
          onHashtagChange={(value: string) => updateFilter('hashtagFilter', value)}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onClearStatusFilter={() => clearFilter('statusFilter')}
          onClearHashtagFilter={() => clearFilter('hashtagFilter')}
        />

        {/* Amendments List */}
        {sortedAmendments.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {amendments.length === 0
              ? t('pages.group.amendments.noAmendments')
              : t('pages.group.amendments.noMatchingAmendments')}
          </div>
        ) : (
          <AmendmentGroups groupedAmendments={groupedAmendments} />
        )}
      </PageWrapper>
    </AuthGuard>
  );
}
