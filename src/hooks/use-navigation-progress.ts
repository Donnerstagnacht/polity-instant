'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useNavigationProgress() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Start loading immediately when pathname or search params change
    setIsNavigating(true);

    // Longer timeout to account for Next.js compilation and hydration
    // This reflects real compilation time that users experience
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 1000); // Increased to 1 second for compilation time

    return () => {
      clearTimeout(timer);
      setIsNavigating(false);
    };
  }, [pathname, searchParams]);

  return { isNavigating };
}
