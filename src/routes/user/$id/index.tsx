import { UserWiki } from '@/features/user/wiki';
import { createFileRoute } from '@tanstack/react-router';

// Add search param types for filter persistence
export const Route = createFileRoute('/user/$id/')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    blogs: typeof search.blogs === 'string' ? search.blogs : undefined,
    groups: typeof search.groups === 'string' ? search.groups : undefined,
    amendments: typeof search.amendments === 'string' ? search.amendments : undefined,
  }),
});

function RouteComponent() {
  return <UserWiki />;
}
