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
      id: 'features',
      icon: 'Sparkles',
      label: 'Features',
      href: '/features',
      onClick: () => router.push('/features'),
    },
    {
      id: 'solutions',
      icon: 'Target',
      label: 'Solutions',
      href: '/solutions',
      onClick: () => router.push('/solutions'),
    },
    {
      id: 'pricing',
      icon: 'CreditCard',
      label: 'Pricing',
      href: '/pricing',
      onClick: () => router.push('/pricing'),
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
  { id: 'features', icon: 'Sparkles', label: 'Features', href: '/features' },
  { id: 'solutions', icon: 'Target', label: 'Solutions', href: '/solutions' },
  { id: 'pricing', icon: 'CreditCard', label: 'Pricing', href: '/pricing' },
  { id: 'auth', icon: 'User', label: 'Login', href: '/auth' },
];
