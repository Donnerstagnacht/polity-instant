'use client';

import { useState, useMemo } from 'react';
import type { Value } from 'platejs';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Progress } from '@/features/shared/ui/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/ui/ui/tabs';
import { Vote, FileEdit, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { cn } from '@/features/shared/utils/utils';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { Input } from '@/features/shared/ui/ui/input';
import type { TDiscussion } from '@/features/editor/types';
import { ChangeRequestTimelineCard, type ChangeRequestDiffData } from './ChangeRequestTimelineCard';
import { getCRFilterStatus } from '../logic/createMockCRTimelineItems';
import { getVoteResult } from '../hooks/useAgendaItemCRVoting';
import type { ChangeRequestTimelineRow } from '@/zero/agendas/queries';

type TabValue = 'all' | 'open' | 'accepted' | 'rejected';

interface ChangeRequestCardsListProps {
  items: ChangeRequestTimelineRow[];
  editingMode?: string | null;
  isVotingActive: boolean;
  userId?: string;
  canManage?: boolean;
  canVote?: boolean;
  currentItemId?: string | null;
  /** Map from CR change_request_id (or mock item id) to diff data */
  diffMap?: Record<string, ChangeRequestDiffData>;
  /** Progress through the voting timeline (0-1) */
  progress?: number;
  completedCount?: number;
  allCRsProcessed?: boolean;
  isTimelineComplete?: boolean;
  /** Document content for editor preview */
  documentContent?: Value;
  /** Discussion entries from amendment for CR ID mapping */
  discussions?: TDiscussion[];
  /** Amendment ID — needed for interactive editor and mode selector */
  amendmentId?: string;
  /** Agenda item ID — passed to interactive editor */
  agendaItemId?: string;
  hasUserVoted?: (item: ChangeRequestTimelineRow) => boolean;
  getUserSelectedChoiceIds?: (item: ChangeRequestTimelineRow) => string[];
  onCastVote?: (item: ChangeRequestTimelineRow, choiceId: string) => Promise<void>;
  onStartIndicative?: (itemId: string) => Promise<void>;
  onStartFinal?: (itemId: string) => Promise<void>;
  onCloseVoting?: (itemId: string) => Promise<void> | Promise<unknown>;
}

function getEditingModeLabel(mode: string | null | undefined): string {
  switch (mode) {
    case 'edit': return 'Edit Mode';
    case 'view': return 'View Mode';
    case 'suggest_internal': return 'Internal Suggestions';
    case 'suggest_event': return 'Event Suggestions';
    case 'vote_internal': return 'Internal Voting';
    case 'vote_event': return 'Event Voting';
    case 'passed': return 'Passed';
    case 'rejected': return 'Rejected';
    default: return mode || 'Unknown';
  }
}

export function ChangeRequestCardsList({
  items,
  editingMode,
  isVotingActive,
  userId,
  canManage = false,
  canVote = false,
  currentItemId,
  diffMap,
  progress,
  completedCount,
  allCRsProcessed,
  isTimelineComplete,
  documentContent,
  discussions,
  amendmentId,
  agendaItemId,
  hasUserVoted,
  getUserSelectedChoiceIds,
  onCastVote,
  onStartIndicative,
  onStartFinal,
  onCloseVoting,
}: ChangeRequestCardsListProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Build crId → discussion UUID map from discussions
  const crIdToDiscussionId = useMemo(() => {
    const map = new Map<string, string>();
    if (discussions) {
      for (const d of discussions) {
        if (d.crId) {
          map.set(d.crId, d.id);
        }
      }
    }
    return map;
  }, [discussions]);

  // Separate final vote from regular CR items for filtering
  const finalVoteItem = useMemo(() => items.find(i => i.is_final_vote), [items]);
  const crItems = useMemo(() => items.filter(i => !i.is_final_vote), [items]);

  // Text search filter
  const searchedItems = useMemo(() => {
    if (!searchQuery.trim()) return crItems;
    const query = searchQuery.toLowerCase();
    return crItems.filter((item) => {
      const cr = item.change_request;
      const title = cr?.title?.toLowerCase() ?? '';
      const description = cr?.description?.toLowerCase() ?? '';
      return title.includes(query) || description.includes(query);
    });
  }, [crItems, searchQuery]);

  // Categorize CR items by status for tabs
  const categorized = useMemo(() => {
    const open: ChangeRequestTimelineRow[] = [];
    const accepted: ChangeRequestTimelineRow[] = [];
    const rejected: ChangeRequestTimelineRow[] = [];

    for (const item of searchedItems) {
      const filterStatus = getCRFilterStatus(
        item,
        isVotingActive ? (getVoteResult as (item: never) => string) : undefined,
      );
      if (filterStatus === 'accepted') accepted.push(item);
      else if (filterStatus === 'rejected') rejected.push(item);
      else open.push(item);
    }

    return { open, accepted, rejected };
  }, [searchedItems, isVotingActive]);

  const getFilteredItems = (tab: TabValue): ChangeRequestTimelineRow[] => {
    switch (tab) {
      case 'open': return categorized.open;
      case 'accepted': return categorized.accepted;
      case 'rejected': return categorized.rejected;
      case 'all':
      default: return searchedItems;
    }
  };

  const filteredItems = getFilteredItems(activeTab);
  const progressPercent = progress ? Math.round(progress * 100) : 0;

  return (
    <Card>
      <CardHeader className="space-y-3">
        {/* Mode indicator banner */}
        {isVotingActive ? (
          <div className={cn(
            'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
            'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400',
          )}>
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">
              {t('features.agendas.crTimeline.votingActive', 'Change Request Voting Active')}
            </span>
            <Badge variant="outline" className="ml-auto text-xs">vote_event</Badge>
          </div>
        ) : (
          <div className={cn(
            'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
            'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
          )}>
            <AlertTriangle className="h-4 w-4" />
            <span>
              {t('features.agendas.crTimeline.modeInfo', 'Mode')}: <strong>{getEditingModeLabel(editingMode)}</strong>.{' '}
              {t('features.agendas.crTimeline.setToVoteEvent', 'Set to vote_event to start voting on change requests.')}
            </span>
          </div>
        )}

        {/* Title and progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            <CardTitle className="text-base">
              {t('features.agendas.crTimeline.title', 'Change Request Timeline')}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {completedCount ?? categorized.accepted.length + categorized.rejected.length}/{crItems.length}
            </Badge>
            {isTimelineComplete && (
              <Badge variant="default" className="bg-green-600">
                {t('features.agendas.crTimeline.allCompleted', 'All Completed')}
              </Badge>
            )}
          </div>
        </div>
        {isVotingActive && <Progress value={progressPercent} className="mt-1" />}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as TabValue)}
        >
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              {t('features.agendas.crTimeline.tabAll', 'All')}
              <Badge variant="secondary" className="ml-0.5 text-xs">{searchedItems.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="open" className="gap-1.5">
              {t('features.agendas.crTimeline.tabOpen', 'Open')}
              <Badge variant="secondary" className="ml-0.5 text-xs">{categorized.open.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="gap-1.5">
              {t('features.agendas.crTimeline.tabAccepted', 'Accepted')}
              <Badge
                variant="outline"
                className="ml-0.5 border-green-500/30 bg-green-500/10 text-xs text-green-700 dark:text-green-400"
              >
                {categorized.accepted.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1.5">
              {t('features.agendas.crTimeline.tabRejected', 'Rejected')}
              <Badge variant="secondary" className="ml-0.5 text-xs">{categorized.rejected.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        {crItems.length > 1 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('features.agendas.crTimeline.searchPlaceholder', 'Search change requests…')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Filtered CR items */}
          {filteredItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <FileEdit className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {activeTab === 'all'
                  ? t('features.agendas.crTimeline.noCRs', 'No change requests')
                  : t('features.agendas.crTimeline.noItemsInTab', 'No change requests in this category')}
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const crId = item.change_request_id ?? item.id;
              const diff = diffMap?.[crId] ?? diffMap?.[item.id];
              const crTitle = item.change_request?.title;
              const suggestionId = crTitle ? crIdToDiscussionId.get(crTitle) : undefined;

              return (
                <ChangeRequestTimelineCard
                  key={item.id}
                  item={item as ChangeRequestTimelineRow}
                  index={index}
                  isCurrent={isVotingActive && currentItemId === item.id}
                  hasUserVoted={hasUserVoted ? hasUserVoted(item as ChangeRequestTimelineRow) : false}
                  userSelectedChoiceIds={getUserSelectedChoiceIds ? getUserSelectedChoiceIds(item as ChangeRequestTimelineRow) : []}
                  canManage={isVotingActive ? canManage : false}
                  canVote={isVotingActive ? canVote : false}
                  isFinalVoteLocked={false}
                  diff={diff}
                  documentContent={documentContent}
                  suggestionId={suggestionId}
                  crId={crTitle || undefined}
                  discussions={discussions}
                  editingMode={editingMode}
                  amendmentId={amendmentId}
                  userId={userId}
                  agendaItemId={agendaItemId}
                  onCastVote={isVotingActive ? onCastVote : undefined}
                  onStartIndicative={isVotingActive ? onStartIndicative : undefined}
                  onStartFinal={isVotingActive ? onStartFinal : undefined}
                  onCloseVoting={isVotingActive ? onCloseVoting : undefined}
                />
              );
            })
          )}

          {/* Final Vote item — always shown in "All" tab */}
          {finalVoteItem && activeTab === 'all' && (
            <ChangeRequestTimelineCard
              key={finalVoteItem.id}
              item={finalVoteItem as ChangeRequestTimelineRow}
              index={crItems.length}
              isCurrent={isVotingActive && currentItemId === finalVoteItem.id}
              hasUserVoted={hasUserVoted ? hasUserVoted(finalVoteItem as ChangeRequestTimelineRow) : false}
              userSelectedChoiceIds={getUserSelectedChoiceIds ? getUserSelectedChoiceIds(finalVoteItem as ChangeRequestTimelineRow) : []}
              canManage={isVotingActive ? canManage : false}
              canVote={isVotingActive ? canVote : false}
              isFinalVoteLocked={!allCRsProcessed}
              onCastVote={isVotingActive ? onCastVote : undefined}
              onStartIndicative={isVotingActive ? onStartIndicative : undefined}
              onStartFinal={isVotingActive ? onStartFinal : undefined}
              onCloseVoting={isVotingActive ? onCloseVoting : undefined}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
