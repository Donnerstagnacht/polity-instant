'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth';
import { useUserSubscriptions } from '@/features/user/hooks/useUserSubscriptions';
import { useSubscriptionsFilters } from '@/features/user/hooks/useSubscriptionsFilters';
import { SubscriptionTypeFilters } from '@/features/user/ui/SubscriptionTypeFilters';
import { SubscriptionsTable } from '@/features/user/ui/SubscriptionsTable';
import { SubscribersTable } from '@/features/user/ui/SubscribersTable';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '../../../../db/rbac/usePermissions';
import { AccessDenied } from '@/components/shared/AccessDenied';

export default function SubscriptionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isMe, isLoading: permissionsLoading } = usePermissions({});

  // Hooks
  const { subscriptions, subscribers, unsubscribe, removeSubscriber } = useUserSubscriptions(
    resolvedParams.id
  );
  const {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filteredSubscriptions,
    filteredSubscribers,
    subscriptionCounts,
  } = useSubscriptionsFilters({ subscriptions, subscribers });

  // Navigation handlers
  const handleNavigateToUser = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  const handleNavigateToGroup = (groupId: string) => {
    router.push(`/group/${groupId}`);
  };

  const handleNavigateToAmendment = (amendmentId: string) => {
    router.push(`/amendment/${amendmentId}`);
  };

  const handleNavigateToEvent = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const handleNavigateToBlog = (blogId: string) => {
    router.push(`/blog/${blogId}`);
  };

  if (permissionsLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="container mx-auto max-w-6xl p-8">
          <div>Loading...</div>
        </div>
      </AuthGuard>
    );
  }

  if (!isMe(resolvedParams.id)) {
    return (
      <AuthGuard requireAuth={true}>
        <AccessDenied />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto max-w-6xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Manage Subscriptions</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage who you're subscribed to and who's subscribed to you
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions and subscribers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs defaultValue="subscriptions" className="w-full">
          <ScrollableTabsList>
            <TabsTrigger value="subscriptions">
              My Subscriptions ({filteredSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="subscribers">
              My Subscribers ({filteredSubscribers.length})
            </TabsTrigger>
          </ScrollableTabsList>

          <TabsContent value="subscriptions" className="mt-6 space-y-4">
            <SubscriptionTypeFilters
              filterType={filterType}
              counts={subscriptionCounts}
              onFilterChange={setFilterType}
            />
            <SubscriptionsTable
              subscriptions={filteredSubscriptions}
              onUnsubscribe={unsubscribe}
              onNavigateToUser={handleNavigateToUser}
              onNavigateToGroup={handleNavigateToGroup}
              onNavigateToAmendment={handleNavigateToAmendment}
              onNavigateToEvent={handleNavigateToEvent}
              onNavigateToBlog={handleNavigateToBlog}
            />
          </TabsContent>

          <TabsContent value="subscribers" className="mt-6">
            <SubscribersTable
              subscribers={filteredSubscribers}
              onRemove={removeSubscriber}
              onNavigate={handleNavigateToUser}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
