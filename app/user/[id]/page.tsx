'use client';

import { UserWiki } from '@/features/user/wiki';
import { useSearchParams } from 'next/navigation';
import { use } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();

  // Get search parameters for filter persistence (same as TanStack Router)
  const blogs = searchParams.get('blogs') ?? undefined;
  const groups = searchParams.get('groups') ?? undefined;
  const amendments = searchParams.get('amendments') ?? undefined;

  // You can use these params in your UserWiki component
  // Pass them as props or use a custom hook to access them

  return (
    <AuthGuard requireAuth={true}>
      <UserWiki
        userId={resolvedParams.id}
        searchFilters={{
          blogs,
          groups,
          amendments,
        }}
      />
    </AuthGuard>
  );
}
