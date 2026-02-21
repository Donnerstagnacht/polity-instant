import { Calendar } from 'lucide-react';
import { MembershipStatusTable } from './MembershipStatusTable';
import type { MembershipsByStatus } from '../hooks/useUserMembershipsFilters';

interface EventParticipationsTabProps {
  participationsByStatus: MembershipsByStatus;
  onAcceptInvitation: (id: string) => void;
  onDeclineInvitation: (id: string) => void;
  onLeave: (id: string) => void;
  onWithdrawRequest: (id: string) => void;
  onNavigate: (id: string) => void;
}

export function EventParticipationsTab({
  participationsByStatus,
  onAcceptInvitation,
  onDeclineInvitation,
  onLeave,
  onWithdrawRequest,
  onNavigate,
}: EventParticipationsTabProps) {
  return (
    <div className="space-y-6">
      <MembershipStatusTable
        title={`Pending Invitations (${participationsByStatus.invited.length})`}
        description="Event invitations you've received"
        icon={Calendar}
        items={participationsByStatus.invited}
        statusType="invited"
        entityKey="event"
        fallbackIcon={Calendar}
        onAccept={onAcceptInvitation}
        onDecline={onDeclineInvitation}
        onNavigate={onNavigate}
      />

      <MembershipStatusTable
        title={`Active Participations (${participationsByStatus.active.length})`}
        description="Events you're currently participating in"
        icon={Calendar}
        items={participationsByStatus.active}
        statusType="active"
        entityKey="event"
        fallbackIcon={Calendar}
        onLeave={onLeave}
        onNavigate={onNavigate}
      />

      <MembershipStatusTable
        title={`Pending Requests (${participationsByStatus.requested.length})`}
        description="Your pending requests to join events"
        icon={Calendar}
        items={participationsByStatus.requested}
        statusType="requested"
        entityKey="event"
        fallbackIcon={Calendar}
        onWithdraw={onWithdrawRequest}
        onNavigate={onNavigate}
      />
    </div>
  );
}
