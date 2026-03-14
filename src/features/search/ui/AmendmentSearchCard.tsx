import React from 'react';
import { AmendmentTimelineCard } from '@/features/timeline/ui/cards/AmendmentTimelineCard';
import { useAuth } from '@/providers/auth-provider';
import { extractHashtags } from '@/zero/common/hashtagHelpers';

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

  const normalizeStatus = (
    status?: string | null
  ):
    | 'collaborative_editing'
    | 'internal_suggesting'
    | 'internal_voting'
    | 'viewing'
    | 'event_suggesting'
    | 'event_voting'
    | 'passed'
    | 'rejected' => {
    if (!status) return 'viewing';
    const normalized = status.toLowerCase();
    if (
      normalized === 'collaborative_editing' ||
      normalized === 'internal_suggesting' ||
      normalized === 'internal_voting' ||
      normalized === 'viewing' ||
      normalized === 'event_suggesting' ||
      normalized === 'event_voting' ||
      normalized === 'passed' ||
      normalized === 'rejected'
    ) {
      return normalized as
        | 'collaborative_editing'
        | 'internal_suggesting'
        | 'internal_voting'
        | 'viewing'
        | 'event_suggesting'
        | 'event_voting'
        | 'passed'
        | 'rejected';
    }
    if (normalized === 'drafting' || normalized === 'draft') {
      return 'collaborative_editing';
    }
    if (normalized === 'under review' || normalized === 'review') {
      return 'internal_voting';
    }
    return 'viewing';
  };

  return (
    <AmendmentTimelineCard
      amendment={{
        id: String(amendment.id),
        title: amendment.title ?? '',
        subtitle: amendment.group?.name ?? undefined,
        description: amendment.reason ?? undefined,
        status: normalizeStatus(amendment.status),
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
