import React from 'react';
import { AmendmentsCard } from '@/features/user/ui/AmendmentsCard';
import { getStatusStyles } from '@/features/user/utils/userWiki.utils';
import db from '../../../../db/db';

interface AmendmentSearchCardProps {
  amendment: any;
  gradientClass?: string;
}

export function AmendmentSearchCard({
  amendment,
  gradientClass = 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
}: AmendmentSearchCardProps) {
  const { user } = db.useAuth();
  const statusStyle = getStatusStyles(amendment.status);

  // Calculate supporters from upvotes and downvotes
  const supporters = (amendment.upvotes || 0) - (amendment.downvotes || 0);
  
  // Count collaborators
  const collaboratorsCount = amendment.amendmentRoleCollaborators?.length || 0;
  
  // Count supporting groups
  const supportingGroupsCount = amendment.groupSupporters?.length || 0;
  
  // Calculate total supporting members from all supporting groups
  const supportingMembersCount = amendment.groupSupporters?.reduce(
    (total: number, group: any) => total + (group.memberships?.length || 0),
    0
  ) || 0;
  
  // Find current user's collaboration
  const currentUserCollaboration = amendment.amendmentRoleCollaborators?.find(
    (collab: any) => collab.user?.id === user?.id
  );
  const collaborationRole = currentUserCollaboration?.role?.name;

  return (
    <a href={`/amendment/${amendment.id}`} className="block cursor-pointer">
      <AmendmentsCard
        amendment={{
          id: amendment.id,
          code: amendment.code,
          title: amendment.title,
          subtitle: amendment.subtitle,
          status: amendment.status,
          supporters: supporters,
          date: amendment.date || new Date(amendment.createdAt).toLocaleDateString(),
          tags: amendment.tags,
          collaboratorsCount: collaboratorsCount,
          supportingGroupsCount: supportingGroupsCount,
          supportingMembersCount: supportingMembersCount,
          collaborationRole: collaborationRole,
        }}
        statusStyle={statusStyle}
        gradientClass={gradientClass}
      />
    </a>
  );
}
