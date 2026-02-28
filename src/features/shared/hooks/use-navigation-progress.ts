'use client';

import { useRouterState } from '@tanstack/react-router';

export function useNavigationProgress() {
  const isNavigating = useRouterState({ select: (s) => s.status === 'pending' });

  return { isNavigating };
}
