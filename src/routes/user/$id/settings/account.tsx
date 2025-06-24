import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/$id/settings/account')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/user/$id/settings/account"!</div>;
}
