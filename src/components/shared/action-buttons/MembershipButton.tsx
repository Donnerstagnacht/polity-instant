'use client';

import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Clock, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export type MembershipStatus = 'invited' | 'requested' | 'member' | 'admin' | 'collaborator';
export type MembershipAction = 'join' | 'participate' | 'collaborate';

interface MembershipButtonProps {
  /**
   * The type of action - determines button labels
   * join: For groups (request to join, leave group)
   * participate: For events (request to participate, leave event)
   * collaborate: For amendments/blogs (request collaboration, leave collaboration)
   */
  actionType: MembershipAction;

  /** Current membership status */
  status: MembershipStatus | null;

  /** Whether user is currently a member/participant/collaborator */
  isMember: boolean;

  /** Whether user has requested to join/participate/collaborate */
  hasRequested: boolean;

  /** Whether user has been invited */
  isInvited: boolean;

  /** Callback when requesting to join/participate/collaborate */
  onRequest: () => void;

  /** Callback when leaving */
  onLeave: () => void;

  /** Callback when accepting invitation */
  onAcceptInvitation: () => void;

  /** Loading state */
  isLoading: boolean;

  /** Optional className */
  className?: string;
}

/**
 * Generic membership button for different entity types.
 * Handles join/participate/collaborate actions with different labels.
 */
export function MembershipButton({
  actionType,
  isMember,
  hasRequested,
  isInvited,
  onRequest,
  onLeave,
  onAcceptInvitation,
  isLoading,
  className,
}: MembershipButtonProps) {
  const { t } = useTranslation();

  // Get appropriate labels based on action type
  const getLabels = () => {
    switch (actionType) {
      case 'join':
        return {
          request: t('components.actionBar.requestToJoin'),
          leave: t('components.actionBar.leaveGroup'),
          pending: t('components.actionBar.requestPending'),
          accept: t('components.actionBar.acceptInvitation'),
        };
      case 'participate':
        return {
          request: 'Request to Participate',
          leave: 'Leave Event',
          pending: 'Request Pending',
          accept: 'Accept Invitation',
        };
      case 'collaborate':
        return {
          request: 'Request Collaboration',
          leave: 'Leave Collaboration',
          pending: 'Request Pending',
          accept: 'Accept Invitation',
        };
    }
  };

  const labels = getLabels();

  if (isInvited) {
    return (
      <Button
        onClick={onAcceptInvitation}
        disabled={isLoading}
        variant="default"
        className={className}
      >
        <Check className="mr-2 h-4 w-4" />
        {labels.accept}
      </Button>
    );
  }

  if (hasRequested) {
    return (
      <Button onClick={onLeave} disabled={isLoading} variant="outline" className={className}>
        <Clock className="mr-2 h-4 w-4" />
        {labels.pending}
      </Button>
    );
  }

  if (isMember) {
    return (
      <Button onClick={onLeave} disabled={isLoading} variant="outline" className={className}>
        <UserMinus className="mr-2 h-4 w-4" />
        {labels.leave}
      </Button>
    );
  }

  return (
    <Button onClick={onRequest} disabled={isLoading} className={className}>
      <UserPlus className="mr-2 h-4 w-4" />
      {labels.request}
    </Button>
  );
}
