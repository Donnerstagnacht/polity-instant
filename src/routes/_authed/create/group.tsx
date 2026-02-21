import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { GroupEditForm } from '@/features/groups/ui/GroupEditForm';

export const Route = createFileRoute('/_authed/create/group')({
  component: CreateGroupPage,
});

function CreateGroupPage() {
  const navigate = useNavigate();
  const [groupId] = useState(() => crypto.randomUUID());

  return <GroupEditForm groupId={groupId} onCancel={() => navigate({ to: '/create' })} />;
}
