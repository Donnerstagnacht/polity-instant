import type { NavigationItem } from '@/navigation/types/navigation.types';

// Next.js router type interface
interface NextRouter {
  push: (url: string) => void;
}

// This function factory creates unauthenticated navigation items with router integration
export const createNavItemsUnauthenticated = (
  router: NextRouter,
  t?: (key: string) => string // Optional translation function
): NavigationItem[] => {
  return [
    {
      id: 'home',
      icon: 'Home',
      label: t ? t('navigation.primary.home') : 'Home',
      href: '/',
      onClick: () => router.push('/'),
    },
    {
      id: 'features',
      icon: 'Sparkles',
      label: t ? t('navigation.primary.features') : 'Features',
      href: '/features',
      onClick: () => router.push('/features'),
    },
    {
      id: 'solutions',
      icon: 'Target',
      label: t ? t('navigation.primary.solutions') : 'Solutions',
      href: '/solutions',
      onClick: () => router.push('/solutions'),
    },
    {
      id: 'pricing',
      icon: 'CreditCard',
      label: t ? t('navigation.primary.pricing') : 'Pricing',
      href: '/pricing',
      onClick: () => router.push('/pricing'),
    },
    {
      id: 'support',
      icon: 'Heart',
      label: t ? t('navigation.primary.support') : 'Support',
      href: '/support',
      onClick: () => router.push('/support'),
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
  { id: 'support', icon: 'Heart', label: 'Support', href: '/support' },
  { id: 'auth', icon: 'User', label: 'Login', href: '/auth' },
];
