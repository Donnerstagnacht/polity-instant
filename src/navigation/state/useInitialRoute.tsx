import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Custom hook to set initial route based on window location
export function useInitialRoute(
  setCurrentPrimaryRoute: React.Dispatch<React.SetStateAction<string | null>>
) {
  const pathname = usePathname();

  useEffect(() => {
    const route = pathname === '/' ? 'home' : pathname.split('/')[1];
    setCurrentPrimaryRoute(route);
  }, [pathname, setCurrentPrimaryRoute]);
}
