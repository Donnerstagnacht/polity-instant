import { createFileRoute } from '@tanstack/react-router';
import { GroupsPage } from '@/features/groups/GroupsPage';

export const Route = createFileRoute('/groups')({
  component: RouteComponent,
});

function RouteComponent() {
  return <GroupsPage />;
}
