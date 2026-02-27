import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from '../src/routeTree.gen';
import { NotFound } from '../src/components/ui/not-found';

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
