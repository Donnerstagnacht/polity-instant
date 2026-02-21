import { type ContentType } from '@/features/timeline/constants/content-type-config';

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

export interface SearchResultItem {
  id: string;
  _type:
    | 'user'
    | 'group'
    | 'statement'
    | 'todo'
    | 'blog'
    | 'amendment'
    | 'event'
    | 'vote'
    | 'election'
    | 'video'
    | 'image';
  [key: string]: any;
}

export type SearchContentItem = {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  handle?: string;
  subtitle?: string;
  groupId?: string;
  groupName?: string;
  eventId?: string;
  eventName?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  city?: string;
  postcode?: string;
  createdAt: Date;
  updatedAt?: Date;
  status?: string;
  dueDate?: Date;
  isCompleted?: boolean;
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
  commentCount?: number;
  votingType?: string;
  phase?: string;
  result?: string;
  candidates?: any[];
  totalCandidates?: number;
  agendaEventId?: string;
  agendaItemId?: string;
  stats?: {
    reactions?: number;
    comments?: number;
    views?: number;
    members?: number;
  };
};
