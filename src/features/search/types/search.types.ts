import { type ContentType } from '@/features/timeline/constants/content-type-config';
import type { useSearchState } from '@/zero/shared/useSearchState';
import type { ElectionForSearchRow } from '@/zero/elections/queries';

/** Candidate row derived from elections-for-search query */
type ElectionCandidateRow = ElectionForSearchRow['candidates'][number];

// ============================================
// Derive search entity types from Zero query results
// ============================================

/** Return type of useSearchState() */
type SearchState = ReturnType<typeof useSearchState>

/** Single user row from the searchableUsers query (with relations) */
export type SearchUser = SearchState['users'][number] & { readonly _type: 'user' }
/** Single group row from the searchableGroups query (with relations) */
export type SearchGroup = SearchState['groups'][number] & { readonly _type: 'group' }
/** Single statement row from the searchableStatements query (with relations) */
export type SearchStatement = SearchState['statements'][number] & { readonly _type: 'statement' }
/** Single blog row from the searchableBlogs query (with relations) */
export type SearchBlog = SearchState['blogs'][number] & { readonly _type: 'blog' }
/** Single amendment row from the searchableAmendments query (with relations) */
export type SearchAmendment = SearchState['amendments'][number] & { readonly _type: 'amendment' }
/** Single event row from the searchableEvents query (with relations) */
export type SearchEvent = SearchState['events'][number] & { readonly _type: 'event' }
/** Single todo row from the searchableTodos query (with relations) */
export type SearchTodo = SearchState['todos'][number] & { readonly _type: 'todo' }
/** Single election row from electionsForSearch query (with relations) */
export type SearchElection = SearchState['elections'][number] & { readonly _type: 'election' }
/** Single event voting session row (with relations) */
export type SearchVote = SearchState['eventVotingSessions'][number] & { readonly _type: 'vote' }
/** Single timeline event row used for video search results */
export type SearchVideo = SearchState['timelineEvents'][number] & { readonly _type: 'video' }
/** Single timeline event row used for image search results */
export type SearchImage = SearchState['timelineEvents'][number] & { readonly _type: 'image' }

/**
 * Discriminated union of all search result types.
 * Each variant carries the full Zero query shape + a `_type` discriminator.
 */
export type SearchResultItem =
  | SearchUser
  | SearchGroup
  | SearchStatement
  | SearchBlog
  | SearchAmendment
  | SearchEvent
  | SearchTodo
  | SearchElection
  | SearchVote
  | SearchVideo
  | SearchImage

// ============================================
// Other search types
// ============================================

export type SearchType =
  | 'all'
  | 'users'
  | 'groups'
  | 'statements'
  | 'todos'
  | 'blogs'
  | 'amendments'
  | 'events'
  | 'votes'
  | 'elections'
  | 'videos'
  | 'images';

export interface SearchFilters {
  query: string;
  sortBy: string;
  topics: string[];
}

export type SearchContentItem = {
  id: string;
  type: ContentType;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  handle?: string | null;
  subtitle?: string | null;
  groupId?: string | null;
  groupName?: string | null;
  eventId?: string | null;
  eventName?: string | null;
  startDate?: Date;
  endDate?: Date;
  location?: string | null;
  city?: string | null;
  postcode?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  status?: string | null;
  dueDate?: Date;
  isCompleted?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  assigneeCount?: number;
  tags?: string[];
  memberCount?: number;
  eventCount?: number;
  attendeeCount?: number;
  electionsCount?: number;
  amendmentsCount?: number;
  groupCount?: number;
  amendmentCount?: number;
  collaboratorCount?: number;
  supportingGroupsCount?: number;
  changeRequestCount?: number;
  commentCount?: number | null;
  votingType?: string | null;
  phase?: string | null;
  result?: string | null;
  candidates?: readonly ElectionCandidateRow[];
  totalCandidates?: number;
  agendaEventId?: string | null;
  agendaItemId?: string | null;
  upvotes?: number;
  downvotes?: number;
  groupImageUrl?: string | null;
  surveyQuestion?: string | null;
  surveyOptions?: { label: string; voteCount: number }[];
  stats?: {
    reactions?: number;
    comments?: number | null;
    views?: number;
    members?: number;
  };
};
