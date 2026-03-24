import React from 'react';
import { AmendmentTimelineCard } from '@/features/timeline/ui/cards/AmendmentTimelineCard';
import { useAuth } from '@/providers/auth-provider';
import { extractHashtags } from '@/zero/common/hashtagHelpers';
import { normalizeEditingMode } from '@/zero/rbac/workflow-constants';

import { type SearchAmendment } from '../types/search.types';

interface AmendmentSearchCardProps {
  amendment: SearchAmendment;
}

export function AmendmentSearchCard({ amendment }: AmendmentSearchCardProps) {
  const { user } = useAuth();

  // Calculate supporters from upvotes and downvotes
  const supporters = (amendment.upvotes || 0) - (amendment.downvotes || 0);

  // Count collaborators
  const collaboratorsCount = amendment.collaborators?.length || 0;

  // Find current user's collaboration
  const currentUserCollaboration = amendment.collaborators?.find(
    collab => collab.user?.id === user?.id
  );
  const collaborationRole = currentUserCollaboration?.user ? 'collaborator' : undefined;

  const normalizedCollaborationStatus = collaborationRole
    ? collaborationRole.toLowerCase()
    : undefined;
  const collaborationStatus =
    normalizedCollaborationStatus === 'admin'
      ? 'admin'
      : normalizedCollaborationStatus === 'collaborator' ||
          normalizedCollaborationStatus === 'member'
        ? 'member'
        : normalizedCollaborationStatus === 'invited'
          ? 'invited'
          : normalizedCollaborationStatus === 'requested'
            ? 'requested'
            : undefined;

  return (
    <AmendmentTimelineCard
      amendment={{
        id: String(amendment.id),
        title: amendment.title ?? '',
        subtitle: amendment.group?.name ?? undefined,
        description: amendment.reason ?? undefined,
        status: normalizeEditingMode(amendment.editing_mode),
        supportCount: supporters,
        groupName: amendment.group?.name ?? undefined,
        groupId: amendment.group?.id,
        collaboratorCount: collaboratorsCount,
        changeRequestCount: amendment.change_requests?.length,
        hashtags: extractHashtags(amendment.amendment_hashtags),
        collaborationStatus,
      }}
    />
  );
}
