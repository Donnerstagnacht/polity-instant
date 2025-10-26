import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Clock, Check } from 'lucide-react';
import { MembershipStatus } from '../hooks/useGroupMembership';

interface GroupMembershipButtonProps {
  status: MembershipStatus | null;
  isMember: boolean;
  hasRequested: boolean;
  isInvited: boolean;
  onRequestJoin: () => void;
  onLeave: () => void;
  onAcceptInvitation: () => void;
  isLoading: boolean;
}

export function GroupMembershipButton({
  isMember,
  hasRequested,
  isInvited,
  onRequestJoin,
  onLeave,
  onAcceptInvitation,
  isLoading,
}: GroupMembershipButtonProps) {
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

  if (isMember) {
    return (
      <Button onClick={onLeave} disabled={isLoading} variant="outline">
        <UserMinus className="mr-2 h-4 w-4" />
        Leave Group
      </Button>
    );
  }

  return (
    <Button onClick={onRequestJoin} disabled={isLoading}>
      <UserPlus className="mr-2 h-4 w-4" />
      Request to Join
    </Button>
  );
}
