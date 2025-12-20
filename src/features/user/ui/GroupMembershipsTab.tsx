import { Users } from 'lucide-react';
import { MembershipStatusTable } from './MembershipStatusTable';
import type { MembershipsByStatus } from '../hooks/useUserMembershipsFilters';

interface GroupMembershipsTabProps {
  membershipsByStatus: MembershipsByStatus;
  onAcceptInvitation: (id: string) => void;
  onDeclineInvitation: (id: string) => void;
  onLeave: (id: string) => void;
  onWithdrawRequest: (id: string) => void;
  onNavigate: (id: string) => void;
}

export function GroupMembershipsTab({
  membershipsByStatus,
  onAcceptInvitation,
  onDeclineInvitation,
  onLeave,
  onWithdrawRequest,
  onNavigate,
}: GroupMembershipsTabProps) {
  return (
    <div className="space-y-6">
      <MembershipStatusTable
        title={`Pending Invitations (${membershipsByStatus.invited.length})`}
        description="Group invitations you've received"
        icon={Users}
        items={membershipsByStatus.invited}
        statusType="invited"
        entityKey="group"
        fallbackIcon={Users}
        onAccept={onAcceptInvitation}
        onDecline={onDeclineInvitation}
        onNavigate={onNavigate}
      />

      <MembershipStatusTable
        title={`Active Memberships (${membershipsByStatus.active.length})`}
        description="Groups you're currently a member of"
        icon={Users}
        items={membershipsByStatus.active}
        statusType="active"
        entityKey="group"
        fallbackIcon={Users}
        onLeave={onLeave}
        onNavigate={onNavigate}
      />

      <MembershipStatusTable
        title={`Pending Requests (${membershipsByStatus.requested.length})`}
        description="Your pending requests to join groups"
        icon={Users}
        items={membershipsByStatus.requested}
        statusType="requested"
        entityKey="group"
        fallbackIcon={Users}
        onWithdraw={onWithdrawRequest}
        onNavigate={onNavigate}
      />
    </div>
  );
}
