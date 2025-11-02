'use client';

import { use, useState } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { UserNetworkFlow } from '@/features/user/ui/UserNetworkFlow';
import { GroupDetailsWithEvents } from '@/components/shared/GroupDetailsWithEvents';
import { Card, CardContent } from '@/components/ui/card';

export default function UserNetworkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; data: any } | null>(null);

  const handleGroupClick = (groupId: string, groupData: any) => {
    setSelectedGroup({ id: groupId, data: groupData });
  };

  const handleEventClick = (eventId: string) => {
    // Navigate to event page
    window.location.href = `/event/${eventId}`;
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">User Network</h1>
          <p className="text-muted-foreground">
            Visualization of the user's group memberships and their network relationships
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Network Flow - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <UserNetworkFlow userId={resolvedParams.id} onGroupClick={handleGroupClick} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Group Details and Events - Takes 1 column */}
          <div className="lg:col-span-1">
            {selectedGroup ? (
              <GroupDetailsWithEvents
                groupId={selectedGroup.id}
                groupData={selectedGroup.data}
                onEventClick={handleEventClick}
                onClose={() => setSelectedGroup(null)}
              />
            ) : (
              <Card className="h-full">
                <CardContent className="flex h-[600px] items-center justify-center">
                  <p className="text-center text-sm text-muted-foreground">
                    Click on a group in the network to view its details and upcoming events
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
