import React from 'react';
import { AmendmentTimelineCard } from '@/features/timeline/ui/cards/AmendmentTimelineCard';
import db from '../../../../db/db';

interface AmendmentSearchCardProps {
  amendment: any;
}

export function AmendmentSearchCard({ amendment }: AmendmentSearchCardProps) {
  const { user } = db.useAuth();

  // Calculate supporters from upvotes and downvotes
  const supporters = (amendment.upvotes || 0) - (amendment.downvotes || 0);

  // Count collaborators
  const collaboratorsCount = amendment.amendmentRoleCollaborators?.length || 0;

  // Count supporting groups
  const supportingGroupsCount = amendment.groupSupporters?.length || 0;

  // Find current user's collaboration
  const currentUserCollaboration = amendment.amendmentRoleCollaborators?.find(
    (collab: any) => collab.user?.id === user?.id
  );
  const collaborationRole = currentUserCollaboration?.role?.name;

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
    status?: string
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

  const primaryGroup = amendment.groups?.[0];

  return (
    <AmendmentTimelineCard
      amendment={{
        id: String(amendment.id),
        title: amendment.title,
        subtitle: primaryGroup?.name,
        description: amendment.subtitle,
        status: normalizeStatus(amendment.status),
        supportCount: supporters,
        groupName: primaryGroup?.name,
        groupId: primaryGroup?.id,
        collaboratorCount: collaboratorsCount,
        supportingGroupsCount: supportingGroupsCount,
        changeRequestCount: amendment.changeRequests?.length,
        hashtags: amendment.hashtags,
        collaborationStatus,
      }}
    />
  );
}
