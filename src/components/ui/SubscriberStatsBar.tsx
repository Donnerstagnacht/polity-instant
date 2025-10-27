import React from 'react';
import { StatsBar } from '@/features/user/ui/StatsBar';

interface SubscriberStatsBarProps {
  subscriberCount: number;
  memberCount?: number;
  collaboratorCount?: number;
  participantCount?: number;
  amendmentCollaborationsCount?: number;
  showAnimation?: boolean;
  animationText?: string;
  animationRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Reusable subscriber stats bar component
 * Shows subscriber count and optionally member/collaborator/participant count with k/M formatting for large numbers
 */
export const SubscriberStatsBar: React.FC<SubscriberStatsBarProps> = ({
  subscriberCount,
  memberCount,
  collaboratorCount,
  participantCount,
  amendmentCollaborationsCount,
  showAnimation = false,
  animationText = '',
  animationRef,
}) => {
  // Format large numbers
  const formatNumberWithUnit = (num: number): { value: number; unit: string } => {
    if (num >= 1000000) {
      return { value: +(num / 1000000).toFixed(1), unit: 'M' };
    } else if (num >= 1000) {
      return { value: +(num / 1000).toFixed(1), unit: 'k' };
    }
    return { value: num, unit: '' };
  };

  const displayStats = [];

  // Add member count if provided
  if (memberCount !== undefined) {
    displayStats.push({
      label: 'Members',
      value: memberCount >= 1000 ? formatNumberWithUnit(memberCount).value : memberCount,
      unit: memberCount >= 1000 ? formatNumberWithUnit(memberCount).unit : '',
    });
  }

  // Add collaborator count if provided
  if (collaboratorCount !== undefined) {
    displayStats.push({
      label: 'Collaborators',
      value:
        collaboratorCount >= 1000
          ? formatNumberWithUnit(collaboratorCount).value
          : collaboratorCount,
      unit: collaboratorCount >= 1000 ? formatNumberWithUnit(collaboratorCount).unit : '',
    });
  }

  // Add participant count if provided
  if (participantCount !== undefined) {
    displayStats.push({
      label: 'Participants',
      value:
        participantCount >= 1000 ? formatNumberWithUnit(participantCount).value : participantCount,
      unit: participantCount >= 1000 ? formatNumberWithUnit(participantCount).unit : '',
    });
  }

  // Add amendment collaborations count if provided
  if (amendmentCollaborationsCount !== undefined) {
    displayStats.push({
      label: 'Amendment Collab.',
      value:
        amendmentCollaborationsCount >= 1000
          ? formatNumberWithUnit(amendmentCollaborationsCount).value
          : amendmentCollaborationsCount,
      unit:
        amendmentCollaborationsCount >= 1000
          ? formatNumberWithUnit(amendmentCollaborationsCount).unit
          : '',
    });
  }

  // Add subscriber count
  displayStats.push({
    label: 'Subscribers',
    value: subscriberCount >= 1000 ? formatNumberWithUnit(subscriberCount).value : subscriberCount,
    unit: subscriberCount >= 1000 ? formatNumberWithUnit(subscriberCount).unit : '',
  });

  return (
    <StatsBar
      stats={displayStats}
      showAnimation={showAnimation}
      animationText={animationText}
      animationRef={animationRef}
    />
  );
};
