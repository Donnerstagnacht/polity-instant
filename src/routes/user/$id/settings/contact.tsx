import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/$id/settings/contact')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/user/$id/settings/contact"!</div>;
}
