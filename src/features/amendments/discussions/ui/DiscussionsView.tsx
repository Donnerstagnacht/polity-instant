import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ArrowLeft, MessageSquare, Plus, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { useDiscussions } from '../hooks/useDiscussions';
import { ThreadCard } from './ThreadCard';
import { CreateThreadDialog } from './CreateThreadDialog';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface DiscussionsViewProps {
  amendmentId: string;
  userId?: string;
}

export function DiscussionsView({ amendmentId, userId }: DiscussionsViewProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'votes' | 'time'>('votes');

  const { amendment, threads, isLoading, hasMore, loadMore } = useDiscussions(amendmentId, sortBy);

  const loadMoreRef = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
  });

  if (isLoading) {
    return (
      <PageWrapper className="container mx-auto p-8">
        <div className="py-12 text-center">Loading discussions...</div>
      </PageWrapper>
    );
  }

  if (!amendment) {
    return (
      <PageWrapper className="container mx-auto p-8">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Amendment Not Found</h1>
          <p className="text-muted-foreground">
            The amendment you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="container mx-auto p-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/amendment/${amendmentId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Amendment
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <MessageSquare className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Discussions</h1>
          </div>
          <p className="text-muted-foreground">
            {threads.length} discussion thread{threads.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: 'votes' | 'time') => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="votes">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Top Voted</span>
                  </div>
                </SelectItem>
                <SelectItem value="time">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Newest First</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Thread
          </Button>
        </div>
      </div>

      {/* Threads List */}
      <div className="space-y-6">
        {threads.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">
                No discussion threads yet. Start a conversation!
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Thread
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {threads.map(thread => (
              <ThreadCard key={thread.id} thread={thread} userId={userId} />
            ))}
            {hasMore && <div ref={loadMoreRef} className="h-px" />}
          </>
        )}
      </div>

      {/* Create Thread Dialog */}
      <CreateThreadDialog
        amendmentId={amendmentId}
        userId={userId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </PageWrapper>
  );
}
