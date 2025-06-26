import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/$id/settings/followship/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/user/$id/settings/tsx/followship/"!</div>;
}
