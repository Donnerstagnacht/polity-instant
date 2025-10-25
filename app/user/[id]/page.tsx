'use client';

import { UserWiki } from '@/features/user/wiki';
import { SeedUserDataButton } from '@/features/user/ui/SeedUserDataButton';
import { useSearchParams } from 'next/navigation';
import { use, useEffect } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { useNavigation } from '@/navigation/state/useNavigation';

export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const { currentPrimaryRoute } = useNavigation();

  // Set current route to 'user' when this page is loaded
  useEffect(() => {
    // The useNavigation hook will automatically detect we're on a /user/ route
    // and set the appropriate secondary navigation
  }, [currentPrimaryRoute]);

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
      <SeedUserDataButton />
    </AuthGuard>
  );
}
