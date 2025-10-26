import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Clock, Check } from 'lucide-react';
import { ParticipationStatus } from '../hooks/useEventParticipation';

interface EventParticipationButtonProps {
  status: ParticipationStatus | null;
  isParticipant: boolean;
  hasRequested: boolean;
  isInvited: boolean;
  onRequestParticipation: () => void;
  onLeave: () => void;
  onAcceptInvitation: () => void;
  isLoading: boolean;
}

export function EventParticipationButton({
  isParticipant,
  hasRequested,
  isInvited,
  onRequestParticipation,
  onLeave,
  onAcceptInvitation,
  isLoading,
}: EventParticipationButtonProps) {
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

  if (isParticipant) {
    return (
      <Button onClick={onLeave} disabled={isLoading} variant="outline">
        <UserMinus className="mr-2 h-4 w-4" />
        Leave Event
      </Button>
    );
  }

  return (
    <Button onClick={onRequestParticipation} disabled={isLoading}>
      <UserPlus className="mr-2 h-4 w-4" />
      Request to Participate
    </Button>
  );
}
