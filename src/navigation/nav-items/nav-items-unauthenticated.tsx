import type { NavigationItem } from '@/navigation/types/navigation.types';
import { useRouter } from 'next/navigation';

export const createNavItemsUnauthenticated = (): NavigationItem[] => {
  const router = useRouter();

  return [
    {
      id: 'home',
      icon: 'Home',
      label: 'Home',
      href: '/',
      onClick: () => router.push('/'),
    },
    {
      id: 'auth',
      icon: 'User',
      label: 'Login',
      href: '/auth',
      onClick: () => router.push('/auth'),
    },
  ];
};

// Backward compatibility - static version for contexts where hooks can't be used
export const navItemsUnauthenticated: NavigationItem[] = [
  { id: 'home', icon: 'Home', label: 'Home', href: '/' },
  { id: 'auth', icon: 'User', label: 'Login', href: '/auth' },
];
