'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GroupNetworkFlow } from '@/components/groups/GroupNetworkFlow';
import { useEventData } from '@/features/events/hooks/useEventData';

export default function EventNetworkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  // Fetch the event to get its group using hook
  const { event, isLoading } = useEventData(resolvedParams.id);

  const group = event?.group;

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="flex h-[700px] items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!event || !group) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="flex h-[700px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">
                {!event ? 'Event not found' : 'This event is not associated with a group'}
              </p>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Event Network</h1>
          <p className="text-muted-foreground">
            Network visualization for {event.title} (Group: {group.name})
          </p>
        </div>

        <GroupNetworkFlow groupId={group.id} />
      </PageWrapper>
    </AuthGuard>
  );
}
