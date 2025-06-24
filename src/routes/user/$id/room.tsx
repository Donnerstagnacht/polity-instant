import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/$id/room')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/user/$id/room"!</div>;
}
