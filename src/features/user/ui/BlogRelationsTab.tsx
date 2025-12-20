import { BookOpen } from 'lucide-react';
import { MembershipStatusTable } from './MembershipStatusTable';
import type { MembershipsByStatus } from '../hooks/useUserMembershipsFilters';

interface BlogRelationsTabProps {
  blogRelationsByStatus: MembershipsByStatus;
  onAcceptInvitation: (id: string) => void;
  onDeclineInvitation: (id: string) => void;
  onLeave: (id: string) => void;
  onWithdrawRequest: (id: string) => void;
  onNavigate: (id: string) => void;
}

export function BlogRelationsTab({
  blogRelationsByStatus,
  onAcceptInvitation,
  onDeclineInvitation,
  onLeave,
  onWithdrawRequest,
  onNavigate,
}: BlogRelationsTabProps) {
  return (
    <div className="space-y-6">
      <MembershipStatusTable
        title={`Pending Invitations (${blogRelationsByStatus.invited.length})`}
        description="Blog invitations you've received"
        icon={BookOpen}
        items={blogRelationsByStatus.invited}
        statusType="invited"
        entityKey="blog"
        fallbackIcon={BookOpen}
        onAccept={onAcceptInvitation}
        onDecline={onDeclineInvitation}
        onNavigate={onNavigate}
      />

      <MembershipStatusTable
        title={`Active Blogs (${blogRelationsByStatus.active.length})`}
        description="Blogs you're currently writing for"
        icon={BookOpen}
        items={blogRelationsByStatus.active}
        statusType="active"
        entityKey="blog"
        fallbackIcon={BookOpen}
        onLeave={onLeave}
        onNavigate={onNavigate}
      />

      <MembershipStatusTable
        title={`Pending Requests (${blogRelationsByStatus.requested.length})`}
        description="Your pending requests to write for blogs"
        icon={BookOpen}
        items={blogRelationsByStatus.requested}
        statusType="requested"
        entityKey="blog"
        fallbackIcon={BookOpen}
        onWithdraw={onWithdrawRequest}
        onNavigate={onNavigate}
      />
    </div>
  );
}
