export type SearchType = 'all' | 'users' | 'groups' | 'statements' | 'blogs' | 'amendments' | 'events';

export interface SearchFilters {
  query: string;
  type: SearchType;
  sortBy: string;
  publicOnly: boolean;
  hashtag: string;
}

export interface SearchResultItem {
  id: string;
  _type: 'user' | 'group' | 'statement' | 'blog' | 'amendment' | 'event';
  [key: string]: any;
}
