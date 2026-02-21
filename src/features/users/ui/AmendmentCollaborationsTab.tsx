import { FileEdit } from 'lucide-react';
import { MembershipStatusTable } from './MembershipStatusTable';
import type { MembershipsByStatus } from '../hooks/useUserMembershipsFilters';

interface AmendmentCollaborationsTabProps {
  collaborationsByStatus: MembershipsByStatus;
  onAcceptInvitation: (id: string) => void;
  onDeclineInvitation: (id: string) => void;
  onLeave: (id: string) => void;
  onWithdrawRequest: (id: string) => void;
  onNavigate: (id: string) => void;
}

export function AmendmentCollaborationsTab({
  collaborationsByStatus,
  onAcceptInvitation,
  onDeclineInvitation,
  onLeave,
  onWithdrawRequest,
  onNavigate,
}: AmendmentCollaborationsTabProps) {
  return (
    <div className="space-y-6">
      <MembershipStatusTable
        title={`Pending Invitations (${collaborationsByStatus.invited.length})`}
        description="Amendment collaboration invitations you've received"
        icon={FileEdit}
        items={collaborationsByStatus.invited}
        statusType="invited"
        entityKey="amendment"
        fallbackIcon={FileEdit}
        onAccept={onAcceptInvitation}
        onDecline={onDeclineInvitation}
        onNavigate={onNavigate}
      />

      <MembershipStatusTable
        title={`Active Collaborations (${collaborationsByStatus.active.length})`}
        description="Amendments you're currently collaborating on"
        icon={FileEdit}
        items={collaborationsByStatus.active}
        statusType="active"
        entityKey="amendment"
        fallbackIcon={FileEdit}
        onLeave={onLeave}
        onNavigate={onNavigate}
      />

      <MembershipStatusTable
        title={`Pending Requests (${collaborationsByStatus.requested.length})`}
        description="Your pending requests to collaborate on amendments"
        icon={FileEdit}
        items={collaborationsByStatus.requested}
        statusType="requested"
        entityKey="amendment"
        fallbackIcon={FileEdit}
        onWithdraw={onWithdrawRequest}
        onNavigate={onNavigate}
      />
    </div>
  );
}
