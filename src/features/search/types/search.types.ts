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
