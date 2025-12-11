'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import db from '../../../db';
import { Settings, ThumbsUp } from 'lucide-react';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { StatsBar } from '@/components/ui/StatsBar';
import { useSubscribeAmendment } from '@/features/amendments/hooks/useSubscribeAmendment';
import { useAmendmentCollaboration } from '@/features/amendments/hooks/useAmendmentCollaboration';
import { ActionBar } from '@/components/ui/ActionBar';
import { SubscribeButton, MembershipButton } from '@/components/shared/action-buttons';
import { InfoTabs } from '@/components/shared/InfoTabs';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/use-translation';
import { ShareButton } from '@/components/shared/ShareButton';
import { AmendmentPathVisualization } from '@/features/amendments/ui/AmendmentPathVisualization';
import { useAuthStore } from '@/features/auth';

interface AmendmentWikiProps {
  amendmentId: string;
}

// Simple process visualization component
function ProcessVisualization({ status }: { status: string }) {
  const { t } = useTranslation();
  const steps = [
    { id: 'drafting', label: 'Drafting' },
    { id: 'review', label: 'Under Review' },
    { id: 'decision', label: 'Decision' },
  ];

  const getStepStatus = (stepId: string) => {
    if (status === 'Drafting' && stepId === 'drafting') return 'active';
    if (status === 'Under Review' && stepId === 'review') return 'active';
    if ((status === 'Passed' || status === 'Rejected') && stepId === 'decision') return 'active';
    if (status === 'Under Review' && stepId === 'drafting') return 'completed';
    if ((status === 'Passed' || status === 'Rejected') && stepId !== 'decision') return 'completed';
    return 'pending';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t('components.labels.processStatus')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      stepStatus === 'active'
                        ? 'border-primary bg-primary text-primary-foreground'
                        : stepStatus === 'completed'
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-muted bg-muted text-muted-foreground'
                    }`}
                  >
                    {stepStatus === 'completed' ? '✓' : index + 1}
                  </div>
                  <span className="mt-2 text-xs font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      stepStatus === 'completed' ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function AmendmentWiki({ amendmentId }: AmendmentWikiProps) {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);

  // Subscribe hook
  const {
    isSubscribed,
    subscriberCount,
    toggleSubscribe,
    isLoading: subscribeLoading,
  } = useSubscribeAmendment(amendmentId);

  // Collaboration hook
  const {
    status,
    isCollaborator,
    hasRequested,
    isInvited,
    collaboratorCount,
    isLoading: collaborationLoading,
    requestCollaboration,
    leaveCollaboration,
    acceptInvitation,
  } = useAmendmentCollaboration(amendmentId);

  const { data, isLoading } = db.useQuery({
    amendments: {
      $: {
        where: {
          id: amendmentId,
        },
      },
      amendmentRoleCollaborators: {
        user: {},
        role: {},
      },
      hashtags: {},
    },
  });

  const amendment = data?.amendments?.[0];

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading amendment...</div>
        </div>
      </div>
    );
  }

  if (!amendment) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Amendment Not Found</h1>
          <p className="text-muted-foreground">
            The amendment you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = status === 'admin';
  const collaborators = amendment.amendmentRoleCollaborators || [];

  const statusColors: Record<string, string> = {
    Passed: 'bg-green-500/10 text-green-500 border-green-500/20',
    Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    'Under Review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Drafting: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <div className="container mx-auto max-w-6xl p-4">
      {/* Header with centered title and subtitle */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <h1 className="text-4xl font-bold">{amendment.title}</h1>
          <Badge className={statusColors[amendment.status] || ''}>{amendment.status}</Badge>
        </div>
        {amendment.subtitle && (
          <p className="text-xl text-muted-foreground">{amendment.subtitle}</p>
        )}

        {/* Collaborators Section */}
        {collaborators.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {collaborators.slice(0, 3).map((collab: any) => (
                <Avatar key={collab.id} className="h-10 w-10 border-2 border-background">
                  <AvatarImage src={collab.user?.avatar || collab.user?.imageURL} />
                  <AvatarFallback>{collab.user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              ))}
              {collaborators.length > 3 && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +{collaborators.length - 3}
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">
                {collaborators.length}{' '}
                {collaborators.length === 1 ? 'Collaborator' : 'Collaborators'}
              </p>
              <p className="text-xs text-muted-foreground">
                {collaborators[0]?.user?.name || 'Unknown'}
                {collaborators.length > 1 &&
                  ` and ${collaborators.length - 1} other${collaborators.length > 2 ? 's' : ''}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Amendment Image */}
      {amendment.imageURL && (
        <div className="mb-8">
          <img
            src={amendment.imageURL}
            alt={amendment.title}
            className="mx-auto h-64 w-full max-w-4xl rounded-lg object-cover shadow-lg"
          />
        </div>
      )}

      {/* Stats Bar */}
      <StatsBar
        stats={[
          { value: collaboratorCount, labelKey: 'components.labels.collaborators' },
          { value: subscriberCount, labelKey: 'components.labels.subscribers' },
          { value: amendment.supporters || 0, labelKey: 'components.labels.supporters' },
        ]}
      />

      {/* Action Bar */}
      <ActionBar>
        <SubscribeButton
          entityType="amendment"
          entityId={amendmentId}
          isSubscribed={isSubscribed}
          onToggleSubscribe={toggleSubscribe}
          isLoading={subscribeLoading}
        />
        <MembershipButton
          actionType="collaborate"
          status={status}
          isMember={isCollaborator}
          hasRequested={hasRequested}
          isInvited={isInvited}
          onRequest={requestCollaboration}
          onLeave={leaveCollaboration}
          onAcceptInvitation={acceptInvitation}
          isLoading={collaborationLoading}
        />
        <Button>
          <ThumbsUp className="mr-2 h-4 w-4" />
          Support
        </Button>
        <ShareButton
          url={`/amendment/${amendmentId}`}
          title={amendment.title}
          description={amendment.subtitle || amendment.code || ''}
        />
        {isAdmin && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/amendment/${amendmentId}/edit`)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </ActionBar>

      {/* Hashtags */}
      {amendment.hashtags && amendment.hashtags.length > 0 && (
        <div className="mb-6">
          <HashtagDisplay hashtags={amendment.hashtags} centered />
        </div>
      )}

      {/* Process Visualization */}
      <ProcessVisualization status={amendment.status} />

      {/* Amendment Process Path - Show shortest path to target group */}
      {user && <AmendmentPathVisualization amendmentId={amendmentId} />}

      {/* About and Contact Tabs */}
      <InfoTabs
        about={amendment.code || 'No description available.'}
        contact={{}}
        className="mb-12"
      />
    </div>
  );
}
