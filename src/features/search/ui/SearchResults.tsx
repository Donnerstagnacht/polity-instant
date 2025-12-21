import { BlogSearchCard } from '@/features/search/ui/BlogSearchCard';
import { AmendmentSearchCard } from '@/features/search/ui/AmendmentSearchCard';
import { GroupSearchCard } from '@/features/search/ui/GroupSearchCard';
import { StatementSearchCard } from '@/features/search/ui/StatementSearchCard';
import { UserSearchCard } from './UserSearchCard';
import { EventSearchCard } from './EventSearchCard';
import { GRADIENTS } from '@/features/user/state/gradientColors';

interface SearchResultsProps {
  results: any[];
  type: string;
  isLoading: boolean;
}

export function SearchResults({ results, type, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  if (results.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No {type === 'all' ? 'results' : type} found.
        {type === 'all' && ' Try adjusting your search.'}
      </div>
    );
  }

  const gridClass = type === 'events' || type === 'statements' || type === 'amendments'
    ? "grid gap-4 md:grid-cols-2"
    : "grid gap-4 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={gridClass}>
      {results.map((item: any, index: number) => {
        const key = item.id || index;
        const gradientClass = GRADIENTS[index % GRADIENTS.length];

        if (type === 'all') {
          return <UnifiedResultCard key={`${item._type}-${key}-${index}`} item={item} index={index} />;
        }

        switch (type) {
          case 'users':
            return <UserSearchCard key={key} user={item} index={index} />;
          case 'groups':
            return <GroupSearchCard key={key} group={item} gradientClass={gradientClass} />;
          case 'events':
            return <EventSearchCard key={key} event={item} />;
          case 'statements':
            return <StatementSearchCard key={key} statement={item} />;
          case 'blogs':
            return <BlogSearchCard key={key} blog={item} gradientClass={gradientClass} />;
          case 'amendments':
            return <AmendmentSearchCard key={key} amendment={item} gradientClass={gradientClass} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

function UnifiedResultCard({ item, index }: { item: any; index?: number }) {
  const gradientClass = GRADIENTS[(index || 0) % GRADIENTS.length];

  switch (item._type) {
    case 'blog':
      return <BlogSearchCard blog={item} gradientClass={gradientClass} />;
    case 'amendment':
      return <AmendmentSearchCard amendment={item} gradientClass={gradientClass} />;
    case 'group':
      return <GroupSearchCard group={item} gradientClass={gradientClass} />;
    case 'user':
      return <UserSearchCard user={item} index={index} />;
    case 'statement':
      return <StatementSearchCard statement={item} />;
    case 'event':
      return <EventSearchCard event={item} />;
    default:
      return null;
  }
}
