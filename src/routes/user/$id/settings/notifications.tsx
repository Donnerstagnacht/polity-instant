import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/$id/settings/notifications')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/user/$id/settings/notifications"!</div>;
}
