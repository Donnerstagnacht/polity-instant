import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Clock, Check } from 'lucide-react';
import { CollaborationStatus } from '../hooks/useAmendmentCollaboration';

interface AmendmentCollaborationButtonProps {
  status: CollaborationStatus | null;
  isCollaborator: boolean;
  hasRequested: boolean;
  isInvited: boolean;
  onRequestCollaboration: () => void;
  onLeave: () => void;
  onAcceptInvitation: () => void;
  isLoading: boolean;
}

export function AmendmentCollaborationButton({
  isCollaborator,
  hasRequested,
  isInvited,
  onRequestCollaboration,
  onLeave,
  onAcceptInvitation,
  isLoading,
}: AmendmentCollaborationButtonProps) {
  if (isInvited) {
    return (
      <Button onClick={onAcceptInvitation} disabled={isLoading} variant="default">
        <Check className="mr-2 h-4 w-4" />
        Accept Invitation
      </Button>
    );
  }

  if (hasRequested) {
    return (
      <Button onClick={onLeave} disabled={isLoading} variant="outline">
        <Clock className="mr-2 h-4 w-4" />
        Request Pending
      </Button>
    );
  }

  if (isCollaborator) {
    return (
      <Button onClick={onLeave} disabled={isLoading} variant="outline">
        <UserMinus className="mr-2 h-4 w-4" />
        Leave Collaboration
      </Button>
    );
  }

  return (
    <Button onClick={onRequestCollaboration} disabled={isLoading}>
      <UserPlus className="mr-2 h-4 w-4" />
      Request to Collaborate
    </Button>
  );
}
