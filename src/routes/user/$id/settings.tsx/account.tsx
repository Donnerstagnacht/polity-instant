import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/$id/settings/tsx/account')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/user/$id/settings/tsx/account"!</div>;
}
