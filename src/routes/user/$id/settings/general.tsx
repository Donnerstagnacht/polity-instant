import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/$id/settings/general')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/user/$id/settings/general"!</div>;
}
